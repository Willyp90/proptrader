import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/trading";

module {
  // ─── Component Scorers ────────────────────────────────────────────────────

  // Profit distribution score: penalises when one day dominates total profit.
  // < 40% concentration → 100.  > 60% concentration → 0.  Linear in-between.
  // tradesByDay: array of (day-bucket-as-Int, profit-for-that-day).
  public func calcProfitDistScore(tradesByDay : [(Int, Float)]) : Float {
    if (tradesByDay.size() == 0) return 100.0;

    var total : Float = 0.0;
    var maxDay : Float = 0.0;
    for ((_, dayPnl) in tradesByDay.values()) {
      // Only count profitable days toward the concentration ratio
      if (dayPnl > 0.0) {
        total += dayPnl;
        if (dayPnl > maxDay) maxDay := dayPnl;
      };
    };

    // No profit yet — not penalised; both zero means good distribution
    if (total <= 0.0) return 100.0;
    // Zero highest day with positive total is impossible, but guard anyway
    if (maxDay <= 0.0) return 100.0;

    let ratio = maxDay / total; // concentration ratio [0, 1]

    let raw = if (ratio <= 0.40) {
      100.0
    } else if (ratio >= 0.60) {
      0.0
    } else {
      // Linear interpolation: 100 at 0.40, 0 at 0.60
      100.0 * (0.60 - ratio) / 0.20
    };

    // Floor/ceiling safety
    if (raw < 0.0) 0.0 else if (raw > 100.0) 100.0 else raw;
  };

  // Win-rate score: wins / total trades * 100, clamped [0, 100].
  public func calcWinRateScore(trades : [Types.Trade]) : Float {
    let total = trades.size();
    if (total == 0) return 0.0; // no trades → 0, not penalised for single-trade edge
    let wins = trades.filter(func(t : Types.Trade) : Bool { t.pnl > 0.0 }).size();
    let raw = wins.toFloat() / total.toFloat() * 100.0;
    if (raw < 0.0) 0.0 else if (raw > 100.0) 100.0 else raw;
  };

  // Drawdown control score: 100 - (peakDrawdown / maxAllowed * 100), clamped [0, 100].
  // peakDrawdown and maxAllowed are percentages (e.g. 4.0 means 4%).
  public func calcDrawdownCtrlScore(peakDrawdown : Float, maxAllowed : Float) : Float {
    // If no drawdown limit set (0), cannot breach it — perfect score
    if (maxAllowed <= 0.0) return 100.0;
    // Negative peak drawdown means net gain — perfect score
    if (peakDrawdown <= 0.0) return 100.0;
    let raw = 100.0 - (peakDrawdown / maxAllowed * 100.0);
    if (raw < 0.0) 0.0 else if (raw > 100.0) 100.0 else raw;
  };

  // Activity score: min(tradingDays / minRequired, 1.0) * 100.
  public func calcActivityScore(tradingDays : Nat, minRequired : Nat) : Float {
    // Zero minimum requirement means no activity constraint — full marks
    if (minRequired == 0) return 100.0;
    // Zero trading days with a positive requirement → zero score
    if (tradingDays == 0) return 0.0;
    let ratio = tradingDays.toFloat() / minRequired.toFloat();
    let capped = if (ratio > 1.0) 1.0 else ratio;
    let raw = capped * 100.0;
    if (raw < 0.0) 0.0 else if (raw > 100.0) 100.0 else raw;
  };

  // Weighted composite consistency score.
  //   profitDist  : 35%
  //   winRate     : 30%
  //   drawdownCtrl: 20%
  //   activity    : 15%
  public func calcConsistencyScore(
    profitDist : Float,
    winRate : Float,
    drawdownCtrl : Float,
    activity : Float,
  ) : Float {
    // Each component is already clamped [0,100]; composite will be [0,100]
    let raw = (0.35 * profitDist) + (0.30 * winRate) + (0.20 * drawdownCtrl) + (0.15 * activity);
    if (raw < 0.0) 0.0 else if (raw > 100.0) 100.0 else raw;
  };

  // ─── Orchestrator ─────────────────────────────────────────────────────────

  // Compute full ConsistencyScore record for a trader at the current moment.
  public func computeConsistencyScore(
    traderId : Principal,
    trades : [Types.Trade],
    challenge : Types.Challenge,
    adminParams : Types.AdminParams,
  ) : Types.ConsistencyScore {
    let now = Time.now();

    // Edge case: no trades at all → return safe zero-score record (not penalised)
    // Note: winRate returns 0 when no trades, which is intentional (no data yet)

    // Build per-day profit map (key = day bucket = timestamp / nanoseconds-per-day)
    let nsPerDay : Int = 86_400_000_000_000;
    let dayMap = Map.empty<Int, Float>();
    for (t in trades.values()) {
      let day = t.timestamp / nsPerDay;
      let prev = switch (dayMap.get(day)) {
        case (?v) v;
        case null 0.0;
      };
      dayMap.add(day, prev + t.pnl);
    };
    let tradesByDay = dayMap.toArray();

    // Count unique trading days (days where at least one trade occurred)
    let tradingDays = dayMap.size();

    // Peak drawdown: track how far the balance fell from peak as a %
    // Compute running balance from trades to find the worst trough
    var runBal = challenge.startingBalance;
    var peakBal = challenge.startingBalance;
    var maxDrawdownPct : Float = 0.0;

    // Guard: if starting balance is zero, skip drawdown calculation
    if (challenge.startingBalance > 0.0) {
      for (t in trades.values()) {
        runBal += t.pnl;
        if (runBal > peakBal) peakBal := runBal;
        // peakBal is always >= startingBalance since we start there
        let dd = if (peakBal <= 0.0) 0.0
                 else (peakBal - runBal) / peakBal * 100.0;
        if (dd > maxDrawdownPct) maxDrawdownPct := dd;
      };
    };

    let maxAllowed = adminParams.totalDrawdownLimitPct;
    let phase = challenge.phase;

    let phaseParams : Types.PhaseParams = switch (phase) {
      case (#phase1) adminParams.defaultPhase1;
      case (#phase2) adminParams.defaultPhase2;
      case (_) adminParams.defaultPhase1;
    };

    let profitDistScore   = calcProfitDistScore(tradesByDay);
    let winRateScore      = calcWinRateScore(trades);
    let drawdownCtrlScore = calcDrawdownCtrlScore(maxDrawdownPct, maxAllowed);
    let activityScore     = calcActivityScore(tradingDays, phaseParams.minTradingDays);

    let compositeScore = calcConsistencyScore(
      profitDistScore,
      winRateScore,
      drawdownCtrlScore,
      activityScore,
    );

    {
      traderId;
      score = compositeScore;
      profitDistScore;
      winRateScore;
      drawdownCtrlScore;
      activityScore;
      timestamp = now;
      phase;
    };
  };
};
