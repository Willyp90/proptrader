import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import CommonTypes "../types/common";
import Types "../types/trading";
import TradingLib "../lib/trading";
import PriceLib "../lib/price";
import SwapLib "../lib/swap";
import ConsistencyLib "../lib/consistency";
import PhaseLib "../lib/phase";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Principal, Types.TraderProfile>,
  challenges : Map.Map<Nat, Types.Challenge>,
  trades : Map.Map<Nat, Types.Trade>,
  adminParams : { var value : Types.AdminParams },
  nextChallengeId : { var value : Nat },
  nextTradeId : { var value : Nat },
  auditLog : List.List<Types.AuditEntry>,
  dailyPnlTracker : Map.Map<Principal, { dailyPnl : Float; dayStart : Int }>,
  consistencyScoreHistory : Map.Map<Principal, List.List<Types.ConsistencyScore>>,
  transform : OutCall.Transform,
) {

  // ─── Profile Management ──────────────────────────────────────────────────

  // Register a new trader profile for the caller.
  public shared ({ caller }) func registerTrader() : async CommonTypes.Result<Types.TraderProfile, Text> {
    if (caller.isAnonymous()) {
      return #err("Anonymous callers cannot register");
    };
    switch (profiles.get(caller)) {
      case (?existing) { #ok(existing) };
      case null {
        let profile : Types.TraderProfile = {
          principal         = caller;
          role              = #trader;
          mode              = #evaluation;
          activeChallengeId = null;
          fundedAccount     = null;
          totalPayouts      = 0.0;
          tenureMonths      = 0;
          username          = "";
        };
        profiles.add(caller, profile);
        auditLog.add(TradingLib.buildAuditEntry("registerTrader", caller, "new profile", Time.now()));
        #ok(profile);
      };
    };
  };

  // Return the caller's trader profile.
  public query ({ caller }) func getMyProfile() : async CommonTypes.Result<Types.TraderProfile, Text> {
    switch (profiles.get(caller)) {
      case (?p) { #ok(p) };
      case null { #err("Profile not found — call registerTrader first") };
    };
  };

  // ─── Challenge Entry ─────────────────────────────────────────────────────

  // Enter a new challenge with given starting balance and parameters.
  public shared ({ caller }) func enterChallenge(
    startingBalance : Float,
    targetProfitPct : Float,
    riskLevel : CommonTypes.RiskLevel,
  ) : async CommonTypes.Result<Types.Challenge, Text> {
    if (caller.isAnonymous()) {
      return #err("Unauthorized");
    };
    if (startingBalance <= 0.0) {
      return #err("startingBalance must be > 0");
    };
    if (targetProfitPct <= 0.0) {
      return #err("targetProfitPct must be > 0");
    };

    // Ensure trader has a profile
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case null {
        return #err("Profile not found — call registerTrader first");
      };
    };

    // Cannot enter a new challenge while one is active
    switch (profile.activeChallengeId) {
      case (?_) { return #err("Already has an active challenge") };
      case null {};
    };

    // Derive risk parameters from the given risk level + target profit
    let params = TradingLib.deriveAdminParams(
      targetProfitPct,
      riskLevel,
      false,
      Time.now(),
    );

    let id = nextChallengeId.value;
    nextChallengeId.value += 1;

    let challenge : Types.Challenge = {
      id;
      traderPrincipal       = caller;
      startingBalance;
      currentBalance        = startingBalance;
      targetProfitPct;
      riskLevel;
      perTradeLimitPct      = params.perTradeLimitPct;
      dailyDrawdownLimitPct = params.dailyDrawdownLimitPct;
      totalDrawdownLimitPct = params.totalDrawdownLimitPct;
      status                = #active;
      startTime             = Time.now();
      trades                = [];
      phase                 = #phase1;
      cohortId              = null;
      phase1StartTime       = ?Time.now();
      phase1EndTime         = null;
      phase2StartTime       = null;
      phase2EndTime         = null;
      consistencyScore      = 100.0;
      fundedAllocation      = null;
    };

    challenges.add(id, challenge);

    // Update profile to record active challenge
    let updated : Types.TraderProfile = { profile with activeChallengeId = ?id };
    profiles.add(caller, updated);

    auditLog.add(TradingLib.buildAuditEntry(
      "enterChallenge",
      caller,
      "id=" # debug_show(id),
      Time.now(),
    ));

    #ok(challenge);
  };

  // Return the caller's active challenge.
  public query ({ caller }) func getMyChallenge() : async CommonTypes.Result<Types.Challenge, Text> {
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case null { return #err("Profile not found") };
    };
    switch (profile.activeChallengeId) {
      case null { #err("No active challenge") };
      case (?cid) {
        switch (challenges.get(cid)) {
          case (?c) { #ok(c) };
          case null { #err("Challenge record missing") };
        };
      };
    };
  };

  // ─── Live Price Feed ─────────────────────────────────────────────────────

  // Fetch a live price from ICPSwap first; fall back to Sonic on zero price.
  public func getLivePrice(pair : Text) : async CommonTypes.Result<Types.PriceData, Text> {
    let now = Time.now();
    let data = await PriceLib.fetchIcpSwapPrice(pair, transform, now);
    if (data.price > 0.0) {
      return #ok(data);
    };
    let fallback = await PriceLib.fetchSonicPrice(pair, transform, now);
    if (fallback.price > 0.0) {
      #ok(fallback)
    } else {
      #err("Unable to fetch live price for " # pair)
    };
  };

  // ─── Trade Execution ─────────────────────────────────────────────────────

  // Execute a trade against an active challenge.
  public shared ({ caller }) func executeTrade(
    challengeId : Nat,
    pair : Text,
    side : CommonTypes.TradeSide,
    quantity : Float,
  ) : async CommonTypes.Result<Types.Trade, Text> {
    if (caller.isAnonymous()) {
      return #err("Unauthorized");
    };

    // Platform pause guard
    if (adminParams.value.tradingPaused) {
      return #err("Trading is currently paused");
    };

    // Load profile
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case null { return #err("Profile not found — call registerTrader first") };
    };

    // Verify caller owns this challenge
    switch (profile.activeChallengeId) {
      case null { return #err("No active challenge") };
      case (?cid) {
        if (cid != challengeId) {
          return #err("Challenge ID does not match active challenge");
        };
      };
    };

    let challenge = switch (challenges.get(challengeId)) {
      case (?c) { c };
      case null { return #err("Challenge not found") };
    };

    // Only allow trading on active challenges
    switch (challenge.status) {
      case (#active) {};
      case _ { return #err("Challenge is not active") };
    };

    // Fetch live price
    let priceData = switch (await getLivePrice(pair)) {
      case (#ok(d)) { d };
      case (#err(e)) { return #err("Price feed error: " # e) };
    };

    let now = Time.now();

    // Per-trade risk check
    if (not TradingLib.validateTradeRisk(challenge, quantity, priceData.price, adminParams.value)) {
      return #err("Trade rejected: risk limit exceeded");
    };

    // Daily drawdown check
    let secsPerDay : Int = 86_400_000_000_000; // nanoseconds
    let todayStart : Int = (now / secsPerDay) * secsPerDay;
    let (dayStart, dailyPnl) = switch (dailyPnlTracker.get(caller)) {
      case null { (todayStart, 0.0) };
      case (?rec) {
        if (rec.dayStart < todayStart) {
          // new day — reset
          (todayStart, 0.0)
        } else {
          (rec.dayStart, rec.dailyPnl)
        };
      };
    };
    let dailyDrawdownFloor = 0.0 - (challenge.currentBalance * (challenge.dailyDrawdownLimitPct / 100.0));
    if (dailyPnl <= dailyDrawdownFloor) {
      return #err("Trade rejected: daily drawdown limit reached");
    };

    // Build trade record based on trader mode
    let tradeId = nextTradeId.value;
    nextTradeId.value += 1;

    let trade : Types.Trade = switch (profile.mode) {
      case (#evaluation) {
        // Simulated fill — use live price, no real swap
        TradingLib.buildSimulatedTrade(
          tradeId,
          caller,
          pair,
          side,
          quantity,
          priceData.price,
          now,
          true,
        )
      };
      case (#funded) {
        // Real swap — delegate to swap domain (ICPSwap → Sonic fallback)
        // Default slippage: 50 bps (0.5%); capped to 100 bps on-chain
        let swapResult = await SwapLib.executeRealSwap(pair, side, quantity, priceData.price, 50, caller);
        switch swapResult {
          case (#ok(sr)) {
            TradingLib.buildRealTrade(
              tradeId,
              caller,
              pair,
              side,
              quantity,
              sr.fillPrice,
              sr.txHash,
              now,
              true,
            )
          };
          case (#err(e)) { return #err("Swap failed: " # e) };
        };
      };
    };

    // Store trade
    trades.add(tradeId, trade);

    // Update daily P&L tracker
    let newDailyPnl = dailyPnl + trade.pnl;
    dailyPnlTracker.add(caller, { dailyPnl = newDailyPnl; dayStart });

    // Update challenge balance and check pass/fail
    let updatedChallenge = TradingLib.updateChallengeAfterTrade(challenge, trade);

    // Phase check after each trade — auto-transition phase1 → phase2 → funded
    let challengeTrades = List.empty<Types.Trade>();
    for (tid in updatedChallenge.trades.values()) {
      switch (trades.get(tid)) {
        case (?t) challengeTrades.add(t);
        case null {};
      };
    };
    let scoreRec = ConsistencyLib.computeConsistencyScore(
      caller,
      challengeTrades.toArray(),
      updatedChallenge,
      adminParams.value,
    );

    // Snapshot consistency score
    let hist = switch (consistencyScoreHistory.get(caller)) {
      case (?h) h;
      case null {
        let h = List.empty<Types.ConsistencyScore>();
        consistencyScoreHistory.add(caller, h);
        h
      };
    };
    hist.add(scoreRec);

    // Write score back to challenge
    let challengeWithScore = { updatedChallenge with consistencyScore = scoreRec.score };

    // Phase transition logic
    let finalChallenge = switch (challengeWithScore.phase) {
      case (#phase1) {
        switch (PhaseLib.checkPhase1Fail(challengeWithScore, adminParams.value)) {
          case (?_reason) {
            let failed = { challengeWithScore with status = #failed };
            challenges.add(challengeId, failed);
            failed
          };
          case null {
            if (PhaseLib.checkPhase1Pass(challengeWithScore, scoreRec, adminParams.value)) {
              let transitioned = PhaseLib.transitionPhase(challengeWithScore, #phase2, "Phase 1 passed", now);
              challenges.add(challengeId, transitioned);
              transitioned
            } else {
              challenges.add(challengeId, challengeWithScore);
              challengeWithScore
            }
          };
        }
      };
      case (#phase2) {
        switch (PhaseLib.checkPhase2Fail(challengeWithScore, adminParams.value)) {
          case (?_reason) {
            let failed = { challengeWithScore with status = #failed };
            challenges.add(challengeId, failed);
            failed
          };
          case null {
            if (PhaseLib.checkPhase2Pass(challengeWithScore, scoreRec, adminParams.value)) {
              let funded = PhaseLib.transitionPhase(challengeWithScore, #funded, "Phase 2 passed", now);
              // Assign funded account to profile
              let alloc = PhaseLib.calcFundedAllocation(scoreRec.score, adminParams.value.baseAllocationAmount);
              let fundedAccount : Types.FundedAccount = {
                traderId = caller;
                allocationBase = adminParams.value.baseAllocationAmount;
                allocationCurrent = alloc;
                performanceMultiplier = alloc / adminParams.value.baseAllocationAmount;
                monthsActive = 0;
                lastReviewDate = now;
                nextReviewDate = now + 30 * 86_400 * 1_000_000_000;
                accountBalance = alloc;
                unrealizedPnl = 0.0;
              };
              let profileWithFunded : Types.TraderProfile = {
                profile with
                mode = #funded;
                fundedAccount = ?fundedAccount;
              };
              profiles.add(caller, profileWithFunded);
              challenges.add(challengeId, funded);
              funded
            } else {
              challenges.add(challengeId, challengeWithScore);
              challengeWithScore
            }
          };
        }
      };
      case _ {
        challenges.add(challengeId, challengeWithScore);
        challengeWithScore
      };
    };

    // If challenge resolved, clear active challenge from profile
    switch (finalChallenge.status) {
      case (#passed or #failed) {
        let latestProfile = switch (profiles.get(caller)) {
          case (?p) p;
          case null profile;
        };
        let updatedProfile : Types.TraderProfile = { latestProfile with activeChallengeId = null };
        profiles.add(caller, updatedProfile);
      };
      case _ {};
    };

    auditLog.add(TradingLib.buildAuditEntry(
      "executeTrade",
      caller,
      "tradeId=" # debug_show(tradeId) # " pair=" # pair # " pnl=" # debug_show(trade.pnl),
      now,
    ));

    #ok(trade);
  };

  // ─── Trade History ────────────────────────────────────────────────────────

  // Return the most recent `limit` trades for the caller.
  public query ({ caller }) func getMyTrades(limit : Nat) : async [Types.Trade] {
    TradingLib.getRecentTrades(trades, caller, limit);
  };

  // ─── Admin Params (read-only for all users) ───────────────────────────────

  // Return current admin parameters.
  public query func getAdminParams() : async Types.AdminParams {
    adminParams.value;
  };

  // ─── Consistency Score Summary ────────────────────────────────────────────

  public query ({ caller }) func getMyConsistencyScoreSummary() : async CommonTypes.Result<Types.ConsistencyScore, Text> {
    let profile = switch (profiles.get(caller)) {
      case (?p) p;
      case null return #err("Profile not found");
    };

    let challengeId = switch (profile.activeChallengeId) {
      case (?cid) cid;
      case null return #err("No active challenge");
    };

    let challenge = switch (challenges.get(challengeId)) {
      case (?c) c;
      case null return #err("Challenge not found");
    };

    let challengeTrades = List.empty<Types.Trade>();
    for (tid in challenge.trades.values()) {
      switch (trades.get(tid)) {
        case (?t) challengeTrades.add(t);
        case null {};
      };
    };

    let score = ConsistencyLib.computeConsistencyScore(
      caller, challengeTrades.toArray(), challenge, adminParams.value,
    );
    #ok(score);
  };

  // ─── Phase Status ─────────────────────────────────────────────────────────

  public query ({ caller }) func getMyPhaseStatus() : async CommonTypes.Result<{
    phase : CommonTypes.ChallengePhase;
    timeRemainingDays : Int;
    profitProgress : Float;
    consistencyProgress : Float;
  }, Text> {
    let profile = switch (profiles.get(caller)) {
      case (?p) p;
      case null return #err("Profile not found");
    };

    let challengeId = switch (profile.activeChallengeId) {
      case (?cid) cid;
      case null return #err("No active challenge");
    };

    let challenge = switch (challenges.get(challengeId)) {
      case (?c) c;
      case null return #err("Challenge not found");
    };

    let now = Time.now();
    let nsPerDay : Int = 86_400 * 1_000_000_000;

    let (phaseParams, phaseStartTime) : (Types.PhaseParams, ?Int) = switch (challenge.phase) {
      case (#phase1) (adminParams.value.defaultPhase1, challenge.phase1StartTime);
      case (#phase2) (adminParams.value.defaultPhase2, challenge.phase2StartTime);
      case _ (adminParams.value.defaultPhase1, null);
    };

    let timeRemainingDays : Int = switch (phaseStartTime) {
      case (?st) {
        let limitNs = phaseParams.timeLimitDays * 86_400 * 1_000_000_000;
        let endTime = st + limitNs.toInt();
        let remaining = endTime - now;
        if (remaining < 0) 0 else remaining / nsPerDay
      };
      case null phaseParams.timeLimitDays.toInt();
    };

    let targetBalance = challenge.startingBalance * (1.0 + phaseParams.profitTarget / 100.0);
    let profitProgress = if (targetBalance > challenge.startingBalance) {
      let gained = challenge.currentBalance - challenge.startingBalance;
      let needed = targetBalance - challenge.startingBalance;
      let pct = gained / needed * 100.0;
      if (pct < 0.0) 0.0 else if (pct > 100.0) 100.0 else pct
    } else 0.0;

    let consistencyProgress = if (challenge.consistencyScore >= phaseParams.minConsistencyScore) 100.0
      else challenge.consistencyScore / phaseParams.minConsistencyScore * 100.0;

    #ok({
      phase = challenge.phase;
      timeRemainingDays;
      profitProgress;
      consistencyProgress;
    });
  };
};
