# Production Readiness Plan (No-Token Launch)

This plan operationalizes the 7 phases previously outlined and tracks concrete implementation progress in this repository.

## Phase 0 — Scope and architecture lock
- [x] Adopt **position-first execution** as the canonical trade path in the frontend integration.
- [x] Keep `executeTrade` available for compatibility, but route primary UX through `openPosition` + `closePosition` lifecycle.
- [ ] Publish explicit endpoint-role matrix (admin/trader/investor) in docs.

## Phase 1 — Trading and DEX integration hardening
- [x] Frontend execution path updated to call `openPosition` (single path shared with positions UI).
- [x] Frontend now passes backend slippage and optional SL/TP in the canonical call.
- [x] Added funded-mode preflight approval notice in trade UX to reduce failed deposit attempts.
- [ ] Implement deterministic pair-to-token registry used by all DEX adapters.
- [ ] Replace synthetic tx references with canonical chain references.
- [ ] Add frontend approval/allowance UX for ICRC2 before funded swaps.

## Phase 2 — Price/oracle reliability
- [ ] Replace string-substring JSON extraction with typed/structured decoding.
- [ ] Add endpoint contract tests per DEX source (symbol vs canister-id paths).
- [x] Backend pair support validation now rejects unsupported symbols at `getLivePrice` and `openPosition`.
- [ ] Fail-fast behavior for stale/invalid prices already enforced at trade-submit UI boundary; backend stale hard fail to be expanded.

## Phase 3 — Lifecycle consistency
- [x] Trade form now opens positions through the same backend model used by open/closed positions pages.
- [x] Success UX updated from immediate closed-trade semantics to position-open semantics.
- [x] Deprecated `executeTrade` endpoint now explicitly returns a migration error directing clients to `openPosition/closePosition`.

## Phase 4 — Settlement and treasury realism
- [ ] Replace accounting-only deposit/withdraw paths with ledger-integrated transfers.
- [ ] Implement on-chain transfer for platform fee withdrawals.
- [ ] Add reconciliation job and invariant report endpoint.

## Phase 5 — Roles and security hardening
- [ ] Introduce explicit investor role in shared type system and authorization checks.
- [ ] Restrict bootstrap/admin assignment surface after initialization.
- [x] Added backend endpoint-role matrix query for operational/UI authorization alignment.
- [ ] Add privileged-action audit policy doc and tests.

## Phase 6 — Metrics truthfulness
- [x] Investor weekly/monthly/YTD return fields now computed from payout records over time windows.
- [ ] Extend metrics model with NAV normalization and deposit/withdraw-adjusted returns.
- [ ] Add risk-score replacement for placeholder formula in profile snapshot endpoint.

## Phase 7 — Validation and launch readiness
- [ ] Add backend integration tests for open/close flows, payout split accounting, and role gates.
- [ ] Add staging dry-run checklist and signoff template.
- [ ] Run full build/typecheck across backend/frontend CI.

## Implemented hardening artifacts in this cycle
1. Canonical lifecycle enforcement in frontend (`openPosition` path).
2. Deprecated `executeTrade` path at backend API boundary.
3. Investor return windows computed from payout records.
4. Reconciliation report endpoint for accounting drift visibility.
5. Endpoint-role matrix endpoint for auth alignment.

## Immediate next sprint recommendations
1. Pair/token registry + DEX adapter normalization (P0).
2. Ledger-backed pool settlement and platform fee transfers (P0).
3. Investor role introduction + endpoint permission matrix (P1).
4. Automated integration tests for position lifecycle and payout accounting (P1).
