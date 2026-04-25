import { c as createLucideIcon, d as useActor, a as useAuth, e as useQuery, f as createActor, b as useTraderProfile, C as ChallengeStatus, j as jsxRuntimeExports, L as Link, B as Button, T as TrendingUp, S as Skeleton, A as Activity, g as ShieldCheck, h as formatPrice, i as formatPnl, k as ChallengePhase, l as TradeSide, E as ExecutionType } from "./index-n7jmytJ0.js";
import { B as Badge } from "./badge-CnY4HZ9o.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-D-cSpQXq.js";
import { u as useChallenge, C as CircleCheck } from "./useChallenge-DgbNQd54.js";
import { u as useConsistencyScore, a as useFundedAccount, b as usePayoutHistory } from "./usePayoutHistory-3wiDG2r4.js";
import { I as Info } from "./info-7dI5ak22.js";
import { C as CircleX, Z as Zap } from "./zap-DcHUhA89.js";
import { T as TriangleAlert } from "./triangle-alert-DZL-It_Q.js";
import { C as Clock } from "./clock-BLYUaLr8.js";
import { C as CircleDollarSign } from "./circle-dollar-sign-nR0mlfMe.js";
import { A as ArrowUpRight, a as ArrowDownRight } from "./arrow-up-right-G2s12fe6.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M17.5 17.5 16 16.3V14", key: "akvzfd" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
];
const CalendarClock = createLucideIcon("calendar-clock", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
function usePhaseStatus() {
  var _a, _b, _c, _d;
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const query = useQuery({
    queryKey: ["phaseStatus", principal],
    queryFn: async () => {
      if (!actor) return void 0;
      try {
        const result = await actor.getMyPhaseStatus();
        if (result.__kind__ === "ok") return result.ok;
        return void 0;
      } catch {
        return void 0;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 4e3,
    refetchInterval: 5e3
  });
  return {
    phase: (_a = query.data) == null ? void 0 : _a.phase,
    timeRemainingDays: (_b = query.data) == null ? void 0 : _b.timeRemainingDays,
    profitProgress: (_c = query.data) == null ? void 0 : _c.profitProgress,
    consistencyProgress: (_d = query.data) == null ? void 0 : _d.consistencyProgress,
    loading: query.isLoading || actorLoading,
    error: query.error
  };
}
function fmtPct(v) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}
function fmtDate(ts) {
  return new Date(Number(ts) / 1e6).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function fmtShortDate(ts) {
  return new Date(Number(ts) / 1e6).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function fmtRelativeTime(ts) {
  const ms = Date.now() - Number(ts) / 1e6;
  if (ms < 6e4) return `${Math.floor(ms / 1e3)}s ago`;
  if (ms < 36e5) return `${Math.floor(ms / 6e4)}m ago`;
  if (ms < 864e5) return `${Math.floor(ms / 36e5)}h ago`;
  return fmtDate(ts);
}
function statusMeta(status) {
  switch (status) {
    case ChallengeStatus.active:
      return {
        label: "ACTIVE",
        cls: "bg-primary/10 text-primary border-primary/30"
      };
    case ChallengeStatus.passed:
      return {
        label: "PASSED",
        cls: "bg-chart-1/15 text-chart-1 border-chart-1/30"
      };
    case ChallengeStatus.failed:
      return {
        label: "FAILED",
        cls: "bg-destructive/15 text-destructive border-destructive/30"
      };
    default:
      return {
        label: "PAUSED",
        cls: "bg-muted text-muted-foreground border-border"
      };
  }
}
function scoreColor(score) {
  if (score > 80) return "text-accent";
  if (score >= 65) return "text-chart-1";
  if (score >= 50) return "text-chart-3";
  return "text-destructive";
}
function ringStroke(score) {
  if (score > 80) return "var(--color-accent, oklch(0.72 0.18 60))";
  if (score >= 65) return "var(--color-chart-1, oklch(0.62 0.22 150))";
  if (score >= 50) return "var(--color-chart-3, oklch(0.7 0.15 85))";
  return "var(--color-destructive, oklch(0.52 0.22 25))";
}
function phaseLabel(phase) {
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
function ExecutionModeBanner({ mode }) {
  return mode === "funded" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 w-fit", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-accent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-real text-xs font-bold tracking-widest", children: "REAL EXECUTION" })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 w-fit", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-simulated text-xs font-bold tracking-widest", children: "SIMULATED EXECUTION" })
  ] });
}
function DrawdownBar({ pct, limitPct }) {
  const ratio = Math.min(Math.abs(pct) / limitPct * 100, 100);
  const color = ratio >= 80 ? "bg-destructive" : ratio >= 50 ? "bg-chart-3" : "bg-chart-1";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Drawdown" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
        Math.abs(pct).toFixed(2),
        "% / ",
        limitPct.toFixed(0),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-full rounded-full transition-all duration-500 ${color}`,
        style: { width: `${ratio}%` }
      }
    ) })
  ] });
}
function ChallengeCard({ challenge }) {
  const currentPnl = challenge.currentBalance - challenge.startingBalance;
  const pnlPct = currentPnl / challenge.startingBalance * 100;
  const drawdownPct = currentPnl < 0 ? Math.abs(currentPnl) / challenge.startingBalance * 100 : 0;
  const st = statusMeta(challenge.status);
  const daysElapsed = Math.floor(
    (Date.now() - Number(challenge.startTime) / 1e6) / 864e5
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "trader_dashboard.challenge_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Challenge Overview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: `text-xs font-bold ${st.cls}`,
              "data-ocid": "trader_dashboard.challenge_status",
              children: st.label
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Starting" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mono-price", children: formatPrice(challenge.startingBalance) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Current" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mono-price", children: formatPrice(challenge.currentBalance) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "P&L" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "p",
                {
                  className: `mono-price font-semibold ${currentPnl >= 0 ? "text-chart-1" : "text-destructive"}`,
                  children: [
                    formatPnl(currentPnl),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs opacity-70", children: [
                      "(",
                      fmtPct(pnlPct),
                      ")"
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price", children: [
                daysElapsed,
                "d"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DrawdownBar,
            {
              pct: drawdownPct,
              limitPct: challenge.totalDrawdownLimitPct
            }
          ),
          challenge.status === ChallengeStatus.passed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center gap-3 p-3 rounded-md border border-accent/30 bg-accent/10",
              "data-ocid": "trader_dashboard.funded_banner",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 text-accent shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-display font-bold text-accent", children: "You're Funded!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Challenge passed — real capital allocated. Trade with REAL execution." })
                ] })
              ]
            }
          )
        ] })
      ]
    }
  );
}
function NoChallengeCard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      className: "bg-card border-border border-dashed",
      "data-ocid": "trader_dashboard.no_challenge_card",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-10 flex flex-col items-center gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-6 w-6 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground", children: "No Active Challenge" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Start a challenge to begin trading with live DEX price feeds." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/challenge", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "gap-2",
            "data-ocid": "trader_dashboard.start_challenge_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
              "Start a Challenge"
            ]
          }
        ) })
      ] })
    }
  );
}
function TradeRow({ trade, idx }) {
  const isProfit = trade.pnl >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      className: "border-b border-border/50 hover:bg-secondary/30 transition-colors duration-150",
      "data-ocid": `trader_dashboard.trade.${idx}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            className: "px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap",
            title: fmtDate(trade.timestamp),
            children: fmtRelativeTime(trade.timestamp)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs font-mono font-medium", children: trade.pair }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: trade.side === TradeSide.buy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-chart-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }),
          " BUY"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-3 w-3" }),
          " SELL"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs font-mono text-right", children: trade.quantity.toFixed(4) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs font-mono text-right", children: formatPrice(trade.fillPrice) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            className: `px-4 py-2.5 text-xs font-mono text-right font-semibold ${isProfit ? "text-chart-1" : "text-destructive"}`,
            children: formatPnl(trade.pnl)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right", children: trade.executionType === ExecutionType.real ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-real text-xs", children: "REAL" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-simulated text-xs", children: "SIM" }) })
      ]
    }
  );
}
function ConsistencyRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score / 100 * circumference;
  const stroke = ringStroke(score);
  const textCls = scoreColor(score);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center w-36 h-36 shrink-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        className: "absolute inset-0 w-full h-full -rotate-90",
        viewBox: "0 0 128 128",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "circle",
            {
              cx: "64",
              cy: "64",
              r: radius,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "8",
              className: "text-secondary"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "circle",
            {
              cx: "64",
              cy: "64",
              r: radius,
              fill: "none",
              stroke,
              strokeWidth: "8",
              strokeLinecap: "round",
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              style: {
                transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `text-2xl font-mono font-bold leading-none ${textCls}`,
          children: score.toFixed(0)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground mt-0.5", children: "/ 100" })
    ] })
  ] });
}
function ComponentScoreCard({
  label,
  value,
  weight,
  icon
}) {
  const ratio = Math.min(value / 100, 1);
  const barColor = value > 80 ? "bg-accent" : value >= 65 ? "bg-chart-1" : value >= 50 ? "bg-chart-3" : "bg-destructive";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-lg p-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `text-xs font-mono font-semibold ${scoreColor(value)}`,
          children: value.toFixed(0)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-full rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-full rounded-full ${barColor}`,
        style: { width: `${ratio * 100}%`, transition: "width 0.6s ease" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground opacity-60", children: [
      weight,
      " weight"
    ] })
  ] });
}
function ConsistencyScoreSection({
  score
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "trader_dashboard.consistency_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Consistency Score" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !score ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-36 h-36 rounded-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 flex-1 w-full", children: ["a", "b", "c", "d"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20" }, k)) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ConsistencyRing, { score: score.score }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 flex-1 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ComponentScoreCard,
              {
                label: "Profit Distribution",
                value: score.profitDistScore,
                weight: "35%",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ComponentScoreCard,
              {
                label: "Win Rate",
                value: score.winRateScore,
                weight: "30%",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ComponentScoreCard,
              {
                label: "Drawdown Control",
                value: score.drawdownCtrlScore,
                weight: "20%",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ComponentScoreCard,
              {
                label: "Trading Activity",
                value: score.activityScore,
                weight: "15%",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5" })
              }
            )
          ] })
        ] }) })
      ]
    }
  );
}
function TrafficLight({
  profitPct,
  consistencyPct
}) {
  const avg = (profitPct + consistencyPct) / 2;
  const isGreen = avg >= 70;
  const isYellow = avg >= 40 && !isGreen;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 shrink-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 bg-secondary/60 rounded-xl p-2 border border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `h-5 w-5 rounded-full border-2 ${isGreen ? "bg-chart-1 border-chart-1 shadow-[0_0_8px_oklch(0.62_0.22_150/0.6)]" : "bg-secondary border-border"}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `h-5 w-5 rounded-full border-2 ${isYellow ? "bg-chart-3 border-chart-3 shadow-[0_0_8px_oklch(0.7_0.15_85/0.6)]" : "bg-secondary border-border"}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `h-5 w-5 rounded-full border-2 ${!isGreen && !isYellow ? "bg-destructive border-destructive shadow-[0_0_8px_oklch(0.52_0.22_25/0.6)]" : "bg-secondary border-border"}`
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: isGreen ? "ON TRACK" : isYellow ? "AT RISK" : "DANGER" })
  ] });
}
function ProgressBar({
  label,
  current,
  target,
  colorClass
}) {
  const pct = Math.min(current / Math.max(target, 1) * 100, 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-foreground", children: [
        current.toFixed(1),
        "%",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "/ ",
          target.toFixed(1),
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-full rounded-full ${colorClass}`,
        style: { width: `${pct}%`, transition: "width 0.6s ease" }
      }
    ) })
  ] });
}
function PhaseStatusSection({
  phase,
  profitProgress,
  consistencyProgress,
  timeRemainingDays,
  loading
}) {
  if (!loading && (!phase || phase === ChallengePhase.notStarted || phase === ChallengePhase.funded)) {
    return null;
  }
  const profit = profitProgress ?? 0;
  const consistency = consistencyProgress ?? 0;
  const daysLeft = timeRemainingDays !== void 0 ? Number(timeRemainingDays) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "trader_dashboard.phase_status_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Phase Progress" }),
          phase && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "text-xs font-bold border-primary/30 text-primary bg-primary/10",
              children: phaseLabel(phase)
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-24" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ProgressBar,
              {
                label: "Profit Progress",
                current: profit,
                target: 100,
                colorClass: profit >= 80 ? "bg-chart-1" : profit >= 50 ? "bg-chart-3" : "bg-destructive/70"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ProgressBar,
              {
                label: "Consistency Threshold",
                current: consistency,
                target: 100,
                colorClass: consistency >= 80 ? "bg-chart-1" : consistency >= 50 ? "bg-primary" : "bg-destructive/70"
              }
            ),
            daysLeft !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold text-foreground", children: [
                  daysLeft,
                  "d"
                ] }),
                " ",
                "remaining"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrafficLight, { profitPct: profit, consistencyPct: consistency })
        ] }) })
      ]
    }
  );
}
function FundedAccountSection({
  funded,
  loading
}) {
  if (!loading && !funded) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border border-accent/30",
      "data-ocid": "trader_dashboard.funded_account_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Funded Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "ml-1 text-xs font-bold border-accent/40 text-accent bg-accent/10",
              children: "FUNDED"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: loading || !funded ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: ["a", "b", "c", "d"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14" }, k)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDollarSign, { className: "h-3 w-3" }),
              " Allocation"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price text-accent", children: [
              funded.allocationCurrent.toFixed(2),
              " ICP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Multiplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price text-chart-1", children: [
              funded.performanceMultiplier.toFixed(2),
              "×"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Months Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price", children: [
              String(funded.monthsActive),
              "mo"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3 w-3" }),
              " Next Review"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono font-medium text-foreground", children: fmtShortDate(funded.nextReviewDate) })
          ] })
        ] }) })
      ]
    }
  );
}
function payoutStatusCls(status) {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "badge-success";
  if (s === "pending") return "badge-warning";
  return "badge-destructive";
}
function PayoutRow({ payout, idx }) {
  const traderAmt = payout.profitAmount * 0.7;
  const poolAmt = payout.profitAmount * 0.2;
  const platformAmt = payout.profitAmount * 0.1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      className: "border-b border-border/50 hover:bg-secondary/30 transition-colors duration-150",
      "data-ocid": `trader_dashboard.payout.${idx}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            className: "px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap",
            title: fmtShortDate(payout.closeTime),
            children: fmtRelativeTime(payout.closeTime)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-xs font-mono text-right text-chart-1", children: [
          "+",
          payout.profitAmount.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-xs font-mono text-right font-semibold text-accent", children: [
          traderAmt.toFixed(2),
          " ICP",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal ml-1", children: "(70%)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-xs font-mono text-right text-muted-foreground hidden sm:table-cell", children: [
          poolAmt.toFixed(2),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-60", children: "(20%)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-xs font-mono text-right text-muted-foreground hidden md:table-cell", children: [
          platformAmt.toFixed(2),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-60", children: "(10%)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${payoutStatusCls(payout.status)} text-xs`, children: payout.status.toUpperCase() }) })
      ]
    }
  );
}
function PayoutHistorySection({
  payouts,
  loading
}) {
  const recent = payouts.slice(0, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "trader_dashboard.payout_history_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Payout History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/funded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-7 text-xs text-muted-foreground hover:text-foreground",
              "data-ocid": "trader_dashboard.payout_view_all_button",
              children: "View all →"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-4 space-y-3", children: ["a", "b", "c"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" }, k)) }) : recent.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "table",
          {
            className: "w-full min-w-[480px] text-left",
            "data-ocid": "trader_dashboard.payout_table",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border bg-muted/30", children: [
                "Date",
                "Profit",
                "You (70%)",
                "Pool (20%)",
                "Platform (10%)",
                "Status"
              ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "th",
                {
                  className: `px-4 py-2 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider last:text-right ${h.includes("Pool") ? "hidden sm:table-cell" : ""} ${h.includes("Platform") ? "hidden md:table-cell" : ""}`,
                  children: h
                },
                h
              )) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: recent.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(PayoutRow, { payout: p, idx: i + 1 }, String(p.tradeId))) })
            ]
          }
        ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "py-8 text-center",
            "data-ocid": "trader_dashboard.payout_empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No payouts yet." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Payouts appear after funded trades are closed." })
            ]
          }
        ) })
      ]
    }
  );
}
function TraderDashboard() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const { profile } = useTraderProfile();
  const {
    challenge,
    isLoading: challengeLoading,
    hasActiveChallenge
  } = useChallenge();
  const { score, loading: scoreLoading } = useConsistencyScore();
  const {
    phase,
    profitProgress,
    consistencyProgress,
    timeRemainingDays,
    loading: phaseLoading
  } = usePhaseStatus();
  const { funded, loading: fundedLoading } = useFundedAccount();
  const { payouts, loading: payoutsLoading } = usePayoutHistory(
    void 0,
    void 0,
    5
  );
  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ["myTrades", principal],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTrades(BigInt(10));
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 15e3,
    refetchInterval: 2e4
  });
  const mode = (profile == null ? void 0 : profile.mode) === "funded" ? "funded" : "evaluation";
  const canTrade = hasActiveChallenge && (challenge == null ? void 0 : challenge.status) === ChallengeStatus.active;
  const isFunded = (profile == null ? void 0 : profile.mode) === "funded" || !!funded;
  const isChallengeFailed = (challenge == null ? void 0 : challenge.status) === ChallengeStatus.failed;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", "data-ocid": "trader_dashboard.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-display font-bold text-foreground tracking-tight", children: "Trader Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
          "Real-time overview ·",
          " ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExecutionModeBanner, { mode }),
        isFunded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-muted/30 text-xs text-muted-foreground cursor-default group relative",
            title: "Profit split for funded traders",
            "data-ocid": "trader_dashboard.profit_split_badge",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "70/20/10" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden group-hover:block absolute right-0 top-full mt-2 z-50 w-52 bg-popover border border-border rounded-lg p-3 shadow-lg text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground mb-1.5", children: "Profit Split" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "You (Trader)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-chart-1", children: "70%" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Investor Pool" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: "20%" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Platform" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: "10%" })
                  ] })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/trade", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            disabled: !canTrade,
            className: "gap-2",
            "data-ocid": "trader_dashboard.execute_trade_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5" }),
              "Execute Trade"
            ]
          }
        ) })
      ] })
    ] }),
    isChallengeFailed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-3 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/30",
        "data-ocid": "trader_dashboard.challenge_failed_banner",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-display font-bold text-destructive", children: "Challenge Failed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Your challenge has ended. Start a new challenge to continue trading with live DEX prices." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/challenge", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "text-xs border-destructive/40 text-destructive hover:bg-destructive/10",
              "data-ocid": "trader_dashboard.new_challenge_button",
              children: "New Challenge"
            }
          ) })
        ]
      }
    ),
    challengeLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-4", children: ["a", "b", "c", "d"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8" }, k)) })
    ] }) }) : challenge ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChallengeCard, { challenge }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoChallengeCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PhaseStatusSection,
      {
        phase,
        profitProgress,
        consistencyProgress,
        timeRemainingDays,
        loading: phaseLoading
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "bg-card border-border",
          "data-ocid": "trader_dashboard.total_trades_card",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Trades" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mono-lg", children: (trades == null ? void 0 : trades.length) ?? 0 })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "bg-card border-border",
          "data-ocid": "trader_dashboard.win_rate_card",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded bg-chart-1/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-chart-1" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Win Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mono-lg", children: trades && trades.length > 0 ? `${(trades.filter((t) => t.pnl > 0).length / trades.length * 100).toFixed(0)}%` : "—" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "bg-card border-border",
          "data-ocid": "trader_dashboard.challenge_status_card",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `h-8 w-8 rounded flex items-center justify-center shrink-0 ${(challenge == null ? void 0 : challenge.status) === ChallengeStatus.passed ? "bg-chart-1/10" : (challenge == null ? void 0 : challenge.status) === ChallengeStatus.failed ? "bg-destructive/10" : "bg-secondary"}`,
                children: (challenge == null ? void 0 : challenge.status) === ChallengeStatus.passed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-chart-1" }) : (challenge == null ? void 0 : challenge.status) === ChallengeStatus.failed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-destructive" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-muted-foreground" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Challenge" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-display font-semibold", children: challenge ? statusMeta(challenge.status).label : "None" })
            ] })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConsistencyScoreSection, { score, loading: scoreLoading }),
    isFunded && /* @__PURE__ */ jsxRuntimeExports.jsx(FundedAccountSection, { funded, loading: fundedLoading }),
    isFunded && /* @__PURE__ */ jsxRuntimeExports.jsx(PayoutHistorySection, { payouts, loading: payoutsLoading }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border",
        "data-ocid": "trader_dashboard.trades_card",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Recent Trades" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/trade", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-7 text-xs text-muted-foreground hover:text-foreground",
                "data-ocid": "trader_dashboard.new_trade_button",
                children: "+ New Trade"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: tradesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-4 space-y-3", children: ["a", "b", "c"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" }, k)) }) : trades && trades.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "table",
            {
              className: "w-full min-w-[600px] text-left",
              "data-ocid": "trader_dashboard.trades_table",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border bg-muted/30", children: [
                  "Time",
                  "Pair",
                  "Side",
                  "Qty",
                  "Fill Price",
                  "P&L",
                  "Type"
                ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "th",
                  {
                    className: "px-4 py-2 text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider",
                    children: h
                  },
                  h
                )) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: trades.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TradeRow, { trade: t, idx: i + 1 }, String(t.id))) })
              ]
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "py-10 text-center",
              "data-ocid": "trader_dashboard.trades_empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No trades yet." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: canTrade ? "Execute your first trade to see it here." : "Start a challenge to begin trading." })
              ]
            }
          ) })
        ]
      }
    )
  ] });
}
export {
  TraderDashboard as default
};
