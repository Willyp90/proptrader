import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import Types "../types/trading";
import TradingLib "../lib/trading";

mixin (
  accessControlState : AccessControl.AccessControlState,
  cohorts : Map.Map<Nat, Types.CohortParams>,
  challenges : Map.Map<Nat, Types.Challenge>,
  targetOutcomes : Map.Map<Nat, Types.TargetOutcome>,
  auditLog : List.List<Types.AuditEntry>,
  nextCohortId : { var value : Nat },
) {

  // ─── Create Cohort ─────────────────────────────────────────────────────────

  public shared ({ caller }) func createCohort(
    name : Text,
    phase1 : Types.PhaseParams,
    phase2 : Types.PhaseParams,
  ) : async CommonTypes.Result<Types.CohortParams, Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };

    if (name.size() == 0) return #err("Cohort name cannot be empty");

    let now = Time.now();
    let id = nextCohortId.value;
    nextCohortId.value += 1;

    let cohort : Types.CohortParams = {
      id;
      name;
      phase1;
      phase2;
      createdDate = now;
      lastModified = now;
      modifiedBy = ?caller;
      active = true;
    };

    cohorts.add(id, cohort);

    auditLog.add(TradingLib.buildAuditEntry(
      "createCohort", caller,
      "id=" # debug_show(id) # " name=" # name,
      now,
    ));

    #ok(cohort);
  };

  // ─── Update Cohort Params ──────────────────────────────────────────────────

  public shared ({ caller }) func updateCohortParams(
    cohortId : Nat,
    phase1 : ?Types.PhaseParams,
    phase2 : ?Types.PhaseParams,
  ) : async CommonTypes.Result<Types.CohortParams, Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };

    let existing = switch (cohorts.get(cohortId)) {
      case (?c) c;
      case null return #err("Cohort not found: " # debug_show(cohortId));
    };

    let now = Time.now();
    let updated : Types.CohortParams = {
      existing with
      phase1 = switch (phase1) { case (?p) p; case null existing.phase1 };
      phase2 = switch (phase2) { case (?p) p; case null existing.phase2 };
      lastModified = now;
      modifiedBy = ?caller;
    };

    cohorts.add(cohortId, updated);

    auditLog.add(TradingLib.buildAuditEntry(
      "updateCohortParams", caller,
      "cohortId=" # debug_show(cohortId),
      now,
    ));

    #ok(updated);
  };

  // ─── Get All Cohorts ───────────────────────────────────────────────────────

  public query ({ caller }) func getAllCohorts() : async [Types.CohortParams] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return [];
    };
    let acc = List.empty<Types.CohortParams>();
    for ((_, c) in cohorts.entries()) {
      acc.add(c);
    };
    acc.toArray();
  };

  // ─── Set Target Outcomes ───────────────────────────────────────────────────

  public shared ({ caller }) func setTargetOutcomes(
    cohortId : Nat,
    passRateTarget : Float,
    returnTarget : Float,
    consistencyTarget : Float,
  ) : async CommonTypes.Result<Types.TargetOutcome, Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };

    if (not cohorts.containsKey(cohortId)) {
      return #err("Cohort not found: " # debug_show(cohortId));
    };

    let now = Time.now();

    // Compute current actuals for this cohort
    let (actualPassRate, actualReturn, actualConsistency) = _computeCohortActuals(cohortId);

    let outcome : Types.TargetOutcome = {
      cohortId;
      passRateTarget;
      returnTarget;
      consistencyTarget;
      actualPassRate;
      actualReturn;
      actualConsistency;
      lastUpdated = now;
    };

    targetOutcomes.add(cohortId, outcome);

    auditLog.add(TradingLib.buildAuditEntry(
      "setTargetOutcomes", caller,
      "cohortId=" # debug_show(cohortId),
      now,
    ));

    #ok(outcome);
  };

  // ─── Get Target Outcomes ───────────────────────────────────────────────────

  public query func getTargetOutcomes(cohortId : Nat) : async CommonTypes.Result<Types.TargetOutcome, Text> {
    switch (targetOutcomes.get(cohortId)) {
      case (?to) {
        // Return with refreshed actuals
        let (actualPassRate, actualReturn, actualConsistency) = _computeCohortActuals(cohortId);
        #ok({
          to with
          actualPassRate;
          actualReturn;
          actualConsistency;
          lastUpdated = Time.now();
        })
      };
      case null #err("No target outcomes set for cohort " # debug_show(cohortId));
    };
  };

  // ─── Suggest Param Adjustments ─────────────────────────────────────────────

  public query ({ caller }) func suggestParamAdjustments(
    cohortId : Nat,
  ) : async CommonTypes.Result<[{ metric : Text; current : Float; suggested : Float; reason : Text }], Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };

    let cohort = switch (cohorts.get(cohortId)) {
      case (?c) c;
      case null return #err("Cohort not found: " # debug_show(cohortId));
    };

    let to = switch (targetOutcomes.get(cohortId)) {
      case (?t) t;
      case null return #err("No target outcomes set for cohort " # debug_show(cohortId));
    };

    let (actualPassRate, actualReturn, actualConsistency) = _computeCohortActuals(cohortId);

    let suggestions = List.empty<{ metric : Text; current : Float; suggested : Float; reason : Text }>();

    // Pass rate too low → lower profit target slightly
    if (actualPassRate < to.passRateTarget) {
      let gap = to.passRateTarget - actualPassRate;
      let adjustment = gap * 0.1; // reduce profit target by 10% of gap
      let currentTarget = cohort.phase1.profitTarget;
      suggestions.add({
        metric = "phase1.profitTarget";
        current = currentTarget;
        suggested = if (currentTarget - adjustment < 1.0) 1.0 else currentTarget - adjustment;
        reason = "Pass rate " # debug_show(actualPassRate) # "% is below target " # debug_show(to.passRateTarget) # "% — reducing profit target may improve pass rate";
      });
    };

    // Pass rate too high → tighten consistency threshold
    if (actualPassRate > to.passRateTarget + 10.0) {
      let currentMin = cohort.phase1.minConsistencyScore;
      suggestions.add({
        metric = "phase1.minConsistencyScore";
        current = currentMin;
        suggested = if (currentMin + 5.0 > 90.0) 90.0 else currentMin + 5.0;
        reason = "Pass rate " # debug_show(actualPassRate) # "% is well above target — raising consistency requirement filters lower-quality traders";
      });
    };

    // Consistency below target → increase activity requirement
    if (actualConsistency < to.consistencyTarget) {
      let currentMin = cohort.phase1.minTradingDays;
      suggestions.add({
        metric = "phase1.minTradingDays";
        current = currentMin.toFloat();
        suggested = if ((currentMin + 2).toFloat() > 20.0) 20.0 else (currentMin + 2).toFloat();
        reason = "Average consistency " # debug_show(actualConsistency) # " is below target " # debug_show(to.consistencyTarget) # " — requiring more trading days improves score";
      });
    };

    // Return below target → increase max drawdown tolerance
    if (actualReturn < to.returnTarget) {
      let currentDD = cohort.phase1.maxTotalDrawdown;
      suggestions.add({
        metric = "phase1.maxTotalDrawdown";
        current = currentDD;
        suggested = if (currentDD + 2.0 > 20.0) 20.0 else currentDD + 2.0;
        reason = "Average return " # debug_show(actualReturn) # "% is below target " # debug_show(to.returnTarget) # "% — wider drawdown tolerance may attract more aggressive profitable traders";
      });
    };

    #ok(suggestions.toArray());
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  func _computeCohortActuals(cohortId : Nat) : (Float, Float, Float) {
    var totalChallenges : Nat = 0;
    var passedChallenges : Nat = 0;
    var totalReturn : Float = 0.0;
    var totalConsistency : Float = 0.0;

    for ((_, c) in challenges.entries()) {
      switch (c.cohortId) {
        case (?cid) {
          if (cid == cohortId) {
            totalChallenges += 1;
            if (c.status == #passed) passedChallenges += 1;
            let ret = if (c.startingBalance > 0.0)
              (c.currentBalance - c.startingBalance) / c.startingBalance * 100.0
            else 0.0;
            totalReturn += ret;
            totalConsistency += c.consistencyScore;
          };
        };
        case null {};
      };
    };

    if (totalChallenges == 0) return (0.0, 0.0, 0.0);

    let n = totalChallenges.toFloat();
    let passRate = passedChallenges.toFloat() / n * 100.0;
    let avgReturn = totalReturn / n;
    let avgConsistency = totalConsistency / n;

    (passRate, avgReturn, avgConsistency);
  };
};
