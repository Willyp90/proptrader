import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Info,
  ShieldCheck,
  Star,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { createActor } from "../backend";
import type {
  Challenge,
  ConsistencyScore,
  FundedAccount,
  PayoutRecord,
  Trade,
} from "../backend.d";
import {
  ChallengePhase,
  ChallengeStatus,
  ExecutionType,
  TradeSide,
} from "../backend.d";
import { useAuth } from "../hooks/useAuth";
import { useChallenge } from "../hooks/useChallenge";
import { useConsistencyScore } from "../hooks/useConsistencyScore";
import { useFundedAccount } from "../hooks/useFundedAccount";
import { usePayoutHistory } from "../hooks/usePayoutHistory";
import { usePhaseStatus } from "../hooks/usePhaseStatus";
import { useTraderProfile } from "../hooks/useTraderProfile";
import { formatPnl, formatPrice } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPct(v: number) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function fmtDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtRelativeTime(ts: bigint): string {
  const ms = Date.now() - Number(ts) / 1_000_000;
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return fmtDate(ts);
}

function statusMeta(status: ChallengeStatus) {
  switch (status) {
    case ChallengeStatus.active:
      return {
        label: "ACTIVE",
        cls: "bg-primary/10 text-primary border-primary/30",
      };
    case ChallengeStatus.passed:
      return {
        label: "PASSED",
        cls: "bg-chart-1/15 text-chart-1 border-chart-1/30",
      };
    case ChallengeStatus.failed:
      return {
        label: "FAILED",
        cls: "bg-destructive/15 text-destructive border-destructive/30",
      };
    default:
      return {
        label: "PAUSED",
        cls: "bg-muted text-muted-foreground border-border",
      };
  }
}

/** Color for a 0–100 consistency score value */
function scoreColor(score: number): string {
  if (score > 80) return "text-accent"; // gold
  if (score >= 65) return "text-chart-1"; // green
  if (score >= 50) return "text-chart-3"; // yellow/warning
  return "text-destructive"; // red
}

/** Stroke color for SVG ring based on score */
function ringStroke(score: number): string {
  if (score > 80) return "var(--color-accent, oklch(0.72 0.18 60))";
  if (score >= 65) return "var(--color-chart-1, oklch(0.62 0.22 150))";
  if (score >= 50) return "var(--color-chart-3, oklch(0.7 0.15 85))";
  return "var(--color-destructive, oklch(0.52 0.22 25))";
}

function phaseLabel(phase: ChallengePhase): string {
  switch (phase) {
    case ChallengePhase.phase1:
      return "Phase 1 — Evaluation";
    case ChallengePhase.phase2:
      return "Phase 2 — Verification";
    case ChallengePhase.funded:
      return "Funded";
    default:
      return "Not Started";
  }
}

// ─── Existing Sub-components ──────────────────────────────────────────────────

function ExecutionModeBanner({ mode }: { mode: "evaluation" | "funded" }) {
  return mode === "funded" ? (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 w-fit">
      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
      <span className="badge-real text-xs font-bold tracking-widest">
        REAL EXECUTION
      </span>
    </div>
  ) : (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 w-fit">
      <Activity className="h-3.5 w-3.5 text-primary" />
      <span className="badge-simulated text-xs font-bold tracking-widest">
        SIMULATED EXECUTION
      </span>
    </div>
  );
}

