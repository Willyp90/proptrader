import { c as createLucideIcon, d as useActor, a as useAuth, e as useQuery, f as createActor, u as useNavigate, j as jsxRuntimeExports, S as Skeleton, g as ShieldCheck, B as Button, T as TrendingUp, A as Activity, W as Wallet, N as formatAllocation, Q as formatConsistencyScore, r as reactExports } from "./index-n7jmytJ0.js";
import { B as Badge } from "./badge-CnY4HZ9o.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-D-cSpQXq.js";
import { L as Label, I as Input } from "./label-C63p0xgA.js";
import { a as useFundedAccount, u as useConsistencyScore, b as usePayoutHistory } from "./usePayoutHistory-3wiDG2r4.js";
import { C as ChevronRight } from "./chevron-right-D5GIST7B.js";
import { I as Info } from "./info-7dI5ak22.js";
import { C as Clock } from "./clock-BLYUaLr8.js";
import { D as DollarSign } from "./dollar-sign-CIdbwj6c.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
];
const ArrowDown = createLucideIcon("arrow-down", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
];
const ArrowUp = createLucideIcon("arrow-up", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode);
function useConsistencyScoreHistory(limit = 10) {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const query = useQuery({
    queryKey: ["consistencyScoreHistory", principal, limit],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getConsistencyScoreHistory(BigInt(limit));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 55e3,
    refetchInterval: 6e4
  });
  return {
    history: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error
  };
}
function formatDate(ts) {
  const ms = Number(ts / 1000000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function AccountSummaryCard({
  funded
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "funded_account.summary_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 text-muted-foreground" }),
          "Account Summary"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide mb-1", children: "Allocation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-lg font-bold text-primary", children: formatAllocation(funded.allocationCurrent) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: [
              "Base: ",
              formatAllocation(funded.allocationBase)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide mb-1", children: "Performance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-lg font-bold text-accent", children: [
              funded.performanceMultiplier.toFixed(2),
              "×"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Multiplier" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide mb-1", children: "Months Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-lg font-bold text-foreground", children: String(funded.monthsActive) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "months" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide mb-1", children: "Account Balance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-foreground", children: formatAllocation(funded.accountBalance) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide mb-1", children: "Last Review" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-sm text-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3 text-muted-foreground" }),
              formatDate(funded.lastReviewDate)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display uppercase tracking-wide mb-1", children: "Next Review" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-sm text-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-muted-foreground" }),
              formatDate(funded.nextReviewDate)
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
function ScoreBar({
  label,
  value,
  weight
}) {
  const barColor = value >= 80 ? "bg-chart-1" : value >= 65 ? "bg-chart-3" : "bg-chart-2";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-display", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-mono", children: weight }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: value.toFixed(1) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-full rounded-full transition-all duration-500 ${barColor}`,
        style: { width: `${Math.min(100, value)}%` }
      }
    ) })
  ] });
}
function ConsistencyPanel({
  score,
  history
}) {
  const cs = formatConsistencyScore(score.score);
  const prevScore = history.length > 1 ? history[1].score : null;
  const trend = prevScore !== null ? score.score > prevScore ? "up" : score.score < prevScore ? "down" : "flat" : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "funded_account.consistency_panel",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-muted-foreground" }),
          "Consistency Score"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-mono text-5xl font-bold ${cs.colorClass}`, children: score.score.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                trend === "up" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-xs text-chart-1 font-mono", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-3 w-3" }),
                  "vs last"
                ] }),
                trend === "down" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-xs text-chart-2 font-mono", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3 w-3" }),
                  "vs last"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-display", children: "/ 100 composite score" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ScoreBar,
              {
                label: "Profit Distribution",
                value: score.profitDistScore,
                weight: "35%"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreBar, { label: "Win Rate", value: score.winRateScore, weight: "30%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ScoreBar,
              {
                label: "Drawdown Control",
                value: score.drawdownCtrlScore,
                weight: "20%"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ScoreBar,
              {
                label: "Trading Activity",
                value: score.activityScore,
                weight: "15%"
              }
            )
          ] }),
          history.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "space-y-2 pt-2 border-t border-border",
              "data-ocid": "funded_account.consistency_history_chart",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide", children: "Score History" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-1 h-16", children: [...history].reverse().slice(0, 10).map((h, i) => {
                  const pct = Math.min(100, h.score);
                  const barColor = h.score >= 80 ? "bg-chart-1" : h.score >= 65 ? "bg-chart-3" : "bg-chart-2";
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex-1 flex flex-col items-center gap-0.5 group",
                      title: `${h.score.toFixed(1)} — ${formatDate(h.timestamp)}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full flex items-end justify-center h-14", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: `w-full rounded-t transition-all ${barColor} opacity-80 group-hover:opacity-100`,
                            style: { height: `${pct}%` }
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-muted-foreground leading-none", children: h.score.toFixed(0) })
                      ]
                    },
                    i
                  );
                }) })
              ]
            }
          )
        ] })
      ]
    }
  );
}
function PayoutStatusBadge({ status }) {
  if (status === "paid") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-success text-xs font-mono", children: "Paid" });
  }
  if (status === "pending") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-warning text-xs font-mono", children: "Pending" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs font-mono capitalize", children: status });
}
function PayoutHistorySection() {
  const [startInput, setStartInput] = reactExports.useState("");
  const [endInput, setEndInput] = reactExports.useState("");
  const startTime = startInput ? BigInt(new Date(startInput).getTime()) * 1000000n : void 0;
  const endTime = endInput ? BigInt(new Date(endInput).getTime()) * 1000000n : void 0;
  const { payouts, loading } = usePayoutHistory(startTime, endTime, 100);
  const totals = reactExports.useMemo(() => {
    return payouts.reduce(
      (acc, p) => ({
        profit: acc.profit + p.profitAmount,
        traderShare: acc.traderShare + p.traderShare,
        investorShare: acc.investorShare + p.investorShare,
        platformShare: acc.platformShare + p.platformShare
      }),
      { profit: 0, traderShare: 0, investorShare: 0, platformShare: 0 }
    );
  }, [payouts]);
  function clearFilters() {
    setStartInput("");
    setEndInput("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "funded_account.payout_history_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
            "Payout History"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-wrap items-end gap-2",
              "data-ocid": "funded_account.date_filter",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "From" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "date",
                      value: startInput,
                      onChange: (e) => setStartInput(e.target.value),
                      className: "h-7 text-xs w-36",
                      "data-ocid": "funded_account.date_from_input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "To" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "date",
                      value: endInput,
                      onChange: (e) => setEndInput(e.target.value),
                      className: "h-7 text-xs w-36",
                      "data-ocid": "funded_account.date_to_input"
                    }
                  )
                ] }),
                (startInput || endInput) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "h-7 text-xs text-muted-foreground",
                    onClick: clearFilters,
                    "data-ocid": "funded_account.clear_filter_button",
                    children: "Clear"
                  }
                )
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-3", children: Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)
        )) }) : payouts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-8 text-center",
            "data-ocid": "funded_account.payouts_empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-8 w-8 text-muted-foreground mx-auto mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No payouts yet. Payouts are processed when profitable positions are closed." })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: "Trade P&L" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 text-xs font-display font-semibold text-chart-1 uppercase tracking-wide whitespace-nowrap", children: "You (70%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden sm:table-cell", children: "Pool (20%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell", children: "Platform (10%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-3 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap", children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: payouts.map((payout, idx) => {
            const traderAmt = payout.profitAmount * 0.7;
            const poolAmt = payout.profitAmount * 0.2;
            const platformAmt = payout.profitAmount * 0.1;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: "border-b border-border last:border-0 hover:bg-muted/10 transition-colors duration-150",
                "data-ocid": `funded_account.payout_row.${idx + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "td",
                    {
                      className: "px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap",
                      title: formatDate(payout.closeTime),
                      children: formatDate(payout.closeTime)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price text-chart-1", children: [
                    "+",
                    payout.profitAmount.toFixed(2)
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price font-bold text-chart-1", children: [
                    "+",
                    traderAmt.toFixed(2),
                    " ICP"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right hidden sm:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price text-muted-foreground", children: [
                    "+",
                    poolAmt.toFixed(2),
                    " ICP"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right hidden md:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price text-muted-foreground", children: [
                    "+",
                    platformAmt.toFixed(2),
                    " ICP"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PayoutStatusBadge, { status: payout.status }) })
                ]
              },
              String(payout.tradeId)
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs font-display font-bold text-foreground", children: "Totals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price font-bold text-chart-1", children: [
              "+",
              totals.profit.toFixed(2)
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price font-bold text-chart-1", children: [
              "+",
              (totals.profit * 0.7).toFixed(2),
              " ICP"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right hidden sm:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price text-muted-foreground", children: [
              "+",
              (totals.profit * 0.2).toFixed(2),
              " ICP"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right hidden md:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price text-muted-foreground", children: [
              "+",
              (totals.profit * 0.1).toFixed(2),
              " ICP"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3" })
          ] }) })
        ] }) }) })
      ]
    }
  );
}
function FundedAccountPage() {
  const { funded, loading: fundedLoading } = useFundedAccount();
  const { score, loading: scoreLoading } = useConsistencyScore();
  const { history, loading: historyLoading } = useConsistencyScoreHistory(10);
  const navigate = useNavigate();
  const isLoading = fundedLoading || scoreLoading;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "funded_account.loading_state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" })
    ] });
  }
  if (!funded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "funded_account.page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Funded Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Manage your funded allocation, performance, and payouts." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "bg-card border-border p-8 text-center",
          "data-ocid": "funded_account.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground mb-1", children: "No funded account yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Complete Phase 1 and Phase 2 of the PropTrader Challenge to earn a funded account with real capital allocation." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "default",
                size: "sm",
                className: "gap-2",
                onClick: () => navigate({ to: "/dashboard/challenge" }),
                "data-ocid": "funded_account.start_challenge_button",
                children: [
                  "Start Challenge",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
                ]
              }
            )
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "funded_account.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Funded Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "badge-real flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
            "FUNDED"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Real capital allocation. Your performance directly impacts your allocation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/30 rounded-md px-3 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
        "Unrealized P&L:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: `font-semibold ${funded.unrealizedPnl >= 0 ? "text-chart-1" : "text-chart-2"}`,
            children: [
              funded.unrealizedPnl >= 0 ? "+" : "",
              funded.unrealizedPnl.toFixed(2)
            ]
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AccountSummaryCard, { funded }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "bg-card border-accent/20 border",
        "data-ocid": "funded_account.profit_split_card",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-4 px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 text-accent" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-display font-semibold text-foreground mb-2", children: "Profit Split: 70% to you · 20% to investor pool · 10% to platform" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-chart-1/10 border border-chart-1/20 rounded-md px-3 py-1.5 min-w-[90px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-chart-1 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-display uppercase tracking-wide", children: "You" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-bold text-chart-1 text-sm", children: "70%" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-md px-3 py-1.5 min-w-[90px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-primary shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-display uppercase tracking-wide", children: "Pool" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-bold text-primary text-sm", children: "20%" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-muted/40 border border-border rounded-md px-3 py-1.5 min-w-[90px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-muted-foreground/50 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-display uppercase tracking-wide", children: "Platform" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-bold text-foreground text-sm", children: "10%" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Your profit share is 70% of all realized gains on your funded account." })
          ] })
        ] }) })
      }
    ),
    score ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConsistencyPanel,
      {
        score,
        history: historyLoading ? [] : history
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-8 w-8 text-muted-foreground mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Consistency score will appear after your first trade cycle." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PayoutHistorySection, {})
  ] });
}
export {
  FundedAccountPage as default
};
