import { c as createLucideIcon, d as useActor, e as useQuery, f as createActor, r as reactExports, j as jsxRuntimeExports, W as Wallet, N as formatAllocation, U as Users, T as TrendingUp, A as Activity, Q as formatConsistencyScore, Y as formatPct, S as Skeleton, F as truncatePrincipal, B as Button } from "./index-n7jmytJ0.js";
import { B as Badge } from "./badge-CnY4HZ9o.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-D-cSpQXq.js";
import { L as Label, I as Input } from "./label-C63p0xgA.js";
import { u as ue } from "./index-BF_U0nn3.js";
import { D as DollarSign } from "./dollar-sign-CIdbwj6c.js";
import { I as Info } from "./info-7dI5ak22.js";
import { C as CircleDollarSign } from "./circle-dollar-sign-nR0mlfMe.js";
import { A as ArrowUpRight, a as ArrowDownRight } from "./arrow-up-right-G2s12fe6.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["line", { x1: "18", x2: "18", y1: "20", y2: "10", key: "1xfpm4" }],
  ["line", { x1: "12", x2: "12", y1: "20", y2: "4", key: "be30l9" }],
  ["line", { x1: "6", x2: "6", y1: "20", y2: "14", key: "1r4le6" }]
];
const ChartNoAxesColumn = createLucideIcon("chart-no-axes-column", __iconNode);
function useInvestorStats() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const query = useQuery({
    queryKey: ["investorStats"],
    queryFn: async () => {
      if (!actor) return void 0;
      try {
        const result = await actor.getInvestorStats();
        if (result.__kind__ === "ok") return result.ok;
        return void 0;
      } catch {
        return void 0;
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 25e3,
    refetchInterval: 3e4
  });
  return {
    stats: query.data,
    loading: query.isLoading || actorLoading,
    error: query.error
  };
}
function useFundedTraderList() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const query = useQuery({
    queryKey: ["fundedTraderList"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFundedTraderList();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 55e3,
    refetchInterval: 6e4
  });
  return {
    traders: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error
  };
}
function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  subtitle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide truncate", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          className: `mono-lg font-bold ${colorClass ?? "text-foreground"}`,
          children: value
        }
      ),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0 ml-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }) })
  ] }) }) });
}
function ReturnCard({ label, value, period }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Icon,
        {
          className: `h-4 w-4 ${positive ? "text-chart-1" : "text-chart-2"}`
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: `font-mono text-2xl font-bold ${positive ? "text-chart-1" : "text-chart-2"}`,
        children: formatPct(value)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: period })
  ] }) });
}
function PoolOverviewSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: Array.from({ length: 8 }).map((_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-28" })
    ] }) }, i)
  )) });
}
function PoolDepositWithdrawPanel({ poolBalance }) {
  const { actor, isFetching } = useActor(createActor);
  const [depositAmount, setDepositAmount] = reactExports.useState("");
  const [withdrawAmount, setWithdrawAmount] = reactExports.useState("");
  const [isDepositing, setIsDepositing] = reactExports.useState(false);
  const [isWithdrawing, setIsWithdrawing] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("deposit");
  async function handleDeposit(e) {
    e.preventDefault();
    const amount = Number.parseFloat(depositAmount);
    if (!actor || !amount || amount <= 0) return;
    setIsDepositing(true);
    try {
      const result = await actor.depositToPool(amount);
      if (result.__kind__ === "ok") {
        ue.success("Deposit successful", {
          description: `${amount.toFixed(2)} ICP deposited to the investor pool.`
        });
        setDepositAmount("");
      } else {
        ue.error("Deposit failed", { description: result.err });
      }
    } catch (err) {
      ue.error("Deposit error", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setIsDepositing(false);
    }
  }
  async function handleWithdraw(e) {
    e.preventDefault();
    const amount = Number.parseFloat(withdrawAmount);
    if (!actor || !amount || amount <= 0) return;
    setIsWithdrawing(true);
    try {
      const result = await actor.withdrawFromPool(amount);
      if (result.__kind__ === "ok") {
        ue.success("Withdrawal initiated", {
          description: `${amount.toFixed(2)} ICP withdrawal request submitted.`
        });
        setWithdrawAmount("");
      } else {
        ue.error("Withdrawal failed", { description: result.err });
      }
    } catch (err) {
      ue.error("Withdrawal error", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setIsWithdrawing(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "investor_dashboard.deposit_withdraw_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 text-muted-foreground" }),
          "Pool Liquidity"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Pool Balance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-lg font-bold text-primary", children: formatAllocation(poolBalance) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDollarSign, { className: "h-8 w-8 text-primary/30" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex gap-2",
              "data-ocid": "investor_dashboard.pool_action_tabs",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setActiveTab("deposit"),
                    className: `flex-1 py-2 text-sm font-display font-semibold rounded-md border transition-colors ${activeTab === "deposit" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`,
                    "data-ocid": "investor_dashboard.deposit_tab",
                    children: "Deposit"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setActiveTab("withdraw"),
                    className: `flex-1 py-2 text-sm font-display font-semibold rounded-md border transition-colors ${activeTab === "withdraw" ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`,
                    "data-ocid": "investor_dashboard.withdraw_tab",
                    children: "Withdraw"
                  }
                )
              ]
            }
          ),
          activeTab === "deposit" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleDeposit, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground", children: "Amount (ICP)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0.01,
                  step: 0.01,
                  placeholder: "10.00",
                  value: depositAmount,
                  onChange: (e) => setDepositAmount(e.target.value),
                  className: "font-mono",
                  "data-ocid": "investor_dashboard.deposit_amount_input"
                }
              ),
              depositAmount && Number(depositAmount) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "You will contribute",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold text-foreground", children: [
                  Number(depositAmount).toFixed(2),
                  " ICP"
                ] }),
                " ",
                "to the shared pool."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                className: "w-full gap-2",
                disabled: isDepositing || !depositAmount || Number(depositAmount) <= 0 || isFetching,
                "data-ocid": "investor_dashboard.deposit_submit_button",
                children: isDepositing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" }),
                  " ",
                  "Depositing…"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5" }),
                  " Deposit to Pool"
                ] })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleWithdraw, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground", children: "Amount (ICP)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0.01,
                  step: 0.01,
                  placeholder: "10.00",
                  value: withdrawAmount,
                  onChange: (e) => setWithdrawAmount(e.target.value),
                  className: "font-mono",
                  "data-ocid": "investor_dashboard.withdraw_amount_input"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3" }),
                "Amount must not exceed your proportional pool share"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                variant: "outline",
                className: "w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10",
                disabled: isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0 || isFetching,
                "data-ocid": "investor_dashboard.withdraw_submit_button",
                children: isWithdrawing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" }),
                  " ",
                  "Withdrawing…"
                ] }) : "Withdraw from Pool"
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function MyPoolShareCard({
  stats
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-accent/20 border",
      "data-ocid": "investor_dashboard.my_pool_share_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-display flex items-center gap-2 text-muted-foreground uppercase tracking-widest", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
          "Pool Overview"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Total AUM" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-bold text-primary text-sm", children: formatAllocation(stats.poolBalance) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Monthly Return" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: `font-mono font-bold text-sm ${stats.monthlyReturn >= 0 ? "text-chart-1" : "text-destructive"}`,
                  children: formatPct(stats.monthlyReturn)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "YTD Return" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: `font-mono font-bold text-sm ${stats.ytdReturn >= 0 ? "text-chart-1" : "text-destructive"}`,
                  children: formatPct(stats.ytdReturn)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Investor returns are distributed from funded trader profits. Pool share = 20% of all profitable trades." })
          ] })
        ] })
      ]
    }
  );
}
function InvestorDashboard() {
  const { stats, loading: statsLoading } = useInvestorStats();
  const { traders, loading: tradersLoading } = useFundedTraderList();
  const [sortKey, setSortKey] = reactExports.useState("allocation");
  const [sortDir, setSortDir] = reactExports.useState("desc");
  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }
  const sortedTraders = reactExports.useMemo(() => {
    return [...traders].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [traders, sortKey, sortDir]);
  const SortIndicator = ({ col }) => sortKey === col ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-primary", children: sortDir === "asc" ? "↑" : "↓" }) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "investor_dashboard.page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Investor Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Monitor pool performance, allocations, and funded trader returns." })
    ] }),
    !statsLoading && stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MyPoolShareCard, { stats }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PoolDepositWithdrawPanel, { poolBalance: stats.poolBalance }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "investor_dashboard.pool_section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-display font-semibold text-muted-foreground uppercase tracking-wide mb-3", children: "Pool Stats" }),
      statsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(PoolOverviewSkeleton, {}) : !stats ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "bg-card border-border p-8 text-center",
          "data-ocid": "investor_dashboard.pool_empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-8 w-8 text-muted-foreground mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Pool stats unavailable. Data will appear once the pool is active." })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "Total AUM",
            value: formatAllocation(stats.poolBalance),
            icon: Wallet,
            colorClass: "text-primary"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "Total Allocated",
            value: formatAllocation(stats.totalAllocated),
            icon: ChartNoAxesColumn
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "Total Traders",
            value: String(stats.traderCount),
            icon: Users,
            subtitle: `${String(stats.fundedTraderCount)} funded`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "Funded Traders",
            value: String(stats.fundedTraderCount),
            icon: TrendingUp,
            colorClass: "text-chart-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "Avg Consistency",
            value: `${stats.avgConsistency.toFixed(1)}%`,
            icon: Activity,
            colorClass: formatConsistencyScore(stats.avgConsistency).colorClass
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "Weekly Return",
            value: formatPct(stats.weeklyReturn),
            icon: TrendingUp,
            colorClass: stats.weeklyReturn >= 0 ? "text-chart-1" : "text-chart-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "Monthly Return",
            value: formatPct(stats.monthlyReturn),
            icon: TrendingUp,
            colorClass: stats.monthlyReturn >= 0 ? "text-chart-1" : "text-chart-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: "YTD Return",
            value: formatPct(stats.ytdReturn),
            icon: TrendingUp,
            colorClass: stats.ytdReturn >= 0 ? "text-chart-1" : "text-chart-2"
          }
        )
      ] })
    ] }),
    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "investor_dashboard.performance_section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-display font-semibold text-muted-foreground uppercase tracking-wide mb-3", children: "Performance Returns" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReturnCard,
          {
            label: "Weekly Return",
            value: stats.weeklyReturn,
            period: "Last 7 days"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReturnCard,
          {
            label: "Monthly Return",
            value: stats.monthlyReturn,
            period: "Last 30 days"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReturnCard,
          {
            label: "YTD Return",
            value: stats.ytdReturn,
            period: "Year to date"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "data-ocid": "investor_dashboard.traders_section", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground" }),
        "Funded Traders",
        traders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1 font-mono text-xs", children: traders.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: tradersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: Array.from({ length: 3 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)
      )) }) : traders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "p-8 text-center",
          "data-ocid": "investor_dashboard.traders_empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-8 w-8 text-muted-foreground mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No funded traders yet. Traders who pass both challenge phases will appear here." })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "hover:text-foreground transition-colors duration-200",
              onClick: () => handleSort("username"),
              "data-ocid": "investor_dashboard.sort_username",
              children: [
                "Trader ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(SortIndicator, { col: "username" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "hover:text-foreground transition-colors duration-200",
              onClick: () => handleSort("allocation"),
              "data-ocid": "investor_dashboard.sort_allocation",
              children: [
                "Allocation ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(SortIndicator, { col: "allocation" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "hover:text-foreground transition-colors duration-200",
              onClick: () => handleSort("consistencyScore"),
              "data-ocid": "investor_dashboard.sort_consistency",
              children: [
                "Consistency ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(SortIndicator, { col: "consistencyScore" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "hover:text-foreground transition-colors duration-200",
              onClick: () => handleSort("monthlyReturn"),
              "data-ocid": "investor_dashboard.sort_monthly_return",
              children: [
                "Monthly Return ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(SortIndicator, { col: "monthlyReturn" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedTraders.map((trader, idx) => {
          const cs = formatConsistencyScore(
            trader.consistencyScore
          );
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: "border-b border-border last:border-0 hover:bg-muted/20 transition-colors duration-150",
              "data-ocid": `investor_dashboard.trader_row.${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-medium text-foreground", children: trader.username || truncatePrincipal(trader.traderId.toText()) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-muted-foreground", children: truncatePrincipal(trader.traderId.toText()) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono-price text-foreground", children: formatAllocation(trader.allocation) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `mono-price font-semibold ${cs.colorClass}`,
                    children: cs.label
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `mono-price font-semibold ${trader.monthlyReturn >= 0 ? "text-chart-1" : "text-chart-2"}`,
                    children: formatPct(trader.monthlyReturn)
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: trader.status === "active" ? "default" : "secondary",
                    className: "text-xs font-mono capitalize",
                    "data-ocid": `investor_dashboard.trader_status.${idx + 1}`,
                    children: trader.status
                  }
                ) })
              ]
            },
            trader.traderId.toText()
          );
        }) })
      ] }) }) })
    ] }) })
  ] });
}
export {
  InvestorDashboard as default
};
