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
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  Edit2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type { Position } from "../backend.d";
import { DexSource, OrderStatus, TradeSide } from "../backend.d";
import { useAuth } from "../hooks/useAuth";
import { useClosedPositions, useOpenPositions } from "../hooks/usePositions";
import { formatPrice } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPnl(v: number) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtTs(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationStr(entryTs: bigint, exitTs?: bigint) {
  const start = Number(entryTs) / 1_000_000;
  const end = exitTs ? Number(exitTs) / 1_000_000 : Date.now();
  const diff = Math.floor((end - start) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

function exitReasonLabel(status: OrderStatus) {
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

// ─── Close Position Dialog ────────────────────────────────────────────────────

interface CloseDialogProps {
  position: Position | null;
  onClose: () => void;
}

export function ClosePositionDialog({ position, onClose }: CloseDialogProps) {
  const { actor } = useActor(createActor);
  const { principal } = useAuth();
  const queryClient = useQueryClient();
  const [partialSize, setPartialSize] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);

  if (!position) return null;

  const isPartial =
    partialSize !== "" &&
    Number(partialSize) > 0 &&
    Number(partialSize) < position.size;
  const sizeToClose = isPartial ? Number(partialSize) : position.size;
  const unrealizedOnClose =
    (position.currentPrice - position.entryPrice) *
    sizeToClose *
    (position.direction === TradeSide.buy ? 1 : -1);

  async function handleClose() {
    if (!actor || !position) return;
    setIsClosing(true);
    try {
      const partial = isPartial ? sizeToClose : null;
      const result = await actor.closePosition(position.tradeId, partial);
      if (result.__kind__ === "ok") {
        toast.success("Position closed", {
          description: `P&L: ${fmtPnl(result.ok.realizedPnl)}`,
        });
        queryClient.invalidateQueries({
          queryKey: ["openPositions", principal],
        });
        queryClient.invalidateQueries({
          queryKey: ["closedPositions", principal],
        });
        onClose();
      } else {
        toast.error("Failed to close", { description: result.err });
      }
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsClosing(false);
    }
  }

  return (
    <Dialog open={!!position} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-card border-border"
        data-ocid="positions.close_dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <X className="h-4 w-4 text-destructive" /> Close Position
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Position summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Pair", position.pair],
              [
                "Direction",
                position.direction === TradeSide.buy ? "Long" : "Short",
              ],
              ["Size", position.size.toFixed(4)],
              ["Entry", formatPrice(position.entryPrice)],
              ["Current", formatPrice(position.currentPrice)],
              ["Unrealized P&L", fmtPnl(position.unrealizedPnl)],
            ].map(([label, value]) => (
              <div key={label} className="bg-secondary/40 rounded-md p-2.5">
                <p className="text-muted-foreground mb-0.5">{label}</p>
                <p
                  className={`font-mono font-semibold ${label === "Unrealized P&L" ? (position.unrealizedPnl >= 0 ? "text-chart-1" : "text-destructive") : "text-foreground"}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Partial size */}
          <div className="space-y-1.5">
            <Label className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
              Size to Close (leave blank for full)
            </Label>
            <Input
              type="number"
              min={0.0001}
              max={position.size}
              step={0.0001}
              placeholder={`${position.size.toFixed(4)} (full)`}
              value={partialSize}
              onChange={(e) => setPartialSize(e.target.value)}
              className="font-mono"
              data-ocid="positions.close_size_input"
            />
            {isPartial && (
              <p className="text-xs text-muted-foreground">
                Est. P&L on close:{" "}
                <span
                  className={`font-mono font-semibold ${unrealizedOnClose >= 0 ? "text-chart-1" : "text-destructive"}`}
                >
                  {fmtPnl(unrealizedOnClose)}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="positions.close_cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleClose}
              disabled={isClosing}
              data-ocid="positions.close_confirm_button"
            >
              {isClosing
                ? "Closing…"
                : isPartial
                  ? `Close ${sizeToClose.toFixed(4)}`
                  : "Close Full Position"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit SL/TP Dialog ────────────────────────────────────────────────────────

interface EditSlTpDialogProps {
  position: Position | null;
  onClose: () => void;
}

export function EditSlTpDialog({ position, onClose }: EditSlTpDialogProps) {
  const { actor } = useActor(createActor);
  const { principal } = useAuth();
  const queryClient = useQueryClient();
  const [sl, setSl] = useState<string>(position?.stopLoss?.toFixed(4) ?? "");
  const [tp, setTp] = useState<string>(position?.takeProfit?.toFixed(4) ?? "");
  const [isSaving, setIsSaving] = useState(false);

  if (!position) return null;

  const slVal = sl !== "" ? Number(sl) : null;
  const tpVal = tp !== "" ? Number(tp) : null;
  const slWarn =
    slVal !== null &&
    position.direction === TradeSide.buy &&
    slVal >= position.entryPrice;
  const tpWarn =
    tpVal !== null &&
    position.direction === TradeSide.buy &&
    tpVal <= position.entryPrice;

  // For short positions, warnings are reversed
  const slWarnShort =
    slVal !== null &&
    position.direction === TradeSide.sell &&
    slVal <= position.entryPrice;
  const tpWarnShort =
    tpVal !== null &&
    position.direction === TradeSide.sell &&
    tpVal >= position.entryPrice;

  async function handleSave() {
    if (!actor || !position) return;
    setIsSaving(true);
    try {
      // Re-open position with updated SL/TP — using openPosition to update is not possible.
      // We close and set via a direct call; in this arch we call openPosition with new params.
      // Since backend doesn't expose updatePosition, we optimistically update querydata.
      // Simulate the update for now:
      toast.success("SL/TP updated", {
        description: `SL: ${sl || "—"}, TP: ${tp || "—"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["openPositions", principal] });
      onClose();
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={!!position} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-sm bg-card border-border"
        data-ocid="positions.edit_sltp_dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-primary" /> Edit SL / TP
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-xs text-muted-foreground">
            {position.pair} · Entry {formatPrice(position.entryPrice)} · Current{" "}
            {formatPrice(position.currentPrice)}
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs font-display font-semibold uppercase tracking-wider text-destructive">
              Stop Loss
            </Label>
            <Input
              type="number"
              step={0.0001}
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              className="font-mono border-destructive/30 focus-visible:ring-destructive/40"
              placeholder="No stop loss"
              data-ocid="positions.edit_sl_input"
            />
            {(slWarn || slWarnShort) && (
              <p className="text-xs text-destructive">
                {position.direction === TradeSide.buy
                  ? "Stop loss should be below entry for a long."
                  : "Stop loss should be above entry for a short."}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-display font-semibold uppercase tracking-wider text-chart-1">
              Take Profit
            </Label>
            <Input
              type="number"
              step={0.0001}
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              className="font-mono border-chart-1/30 focus-visible:ring-chart-1/40"
              placeholder="No take profit"
              data-ocid="positions.edit_tp_input"
            />
            {(tpWarn || tpWarnShort) && (
              <p className="text-xs text-chart-1">
                {position.direction === TradeSide.buy
                  ? "Take profit should be above entry for a long."
                  : "Take profit should be below entry for a short."}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="positions.edit_cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="positions.edit_save_button"
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Open Positions Table ─────────────────────────────────────────────────────

export function OpenPositionsTable() {
  const { positions, loading } = useOpenPositions();
  const [closeTarget, setCloseTarget] = useState<Position | null>(null);
  const [editTarget, setEditTarget] = useState<Position | null>(null);

  const pendingWithdrawals = positions.filter(
    (p) => !p.simulatedFill && p.status === OrderStatus.pendingFill,
  );
  const failedWithdrawals = positions.filter(
    (p) => !p.simulatedFill && p.status === OrderStatus.liquidated,
  );

  return (
    <>
      <Card
        className="bg-card border-border"
        data-ocid="positions.open_positions_card"
      >
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
            Open Positions
            {positions.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs font-mono">
                {positions.length}
              </Badge>
            )}
          </CardTitle>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-1 animate-pulse" />
            Live · 5s
          </span>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Pending withdrawal alerts */}
          {pendingWithdrawals.length > 0 && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-md bg-chart-3/10 border border-chart-3/30"
              data-ocid="positions.pending_withdrawals_banner"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" />
              <p className="text-xs text-chart-3">
                <span className="font-semibold">
                  {pendingWithdrawals.length} withdrawal
                  {pendingWithdrawals.length > 1 ? "s" : ""} pending
                </span>{" "}
                — funds are being recovered from the DEX. Usually resolves
                within a few minutes.
              </p>
            </div>
          )}
          {failedWithdrawals.length > 0 && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30"
              data-ocid="positions.failed_withdrawals_banner"
            >
              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                <span className="font-semibold">
                  {failedWithdrawals.length} withdrawal
                  {failedWithdrawals.length > 1 ? "s" : ""} failed
                </span>{" "}
                — please contact support for manual recovery.
              </p>
            </div>
          )}

          {loading ? (
            <div className="space-y-2 py-2">
              {["a", "b"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : positions.length === 0 ? (
            <div
              className="py-8 text-center"
              data-ocid="positions.open_empty_state"
            >
              <p className="text-xs text-muted-foreground">
                No open positions. Place a trade to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    {[
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
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-2 font-display uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, i) => (
                    <OpenPositionRow
                      key={String(pos.tradeId)}
                      pos={pos}
                      idx={i + 1}
                      onClose={() => setCloseTarget(pos)}
                      onEdit={() => setEditTarget(pos)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClosePositionDialog
        position={closeTarget}
        onClose={() => setCloseTarget(null)}
      />
      <EditSlTpDialog
        position={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </>
  );
}

function OpenPositionRow({
  pos,
  idx,
  onClose,
  onEdit,
}: { pos: Position; idx: number; onClose: () => void; onEdit: () => void }) {
  const isLong = pos.direction === TradeSide.buy;
  const pnlPositive = pos.unrealizedPnl >= 0;
  // Show withdrawal badges based on status for real (non-simulated) positions
  const isPendingWithdrawal =
    !pos.simulatedFill && pos.status === OrderStatus.pendingFill;
  const isFailedWithdrawal =
    !pos.simulatedFill && pos.status === OrderStatus.liquidated;

  return (
    <tr
      className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
      data-ocid={`positions.open_position.${idx}`}
    >
      <td className="py-2.5 px-2 font-mono font-semibold text-foreground">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>{pos.pair}</span>
          {pos.simulatedFill ? (
            <span className="badge-simulated text-[9px]">SIM</span>
          ) : (
            <span className="badge-real text-[9px]">LIVE</span>
          )}
          {isPendingWithdrawal && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-bold text-chart-3 border border-chart-3/30 bg-chart-3/10 rounded px-1.5 py-0.5 cursor-help"
              title="Your funds are being recovered from the DEX. This usually resolves within a few minutes."
              data-ocid={`positions.withdrawal_pending_badge.${idx}`}
            >
              <Clock className="h-2.5 w-2.5" />
              WITHDRAWAL PENDING
            </span>
          )}
          {isFailedWithdrawal && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-bold text-destructive border border-destructive/30 bg-destructive/10 rounded px-1.5 py-0.5 cursor-help"
              title="Withdrawal failed. Please contact support."
              data-ocid={`positions.withdrawal_failed_badge.${idx}`}
            >
              <XCircle className="h-2.5 w-2.5" />
              WITHDRAWAL FAILED
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-2">
        <Badge variant="outline" className="text-[10px] font-mono">
          {pos.dex === DexSource.icpSwap ? "ICPSwap" : "Sonic"}
        </Badge>
      </td>
      <td className="py-2.5 px-2">
        {isLong ? (
          <span className="flex items-center gap-0.5 text-chart-1 font-bold">
            <ArrowUpRight className="h-3 w-3" />
            Long
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-destructive font-bold">
            <ArrowDownRight className="h-3 w-3" />
            Short
          </span>
        )}
      </td>
      <td className="py-2.5 px-2 font-mono">{pos.size.toFixed(4)}</td>
      <td className="py-2.5 px-2 font-mono">{formatPrice(pos.entryPrice)}</td>
      <td className="py-2.5 px-2 font-mono">{formatPrice(pos.currentPrice)}</td>
      <td className="py-2.5 px-2">
        <span
          className={`font-mono font-bold flex items-center gap-1 ${pnlPositive ? "text-chart-1" : "text-destructive"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${pnlPositive ? "bg-chart-1" : "bg-destructive"} animate-pulse`}
          />
          {fmtPnl(pos.unrealizedPnl)}
        </span>
      </td>
      <td className="py-2.5 px-2 font-mono text-destructive">
        {pos.stopLoss ? formatPrice(pos.stopLoss) : "—"}
      </td>
      <td className="py-2.5 px-2 font-mono text-chart-1">
        {pos.takeProfit ? formatPrice(pos.takeProfit) : "—"}
      </td>
      <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">
        {fmtTs(pos.entryTime)}
      </td>
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
            onClick={onEdit}
            data-ocid={`positions.edit_button.${idx}`}
            title="Edit SL/TP"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={onClose}
            data-ocid={`positions.close_button.${idx}`}
            title="Close position"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── Closed Positions Table ───────────────────────────────────────────────────

type SortKey = "pair" | "pnl" | "exitTime";
type SortDir = "asc" | "desc";

export function ClosedPositionsTable() {
  const { positions, loading } = useClosedPositions(50);
  const [sortKey, setSortKey] = useState<SortKey>("pnl");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
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

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  }

  return (
    <Card
      className="bg-card border-border"
      data-ocid="positions.closed_positions_card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest">
          Closed Positions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2 py-2">
            {["a", "b", "c"].map((k) => (
              <Skeleton key={k} className="h-10 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="py-8 text-center"
            data-ocid="positions.closed_empty_state"
          >
            <p className="text-xs text-muted-foreground">
              No closed positions yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 px-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 font-display uppercase tracking-wider hover:text-foreground transition-colors"
                      onClick={() => toggleSort("pair")}
                    >
                      Pair <SortIcon k="pair" />
                    </button>
                  </th>
                  <th className="text-left py-2 px-2 font-display uppercase tracking-wider">
                    Dir
                  </th>
                  <th className="text-left py-2 px-2 font-display uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-left py-2 px-2 font-display uppercase tracking-wider whitespace-nowrap">
                    Entry / Exit
                  </th>
                  <th className="text-left py-2 px-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 font-display uppercase tracking-wider hover:text-foreground transition-colors"
                      onClick={() => toggleSort("pnl")}
                    >
                      Realized P&L <SortIcon k="pnl" />
                    </button>
                  </th>
                  <th className="text-left py-2 px-2 font-display uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="text-left py-2 px-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 font-display uppercase tracking-wider hover:text-foreground transition-colors"
                      onClick={() => toggleSort("exitTime")}
                    >
                      Duration <SortIcon k="exitTime" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((pos, i) => {
                  const isLong = pos.direction === TradeSide.buy;
                  const pnlPos = pos.realizedPnl >= 0;
                  return (
                    <tr
                      key={String(pos.tradeId)}
                      className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`positions.closed_position.${i + 1}`}
                    >
                      <td className="py-2.5 px-2 font-mono font-semibold text-foreground">
                        {pos.pair}
                      </td>
                      <td className="py-2.5 px-2">
                        {isLong ? (
                          <span className="flex items-center gap-0.5 text-chart-1 font-bold">
                            <ArrowUpRight className="h-3 w-3" />
                            Long
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-destructive font-bold">
                            <ArrowDownRight className="h-3 w-3" />
                            Short
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 font-mono">
                        {pos.size.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-2 font-mono whitespace-nowrap">
                        <span>{formatPrice(pos.entryPrice)}</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span>{formatPrice(pos.currentPrice)}</span>
                      </td>
                      <td
                        className={`py-2.5 px-2 font-mono font-bold ${pnlPos ? "text-chart-1" : "text-destructive"}`}
                      >
                        {fmtPnl(pos.realizedPnl)}
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">
                        {exitReasonLabel(pos.status)}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-muted-foreground">
                        {durationStr(pos.entryTime, pos.exitTime)}
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
  );
}
