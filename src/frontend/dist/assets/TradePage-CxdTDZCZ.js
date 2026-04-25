import { c as createLucideIcon, d as useActor, D as DexSource, e as useQuery, f as createActor, a as useAuth, r as reactExports, O as OrderStatus, j as jsxRuntimeExports, S as Skeleton, l as TradeSide, h as formatPrice, B as Button, X, s as useQueryClient, b as useTraderProfile, v as TraderMode, C as ChallengeStatus, g as ShieldCheck, A as Activity, V as ValidationStatus, T as TrendingUp, E as ExecutionType } from "./index-n7jmytJ0.js";
import { B as Badge } from "./badge-CnY4HZ9o.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-D-cSpQXq.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, R as RefreshCw } from "./dialog-q59nD3lz.js";
import { L as Label, I as Input } from "./label-C63p0xgA.js";
import { u as ue } from "./index-BF_U0nn3.js";
import { u as useChallenge, C as CircleCheck } from "./useChallenge-DgbNQd54.js";
import { T as TriangleAlert } from "./triangle-alert-DZL-It_Q.js";
import { C as CircleX, Z as Zap } from "./zap-DcHUhA89.js";
import { A as ArrowUpRight, a as ArrowDownRight } from "./arrow-up-right-G2s12fe6.js";
import { C as Clock } from "./clock-BLYUaLr8.js";
import { C as ChevronUp } from "./chevron-up-pZUjqCGg.js";
import { C as ChevronDown } from "./chevron-down-OH-bWqiN.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
];
const ChevronsUpDown = createLucideIcon("chevrons-up-down", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const Pen = createLucideIcon("pen", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 17h6v-6", key: "t6n2it" }],
  ["path", { d: "m22 17-8.5-8.5-5 5L2 7", key: "x473p" }]
];
const TrendingDown = createLucideIcon("trending-down", __iconNode);
function computeAgeMs(price) {
  if (!price) return 0;
  return Date.now() - Number(price.timestamp) / 1e6;
}
function freshnessLabel(ageMs) {
  if (ageMs < 2e3) return "Updated just now";
  if (ageMs < 6e4) return `Updated ${Math.floor(ageMs / 1e3)}s ago`;
  if (ageMs < 36e5) return `Updated ${Math.floor(ageMs / 6e4)}m ago`;
  return "Price data is stale";
}
function usePriceFeeds(pair, dex) {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const dexSource = dex === "sonic" ? DexSource.sonic : DexSource.icpSwap;
  const query = useQuery({
    queryKey: ["priceSnapshot", pair, dex],
    queryFn: async () => {
      if (!actor) return void 0;
      try {
        const result = await actor.getPriceSnapshot(pair, dexSource);
        return result ?? void 0;
      } catch {
        return void 0;
      }
    },
    enabled: !!actor && !actorLoading && !!pair && !!dex,
    staleTime: 1e3,
    refetchInterval: 2e3
  });
  const price = query.data;
  const ageMs = computeAgeMs(price);
  const isStale = (price == null ? void 0 : price.stale) === true || ageMs > 6e4;
  return {
    price,
    loading: query.isLoading || actorLoading,
    error: query.error,
    ageMs,
    isStale,
    freshnessLabel: price ? freshnessLabel(ageMs) : "No price data"
  };
}
function useOpenPositions() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const query = useQuery({
    queryKey: ["openPositions", principal],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyOpenPositions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 4e3,
    refetchInterval: 5e3
  });
  return {
    positions: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error,
    refetch: query.refetch
  };
}
function useClosedPositions(limit) {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const resolvedLimit = BigInt(limit);
  const query = useQuery({
    queryKey: ["closedPositions", principal, limit],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyClosedPositions(resolvedLimit);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 25e3,
    refetchInterval: 3e4
  });
  return {
    positions: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error,
    refetch: query.refetch
  };
}
function fmtPnl$1(v) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtTs(ts) {
  return new Date(Number(ts) / 1e6).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function durationStr(entryTs, exitTs) {
  const start = Number(entryTs) / 1e6;
  const end = exitTs ? Number(exitTs) / 1e6 : Date.now();
  const diff = Math.floor((end - start) / 1e3);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h ${Math.floor(diff % 3600 / 60)}m`;
}
function exitReasonLabel(status) {
  switch (status) {
    case OrderStatus.closed:
      return "User Close";
    case OrderStatus.liquidated:
      return "Liquidated";
    case OrderStatus.cancelled:
      return "Cancelled";
    default:
      return "Closed";
  }
}
function ClosePositionDialog({ position, onClose }) {
  const { actor } = useActor(createActor);
  const { principal } = useAuth();
  const queryClient = useQueryClient();
  const [partialSize, setPartialSize] = reactExports.useState("");
  const [isClosing, setIsClosing] = reactExports.useState(false);
  if (!position) return null;
  const isPartial = partialSize !== "" && Number(partialSize) > 0 && Number(partialSize) < position.size;
  const sizeToClose = isPartial ? Number(partialSize) : position.size;
  const unrealizedOnClose = (position.currentPrice - position.entryPrice) * sizeToClose * (position.direction === TradeSide.buy ? 1 : -1);
  async function handleClose() {
    if (!actor || !position) return;
    setIsClosing(true);
    try {
      const partial = isPartial ? sizeToClose : null;
      const result = await actor.closePosition(position.tradeId, partial);
      if (result.__kind__ === "ok") {
        ue.success("Position closed", {
          description: `P&L: ${fmtPnl$1(result.ok.realizedPnl)}`
        });
        queryClient.invalidateQueries({
          queryKey: ["openPositions", principal]
        });
        queryClient.invalidateQueries({
          queryKey: ["closedPositions", principal]
        });
        onClose();
      } else {
        ue.error("Failed to close", { description: result.err });
      }
    } catch (err) {
      ue.error("Error", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setIsClosing(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!position, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md bg-card border-border",
      "data-ocid": "positions.close_dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-destructive" }),
          " Close Position"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
            ["Pair", position.pair],
            [
              "Direction",
              position.direction === TradeSide.buy ? "Long" : "Short"
            ],
            ["Size", position.size.toFixed(4)],
            ["Entry", formatPrice(position.entryPrice)],
            ["Current", formatPrice(position.currentPrice)],
            ["Unrealized P&L", fmtPnl$1(position.unrealizedPnl)]
          ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-0.5", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: `font-mono font-semibold ${label === "Unrealized P&L" ? position.unrealizedPnl >= 0 ? "text-chart-1" : "text-destructive" : "text-foreground"}`,
                children: value
              }
            )
          ] }, label)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground", children: "Size to Close (leave blank for full)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 1e-4,
                max: position.size,
                step: 1e-4,
                placeholder: `${position.size.toFixed(4)} (full)`,
                value: partialSize,
                onChange: (e) => setPartialSize(e.target.value),
                className: "font-mono",
                "data-ocid": "positions.close_size_input"
              }
            ),
            isPartial && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Est. P&L on close:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `font-mono font-semibold ${unrealizedOnClose >= 0 ? "text-chart-1" : "text-destructive"}`,
                  children: fmtPnl$1(unrealizedOnClose)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "flex-1",
                onClick: onClose,
                "data-ocid": "positions.close_cancel_button",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90",
                onClick: handleClose,
                disabled: isClosing,
                "data-ocid": "positions.close_confirm_button",
                children: isClosing ? "Closing…" : isPartial ? `Close ${sizeToClose.toFixed(4)}` : "Close Full Position"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function EditSlTpDialog({ position, onClose }) {
  var _a, _b;
  const { actor } = useActor(createActor);
  const { principal } = useAuth();
  const queryClient = useQueryClient();
  const [sl, setSl] = reactExports.useState(((_a = position == null ? void 0 : position.stopLoss) == null ? void 0 : _a.toFixed(4)) ?? "");
  const [tp, setTp] = reactExports.useState(((_b = position == null ? void 0 : position.takeProfit) == null ? void 0 : _b.toFixed(4)) ?? "");
  const [isSaving, setIsSaving] = reactExports.useState(false);
  if (!position) return null;
  const slVal = sl !== "" ? Number(sl) : null;
  const tpVal = tp !== "" ? Number(tp) : null;
  const slWarn = slVal !== null && position.direction === TradeSide.buy && slVal >= position.entryPrice;
  const tpWarn = tpVal !== null && position.direction === TradeSide.buy && tpVal <= position.entryPrice;
  const slWarnShort = slVal !== null && position.direction === TradeSide.sell && slVal <= position.entryPrice;
  const tpWarnShort = tpVal !== null && position.direction === TradeSide.sell && tpVal >= position.entryPrice;
  async function handleSave() {
    if (!actor || !position) return;
    setIsSaving(true);
    try {
      ue.success("SL/TP updated", {
        description: `SL: ${sl || "—"}, TP: ${tp || "—"}`
      });
      queryClient.invalidateQueries({ queryKey: ["openPositions", principal] });
      onClose();
    } catch (err) {
      ue.error("Error", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setIsSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!position, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-sm bg-card border-border",
      "data-ocid": "positions.edit_sltp_dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4 text-primary" }),
          " Edit SL / TP"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            position.pair,
            " · Entry ",
            formatPrice(position.entryPrice),
            " · Current",
            " ",
            formatPrice(position.currentPrice)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-display font-semibold uppercase tracking-wider text-destructive", children: "Stop Loss" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: 1e-4,
                value: sl,
                onChange: (e) => setSl(e.target.value),
                className: "font-mono border-destructive/30 focus-visible:ring-destructive/40",
                placeholder: "No stop loss",
                "data-ocid": "positions.edit_sl_input"
              }
            ),
            (slWarn || slWarnShort) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: position.direction === TradeSide.buy ? "Stop loss should be below entry for a long." : "Stop loss should be above entry for a short." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-display font-semibold uppercase tracking-wider text-chart-1", children: "Take Profit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: 1e-4,
                value: tp,
                onChange: (e) => setTp(e.target.value),
                className: "font-mono border-chart-1/30 focus-visible:ring-chart-1/40",
                placeholder: "No take profit",
                "data-ocid": "positions.edit_tp_input"
              }
            ),
            (tpWarn || tpWarnShort) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-chart-1", children: position.direction === TradeSide.buy ? "Take profit should be above entry for a long." : "Take profit should be below entry for a short." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "flex-1",
                onClick: onClose,
                "data-ocid": "positions.edit_cancel_button",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "flex-1",
                onClick: handleSave,
                disabled: isSaving,
                "data-ocid": "positions.edit_save_button",
                children: isSaving ? "Saving…" : "Save"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function OpenPositionsTable() {
  const { positions, loading } = useOpenPositions();
  const [closeTarget, setCloseTarget] = reactExports.useState(null);
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const pendingWithdrawals = positions.filter(
    (p) => !p.simulatedFill && p.status === OrderStatus.pendingFill
  );
  const failedWithdrawals = positions.filter(
    (p) => !p.simulatedFill && p.status === OrderStatus.liquidated
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border",
        "data-ocid": "positions.open_positions_card",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: [
              "Open Positions",
              positions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-2 text-xs font-mono", children: positions.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-chart-1 animate-pulse" }),
              "Live · 5s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-0 space-y-3", children: [
            pendingWithdrawals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-start gap-2 px-3 py-2 rounded-md bg-chart-3/10 border border-chart-3/30",
                "data-ocid": "positions.pending_withdrawals_banner",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-chart-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                      pendingWithdrawals.length,
                      " withdrawal",
                      pendingWithdrawals.length > 1 ? "s" : "",
                      " pending"
                    ] }),
                    " ",
                    "— funds are being recovered from the DEX. Usually resolves within a few minutes."
                  ] })
                ]
              }
            ),
            failedWithdrawals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30",
                "data-ocid": "positions.failed_withdrawals_banner",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                      failedWithdrawals.length,
                      " withdrawal",
                      failedWithdrawals.length > 1 ? "s" : "",
                      " failed"
                    ] }),
                    " ",
                    "— please contact support for manual recovery."
                  ] })
                ]
              }
            ),
            loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 py-2", children: ["a", "b"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, k)) }) : positions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "py-8 text-center",
                "data-ocid": "positions.open_empty_state",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No open positions. Place a trade to get started." })
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border/50 text-muted-foreground", children: [
                "Pair",
                "Exchange",
                "Dir",
                "Size",
                "Entry",
                "Current",
                "Unreal. P&L",
                "SL",
                "TP",
                "Opened",
                "Actions"
              ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "th",
                {
                  className: "text-left py-2 px-2 font-display uppercase tracking-wider whitespace-nowrap",
                  children: h
                },
                h
              )) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: positions.map((pos, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                OpenPositionRow,
                {
                  pos,
                  idx: i + 1,
                  onClose: () => setCloseTarget(pos),
                  onEdit: () => setEditTarget(pos)
                },
                String(pos.tradeId)
              )) })
            ] }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClosePositionDialog,
      {
        position: closeTarget,
        onClose: () => setCloseTarget(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditSlTpDialog,
      {
        position: editTarget,
        onClose: () => setEditTarget(null)
      }
    )
  ] });
}
function OpenPositionRow({
  pos,
  idx,
  onClose,
  onEdit
}) {
  const isLong = pos.direction === TradeSide.buy;
  const pnlPositive = pos.unrealizedPnl >= 0;
  const isPendingWithdrawal = !pos.simulatedFill && pos.status === OrderStatus.pendingFill;
  const isFailedWithdrawal = !pos.simulatedFill && pos.status === OrderStatus.liquidated;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      className: "border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors",
      "data-ocid": `positions.open_position.${idx}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono font-semibold text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pos.pair }),
          pos.simulatedFill ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-simulated text-[9px]", children: "SIM" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-real text-[9px]", children: "LIVE" }),
          isPendingWithdrawal && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: "inline-flex items-center gap-0.5 text-[9px] font-bold text-chart-3 border border-chart-3/30 bg-chart-3/10 rounded px-1.5 py-0.5 cursor-help",
              title: "Your funds are being recovered from the DEX. This usually resolves within a few minutes.",
              "data-ocid": `positions.withdrawal_pending_badge.${idx}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
                "WITHDRAWAL PENDING"
              ]
            }
          ),
          isFailedWithdrawal && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: "inline-flex items-center gap-0.5 text-[9px] font-bold text-destructive border border-destructive/30 bg-destructive/10 rounded px-1.5 py-0.5 cursor-help",
              title: "Withdrawal failed. Please contact support.",
              "data-ocid": `positions.withdrawal_failed_badge.${idx}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-2.5 w-2.5" }),
                "WITHDRAWAL FAILED"
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] font-mono", children: pos.dex === DexSource.icpSwap ? "ICPSwap" : "Sonic" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2", children: isLong ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-chart-1 font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }),
          "Long"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-destructive font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-3 w-3" }),
          "Short"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono", children: pos.size.toFixed(4) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono", children: formatPrice(pos.entryPrice) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono", children: formatPrice(pos.currentPrice) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: `font-mono font-bold flex items-center gap-1 ${pnlPositive ? "text-chart-1" : "text-destructive"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `h-1.5 w-1.5 rounded-full ${pnlPositive ? "bg-chart-1" : "bg-destructive"} animate-pulse`
                }
              ),
              fmtPnl$1(pos.unrealizedPnl)
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono text-destructive", children: pos.stopLoss ? formatPrice(pos.stopLoss) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono text-chart-1", children: pos.takeProfit ? formatPrice(pos.takeProfit) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-muted-foreground whitespace-nowrap", children: fmtTs(pos.entryTime) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-6 w-6 p-0 text-muted-foreground hover:text-primary",
              onClick: onEdit,
              "data-ocid": `positions.edit_button.${idx}`,
              title: "Edit SL/TP",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-3 w-3" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-6 w-6 p-0 text-muted-foreground hover:text-destructive",
              onClick: onClose,
              "data-ocid": `positions.close_button.${idx}`,
              title: "Close position",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
            }
          )
        ] }) })
      ]
    }
  );
}
function ClosedPositionsTable() {
  const { positions, loading } = useClosedPositions(50);
  const [sortKey, setSortKey] = reactExports.useState("pnl");
  const [sortDir, setSortDir] = reactExports.useState("desc");
  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }
  const sorted = [...positions].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "pnl") cmp = a.realizedPnl - b.realizedPnl;
    else if (sortKey === "exitTime")
      cmp = Number(a.exitTime ?? 0n) - Number(b.exitTime ?? 0n);
    else cmp = a.pair.localeCompare(b.pair);
    return sortDir === "asc" ? cmp : -cmp;
  });
  function SortIcon({ k }) {
    if (sortKey !== k) return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "h-3 w-3 opacity-40" });
    return sortDir === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "bg-card border-border",
      "data-ocid": "positions.closed_positions_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Closed Positions" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-0", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 py-2", children: ["a", "b", "c"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, k)) }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "py-8 text-center",
            "data-ocid": "positions.closed_empty_state",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No closed positions yet." })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "flex items-center gap-1 font-display uppercase tracking-wider hover:text-foreground transition-colors",
                onClick: () => toggleSort("pair"),
                children: [
                  "Pair ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { k: "pair" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-display uppercase tracking-wider", children: "Dir" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-display uppercase tracking-wider", children: "Size" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-display uppercase tracking-wider whitespace-nowrap", children: "Entry / Exit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "flex items-center gap-1 font-display uppercase tracking-wider hover:text-foreground transition-colors",
                onClick: () => toggleSort("pnl"),
                children: [
                  "Realized P&L ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { k: "pnl" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2 font-display uppercase tracking-wider", children: "Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "flex items-center gap-1 font-display uppercase tracking-wider hover:text-foreground transition-colors",
                onClick: () => toggleSort("exitTime"),
                children: [
                  "Duration ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { k: "exitTime" })
                ]
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sorted.map((pos, i) => {
            const isLong = pos.direction === TradeSide.buy;
            const pnlPos = pos.realizedPnl >= 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: "border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors",
                "data-ocid": `positions.closed_position.${i + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono font-semibold text-foreground", children: pos.pair }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2", children: isLong ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-chart-1 font-bold", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }),
                    "Long"
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-destructive font-bold", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-3 w-3" }),
                    "Short"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono", children: pos.size.toFixed(4) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-2 font-mono whitespace-nowrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatPrice(pos.entryPrice) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mx-1", children: "→" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatPrice(pos.currentPrice) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "td",
                    {
                      className: `py-2.5 px-2 font-mono font-bold ${pnlPos ? "text-chart-1" : "text-destructive"}`,
                      children: fmtPnl$1(pos.realizedPnl)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-muted-foreground", children: exitReasonLabel(pos.status) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 font-mono text-muted-foreground", children: durationStr(pos.entryTime, pos.exitTime) })
                ]
              },
              String(pos.tradeId)
            );
          }) })
        ] }) }) })
      ]
    }
  );
}
const PAIRS = [
  { label: "ICP/USDT", value: "ICP/USDT" },
  { label: "BTC/USDT", value: "BTC/USDT" },
  { label: "ETH/USDT", value: "ETH/USDT" }
];
const DEXES = [
  { label: "ICPSwap", value: "icpswap", dexSource: DexSource.icpSwap },
  { label: "Sonic", value: "sonic", dexSource: DexSource.sonic }
];
const ORDER_REJECTION_MESSAGES = {
  DAILY_DRAWDOWN_BREACH: "Daily loss limit reached. Trading resumes tomorrow.",
  TOTAL_DRAWDOWN_BREACH: "Total drawdown limit reached. Challenge has ended.",
  POSITION_TOO_LARGE: "Order size exceeds the 5% account limit. Reduce your position size.",
  CHALLENGE_FAILED: "Your challenge has ended. You cannot place new trades.",
  PLATFORM_PAUSED: "Trading is temporarily paused by the platform administrator.",
  INSUFFICIENT_BALANCE: "Insufficient account balance for this trade size.",
  STALE_PRICE: "Price data is too old. Please wait for a fresh price update."
};
function mapRejectionError(raw) {
  for (const [code, message] of Object.entries(ORDER_REJECTION_MESSAGES)) {
    if (raw.includes(code)) return message;
  }
  return raw;
}
function fmtPnl(v) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtRelativeTime(ts) {
  const ms = Date.now() - Number(ts) / 1e6;
  if (ms < 6e4) return `${Math.floor(ms / 1e3)}s ago`;
  if (ms < 36e5) return `${Math.floor(ms / 6e4)}m ago`;
  if (ms < 864e5) return `${Math.floor(ms / 36e5)}h ago`;
  return new Date(Number(ts) / 1e6).toLocaleDateString();
}
function LiveTicker({ pair, dex }) {
  const { price, loading, isStale, freshnessLabel: freshnessLabel2 } = usePriceFeeds(pair, dex);
  const prevPriceRef = reactExports.useRef(null);
  const [flash, setFlash] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!price) return;
    if (prevPriceRef.current !== null && prevPriceRef.current !== price.last) {
      setFlash(price.last > prevPriceRef.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
    prevPriceRef.current = price.last;
  }, [price]);
  if (loading && !price) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-48" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" })
    ] });
  }
  if (!price) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-mono text-sm", children: "No price data yet" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", "data-ocid": "trade.live_ticker", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          className: `font-mono text-4xl font-bold tracking-tight transition-colors duration-300 ${flash === "up" ? "text-chart-1" : flash === "down" ? "text-destructive" : "text-foreground"}`,
          children: formatPrice(price.last)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 mb-1.5", children: isStale ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "flex items-center gap-1 text-[10px] text-chart-3 font-semibold",
          title: "Price data may be outdated",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-chart-3 animate-pulse" }),
            "STALE"
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-chart-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-chart-1 animate-pulse" }),
        "LIVE"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mr-1.5", children: "Bid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-destructive", children: formatPrice(price.bid) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground/40", children: "|" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mr-1.5", children: "Ask" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-chart-1", children: formatPrice(price.ask) })
      ] }),
      price.volume > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground/40", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mr-1.5", children: "Vol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: price.volume.toLocaleString("en-US", {
            maximumFractionDigits: 0
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: freshnessLabel2 })
    ] })
  ] });
}
function ModeBadge({ isFunded }) {
  const [showTip, setShowTip] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onMouseEnter: () => setShowTip(true),
        onMouseLeave: () => setShowTip(false),
        onFocus: () => setShowTip(true),
        onBlur: () => setShowTip(false),
        className: "focus:outline-none",
        "aria-label": "Mode info",
        "data-ocid": "trade.mode_badge",
        children: isFunded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 cursor-help", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-accent", children: "Live — Real Swaps" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 cursor-help", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary", children: "Simulated — Challenge Mode" })
        ] })
      }
    ),
    showTip && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute right-0 top-full mt-2 w-64 z-50 bg-popover border border-border rounded-lg p-3 shadow-lg text-xs text-muted-foreground leading-relaxed",
        "data-ocid": "trade.mode_tooltip",
        children: isFunded ? "You are a funded trader. Orders are executed as real on-chain swaps via ICPSwap or Sonic. Profits and losses affect your actual allocation." : "You are in the challenge evaluation phase. Orders are simulated fills using live prices — no real swaps are executed. P&L counts toward your challenge progress."
      }
    )
  ] });
}
function ValidationIndicator({ state }) {
  if (state === "idle") return null;
  if (state === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 text-xs text-muted-foreground",
        "data-ocid": "trade.validation_loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" }),
          "Checking risk…"
        ]
      }
    );
  }
  const result = state;
  if (result.status === ValidationStatus.approved) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-chart-1/10 border border-chart-1/20 text-xs",
        "data-ocid": "trade.validation_success_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-chart-1 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-chart-1", children: "Risk check passed — trade is within limits" })
        ]
      }
    );
  }
  if (result.status === ValidationStatus.conditional) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-chart-3/10 border border-chart-3/20 text-xs",
        "data-ocid": "trade.validation_error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-chart-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-0.5", children: [
              "Conditional — ",
              result.reasons[0] ?? "Review required"
            ] }),
            result.reasons.slice(1).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-80", children: r }, r))
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs",
      "data-ocid": "trade.validation_error_state",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-0.5", children: [
            "Rejected — ",
            result.reasons[0] ?? "Trade not allowed"
          ] }),
          result.reasons.slice(1).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-80", children: r }, r))
        ] })
      ]
    }
  );
}
function OrderRejectionAlert({
  message,
  onDismiss
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-3 px-3 py-2.5 rounded-md bg-destructive/10 border border-destructive/30",
      "data-ocid": "trade.order_rejection_alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-destructive shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive flex-1", children: message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onDismiss,
            className: "text-destructive/70 hover:text-destructive transition-colors",
            "aria-label": "Dismiss error",
            "data-ocid": "trade.order_rejection_dismiss",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ]
    }
  );
}
function TradeResultModal({
  trade,
  open,
  onClose,
  isFunded
}) {
  if (!trade) return null;
  const isProfit = trade.pnl >= 0;
  const traderShare = trade.pnl * 0.7;
  const poolShare = trade.pnl * 0.2;
  const platformShare = trade.pnl * 0.1;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md bg-card border-border",
      "data-ocid": "trade.result_dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display font-bold flex items-center gap-2", children: [
          isProfit ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-chart-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-5 w-5 text-destructive" }),
          "Trade Executed"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          isFunded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-md border border-accent/30 bg-accent/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-accent shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-accent", children: "REAL ON-CHAIN SWAP · LIVE MODE" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-md border border-primary/30 bg-primary/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-primary shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-primary", children: "SIMULATED FILL · CHALLENGE MODE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            [
              ["Fill Price", formatPrice(trade.fillPrice)],
              ["Quantity", trade.quantity.toFixed(4)]
            ].map(([label, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-semibold text-foreground", children: val })
            ] }, label)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "P&L Delta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: `font-mono font-bold text-base ${isProfit ? "text-chart-1" : "text-destructive"}`,
                  children: fmtPnl(trade.pnl)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Risk Check" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: `text-xs font-semibold ${trade.riskCheckPassed ? "text-chart-1" : "text-destructive"}`,
                  children: trade.riskCheckPassed ? "✓ Passed" : "✗ Failed"
                }
              )
            ] })
          ] }),
          isFunded && isProfit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent/5 border border-accent/20 rounded-md p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider", children: "Profit Distribution" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-0.5", children: "You (70%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-bold text-chart-1", children: fmtPnl(traderShare) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-0.5", children: "Pool (20%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-semibold text-foreground", children: fmtPnl(poolShare) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-0.5", children: "Platform (10%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-semibold text-foreground", children: fmtPnl(platformShare) })
              ] })
            ] })
          ] }),
          trade.executionType === ExecutionType.real && trade.txHash && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 rounded-md p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Transaction Hash" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `https://dashboard.internetcomputer.org/transaction/${trade.txHash}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "font-mono text-xs text-primary hover:underline flex items-center gap-1.5 break-all",
                "data-ocid": "trade.result_txhash_link",
                children: [
                  trade.txHash,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 shrink-0" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "w-full",
              onClick: onClose,
              "data-ocid": "trade.result_close_button",
              children: "Done"
            }
          )
        ] })
      ]
    }
  ) });
}
function MiniTradeRow({
  trade,
  idx,
  isFunded
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center justify-between py-2 border-b border-border/50 last:border-0 text-xs",
      "data-ocid": `trade.recent_trade.${idx}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          trade.side === TradeSide.buy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-chart-1 font-semibold flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }),
            "BUY"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-destructive font-semibold flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-3 w-3" }),
            "SELL"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-muted-foreground", children: trade.pair }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-muted-foreground/60 truncate hidden sm:block",
              title: new Date(Number(trade.timestamp) / 1e6).toLocaleString(),
              children: fmtRelativeTime(trade.timestamp)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: formatPrice(trade.fillPrice) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `font-mono font-semibold w-20 text-right ${trade.pnl >= 0 ? "text-chart-1" : "text-destructive"}`,
              children: fmtPnl(trade.pnl)
            }
          ),
          isFunded ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-real", children: "LIVE" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge-simulated", children: "SIM" })
        ] })
      ]
    }
  );
}
function StalePriceBanner() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-3 px-4 py-2.5 rounded-md bg-chart-3/10 border border-chart-3/30",
      "data-ocid": "trade.stale_price_banner",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-chart-3 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-chart-3 font-medium", children: "Price data is stale — trading paused until prices refresh" })
      ]
    }
  );
}
function ChallengeFailedBanner({ reason }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-start gap-3 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/30",
      "data-ocid": "trade.challenge_failed_banner",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-display font-bold text-destructive", children: "Challenge Failed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: reason || "Your challenge has ended. Start a new challenge to continue trading." })
        ] })
      ]
    }
  );
}
function TradePage() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { principal } = useAuth();
  const { challenge, hasActiveChallenge } = useChallenge();
  const { profile } = useTraderProfile();
  const queryClient = useQueryClient();
  const [selectedPair, setSelectedPair] = reactExports.useState(PAIRS[0]);
  const [selectedDex, setSelectedDex] = reactExports.useState(DEXES[0]);
  const [dexOpen, setDexOpen] = reactExports.useState(false);
  const [side, setSide] = reactExports.useState(TradeSide.buy);
  const [quantity, setQuantity] = reactExports.useState("1");
  const [stopLoss, setStopLoss] = reactExports.useState("");
  const [takeProfit, setTakeProfit] = reactExports.useState("");
  const [validation, setValidation] = reactExports.useState("idle");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [resultTrade, setResultTrade] = reactExports.useState(null);
  const [resultOpen, setResultOpen] = reactExports.useState(false);
  const [rejectionMessage, setRejectionMessage] = reactExports.useState(null);
  const [sizeFieldError, setSizeFieldError] = reactExports.useState(null);
  const [recentTrades, setRecentTrades] = reactExports.useState([]);
  const [recentLoading, setRecentLoading] = reactExports.useState(false);
  const isFunded = (profile == null ? void 0 : profile.mode) === TraderMode.funded;
  const canTrade = hasActiveChallenge && (challenge == null ? void 0 : challenge.status) === ChallengeStatus.active;
  const isChallengeFailed = (challenge == null ? void 0 : challenge.status) === "failed";
  const qty = Math.max(0, Number.parseFloat(quantity) || 0);
  const { price: priceData, isStale } = usePriceFeeds(
    selectedPair.value,
    selectedDex.value
  );
  const currentPrice = (priceData == null ? void 0 : priceData.last) ?? 0;
  const estimatedValue = currentPrice > 0 && qty > 0 ? qty * currentPrice : null;
  const perTradeLimit = (challenge == null ? void 0 : challenge.perTradeLimitPct) ?? 0;
  const riskWarning = challenge && estimatedValue && challenge.startingBalance > 0 ? estimatedValue / challenge.startingBalance * 100 > perTradeLimit : false;
  const slVal = stopLoss !== "" ? Number(stopLoss) : null;
  const tpVal = takeProfit !== "" ? Number(takeProfit) : null;
  const slWarn = slVal !== null && currentPrice > 0 && side === TradeSide.buy && slVal >= currentPrice;
  const tpWarn = tpVal !== null && currentPrice > 0 && side === TradeSide.buy && tpVal <= currentPrice;
  const slWarnShort = slVal !== null && currentPrice > 0 && side === TradeSide.sell && slVal <= currentPrice;
  const tpWarnShort = tpVal !== null && currentPrice > 0 && side === TradeSide.sell && tpVal >= currentPrice;
  const runValidation = reactExports.useCallback(async () => {
    if (!actor || qty <= 0 || !canTrade) return;
    setValidation("loading");
    try {
      const result = await actor.validateTradeRequest(
        selectedPair.value,
        side,
        qty,
        BigInt(50)
      );
      setValidation(result);
    } catch {
      setValidation("idle");
    }
  }, [actor, qty, selectedPair.value, side, canTrade]);
  async function fetchRecentTrades() {
    if (!actor || actorLoading) return;
    setRecentLoading(true);
    try {
      const trades = await actor.getMyTrades(BigInt(5));
      setRecentTrades(trades);
    } catch {
    } finally {
      setRecentLoading(false);
    }
  }
  async function handleSubmitTrade(e) {
    e.preventDefault();
    if (!actor || !canTrade || !challenge) return;
    if (isStale) {
      setRejectionMessage(ORDER_REJECTION_MESSAGES.STALE_PRICE);
      return;
    }
    setIsSubmitting(true);
    setRejectionMessage(null);
    setSizeFieldError(null);
    try {
      const result = await actor.executeTrade(
        challenge.id,
        selectedPair.value,
        side,
        qty
      );
      if (result.__kind__ === "ok") {
        const trade = result.ok;
        setResultTrade(trade);
        setResultOpen(true);
        setValidation("idle");
        const pnlSign = trade.pnl >= 0 ? "+" : "";
        const desc = isFunded ? `${pnlSign}$${Math.abs(trade.pnl).toFixed(2)} profit → You received $${(trade.pnl * 0.7).toFixed(2)} (70%)` : `${pnlSign}$${Math.abs(trade.pnl).toFixed(2)} simulated P&L`;
        ue.success("Trade closed", { description: desc });
        queryClient.invalidateQueries({ queryKey: ["challenge", principal] });
        queryClient.invalidateQueries({ queryKey: ["myTrades", principal] });
        queryClient.invalidateQueries({
          queryKey: ["openPositions", principal]
        });
        queryClient.invalidateQueries({ queryKey: ["phaseStatus", principal] });
        fetchRecentTrades();
      } else {
        const humanMessage = mapRejectionError(result.err);
        setRejectionMessage(humanMessage);
        if (result.err.includes("POSITION_TOO_LARGE") || result.err.includes("size")) {
          setSizeFieldError(humanMessage);
        }
        ue.error("Trade rejected", { description: humanMessage });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setRejectionMessage(msg);
      ue.error("Error executing trade", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 max-w-4xl", "data-ocid": "trade.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-display font-bold text-foreground tracking-tight", children: "Execute Trade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Live DEX prices via ICPSwap & Sonic" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ModeBadge, { isFunded })
    ] }),
    isStale && priceData && /* @__PURE__ */ jsxRuntimeExports.jsx(StalePriceBanner, {}),
    isChallengeFailed && /* @__PURE__ */ jsxRuntimeExports.jsx(ChallengeFailedBanner, {}),
    !canTrade && !isChallengeFailed && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "bg-muted/30 border-dashed border-border",
        "data-ocid": "trade.no_challenge_warning",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-chart-3 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: !hasActiveChallenge ? "No active challenge. Start one from the Challenge page before trading." : "Your challenge is not active. Only active challenges allow trading." })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-3 bg-card border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Live Price" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center gap-2 flex-wrap",
              "data-ocid": "trade.pair_select",
              children: [
                PAIRS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setSelectedPair(p),
                    "data-ocid": `trade.pair_${p.value.replace("/", "_").toLowerCase()}_button`,
                    className: `px-3 py-1.5 rounded-md border text-xs font-display font-semibold transition-smooth ${selectedPair.value === p.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`,
                    children: p.label
                  },
                  p.value
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative ml-auto", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setDexOpen((o) => !o),
                      className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary/50 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-smooth",
                      "data-ocid": "trade.dex_select",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedDex.label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3" })
                      ]
                    }
                  ),
                  dexOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-lg z-20 overflow-hidden",
                      "data-ocid": "trade.dex_dropdown_menu",
                      children: DEXES.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            setSelectedDex(d);
                            setDexOpen(false);
                          },
                          "data-ocid": `trade.dex_${d.value}_button`,
                          className: `w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted/40 ${selectedDex.value === d.value ? "text-primary" : "text-foreground"}`,
                          children: d.label
                        },
                        d.value
                      ))
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTicker, { pair: selectedPair.value, dex: selectedDex.value })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-2 bg-card border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Order" }),
          isFunded ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "text-[10px] border-accent/40 text-accent bg-accent/10 font-bold",
              children: "LIVE"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "text-[10px] border-primary/40 text-primary bg-primary/10 font-bold",
              children: "SIMULATED"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          rejectionMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            OrderRejectionAlert,
            {
              message: rejectionMessage,
              onDismiss: () => {
                setRejectionMessage(null);
                setSizeFieldError(null);
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitTrade, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground", children: "Side" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "grid grid-cols-2 gap-2",
                  "data-ocid": "trade.side_toggle",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSide(TradeSide.buy),
                        "data-ocid": "trade.buy_button",
                        className: `py-2.5 rounded-md border text-sm font-display font-bold transition-smooth flex items-center justify-center gap-1.5 ${side === TradeSide.buy ? "border-chart-1/50 bg-chart-1/15 text-chart-1" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5" }),
                          " BUY"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSide(TradeSide.sell),
                        "data-ocid": "trade.sell_button",
                        className: `py-2.5 rounded-md border text-sm font-display font-bold transition-smooth flex items-center justify-center gap-1.5 ${side === TradeSide.sell ? "border-destructive/50 bg-destructive/15 text-destructive" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-3.5 w-3.5" }),
                          " SELL"
                        ]
                      }
                    )
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Label,
                {
                  htmlFor: "qty",
                  className: "text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground",
                  children: "Quantity (tokens)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "qty",
                  type: "number",
                  min: 1e-4,
                  step: 0.01,
                  value: quantity,
                  onChange: (e) => {
                    setQuantity(e.target.value);
                    setValidation("idle");
                    setSizeFieldError(null);
                  },
                  onBlur: runValidation,
                  className: `font-mono ${sizeFieldError ? "border-destructive focus-visible:ring-destructive/30" : ""}`,
                  placeholder: "1.0000",
                  "data-ocid": "trade.quantity_input"
                }
              ),
              sizeFieldError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "p",
                {
                  className: "text-[11px] text-destructive flex items-center gap-1",
                  "data-ocid": "trade.quantity_field_error",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                    sizeFieldError
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Label,
                {
                  htmlFor: "sl",
                  className: "text-xs font-display font-semibold uppercase tracking-wider text-destructive/80",
                  children: [
                    "Stop Loss",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal normal-case", children: "(optional)" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "sl",
                  type: "number",
                  step: 1e-4,
                  value: stopLoss,
                  onChange: (e) => setStopLoss(e.target.value),
                  onBlur: runValidation,
                  className: "font-mono border-destructive/20 focus-visible:ring-destructive/30",
                  placeholder: currentPrice > 0 ? formatPrice(currentPrice * 0.97) : "—",
                  "data-ocid": "trade.stop_loss_input"
                }
              ),
              (slWarn || slWarnShort) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-destructive flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                side === TradeSide.buy ? "SL should be below current price for a long" : "SL should be above current price for a short"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Label,
                {
                  htmlFor: "tp",
                  className: "text-xs font-display font-semibold uppercase tracking-wider text-chart-1/80",
                  children: [
                    "Take Profit",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal normal-case", children: "(optional)" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "tp",
                  type: "number",
                  step: 1e-4,
                  value: takeProfit,
                  onChange: (e) => setTakeProfit(e.target.value),
                  onBlur: runValidation,
                  className: "font-mono border-chart-1/20 focus-visible:ring-chart-1/30",
                  placeholder: currentPrice > 0 ? formatPrice(currentPrice * 1.05) : "—",
                  "data-ocid": "trade.take_profit_input"
                }
              ),
              (tpWarn || tpWarnShort) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-chart-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                side === TradeSide.buy ? "TP should be above current price for a long" : "TP should be below current price for a short"
              ] })
            ] }),
            estimatedValue !== null && estimatedValue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 bg-muted/30 rounded-md px-3 py-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Est. Value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: formatPrice(estimatedValue) })
              ] }),
              perTradeLimit > 0 && challenge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "% of account" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `font-mono font-semibold ${riskWarning ? "text-chart-3" : "text-foreground"}`,
                    children: [
                      (estimatedValue / challenge.startingBalance * 100).toFixed(2),
                      "%"
                    ]
                  }
                )
              ] })
            ] }),
            riskWarning && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-start gap-2 p-2.5 rounded-md bg-chart-3/10 border border-chart-3/30",
                "data-ocid": "trade.risk_warning",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "Exceeds per-trade limit of",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-chart-3", children: [
                      perTradeLimit.toFixed(2),
                      "%"
                    ] }),
                    ". Risk check may fail."
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ValidationIndicator, { state: validation }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                className: `w-full gap-2 font-display font-bold ${side === TradeSide.buy ? "bg-chart-1 text-background hover:bg-chart-1/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`,
                disabled: !canTrade || isSubmitting || qty <= 0 || actorLoading || isStale,
                "data-ocid": "trade.submit_button",
                children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" }),
                  " ",
                  "Executing…"
                ] }) : isStale ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
                  "Waiting for price…"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }),
                  side === TradeSide.buy ? "Buy" : "Sell",
                  " ",
                  selectedPair.label.split("/")[0]
                ] })
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OpenPositionsTable, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClosedPositionsTable, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border",
        "data-ocid": "trade.recent_trades_card",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex flex-row items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-display text-muted-foreground uppercase tracking-widest", children: "Recent Trades" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-7 text-xs text-muted-foreground gap-1.5",
                onClick: fetchRecentTrades,
                disabled: recentLoading,
                "data-ocid": "trade.refresh_recent_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    RefreshCw,
                    {
                      className: `h-3 w-3 ${recentLoading ? "animate-spin" : ""}`
                    }
                  ),
                  " ",
                  "Refresh"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-0", children: recentLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 py-2", children: ["a", "b", "c"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-full" }, k)) }) : recentTrades.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: recentTrades.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MiniTradeRow,
            {
              trade: t,
              idx: i + 1,
              isFunded
            },
            String(t.id)
          )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "py-6 text-center",
              "data-ocid": "trade.recent_trades_empty_state",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No trades yet. Execute your first trade above." })
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TradeResultModal,
      {
        trade: resultTrade,
        open: resultOpen,
        onClose: () => setResultOpen(false),
        isFunded
      }
    )
  ] });
}
export {
  TradePage as default
};
