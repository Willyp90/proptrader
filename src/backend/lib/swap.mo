import Principal "mo:core/Principal";
import Time "mo:core/Time";
import CommonTypes "../types/common";

module {
  public type SwapResult = {
    txHash : Text;
    filledQty : Float;
    fillPrice : Float;
  };

  // ---------------------------------------------------------------------------
  // ICPSwap Candid types (as used by the live SwapPool canister)
  // SwapFactory: 4mmnk-kiaaa-aaaag-qbllq-cai
  // NodeIndex:   ggzvv-5qaaa-aaaag-qck7a-cai
  // ---------------------------------------------------------------------------

  // SwapPool actor interface — one pool canister per pair on ICPSwap
  type ICPSwapPool = actor {
    // Quote how many output tokens a given input produces
    quote : shared ({
      zeroForOne : Bool;
      amountIn : Text;     // string representation of Nat
      amountOutMinimum : Text;
    }) -> async { #Ok : Nat; #Err : Text };

    // Execute the swap — tokens must already be deposited via depositFrom
    swap : shared ({
      zeroForOne : Bool;
      amountIn : Text;
      amountOutMinimum : Text;
    }) -> async { #Ok : Nat; #Err : Text };

    // Deposit tokens into the pool before swapping (ICRC2 approve first)
    depositFrom : shared ({
      token : Text;     // canister id of token
      amount : Nat;
      fee : Nat;
    }) -> async { #Ok : Nat; #Err : Text };

    // Withdraw output tokens after swap
    withdraw : shared ({
      token : Text;
      amount : Nat;
      fee : Nat;
    }) -> async { #Ok : Nat; #Err : Text };

    // Check unused balance that can be recovered after a partial failure
    getUserUnusedBalance : shared query (Principal) -> async { balance0 : Nat; balance1 : Nat };
  };

  // NodeIndex actor — used to look up the pool canister for a given pair
  type ICPSwapNodeIndex = actor {
    getAllPools : shared query () -> async [{
      pool : Text;
      token0Id : Text;
      token1Id : Text;
      token0Price : Text;
      token1Price : Text;
      volumeUSD : Text;
      tvlUSD : Text;
    }];
  };

  // ---------------------------------------------------------------------------
  // Sonic Candid types (Sonic Dapp: aanaa-xaaaa-aaaah-aaeiq-cai)
  // ---------------------------------------------------------------------------

  type SonicDapp = actor {
    // Swap tokenIn for tokenOut; returns amount of tokenOut received
    swapExactTokensForTokens : shared (
      amountIn : Nat,
      amountOutMin : Nat,
      path : [Text],   // [tokenIn canisterId, tokenOut canisterId]
      to : Principal,
      deadline : Int,
    ) -> async { #Ok : [Nat]; #Err : Text };

    // Get price information for a pair
    getPair : shared query (Text, Text) -> async ?{
      id : Text;
      token0 : { id : Text; symbol : Text; decimals : Nat };
      token1 : { id : Text; symbol : Text; decimals : Nat };
      reserve0 : Nat;
      reserve1 : Nat;
      price0CumulativeLast : Nat;
      price1CumulativeLast : Nat;
      kLast : Nat;
      blockTimestampLast : Int;
      totalSupply : Nat;
    };
  };

  // ---------------------------------------------------------------------------
  // Canister references (mainnet)
  // ---------------------------------------------------------------------------

  let ICPSWAP_NODE_INDEX_ID = "ggzvv-5qaaa-aaaag-qck7a-cai";
  let SONIC_DAPP_ID         = "aanaa-xaaaa-aaaah-aaeiq-cai";

  // ICP Ledger and ckBTC canister IDs (for token approvals)
  let ICP_LEDGER_ID  = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  let CKBTC_ID       = "mxzaz-hqaaa-aaaar-qaada-cai";

  // Maximum slippage for funded trader swaps: 1% (100 basis points)
  let MAX_SLIPPAGE_BPS : Nat = 100; // 1%

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private func buildTxRef(dex : Text, callerPrincipal : Principal, amount : Nat) : Text {
    dex # ":" # callerPrincipal.toText() # ":" # debug_show(Time.now()) # ":" # debug_show(amount);
  };

  // Convert a Float price/qty to a Nat with 8 decimals precision (standard ICP token)
  private func floatToNat8Dec(f : Float) : Nat {
    let scaled = f * 100_000_000.0;
    if (scaled < 0.0) 0
    else scaled.toInt().toNat()
  };

  // Apply slippage to get amountOutMinimum.
  // slippageBps: slippage in basis points (100 = 1%)
  // Caps at MAX_SLIPPAGE_BPS regardless of input.
  private func applySlippage(expectedOut : Nat, slippageBps : Nat) : Nat {
    let effectiveSlippage = if (slippageBps > MAX_SLIPPAGE_BPS) MAX_SLIPPAGE_BPS else slippageBps;
    let reduction = expectedOut * effectiveSlippage / 10_000;
    if (reduction >= expectedOut) 0 else expectedOut - reduction;
  };

  // ---------------------------------------------------------------------------
  // ICPSwap — look up pool canister ID from NodeIndex
  // ---------------------------------------------------------------------------

  private func lookupIcpSwapPool(pair : Text) : async ?Text {
    let nodeIndex : ICPSwapNodeIndex = actor(ICPSWAP_NODE_INDEX_ID);
    let pools = try { await nodeIndex.getAllPools() } catch (_) { return null };
    // pair is expected to be "TOKEN0/TOKEN1" symbol format
    let parts = pair.split(#char '/').toArray();
    if (parts.size() < 2) return null;
    let sym0 = parts[0];
    let sym1 = parts[1];
    for (p in pools.values()) {
      // Simple substring match on token symbols
      if (
        (p.token0Id.contains(#text sym0) or sym0 == "ICP") and
        (p.token1Id.contains(#text sym1) or sym1 == "USDT")
      ) {
        return ?p.pool;
      };
    };
    null;
  };

  // ---------------------------------------------------------------------------
  // ICPSwap swap execution — real inter-canister calls
  //
  // Flow:
  //   1. Quote expected output from pool
  //   2. Apply slippage to compute amountOutMinimum (capped at 1%)
  //   3. depositFrom — moves tokens into pool
  //   4. swap — executes the trade
  //   5. withdraw — pulls output tokens to caller
  //
  // On withdraw failure: caller is responsible for recording a PendingWithdrawal.
  // ---------------------------------------------------------------------------

  public func executeIcpSwapSwap(
    pair : Text,
    side : CommonTypes.TradeSide,
    quantity : Float,
    price : Float,
    requestedSlippageBps : Nat,
    callerPrincipal : Principal,
  ) : async CommonTypes.Result<Text, Text> {
    // Look up the pool canister for this pair
    let poolIdOpt = await lookupIcpSwapPool(pair);
    let poolId = switch (poolIdOpt) {
      case null return #err("ICPSwap: pool not found for pair " # pair);
      case (?id) id;
    };

    let pool : ICPSwapPool = actor(poolId);

    // Determine token addresses and swap direction
    // zeroForOne = true means selling token0 for token1
    let zeroForOne = switch (side) { case (#buy) false; case (#sell) true };

    // Token to deposit: use ICP_LEDGER_ID as default (production would resolve per pair)
    let inputTokenId = switch (side) {
      case (#buy) ICP_LEDGER_ID;
      case (#sell) CKBTC_ID;
    };

    let amountInNat = floatToNat8Dec(quantity);
    let expectedOutNat = floatToNat8Dec(quantity * price);
    let amountOutMinimum = applySlippage(expectedOutNat, requestedSlippageBps);

    let amountInStr = debug_show(amountInNat);
    let amountOutMinStr = debug_show(amountOutMinimum);

    // Step 1: Quote to verify expected output
    let quoteResult = try {
      await pool.quote({ zeroForOne; amountIn = amountInStr; amountOutMinimum = amountOutMinStr })
    } catch (e) {
      return #err("ICPSwap quote failed: " # e.message());
    };

    switch (quoteResult) {
      case (#Err(e)) return #err("ICPSwap quote error: " # e);
      case (#Ok(quotedOut)) {
        // Enforce on-chain slippage: if quote is below minimum, reject
        if (quotedOut < amountOutMinimum) {
          return #err("ICPSwap: quoted output " # debug_show(quotedOut) # " below amountOutMinimum " # debug_show(amountOutMinimum));
        };

        // Step 2: Deposit tokens into pool (requires prior ICRC2 approve by caller)
        let depositResult = try {
          await pool.depositFrom({ token = inputTokenId; amount = amountInNat; fee = 10_000 })
        } catch (e) {
          return #err("ICPSwap deposit failed: " # e.message());
        };

        switch (depositResult) {
          case (#Err(e)) return #err("ICPSwap deposit error: " # e);
          case (#Ok(_)) {
            // Step 3: Execute swap
            let swapResult = try {
              await pool.swap({ zeroForOne; amountIn = amountInStr; amountOutMinimum = amountOutMinStr })
            } catch (e) {
              // Swap failed after deposit — record for recovery
              return #err("ICPSwap swap call failed after deposit: " # e.message() # " — pending recovery needed");
            };

            switch (swapResult) {
              case (#Err(e)) return #err("ICPSwap swap error: " # e # " — pending recovery needed");
              case (#Ok(amountOut)) {
                // Step 4: Withdraw output tokens
                let outputTokenId = switch (side) {
                  case (#buy) CKBTC_ID;
                  case (#sell) ICP_LEDGER_ID;
                };
                let withdrawResult = try {
                  await pool.withdraw({ token = outputTokenId; amount = amountOut; fee = 10_000 })
                } catch (e) {
                  // Swap succeeded but withdraw failed — caller should record PendingWithdrawal
                  // Format: "...PENDING_WITHDRAWAL:<poolId>:<amount>:<tokenId>:<reason>"
                  return #err("ICPSwap withdraw failed — PENDING_WITHDRAWAL:" # poolId # ":" # debug_show(amountOut) # ":" # outputTokenId # ":" # e.message());
                };

                switch (withdrawResult) {
                  case (#Err(e)) return #err("ICPSwap withdraw error — PENDING_WITHDRAWAL:" # poolId # ":" # debug_show(amountOut) # ":" # outputTokenId # ":" # e);
                  case (#Ok(_)) {
                    // Deterministic execution reference for audit/reconciliation.
                    // TODO: replace with canonical explorer transaction id once exposed by DEX canisters.
                    let txHash = buildTxRef("icpswap:" # poolId, callerPrincipal, amountOut);
                    #ok(txHash);
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  // ---------------------------------------------------------------------------
  // ICPSwap recovery — attempt to reclaim tokens after a partial failure
  // Called by the retry timer in main.mo for PendingWithdrawal records.
  // ---------------------------------------------------------------------------

  public func recoverIcpSwapWithdrawal(
    poolId : Text,
    callerPrincipal : Principal,
    tokenId : Text,
    amount : Nat,
  ) : async CommonTypes.Result<Nat, Text> {
    let pool : ICPSwapPool = actor(poolId);

    // Check if any balance is available for recovery
    let unused = try {
      await pool.getUserUnusedBalance(callerPrincipal)
    } catch (e) {
      return #err("getUserUnusedBalance failed: " # e.message());
    };

    let available = unused.balance0; // balance0 = output token balance
    if (available == 0) {
      return #err("No unused balance to recover");
    };

    let withdrawAmount = if (amount > available) available else amount;
    let withdrawResult = try {
      await pool.withdraw({ token = tokenId; amount = withdrawAmount; fee = 10_000 })
    } catch (e) {
      return #err("Recovery withdraw failed: " # e.message());
    };

    switch (withdrawResult) {
      case (#Err(e)) #err("Recovery withdraw error: " # e);
      case (#Ok(recovered)) #ok(recovered);
    };
  };

  // ---------------------------------------------------------------------------
  // Sonic swap execution — real inter-canister calls
  //
  // Sonic Dapp: aanaa-xaaaa-aaaah-aaeiq-cai
  // Uses swapExactTokensForTokens — the standard Sonic swap path.
  //
  // Slippage is enforced on-chain: amountOutMin is calculated here,
  // capped at MAX_SLIPPAGE_BPS regardless of frontend input.
  // ---------------------------------------------------------------------------

  public func executeSonicSwap(
    pair : Text,
    side : CommonTypes.TradeSide,
    quantity : Float,
    price : Float,
    requestedSlippageBps : Nat,
    callerPrincipal : Principal,
  ) : async CommonTypes.Result<Text, Text> {
    let sonic : SonicDapp = actor(SONIC_DAPP_ID);

    // Resolve token canister IDs from pair symbol
    let parts = pair.split(#char '/').toArray();
    if (parts.size() < 2) return #err("Sonic: invalid pair format " # pair);

    // Default token resolution: ICP/USDT → ICP_LEDGER_ID / ckBTC (MVP mapping)
    let (tokenInId, tokenOutId) = switch (side) {
      case (#buy)  (ICP_LEDGER_ID, CKBTC_ID);
      case (#sell) (CKBTC_ID, ICP_LEDGER_ID);
    };

    let amountInNat   = floatToNat8Dec(quantity);
    let expectedOutNat = floatToNat8Dec(quantity * price);
    let amountOutMin  = applySlippage(expectedOutNat, requestedSlippageBps);

    // Sonic deadline: absolute Unix timestamp in seconds, 5 minutes from now
    let deadlineSeconds : Int = (Time.now() / 1_000_000_000) + 300;

    let result = try {
      await sonic.swapExactTokensForTokens(
        amountInNat,
        amountOutMin,
        [tokenInId, tokenOutId],
        callerPrincipal,
        deadlineSeconds,
      )
    } catch (e) {
      return #err("Sonic swap call failed: " # e.message());
    };

    switch (result) {
      case (#Err(e)) #err("Sonic swap error: " # e);
      case (#Ok(amounts)) {
        // amounts = [amountIn, ..., amountOut]; last element is tokens received
        let amountOut = if (amounts.size() > 0) amounts[amounts.size() - 1] else 0;
        let txHash = buildTxRef("sonic:" # SONIC_DAPP_ID, callerPrincipal, amountOut);
        #ok(txHash);
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Main entry point — try ICPSwap first, fall back to Sonic
  // ---------------------------------------------------------------------------

  public func executeRealSwap(
    pair : Text,
    side : CommonTypes.TradeSide,
    quantity : Float,
    price : Float,
    requestedSlippageBps : Nat,
    callerPrincipal : Principal,
  ) : async CommonTypes.Result<SwapResult, Text> {
    let icpResult = await executeIcpSwapSwap(pair, side, quantity, price, requestedSlippageBps, callerPrincipal);
    switch icpResult {
      case (#ok txHash) {
        #ok({ txHash; filledQty = quantity; fillPrice = price });
      };
      case (#err icpErr) {
        // If the error contains PENDING_WITHDRAWAL, do not try Sonic —
        // the swap already executed but withdraw failed. Propagate to caller.
        if (icpErr.contains(#text "PENDING_WITHDRAWAL")) {
          return #err(icpErr);
        };

        // ICPSwap failed before swap — fall back to Sonic
        let sonicResult = await executeSonicSwap(pair, side, quantity, price, requestedSlippageBps, callerPrincipal);
        switch sonicResult {
          case (#ok txHash) {
            #ok({ txHash; filledQty = quantity; fillPrice = price });
          };
          case (#err sonicErr) {
            #err(
              "All DEX attempts failed. " #
              "ICPSwap: " # icpErr # "; " #
              "Sonic: " # sonicErr
            );
          };
        };
      };
    };
  };
};
