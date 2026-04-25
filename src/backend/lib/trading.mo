import Map "mo:core/Map";
import List "mo:core/List";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import CommonTypes "../types/common";
import Types "../types/trading";
import PhaseLib "phase";

module {
  // Derive AdminParams from target profit % and risk level.
  // Base limits by risk level are scaled by (targetProfitPct / 10.0).
  public func deriveAdminParams(
    targetProfitPct : Float,
    riskLevel : CommonTypes.RiskLevel,
    tradingPaused : Bool,
    now : Int,
  ) : Types.AdminParams {
    let multiplier = targetProfitPct / 10.0;

    let (basePerTrade, baseDaily, baseTotal, baseFeeRate, perfFeeRate) = switch (riskLevel) {
      case (#low) (1.0, 3.0, 5.0, 0.5, 10.0);
      case (#medium) (2.0, 5.0, 8.0, 1.0, 15.0);
      case (#high) (3.0, 8.0, 12.0, 1.5, 20.0);
    };

    // Phase params scale with multiplier too
    let phase1 : Types.PhaseParams = {
      profitTarget = 8.0 * multiplier;
      maxDailyDrawdown = baseDaily * multiplier;
      maxTotalDrawdown = baseTotal * multiplier;
      minTradingDays = 5;
      timeLimitDays = 30;
      minConsistencyScore = 60.0;
    };
    let phase2 : Types.PhaseParams = {
      profitTarget = 5.0 * multiplier;
      maxDailyDrawdown = baseDaily * multiplier;
      maxTotalDrawdown = baseTotal * multiplier;
      minTradingDays = 5;
      timeLimitDays = 60;
      minConsistencyScore = 65.0;
    };

    // Allocation caps scale with risk level
    // Profit split is always fixed: 10% platform / 20% investor pool / 70% trader
    let (baseAlloc, maxAlloc) = switch (riskLevel) {
      case (#low)    (10_000.0, 50_000.0);
      case (#medium) (25_000.0, 100_000.0);
      case (#high)   (50_000.0, 250_000.0);
    };

    {
      targetProfitPct;
      riskLevel;
      perTradeLimitPct = basePerTrade * multiplier;
      dailyDrawdownLimitPct = baseDaily * multiplier;
      totalDrawdownLimitPct = baseTotal * multiplier;
      baseFee = baseFeeRate;
      performanceFee = perfFeeRate;
      tradingPaused;
      updatedAt = now;
      defaultPhase1 = phase1;
      defaultPhase2 = phase2;
      pricePollingIntervalSecs = 10;
      slCheckIntervalSecs = 15;
      challengeCheckIntervalSecs = 60;
      maxAllocationCap = maxAlloc;
      baseAllocationAmount = baseAlloc;
      // Fixed profit split — do NOT change these values
      investorPoolSharePct = 20.0;
      platformFeePct = 10.0;
      traderBaseSharePct = 70.0;
      maxTraderSharePct = 70.0;
    };
  };

  // Validate that a trade passes all risk checks for the given challenge.
  public func validateTradeRisk(
    challenge : Types.Challenge,
    quantity : Float,
    currentPrice : Float,
    adminParams : Types.AdminParams,
  ) : Bool {
    // Per-trade position size check: notional value must not exceed per-trade limit
    let notional = quantity * currentPrice;
    let perTradeLimit = challenge.currentBalance * (challenge.perTradeLimitPct / 100.0);
    if (notional > perTradeLimit) return false;

    // Total drawdown check: current balance must be above total drawdown floor
    let totalDrawdownFloor = challenge.startingBalance * (1.0 - challenge.totalDrawdownLimitPct / 100.0);
    if (challenge.currentBalance <= totalDrawdownFloor) return false;

    // Platform-wide pause check
    if (adminParams.tradingPaused) return false;

    true;
  };

  // Compute updated challenge state after a trade (pass/fail/active).
  public func updateChallengeAfterTrade(
    challenge : Types.Challenge,
    trade : Types.Trade,
  ) : Types.Challenge {
    let newBalance = challenge.currentBalance + trade.pnl;
    let tradeIds = challenge.trades.concat([trade.id]);

    // Check total drawdown breach
    let totalDrawdownFloor = challenge.startingBalance * (1.0 - challenge.totalDrawdownLimitPct / 100.0);
    if (newBalance <= totalDrawdownFloor) {
      return { challenge with currentBalance = newBalance; trades = tradeIds; status = #failed };
    };

    // Check profit target reached
    let targetBalance = challenge.startingBalance * (1.0 + challenge.targetProfitPct / 100.0);
    if (newBalance >= targetBalance) {
      return { challenge with currentBalance = newBalance; trades = tradeIds; status = #passed };
    };

    { challenge with currentBalance = newBalance; trades = tradeIds };
  };

  // Compute spot P&L for a trade at open:
  //   BUY:  pnl = -(quantity * fillPrice)  [cost subtracted from balance]
  //   SELL: pnl = +(quantity * fillPrice)  [proceeds added to balance]
  public func computeOpenPnl(
    side : CommonTypes.TradeSide,
    quantity : Float,
    fillPrice : Float,
  ) : Float {
    switch (side) {
      case (#buy) { -(quantity * fillPrice) };
      case (#sell) { quantity * fillPrice };
    };
  };

  // Build a new Trade record for a simulated fill.
  public func buildSimulatedTrade(
    id : Nat,
    traderPrincipal : Principal,
    pair : Text,
    side : CommonTypes.TradeSide,
    quantity : Float,
    fillPrice : Float,
    now : Int,
    riskCheckPassed : Bool,
  ) : Types.Trade {
    let pnl = computeOpenPnl(side, quantity, fillPrice);
    {
      id;
      traderPrincipal;
      pair;
      side;
      quantity;
      fillPrice;
      pnl;
      executionType = #simulated;
      txHash = null;
      timestamp = now;
      riskCheckPassed;
    };
  };

  // Build a new Trade record for a real on-chain swap (funded trader).
  public func buildRealTrade(
    id : Nat,
    traderPrincipal : Principal,
    pair : Text,
    side : CommonTypes.TradeSide,
    quantity : Float,
    fillPrice : Float,
    txHash : Text,
    now : Int,
    riskCheckPassed : Bool,
  ) : Types.Trade {
    let pnl = computeOpenPnl(side, quantity, fillPrice);
    {
      id;
      traderPrincipal;
      pair;
      side;
      quantity;
      fillPrice;
      pnl;
      executionType = #real;
      txHash = ?txHash;
      timestamp = now;
      riskCheckPassed;
    };
  };

  // Calculate PnL for a completed trade given entry and exit prices.
  public func calcPnl(
    side : CommonTypes.TradeSide,
    quantity : Float,
    entryPrice : Float,
    exitPrice : Float,
  ) : Float {
    let diff = exitPrice - entryPrice;
    switch (side) {
      case (#buy) quantity * diff;
      case (#sell) quantity * (-diff);
    };
  };

  // Filter trades for a trader, returning most recent `limit` entries.
  public func getRecentTrades(
    allTrades : Map.Map<Nat, Types.Trade>,
    traderPrincipal : Principal,
    limit : Nat,
  ) : [Types.Trade] {
    let acc = List.empty<Types.Trade>();
    for ((_, t) in allTrades.entries()) {
      if (Principal.equal(t.traderPrincipal, traderPrincipal)) {
        acc.add(t);
      };
    };
    let sorted = acc.sort(func(a : Types.Trade, b : Types.Trade) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });
    if (sorted.size() <= limit) {
      sorted.toArray()
    } else {
      sorted.toArray().sliceToArray(0, limit.toInt())
    };
  };

  // Create an audit entry.
  public func buildAuditEntry(
    action : Text,
    principal : Principal,
    details : Text,
    now : Int,
  ) : Types.AuditEntry {
    { timestamp = now; action; principal; details };
  };

  // ─── Extended Functions ───────────────────────────────────────────────────

  // Full trade validation: wraps validateTradeRisk and adds consistency gate warning.
  // Returns a ValidationResult with status, human-readable reasons, and estimated notional impact.
  public func validateTrade(
    caller : Principal,
    _pair : Text,
    _direction : CommonTypes.TradeSide,
    size : Float,
    _slippage : Float,
    challenges : Map.Map<Nat, Types.Challenge>,
    adminParams : Types.AdminParams,
    dailyPnl : Map.Map<Principal, Float>,
  ) : Types.ValidationResult {
    let reasons = List.empty<Text>();
    var approved = true;
    var conditional = false;

    // Platform-wide pause
    if (adminParams.tradingPaused) {
      reasons.add("Trading is currently paused by admin");
      return { status = #rejected; reasons = reasons.toArray(); estimatedImpact = 0.0 };
    };

    // Find active challenge for this caller
    let challengeIter = challenges.values();
    let filteredIter = challengeIter.filter(func(c : Types.Challenge) : Bool {
      Principal.equal(c.traderPrincipal, caller) and c.status == #active
    });
    let maybeChallenge = filteredIter.find(func(_ : Types.Challenge) : Bool { true });

    switch (maybeChallenge) {
      case null {
        reasons.add("No active challenge found for caller");
        return { status = #rejected; reasons = reasons.toArray(); estimatedImpact = 0.0 };
      };
      case (?challenge) {
        // Per-trade size limit
        let perTradeLimit = challenge.currentBalance * (challenge.perTradeLimitPct / 100.0);
        if (size > perTradeLimit) {
          reasons.add("Trade size exceeds per-trade limit of " # perTradeLimit.toText());
          approved := false;
        };

        // Total drawdown floor check
        let totalDrawdownFloor = challenge.startingBalance * (1.0 - challenge.totalDrawdownLimitPct / 100.0);
        if (challenge.currentBalance <= totalDrawdownFloor) {
          reasons.add("Account at or below total drawdown floor");
          approved := false;
        };

        // Daily drawdown check
        let todayLoss = switch (dailyPnl.get(caller)) {
          case (?v) v;
          case null 0.0;
        };
        let dailyFloor = challenge.startingBalance * (-(challenge.dailyDrawdownLimitPct / 100.0));
        if (todayLoss <= dailyFloor) {
          reasons.add("Daily drawdown limit reached for today");
          approved := false;
        };

        // Consistency gate warning (informational — does not block trade)
        if (challenge.consistencyScore < 40.0 and challenge.trades.size() > 5) {
          reasons.add("Warning: consistency score is critically low — review trading pattern");
          conditional := true;
        };

        let estimatedImpact = size; // notional expressed as size units

        let status : CommonTypes.ValidationStatus = if (not approved) #rejected
          else if (conditional) #conditional
          else #approved;

        { status; reasons = reasons.toArray(); estimatedImpact };
      };
    };
  };

  // Compute unrealized P&L for an open position given the current market price.
  public func computeOpenPnlForPosition(
    position : Types.Position,
    currentPrice : Float,
  ) : Float {
    switch (position.direction) {
      case (#buy) {
        (currentPrice - position.entryPrice) * position.size
      };
      case (#sell) {
        (position.entryPrice - currentPrice) * position.size
      };
    };
  };

  // Construct a new Position record.
  public func buildPosition(
    tradeId : Nat,
    caller : Principal,
    pair : Text,
    direction : CommonTypes.TradeSide,
    size : Float,
    fillPrice : Float,
    dex : CommonTypes.DexSource,
    simulated : Bool,
    stopLoss : ?Float,
    takeProfit : ?Float,
    now : Int,
  ) : Types.Position {
    {
      tradeId;
      traderId = caller;
      pair;
      direction;
      size;
      entryPrice = fillPrice;
      currentPrice = fillPrice;
      unrealizedPnl = 0.0;
      realizedPnl = 0.0;
      entryTime = now;
      exitTime = null;
      stopLoss;
      takeProfit;
      status = #open;
      dex;
      simulatedFill = simulated;
    };
  };

  // ─── Profit Distribution — FIXED 10% platform / 20% investor pool / 70% trader ──────────
  //
  // These ratios are hard-coded and not configurable via adminParams to ensure
  // on-chain transparency and investor protection. The split is always:
  //   Platform:      10%
  //   Investor Pool: 20%
  //   Trader:        70%
  //
  // Negative PnL: loss is absorbed from funded account balance — no distribution occurs.
  public func calcProfitDistribution(
    profitAmount : Float,
    _monthsActive : Nat,
    _consistencyScore : Float,
    _adminParams : Types.AdminParams,
  ) : { traderAmount : Float; investorAmount : Float; platformAmount : Float; traderPct : Float } {
    if (profitAmount <= 0.0) {
      return {
        traderAmount = 0.0;
        investorAmount = 0.0;
        platformAmount = 0.0;
        traderPct = 70.0;
      };
    };

    // Fixed split: 10% platform, 20% investor pool, 70% trader
    let platformAmount  = profitAmount * 0.10;
    let investorAmount  = profitAmount * 0.20;
    let traderAmount    = profitAmount * 0.70;

    { traderAmount; investorAmount; platformAmount; traderPct = 70.0 };
  };
};
