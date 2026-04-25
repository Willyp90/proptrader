import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Order "mo:core/Order";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import Types "../types/trading";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Principal, Types.TraderProfile>,
  challenges : Map.Map<Nat, Types.Challenge>,
  trades : Map.Map<Nat, Types.Trade>,
  payoutRecords : Map.Map<Nat, Types.PayoutRecord>,
  consistencyScoreHistory : Map.Map<Principal, List.List<Types.ConsistencyScore>>,
  adminParams : { var value : Types.AdminParams },
) {

  // ─── Leaderboard ───────────────────────────────────────────────────────────

  public query func getLeaderboard(
    sortBy : Text,
    timePeriodDays : Nat,
    limit : Nat,
  ) : async [Types.LeaderboardEntry] {
    let now = Time.now();
    let windowNs : Int = timePeriodDays * 86_400 * 1_000_000_000;
    let cutoff : Int = now - windowNs;

    // Build entry per trader from their best/active challenge
    let entries = List.empty<Types.LeaderboardEntry>();

    for ((traderId, profile) in profiles.entries()) {
      // Find the best challenge in the time window
      let relevantChallenges = List.empty<Types.Challenge>();
      for ((_, c) in challenges.entries()) {
        if (Principal.equal(c.traderPrincipal, traderId) and c.startTime >= cutoff) {
          relevantChallenges.add(c);
        };
      };

      if (not relevantChallenges.isEmpty()) {
        // Pick challenge with highest balance (proxy for best profit)
        let best = relevantChallenges.foldLeft<?Types.Challenge, Types.Challenge>(
          null,
          func(acc, c) {
            switch (acc) {
              case null ?c;
              case (?prev) if (c.currentBalance > prev.currentBalance) ?c else acc;
            }
          },
        );

        switch (best) {
          case (?challenge) {
            // Count trades for this challenge in window
            let tradeCount = challenge.trades.size();

            let lastTradeTime : Int = if (tradeCount > 0) {
              var latest : Int = 0;
              for (tid in challenge.trades.values()) {
                switch (trades.get(tid)) {
                  case (?t) if (t.timestamp > latest) latest := t.timestamp;
                  case null {};
                };
              };
              latest
            } else { challenge.startTime };

            let profitPct = if (challenge.startingBalance > 0.0)
              (challenge.currentBalance - challenge.startingBalance) / challenge.startingBalance * 100.0
            else 0.0;

            // Risk score: inverse of drawdown usage
            let usedDrawdownPct = if (challenge.startingBalance > 0.0)
              (challenge.startingBalance - challenge.currentBalance) / challenge.startingBalance * 100.0
            else 0.0;
            let riskScore = if (usedDrawdownPct <= 0.0) 100.0
              else 100.0 - (usedDrawdownPct / challenge.totalDrawdownLimitPct * 100.0);
            let clampedRisk = if (riskScore < 0.0) 0.0 else if (riskScore > 100.0) 100.0 else riskScore;

            let entry : Types.LeaderboardEntry = {
              rank = 0; // filled below after sort
              traderId;
              username = profile.username;
              profitPct;
              riskScore = clampedRisk;
              consistencyScore = challenge.consistencyScore;
              phase = challenge.phase;
              funded = profile.mode == #funded;
              tradeCount;
              lastTradeTime;
            };
            entries.add(entry);
          };
          case null {};
        };
      };
    };

    // Sort by requested metric
    let sorted = entries.sort(func(a : Types.LeaderboardEntry, b : Types.LeaderboardEntry) : Order.Order {
      let va = switch (sortBy) {
        case "profit" a.profitPct;
        case "riskScore" a.riskScore;
        case _ a.consistencyScore; // default: consistency
      };
      let vb = switch (sortBy) {
        case "profit" b.profitPct;
        case "riskScore" b.riskScore;
        case _ b.consistencyScore;
      };
      if (vb > va) #less else if (vb < va) #greater else #equal
    });

    // Assign ranks and limit
    let ranked = sorted.mapEntries<Types.LeaderboardEntry, Types.LeaderboardEntry>(func(e, i) {
      { e with rank = i + 1 }
    });

    let arr = ranked.toArray();
    if (arr.size() <= limit) arr else arr.sliceToArray(0, limit.toInt());
  };

  // ─── Trader Public Profile ─────────────────────────────────────────────────

  public query func getTraderPublicProfile(
    traderId : Principal,
  ) : async ?{ leaderboardEntry : Types.LeaderboardEntry; recentTrades : [Types.Trade]; consistencyHistory : [Types.ConsistencyScore] } {
    let profile = switch (profiles.get(traderId)) {
      case (?p) p;
      case null return null;
    };

    // Find active or most recent challenge
    let maybeChallenge : ?Types.Challenge = switch (profile.activeChallengeId) {
      case (?cid) challenges.get(cid);
      case null {
        // Scan for latest challenge
        var latest : ?Types.Challenge = null;
        for ((_, c) in challenges.entries()) {
          if (Principal.equal(c.traderPrincipal, traderId)) {
            switch (latest) {
              case null latest := ?c;
              case (?prev) if (c.startTime > prev.startTime) latest := ?c;
            };
          };
        };
        latest
      };
    };

    let challenge = switch (maybeChallenge) {
      case (?c) c;
      case null return null;
    };

    let profitPct = if (challenge.startingBalance > 0.0)
      (challenge.currentBalance - challenge.startingBalance) / challenge.startingBalance * 100.0
    else 0.0;

    let entry : Types.LeaderboardEntry = {
      rank = 0;
      traderId;
      username = profile.username;
      profitPct;
      riskScore = 100.0 - challenge.consistencyScore; // placeholder
      consistencyScore = challenge.consistencyScore;
      phase = challenge.phase;
      funded = profile.mode == #funded;
      tradeCount = challenge.trades.size();
      lastTradeTime = Time.now();
    };

    // Collect recent 10 trades
    let recentAcc = List.empty<Types.Trade>();
    for (tid in challenge.trades.values()) {
      switch (trades.get(tid)) {
        case (?t) recentAcc.add(t);
        case null {};
      };
    };
    let sorted = recentAcc.sort(func(a : Types.Trade, b : Types.Trade) : Order.Order {
      Int.compare(b.timestamp, a.timestamp)
    });
    let recentTrades = do {
      let arr = sorted.toArray();
      if (arr.size() <= 10) arr else arr.sliceToArray(0, 10);
    };

    // Consistency score history
    let historyArr = switch (consistencyScoreHistory.get(traderId)) {
      case (?hist) hist.toArray();
      case null [];
    };

    ?{ leaderboardEntry = entry; recentTrades; consistencyHistory = historyArr };
  };

  // ─── Investor Stats ────────────────────────────────────────────────────────

  public query ({ caller }) func getInvestorStats() : async CommonTypes.Result<Types.InvestorStats, Text> {
    // Investor role check — only admins or investors may call
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: investor role required");
    };

    var totalAllocated : Float = 0.0;
    var fundedCount : Nat = 0;

    for ((_, profile) in profiles.entries()) {
      switch (profile.fundedAccount) {
        case (?fa) {
          totalAllocated += fa.allocationCurrent;
          fundedCount += 1;
        };
        case null {};
      };
    };

    let traderCount = profiles.size();

    // Compute avg consistency from active challenges
    var totalConsistency : Float = 0.0;
    var activeChallengeCount : Nat = 0;
    for ((_, c) in challenges.entries()) {
      if (c.status == #active) {
        totalConsistency += c.consistencyScore;
        activeChallengeCount += 1;
      };
    };
    let avgConsistency = if (activeChallengeCount > 0)
      totalConsistency / activeChallengeCount.toFloat()
    else 0.0;

    #ok({
      poolBalance = totalAllocated;
      totalAllocated;
      weeklyReturn = 0.0; // would require time-windowed P&L aggregation
      monthlyReturn = 0.0;
      ytdReturn = 0.0;
      traderCount;
      fundedTraderCount = fundedCount;
      avgConsistency;
    });
  };

  // ─── Payout History ────────────────────────────────────────────────────────

  public query ({ caller }) func getPayoutHistory(
    startTime : ?Int,
    endTime : ?Int,
    limit : Nat,
  ) : async [Types.PayoutRecord] {
    let acc = List.empty<Types.PayoutRecord>();
    for ((_, rec) in payoutRecords.entries()) {
      if (Principal.equal(rec.traderId, caller)) {
        let afterStart = switch (startTime) {
          case (?s) rec.closeTime >= s;
          case null true;
        };
        let beforeEnd = switch (endTime) {
          case (?e) rec.closeTime <= e;
          case null true;
        };
        if (afterStart and beforeEnd) acc.add(rec);
      };
    };
    let sorted = acc.sort(func(a : Types.PayoutRecord, b : Types.PayoutRecord) : Order.Order {
      Int.compare(b.closeTime, a.closeTime)
    });
    let arr = sorted.toArray();
    if (arr.size() <= limit) arr else arr.sliceToArray(0, limit.toInt());
  };
};
