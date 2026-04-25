import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import {
  ChallengeStatus,
  DexSource,
  ExecutionType,
  TradeSide,
  TraderMode,
  ValidationStatus,
} from "../backend.d";
import type { Trade, ValidationResult } from "../backend.d";
import { useAuth } from "../hooks/useAuth";
import { useChallenge } from "../hooks/useChallenge";
import { usePriceFeeds } from "../hooks/usePriceFeeds";
import { useTraderProfile } from "../hooks/useTraderProfile";
import { formatPrice } from "../types";
import { ClosedPositionsTable, OpenPositionsTable } from "./TradePositions";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAIRS = [
  { label: "ICP/USDT", value: "ICP/USDT" },
  { label: "BTC/USDT", value: "BTC/USDT" },
  { label: "ETH/USDT", value: "ETH/USDT" },
];
const DEXES = [
  { label: "ICPSwap", value: "icpswap", dexSource: DexSource.icpSwap },
  { label: "Sonic", value: "sonic", dexSource: DexSource.sonic },
];

// ─── Error code → human message mapping ──────────────────────────────────────
const ORDER_REJECTION_MESSAGES: Record<string, string> = {
  DAILY_DRAWDOWN_BREACH: "Daily loss limit reached. Trading resumes tomorrow.",
  TOTAL_DRAWDOWN_BREACH: "Total drawdown limit reached. Challenge has ended.",
  POSITION_TOO_LARGE:
    "Order size exceeds the 5% account limit. Reduce your position size.",
  CHALLENGE_FAILED: "Your challenge has ended. You cannot place new trades.",
  PLATFORM_PAUSED:
    "Trading is temporarily paused by the platform administrator.",
  INSUFFICIENT_BALANCE: "Insufficient account balance for this trade size.",
  STALE_PRICE: "Price data is too old. Please wait for a fresh price update.",
};

function mapRejectionError(raw: string): string {
  for (const [code, message] of Object.entries(ORDER_REJECTION_MESSAGES)) {
    if (raw.includes(code)) return message;
  }
  return raw;
}

function fmtPnl(v: number) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtRelativeTime(ts: bigint): string {
  const ms = Date.now() - Number(ts) / 1_000_000;
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return new Date(Number(ts) / 1_000_000).toLocaleDateString();
}

// ─── Live Ticker ──────────────────────────────────────────────────────────────

