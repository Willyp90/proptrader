import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFundedTraderList,
  useInvestorStats,
} from "@/hooks/useInvestorStats";
import {
  formatAllocation,
  formatConsistencyScore,
  formatPct,
  truncatePrincipal,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  CircleDollarSign,
  DollarSign,
  Info,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";

type SortKey = "username" | "allocation" | "consistencyScore" | "monthlyReturn";
type SortDir = "asc" | "desc";

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  subtitle?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  subtitle,
}: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide truncate">
              {label}
            </p>
            <p
              className={`mono-lg font-bold ${colorClass ?? "text-foreground"}`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0 ml-3">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Return card ──────────────────────────────────────────────────────────────
interface ReturnCardProps {
  label: string;
  value: number;
  period: string;
}

function ReturnCard({ label, value, period }: ReturnCardProps) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wide">
            {label}
          </p>
          <Icon
            className={`h-4 w-4 ${positive ? "text-chart-1" : "text-chart-2"}`}
          />
        </div>
        <p
          className={`font-mono text-2xl font-bold ${
            positive ? "text-chart-1" : "text-chart-2"
          }`}
        >
          {formatPct(value)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{period}</p>
      </CardContent>
    </Card>
  );
}

// ─── Pool overview skeleton ───────────────────────────────────────────────────
function PoolOverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <Card key={i} className="bg-card border-border">
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Deposit/Withdraw Panel ───────────────────────────────────────────────────
function PoolDepositWithdrawPanel({ poolBalance }: { poolBalance: number }) {
  const { actor, isFetching } = useActor(createActor);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number.parseFloat(depositAmount);
    if (!actor || !amount || amount <= 0) return;
    setIsDepositing(true);
    try {
      const result = await (
        actor as unknown as {
          depositToPool: (
            n: number,
          ) => Promise<{ __kind__: string; err?: string }>;
        }
      ).depositToPool(amount);
      if (result.__kind__ === "ok") {
        toast.success("Deposit successful", {
          description: `${amount.toFixed(2)} ICP deposited to the investor pool.`,
        });
        setDepositAmount("");
      } else {
        toast.error("Deposit failed", { description: result.err });
      }
    } catch (err) {
      toast.error("Deposit error", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsDepositing(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number.parseFloat(withdrawAmount);
    if (!actor || !amount || amount <= 0) return;
    setIsWithdrawing(true);
    try {
      const result = await (
        actor as unknown as {
          withdrawFromPool: (
            n: number,
          ) => Promise<{ __kind__: string; err?: string }>;
        }
      ).withdrawFromPool(amount);
      if (result.__kind__ === "ok") {
        toast.success("Withdrawal initiated", {
          description: `${amount.toFixed(2)} ICP withdrawal request submitted.`,
        });
        setWithdrawAmount("");
      } else {
        toast.error("Withdrawal failed", { description: result.err });
      }
    } catch (err) {
      toast.error("Withdrawal error", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <Card
      className="bg-card border-border"
      data-ocid="investor_dashboard.deposit_withdraw_card"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          Pool Liquidity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pool balance summary */}
        <div className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground">Total Pool Balance</p>
            <p className="font-mono text-lg font-bold text-primary">
              {formatAllocation(poolBalance)}
            </p>
          </div>
          <CircleDollarSign className="h-8 w-8 text-primary/30" />
        </div>

        {/* Tab switcher */}
        <div
          className="flex gap-2"
          data-ocid="investor_dashboard.pool_action_tabs"
        >
          <button
            type="button"
            onClick={() => setActiveTab("deposit")}
            className={`flex-1 py-2 text-sm font-display font-semibold rounded-md border transition-colors ${activeTab === "deposit" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
            data-ocid="investor_dashboard.deposit_tab"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 py-2 text-sm font-display font-semibold rounded-md border transition-colors ${activeTab === "withdraw" ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
            data-ocid="investor_dashboard.withdraw_tab"
          >
            Withdraw
          </button>
        </div>

        {activeTab === "deposit" ? (
          <form onSubmit={handleDeposit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Amount (ICP)
              </Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                placeholder="10.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="font-mono"
                data-ocid="investor_dashboard.deposit_amount_input"
              />
              {depositAmount && Number(depositAmount) > 0 && (
                <p className="text-xs text-muted-foreground">
                  You will contribute{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {Number(depositAmount).toFixed(2)} ICP
                  </span>{" "}
                  to the shared pool.
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={
                isDepositing ||
                !depositAmount ||
                Number(depositAmount) <= 0 ||
                isFetching
              }
              data-ocid="investor_dashboard.deposit_submit_button"
            >
              {isDepositing ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />{" "}
                  Depositing…
                </>
              ) : (
                <>
                  <TrendingUp className="h-3.5 w-3.5" /> Deposit to Pool
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Amount (ICP)
              </Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                placeholder="10.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="font-mono"
                data-ocid="investor_dashboard.withdraw_amount_input"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Amount must not exceed your proportional pool share
              </p>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={
                isWithdrawing ||
                !withdrawAmount ||
                Number(withdrawAmount) <= 0 ||
                isFetching
              }
              data-ocid="investor_dashboard.withdraw_submit_button"
            >
              {isWithdrawing ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />{" "}
                  Withdrawing…
                </>
              ) : (
                "Withdraw from Pool"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ─── My Pool Share Card ───────────────────────────────────────────────────────
function MyPoolShareCard({
  stats,
}: {
  stats: { poolBalance: number; monthlyReturn: number; ytdReturn: number };
}) {
  // In a real implementation this would come from a per-investor query
  // For now we show the pool-wide stats as the best available proxy
  return (
    <Card
      className="bg-card border-accent/20 border"
      data-ocid="investor_dashboard.my_pool_share_card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
          <DollarSign className="h-4 w-4" />
          Pool Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/40 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total AUM</p>
            <p className="font-mono font-bold text-primary text-sm">
              {formatAllocation(stats.poolBalance)}
            </p>
          </div>
          <div className="bg-secondary/40 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Monthly Return</p>
            <p
              className={`font-mono font-bold text-sm ${stats.monthlyReturn >= 0 ? "text-chart-1" : "text-destructive"}`}
            >
              {formatPct(stats.monthlyReturn)}
            </p>
          </div>
          <div className="bg-secondary/40 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">YTD Return</p>
            <p
              className={`font-mono font-bold text-sm ${stats.ytdReturn >= 0 ? "text-chart-1" : "text-destructive"}`}
            >
              {formatPct(stats.ytdReturn)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border border-border">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Investor returns are distributed from funded trader profits. Pool
            share = 20% of all profitable trades.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InvestorDashboard() {
  const { stats, loading: statsLoading } = useInvestorStats();
  const { traders, loading: tradersLoading } = useFundedTraderList();

  const [sortKey, setSortKey] = useState<SortKey>("allocation");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedTraders = useMemo(() => {
    return [...traders].sort((a, b) => {
      let av: number | string = a[sortKey];
      let bv: number | string = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [traders, sortKey, sortDir]);

  const SortIndicator = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <span className="ml-1 text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-ocid="investor_dashboard.page">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Investor Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor pool performance, allocations, and funded trader returns.
        </p>
      </div>

      {/* Deposit/Withdraw + My Share — shown alongside pool overview */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MyPoolShareCard stats={stats} />
          </div>
          <div>
            <PoolDepositWithdrawPanel poolBalance={stats.poolBalance} />
          </div>
        </div>
      )}

      {/* Pool overview */}
      <section data-ocid="investor_dashboard.pool_section">
        <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Pool Stats
        </h2>
        {statsLoading ? (
          <PoolOverviewSkeleton />
        ) : !stats ? (
          <Card
            className="bg-card border-border p-8 text-center"
            data-ocid="investor_dashboard.pool_empty_state"
          >
            <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Pool stats unavailable. Data will appear once the pool is active.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total AUM"
              value={formatAllocation(stats.poolBalance)}
              icon={Wallet}
              colorClass="text-primary"
            />
            <StatCard
              label="Total Allocated"
              value={formatAllocation(stats.totalAllocated)}
              icon={BarChart2}
            />
            <StatCard
              label="Total Traders"
              value={String(stats.traderCount)}
              icon={Users}
              subtitle={`${String(stats.fundedTraderCount)} funded`}
            />
            <StatCard
              label="Funded Traders"
              value={String(stats.fundedTraderCount)}
              icon={TrendingUp}
              colorClass="text-chart-1"
            />
            <StatCard
              label="Avg Consistency"
              value={`${stats.avgConsistency.toFixed(1)}%`}
              icon={Activity}
              colorClass={
                formatConsistencyScore(stats.avgConsistency).colorClass
              }
            />
            <StatCard
              label="Weekly Return"
              value={formatPct(stats.weeklyReturn)}
              icon={TrendingUp}
              colorClass={
                stats.weeklyReturn >= 0 ? "text-chart-1" : "text-chart-2"
              }
            />
            <StatCard
              label="Monthly Return"
              value={formatPct(stats.monthlyReturn)}
              icon={TrendingUp}
              colorClass={
                stats.monthlyReturn >= 0 ? "text-chart-1" : "text-chart-2"
              }
            />
            <StatCard
              label="YTD Return"
              value={formatPct(stats.ytdReturn)}
              icon={TrendingUp}
              colorClass={
                stats.ytdReturn >= 0 ? "text-chart-1" : "text-chart-2"
              }
            />
          </div>
        )}
      </section>

      {/* Performance metrics */}
      {stats && (
        <section data-ocid="investor_dashboard.performance_section">
          <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Performance Returns
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReturnCard
              label="Weekly Return"
              value={stats.weeklyReturn}
              period="Last 7 days"
            />
            <ReturnCard
              label="Monthly Return"
              value={stats.monthlyReturn}
              period="Last 30 days"
            />
            <ReturnCard
              label="YTD Return"
              value={stats.ytdReturn}
              period="Year to date"
            />
          </div>
        </section>
      )}

      {/* Funded traders table */}
      <section data-ocid="investor_dashboard.traders_section">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Funded Traders
              {traders.length > 0 && (
                <Badge variant="secondary" className="ml-1 font-mono text-xs">
                  {traders.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tradersLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : traders.length === 0 ? (
              <div
                className="p-8 text-center"
                data-ocid="investor_dashboard.traders_empty_state"
              >
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No funded traders yet. Traders who pass both challenge phases
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        <button
                          type="button"
                          className="hover:text-foreground transition-colors duration-200"
                          onClick={() => handleSort("username")}
                          data-ocid="investor_dashboard.sort_username"
                        >
                          Trader <SortIndicator col="username" />
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        <button
                          type="button"
                          className="hover:text-foreground transition-colors duration-200"
                          onClick={() => handleSort("allocation")}
                          data-ocid="investor_dashboard.sort_allocation"
                        >
                          Allocation <SortIndicator col="allocation" />
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        <button
                          type="button"
                          className="hover:text-foreground transition-colors duration-200"
                          onClick={() => handleSort("consistencyScore")}
                          data-ocid="investor_dashboard.sort_consistency"
                        >
                          Consistency <SortIndicator col="consistencyScore" />
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        <button
                          type="button"
                          className="hover:text-foreground transition-colors duration-200"
                          onClick={() => handleSort("monthlyReturn")}
                          data-ocid="investor_dashboard.sort_monthly_return"
                        >
                          Monthly Return <SortIndicator col="monthlyReturn" />
                        </button>
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTraders.map((trader, idx) => {
                      const cs = formatConsistencyScore(
                        trader.consistencyScore,
                      );
                      return (
                        <tr
                          key={trader.traderId.toText()}
                          className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-150"
                          data-ocid={`investor_dashboard.trader_row.${idx + 1}`}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-display font-medium text-foreground">
                                {trader.username ||
                                  truncatePrincipal(trader.traderId.toText())}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {truncatePrincipal(trader.traderId.toText())}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="mono-price text-foreground">
                              {formatAllocation(trader.allocation)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`mono-price font-semibold ${cs.colorClass}`}
                            >
                              {cs.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`mono-price font-semibold ${
                                trader.monthlyReturn >= 0
                                  ? "text-chart-1"
                                  : "text-chart-2"
                              }`}
                            >
                              {formatPct(trader.monthlyReturn)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant={
                                trader.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs font-mono capitalize"
                              data-ocid={`investor_dashboard.trader_status.${idx + 1}`}
                            >
                              {trader.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
