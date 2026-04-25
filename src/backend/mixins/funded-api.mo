import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import Types "../types/trading";
import ConsistencyLib "../lib/consistency";
import PhaseLib "../lib/phase";
import TradingLib "../lib/trading";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Principal, Types.TraderProfile>,
  challenges : Map.Map<Nat, Types.Challenge>,
  trades : Map.Map<Nat, Types.Trade>,
  allocationChanges : Map.Map<Principal, List.List<Types.AllocationChange>>,
  consistencyScoreHistory : Map.Map<Principal, List.List<Types.ConsistencyScore>>,
  auditLog : List.List<Types.AuditEntry>,
  adminParams : { var value : Types.AdminParams },
) {

  // ─── Funded Account ────────────────────────────────────────────────────────

  public query ({ caller }) func getMyFundedAccount() : async CommonTypes.Result<Types.FundedAccount, Text> {
    let profile = switch (profiles.get(caller)) {
      case (?p) p;
      case null return #err("Profile not found");
    };
    switch (profile.fundedAccount) {
      case (?fa) #ok(fa);
      case null #err("Not a funded trader");
    };
  };

  // ─── Consistency Score ─────────────────────────────────────────────────────

  public query ({ caller }) func getMyConsistencyScore() : async CommonTypes.Result<Types.ConsistencyScore, Text> {
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

    // Gather trades for this challenge
    let challengeTrades = List.empty<Types.Trade>();
    for (tid in challenge.trades.values()) {
      switch (trades.get(tid)) {
        case (?t) challengeTrades.add(t);
        case null {};
      };
    };

    let score = ConsistencyLib.computeConsistencyScore(
      caller,
      challengeTrades.toArray(),
      challenge,
      adminParams.value,
    );

    #ok(score);
  };

  // ─── Consistency Score History ─────────────────────────────────────────────

  public query ({ caller }) func getConsistencyScoreHistory(limit : Nat) : async [Types.ConsistencyScore] {
    switch (consistencyScoreHistory.get(caller)) {
      case null [];
      case (?hist) {
        let arr = hist.toArray();
        if (arr.size() <= limit) arr else arr.sliceToArray(arr.size().toInt() - limit.toInt(), arr.size().toInt());
      };
    };
  };

  // ─── Monthly Review (admin) ────────────────────────────────────────────────

  public shared ({ caller }) func triggerMonthlyReview() : async CommonTypes.Result<{ reviewedCount : Nat; changes : [Types.AllocationChange] }, Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };

    let now = Time.now();
    var reviewedCount : Nat = 0;
    let changesList = List.empty<Types.AllocationChange>();

    for ((traderId, profile) in profiles.entries()) {
      switch (profile.fundedAccount) {
        case (?fa) {
          reviewedCount += 1;
          // Gather challenge for consistency score — skip if no active challenge
          let maybeChallenge : ?Types.Challenge = switch (profile.activeChallengeId) {
            case (?cid) challenges.get(cid);
            case null null;
          };

          switch (maybeChallenge) {
            case null {};
            case (?challenge) {
              let challengeTrades = List.empty<Types.Trade>();
              for (tid in challenge.trades.values()) {
                switch (trades.get(tid)) {
                  case (?t) challengeTrades.add(t);
                  case null {};
                };
              };

              let scoreRec = ConsistencyLib.computeConsistencyScore(
                traderId,
                challengeTrades.toArray(),
                challenge,
                adminParams.value,
              );

              // Snapshot consistency score
              let hist = switch (consistencyScoreHistory.get(traderId)) {
                case (?h) h;
                case null {
                  let h = List.empty<Types.ConsistencyScore>();
                  consistencyScoreHistory.add(traderId, h);
                  h
                };
              };
              hist.add(scoreRec);

              // Recalculate allocation
              let newAlloc = PhaseLib.calcFundedAllocation(
                scoreRec.score, fa.allocationBase,
              );

              if (newAlloc != fa.allocationCurrent) {
                let change : Types.AllocationChange = {
                  traderId;
                  oldAllocation = fa.allocationCurrent;
                  newAllocation = newAlloc;
                  reason = "Monthly review — consistency=" # debug_show(scoreRec.score);
                  timestamp = now;
                  reviewedBy = ?caller;
                };
                changesList.add(change);

                // Record allocation change history
                let allocHist = switch (allocationChanges.get(traderId)) {
                  case (?h) h;
                  case null {
                    let h = List.empty<Types.AllocationChange>();
                    allocationChanges.add(traderId, h);
                    h
                  };
                };
                allocHist.add(change);

                // Update funded account
                let updatedFa : Types.FundedAccount = {
                  fa with
                  allocationCurrent = newAlloc;
                  performanceMultiplier = newAlloc / fa.allocationBase;
                  lastReviewDate = now;
                  nextReviewDate = now + 30 * 86_400 * 1_000_000_000;
                  monthsActive = fa.monthsActive + 1;
                };
                let updatedProfile : Types.TraderProfile = {
                  profile with
                  fundedAccount = ?updatedFa;
                  tenureMonths = profile.tenureMonths + 1;
                };
                profiles.add(traderId, updatedProfile);
              };
            };
          };
        };
        case null {};
      };
    };

    auditLog.add(TradingLib.buildAuditEntry(
      "triggerMonthlyReview", caller,
      "reviewed=" # debug_show(reviewedCount),
      now,
    ));

    #ok({ reviewedCount; changes = changesList.toArray() });
  };

  // ─── Trader Allocation View (admin) ───────────────────────────────────────

  public query ({ caller }) func getTraderAllocation(
    traderId : Principal,
  ) : async CommonTypes.Result<{ base : Float; current : Float; multiplier : Float; history : [Types.AllocationChange] }, Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin only");
    };

    let profile = switch (profiles.get(traderId)) {
      case (?p) p;
      case null return #err("Trader not found");
    };

    let fa = switch (profile.fundedAccount) {
      case (?f) f;
      case null return #err("Trader is not funded");
    };

    let history = switch (allocationChanges.get(traderId)) {
      case (?h) h.toArray();
      case null [];
    };

    #ok({
      base = fa.allocationBase;
      current = fa.allocationCurrent;
      multiplier = fa.performanceMultiplier;
      history;
    });
  };
};
