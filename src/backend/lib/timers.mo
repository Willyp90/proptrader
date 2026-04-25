import Timer "mo:core/Timer";

module {
  // Timer IDs used for cancellation. Held by the actor as mutable vars.
  public type TimerState = {
    var priceTimerId : ?Timer.TimerId;
    var slCheckTimerId : ?Timer.TimerId;
    var challengeCheckTimerId : ?Timer.TimerId;
    var dayEndTimerId : ?Timer.TimerId;
  };

  public func emptyTimerState() : TimerState {
    {
      var priceTimerId = null;
      var slCheckTimerId = null;
      var challengeCheckTimerId = null;
      var dayEndTimerId = null;
    };
  };

  // Register four recurring timers using mo:core/Timer.
  //   priceIntervalSecs      — how often to refresh price cache
  //   slCheckSecs            — how often to check SL/TP triggers
  //   challengeCheckSecs     — how often to evaluate challenge pass/fail transitions
  //
  // Callbacks are injected as `() -> async ()` from the actor scope so that the
  // <system> capability required by Timer.recurringTimer flows from the actor.
  //
  // Day-end reconciliation is hardcoded to 86 400 s (24 h).
  public func startTimers<system>(
    state : TimerState,
    priceIntervalSecs : Nat,
    slCheckSecs : Nat,
    challengeCheckSecs : Nat,
    onPriceTick : () -> async (),
    onSlTick : () -> async (),
    onChallengeTick : () -> async (),
    onDayEndTick : () -> async (),
  ) {
    // Cancel any existing timers first to prevent duplicates on re-init
    stopTimers(state);

    state.priceTimerId := ?Timer.recurringTimer<system>(
      #seconds priceIntervalSecs,
      onPriceTick,
    );

    state.slCheckTimerId := ?Timer.recurringTimer<system>(
      #seconds slCheckSecs,
      onSlTick,
    );

    state.challengeCheckTimerId := ?Timer.recurringTimer<system>(
      #seconds challengeCheckSecs,
      onChallengeTick,
    );

    let daySeconds : Nat = 86_400;
    state.dayEndTimerId := ?Timer.recurringTimer<system>(
      #seconds daySeconds,
      onDayEndTick,
    );
  };

  // Cancel all registered timers.
  public func stopTimers(state : TimerState) {
    switch (state.priceTimerId) {
      case (?id) { Timer.cancelTimer(id); state.priceTimerId := null };
      case null {};
    };
    switch (state.slCheckTimerId) {
      case (?id) { Timer.cancelTimer(id); state.slCheckTimerId := null };
      case null {};
    };
    switch (state.challengeCheckTimerId) {
      case (?id) { Timer.cancelTimer(id); state.challengeCheckTimerId := null };
      case null {};
    };
    switch (state.dayEndTimerId) {
      case (?id) { Timer.cancelTimer(id); state.dayEndTimerId := null };
      case null {};
    };
  };
};
