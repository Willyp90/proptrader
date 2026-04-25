import Time "mo:core/Time";
import CommonTypes "../types/common";
import Types "../types/trading";

module {
  // ─── Phase 1 ──────────────────────────────────────────────────────────────

  // Returns true when ALL phase-1 pass conditions are satisfied.
  public func checkPhase1Pass(
    challenge : Types.Challenge,
    score : Types.ConsistencyScore,
    adminParams : Types.AdminParams,
  ) : Bool {
    let p = adminParams.defaultPhase1;
    let now = Time.now();

    // 1. Profit target reached
    let targetBalance = challenge.startingBalance * (1.0 + p.profitTarget / 100.0);
    if (challenge.currentBalance < targetBalance) return false;

    // 2. Consistency score above minimum threshold
    if (score.score < p.minConsistencyScore) return false;

    // 3. Minimum trading days met (we count trades in the challenge's trade array as a proxy;
    //    the orchestrating layer should pass a pre-filtered trade list matching the challenge)
    let tradingDayCount = challenge.trades.size(); // callers ensure this is the day-count proxy
    if (tradingDayCount < p.minTradingDays) return false;

    // 4. Within time limit (phase1StartTime must be set)
    switch (challenge.phase1StartTime) {
      case null return false;
      case (?startTime) {
        let limitNs = p.timeLimitDays * 86_400 * 1_000_000_000;
        if (now > startTime + limitNs.toInt()) return false;
      };
    };

    // 5. No drawdown breach (status must not be #failed)
    if (challenge.status == #failed) return false;

    true;
  };

  // Returns ?reason if any phase-1 fail condition is triggered, null otherwise.
  public func checkPhase1Fail(
    challenge : Types.Challenge,
    adminParams : Types.AdminParams,
  ) : ?Text {
    let p = adminParams.defaultPhase1;
    let now = Time.now();

    // Drawdown breach
    let totalDrawdownFloor = challenge.startingBalance * (1.0 - p.maxTotalDrawdown / 100.0);
    if (challenge.currentBalance <= totalDrawdownFloor) {
      return ?"Total drawdown limit breached in Phase 1";
    };

    // Time limit exceeded
    switch (challenge.phase1StartTime) {
      case (?startTime) {
        let limitNs = p.timeLimitDays * 86_400 * 1_000_000_000;
        if (now > startTime + limitNs.toInt()) {
          return ?"Phase 1 time limit exceeded";
        };
      };
      case null {};
    };

    null;
  };

  // ─── Phase 2 ──────────────────────────────────────────────────────────────

  public func checkPhase2Pass(
    challenge : Types.Challenge,
    score : Types.ConsistencyScore,
    adminParams : Types.AdminParams,
  ) : Bool {
    let p = adminParams.defaultPhase2;
    let now = Time.now();

    let targetBalance = challenge.startingBalance * (1.0 + p.profitTarget / 100.0);
    if (challenge.currentBalance < targetBalance) return false;

    if (score.score < p.minConsistencyScore) return false;

    let tradingDayCount = challenge.trades.size();
    if (tradingDayCount < p.minTradingDays) return false;

    switch (challenge.phase2StartTime) {
      case null return false;
      case (?startTime) {
        let limitNs = p.timeLimitDays * 86_400 * 1_000_000_000;
        if (now > startTime + limitNs.toInt()) return false;
      };
    };

    if (challenge.status == #failed) return false;

    true;
  };

  public func checkPhase2Fail(
    challenge : Types.Challenge,
    adminParams : Types.AdminParams,
  ) : ?Text {
    let p = adminParams.defaultPhase2;
    let now = Time.now();

    let totalDrawdownFloor = challenge.startingBalance * (1.0 - p.maxTotalDrawdown / 100.0);
    if (challenge.currentBalance <= totalDrawdownFloor) {
      return ?"Total drawdown limit breached in Phase 2";
    };

    switch (challenge.phase2StartTime) {
      case (?startTime) {
        let limitNs = p.timeLimitDays * 86_400 * 1_000_000_000;
        if (now > startTime + limitNs.toInt()) {
          return ?"Phase 2 time limit exceeded";
        };
      };
      case null {};
    };

    null;
  };

  // ─── Phase Transition ─────────────────────────────────────────────────────

  // Returns an updated Challenge record reflecting the new phase.
  // All other state is preserved via record spread.
  public func transitionPhase(
    challenge : Types.Challenge,
    newPhase : CommonTypes.ChallengePhase,
    _reason : Text,
    now : Int,
  ) : Types.Challenge {
    switch (newPhase) {
      case (#phase1) {
        { challenge with
          phase = #phase1;
          phase1StartTime = ?now;
          status = #active;
        };
      };
      case (#phase2) {
        { challenge with
          phase = #phase2;
          phase1EndTime = ?now;
          phase2StartTime = ?now;
          status = #active;
        };
      };
      case (#funded) {
        { challenge with
          phase = #funded;
          phase2EndTime = ?now;
          status = #passed;
        };
      };
      case (#notStarted) {
        { challenge with
          phase = #notStarted;
          status = #paused;
        };
      };
    };
  };

  // ─── Event-driven phase progress check ─────────────────────────────────────
  //
  // Called at the END of every closePosition() to immediately evaluate
  // whether the challenge should transition phases. Returns an updated
  // Challenge if a transition occurred, or the same Challenge if nothing changed.
  // This replaces the ~60s timer-only approach for instant phase transitions.
  public func checkChallengeProgress(
    challenge : Types.Challenge,
    scoreRec : Types.ConsistencyScore,
    adminParams : Types.AdminParams,
    now : Int,
  ) : Types.Challenge {
    switch (challenge.phase) {
      case (#phase1) {
        // Check fail first (drawdown breach / time limit)
        switch (checkPhase1Fail(challenge, adminParams)) {
          case (?_reason) {
            { challenge with status = #failed };
          };
          case null {
            // Check pass — immediate promotion if all conditions met
            if (checkPhase1Pass(challenge, scoreRec, adminParams)) {
              transitionPhase(challenge, #phase2, "Phase 1 passed — event-driven", now)
            } else {
              challenge
            };
          };
        };
      };
      case (#phase2) {
        switch (checkPhase2Fail(challenge, adminParams)) {
          case (?_reason) {
            { challenge with status = #failed };
          };
          case null {
            if (checkPhase2Pass(challenge, scoreRec, adminParams)) {
              transitionPhase(challenge, #funded, "Phase 2 passed — event-driven", now)
            } else {
              challenge
            };
          };
        };
      };
      case _ {
        // #funded, #notStarted — no transitions apply
        challenge
      };
    };
  };

  // ─── Allocation & Profit Split ────────────────────────────────────────────

  // Funded account allocation: base * (1 + (score - 60) / 100).
  // Clamped: minimum = base, maximum = 2.0 * base.
  public func calcFundedAllocation(consistencyScore : Float, baseAllocation : Float) : Float {
    if (baseAllocation <= 0.0) return baseAllocation;
    let multiplier = 1.0 + (consistencyScore - 60.0) / 100.0;
    let raw = baseAllocation * multiplier;
    let maxAlloc = 2.0 * baseAllocation;
    if (raw < baseAllocation) baseAllocation
    else if (raw > maxAlloc) maxAlloc
    else raw;
  };

  // Trader profit-share percentage — kept for reference but profit split is now
  // fixed at 70/20/10 (trader/investor/platform). This function is no longer
  // used in calcProfitDistribution but retained for allocation bonus calculations.
  public func calcTraderSharePct(
    monthsActive : Nat,
    consistencyScore : Float,
    baseSharePct : Float,
    maxSharePct : Float,
  ) : Float {
    let tenureBonus = (monthsActive / 30).toFloat();
    let consistencyBonus = if (consistencyScore >= 75.0) 2.0 else 0.0;
    let raw = baseSharePct + tenureBonus + consistencyBonus;
    if (raw > maxSharePct) maxSharePct else raw;
  };
};
