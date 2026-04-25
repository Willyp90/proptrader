import CommonTypes "common";

module {
  // ── Existing records (unchanged signatures) ───────────────────────────────

  public type Trade = {
    id : Nat;
    traderPrincipal : Principal;
    pair : Text;
    side : CommonTypes.TradeSide;
    quantity : Float;
    fillPrice : Float;
    pnl : Float;
    executionType : CommonTypes.ExecutionType;
    txHash : ?Text;
    timestamp : Int;
    riskCheckPassed : Bool;
  };

  public type Challenge = {
    id : Nat;
    traderPrincipal : Principal;
    startingBalance : Float;
    currentBalance : Float;
    targetProfitPct : Float;
    riskLevel : CommonTypes.RiskLevel;
    perTradeLimitPct : Float;
    dailyDrawdownLimitPct : Float;
    totalDrawdownLimitPct : Float;
    status : CommonTypes.ChallengeStatus;
    startTime : Int;
    trades : [Nat];
    // Extended fields
    phase : CommonTypes.ChallengePhase;
    cohortId : ?Nat;
    phase1StartTime : ?Int;
    phase1EndTime : ?Int;
    phase2StartTime : ?Int;
    phase2EndTime : ?Int;
    consistencyScore : Float;
    fundedAllocation : ?Float;
  };

  public type TraderProfile = {
    principal : Principal;
    role : CommonTypes.UserRole;
    mode : CommonTypes.TraderMode;
    activeChallengeId : ?Nat;
    // Extended fields
    fundedAccount : ?FundedAccount;
    totalPayouts : Float;
    tenureMonths : Nat;
    username : Text;
  };

  public type AdminParams = {
    targetProfitPct : Float;
    riskLevel : CommonTypes.RiskLevel;
    perTradeLimitPct : Float;
    dailyDrawdownLimitPct : Float;
    totalDrawdownLimitPct : Float;
    baseFee : Float;
    performanceFee : Float;
    tradingPaused : Bool;
    updatedAt : Int;
    // Extended fields
    defaultPhase1 : PhaseParams;
    defaultPhase2 : PhaseParams;
    pricePollingIntervalSecs : Nat;
    slCheckIntervalSecs : Nat;
    challengeCheckIntervalSecs : Nat;
    maxAllocationCap : Float;
    baseAllocationAmount : Float;
    investorPoolSharePct : Float;
    platformFeePct : Float;
    traderBaseSharePct : Float;
    maxTraderSharePct : Float;
  };

  public type PriceData = {
    pair : Text;
    price : Float;
    timestamp : Int;
    source : Text;
  };

  public type AuditEntry = {
    timestamp : Int;
    action : Text;
    principal : Principal;
    details : Text;
  };

  // ── New records ───────────────────────────────────────────────────────────

  // An open or closed position tracked per-trader
  public type Position = {
    tradeId : Nat;
    traderId : Principal;
    pair : Text;
    direction : CommonTypes.TradeSide;
    size : Float;
    entryPrice : Float;
    currentPrice : Float;
    unrealizedPnl : Float;
    realizedPnl : Float;
    entryTime : Int;
    exitTime : ?Int;
    stopLoss : ?Float;
    takeProfit : ?Float;
    status : CommonTypes.OrderStatus;
    dex : CommonTypes.DexSource;
    simulatedFill : Bool;
  };

  // On-chain consistency score snapshot for a trader at a point in time
  public type ConsistencyScore = {
    traderId : Principal;
    score : Float;
    profitDistScore : Float;
    winRateScore : Float;
    drawdownCtrlScore : Float;
    activityScore : Float;
    timestamp : Int;
    phase : CommonTypes.ChallengePhase;
  };

  // Funded allocation record, attached to a TraderProfile once funded
  public type FundedAccount = {
    traderId : Principal;
    allocationBase : Float;
    allocationCurrent : Float;
    performanceMultiplier : Float;
    monthsActive : Nat;
    lastReviewDate : Int;
    nextReviewDate : Int;
    accountBalance : Float;
    unrealizedPnl : Float;
  };

  // Challenge phase gate parameters (shared across Phase1 / Phase2 / cohorts)
  public type PhaseParams = {
    profitTarget : Float;
    maxDailyDrawdown : Float;
    maxTotalDrawdown : Float;
    minTradingDays : Nat;
    timeLimitDays : Nat;
    minConsistencyScore : Float;
  };

  // Versioned cohort configuration; new challenges use the active cohort
  public type CohortParams = {
    id : Nat;
    name : Text;
    phase1 : PhaseParams;
    phase2 : PhaseParams;
    createdDate : Int;
    lastModified : Int;
    modifiedBy : ?Principal;
    active : Bool;
  };

  // Profit distribution record created on position close for a funded trader
  public type PayoutRecord = {
    tradeId : Nat;
    traderId : Principal;
    closeTime : Int;
    profitAmount : Float;
    traderShare : Float;
    investorShare : Float;
    platformShare : Float;
    traderPct : Float;
    tenureBonus : Float;
    consistencyBonus : Float;
    status : Text;
  };

  // Short-lived DEX price cache entry refreshed on every polling tick
  public type PriceCache = {
    dex : CommonTypes.DexSource;
    pair : Text;
    bid : Float;
    ask : Float;
    last : Float;
    volume : Float;
    timestamp : Int;
    stale : Bool;
  };

  // Leaderboard row computed from on-chain trade and challenge data
  public type LeaderboardEntry = {
    rank : Nat;
    traderId : Principal;
    username : Text;
    profitPct : Float;
    riskScore : Float;
    consistencyScore : Float;
    phase : CommonTypes.ChallengePhase;
    funded : Bool;
    tradeCount : Nat;
    lastTradeTime : Int;
  };

  // Risk engine validation result returned to callers before trade execution
  public type ValidationResult = {
    status : CommonTypes.ValidationStatus;
    reasons : [Text];
    estimatedImpact : Float;
  };

  // Admin-defined target outcomes vs actuals for a cohort; drives dynamic params
  public type TargetOutcome = {
    cohortId : Nat;
    passRateTarget : Float;
    returnTarget : Float;
    consistencyTarget : Float;
    actualPassRate : Float;
    actualReturn : Float;
    actualConsistency : Float;
    lastUpdated : Int;
  };

  // Aggregated investor pool statistics surfaced to the investor dashboard
  public type InvestorStats = {
    poolBalance : Float;
    totalAllocated : Float;
    weeklyReturn : Float;
    monthlyReturn : Float;
    ytdReturn : Float;
    traderCount : Nat;
    fundedTraderCount : Nat;
    avgConsistency : Float;
  };

  // Immutable allocation change record for audit trail
  public type AllocationChange = {
    traderId : Principal;
    oldAllocation : Float;
    newAllocation : Float;
    reason : Text;
    timestamp : Int;
    reviewedBy : ?Principal;
  };

  // Investor deposit/share record — tracks each investor's pool contribution
  public type InvestorDeposit = {
    investorId : Principal;
    depositAmount : Float;
    shares : Nat;      // proportional shares in basis points (1 share = 1 unit)
    depositTime : Int;
  };

  // Pending withdrawal record for swap failure recovery (retry logic)
  public type PendingWithdrawal = {
    tradeId : Text;
    traderId : Principal;
    poolCanisterId : Text;   // actual SwapPool canister ID (not SwapFactory)
    amount : Nat;
    tokenCanisterId : Text;
    attempts : Nat;
    lastAttempt : Int;
    status : { #pending; #completed; #failed };
  };
};