function LiveTicker({ pair, dex }: { pair: string; dex: string }) {
  const { price, loading, isStale, freshnessLabel } = usePriceFeeds(pair, dex);
  const prevPriceRef = useRef<number | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (!price) return;
    if (prevPriceRef.current !== null && prevPriceRef.current !== price.last) {
      setFlash(price.last > prevPriceRef.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
    prevPriceRef.current = price.last;
  }, [price]);

  if (loading && !price) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!price) {
    return (
      <p className="text-muted-foreground font-mono text-sm">
        No price data yet
      </p>
    );
  }

  return (
    <div className="space-y-2" data-ocid="trade.live_ticker">
      {/* Last price */}
      <div className="flex items-end gap-3">
        <p
          className={`font-mono text-4xl font-bold tracking-tight transition-colors duration-300 ${
            flash === "up"
              ? "text-chart-1"
              : flash === "down"
                ? "text-destructive"
                : "text-foreground"
          }`}
        >
          {formatPrice(price.last)}
        </p>
        <div className="flex items-center gap-1.5 mb-1.5">
          {isStale ? (
            <span
              className="flex items-center gap-1 text-[10px] text-chart-3 font-semibold"
              title="Price data may be outdated"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-chart-3 animate-pulse" />
              STALE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-chart-1">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-1 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Bid / Ask */}
      <div className="flex items-center gap-4 text-xs">
        <div>
          <span className="text-muted-foreground mr-1.5">Bid</span>
          <span className="font-mono font-semibold text-destructive">
            {formatPrice(price.bid)}
          </span>
        </div>
        <div className="text-muted-foreground/40">|</div>
        <div>
          <span className="text-muted-foreground mr-1.5">Ask</span>
          <span className="font-mono font-semibold text-chart-1">
            {formatPrice(price.ask)}
          </span>
        </div>
        {price.volume > 0 && (
          <>
            <div className="text-muted-foreground/40">|</div>
            <div>
              <span className="text-muted-foreground mr-1.5">Vol</span>
              <span className="font-mono">
                {price.volume.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Freshness label */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{freshnessLabel}</span>
      </div>
    </div>
  );
}

// ─── Mode Badge with tooltip ──────────────────────────────────────────────────

function ModeBadge({ isFunded }: { isFunded: boolean }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        className="focus:outline-none"
        aria-label="Mode info"
        data-ocid="trade.mode_badge"
      >
        {isFunded ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 cursor-help">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold text-accent">
              Live — Real Swaps
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 cursor-help">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">
              Simulated — Challenge Mode
            </span>
          </div>
        )}
      </button>

      {showTip && (
        <div
          className="absolute right-0 top-full mt-2 w-64 z-50 bg-popover border border-border rounded-lg p-3 shadow-lg text-xs text-muted-foreground leading-relaxed"
          data-ocid="trade.mode_tooltip"
        >
          {isFunded
            ? "You are a funded trader. Orders are executed as real on-chain swaps via ICPSwap or Sonic. Profits and losses affect your actual allocation."
            : "You are in the challenge evaluation phase. Orders are simulated fills using live prices — no real swaps are executed. P&L counts toward your challenge progress."}
        </div>
      )}
    </div>
  );
}

// ─── Pre-flight Validation ────────────────────────────────────────────────────

type ValidationState = "idle" | "loading" | ValidationResult;

function ValidationIndicator({ state }: { state: ValidationState }) {
  if (state === "idle") return null;
  if (state === "loading") {
    return (
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 text-xs text-muted-foreground"
        data-ocid="trade.validation_loading_state"
      >
        <div className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
        Checking risk…
      </div>
    );
  }

  const result = state as ValidationResult;
  if (result.status === ValidationStatus.approved) {
    return (
      <div
        className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-chart-1/10 border border-chart-1/20 text-xs"
        data-ocid="trade.validation_success_state"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 shrink-0 mt-0.5" />
        <span className="text-chart-1">
          Risk check passed — trade is within limits
        </span>
      </div>
    );
  }
  if (result.status === ValidationStatus.conditional) {
    return (
      <div
        className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-chart-3/10 border border-chart-3/20 text-xs"
        data-ocid="trade.validation_error_state"
      >
        <AlertCircle className="h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" />
        <div className="text-chart-3">
          <p className="font-semibold mb-0.5">
            Conditional — {result.reasons[0] ?? "Review required"}
          </p>
          {result.reasons.slice(1).map((r) => (
            <p key={r} className="opacity-80">
              {r}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs"
      data-ocid="trade.validation_error_state"
    >
      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
      <div className="text-destructive">
        <p className="font-semibold mb-0.5">
          Rejected — {result.reasons[0] ?? "Trade not allowed"}
        </p>
        {result.reasons.slice(1).map((r) => (
          <p key={r} className="opacity-80">
            {r}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Order Rejection Alert ────────────────────────────────────────────────────

function OrderRejectionAlert({
  message,
  onDismiss,
}: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="flex items-start gap-3 px-3 py-2.5 rounded-md bg-destructive/10 border border-destructive/30"
      data-ocid="trade.order_rejection_alert"
    >
      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-sm text-destructive flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-destructive/70 hover:text-destructive transition-colors"
        aria-label="Dismiss error"
        data-ocid="trade.order_rejection_dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Trade Result Modal ───────────────────────────────────────────────────────

function TradeResultModal({
  trade,
  open,
  onClose,
  isFunded,
}: {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
  isFunded: boolean;
}) {
  if (!trade) return null;
  const isProfit = trade.pnl >= 0;
  const traderShare = trade.pnl * 0.7;
  const poolShare = trade.pnl * 0.2;
  const platformShare = trade.pnl * 0.1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-card border-border"
        data-ocid="trade.result_dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="h-5 w-5 text-chart-1" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            Trade Executed
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {isFunded ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-accent/30 bg-accent/10">
              <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
              <span className="text-xs font-semibold text-accent">
                REAL ON-CHAIN SWAP · LIVE MODE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-primary/30 bg-primary/10">
              <Activity className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary">
                SIMULATED FILL · CHALLENGE MODE
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["Fill Price", formatPrice(trade.fillPrice)],
                ["Quantity", trade.quantity.toFixed(4)],
              ] as [string, string][]
            ).map(([label, val]) => (
              <div key={label} className="bg-secondary/40 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-mono font-semibold text-foreground">{val}</p>
              </div>
            ))}
            <div className="bg-secondary/40 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">P&L Delta</p>
              <p
                className={`font-mono font-bold text-base ${isProfit ? "text-chart-1" : "text-destructive"}`}
              >
                {fmtPnl(trade.pnl)}
              </p>
            </div>
            <div className="bg-secondary/40 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Risk Check</p>
              <p
                className={`text-xs font-semibold ${trade.riskCheckPassed ? "text-chart-1" : "text-destructive"}`}
              >
                {trade.riskCheckPassed ? "✓ Passed" : "✗ Failed"}
              </p>
            </div>
          </div>

          {/* Profit split breakdown — funded only */}
          {isFunded && isProfit && (
            <div className="bg-accent/5 border border-accent/20 rounded-md p-3 space-y-2">
              <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">
                Profit Distribution
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground mb-0.5">You (70%)</p>
                  <p className="font-mono font-bold text-chart-1">
                    {fmtPnl(traderShare)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mb-0.5">Pool (20%)</p>
                  <p className="font-mono font-semibold text-foreground">
                    {fmtPnl(poolShare)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mb-0.5">Platform (10%)</p>
                  <p className="font-mono font-semibold text-foreground">
                    {fmtPnl(platformShare)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {trade.executionType === ExecutionType.real && trade.txHash && (
            <div className="bg-secondary/40 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Transaction Hash
              </p>
              <a
                href={`https://dashboard.internetcomputer.org/transaction/${trade.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary hover:underline flex items-center gap-1.5 break-all"
                data-ocid="trade.result_txhash_link"
              >
                {trade.txHash} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}

          <Button
            className="w-full"
            onClick={onClose}
            data-ocid="trade.result_close_button"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mini recent trade ────────────────────────────────────────────────────────

function MiniTradeRow({
  trade,
  idx,
  isFunded,
}: { trade: Trade; idx: number; isFunded: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 text-xs"
      data-ocid={`trade.recent_trade.${idx}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {trade.side === TradeSide.buy ? (
          <span className="text-chart-1 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" />
            BUY
          </span>
        ) : (
          <span className="text-destructive font-semibold flex items-center gap-0.5">
            <ArrowDownRight className="h-3 w-3" />
            SELL
          </span>
        )}
        <span className="font-mono text-muted-foreground">{trade.pair}</span>
        <span
          className="text-muted-foreground/60 truncate hidden sm:block"
          title={new Date(Number(trade.timestamp) / 1_000_000).toLocaleString()}
        >
          {fmtRelativeTime(trade.timestamp)}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono">{formatPrice(trade.fillPrice)}</span>
        <span
          className={`font-mono font-semibold w-20 text-right ${trade.pnl >= 0 ? "text-chart-1" : "text-destructive"}`}
        >
          {fmtPnl(trade.pnl)}
        </span>
        {isFunded ? (
          <span className="badge-real">LIVE</span>
        ) : (
          <span className="badge-simulated">SIM</span>
        )}
      </div>
    </div>
  );
}

// ─── Stale Price Banner ───────────────────────────────────────────────────────

function StalePriceBanner() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-chart-3/10 border border-chart-3/30"
      data-ocid="trade.stale_price_banner"
    >
      <AlertTriangle className="h-4 w-4 text-chart-3 shrink-0" />
      <p className="text-sm text-chart-3 font-medium">
        Price data is stale — trading paused until prices refresh
      </p>
    </div>
  );
}

// ─── Challenge Failed Banner ──────────────────────────────────────────────────

function ChallengeFailedBanner({ reason }: { reason?: string }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/30"
      data-ocid="trade.challenge_failed_banner"
    >
      <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-display font-bold text-destructive">
          Challenge Failed
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {reason ||
            "Your challenge has ended. Start a new challenge to continue trading."}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TradePage() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { principal } = useAuth();
  const { challenge, hasActiveChallenge } = useChallenge();
  const { profile } = useTraderProfile();
  const queryClient = useQueryClient();

  // Pair + DEX selection
  const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
  const [selectedDex, setSelectedDex] = useState(DEXES[0]);
  const [dexOpen, setDexOpen] = useState(false);

  // Order form
  const [side, setSide] = useState<TradeSide>(TradeSide.buy);
  const [quantity, setQuantity] = useState<string>("1");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");

  // Validation
  const [validation, setValidation] = useState<ValidationState>("idle");

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultTrade, setResultTrade] = useState<Trade | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [sizeFieldError, setSizeFieldError] = useState<string | null>(null);

  // Recent trades
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const isFunded = profile?.mode === TraderMode.funded;
  const canTrade =
    hasActiveChallenge && challenge?.status === ChallengeStatus.active;
  const isChallengeFailed = challenge?.status === ("failed" as ChallengeStatus);

  const qty = Math.max(0, Number.parseFloat(quantity) || 0);

  // Price from usePriceFeeds for estimated value
  const { price: priceData, isStale } = usePriceFeeds(
    selectedPair.value,
    selectedDex.value,
  );
  const currentPrice = priceData?.last ?? 0;
  const estimatedValue =
    currentPrice > 0 && qty > 0 ? qty * currentPrice : null;

  // Risk warning from challenge
  const perTradeLimit = challenge?.perTradeLimitPct ?? 0;
  const riskWarning =
    challenge && estimatedValue && challenge.startingBalance > 0
      ? (estimatedValue / challenge.startingBalance) * 100 > perTradeLimit
      : false;

  // SL/TP warnings
  const slVal = stopLoss !== "" ? Number(stopLoss) : null;
  const tpVal = takeProfit !== "" ? Number(takeProfit) : null;
  const slWarn =
    slVal !== null &&
    currentPrice > 0 &&
    side === TradeSide.buy &&
    slVal >= currentPrice;
  const tpWarn =
    tpVal !== null &&
    currentPrice > 0 &&
    side === TradeSide.buy &&
    tpVal <= currentPrice;
  const slWarnShort =
    slVal !== null &&
    currentPrice > 0 &&
    side === TradeSide.sell &&
    slVal <= currentPrice;
  const tpWarnShort =
    tpVal !== null &&
    currentPrice > 0 &&
    side === TradeSide.sell &&
    tpVal >= currentPrice;

  // Pre-flight validation on blur
  const runValidation = useCallback(async () => {
    if (!actor || qty <= 0 || !canTrade) return;
    setValidation("loading");
    try {
      const result = await actor.validateTradeRequest(
        selectedPair.value,
        side,
        qty,
        BigInt(50),
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
      /* silent */
    } finally {
      setRecentLoading(false);
    }
  }

  async function handleSubmitTrade(e: React.FormEvent) {
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
        qty,
      );
      if (result.__kind__ === "ok") {
        const trade = result.ok;
        setResultTrade(trade);
        setResultOpen(true);
        setValidation("idle");
        const pnlSign = trade.pnl >= 0 ? "+" : "";
        const desc = isFunded
          ? `${pnlSign}$${Math.abs(trade.pnl).toFixed(2)} profit → You received $${(trade.pnl * 0.7).toFixed(2)} (70%)`
          : `${pnlSign}$${Math.abs(trade.pnl).toFixed(2)} simulated P&L`;
        toast.success("Trade closed", { description: desc });
        queryClient.invalidateQueries({ queryKey: ["challenge", principal] });
        queryClient.invalidateQueries({ queryKey: ["myTrades", principal] });
        queryClient.invalidateQueries({
          queryKey: ["openPositions", principal],
        });
        queryClient.invalidateQueries({ queryKey: ["phaseStatus", principal] });
        fetchRecentTrades();
      } else {
        const humanMessage = mapRejectionError(result.err);
        setRejectionMessage(humanMessage);
        // If it's a size error, also set inline field error
        if (
          result.err.includes("POSITION_TOO_LARGE") ||
          result.err.includes("size")
        ) {
          setSizeFieldError(humanMessage);
        }
        toast.error("Trade rejected", { description: humanMessage });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setRejectionMessage(msg);
      toast.error("Error executing trade", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl" data-ocid="trade.page">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
            Execute Trade
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live DEX prices via ICPSwap &amp; Sonic
          </p>
        </div>
        <ModeBadge isFunded={isFunded} />
      </div>

      {/* Stale price banner */}
      {isStale && priceData && <StalePriceBanner />}

      {/* Challenge failed banner */}
      {isChallengeFailed && <ChallengeFailedBanner />}

      {/* No challenge warning */}
      {!canTrade && !isChallengeFailed && (
        <Card
          className="bg-muted/30 border-dashed border-border"
          data-ocid="trade.no_challenge_warning"
        >
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-chart-3 shrink-0" />
            <p className="text-sm text-muted-foreground">
              {!hasActiveChallenge
                ? "No active challenge. Start one from the Challenge page before trading."
                : "Your challenge is not active. Only active challenges allow trading."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Price + Order Form */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Live Ticker */}
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
              Live Price
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pair + DEX selectors */}
            <div
              className="flex items-center gap-2 flex-wrap"
              data-ocid="trade.pair_select"
            >
              {PAIRS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSelectedPair(p)}
                  data-ocid={`trade.pair_${p.value.replace("/", "_").toLowerCase()}_button`}
                  className={`px-3 py-1.5 rounded-md border text-xs font-display font-semibold transition-smooth ${
                    selectedPair.value === p.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <div className="relative ml-auto">
                <button
                  type="button"
                  onClick={() => setDexOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary/50 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-smooth"
                  data-ocid="trade.dex_select"
                >
                  <span>{selectedDex.label}</span>
                  <RefreshCw className="h-3 w-3" />
                </button>
                {dexOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-lg z-20 overflow-hidden"
                    data-ocid="trade.dex_dropdown_menu"
                  >
                    {DEXES.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => {
                          setSelectedDex(d);
                          setDexOpen(false);
                        }}
                        data-ocid={`trade.dex_${d.value}_button`}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted/40 ${selectedDex.value === d.value ? "text-primary" : "text-foreground"}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live ticker */}
            <LiveTicker pair={selectedPair.value} dex={selectedDex.value} />
          </CardContent>
        </Card>

        {/* Right: Order form */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
                Order
              </CardTitle>
              {isFunded ? (
                <Badge
                  variant="outline"
                  className="text-[10px] border-accent/40 text-accent bg-accent/10 font-bold"
                >
                  LIVE
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/40 text-primary bg-primary/10 font-bold"
                >
                  SIMULATED
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Order rejection banner */}
            {rejectionMessage && (
              <div className="mb-3">
                <OrderRejectionAlert
                  message={rejectionMessage}
                  onDismiss={() => {
                    setRejectionMessage(null);
                    setSizeFieldError(null);
                  }}
                />
              </div>
            )}

            <form onSubmit={handleSubmitTrade} className="space-y-3">
              {/* Side toggle */}
              <div className="space-y-1.5">
                <Label className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                  Side
                </Label>
                <div
                  className="grid grid-cols-2 gap-2"
                  data-ocid="trade.side_toggle"
                >
                  <button
                    type="button"
                    onClick={() => setSide(TradeSide.buy)}
                    data-ocid="trade.buy_button"
                    className={`py-2.5 rounded-md border text-sm font-display font-bold transition-smooth flex items-center justify-center gap-1.5 ${
                      side === TradeSide.buy
                        ? "border-chart-1/50 bg-chart-1/15 text-chart-1"
                        : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" /> BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide(TradeSide.sell)}
                    data-ocid="trade.sell_button"
                    className={`py-2.5 rounded-md border text-sm font-display font-bold transition-smooth flex items-center justify-center gap-1.5 ${
                      side === TradeSide.sell
                        ? "border-destructive/50 bg-destructive/15 text-destructive"
                        : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ArrowDownRight className="h-3.5 w-3.5" /> SELL
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="qty"
                  className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Quantity (tokens)
                </Label>
                <Input
                  id="qty"
                  type="number"
                  min={0.0001}
                  step={0.01}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setValidation("idle");
                    setSizeFieldError(null);
                  }}
                  onBlur={runValidation}
                  className={`font-mono ${sizeFieldError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  placeholder="1.0000"
                  data-ocid="trade.quantity_input"
                />
                {sizeFieldError && (
                  <p
                    className="text-[11px] text-destructive flex items-center gap-1"
                    data-ocid="trade.quantity_field_error"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {sizeFieldError}
                  </p>
                )}
              </div>

              {/* Stop Loss */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="sl"
                  className="text-xs font-display font-semibold uppercase tracking-wider text-destructive/80"
                >
                  Stop Loss{" "}
                  <span className="text-muted-foreground font-normal normal-case">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="sl"
                  type="number"
                  step={0.0001}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  onBlur={runValidation}
                  className="font-mono border-destructive/20 focus-visible:ring-destructive/30"
                  placeholder={
                    currentPrice > 0 ? formatPrice(currentPrice * 0.97) : "—"
                  }
                  data-ocid="trade.stop_loss_input"
                />
                {(slWarn || slWarnShort) && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {side === TradeSide.buy
                      ? "SL should be below current price for a long"
                      : "SL should be above current price for a short"}
                  </p>
                )}
              </div>

              {/* Take Profit */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="tp"
                  className="text-xs font-display font-semibold uppercase tracking-wider text-chart-1/80"
                >
                  Take Profit{" "}
                  <span className="text-muted-foreground font-normal normal-case">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="tp"
                  type="number"
                  step={0.0001}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  onBlur={runValidation}
                  className="font-mono border-chart-1/20 focus-visible:ring-chart-1/30"
                  placeholder={
                    currentPrice > 0 ? formatPrice(currentPrice * 1.05) : "—"
                  }
                  data-ocid="trade.take_profit_input"
                />
                {(tpWarn || tpWarnShort) && (
                  <p className="text-[11px] text-chart-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {side === TradeSide.buy
                      ? "TP should be above current price for a long"
                      : "TP should be below current price for a short"}
                  </p>
                )}
              </div>

              {/* Estimated value + risk */}
              {estimatedValue !== null && estimatedValue > 0 && (
                <div className="space-y-1 bg-muted/30 rounded-md px-3 py-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Est. Value</span>
                    <span className="font-mono font-semibold">
                      {formatPrice(estimatedValue)}
                    </span>
                  </div>
                  {perTradeLimit > 0 && challenge && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        % of account
                      </span>
                      <span
                        className={`font-mono font-semibold ${riskWarning ? "text-chart-3" : "text-foreground"}`}
                      >
                        {(
                          (estimatedValue / challenge.startingBalance) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Risk warning */}
              {riskWarning && (
                <div
                  className="flex items-start gap-2 p-2.5 rounded-md bg-chart-3/10 border border-chart-3/30"
                  data-ocid="trade.risk_warning"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Exceeds per-trade limit of{" "}
                    <span className="font-semibold text-chart-3">
                      {perTradeLimit.toFixed(2)}%
                    </span>
                    . Risk check may fail.
                  </p>
                </div>
              )}

              {/* Pre-flight validation */}
              <ValidationIndicator state={validation} />

              <Button
                type="submit"
                className={`w-full gap-2 font-display font-bold ${
                  side === TradeSide.buy
                    ? "bg-chart-1 text-background hover:bg-chart-1/90"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
                disabled={
                  !canTrade ||
                  isSubmitting ||
                  qty <= 0 ||
                  actorLoading ||
                  isStale
                }
                data-ocid="trade.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />{" "}
                    Executing…
                  </>
                ) : isStale ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Waiting for price…
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    {side === TradeSide.buy ? "Buy" : "Sell"}{" "}
                    {selectedPair.label.split("/")[0]}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Open Positions */}
      <OpenPositionsTable />

      {/* Closed Positions */}
      <ClosedPositionsTable />

      {/* Recent trades mini-list */}
      <Card
        className="bg-card border-border"
        data-ocid="trade.recent_trades_card"
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
            Recent Trades
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground gap-1.5"
            onClick={fetchRecentTrades}
            disabled={recentLoading}
            data-ocid="trade.refresh_recent_button"
          >
            <RefreshCw
              className={`h-3 w-3 ${recentLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {recentLoading ? (
            <div className="space-y-2 py-2">
              {(["a", "b", "c"] as const).map((k) => (
                <Skeleton key={k} className="h-7 w-full" />
              ))}
            </div>
          ) : recentTrades.length > 0 ? (
            <div>
              {recentTrades.map((t, i) => (
                <MiniTradeRow
                  key={String(t.id)}
                  trade={t}
                  idx={i + 1}
                  isFunded={isFunded}
                />
              ))}
            </div>
          ) : (
            <div
              className="py-6 text-center"
              data-ocid="trade.recent_trades_empty_state"
            >
              <p className="text-xs text-muted-foreground">
                No trades yet. Execute your first trade above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result modal */}
      <TradeResultModal
        trade={resultTrade}
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        isFunded={isFunded}
      />
    </div>
  );
}
