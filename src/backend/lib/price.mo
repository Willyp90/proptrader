import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Time "mo:core/Time";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import CommonTypes "../types/common";
import Types "../types/trading";

module {

  // ─── ICPSwap ─────────────────────────────────────────────────────────────

  // Fetch live price from ICPSwap via HTTP outcall.
  // Uses the ICPSwap public REST endpoint for a given pool/pair.
  public func fetchIcpSwapPrice(
    pair : Text,
    transform : OutCall.Transform,
    now : Int,
  ) : async Types.PriceData {
    let url = "https://uvevg-iyaaa-aaaak-ac27q-cai.raw.icp0.io/pool?canisterId=" # pair;
    let raw = await OutCall.httpGetRequest(url, [], transform);
    switch (parseIcpSwapResponse(raw, pair, now)) {
      case (?data) { data };
      case null    { { pair; price = 0.0; timestamp = now; source = "icpswap-parse-error" } };
    };
  };

  // Fetch live price from Sonic via HTTP outcall (fallback).
  public func fetchSonicPrice(
    pair : Text,
    transform : OutCall.Transform,
    now : Int,
  ) : async Types.PriceData {
    let url = "https://data.sonic.ooo/api/v1/tokens/" # pair;
    let raw = await OutCall.httpGetRequest(url, [], transform);
    switch (parseSonicResponse(raw, pair, now)) {
      case (?data) { data };
      case null    { { pair; price = 0.0; timestamp = now; source = "sonic-parse-error" } };
    };
  };

  // ─── JSON Parsing ─────────────────────────────────────────────────────────
  // Motoko has no JSON stdlib — we do simple substring extraction.
  // ICPSwap response example: {"price":"0.00000182","token0Symbol":"ICP",...}
  // Sonic response example:   {"id":"ICP","price":12.34,...}

  public func parseIcpSwapResponse(raw : Text, pair : Text, now : Int) : ?Types.PriceData {
    switch (extractJsonField(raw, "price")) {
      case (?priceStr) {
        switch (parseFloat(priceStr)) {
          case (?p) { ?{ pair; price = p; timestamp = now; source = "icpswap" } };
          case null  { null };
        };
      };
      case null { null };
    };
  };

  public func parseSonicResponse(raw : Text, pair : Text, now : Int) : ?Types.PriceData {
    switch (extractJsonField(raw, "price")) {
      case (?priceStr) {
        switch (parseFloat(priceStr)) {
          case (?p) { ?{ pair; price = p; timestamp = now; source = "sonic" } };
          case null  { null };
        };
      };
      case null { null };
    };
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────

  // Parse a decimal text like "12.345" or "-0.001" into a Float.
  // Splits on '.' and combines integer and fractional parts.
  private func parseFloat(s : Text) : ?Float {
    let parts = s.split(#char '.').toArray();
    if (parts.size() == 1) {
      switch (Int.fromText(parts[0])) {
        case (?n) { ?(n.toFloat()) };
        case null { null };
      };
    } else if (parts.size() == 2) {
      let intPart = parts[0];
      let fracPart = parts[1];
      let negative = intPart.size() > 0 and intPart.toArray()[0] == '-';
      switch (Int.fromText(intPart)) {
        case null { null };
        case (?intVal) {
          switch (Nat.fromText(fracPart)) {
            case null { null };
            case (?fracVal) {
              let divisor = Float.pow(10.0, fracPart.size().toFloat());
              let frac = fracVal.toFloat() / divisor;
              if (negative) {
                ?(intVal.toFloat() - frac)
              } else {
                ?(intVal.toFloat() + frac)
              };
            };
          };
        };
      };
    } else { null };
  };

  // Extract the value of a JSON field.
  // Handles both: "price":"1.23"  and  "price":1.23
  private func extractJsonField(json : Text, key : Text) : ?Text {
    let needle = "\"" # key # "\":";
    switch (findAfter(json, needle)) {
      case null    { null };
      case (?rest) {
        let chars = rest.toArray();
        if (chars.size() == 0) return null;
        let quoted = chars[0] == '\"';
        let start = if (quoted) 1 else 0;
        var result = "";
        var i = start;
        while (i < chars.size()) {
          let c = chars[i];
          if (quoted and c == '\"') { i := chars.size() } // break
          else if (not quoted and (c == ',' or c == '}' or c == ' ' or c == '\n')) {
            i := chars.size() // break
          } else {
            result #= Text.fromChar(c);
            i += 1;
          };
        };
        if (result.size() == 0) null else ?result;
      };
    };
  };

  // Return the text that follows the first occurrence of `needle` in `text`.
  private func findAfter(text : Text, needle : Text) : ?Text {
    let tChars = text.toArray();
    let nChars = needle.toArray();
    let tSize  = tChars.size();
    let nSize  = nChars.size();
    if (nSize == 0 or tSize < nSize) return null;
    var i = 0;
    while (i + nSize <= tSize) {
      var j = 0;
      var match = true;
      while (j < nSize) {
        if (tChars[i + j] != nChars[j]) { match := false; j := nSize }; // short-circuit
        j += 1;
      };
      if (match) {
        return ?Text.fromIter(tChars.values().drop(i + nSize));
      };
      i += 1;
    };
    null;
  };

  // ─── Price Cache ──────────────────────────────────────────────────────────

  // Cache key: "<dex>:<pair>" e.g. "icpswap:ICP/USDT"
  private func cacheKey(dex : CommonTypes.DexSource, pair : Text) : Text {
    let dexStr = switch (dex) {
      case (#icpSwap) "icpswap";
      case (#sonic) "sonic";
    };
    dexStr # ":" # pair;
  };

  // Fetch a fresh price from the appropriate DEX and update the cache entry.
  // On failure, marks the existing entry stale (if present) or skips quietly.
  public func updatePriceCache(
    dex : CommonTypes.DexSource,
    pair : Text,
    priceCache : Map.Map<Text, Types.PriceCache>,
    _adminParams : Types.AdminParams,
    transform : OutCall.Transform,
  ) : async* () {
    let now = Time.now();
    let key = cacheKey(dex, pair);

    // Attempt to fetch live price
    let priceData = try {
      switch (dex) {
        case (#icpSwap) {
          ?(await fetchIcpSwapPrice(pair, transform, now))
        };
        case (#sonic) {
          ?(await fetchSonicPrice(pair, transform, now))
        };
      };
    } catch (_) { null };

    switch (priceData) {
      case (?data) {
        if (data.price > 0.0) {
          // Successful fetch — update cache with fresh entry
          let entry : Types.PriceCache = {
            dex;
            pair;
            bid   = data.price * 0.9995; // synthetic spread: -0.05%
            ask   = data.price * 1.0005; // synthetic spread: +0.05%
            last  = data.price;
            volume = 0.0; // volume not available via simple price endpoint
            timestamp = now;
            stale = false;
          };
          priceCache.add(key, entry);
        } else {
          // Zero price returned — mark stale
          _markStale(priceCache, key, now);
        };
      };
      case null {
        // Outcall failed — mark stale
        _markStale(priceCache, key, now);
      };
    };
  };

  // Mark an existing cache entry as stale; no-op if entry doesn't exist.
  private func _markStale(
    priceCache : Map.Map<Text, Types.PriceCache>,
    key : Text,
    _now : Int,
  ) {
    switch (priceCache.get(key)) {
      case (?existing) {
        priceCache.add(key, { existing with stale = true });
      };
      case null {};
    };
  };

  // Retrieve a cached price entry.
  // If the timestamp is more than 60 seconds old, returns it with stale = true.
  public func getCachedPrice(
    dex : CommonTypes.DexSource,
    pair : Text,
    priceCache : Map.Map<Text, Types.PriceCache>,
  ) : ?Types.PriceCache {
    let key = cacheKey(dex, pair);
    switch (priceCache.get(key)) {
      case null null;
      case (?entry) {
        let now = Time.now();
        let staleThresholdNs : Int = 60 * 1_000_000_000; // 60 seconds
        if (now - entry.timestamp > staleThresholdNs) {
          ?{ entry with stale = true }
        } else {
          ?entry
        };
      };
    };
  };

  // Refresh all known trading pairs on both DEXs.
  // Known pairs: ICP/USDT, BTC/USDT, ETH/USDT
  public func refreshAllPrices(
    priceCache : Map.Map<Text, Types.PriceCache>,
    adminParams : Types.AdminParams,
    transform : OutCall.Transform,
  ) : async* () {
    let knownPairs = ["ICP/USDT", "BTC/USDT", "ETH/USDT"];
    let dexes : [CommonTypes.DexSource] = [#icpSwap, #sonic];

    for (dex in dexes.values()) {
      for (pair in knownPairs.values()) {
        await* updatePriceCache(dex, pair, priceCache, adminParams, transform);
      };
    };
  };
};
