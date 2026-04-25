module {
  public type Result<T, E> = { #ok : T; #err : E };

  public type TraderMode = { #evaluation; #funded };

  public type RiskLevel = { #low; #medium; #high };

  public type ChallengeStatus = { #active; #passed; #failed; #paused };

  public type ExecutionType = { #simulated; #real };

  public type TradeSide = { #buy; #sell };

  public type UserRole = { #trader; #admin };

  // Phase a trader is in throughout the challenge lifecycle
  public type ChallengePhase = { #notStarted; #phase1; #phase2; #funded };

  // Lifecycle status of an individual order / position
  public type OrderStatus = { #open; #pendingFill; #filled; #closed; #cancelled; #liquidated };

  // Source DEX for price data and order execution
  public type DexSource = { #icpSwap; #sonic };

  // Trade direction (long = buy-side exposure, short = sell-side exposure)
  public type Direction = { #long; #short };

  // Result of a validation check (risk engine, phase gate, etc.)
  public type ValidationStatus = { #approved; #conditional; #rejected };

  // Categorises on-chain audit log entries
  public type AuditEventType = {
    #trade;
    #riskCheck;
    #phaseTransition;
    #paramChange;
    #allocationReview;
    #payout;
  };
};
