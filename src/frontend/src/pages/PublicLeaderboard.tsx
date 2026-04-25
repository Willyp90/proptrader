import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import {
  ChallengePhase,
  type LeaderboardEntry,
  formatConsistencyScore,
  formatPct,
  truncatePrincipal,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Phase badge ──────────────────────────────────────────────────────────────
function PhaseBadge({ phase }: { phase: ChallengePhase }) {
  if (phase === ChallengePhase.funded) {
    return (
      <span className="badge-real text-xs font-mono whitespace-nowrap">
        Funded
      </span>
    );
  }
  if (phase === ChallengePhase.phase2) {
    return (
      <span className="badge-simulated text-xs font-mono whitespace-nowrap">
        Phase 2
      </span>
    );
  }
  if (phase === ChallengePhase.phase1) {
    return (
      <Badge
        variant="secondary"
        className="text-xs font-mono whitespace-nowrap"
      >
        Phase 1
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs font-mono whitespace-nowrap">
      Not Started
    </Badge>
  );
}

// ─── Rank badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm font-mono">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-sm font-mono">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-sm font-mono">
        3
      </span>
    );
  return (
    <span className="flex h-7 w-7 items-center justify-center text-muted-foreground font-mono text-sm">
      {rank}
    </span>
  );
}

// ─── Expanded row ─────────────────────────────────────────────────────────────
function ExpandedTraderRow({ traderId }: { traderId: string }) {
  const { actor } = useActor(createActor);
  const [data, setData] = useState<{
    recentTrades: Array<{
      id: bigint;
      pair: string;
      side: string;
      pnl: number;
      timestamp: bigint;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    let cancelled = false;

    actor
      .getTraderPublicProfile(Principal.fromText(traderId))
      .then((result) => {
        if (cancelled || !result) return;
        setData({
          recentTrades: result.recentTrades.slice(0, 5).map((t) => ({
            id: t.id,
            pair: t.pair,
            side: String(t.side),
            pnl: t.pnl,
            timestamp: t.timestamp,
          })),
        });
      })
      .catch(() => setData({ recentTrades: [] }))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, traderId]);

  if (loading) {
    return (
      <tr>
        <td colSpan={7} className="px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading trade history…
          </div>
        </td>
      </tr>
    );
  }

  if (!data || data.recentTrades.length === 0) {
    return (
      <tr>
        <td colSpan={7} className="px-4 py-3 bg-muted/20">
          <p className="text-muted-foreground text-sm">
            No recent trades available.
          </p>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={7} className="bg-muted/20 px-4 py-3">
        <div className="space-y-2">
          <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide">
            Recent Trades
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-1 pr-4 font-display">Pair</th>
                  <th className="text-left py-1 pr-4 font-display">Side</th>
                  <th className="text-right py-1 pr-4 font-display">P&amp;L</th>
                  <th className="text-right py-1 font-display">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTrades.map((trade) => {
                  const ts = Number(trade.timestamp / 1_000_000n);
                  const date = new Date(ts);
                  const timeStr = date.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <tr
                      key={String(trade.id)}
                      className="border-t border-border/50"
                    >
                      <td className="py-1.5 pr-4 font-mono font-medium text-foreground">
                        {trade.pair}
                      </td>
                      <td className="py-1.5 pr-4">
                        <span
                          className={`capitalize font-mono ${
                            trade.side === "buy"
                              ? "text-chart-1"
                              : "text-chart-2"
                          }`}
                        >
                          {String(trade.side)}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-right">
                        <span
                          className={`font-mono font-semibold ${
                            trade.pnl >= 0 ? "text-chart-1" : "text-chart-2"
                          }`}
                        >
                          {trade.pnl >= 0 ? "+" : ""}
                          {trade.pnl.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-1.5 text-right text-muted-foreground font-mono">
                        {timeStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────
function LeaderboardRow({
  entry,
  isExpanded,
  onToggle,
  index,
}: {
  entry: LeaderboardEntry;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const rank = Number(entry.rank);
  const cs = formatConsistencyScore(entry.consistencyScore);
  const ts = Number(entry.lastTradeTime / 1_000_000n);
  const date = new Date(ts);
  const timeAgo = (() => {
    const diff = Date.now() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  })();

  const displayName =
    entry.username || truncatePrincipal(entry.traderId.toText());

  return (
    <>
      <tr
        className={`border-b border-border hover:bg-muted/20 transition-colors duration-150 cursor-pointer ${
          isExpanded ? "bg-muted/10" : ""
        }`}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        tabIndex={0}
        data-ocid={`leaderboard.row.${index + 1}`}
      >
        {/* Rank */}
        <td className="px-4 py-3">
          <RankBadge rank={rank} />
        </td>

        {/* Username — always visible */}
        <td className="px-4 py-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <p className="font-display font-medium text-foreground truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="font-mono text-xs text-muted-foreground hidden sm:block">
                {truncatePrincipal(entry.traderId.toText())}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
          </div>
        </td>

        {/* Profit % — always visible */}
        <td className="px-4 py-3 text-right">
          <span
            className={`font-mono font-bold text-sm ${
              entry.profitPct >= 0 ? "text-chart-1" : "text-chart-2"
            }`}
          >
            {formatPct(entry.profitPct)}
          </span>
        </td>

        {/* Risk score — hidden on mobile */}
        <td className="px-4 py-3 text-right hidden md:table-cell">
          <span className="font-mono text-sm text-foreground">
            {entry.riskScore.toFixed(1)}
          </span>
        </td>

        {/* Consistency — hidden on mobile */}
        <td className="px-4 py-3 text-right hidden md:table-cell">
          <span className={`font-mono text-sm font-semibold ${cs.colorClass}`}>
            {cs.label}
          </span>
        </td>

        {/* Phase — hidden on mobile */}
        <td className="px-4 py-3 text-center hidden sm:table-cell">
          <PhaseBadge phase={entry.phase} />
        </td>

        {/* Trades / Last trade — hidden on mobile */}
        <td className="px-4 py-3 text-right hidden lg:table-cell">
          <div className="space-y-0.5">
            <p className="font-mono text-sm text-foreground">
              {String(entry.tradeCount)}
            </p>
            <p className="font-mono text-xs text-muted-foreground flex items-center justify-end gap-1">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo}
            </p>
          </div>
        </td>
      </tr>
      {isExpanded && <ExpandedTraderRow traderId={entry.traderId.toText()} />}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function LeaderboardSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// ─── Sort/Period mapping ──────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "profitPct", label: "Profit %" },
  { value: "consistencyScore", label: "Consistency" },
  { value: "riskScore", label: "Risk Score" },
] as const;

const PERIOD_OPTIONS = [
  { value: "0", label: "All Time" },
  { value: "30", label: "30 Days" },
  { value: "7", label: "7 Days" },
  { value: "1", label: "24 Hours" },
] as const;

const PAGE_SIZE = 50;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PublicLeaderboard() {
  const [sortBy, setSortBy] = useState<string>("profitPct");
  const [period, setPeriod] = useState<string>("0");
  const [page, setPage] = useState(0);
  const [expandedTrader, setExpandedTrader] = useState<string | null>(null);

  const timePeriodDays = Number.parseInt(period, 10);
  const { traders, loading } = useLeaderboard(
    sortBy,
    timePeriodDays,
    PAGE_SIZE * (page + 1),
  );

  function toggleExpand(traderId: string) {
    setExpandedTrader((prev) => (prev === traderId ? null : traderId));
  }

  const hasMore = traders.length === PAGE_SIZE * (page + 1);

  return (
    <div className="min-h-screen bg-background">
      <div
        className="max-w-6xl mx-auto px-4 py-8 space-y-6"
        data-ocid="leaderboard.page"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" />
              <h1 className="text-3xl font-display font-bold text-foreground">
                PropTrader Leaderboard
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Top traders ranked by profit, consistency, and risk management.
            </p>
          </div>

          {/* Filter controls */}
          <div
            className="flex flex-wrap items-center gap-2"
            data-ocid="leaderboard.filters_panel"
          >
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v);
                setPage(0);
              }}
            >
              <SelectTrigger
                className="w-[140px] h-8 text-sm"
                data-ocid="leaderboard.sort_select"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={period}
              onValueChange={(v) => {
                setPeriod(v);
                setPage(0);
              }}
            >
              <SelectTrigger
                className="w-[130px] h-8 text-sm"
                data-ocid="leaderboard.period_select"
              >
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-0 border-b border-border">
            <CardTitle className="text-sm font-display flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              {loading
                ? "Loading rankings…"
                : `${traders.length} trader${traders.length !== 1 ? "s" : ""} ranked`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <LeaderboardSkeleton />
            ) : traders.length === 0 ? (
              <div
                className="p-12 text-center"
                data-ocid="leaderboard.empty_state"
              >
                <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-semibold text-foreground mb-1">
                  No traders yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Rankings will appear as traders complete challenges and earn
                  positions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto" data-ocid="leaderboard.table">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide w-12">
                        #
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide">
                        Trader
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide">
                        Profit %
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                        Risk Score
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                        Consistency
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                        Phase
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                        Trades
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {traders.map((entry, idx) => (
                      <LeaderboardRow
                        key={entry.traderId.toText() + String(entry.rank)}
                        entry={entry}
                        isExpanded={expandedTrader === entry.traderId.toText()}
                        onToggle={() => toggleExpand(entry.traderId.toText())}
                        index={idx}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Load more */}
            {!loading && hasMore && (
              <div className="p-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setPage((p) => p + 1)}
                  data-ocid="leaderboard.load_more_button"
                >
                  Load more
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
