import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsistencyScore } from "@/hooks/useConsistencyScore";
import { useConsistencyScoreHistory } from "@/hooks/useConsistencyScoreHistory";
import { useFundedAccount } from "@/hooks/useFundedAccount";
import { usePayoutHistory } from "@/hooks/usePayoutHistory";
import {
  type ConsistencyScore,
  type PayoutRecord,
  formatAllocation,
  formatConsistencyScore,
} from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Info,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Account summary card ─────────────────────────────────────────────────────
function AccountSummaryCard({
  funded,
}: {
  funded: import("@/types").FundedAccount;
}) {
  return (
    <Card
      className="bg-card border-border"
      data-ocid="funded_account.summary_card"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          Account Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide mb-1">
              Allocation
            </p>
            <p className="font-mono text-lg font-bold text-primary">
              {formatAllocation(funded.allocationCurrent)}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Base: {formatAllocation(funded.allocationBase)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide mb-1">
              Performance
            </p>
            <p className="font-mono text-lg font-bold text-accent">
              {funded.performanceMultiplier.toFixed(2)}×
            </p>
            <p className="text-xs text-muted-foreground">Multiplier</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide mb-1">
              Months Active
            </p>
            <p className="font-mono text-lg font-bold text-foreground">
              {String(funded.monthsActive)}
            </p>
            <p className="text-xs text-muted-foreground">months</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide mb-1">
              Account Balance
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {formatAllocation(funded.accountBalance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide mb-1">
              Last Review
            </p>
            <p className="font-mono text-sm text-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {formatDate(funded.lastReviewDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide mb-1">
              Next Review
            </p>
            <p className="font-mono text-sm text-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatDate(funded.nextReviewDate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Score component bar ──────────────────────────────────────────────────────
function ScoreBar({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  const barColor =
    value >= 80 ? "bg-chart-1" : value >= 65 ? "bg-chart-3" : "bg-chart-2";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-display">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono">{weight}</span>
          <span className="font-mono font-semibold text-foreground">
            {value.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Consistency panel ────────────────────────────────────────────────────────
function ConsistencyPanel({
  score,
  history,
}: {
  score: ConsistencyScore;
  history: ConsistencyScore[];
}) {
  const cs = formatConsistencyScore(score.score);
  const prevScore = history.length > 1 ? history[1].score : null;
  const trend =
    prevScore !== null
      ? score.score > prevScore
        ? "up"
        : score.score < prevScore
          ? "down"
          : "flat"
      : null;

  return (
    <Card
      className="bg-card border-border"
      data-ocid="funded_account.consistency_panel"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Consistency Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Score display */}
        <div className="flex items-end gap-3">
          <span className={`font-mono text-5xl font-bold ${cs.colorClass}`}>
            {score.score.toFixed(1)}
          </span>
          <div className="mb-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              {trend === "up" && (
                <span className="flex items-center gap-0.5 text-xs text-chart-1 font-mono">
                  <ArrowUp className="h-3 w-3" />
                  vs last
                </span>
              )}
              {trend === "down" && (
                <span className="flex items-center gap-0.5 text-xs text-chart-2 font-mono">
                  <ArrowDown className="h-3 w-3" />
                  vs last
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-display">
              / 100 composite score
            </p>
          </div>
        </div>

        {/* Component bars */}
        <div className="space-y-3">
          <ScoreBar
            label="Profit Distribution"
            value={score.profitDistScore}
            weight="35%"
          />
          <ScoreBar label="Win Rate" value={score.winRateScore} weight="30%" />
          <ScoreBar
            label="Drawdown Control"
            value={score.drawdownCtrlScore}
            weight="20%"
          />
          <ScoreBar
            label="Trading Activity"
            value={score.activityScore}
            weight="15%"
          />
        </div>

        {/* History mini-chart */}
        {history.length > 1 && (
          <div
            className="space-y-2 pt-2 border-t border-border"
            data-ocid="funded_account.consistency_history_chart"
          >
            <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide">
              Score History
            </p>
            <div className="flex items-end gap-1 h-16">
              {[...history]
                .reverse()
                .slice(0, 10)
                .map((h, i) => {
                  const pct = Math.min(100, h.score);
                  const barColor =
                    h.score >= 80
                      ? "bg-chart-1"
                      : h.score >= 65
                        ? "bg-chart-3"
                        : "bg-chart-2";
                  return (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: ordered history bars
                      key={i}
                      className="flex-1 flex flex-col items-center gap-0.5 group"
                      title={`${h.score.toFixed(1)} — ${formatDate(h.timestamp)}`}
                    >
                      <div className="w-full flex items-end justify-center h-14">
                        <div
                          className={`w-full rounded-t transition-all ${barColor} opacity-80 group-hover:opacity-100`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground leading-none">
                        {h.score.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Payout status badge ──────────────────────────────────────────────────────
function PayoutStatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return <span className="badge-success text-xs font-mono">Paid</span>;
  }
  if (status === "pending") {
    return <span className="badge-warning text-xs font-mono">Pending</span>;
  }
  return (
    <Badge variant="secondary" className="text-xs font-mono capitalize">
      {status}
    </Badge>
  );
}

// ─── Payout history ───────────────────────────────────────────────────────────
function PayoutHistorySection() {
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  const startTime = startInput
    ? BigInt(new Date(startInput).getTime()) * 1_000_000n
    : undefined;
  const endTime = endInput
    ? BigInt(new Date(endInput).getTime()) * 1_000_000n
    : undefined;

  const { payouts, loading } = usePayoutHistory(startTime, endTime, 100);

  const totals = useMemo(() => {
    return payouts.reduce(
      (acc, p) => ({
        profit: acc.profit + p.profitAmount,
        traderShare: acc.traderShare + p.traderShare,
        investorShare: acc.investorShare + p.investorShare,
        platformShare: acc.platformShare + p.platformShare,
      }),
      { profit: 0, traderShare: 0, investorShare: 0, platformShare: 0 },
    );
  }, [payouts]);

  function clearFilters() {
    setStartInput("");
    setEndInput("");
  }

  return (
    <Card
      className="bg-card border-border"
      data-ocid="funded_account.payout_history_section"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Payout History
          </CardTitle>
          {/* Date filter */}
          <div
            className="flex flex-wrap items-end gap-2"
            data-ocid="funded_account.date_filter"
          >
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="h-7 text-xs w-36"
                data-ocid="funded_account.date_from_input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="h-7 text-xs w-36"
                data-ocid="funded_account.date_to_input"
              />
            </div>
            {(startInput || endInput) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={clearFilters}
                data-ocid="funded_account.clear_filter_button"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div
            className="p-8 text-center"
            data-ocid="funded_account.payouts_empty_state"
          >
            <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No payouts yet. Payouts are processed when profitable positions
              are closed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Trade P&L
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-display font-semibold text-chart-1 uppercase tracking-wide whitespace-nowrap">
                    You (70%)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">
                    Pool (20%)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">
                    Platform (10%)
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, idx) => {
                  const traderAmt = payout.profitAmount * 0.7;
                  const poolAmt = payout.profitAmount * 0.2;
                  const platformAmt = payout.profitAmount * 0.1;
                  return (
                    <tr
                      key={String(payout.tradeId)}
                      className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors duration-150"
                      data-ocid={`funded_account.payout_row.${idx + 1}`}
                    >
                      <td
                        className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap"
                        title={formatDate(payout.closeTime)}
                      >
                        {formatDate(payout.closeTime)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="mono-price text-chart-1">
                          +{payout.profitAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="mono-price font-bold text-chart-1">
                          +{traderAmt.toFixed(2)} ICP
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="mono-price text-muted-foreground">
                          +{poolAmt.toFixed(2)} ICP
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="mono-price text-muted-foreground">
                          +{platformAmt.toFixed(2)} ICP
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PayoutStatusBadge status={payout.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="px-4 py-3 text-xs font-display font-bold text-foreground">
                    Totals
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="mono-price font-bold text-chart-1">
                      +{totals.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="mono-price font-bold text-chart-1">
                      +{(totals.profit * 0.7).toFixed(2)} ICP
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="mono-price text-muted-foreground">
                      +{(totals.profit * 0.2).toFixed(2)} ICP
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="mono-price text-muted-foreground">
                      +{(totals.profit * 0.1).toFixed(2)} ICP
                    </span>
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FundedAccountPage() {
  const { funded, loading: fundedLoading } = useFundedAccount();
  const { score, loading: scoreLoading } = useConsistencyScore();
  const { history, loading: historyLoading } = useConsistencyScoreHistory(10);
  const navigate = useNavigate();

  const isLoading = fundedLoading || scoreLoading;

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="funded_account.loading_state">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!funded) {
    return (
      <div className="space-y-6" data-ocid="funded_account.page">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Funded Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your funded allocation, performance, and payouts.
          </p>
        </div>
        <Card
          className="bg-card border-border p-8 text-center"
          data-ocid="funded_account.empty_state"
        >
          <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground mb-1">
            No funded account yet
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Complete Phase 1 and Phase 2 of the PropTrader Challenge to earn a
            funded account with real capital allocation.
          </p>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => navigate({ to: "/dashboard/challenge" })}
            data-ocid="funded_account.start_challenge_button"
          >
            Start Challenge
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="funded_account.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Funded Account
            </h1>
            <span className="badge-real flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              FUNDED
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Real capital allocation. Your performance directly impacts your
            allocation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/30 rounded-md px-3 py-1.5">
            <TrendingUp className="h-3 w-3" />
            Unrealized P&L:{" "}
            <span
              className={`font-semibold ${
                funded.unrealizedPnl >= 0 ? "text-chart-1" : "text-chart-2"
              }`}
            >
              {funded.unrealizedPnl >= 0 ? "+" : ""}
              {funded.unrealizedPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Account summary */}
      <AccountSummaryCard funded={funded} />

      {/* Profit split info card */}
      <Card
        className="bg-card border-accent/20 border"
        data-ocid="funded_account.profit_split_card"
      >
        <CardContent className="py-4 px-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-display font-semibold text-foreground mb-2">
                Profit Split: 70% to you · 20% to investor pool · 10% to
                platform
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-chart-1/10 border border-chart-1/20 rounded-md px-3 py-1.5 min-w-[90px]">
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-1 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wide">
                      You
                    </p>
                    <p className="font-mono font-bold text-chart-1 text-sm">
                      70%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-md px-3 py-1.5 min-w-[90px]">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wide">
                      Pool
                    </p>
                    <p className="font-mono font-bold text-primary text-sm">
                      20%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-md px-3 py-1.5 min-w-[90px]">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wide">
                      Platform
                    </p>
                    <p className="font-mono font-bold text-foreground text-sm">
                      10%
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your profit share is 70% of all realized gains on your funded
                account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consistency score panel */}
      {score ? (
        <ConsistencyPanel
          score={score}
          history={historyLoading ? [] : history}
        />
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Consistency score will appear after your first trade cycle.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payout history */}
      <PayoutHistorySection />
    </div>
  );
}
