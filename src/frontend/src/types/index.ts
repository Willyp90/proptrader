// Re-export backend types as canonical — do NOT define local versions of these
export type {
  Trade,
  Challenge,
  AdminParams,
  TraderProfile,
  AuditEntry,
  PriceData,
  // New types
  Position,
  ConsistencyScore,
  FundedAccount,
  PhaseParams,
  CohortParams,
  PayoutRecord,
  PriceCache,
  LeaderboardEntry,
  ValidationResult,
  TargetOutcome,
  InvestorStats,
  AllocationChange,
} from "../backend.d";

export {
  ChallengeStatus,
  ExecutionType,
  RiskLevel,
  TradeSide,
  TraderMode,
  UserRole,
  // New enums
  ChallengePhase,
  OrderStatus,
  DexSource,
  ValidationStatus,
} from "../backend.d";

// ─── Format Helpers ───────────────────────────────────────────────────────────

export function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}$${Math.abs(pnl).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${price.toFixed(4)}`;
}

export function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

export function formatAllocation(amount: number): string {
  return `${amount.toFixed(4)} ICP`;
}

export function formatConsistencyScore(score: number): {
  label: string;
  colorClass: string;
} {
  const label = `${score.toFixed(1)}%`;
  if (score < 50) return { label, colorClass: "text-loss" };
  if (score < 65) return { label, colorClass: "text-warning" };
  if (score < 80) return { label, colorClass: "text-profit" };
  return { label, colorClass: "text-accent" };
}

import type { ChallengePhase as ChallengePhaseType } from "../backend.d";
import { ChallengePhase } from "../backend.d";

export function formatPhaseLabel(phase: ChallengePhaseType): string {
  switch (phase) {
    case ChallengePhase.phase1:
      return "Phase 1: Evaluation";
    case ChallengePhase.phase2:
      return "Phase 2: Verification";
    case ChallengePhase.funded:
      return "Funded Trader";
    case ChallengePhase.notStarted:
      return "Not Started";
  }
}
