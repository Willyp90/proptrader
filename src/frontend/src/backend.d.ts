import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    traderId: Principal;
    username: string;
    lastTradeTime: bigint;
    tradeCount: bigint;
    rank: bigint;
    profitPct: number;
    funded: boolean;
    phase: ChallengePhase;
    riskScore: number;
    consistencyScore: number;
}
export type Result_2 = {
    __kind__: "ok";
    ok: CohortParams;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Result_17 = {
    __kind__: "ok";
    ok: PriceData;
} | {
    __kind__: "err";
    err: string;
};
export type Result_13 = {
    __kind__: "ok";
    ok: {
        sharePrice: number;
        poolValue: number;
        shares: bigint;
        poolBalance: number;
        totalShares: bigint;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface PayoutRecord {
    status: string;
    traderId: Principal;
    closeTime: bigint;
    consistencyBonus: number;
    platformShare: number;
    tenureBonus: number;
    traderPct: number;
    traderShare: number;
    investorShare: number;
    tradeId: bigint;
    profitAmount: number;
}
export interface InvestorStats {
    totalAllocated: number;
    ytdReturn: number;
    traderCount: bigint;
    poolBalance: number;
    monthlyReturn: number;
    weeklyReturn: number;
    fundedTraderCount: bigint;
    avgConsistency: number;
}
export type Result_5 = {
    __kind__: "ok";
    ok: TargetOutcome;
} | {
    __kind__: "err";
    err: string;
};
export type Result_16 = {
    __kind__: "ok";
    ok: Challenge;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: {
        remainingShares: bigint;
        withdrawn: number;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface AuditEntry {
    principal: Principal;
    action: string;
    timestamp: bigint;
    details: string;
}
export interface Challenge {
    id: bigint;
    startTime: bigint;
    status: ChallengeStatus;
    currentBalance: number;
    trades: Array<bigint>;
    phase2StartTime?: bigint;
    perTradeLimitPct: number;
    dailyDrawdownLimitPct: number;
    fundedAllocation?: number;
    traderPrincipal: Principal;
    phase1StartTime?: bigint;
    phase1EndTime?: bigint;
    startingBalance: number;
    targetProfitPct: number;
    phase: ChallengePhase;
    totalDrawdownLimitPct: number;
    phase2EndTime?: bigint;
    riskLevel: RiskLevel;
    consistencyScore: number;
    cohortId?: bigint;
}
export type Result_4 = {
    __kind__: "ok";
    ok: Array<{
        metric: string;
        suggested: number;
        current: number;
        reason: string;
    }>;
} | {
    __kind__: "err";
    err: string;
};
export type Result_11 = {
    __kind__: "ok";
    ok: {
        totalPlatformRevenue: number;
        totalInvestorPayouts: number;
        totalTraderPayouts: number;
        platformFeeBalance: number;
        investorPoolBalance: number;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface AdminParams {
    challengeCheckIntervalSecs: bigint;
    pricePollingIntervalSecs: bigint;
    baseFee: number;
    maxTraderSharePct: number;
    perTradeLimitPct: number;
    dailyDrawdownLimitPct: number;
    baseAllocationAmount: number;
    updatedAt: bigint;
    platformFeePct: number;
    investorPoolSharePct: number;
    traderBaseSharePct: number;
    targetProfitPct: number;
    slCheckIntervalSecs: bigint;
    tradingPaused: boolean;
    totalDrawdownLimitPct: number;
    riskLevel: RiskLevel;
    defaultPhase1: PhaseParams;
    defaultPhase2: PhaseParams;
    maxAllocationCap: number;
    performanceFee: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type Result_19 = {
    __kind__: "ok";
    ok: {
        investorCount: bigint;
        poolBalance: number;
        platformFeeBalance: number;
        totalShares: bigint;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface FundedAccount {
    traderId: Principal;
    monthsActive: bigint;
    accountBalance: number;
    performanceMultiplier: number;
    unrealizedPnl: number;
    nextReviewDate: bigint;
    allocationCurrent: number;
    lastReviewDate: bigint;
    allocationBase: number;
}
export type Result_7 = {
    __kind__: "ok";
    ok: AdminParams;
} | {
    __kind__: "err";
    err: string;
};
export type Result_14 = {
    __kind__: "ok";
    ok: FundedAccount;
} | {
    __kind__: "err";
    err: string;
};
export interface PhaseParams {
    timeLimitDays: bigint;
    maxTotalDrawdown: number;
    minTradingDays: bigint;
    profitTarget: number;
    maxDailyDrawdown: number;
    minConsistencyScore: number;
}
export interface CohortParams {
    id: bigint;
    active: boolean;
    modifiedBy?: Principal;
    name: string;
    createdDate: bigint;
    lastModified: bigint;
    phase1: PhaseParams;
    phase2: PhaseParams;
}
export interface AllocationChange {
    oldAllocation: number;
    traderId: Principal;
    reviewedBy?: Principal;
    newAllocation: number;
    timestamp: bigint;
    reason: string;
}
export interface PriceData {
    source: string;
    pair: string;
    timestamp: bigint;
    price: number;
}
export interface PriceCache {
    ask: number;
    bid: number;
    dex: DexSource;
    last: number;
    pair: string;
    volume: number;
    stale: boolean;
    timestamp: bigint;
}
export type Result_6 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface Trade {
    id: bigint;
    pnl: number;
    pair: string;
    side: TradeSide;
    traderPrincipal: Principal;
    fillPrice: number;
    timestamp: bigint;
    txHash?: string;
    quantity: number;
    riskCheckPassed: boolean;
    executionType: ExecutionType;
}
export type Result_21 = {
    __kind__: "ok";
    ok: {
        shares: bigint;
        poolBalance: number;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_12 = {
    __kind__: "ok";
    ok: {
        consistencyProgress: number;
        phase: ChallengePhase;
        timeRemainingDays: bigint;
        profitProgress: number;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_9 = {
    __kind__: "ok";
    ok: Position;
} | {
    __kind__: "err";
    err: string;
};
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TraderProfile {
    principal: Principal;
    username: string;
    mode: TraderMode;
    role: UserRole;
    fundedAccount?: FundedAccount;
    activeChallengeId?: bigint;
    tenureMonths: bigint;
    totalPayouts: number;
}
export interface TargetOutcome {
    consistencyTarget: number;
    actualPassRate: number;
    lastUpdated: bigint;
    passRateTarget: number;
    returnTarget: number;
    actualReturn: number;
    actualConsistency: number;
    cohortId: bigint;
}
export type Result_18 = {
    __kind__: "ok";
    ok: InvestorStats;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: {
        reviewedCount: bigint;
        changes: Array<AllocationChange>;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_10 = {
    __kind__: "ok";
    ok: {
        multiplier: number;
        base: number;
        history: Array<AllocationChange>;
        current: number;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result = {
    __kind__: "ok";
    ok: number;
} | {
    __kind__: "err";
    err: string;
};
export type Result_8 = {
    __kind__: "ok";
    ok: TraderProfile;
} | {
    __kind__: "err";
    err: string;
};
export type Result_15 = {
    __kind__: "ok";
    ok: ConsistencyScore;
} | {
    __kind__: "err";
    err: string;
};
export interface ValidationResult {
    status: ValidationStatus;
    reasons: Array<string>;
    estimatedImpact: number;
}
export interface Position {
    dex: DexSource;
    status: OrderStatus;
    exitTime?: bigint;
    traderId: Principal;
    currentPrice: number;
    direction: TradeSide;
    entryTime: bigint;
    takeProfit?: number;
    pair: string;
    size: number;
    tradeId: bigint;
    realizedPnl: number;
    stopLoss?: number;
    entryPrice: number;
    unrealizedPnl: number;
    simulatedFill: boolean;
}
export interface ConsistencyScore {
    traderId: Principal;
    activityScore: number;
    score: number;
    winRateScore: number;
    timestamp: bigint;
    phase: ChallengePhase;
    profitDistScore: number;
    drawdownCtrlScore: number;
}
export type Result_20 = {
    __kind__: "ok";
    ok: Trade;
} | {
    __kind__: "err";
    err: string;
};
export enum ChallengePhase {
    notStarted = "notStarted",
    funded = "funded",
    phase1 = "phase1",
    phase2 = "phase2"
}
export enum ChallengeStatus {
    active = "active",
    failed = "failed",
    passed = "passed",
    paused = "paused"
}
export enum DexSource {
    icpSwap = "icpSwap",
    sonic = "sonic"
}
export enum ExecutionType {
    simulated = "simulated",
    real = "real"
}
export enum OrderStatus {
    closed = "closed",
    cancelled = "cancelled",
    open = "open",
    filled = "filled",
    liquidated = "liquidated",
    pendingFill = "pendingFill"
}
export enum RiskLevel {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum TradeSide {
    buy = "buy",
    sell = "sell"
}
export enum TraderMode {
    evaluation = "evaluation",
    funded = "funded"
}
export enum UserRole {
    admin = "admin",
    trader = "trader"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum ValidationStatus {
    conditional = "conditional",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    cancelOrder(tradeId: bigint): Promise<Result_6>;
    closePosition(tradeId: bigint, partialSize: number | null): Promise<Result_9>;
    createCohort(name: string, phase1: PhaseParams, phase2: PhaseParams): Promise<Result_2>;
    depositToPool(amount: number): Promise<Result_21>;
    enterChallenge(startingBalance: number, targetProfitPct: number, riskLevel: RiskLevel): Promise<Result_16>;
    executeTrade(challengeId: bigint, pair: string, side: TradeSide, quantity: number): Promise<Result_20>;
    forceChallenge(challengeId: bigint, status: ChallengeStatus, reason: string): Promise<Result_16>;
    getAdminParams(): Promise<AdminParams>;
    getAllChallenges(): Promise<Array<Challenge>>;
    getAllCohorts(): Promise<Array<CohortParams>>;
    getAuditLog(limit: bigint): Promise<Array<AuditEntry>>;
    getCallerUserRole(): Promise<UserRole__1>;
    getConsistencyScoreHistory(limit: bigint): Promise<Array<ConsistencyScore>>;
    getFundedTraderList(): Promise<Array<{
        status: string;
        traderId: Principal;
        username: string;
        monthlyReturn: number;
        allocation: number;
        consistencyScore: number;
    }>>;
    getInvestorPoolSummary(): Promise<Result_19>;
    getInvestorStats(): Promise<Result_18>;
    getLeaderboard(sortBy: string, timePeriodDays: bigint, limit: bigint): Promise<Array<LeaderboardEntry>>;
    getLivePrice(pair: string): Promise<Result_17>;
    getMyChallenge(): Promise<Result_16>;
    getMyClosedPositions(limit: bigint): Promise<Array<Position>>;
    getMyConsistencyScore(): Promise<Result_15>;
    getMyConsistencyScoreSummary(): Promise<Result_15>;
    getMyFundedAccount(): Promise<Result_14>;
    getMyInvestorBalance(): Promise<Result_13>;
    getMyOpenPositions(): Promise<Array<Position>>;
    getMyPhaseStatus(): Promise<Result_12>;
    getMyProfile(): Promise<Result_8>;
    getMyTrades(limit: bigint): Promise<Array<Trade>>;
    getPayoutHistory(startTime: bigint | null, endTime: bigint | null, limit: bigint): Promise<Array<PayoutRecord>>;
    getPayoutStats(): Promise<Result_11>;
    getPriceSnapshot(pair: string, dex: DexSource): Promise<PriceCache | null>;
    getTargetOutcomes(cohortId: bigint): Promise<Result_5>;
    getTraderAllocation(traderId: Principal): Promise<Result_10>;
    getTraderPublicProfile(traderId: Principal): Promise<{
        leaderboardEntry: LeaderboardEntry;
        recentTrades: Array<Trade>;
        consistencyHistory: Array<ConsistencyScore>;
    } | null>;
    isCallerAdmin(): Promise<boolean>;
    openPosition(pair: string, direction: TradeSide, size: number, slippageBps: bigint, stopLoss: number | null, takeProfit: number | null): Promise<Result_9>;
    overrideParams(params: AdminParams): Promise<Result_7>;
    registerTrader(): Promise<Result_8>;
    retryPendingWithdrawals(): Promise<void>;
    setAdminParams(targetProfitPct: number, riskLevel: RiskLevel): Promise<Result_7>;
    setAdminPrincipal(newAdmin: Principal): Promise<Result_6>;
    setPauseTrading(paused: boolean): Promise<Result_6>;
    setTargetOutcomes(cohortId: bigint, passRateTarget: number, returnTarget: number, consistencyTarget: number): Promise<Result_5>;
    suggestParamAdjustments(cohortId: bigint): Promise<Result_4>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    triggerMonthlyReview(): Promise<Result_3>;
    updateCohortParams(cohortId: bigint, phase1: PhaseParams | null, phase2: PhaseParams | null): Promise<Result_2>;
    validateTradeRequest(pair: string, direction: TradeSide, size: number, slippageBps: bigint): Promise<ValidationResult>;
    withdrawFromPool(amount: number): Promise<Result_1>;
    withdrawPlatformFees(amount: number): Promise<Result>;
}