function DrawdownBar({ pct, limitPct }: { pct: number; limitPct: number }) {
  const ratio = Math.min((Math.abs(pct) / limitPct) * 100, 100);
  const color =
    ratio >= 80 ? "bg-destructive" : ratio >= 50 ? "bg-chart-3" : "bg-chart-1";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Drawdown</span>
        <span className="font-mono">
          {Math.abs(pct).toFixed(2)}% / {limitPct.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const currentPnl = challenge.currentBalance - challenge.startingBalance;
  const pnlPct = (currentPnl / challenge.startingBalance) * 100;
  const drawdownPct =
    currentPnl < 0
      ? (Math.abs(currentPnl) / challenge.startingBalance) * 100
      : 0;
  const st = statusMeta(challenge.status);
  const daysElapsed = Math.floor(
    (Date.now() - Number(challenge.startTime) / 1_000_000) / 86_400_000,
  );

  return (
    <Card
      className="bg-card border-border"
      data-ocid="trader_dashboard.challenge_card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
            Challenge Overview
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-xs font-bold ${st.cls}`}
            data-ocid="trader_dashboard.challenge_status"
          >
            {st.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Starting</p>
            <p className="mono-price">
              {formatPrice(challenge.startingBalance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Current</p>
            <p className="mono-price">
              {formatPrice(challenge.currentBalance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">P&amp;L</p>
            <p
              className={`mono-price font-semibold ${currentPnl >= 0 ? "text-chart-1" : "text-destructive"}`}
            >
              {formatPnl(currentPnl)}{" "}
              <span className="text-xs opacity-70">({fmtPct(pnlPct)})</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Days</p>
            <p className="mono-price">{daysElapsed}d</p>
          </div>
        </div>

        <DrawdownBar
          pct={drawdownPct}
          limitPct={challenge.totalDrawdownLimitPct}
        />

        {challenge.status === ChallengeStatus.passed && (
          <div
            className="flex items-center gap-3 p-3 rounded-md border border-accent/30 bg-accent/10"
            data-ocid="trader_dashboard.funded_banner"
          >
            <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-display font-bold text-accent">
                You&apos;re Funded!
              </p>
              <p className="text-xs text-muted-foreground">
                Challenge passed — real capital allocated. Trade with REAL
                execution.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NoChallengeCard() {
  return (
    <Card
      className="bg-card border-border border-dashed"
      data-ocid="trader_dashboard.no_challenge_card"
    >
      <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-display font-semibold text-foreground">
            No Active Challenge
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Start a challenge to begin trading with live DEX price feeds.
          </p>
        </div>
        <Link to="/dashboard/challenge">
          <Button
            className="gap-2"
            data-ocid="trader_dashboard.start_challenge_button"
          >
            <Zap className="h-4 w-4" />
            Start a Challenge
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function TradeRow({ trade, idx }: { trade: Trade; idx: number }) {
  const isProfit = trade.pnl >= 0;
  return (
    <tr
      className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-150"
      data-ocid={`trader_dashboard.trade.${idx}`}
    >
      <td
        className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap"
        title={fmtDate(trade.timestamp)}
      >
        {fmtRelativeTime(trade.timestamp)}
      </td>
      <td className="px-4 py-2.5 text-xs font-mono font-medium">
        {trade.pair}
      </td>
      <td className="px-4 py-2.5">
        {trade.side === TradeSide.buy ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-chart-1">
            <ArrowUpRight className="h-3 w-3" /> BUY
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
            <ArrowDownRight className="h-3 w-3" /> SELL
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-right">
        {trade.quantity.toFixed(4)}
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-right">
        {formatPrice(trade.fillPrice)}
      </td>
      <td
        className={`px-4 py-2.5 text-xs font-mono text-right font-semibold ${isProfit ? "text-chart-1" : "text-destructive"}`}
      >
        {formatPnl(trade.pnl)}
      </td>
      <td className="px-4 py-2.5 text-right">
        {trade.executionType === ExecutionType.real ? (
          <span className="badge-real text-xs">REAL</span>
        ) : (
          <span className="badge-simulated text-xs">SIM</span>
        )}
      </td>
    </tr>
  );
}

// ─── New: Consistency Score Ring ──────────────────────────────────────────────

function ConsistencyRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const stroke = ringStroke(score);
  const textCls = scoreColor(score);

  return (
    <div className="relative flex items-center justify-center w-36 h-36 shrink-0">
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 128 128"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-secondary"
        />
        {/* Progress */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span
          className={`text-2xl font-mono font-bold leading-none ${textCls}`}
        >
          {score.toFixed(0)}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function ComponentScoreCard({
  label,
  value,
  weight,
  icon,
}: {
  label: string;
  value: number;
  weight: string;
  icon: React.ReactNode;
}) {
  const ratio = Math.min(value / 100, 1);
  const barColor =
    value > 80
      ? "bg-accent"
      : value >= 65
        ? "bg-chart-1"
        : value >= 50
          ? "bg-chart-3"
          : "bg-destructive";

  return (
    <div className="bg-secondary/40 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-muted-foreground">{icon}</div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span
          className={`text-xs font-mono font-semibold ${scoreColor(value)}`}
        >
          {value.toFixed(0)}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${ratio * 100}%`, transition: "width 0.6s ease" }}
        />
      </div>
      <p className="text-xs text-muted-foreground opacity-60">
        {weight} weight
      </p>
    </div>
  );
}

