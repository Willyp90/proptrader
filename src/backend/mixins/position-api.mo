import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import CommonTypes "../types/common";
import Types "../types/trading";
import TradingLib "../lib/trading";
import PriceLib "../lib/price";
import SwapLib "../lib/swap";
import PhaseLib "../lib/phase";
import ConsistencyLib "../lib/consistency";

mixin (
  profiles : Map.Map<Principal, Types.TraderProfile>,
  challenges : Map.Map<Nat, Types.Challenge>,
  trades : Map.Map<Nat, Types.Trade>,
  positions : Map.Map<Nat, Types.Position>,
  payoutRecords : Map.Map<Nat, Types.PayoutRecord>,
  priceCaches : Map.Map<Text, Types.PriceCache>,
  auditLog : List.List<Types.AuditEntry>,
  adminParams : { var value : Types.AdminParams },
  nextTradeId : { var value : Nat },
  dailyPnlTracker : Map.Map<Principal, { dailyPnl : Float; dayStart : Int }>,
  // Investor pool stable state — updated on every funded trade close
  investorPoolBalance : { var value : Float },
  platformFeeBalance : { var value : Float },
  // Pending withdrawals for swap failure recovery
  pendingWithdrawals : Map.Map<Text, Types.PendingWithdrawal>,
  transform : OutCall.Transform,
) {

  // ─── Internal: Get current price ───────────────────────────────────────────

  private func fetchLivePrice(pair : Text, now : Int) : async ?Float {
    switch (PriceLib.getCachedPrice(#icpSwap, pair, priceCaches)) {
      case (?cached) {
        if (not cached.stale) return ?cached.last;
      };
      case null {};
    };
    // Cache miss or stale — fetch live
    let icpData = await PriceLib.fetchIcpSwapPrice(pair, transform, now);
    if (icpData.price > 0.0) return ?icpData.price;
    let sonicData = await PriceLib.fetchSonicPrice(pair, transform, now);
    if (sonicData.price > 0.0) return ?sonicData.price;
    null;
  };

  // ─── Internal: Force-close all open positions for a trader ─────────────────
  //
  // Called synchronously when a drawdown breach is detected.
  // Each open position is closed at the current cached price, realizedPnl updated,
  // and the closure logged in the audit trail.
  private func forceCloseAllPositions(traderId : Principal, reason : Text) : async* () {
    let now = Time.now();
    for ((tradeId, pos) in positions.entries()) {
      if (Principal.equal(pos.traderId, traderId) and pos.status == #open) {
        let exitPrice : Float = switch (PriceLib.getCachedPrice(pos.dex, pos.pair, priceCaches)) {
          case (?cached) cached.last;
          case null pos.entryPrice; // fallback to entry price if no cache (no loss on close)
        };
        let realizedPnl = TradingLib.calcPnl(pos.direction, pos.size, pos.entryPrice, exitPrice);
        let closedPos : Types.Position = {
          pos with
          currentPrice = exitPrice;
          realizedPnl = pos.realizedPnl + realizedPnl;
          exitTime = ?now;
          status = #liquidated;
          size = 0.0;
        };
        positions.add(tradeId, closedPos);
        auditLog.add(TradingLib.buildAuditEntry(
          "FORCE_CLOSE_" # reason,
          traderId,
          "tradeId=" # debug_show(tradeId) # " pair=" # pos.pair # " pnl=" # debug_show(realizedPnl),
          now,
        ));
      };
    };
  };

  // ─── Open Position ─────────────────────────────────────────────────────────

  public shared ({ caller }) func openPosition(
    pair : Text,
    direction : CommonTypes.TradeSide,
    size : Float,
    slippageBps : Nat,  // slippage in basis points (100 = 1%); backend caps at 100 bps
    stopLoss : ?Float,
    takeProfit : ?Float,
  ) : async CommonTypes.Result<Types.Position, Text> {
    if (caller.isAnonymous()) return #err("Unauthorized");
    if (adminParams.value.tradingPaused) return #err("Trading is currently paused");
    if (size <= 0.0) return #err("Size must be > 0");
    if (not PriceLib.isSupportedPair(pair)) return #err("Unsupported pair: " # pair);

    let profile = switch (profiles.get(caller)) {
      case (?p) p;
      case null return #err("Profile not found — call registerTrader first");
    };

    let challengeId = switch (profile.activeChallengeId) {
      case (?cid) cid;
      case null return #err("No active challenge");
    };

    let challenge = switch (challenges.get(challengeId)) {
      case (?c) c;
      case null return #err("Challenge not found");
    };

    switch (challenge.status) {
      case (#active) {};
      case _ return #err("Challenge is not active");
    };

    // Fetch live price
    let now = Time.now();
    let livePrice = switch (await fetchLivePrice(pair, now)) {
      case (?p) p;
      case null return #err("Unable to fetch live price for " # pair);
    };

    // Risk validation
    let dailyPnl = switch (dailyPnlTracker.get(caller)) {
      case (?rec) rec.dailyPnl;
      case null 0.0;
    };
    let dailyPnlMap = Map.singleton(caller, dailyPnl);
    let validation = TradingLib.validateTrade(
      caller, pair, direction, size, 0.0,
      challenges, adminParams.value, dailyPnlMap,
    );
    switch (validation.status) {
      case (#rejected) return #err("Trade rejected: " # debug_show(validation.reasons));
      case _ {};
    };

    if (not TradingLib.validateTradeRisk(challenge, size, livePrice, adminParams.value)) {
      return #err("Trade rejected: risk limit exceeded");
    };

    // Daily drawdown check — if breached, force-close all and block
    let nsPerDay : Int = 86_400_000_000_000;
    let todayStart : Int = (now / nsPerDay) * nsPerDay;
    let currentDailyPnl = switch (dailyPnlTracker.get(caller)) {
      case (?rec) if (rec.dayStart == todayStart) rec.dailyPnl else 0.0;
      case null 0.0;
    };
    let dailyDrawdownFloor = 0.0 - (challenge.currentBalance * (challenge.dailyDrawdownLimitPct / 100.0));
    if (currentDailyPnl <= dailyDrawdownFloor) {
      await* forceCloseAllPositions(caller, "DAILY_DRAWDOWN");
      return #err("Daily drawdown limit reached — all positions closed");
    };

    let tradeId = nextTradeId.value;
    nextTradeId.value += 1;

    let dex : CommonTypes.DexSource = #icpSwap;
    let simulated = profile.mode == #evaluation;

    // On-chain slippage enforcement: capped at 1% (100 bps) for funded traders
    let effectiveSlippageBps : Nat = if (slippageBps > 100) 100 else slippageBps;

    // Fill price includes slippage (worst-case fill)
    let fillPrice = switch (direction) {
      case (#buy) livePrice * (1.0 + effectiveSlippageBps.toFloat() / 10_000.0);
      case (#sell) livePrice * (1.0 - effectiveSlippageBps.toFloat() / 10_000.0);
    };

    // For funded mode, execute real swap with on-chain slippage enforcement
    if (profile.mode == #funded) {
      let swapResult = await SwapLib.executeRealSwap(
        pair, direction, size, livePrice, effectiveSlippageBps, caller
      );
      switch (swapResult) {
        case (#err(e)) {
          // Detect pending withdrawal scenarios (swap succeeded, withdraw failed)
          if (e.contains(#text "PENDING_WITHDRAWAL")) {
            // Parse poolId, amount, tokenId from error message
            // Format: "...PENDING_WITHDRAWAL:<poolId>:<amount>:<tokenId>:<reason>"
            let parts = e.split(#char ':').toArray();
            if (parts.size() >= 5) {
              let poolId = parts[1];
              let amount = switch (Nat.fromText(parts[2])) {
                case (?n) n;
                case null 0;
              };
              let tokenId = parts[3];
              let pendingKey = caller.toText() # ":" # debug_show(tradeId);
              let pending : Types.PendingWithdrawal = {
                tradeId = debug_show(tradeId);
                traderId = caller;
                poolCanisterId = poolId;
                amount;
                tokenCanisterId = tokenId;
                attempts = 1;
                lastAttempt = now;
                status = #pending;
              };
              pendingWithdrawals.add(pendingKey, pending);
              auditLog.add(TradingLib.buildAuditEntry(
                "PENDING_WITHDRAWAL_RECORDED", caller,
                "tradeId=" # debug_show(tradeId) # " amount=" # debug_show(amount),
                now,
              ));
              // Continue — position still opened since swap DID execute
            } else {
              return #err("Swap failed: " # e);
            };
          } else {
            return #err("Swap failed: " # e);
          };
        };
        case (#ok(_)) {};
      };
    };

    let pos = TradingLib.buildPosition(
      tradeId, caller, pair, direction, size, fillPrice,
      dex, simulated, stopLoss, takeProfit, now,
    );
    positions.add(tradeId, pos);

    // Update daily P&L tracker (open cost)
    let openCost = TradingLib.computeOpenPnl(direction, size, fillPrice);
    let prevDailyPnl = switch (dailyPnlTracker.get(caller)) {
      case (?rec) if (rec.dayStart == todayStart) rec.dailyPnl else 0.0;
      case null 0.0;
    };
    dailyPnlTracker.add(caller, { dailyPnl = prevDailyPnl + openCost; dayStart = todayStart });

    // Update challenge with new trade
    let trade = TradingLib.buildSimulatedTrade(tradeId, caller, pair, direction, size, fillPrice, now, true);
    trades.add(tradeId, trade);
    let updatedChallenge = TradingLib.updateChallengeAfterTrade(challenge, trade);

    // Check total drawdown after trade — force-close if breached
    let totalDrawdownFloor = challenge.startingBalance * (1.0 - challenge.totalDrawdownLimitPct / 100.0);
    if (updatedChallenge.currentBalance <= totalDrawdownFloor) {
      await* forceCloseAllPositions(caller, "TOTAL_DRAWDOWN");
      let failedChallenge = { updatedChallenge with status = #failed };
      challenges.add(challengeId, failedChallenge);
      // Clear active challenge
      let latestProfile = switch (profiles.get(caller)) {
        case (?p) p;
        case null profile;
      };
      profiles.add(caller, { latestProfile with activeChallengeId = null });
      auditLog.add(TradingLib.buildAuditEntry(
        "CHALLENGE_FAILED_DRAWDOWN", caller,
        "challengeId=" # debug_show(challengeId),
        now,
      ));
    } else {
      challenges.add(challengeId, updatedChallenge);
    };

    auditLog.add(TradingLib.buildAuditEntry(
      "openPosition", caller,
      "tradeId=" # debug_show(tradeId) # " pair=" # pair # " size=" # debug_show(size),
      now,
    ));

    #ok(pos);
  };

  // ─── Close Position ────────────────────────────────────────────────────────

  public shared ({ caller }) func closePosition(
    tradeId : Nat,
    partialSize : ?Float,
  ) : async CommonTypes.Result<Types.Position, Text> {
    if (caller.isAnonymous()) return #err("Unauthorized");

    let pos = switch (positions.get(tradeId)) {
      case (?p) p;
      case null return #err("Position not found");
    };

    if (not Principal.equal(pos.traderId, caller)) return #err("Unauthorized: not your position");

    switch (pos.status) {
      case (#open) {};
      case _ return #err("Position is not open");
    };

    let profile = switch (profiles.get(caller)) {
      case (?p) p;
      case null return #err("Profile not found");
    };

    let now = Time.now();

    // Fetch live exit price
    let exitPrice = switch (await fetchLivePrice(pos.pair, now)) {
      case (?p) p;
      case null return #err("Unable to fetch exit price for " # pos.pair);
    };

    let closeSize = switch (partialSize) {
      case (?s) if (s > 0.0 and s <= pos.size) s else pos.size;
      case null pos.size;
    };

    let realizedPnl = TradingLib.calcPnl(pos.direction, closeSize, pos.entryPrice, exitPrice);

    let isFullClose = closeSize >= pos.size;
    let closedPos : Types.Position = {
      pos with
      currentPrice = exitPrice;
      realizedPnl = pos.realizedPnl + realizedPnl;
      exitTime = if (isFullClose) ?now else pos.exitTime;
      status = if (isFullClose) #closed else #open;
      size = pos.size - closeSize;
    };
    positions.add(tradeId, closedPos);

    // ─── Profit distribution for funded traders — exactly 10/20/70 ─────────
    if (profile.mode == #funded and realizedPnl > 0.0) {
      let (monthsActive, consistencyScore) = switch (profile.fundedAccount) {
        case (?fa) (fa.monthsActive, 70.0);
        case null (0, 70.0);
      };
      let dist = TradingLib.calcProfitDistribution(
        realizedPnl, monthsActive, consistencyScore, adminParams.value,
      );

      // Update investor pool balance (20%)
      investorPoolBalance.value += dist.investorAmount;

      // Update platform fee balance (10%)
      platformFeeBalance.value += dist.platformAmount;

      let payout : Types.PayoutRecord = {
        tradeId;
        traderId = caller;
        closeTime = now;
        profitAmount = realizedPnl;
        traderShare = dist.traderAmount;
        investorShare = dist.investorAmount;
        platformShare = dist.platformAmount;
        traderPct = dist.traderPct;
        tenureBonus = 0.0;
        consistencyBonus = 0.0;
        status = "settled";
      };
      payoutRecords.add(tradeId, payout);

      // Update profile total payouts (trader's 70%)
      let updatedProfile : Types.TraderProfile = {
        profile with totalPayouts = profile.totalPayouts + dist.traderAmount
      };
      profiles.add(caller, updatedProfile);

      auditLog.add(TradingLib.buildAuditEntry(
        "PROFIT_DISTRIBUTED",
        caller,
        "tradeId=" # debug_show(tradeId)
          # " total=" # debug_show(realizedPnl)
          # " trader=" # debug_show(dist.traderAmount)
          # " investor=" # debug_show(dist.investorAmount)
          # " platform=" # debug_show(dist.platformAmount),
        now,
      ));
    };

    // ─── Update challenge after close ────────────────────────────────────────
    let challengeId = switch (profile.activeChallengeId) {
      case (?cid) cid;
      case null {
        auditLog.add(TradingLib.buildAuditEntry("closePosition", caller,
          "tradeId=" # debug_show(tradeId) # " pnl=" # debug_show(realizedPnl), now));
        return #ok(closedPos);
      };
    };

    switch (challenges.get(challengeId)) {
      case (?challenge) {
        let closeTrade = TradingLib.buildSimulatedTrade(
          tradeId, caller, pos.pair, pos.direction, closeSize, exitPrice, now, true,
        );
        let updatedChallenge = TradingLib.updateChallengeAfterTrade(challenge, closeTrade);

        // Total drawdown breach after close — force-close remaining positions
        let totalDrawdownFloor = challenge.startingBalance * (1.0 - challenge.totalDrawdownLimitPct / 100.0);
        if (updatedChallenge.currentBalance <= totalDrawdownFloor) {
          await* forceCloseAllPositions(caller, "TOTAL_DRAWDOWN");
          let failedChallenge = { updatedChallenge with status = #failed };
          challenges.add(challengeId, failedChallenge);
          let latestProfile = switch (profiles.get(caller)) {
            case (?p) p;
            case null profile;
          };
          profiles.add(caller, { latestProfile with activeChallengeId = null });
          auditLog.add(TradingLib.buildAuditEntry(
            "CHALLENGE_FAILED_DRAWDOWN", caller,
            "challengeId=" # debug_show(challengeId),
            now,
          ));
        } else {
          // ─── Event-driven phase transition on trade close ─────────────────
          // Compute fresh consistency score
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
          let challengeWithScore = { updatedChallenge with consistencyScore = scoreRec.score };

          // checkChallengeProgress does immediate phase transition if conditions met
          let finalChallenge = PhaseLib.checkChallengeProgress(
            challengeWithScore, scoreRec, adminParams.value, now
          );

          // If newly funded, assign funded account to profile
          if (finalChallenge.phase == #funded and challenge.phase != #funded) {
            let alloc = PhaseLib.calcFundedAllocation(scoreRec.score, adminParams.value.baseAllocationAmount);
            let fundedAccount : Types.FundedAccount = {
              traderId = caller;
              allocationBase = adminParams.value.baseAllocationAmount;
              allocationCurrent = alloc;
              performanceMultiplier = if (adminParams.value.baseAllocationAmount > 0.0)
                alloc / adminParams.value.baseAllocationAmount else 1.0;
              monthsActive = 0;
              lastReviewDate = now;
              nextReviewDate = now + 30 * 86_400 * 1_000_000_000;
              accountBalance = alloc;
              unrealizedPnl = 0.0;
            };
            let latestProfile = switch (profiles.get(caller)) {
              case (?p) p;
              case null profile;
            };
            profiles.add(caller, {
              latestProfile with
              mode = #funded;
              fundedAccount = ?fundedAccount;
            });
            auditLog.add(TradingLib.buildAuditEntry(
              "TRADER_FUNDED", caller,
              "challengeId=" # debug_show(challengeId) # " allocation=" # debug_show(alloc),
              now,
            ));
          };

          // Clear active challenge if resolved
          switch (finalChallenge.status) {
            case (#passed or #failed) {
              let latestProfile = switch (profiles.get(caller)) {
                case (?p) p;
                case null profile;
              };
              profiles.add(caller, { latestProfile with activeChallengeId = null });
            };
            case _ {};
          };

          challenges.add(challengeId, finalChallenge);
        };
      };
      case null {};
    };

    auditLog.add(TradingLib.buildAuditEntry(
      "closePosition", caller,
      "tradeId=" # debug_show(tradeId) # " pnl=" # debug_show(realizedPnl),
      now,
    ));

    #ok(closedPos);
  };

  // ─── Cancel Order ──────────────────────────────────────────────────────────

  public shared ({ caller }) func cancelOrder(tradeId : Nat) : async CommonTypes.Result<(), Text> {
    if (caller.isAnonymous()) return #err("Unauthorized");

    let pos = switch (positions.get(tradeId)) {
      case (?p) p;
      case null return #err("Position not found");
    };

    if (not Principal.equal(pos.traderId, caller)) return #err("Unauthorized: not your order");

    switch (pos.status) {
      case (#open or #pendingFill) {};
      case _ return #err("Only open or pending orders can be cancelled");
    };

    let cancelled : Types.Position = { pos with status = #cancelled };
    positions.add(tradeId, cancelled);

    auditLog.add(TradingLib.buildAuditEntry(
      "cancelOrder", caller,
      "tradeId=" # debug_show(tradeId),
      Time.now(),
    ));

    #ok(());
  };

  // ─── Query: Open Positions ─────────────────────────────────────────────────

  public query ({ caller }) func getMyOpenPositions() : async [Types.Position] {
    let acc = List.empty<Types.Position>();
    for ((_, pos) in positions.entries()) {
      if (Principal.equal(pos.traderId, caller) and pos.status == #open) {
        acc.add(pos);
      };
    };
    acc.toArray();
  };

  // ─── Query: Closed Positions ───────────────────────────────────────────────

  public query ({ caller }) func getMyClosedPositions(limit : Nat) : async [Types.Position] {
    let acc = List.empty<Types.Position>();
    for ((_, pos) in positions.entries()) {
      if (Principal.equal(pos.traderId, caller) and pos.status == #closed) {
        acc.add(pos);
      };
    };
    let sorted = acc.sort(func(a : Types.Position, b : Types.Position) : Order.Order {
      let ta = switch (a.exitTime) { case (?t) t; case null a.entryTime };
      let tb = switch (b.exitTime) { case (?t) t; case null b.entryTime };
      if (tb > ta) #less else if (tb < ta) #greater else #equal
    });
    let all = sorted.toArray();
    if (all.size() <= limit) all else all.sliceToArray(0, limit.toInt());
  };

  // ─── Validate Trade Request ────────────────────────────────────────────────

  public query ({ caller }) func validateTradeRequest(
    pair : Text,
    direction : CommonTypes.TradeSide,
    size : Float,
    slippageBps : Nat,
  ) : async Types.ValidationResult {
    let dailyPnl = switch (dailyPnlTracker.get(caller)) {
      case (?rec) rec.dailyPnl;
      case null 0.0;
    };
    let dailyPnlMap = Map.singleton(caller, dailyPnl);
    TradingLib.validateTrade(
      caller, pair, direction, size, slippageBps.toFloat(),
      challenges, adminParams.value, dailyPnlMap,
    );
  };

  // ─── Price Snapshot ────────────────────────────────────────────────────────

  public query func getPriceSnapshot(pair : Text, dex : CommonTypes.DexSource) : async ?Types.PriceCache {
    PriceLib.getCachedPrice(dex, pair, priceCaches);
  };

  // ─── Retry Pending Withdrawals ─────────────────────────────────────────────
  // Called by the position monitor timer. Retries up to 10 times per record.

  public func retryPendingWithdrawals() : async () {
    let now = Time.now();
    for ((key, pending) in pendingWithdrawals.entries()) {
      let pw : Types.PendingWithdrawal = pending;
      switch (pw.status) {
        case (#pending) {
          if (pw.attempts >= 10) {
            // Mark permanently failed after 10 attempts
            pendingWithdrawals.add(key, { pw with status = #failed });
            auditLog.add(TradingLib.buildAuditEntry(
              "PENDING_WITHDRAWAL_FAILED",
              pw.traderId,
              "tradeId=" # pw.tradeId # " attempts=10 — manual intervention required",
              now,
            ));
          } else {
            // Use the actual pool canister ID stored in the pending record
            let poolId = pw.poolCanisterId;
            let result = await SwapLib.recoverIcpSwapWithdrawal(
              poolId, pw.traderId, pw.tokenCanisterId, pw.amount
            );
            switch (result) {
              case (#ok(recovered)) {
                pendingWithdrawals.add(key, { pw with status = #completed });
                auditLog.add(TradingLib.buildAuditEntry(
                  "PENDING_WITHDRAWAL_RECOVERED",
                  pw.traderId,
                  "tradeId=" # pw.tradeId # " recovered=" # debug_show(recovered),
                  now,
                ));
              };
              case (#err(_)) {
                pendingWithdrawals.add(key, {
                  pw with
                  attempts = pw.attempts + 1;
                  lastAttempt = now;
                });
              };
            };
          };
        };
        case _ {}; // completed or failed — skip
      };
    };
  };
};
