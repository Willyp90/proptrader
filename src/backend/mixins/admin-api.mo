import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import Types "../types/trading";
import TradingLib "../lib/trading";

mixin (
  accessControlState : AccessControl.AccessControlState,
  adminPrincipal : { var value : Principal },
  profiles : Map.Map<Principal, Types.TraderProfile>,
  challenges : Map.Map<Nat, Types.Challenge>,
  adminParams : { var value : Types.AdminParams },
  auditLog : List.List<Types.AuditEntry>,
  payoutRecords : Map.Map<Nat, Types.PayoutRecord>,
  // Investor pool and platform fee stable state
  investorPoolBalance : { var value : Float },
  investorShares : Map.Map<Principal, Nat>,
  totalInvestorShares : { var value : Nat },
  platformFeeBalance : { var value : Float },
) {

  // ─── Internal admin guard ──────────────────────────────────────────────────
  // Checks both the explicit adminPrincipal and AccessControl role.
  // Both must be checked to ensure protection even if AccessControl state drifts.
  private func isAdminCaller(caller : Principal) : Bool {
    Principal.equal(caller, adminPrincipal.value) or AccessControl.isAdmin(accessControlState, caller)
  };

  // ─── Set new admin principal (callable only by current admin) ─────────────
  public shared ({ caller }) func setAdminPrincipal(newAdmin : Principal) : async CommonTypes.Result<(), Text> {
    if (not isAdminCaller(caller)) return #err("Unauthorized: admin only");
    if (newAdmin.isAnonymous()) return #err("Cannot set anonymous as admin");
    let old = adminPrincipal.value;
    adminPrincipal.value := newAdmin;
    auditLog.add(TradingLib.buildAuditEntry(
      "SET_ADMIN_PRINCIPAL", caller,
      "old=" # old.toText() # " new=" # newAdmin.toText(),
      Time.now(),
    ));
    #ok(());
  };

  // ─── Update admin parameters derived from target profit % and risk level ──
  public shared ({ caller }) func setAdminParams(
    targetProfitPct : Float,
    riskLevel : CommonTypes.RiskLevel,
  ) : async CommonTypes.Result<Types.AdminParams, Text> {
    if (not isAdminCaller(caller)) {
      return #err("Unauthorized: Only admins can set parameters");
    };

    let oldParams = adminParams.value;
    let newParams = TradingLib.deriveAdminParams(
      targetProfitPct,
      riskLevel,
      oldParams.tradingPaused,
      Time.now(),
    );
    adminParams.value := newParams;

    let details = "targetProfitPct=" # debug_show(targetProfitPct)
      # " riskLevel=" # debug_show(riskLevel)
      # " old.perTrade=" # debug_show(oldParams.perTradeLimitPct)
      # " new.perTrade=" # debug_show(newParams.perTradeLimitPct)
      # " old.daily=" # debug_show(oldParams.dailyDrawdownLimitPct)
      # " new.daily=" # debug_show(newParams.dailyDrawdownLimitPct)
      # " old.total=" # debug_show(oldParams.totalDrawdownLimitPct)
      # " new.total=" # debug_show(newParams.totalDrawdownLimitPct);
    auditLog.add(TradingLib.buildAuditEntry("SET_ADMIN_PARAMS", caller, details, Time.now()));

    #ok(newParams);
  };

  // ─── Directly override all admin parameters (full admin control) ───────────
  public shared ({ caller }) func overrideParams(
    params : Types.AdminParams,
  ) : async CommonTypes.Result<Types.AdminParams, Text> {
    if (not isAdminCaller(caller)) {
      return #err("Unauthorized: Only admins can override parameters");
    };

    adminParams.value := params;

    let details = "perTrade=" # debug_show(params.perTradeLimitPct)
      # " daily=" # debug_show(params.dailyDrawdownLimitPct)
      # " total=" # debug_show(params.totalDrawdownLimitPct)
      # " baseFee=" # debug_show(params.baseFee)
      # " performanceFee=" # debug_show(params.performanceFee);
    auditLog.add(TradingLib.buildAuditEntry("OVERRIDE_PARAMS", caller, details, Time.now()));

    #ok(params);
  };

  // ─── Return all challenges across all traders (admin only) ─────────────────
  public query ({ caller }) func getAllChallenges() : async [Types.Challenge] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all challenges");
    };
    let acc = List.empty<Types.Challenge>();
    for ((_, c) in challenges.entries()) {
      acc.add(c);
    };
    acc.toArray();
  };

  // ─── Force a challenge into a specific status with a reason ────────────────
  public shared ({ caller }) func forceChallenge(
    challengeId : Nat,
    status : CommonTypes.ChallengeStatus,
    reason : Text,
  ) : async CommonTypes.Result<Types.Challenge, Text> {
    if (not isAdminCaller(caller)) {
      return #err("Unauthorized: Only admins can force challenge status");
    };

    let existing = switch (challenges.get(challengeId)) {
      case (?c) c;
      case null return #err("Challenge not found: " # debug_show(challengeId));
    };

    let updated = { existing with status };
    challenges.add(challengeId, updated);

    let details = "challengeId=" # debug_show(challengeId)
      # " newStatus=" # debug_show(status)
      # " reason=" # reason;
    auditLog.add(TradingLib.buildAuditEntry("FORCE_CHALLENGE_STATUS", caller, details, Time.now()));

    #ok(updated);
  };

  // ─── Pause or resume all trading platform-wide ─────────────────────────────
  public shared ({ caller }) func setPauseTrading(paused : Bool) : async CommonTypes.Result<(), Text> {
    if (not isAdminCaller(caller)) {
      return #err("Unauthorized: Only admins can pause/resume trading");
    };

    adminParams.value := { adminParams.value with tradingPaused = paused };

    let action = if (paused) "PAUSE_TRADING" else "RESUME_TRADING";
    auditLog.add(TradingLib.buildAuditEntry(action, caller, "paused=" # debug_show(paused), Time.now()));

    #ok(());
  };

  // ─── Return the most recent `limit` audit log entries (admin only) ─────────
  public query ({ caller }) func getAuditLog(limit : Nat) : async [Types.AuditEntry] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view the audit log");
    };

    let total = auditLog.size();
    if (total == 0) return [];

    let all = auditLog.toArray();
    let start : Int = if (total > limit) (total.toInt() - limit.toInt()) else 0;
    let slice = all.sliceToArray(start, total.toInt());
    slice.reverse();
  };

  // ─── Payout Stats ──────────────────────────────────────────────────────────

  public query ({ caller }) func getPayoutStats() : async CommonTypes.Result<{
    totalTraderPayouts : Float;
    totalInvestorPayouts : Float;
    totalPlatformRevenue : Float;
    investorPoolBalance : Float;
    platformFeeBalance : Float;
  }, Text> {
    if (not isAdminCaller(caller)) {
      return #err("Unauthorized: admin only");
    };

    var traderTotal : Float = 0.0;
    var investorTotal : Float = 0.0;
    var platformTotal : Float = 0.0;

    for ((_, rec) in payoutRecords.entries()) {
      traderTotal += rec.traderShare;
      investorTotal += rec.investorShare;
      platformTotal += rec.platformShare;
    };

    #ok({
      totalTraderPayouts = traderTotal;
      totalInvestorPayouts = investorTotal;
      totalPlatformRevenue = platformTotal;
      investorPoolBalance = investorPoolBalance.value;
      platformFeeBalance = platformFeeBalance.value;
    });
  };

  // ─── Withdraw Platform Fees — admin only ───────────────────────────────────
  // Transfers accumulated platform fee balance to the admin principal.
  // On-chain ledger transfer would go here in production; for now tracks
  // the withdrawal in the audit log and decrements the balance.
  public shared ({ caller }) func withdrawPlatformFees(amount : Float) : async CommonTypes.Result<Float, Text> {
    if (not isAdminCaller(caller)) {
      return #err("Unauthorized: admin only");
    };
    if (amount <= 0.0) return #err("Amount must be > 0");
    if (amount > platformFeeBalance.value) {
      return #err("Insufficient platform fee balance: " # debug_show(platformFeeBalance.value));
    };

    platformFeeBalance.value -= amount;

    auditLog.add(TradingLib.buildAuditEntry(
      "PLATFORM_FEE_WITHDRAWAL", caller,
      "amount=" # debug_show(amount) # " remaining=" # debug_show(platformFeeBalance.value),
      Time.now(),
    ));

    #ok(platformFeeBalance.value);
  };

  // ─── Funded Trader List ────────────────────────────────────────────────────

  public query ({ caller }) func getFundedTraderList() : async [{
    traderId : Principal;
    username : Text;
    allocation : Float;
    consistencyScore : Float;
    monthlyReturn : Float;
    status : Text;
  }] {
    if (not isAdminCaller(caller)) {
      return [];
    };

    let acc = List.empty<{
      traderId : Principal;
      username : Text;
      allocation : Float;
      consistencyScore : Float;
      monthlyReturn : Float;
      status : Text;
    }>();

    for ((traderId, profile) in profiles.entries()) {
      switch (profile.fundedAccount) {
        case (?fa) {
          let consistencyScore = switch (profile.activeChallengeId) {
            case (?cid) switch (challenges.get(cid)) {
              case (?c) c.consistencyScore;
              case null 0.0;
            };
            case null 0.0;
          };

          let monthlyReturn = if (fa.allocationBase > 0.0)
            fa.unrealizedPnl / fa.allocationBase * 100.0
          else 0.0;

          let status = switch (profile.activeChallengeId) {
            case (?_) "active";
            case null "no-active-challenge";
          };

          acc.add({
            traderId;
            username = profile.username;
            allocation = fa.allocationCurrent;
            consistencyScore;
            monthlyReturn;
            status;
          });
        };
        case null {};
      };
    };

    acc.toArray();
  };

  // ─── Investor Pool Admin View ──────────────────────────────────────────────

  public query ({ caller }) func getInvestorPoolSummary() : async CommonTypes.Result<{
    poolBalance : Float;
    platformFeeBalance : Float;
    investorCount : Nat;
    totalShares : Nat;
  }, Text> {
    if (not isAdminCaller(caller)) {
      return #err("Unauthorized: admin only");
    };
    #ok({
      poolBalance = investorPoolBalance.value;
      platformFeeBalance = platformFeeBalance.value;
      investorCount = investorShares.size();
      totalShares = totalInvestorShares.value;
    });
  };
};
