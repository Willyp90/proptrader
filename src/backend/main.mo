import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import CommonTypes "./types/common";
import Types "./types/trading";
import TraderApi "./mixins/trader-api";
import AdminApi "./mixins/admin-api";
import PositionApi "./mixins/position-api";
import LeaderboardApi "./mixins/leaderboard-api";
import FundedApi "./mixins/funded-api";
import CohortApi "./mixins/cohort-api";
import TimerLib "./lib/timers";
import PriceLib "./lib/price";
import PhaseLib "./lib/phase";
import TradingLib "./lib/trading";


actor {
  // Authorization state — first authenticated user becomes admin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── Admin principal — explicit on-chain admin guard ─────────────────────
  // Initialized to the anonymous principal at first; updated on canister init.
  // The deployer principal is captured in system func init() below.
  let adminPrincipal = { var value : Principal = Principal.anonymous() };

  // ─── Core data stores ─────────────────────────────────────────────────────
  let profiles    = Map.empty<Principal, Types.TraderProfile>();
  let challenges  = Map.empty<Nat, Types.Challenge>();
  let trades      = Map.empty<Nat, Types.Trade>();
  let auditLog    = List.empty<Types.AuditEntry>();

  // Per-principal daily P&L tracker for daily drawdown enforcement
  let dailyPnlTracker = Map.empty<Principal, { dailyPnl : Float; dayStart : Int }>();

  // ─── Extended data stores ─────────────────────────────────────────────────
  let positions               = Map.empty<Nat, Types.Position>();
  let payoutRecords           = Map.empty<Nat, Types.PayoutRecord>();
  let cohorts                 = Map.empty<Nat, Types.CohortParams>();
  let priceCaches             = Map.empty<Text, Types.PriceCache>();
  let consistencyScoreHistory = Map.empty<Principal, List.List<Types.ConsistencyScore>>();
  let allocationChanges       = Map.empty<Principal, List.List<Types.AllocationChange>>();
  let targetOutcomes          = Map.empty<Nat, Types.TargetOutcome>();

  // ─── Investor pool stable state ───────────────────────────────────────────
  // investorPoolBalance: total ICP/ckBTC in the shared investor pool.
  //   Grows by 20% of every funded trader's closed profit.
  //   Decreases when investors withdraw their proportional share.
  let investorPoolBalance  = { var value : Float = 0.0 };

  // investorShares: each investor's number of pool shares.
  //   Shares are issued proportionally on deposit.
  //   1 share = 1 unit; share value = investorPoolBalance / totalInvestorShares.
  let investorShares      = Map.empty<Principal, Nat>();
  let totalInvestorShares = { var value : Nat = 0 };

  // platformFeeBalance: accumulated 10% platform fee from funded trade profits.
  //   Admin-withdrawable only via withdrawPlatformFees().
  let platformFeeBalance  = { var value : Float = 0.0 };

  // ─── Pending withdrawal recovery ──────────────────────────────────────────
  // Stores swap records where the swap succeeded but the withdraw call failed.
  // The position monitor timer retries these up to 10 times.
  let pendingWithdrawals = Map.empty<Text, Types.PendingWithdrawal>();

  // ─── Auto-incrementing IDs ────────────────────────────────────────────────
  let nextChallengeId = { var value : Nat = 0 };
  let nextTradeId     = { var value : Nat = 0 };
  let nextCohortId    = { var value : Nat = 0 };

  // ─── Default admin params ─────────────────────────────────────────────────
  // Profit split is fixed: 10% platform / 20% investor pool / 70% trader.
  let adminParams = {
    var value : Types.AdminParams = {
      targetProfitPct       = 10.0;
      riskLevel             = #medium;
      perTradeLimitPct      = 2.0;
      dailyDrawdownLimitPct = 4.0;
      totalDrawdownLimitPct = 10.0;
      baseFee               = 1.0;
      performanceFee        = 15.0;
      tradingPaused         = false;
      updatedAt             = 0;
      defaultPhase1         = {
        profitTarget        = 8.0;
        maxDailyDrawdown    = 4.0;
        maxTotalDrawdown    = 8.0;
        minTradingDays      = 5;
        timeLimitDays       = 30;
        minConsistencyScore = 60.0;
      };
      defaultPhase2         = {
        profitTarget        = 5.0;
        maxDailyDrawdown    = 4.0;
        maxTotalDrawdown    = 8.0;
        minTradingDays      = 5;
        timeLimitDays       = 60;
        minConsistencyScore = 65.0;
      };
      pricePollingIntervalSecs   = 10;
      slCheckIntervalSecs        = 15;
      challengeCheckIntervalSecs = 60;
      maxAllocationCap           = 100_000.0;
      baseAllocationAmount       = 25_000.0;
      // Fixed profit split — must never change
      investorPoolSharePct       = 20.0;
      platformFeePct             = 10.0;
      traderBaseSharePct         = 70.0;
      maxTraderSharePct          = 70.0;
    }
  };

  // ─── HTTP outcall transform (required by HTTP outcall infrastructure) ─────
  // Strips non-deterministic response fields for consensus.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ─── Timer state ──────────────────────────────────────────────────────────
  let timerState = TimerLib.emptyTimerState();

  // ─── Timer callbacks ──────────────────────────────────────────────────────

  // Price refresh: update all known DEX price caches
  func onPriceTick() : async () {
    await* PriceLib.refreshAllPrices(priceCaches, adminParams.value, transform);
  };

  // SL/TP check + pending withdrawal retry: scan all open positions and auto-close
  // if stop-loss / take-profit hit; also retry any pending withdrawals.
  func onSlTick() : async () {
    // Retry any pending withdrawals (swap succeeded but withdraw failed)
    ignore retryPendingWithdrawals();
    let now = Time.now();
    for ((tradeId, pos) in positions.entries()) {
      if (pos.status == #open) {
        let maybePrice = PriceLib.getCachedPrice(pos.dex, pos.pair, priceCaches);
        switch (maybePrice) {
          case null {};
          case (?cache) {
            let currentPrice = cache.last;
            let shouldStopLoss = switch (pos.stopLoss) {
              case (?sl) switch (pos.direction) {
                case (#buy) currentPrice <= sl;
                case (#sell) currentPrice >= sl;
              };
              case null false;
            };
            let shouldTakeProfit = switch (pos.takeProfit) {
              case (?tp) switch (pos.direction) {
                case (#buy) currentPrice >= tp;
                case (#sell) currentPrice <= tp;
              };
              case null false;
            };
            if (shouldStopLoss or shouldTakeProfit) {
              let realizedPnl = TradingLib.calcPnl(pos.direction, pos.size, pos.entryPrice, currentPrice);
              let closedPos : Types.Position = {
                pos with
                currentPrice;
                realizedPnl = pos.realizedPnl + realizedPnl;
                exitTime = ?now;
                status = #closed;
              };
              positions.add(tradeId, closedPos);
              let reason = if (shouldStopLoss) "SL_TRIGGERED" else "TP_TRIGGERED";
              auditLog.add(TradingLib.buildAuditEntry(
                reason, pos.traderId,
                "tradeId=" # debug_show(tradeId) # " pnl=" # debug_show(realizedPnl),
                now,
              ));
            };
          };
        };
      };
    };
  };

  // Challenge check: evaluate phase transitions for all active challenges
  func onChallengeTick() : async () {
    let now = Time.now();
    for ((cid, challenge) in challenges.entries()) {
      if (challenge.status == #active) {
        let failReason = switch (challenge.phase) {
          case (#phase1) PhaseLib.checkPhase1Fail(challenge, adminParams.value);
          case (#phase2) PhaseLib.checkPhase2Fail(challenge, adminParams.value);
          case _ null;
        };
        switch (failReason) {
          case (?reason) {
            let failed = { challenge with status = #failed };
            challenges.add(cid, failed);
            auditLog.add(TradingLib.buildAuditEntry(
              "CHALLENGE_TIMER_FAIL", challenge.traderPrincipal,
              "cid=" # debug_show(cid) # " reason=" # reason,
              now,
            ));
          };
          case null {};
        };
      };
    };
  };

  // Day-end: reset daily P&L tracker for all traders
  func onDayEndTick() : async () {
    let now = Time.now();
    let nsPerDay : Int = 86_400_000_000_000;
    let todayStart : Int = (now / nsPerDay) * nsPerDay;
    for ((p, rec) in dailyPnlTracker.entries()) {
      if (rec.dayStart < todayStart) {
        dailyPnlTracker.add(p, { dailyPnl = 0.0; dayStart = todayStart });
      };
    };
  };

  // ─── Start timers ─────────────────────────────────────────────────────────
  // Extracted as a function so it can be called from both init and postupgrade.
  func startAllTimers<system>() {
    TimerLib.startTimers<system>(
      timerState,
      adminParams.value.pricePollingIntervalSecs,
      adminParams.value.slCheckIntervalSecs,
      adminParams.value.challengeCheckIntervalSecs,
      onPriceTick,
      onSlTick,
      onChallengeTick,
      onDayEndTick,
    );
  };

  // ─── Start timers at actor initialization ─────────────────────────────────
  // This block runs on canister deployment. Timers are also re-registered here
  // because with enhanced orthogonal persistence the actor body expressions
  // are idempotent and the TimerLib.startTimers call cancels existing timers
  // before registering new ones, preventing duplicates.
  startAllTimers<system>();

  // ─── Trader-facing API ────────────────────────────────────────────────────
  include TraderApi(
    accessControlState,
    profiles,
    challenges,
    trades,
    adminParams,
    nextChallengeId,
    nextTradeId,
    auditLog,
    dailyPnlTracker,
    consistencyScoreHistory,
    transform,
  );

  // ─── Admin-facing API ─────────────────────────────────────────────────────
  include AdminApi(
    accessControlState,
    adminPrincipal,
    profiles,
    challenges,
    adminParams,
    auditLog,
    payoutRecords,
    investorPoolBalance,
    investorShares,
    totalInvestorShares,
    platformFeeBalance,
  );

  // ─── Position management API ──────────────────────────────────────────────
  include PositionApi(
    profiles,
    challenges,
    trades,
    positions,
    payoutRecords,
    priceCaches,
    auditLog,
    adminParams,
    nextTradeId,
    dailyPnlTracker,
    investorPoolBalance,
    platformFeeBalance,
    pendingWithdrawals,
    transform,
  );

  // ─── Leaderboard and public stats API ────────────────────────────────────
  include LeaderboardApi(
    accessControlState,
    profiles,
    challenges,
    trades,
    payoutRecords,
    consistencyScoreHistory,
    adminParams,
  );

  // ─── Funded account and allocation API ───────────────────────────────────
  include FundedApi(
    accessControlState,
    profiles,
    challenges,
    trades,
    allocationChanges,
    consistencyScoreHistory,
    auditLog,
    adminParams,
  );

  // ─── Cohort management API ────────────────────────────────────────────────
  include CohortApi(
    accessControlState,
    cohorts,
    challenges,
    targetOutcomes,
    auditLog,
    nextCohortId,
  );

  // ─── Investor pool API ────────────────────────────────────────────────────

  // Deposit ICP/ckBTC into the investor pool and receive proportional shares.
  // In production this would call the ICP ledger to transfer tokens first.
  public shared ({ caller }) func depositToPool(amount : Float) : async CommonTypes.Result<{ shares : Nat; poolBalance : Float }, Text> {
    if (caller.isAnonymous()) return #err("Unauthorized");
    if (amount <= 0.0) return #err("Amount must be > 0");

    // Issue shares proportional to deposit.
    // Share price = poolBalance / totalShares (or 1.0 if pool is empty).
    let sharePrice : Float = if (totalInvestorShares.value == 0 or investorPoolBalance.value <= 0.0)
      1.0
    else
      investorPoolBalance.value / totalInvestorShares.value.toFloat();

    let newShares : Nat = if (sharePrice <= 0.0) 0
      else (amount / sharePrice).toInt().toNat();

    if (newShares == 0) return #err("Deposit too small to issue shares");

    // Update investor's share balance
    let prevShares = switch (investorShares.get(caller)) {
      case (?s) s;
      case null 0;
    };
    investorShares.add(caller, prevShares + newShares);
    totalInvestorShares.value += newShares;
    investorPoolBalance.value += amount;

    auditLog.add(TradingLib.buildAuditEntry(
      "INVESTOR_DEPOSIT", caller,
      "amount=" # debug_show(amount) # " shares=" # debug_show(newShares),
      Time.now(),
    ));

    #ok({ shares = prevShares + newShares; poolBalance = investorPoolBalance.value });
  };

  // Withdraw from the investor pool proportional to the caller's shares.
  // Amount requested is in pool value units (ICP/ckBTC equivalent).
  public shared ({ caller }) func withdrawFromPool(amount : Float) : async CommonTypes.Result<{ withdrawn : Float; remainingShares : Nat }, Text> {
    if (caller.isAnonymous()) return #err("Unauthorized");
    if (amount <= 0.0) return #err("Amount must be > 0");

    let myShares = switch (investorShares.get(caller)) {
      case (?s) s;
      case null return #err("No pool investment found");
    };
    if (myShares == 0) return #err("No shares to withdraw");

    // Share value at time of withdrawal
    let sharePrice : Float = if (totalInvestorShares.value == 0 or investorPoolBalance.value <= 0.0)
      0.0
    else
      investorPoolBalance.value / totalInvestorShares.value.toFloat();

    let myValue = sharePrice * myShares.toFloat();
    if (amount > myValue) {
      return #err("Requested amount " # debug_show(amount) # " exceeds your pool value " # debug_show(myValue));
    };
    if (amount > investorPoolBalance.value) {
      return #err("Insufficient pool liquidity");
    };

    // Burn proportional shares
    let sharesToBurn : Nat = if (sharePrice <= 0.0) 0
      else (amount / sharePrice).toInt().toNat();
    let sharesToBurnSafe = if (sharesToBurn > myShares) myShares else sharesToBurn;

    let remainingShares : Nat = if (sharesToBurnSafe >= myShares) 0 else myShares - sharesToBurnSafe;
    investorShares.add(caller, remainingShares);
    totalInvestorShares.value := if (sharesToBurnSafe > totalInvestorShares.value) 0
      else totalInvestorShares.value - sharesToBurnSafe;
    investorPoolBalance.value -= amount;

    auditLog.add(TradingLib.buildAuditEntry(
      "INVESTOR_WITHDRAWAL", caller,
      "amount=" # debug_show(amount) # " sharesBurned=" # debug_show(sharesToBurnSafe),
      Time.now(),
    ));

    #ok({ withdrawn = amount; remainingShares });
  };

  // Query an investor's current pool balance (their proportional share value).
  public query ({ caller }) func getMyInvestorBalance() : async CommonTypes.Result<{
    shares : Nat;
    sharePrice : Float;
    poolValue : Float;
    poolBalance : Float;
    totalShares : Nat;
  }, Text> {
    let myShares = switch (investorShares.get(caller)) {
      case (?s) s;
      case null 0;
    };

    let sharePrice : Float = if (totalInvestorShares.value == 0 or investorPoolBalance.value <= 0.0)
      1.0
    else
      investorPoolBalance.value / totalInvestorShares.value.toFloat();

    let poolValue = sharePrice * myShares.toFloat();

    #ok({
      shares = myShares;
      sharePrice;
      poolValue;
      poolBalance = investorPoolBalance.value;
      totalShares = totalInvestorShares.value;
    });
  };
};
