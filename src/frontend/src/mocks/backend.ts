import type { backendInterface } from "../backend";
import {
  ChallengePhase,
  ChallengeStatus,
  ExecutionType,
  RiskLevel,
  TradeSide,
  TraderMode,
  UserRole,
  UserRole__1,
  DexSource,
  OrderStatus,
  ValidationStatus,
} from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const mockPrincipal = Principal.fromText("aaaaa-aa");

const mockPhaseParams = {
  timeLimitDays: BigInt(30),
  maxTotalDrawdown: 10.0,
  minTradingDays: BigInt(5),
  profitTarget: 8.0,
  maxDailyDrawdown: 4.0,
  minConsistencyScore: 60.0,
};

const mockAdminParams = {
  challengeCheckIntervalSecs: BigInt(300),
  pricePollingIntervalSecs: BigInt(30),
  baseFee: 1.0,
  maxTraderSharePct: 80.0,
  perTradeLimitPct: 2.0,
  dailyDrawdownLimitPct: 4.0,
  baseAllocationAmount: 10000.0,
  updatedAt: BigInt(Date.now() * 1_000_000),
  platformFeePct: 5.0,
  investorPoolSharePct: 20.0,
  traderBaseSharePct: 70.0,
  targetProfitPct: 10.0,
  slCheckIntervalSecs: BigInt(60),
  tradingPaused: false,
  totalDrawdownLimitPct: 10.0,
  riskLevel: RiskLevel.medium,
  defaultPhase1: mockPhaseParams,
  defaultPhase2: { ...mockPhaseParams, profitTarget: 5.0, timeLimitDays: BigInt(60), minConsistencyScore: 65.0 },
  maxAllocationCap: 100000.0,
  performanceFee: 15.0,
};

const mockChallenge1 = {
  id: BigInt(1),
  startTime: BigInt(Date.now() * 1_000_000),
  status: ChallengeStatus.active,
  currentBalance: 10450,
  trades: [BigInt(42), BigInt(43)],
  perTradeLimitPct: 2.0,
  dailyDrawdownLimitPct: 4.0,
  traderPrincipal: mockPrincipal,
  startingBalance: 10000,
  targetProfitPct: 10.0,
  totalDrawdownLimitPct: 10.0,
  riskLevel: RiskLevel.medium,
  phase: ChallengePhase.phase1,
  consistencyScore: 72.5,
};

const mockChallenge2 = {
  id: BigInt(2),
  startTime: BigInt((Date.now() - 86400000) * 1_000_000),
  status: ChallengeStatus.passed,
  currentBalance: 11200,
  trades: [BigInt(10), BigInt(11), BigInt(12)],
  perTradeLimitPct: 1.5,
  dailyDrawdownLimitPct: 3.0,
  traderPrincipal: mockPrincipal,
  startingBalance: 10000,
  targetProfitPct: 10.0,
  totalDrawdownLimitPct: 8.0,
  riskLevel: RiskLevel.low,
  phase: ChallengePhase.phase2,
  consistencyScore: 84.0,
};

const mockTraderProfile = {
  principal: mockPrincipal,
  mode: TraderMode.evaluation,
  role: UserRole.trader,
  activeChallengeId: BigInt(1),
  username: "trader_alpha",
  tenureMonths: BigInt(3),
  totalPayouts: 1250.0,
};