function ConsistencyScoreSection({
  score,
}: { score: ConsistencyScore | undefined; loading: boolean }) {
  return (
    <Card
      className="bg-card border-border"
      data-ocid="trader_dashboard.consistency_section"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
          Consistency Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!score ? (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Skeleton className="w-36 h-36 rounded-full" />
            <div className="grid grid-cols-2 gap-2 flex-1 w-full">
              {(["a", "b", "c", "d"] as const).map((k) => (
                <Skeleton key={k} className="h-20" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ConsistencyRing score={score.score} />
            <div className="grid grid-cols-2 gap-2 flex-1 w-full">
              <ComponentScoreCard
                label="Profit Distribution"
                value={score.profitDistScore}
                weight="35%"
                icon={<TrendingUp className="h-3.5 w-3.5" />}
              />
              <ComponentScoreCard
                label="Win Rate"
                value={score.winRateScore}
                weight="30%"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              />
              <ComponentScoreCard
                label="Drawdown Control"
                value={score.drawdownCtrlScore}
                weight="20%"
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
              />
              <ComponentScoreCard
                label="Trading Activity"
                value={score.activityScore}
                weight="15%"
                icon={<Activity className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── New: Phase Status Section ─────────────────────────────────────────────────

function TrafficLight({
  profitPct,
  consistencyPct,
}: { profitPct: number; consistencyPct: number }) {
  const avg = (profitPct + consistencyPct) / 2;
  const isGreen = avg >= 70;
  const isYellow = avg >= 40 && !isGreen;

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="flex flex-col items-center gap-1 bg-secondary/60 rounded-xl p-2 border border-border/60">
        <div
          className={`h-5 w-5 rounded-full border-2 ${isGreen ? "bg-chart-1 border-chart-1 shadow-[0_0_8px_oklch(0.62_0.22_150/0.6)]" : "bg-secondary border-border"}`}
        />
        <div
          className={`h-5 w-5 rounded-full border-2 ${isYellow ? "bg-chart-3 border-chart-3 shadow-[0_0_8px_oklch(0.7_0.15_85/0.6)]" : "bg-secondary border-border"}`}
        />
        <div
          className={`h-5 w-5 rounded-full border-2 ${!isGreen && !isYellow ? "bg-destructive border-destructive shadow-[0_0_8px_oklch(0.52_0.22_25/0.6)]" : "bg-secondary border-border"}`}
        />
      </div>
      <p className="text-xs text-muted-foreground font-mono">
        {isGreen ? "ON TRACK" : isYellow ? "AT RISK" : "DANGER"}
      </p>
    </div>
  );
}

function ProgressBar({
  label,
  current,
  target,
  colorClass,
}: { label: string; current: number; target: number; colorClass: string }) {
  const pct = Math.min((current / Math.max(target, 1)) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">
          {current.toFixed(1)}%{" "}
          <span className="text-muted-foreground">/ {target.toFixed(1)}%</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
        />
      </div>
    </div>
  );
}

function PhaseStatusSection({
  phase,
  profitProgress,
  consistencyProgress,
  timeRemainingDays,
  loading,
}: {
  phase: ChallengePhase | undefined;
  profitProgress: number | undefined;
  consistencyProgress: number | undefined;
  timeRemainingDays: bigint | undefined;
  loading: boolean;
}) {
  if (
    !loading &&
    (!phase ||
      phase === ChallengePhase.notStarted ||
      phase === ChallengePhase.funded)
  ) {
    return null;
  }

  const profit = profitProgress ?? 0;
  const consistency = consistencyProgress ?? 0;
  const daysLeft =
    timeRemainingDays !== undefined ? Number(timeRemainingDays) : null;

  return (
    <Card
      className="bg-card border-border"
      data-ocid="trader_dashboard.phase_status_section"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
            Phase Progress
          </CardTitle>
          {phase && (
            <Badge
              variant="outline"
              className="text-xs font-bold border-primary/30 text-primary bg-primary/10"
            >
              {phaseLabel(phase)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="flex items-start gap-5">
            <div className="flex-1 space-y-4">
              <ProgressBar
                label="Profit Progress"
                current={profit}
                target={100}
                colorClass={
                  profit >= 80
                    ? "bg-chart-1"
                    : profit >= 50
                      ? "bg-chart-3"
                      : "bg-destructive/70"
                }
              />
              <ProgressBar
                label="Consistency Threshold"
                current={consistency}
                target={100}
                colorClass={
                  consistency >= 80
                    ? "bg-chart-1"
                    : consistency >= 50
                      ? "bg-primary"
                      : "bg-destructive/70"
                }
              />
              {daysLeft !== null && (
                <div className="flex items-center gap-2 pt-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">
                      {daysLeft}d
                    </span>{" "}
                    remaining
                  </span>
                </div>
              )}
            </div>
            <TrafficLight profitPct={profit} consistencyPct={consistency} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── New: Funded Account Section ───────────────────────────────────────────────

function FundedAccountSection({
  funded,
  loading,
}: { funded: FundedAccount | undefined; loading: boolean }) {
  if (!loading && !funded) return null;

  return (
    <Card
      className="bg-card border-border border-accent/30"
      data-ocid="trader_dashboard.funded_account_section"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
            Funded Account
          </CardTitle>
          <Badge
            variant="outline"
            className="ml-1 text-xs font-bold border-accent/40 text-accent bg-accent/10"
          >
            FUNDED
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading || !funded ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["a", "b", "c", "d"] as const).map((k) => (
              <Skeleton key={k} className="h-14" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CircleDollarSign className="h-3 w-3" /> Allocation
              </p>
              <p className="mono-price text-accent">
                {funded.allocationCurrent.toFixed(2)} ICP
              </p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Multiplier</p>
              <p className="mono-price text-chart-1">
                {funded.performanceMultiplier.toFixed(2)}×
              </p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Months Active
              </p>
              <p className="mono-price">{String(funded.monthsActive)}mo</p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" /> Next Review
              </p>
              <p className="text-xs font-mono font-medium text-foreground">
                {fmtShortDate(funded.nextReviewDate)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── New: Payout History Section ───────────────────────────────────────────────

function payoutStatusCls(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "badge-success";
  if (s === "pending") return "badge-warning";
  return "badge-destructive";
}

function PayoutRow({ payout, idx }: { payout: PayoutRecord; idx: number }) {
  const traderAmt = payout.profitAmount * 0.7;
  const poolAmt = payout.profitAmount * 0.2;
  const platformAmt = payout.profitAmount * 0.1;
  return (
    <tr
      className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-150"
      data-ocid={`trader_dashboard.payout.${idx}`}
    >
      <td
        className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap"
        title={fmtShortDate(payout.closeTime)}
      >
        {fmtRelativeTime(payout.closeTime)}
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-right text-chart-1">
        +{payout.profitAmount.toFixed(2)}
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-right font-semibold text-accent">
        {traderAmt.toFixed(2)} ICP
        <span className="text-muted-foreground font-normal ml-1">(70%)</span>
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-right text-muted-foreground hidden sm:table-cell">
        {poolAmt.toFixed(2)} <span className="opacity-60">(20%)</span>
      </td>
      <td className="px-4 py-2.5 text-xs font-mono text-right text-muted-foreground hidden md:table-cell">
        {platformAmt.toFixed(2)} <span className="opacity-60">(10%)</span>
      </td>
      <td className="px-4 py-2.5 text-right">
        <span className={`${payoutStatusCls(payout.status)} text-xs`}>
          {payout.status.toUpperCase()}
        </span>
      </td>
    </tr>
  );
}

function PayoutHistorySection({
  payouts,
  loading,
}: { payouts: PayoutRecord[]; loading: boolean }) {
  const recent = payouts.slice(0, 5);

  return (
    <Card
      className="bg-card border-border"
      data-ocid="trader_dashboard.payout_history_section"
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
          Payout History
        </CardTitle>
        <Link to="/dashboard/funded">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            data-ocid="trader_dashboard.payout_view_all_button"
          >
            View all →
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="px-4 py-4 space-y-3">
            {(["a", "b", "c"] as const).map((k) => (
              <Skeleton key={k} className="h-8 w-full" />
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[480px] text-left"
              data-ocid="trader_dashboard.payout_table"
            >
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    "Date",
                    "Profit",
                    "You (70%)",
                    "Pool (20%)",
                    "Platform (10%)",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-2 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider last:text-right ${h.includes("Pool") ? "hidden sm:table-cell" : ""} ${h.includes("Platform") ? "hidden md:table-cell" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((p, i) => (
                  <PayoutRow key={String(p.tradeId)} payout={p} idx={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="py-8 text-center"
            data-ocid="trader_dashboard.payout_empty_state"
          >
            <p className="text-sm text-muted-foreground">No payouts yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Payouts appear after funded trades are closed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TraderDashboard() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const { profile } = useTraderProfile();
  const {
    challenge,
    isLoading: challengeLoading,
    hasActiveChallenge,
  } = useChallenge();
  const { score, loading: scoreLoading } = useConsistencyScore();
  const {
    phase,
    profitProgress,
    consistencyProgress,
    timeRemainingDays,
    loading: phaseLoading,
  } = usePhaseStatus();
  const { funded, loading: fundedLoading } = useFundedAccount();
  const { payouts, loading: payoutsLoading } = usePayoutHistory(
    undefined,
    undefined,
    5,
  );

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["myTrades", principal],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTrades(BigInt(10));
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 15_000,
    refetchInterval: 20_000,
  });

  const mode = profile?.mode === "funded" ? "funded" : "evaluation";
  const canTrade =
    hasActiveChallenge && challenge?.status === ChallengeStatus.active;
  const isFunded = profile?.mode === "funded" || !!funded;
  const isChallengeFailed = challenge?.status === ChallengeStatus.failed;

  return (
    <div className="space-y-5" data-ocid="trader_dashboard.page">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
            Trader Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time overview ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExecutionModeBanner mode={mode} />
          {/* Profit split badge */}
          {isFunded && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-muted/30 text-xs text-muted-foreground cursor-default group relative"
              title="Profit split for funded traders"
              data-ocid="trader_dashboard.profit_split_badge"
            >
              <Info className="h-3 w-3" />
              <span>70/20/10</span>
              <div className="hidden group-hover:block absolute right-0 top-full mt-2 z-50 w-52 bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
                <p className="font-semibold text-foreground mb-1.5">
                  Profit Split
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You (Trader)</span>
                    <span className="font-mono font-semibold text-chart-1">
                      70%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investor Pool</span>
                    <span className="font-mono font-semibold text-foreground">
                      20%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform</span>
                    <span className="font-mono font-semibold text-foreground">
                      10%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Link to="/dashboard/trade">
            <Button
              size="sm"
              disabled={!canTrade}
              className="gap-2"
              data-ocid="trader_dashboard.execute_trade_button"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Execute Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Challenge failed banner */}
      {isChallengeFailed && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/30"
          data-ocid="trader_dashboard.challenge_failed_banner"
        >
          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-display font-bold text-destructive">
              Challenge Failed
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your challenge has ended. Start a new challenge to continue
              trading with live DEX prices.
            </p>
          </div>
          <Link to="/dashboard/challenge">
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
              data-ocid="trader_dashboard.new_challenge_button"
            >
              New Challenge
            </Button>
          </Link>
        </div>
      )}

      {/* Challenge panel */}
      {challengeLoading ? (
        <Card className="bg-card border-border">
          <CardContent className="py-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-4 gap-4">
              {(["a", "b", "c", "d"] as const).map((k) => (
                <Skeleton key={k} className="h-8" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : challenge ? (
        <ChallengeCard challenge={challenge} />
      ) : (
        <NoChallengeCard />
      )}

      {/* Phase status (only when challenge is active and in a phase) */}
      <PhaseStatusSection
        phase={phase}
        profitProgress={profitProgress}
        consistencyProgress={consistencyProgress}
        timeRemainingDays={timeRemainingDays}
        loading={phaseLoading}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card
          className="bg-card border-border"
          data-ocid="trader_dashboard.total_trades_card"
        >
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Trades</p>
              <p className="mono-lg">{trades?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-card border-border"
          data-ocid="trader_dashboard.win_rate_card"
        >
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-chart-1/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="mono-lg">
                {trades && trades.length > 0
                  ? `${((trades.filter((t) => t.pnl > 0).length / trades.length) * 100).toFixed(0)}%`
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-card border-border"
          data-ocid="trader_dashboard.challenge_status_card"
        >
          <CardContent className="py-4 flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                challenge?.status === ChallengeStatus.passed
                  ? "bg-chart-1/10"
                  : challenge?.status === ChallengeStatus.failed
                    ? "bg-destructive/10"
                    : "bg-secondary"
              }`}
            >
              {challenge?.status === ChallengeStatus.passed ? (
                <CheckCircle2 className="h-4 w-4 text-chart-1" />
              ) : challenge?.status === ChallengeStatus.failed ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Challenge</p>
              <p className="text-sm font-display font-semibold">
                {challenge ? statusMeta(challenge.status).label : "None"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consistency Score */}
      <ConsistencyScoreSection score={score} loading={scoreLoading} />

      {/* Funded Account (only when funded) */}
      {isFunded && (
        <FundedAccountSection funded={funded} loading={fundedLoading} />
      )}

      {/* Payout History (only when funded) */}
      {isFunded && (
        <PayoutHistorySection payouts={payouts} loading={payoutsLoading} />
      )}

      {/* Recent trades */}
      <Card
        className="bg-card border-border"
        data-ocid="trader_dashboard.trades_card"
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
            Recent Trades
          </CardTitle>
          <Link to="/dashboard/trade">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              data-ocid="trader_dashboard.new_trade_button"
            >
              + New Trade
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {tradesLoading ? (
            <div className="px-4 py-4 space-y-3">
              {(["a", "b", "c"] as const).map((k) => (
                <Skeleton key={k} className="h-8 w-full" />
              ))}
            </div>
          ) : trades && trades.length > 0 ? (
            <div className="overflow-x-auto">
              <table
                className="w-full min-w-[600px] text-left"
                data-ocid="trader_dashboard.trades_table"
              >
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      "Time",
                      "Pair",
                      "Side",
                      "Qty",
                      "Fill Price",
                      "P&L",
                      "Type",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t, i) => (
                    <TradeRow key={String(t.id)} trade={t} idx={i + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="py-10 text-center"
              data-ocid="trader_dashboard.trades_empty_state"
            >
              <p className="text-sm text-muted-foreground">No trades yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                {canTrade
                  ? "Execute your first trade to see it here."
                  : "Start a challenge to begin trading."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