export const mockBackend: backendInterface = {
  _initializeAccessControl: async () => undefined,

  assignCallerUserRole: async (_user, _role) => undefined,

  cancelOrder: async (_tradeId) => ({ __kind__: "ok", ok: null }),

  closePosition: async (tradeId, _partialSize) => ({
    __kind__: "ok",
    ok: {
      dex: DexSource.icpSwap,
      status: OrderStatus.closed,
      traderId: mockPrincipal,
      currentPrice: 43300.0,
      direction: TradeSide.buy,
      entryTime: BigInt(Date.now() * 1_000_000),
      pair: "BTC/USDT",
      size: 0.1,
      tradeId,
      realizedPnl: 49.25,
      entryPrice: 43250.75,
      unrealizedPnl: 0,
      simulatedFill: true,
    },
  }),

  createCohort: async (name, phase1, phase2) => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      active: true,
      name,
      createdDate: BigInt(Date.now() * 1_000_000),
      lastModified: BigInt(Date.now() * 1_000_000),
      phase1,
      phase2,
    },
  }),

  enterChallenge: async (_startingBalance, _targetProfitPct, _riskLevel) => ({
    __kind__: "ok",
    ok: {
      ...mockChallenge1,
      trades: [],
      currentBalance: _startingBalance,
      startingBalance: _startingBalance,
      targetProfitPct: _targetProfitPct,
      riskLevel: _riskLevel,
    },
  }),

  executeTrade: async (_challengeId, pair, side, quantity) => ({
    __kind__: "ok",
    ok: {
      id: BigInt(42),
      pnl: 125.5,
      pair,
      side,
      traderPrincipal: mockPrincipal,
      fillPrice: 43250.75,
      timestamp: BigInt(Date.now() * 1_000_000),
      txHash: undefined,
      quantity,
      riskCheckPassed: true,
      executionType: ExecutionType.simulated,
    },
  }),

  forceChallenge: async (_challengeId, status, _reason) => ({
    __kind__: "ok",
    ok: { ...mockChallenge1, status },
  }),

  getAdminParams: async () => mockAdminParams,

  getAllChallenges: async () => [mockChallenge1, mockChallenge2],

  getAllCohorts: async () => [
    {
      id: BigInt(1),
      active: true,
      name: "Cohort Alpha",
      createdDate: BigInt(Date.now() * 1_000_000),
      lastModified: BigInt(Date.now() * 1_000_000),
      phase1: mockPhaseParams,
      phase2: { ...mockPhaseParams, profitTarget: 5.0, timeLimitDays: BigInt(60), minConsistencyScore: 65.0 },
    },
  ],

  getAuditLog: async (_limit) => [
    {
      principal: mockPrincipal,
      action: "enterChallenge",
      timestamp: BigInt(Date.now() * 1_000_000),
      details: "Challenge #1 started with $10,000 balance",
    },
    {
      principal: mockPrincipal,
      action: "executeTrade",
      timestamp: BigInt((Date.now() - 3600000) * 1_000_000),
      details: "BTC/USDT BUY 0.1 @ 43250.75, PnL: +$125.50",
    },
    {
      principal: mockPrincipal,
      action: "setAdminParams",
      timestamp: BigInt((Date.now() - 7200000) * 1_000_000),
      details: "Target profit updated to 10%, risk level: medium",
    },
  ],

  getCallerUserRole: async () => UserRole__1.admin,

  getConsistencyScoreHistory: async (_limit) => [
    {
      traderId: mockPrincipal,
      activityScore: 85.0,
      score: 72.5,
      winRateScore: 68.0,
      timestamp: BigInt(Date.now() * 1_000_000),
      phase: ChallengePhase.phase1,
      profitDistScore: 75.0,
      drawdownCtrlScore: 80.0,
    },
  ],

  getFundedTraderList: async () => [
    {
      status: "active",
      traderId: mockPrincipal,
      username: "trader_alpha",
      monthlyReturn: 4.2,
      allocation: 25000,
      consistencyScore: 84.0,
    },
    {
      status: "active",
      traderId: Principal.fromText("aaaaa-aa"),
      username: "trader_beta",
      monthlyReturn: 3.8,
      allocation: 20000,
      consistencyScore: 79.5,
    },
  ],

  getInvestorStats: async () => ({
    __kind__: "ok",
    ok: {
      totalAllocated: 150000,
      ytdReturn: 18.5,
      traderCount: BigInt(24),
      poolBalance: 200000,
      monthlyReturn: 3.2,
      weeklyReturn: 0.8,
      fundedTraderCount: BigInt(8),
      avgConsistency: 76.4,
    },
  }),

  getLeaderboard: async (_sortBy, _timePeriodDays, _limit) => [
    {
      traderId: mockPrincipal,
      username: "trader_alpha",
      lastTradeTime: BigInt(Date.now() * 1_000_000),
      tradeCount: BigInt(48),
      rank: BigInt(1),
      profitPct: 12.4,
      funded: true,
      phase: ChallengePhase.funded,
      riskScore: 82.0,
      consistencyScore: 88.5,
    },
    {
      traderId: mockPrincipal,
      username: "trader_beta",
      lastTradeTime: BigInt((Date.now() - 3600000) * 1_000_000),
      tradeCount: BigInt(35),
      rank: BigInt(2),
      profitPct: 9.8,
      funded: false,
      phase: ChallengePhase.phase2,
      riskScore: 74.0,
      consistencyScore: 79.2,
    },
    {
      traderId: mockPrincipal,
      username: "trader_gamma",
      lastTradeTime: BigInt((Date.now() - 7200000) * 1_000_000),
      tradeCount: BigInt(22),
      rank: BigInt(3),
      profitPct: 7.1,
      funded: false,
      phase: ChallengePhase.phase1,
      riskScore: 68.0,
      consistencyScore: 71.8,
    },
  ],

  getLivePrice: async (pair) => ({
    __kind__: "ok",
    ok: {
      source: "ICPSwap",
      pair,
      timestamp: BigInt(Date.now() * 1_000_000),
      price: pair.includes("BTC") ? 43250.75 : pair.includes("ETH") ? 2680.42 : 1.0,
    },
  }),

  getMyChallenge: async () => ({
    __kind__: "ok",
    ok: mockChallenge1,
  }),

  getMyClosedPositions: async (_limit) => [
    {
      dex: DexSource.icpSwap,
      status: OrderStatus.closed,
      exitTime: BigInt((Date.now() - 3600000) * 1_000_000),
      traderId: mockPrincipal,
      currentPrice: 43300.0,
      direction: TradeSide.buy,
      entryTime: BigInt((Date.now() - 7200000) * 1_000_000),
      pair: "BTC/USDT",
      size: 0.1,
      tradeId: BigInt(40),
      realizedPnl: 49.25,
      entryPrice: 43250.75,
      unrealizedPnl: 0,
      simulatedFill: true,
    },
  ],

  getMyConsistencyScore: async () => ({
    __kind__: "ok",
    ok: {
      traderId: mockPrincipal,
      activityScore: 85.0,
      score: 72.5,
      winRateScore: 68.0,
      timestamp: BigInt(Date.now() * 1_000_000),
      phase: ChallengePhase.phase1,
      profitDistScore: 75.0,
      drawdownCtrlScore: 80.0,
    },
  }),

  getMyConsistencyScoreSummary: async () => ({
    __kind__: "ok",
    ok: {
      traderId: mockPrincipal,
      activityScore: 85.0,
      score: 72.5,
      winRateScore: 68.0,
      timestamp: BigInt(Date.now() * 1_000_000),
      phase: ChallengePhase.phase1,
      profitDistScore: 75.0,
      drawdownCtrlScore: 80.0,
    },
  }),

  getMyFundedAccount: async () => ({
    __kind__: "ok",
    ok: {
      traderId: mockPrincipal,
      monthsActive: BigInt(3),
      accountBalance: 27500,
      performanceMultiplier: 1.2,
      unrealizedPnl: 450.25,
      nextReviewDate: BigInt((Date.now() + 30 * 86400000) * 1_000_000),
      allocationCurrent: 25000,
      lastReviewDate: BigInt((Date.now() - 30 * 86400000) * 1_000_000),
      allocationBase: 20000,
    },
  }),

  getMyOpenPositions: async () => [
    {
      dex: DexSource.icpSwap,
      status: OrderStatus.open,
      traderId: mockPrincipal,
      currentPrice: 43300.0,
      direction: TradeSide.buy,
      entryTime: BigInt(Date.now() * 1_000_000),
      pair: "BTC/USDT",
      size: 0.1,
      tradeId: BigInt(42),
      realizedPnl: 0,
      entryPrice: 43250.75,
      unrealizedPnl: 49.25,
      simulatedFill: true,
    },
    {
      dex: DexSource.sonic,
      status: OrderStatus.open,
      traderId: mockPrincipal,
      currentPrice: 2690.0,
      direction: TradeSide.buy,
      entryTime: BigInt((Date.now() - 1800000) * 1_000_000),
      pair: "ETH/USDT",
      size: 0.5,
      tradeId: BigInt(43),
      realizedPnl: 0,
      entryPrice: 2680.42,
      unrealizedPnl: 4.79,
      simulatedFill: true,
    },
  ],

  getMyPhaseStatus: async () => ({
    __kind__: "ok",
    ok: {
      consistencyProgress: 72.5,
      phase: ChallengePhase.phase1,
      timeRemainingDays: BigInt(18),
      profitProgress: 45.0,
    },
  }),

  getMyProfile: async () => ({
    __kind__: "ok",
    ok: mockTraderProfile,
  }),

  getMyTrades: async (_limit) => [
    {
      id: BigInt(42),
      pnl: 125.5,
      pair: "BTC/USDT",
      side: TradeSide.buy,
      traderPrincipal: mockPrincipal,
      fillPrice: 43250.75,
      timestamp: BigInt(Date.now() * 1_000_000),
      txHash: undefined,
      quantity: 0.1,
      riskCheckPassed: true,
      executionType: ExecutionType.simulated,
    },
    {
      id: BigInt(43),
      pnl: -42.3,
      pair: "ETH/USDT",
      side: TradeSide.sell,
      traderPrincipal: mockPrincipal,
      fillPrice: 2680.42,
      timestamp: BigInt((Date.now() - 3600000) * 1_000_000),
      txHash: undefined,
      quantity: 0.5,
      riskCheckPassed: true,
      executionType: ExecutionType.simulated,
    },
    {
      id: BigInt(44),
      pnl: 310.0,
      pair: "BTC/USDT",
      side: TradeSide.buy,
      traderPrincipal: mockPrincipal,
      fillPrice: 42900.0,
      timestamp: BigInt((Date.now() - 7200000) * 1_000_000),
      txHash: undefined,
      quantity: 0.2,
      riskCheckPassed: true,
      executionType: ExecutionType.simulated,
    },
  ],

  getPayoutHistory: async (_startTime, _endTime, _limit) => [
    {
      status: "paid",
      traderId: mockPrincipal,
      closeTime: BigInt((Date.now() - 86400000) * 1_000_000),
      consistencyBonus: 50.0,
      platformShare: 62.5,
      tenureBonus: 25.0,
      traderPct: 75.0,
      traderShare: 562.5,
      investorShare: 125.0,
      tradeId: BigInt(40),
      profitAmount: 750.0,
    },
    {
      status: "paid",
      traderId: mockPrincipal,
      closeTime: BigInt((Date.now() - 172800000) * 1_000_000),
      consistencyBonus: 30.0,
      platformShare: 42.5,
      tenureBonus: 15.0,
      traderPct: 70.0,
      traderShare: 350.0,
      investorShare: 107.5,
      tradeId: BigInt(38),
      profitAmount: 500.0,
    },
  ],

  getPayoutStats: async () => ({
    __kind__: "ok",
    ok: {
      totalPlatformRevenue: 1250.0,
      totalInvestorPayouts: 3750.0,
      totalTraderPayouts: 12500.0,
      platformFeeBalance: 1250.0,
      investorPoolBalance: 50000.0,
    },
  }),

  getPriceSnapshot: async (pair, _dex) => ({
    ask: pair.includes("BTC") ? 43260.0 : 2682.0,
    bid: pair.includes("BTC") ? 43240.0 : 2678.0,
    dex: DexSource.icpSwap,
    last: pair.includes("BTC") ? 43250.75 : 2680.42,
    pair,
    volume: pair.includes("BTC") ? 1250000 : 850000,
    stale: false,
    timestamp: BigInt(Date.now() * 1_000_000),
  }),

  getTargetOutcomes: async (_cohortId) => ({
    __kind__: "ok",
    ok: {
      consistencyTarget: 70.0,
      actualPassRate: 62.5,
      lastUpdated: BigInt(Date.now() * 1_000_000),
      passRateTarget: 60.0,
      returnTarget: 8.0,
      actualReturn: 7.2,
      actualConsistency: 68.4,
      cohortId: BigInt(1),
    },
  }),

  getTraderAllocation: async (_traderId) => ({
    __kind__: "ok",
    ok: {
      multiplier: 1.2,
      base: 20000,
      history: [],
      current: 25000,
    },
  }),

  getTraderPublicProfile: async (traderId) => ({
    leaderboardEntry: {
      traderId,
      username: "trader_alpha",
      lastTradeTime: BigInt(Date.now() * 1_000_000),
      tradeCount: BigInt(48),
      rank: BigInt(1),
      profitPct: 12.4,
      funded: true,
      phase: ChallengePhase.funded,
      riskScore: 82.0,
      consistencyScore: 88.5,
    },
    recentTrades: [],
    consistencyHistory: [],
  }),

  isCallerAdmin: async () => true,

  openPosition: async (pair, direction, size, _slippage, _stopLoss, _takeProfit) => ({
    __kind__: "ok",
    ok: {
      dex: DexSource.icpSwap,
      status: OrderStatus.open,
      traderId: mockPrincipal,
      currentPrice: pair.includes("BTC") ? 43250.75 : 2680.42,
      direction,
      entryTime: BigInt(Date.now() * 1_000_000),
      pair,
      size,
      tradeId: BigInt(Date.now()),
      realizedPnl: 0,
      entryPrice: pair.includes("BTC") ? 43250.75 : 2680.42,
      unrealizedPnl: 0,
      simulatedFill: true,
    },
  }),

  overrideParams: async (params) => ({
    __kind__: "ok",
    ok: params,
  }),

  registerTrader: async () => ({
    __kind__: "ok",
    ok: {
      ...mockTraderProfile,
      activeChallengeId: undefined,
    },
  }),

  setAdminParams: async (_targetProfitPct, riskLevel) => ({
    __kind__: "ok",
    ok: {
      ...mockAdminParams,
      targetProfitPct: _targetProfitPct,
      riskLevel,
      updatedAt: BigInt(Date.now() * 1_000_000),
    },
  }),

  setPauseTrading: async (_paused) => ({ __kind__: "ok", ok: null }),

  setTargetOutcomes: async (cohortId, passRateTarget, returnTarget, consistencyTarget) => ({
    __kind__: "ok",
    ok: {
      consistencyTarget,
      actualPassRate: 62.5,
      lastUpdated: BigInt(Date.now() * 1_000_000),
      passRateTarget,
      returnTarget,
      actualReturn: 7.2,
      actualConsistency: 68.4,
      cohortId,
    },
  }),

  suggestParamAdjustments: async (_cohortId) => ({
    __kind__: "ok",
    ok: [
      {
        metric: "profitTarget",
        suggested: 9.0,
        current: 10.0,
        reason: "Pass rate below target — consider lowering profit target",
      },
      {
        metric: "minConsistencyScore",
        suggested: 55.0,
        current: 60.0,
        reason: "Consistency threshold may be too high for current trader pool",
      },
    ],
  }),

  transform: async (input) => ({
    status: input.response.status,
    body: input.response.body,
    headers: input.response.headers,
  }),

  triggerMonthlyReview: async () => ({
    __kind__: "ok",
    ok: {
      reviewedCount: BigInt(8),
      changes: [],
    },
  }),

  updateCohortParams: async (cohortId, phase1, phase2) => ({
    __kind__: "ok",
    ok: {
      id: cohortId,
      active: true,
      name: "Cohort Alpha",
      createdDate: BigInt(Date.now() * 1_000_000),
      lastModified: BigInt(Date.now() * 1_000_000),
      phase1: phase1 ?? mockPhaseParams,
      phase2: phase2 ?? { ...mockPhaseParams, profitTarget: 5.0, timeLimitDays: BigInt(60) },
    },
  }),

  validateTradeRequest: async (_pair, _direction, _size, _slippage) => ({
    status: ValidationStatus.approved,
    reasons: [],
    estimatedImpact: 0.15,
  }),

  depositToPool: async (_amount) => ({
    __kind__: "ok",
    ok: { shares: BigInt(100), poolBalance: _amount },
  }),

  withdrawFromPool: async (_amount) => ({
    __kind__: "ok",
    ok: { withdrawn: _amount, remainingShares: BigInt(0) },
  }),

  getMyInvestorBalance: async () => ({
    __kind__: "ok",
    ok: {
      shares: BigInt(0),
      sharePrice: 1.0,
      poolValue: 0.0,
      poolBalance: 0.0,
      totalShares: BigInt(0),
    },
  }),

  getInvestorPoolSummary: async () => ({
    __kind__: "ok",
    ok: {
      poolBalance: 0.0,
      platformFeeBalance: 0.0,
      investorCount: BigInt(0),
      totalShares: BigInt(0),
    },
  }),

  retryPendingWithdrawals: async () => undefined,

  setAdminPrincipal: async (_newAdmin) => ({ __kind__: "ok", ok: null }),

  withdrawPlatformFees: async (amount) => ({ __kind__: "ok", ok: amount }),
};
