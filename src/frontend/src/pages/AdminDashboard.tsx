import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  AdminParams,
  AllocationChange,
  AuditEntry,
  Challenge,
  CohortParams,
  PhaseParams,
  TargetOutcome,
} from "../backend.d";
import { ChallengeStatus, RiskLevel } from "../backend.d";
import { truncatePrincipal } from "../types";

// ─── Derived Params Formula (mirrors backend trading.mo) ─────────────────────
function deriveParams(
  targetProfitPct: number,
  riskLevel: RiskLevel,
): Partial<AdminParams> {
  const multiplier = targetProfitPct / 10.0;
  const base =
    riskLevel === RiskLevel.low
      ? { perTrade: 1, daily: 3, total: 5, baseFee: 0.5, perfFee: 10 }
      : riskLevel === RiskLevel.medium
        ? { perTrade: 2, daily: 5, total: 8, baseFee: 1.0, perfFee: 15 }
        : { perTrade: 3, daily: 8, total: 12, baseFee: 1.5, perfFee: 20 };
  return {
    perTradeLimitPct: Number.parseFloat(
      (base.perTrade * multiplier).toFixed(2),
    ),
    dailyDrawdownLimitPct: Number.parseFloat(
      (base.daily * multiplier).toFixed(2),
    ),
    totalDrawdownLimitPct: Number.parseFloat(
      (base.total * multiplier).toFixed(2),
    ),
    baseFee: Number.parseFloat((base.baseFee * multiplier).toFixed(4)),
    performanceFee: Number.parseFloat(base.perfFee.toFixed(2)),
    targetProfitPct,
    riskLevel,
    tradingPaused: false,
    updatedAt: BigInt(0),
  };
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
function statusBadge(status: ChallengeStatus): string {
  const map: Record<ChallengeStatus, string> = {
    [ChallengeStatus.active]: "badge-simulated",
    [ChallengeStatus.passed]: "badge-success",
    [ChallengeStatus.failed]: "badge-destructive",
    [ChallengeStatus.paused]: "badge-warning",
  };
  return map[status] ?? "badge-warning";
}

function auditColor(action: string): string {
  if (action.includes("SET_ADMIN") || action.includes("setAdminParams"))
    return "text-primary";
  if (action.includes("FORCE") || action.includes("forceChallenge"))
    return "text-accent";
  if (action.includes("PAUSE") || action.includes("setPauseTrading"))
    return "text-destructive";
  if (action.includes("RESUME")) return "text-chart-1";
  if (action.includes("OVERRIDE") || action.includes("overrideParams"))
    return "text-muted-foreground";
  return "text-muted-foreground";
}

function formatTs(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

function pctColor(val: number): string {
  return val >= 0 ? "text-chart-1" : "text-destructive";
}

function trackingPill(
  actual: number,
  target: number,
): {
  label: string;
  cls: string;
} {
  const ratio = target > 0 ? actual / target : 0;
  if (ratio >= 0.9)
    return {
      label: "On Track",
      cls: "bg-chart-1/20 text-chart-1 border-chart-1/40",
    };
  if (ratio >= 0.6)
    return {
      label: "Warning",
      cls: "bg-chart-3/20 text-chart-3 border-chart-3/40",
    };
  return {
    label: "Off Track",
    cls: "bg-destructive/20 text-destructive border-destructive/40",
  };
}

// ─── Actor alias ──────────────────────────────────────────────────────────────
type ActorType = Awaited<ReturnType<typeof createActor>> | null;

// ─── Default PhaseParams ──────────────────────────────────────────────────────
function defaultPhaseParams(): PhaseParams {
  return {
    profitTarget: 8,
    maxDailyDrawdown: 4,
    maxTotalDrawdown: 8,
    minTradingDays: BigInt(5),
    timeLimitDays: BigInt(30),
    minConsistencyScore: 60,
  };
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const qc = useQueryClient();

  const { data: currentParams, isLoading: paramsLoading } =
    useQuery<AdminParams | null>({
      queryKey: ["adminParams"],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getAdminParams();
      },
      enabled: !!actor && !actorLoading,
      staleTime: 30_000,
    });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery<
    Challenge[]
  >({
    queryKey: ["allChallenges"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChallenges();
    },
    enabled: !!actor && !actorLoading,
    staleTime: 15_000,
  });

  const { data: auditEntries = [], isLoading: auditLoading } = useQuery<
    AuditEntry[]
  >({
    queryKey: ["auditLog"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuditLog(BigInt(100));
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: 30_000,
    staleTime: 30_000,
  });

  const { data: cohorts = [], isLoading: cohortsLoading } = useQuery<
    CohortParams[]
  >({
    queryKey: ["allCohorts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCohorts();
    },
    enabled: !!actor && !actorLoading,
    staleTime: 30_000,
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" data-ocid="admin.page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Platform controls, risk parameters, and challenge management
          </p>
        </div>
        {currentParams?.tradingPaused && (
          <div className="flex items-center gap-2 bg-destructive/15 border border-destructive/40 text-destructive px-4 py-2 rounded-lg text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            TRADING PAUSED
          </div>
        )}
      </div>

      <Tabs defaultValue="parameters" data-ocid="admin.tab">
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="parameters" data-ocid="admin.parameters.tab">
            Parameters
          </TabsTrigger>
          <TabsTrigger value="challenges" data-ocid="admin.challenges.tab">
            Challenges
          </TabsTrigger>
          <TabsTrigger value="controls" data-ocid="admin.controls.tab">
            Controls
          </TabsTrigger>
          <TabsTrigger value="audit" data-ocid="admin.audit.tab">
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="cohorts" data-ocid="admin.cohorts.tab">
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="performance" data-ocid="admin.performance.tab">
            Performance
          </TabsTrigger>
          <TabsTrigger value="funded" data-ocid="admin.funded.tab">
            Funded Traders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parameters">
          <ParametersTab
            actor={actor}
            actorLoading={actorLoading}
            currentParams={currentParams ?? null}
            paramsLoading={paramsLoading}
            onSuccess={() =>
              qc.invalidateQueries({ queryKey: ["adminParams"] })
            }
          />
        </TabsContent>

        <TabsContent value="challenges">
          <ChallengesTab
            actor={actor}
            actorLoading={actorLoading}
            challenges={challenges}
            isLoading={challengesLoading}
            onSuccess={() =>
              qc.invalidateQueries({ queryKey: ["allChallenges"] })
            }
          />
        </TabsContent>

        <TabsContent value="controls">
          <ControlsTab
            actor={actor}
            actorLoading={actorLoading}
            currentParams={currentParams ?? null}
            onSuccess={() =>
              qc.invalidateQueries({ queryKey: ["adminParams"] })
            }
          />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTab entries={auditEntries} isLoading={auditLoading} />
        </TabsContent>

        <TabsContent value="cohorts">
          <CohortsTab
            actor={actor}
            actorLoading={actorLoading}
            cohorts={cohorts}
            isLoading={cohortsLoading}
            onSuccess={() => qc.invalidateQueries({ queryKey: ["allCohorts"] })}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab
            actor={actor}
            actorLoading={actorLoading}
            cohorts={cohorts}
            onSuccess={() => qc.invalidateQueries({ queryKey: ["allCohorts"] })}
          />
        </TabsContent>

        <TabsContent value="funded">
          <FundedTradersTab actor={actor} actorLoading={actorLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Parameters Tab ───────────────────────────────────────────────────────────
function ParametersTab({
  actor,
  actorLoading,
  currentParams,
  paramsLoading,
  onSuccess,
}: {
  actor: ActorType;
  actorLoading: boolean;
  currentParams: AdminParams | null;
  paramsLoading: boolean;
  onSuccess: () => void;
}) {
  const [targetPct, setTargetPct] = useState(10);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.medium);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideForm, setOverrideForm] = useState<Partial<AdminParams>>({});

  useEffect(() => {
    if (currentParams) setOverrideForm(currentParams);
  }, [currentParams]);

  const derived = deriveParams(targetPct, riskLevel);

  const setParamsMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setAdminParams(targetPct, riskLevel);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Parameters applied successfully");
      onSuccess();
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const overrideMut = useMutation({
    mutationFn: async () => {
      if (!actor || !currentParams) throw new Error("No params loaded");
      const merged: AdminParams = { ...currentParams, ...overrideForm };
      const result = await actor.overrideParams(merged);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Override applied");
      onSuccess();
      setShowOverride(false);
    },
    onError: (e: Error) => toast.error(`Override failed: ${e.message}`),
  });

  const riskOptions: { label: string; value: RiskLevel }[] = [
    { label: "Low", value: RiskLevel.low },
    { label: "Medium", value: RiskLevel.medium },
    { label: "High", value: RiskLevel.high },
  ];

  const derivedFields: {
    label: string;
    val: number | undefined;
    unit: string;
  }[] = [
    { label: "Per-Trade Max Loss", val: derived.perTradeLimitPct, unit: "%" },
    {
      label: "Daily Drawdown Limit",
      val: derived.dailyDrawdownLimitPct,
      unit: "%",
    },
    {
      label: "Total Drawdown Limit",
      val: derived.totalDrawdownLimitPct,
      unit: "%",
    },
    { label: "Base Fee", val: derived.baseFee, unit: " ICP" },
    { label: "Performance Fee", val: derived.performanceFee, unit: "%" },
  ];

  const overrideKeys = [
    "targetProfitPct",
    "perTradeLimitPct",
    "dailyDrawdownLimitPct",
    "totalDrawdownLimitPct",
    "baseFee",
    "performanceFee",
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border" data-ocid="admin.parameters.card">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Dynamic Parameter Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Target Profit %</Label>
              <span className="mono-price text-primary font-semibold">
                {targetPct}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={targetPct}
              onChange={(e) => setTargetPct(Number(e.target.value))}
              className="w-full accent-primary h-2 rounded-full cursor-pointer"
              data-ocid="admin.target_profit.input"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Risk Level</Label>
            <div className="flex gap-2" data-ocid="admin.risk_level.toggle">
              {riskOptions.map(({ label, value }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setRiskLevel(value)}
                  data-ocid={`admin.risk_level.${value}`}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold border transition-smooth ${
                    riskLevel === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Derived Parameters Preview
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {derivedFields.map(({ label, val, unit }) => (
                <div
                  key={label}
                  className="bg-muted/40 rounded-lg p-3 border border-border"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {label}
                  </div>
                  <div className="mono-price text-foreground font-semibold">
                    {val ?? "—"}
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setParamsMut.mutate()}
            disabled={setParamsMut.isPending || actorLoading}
            className="w-full"
            data-ocid="admin.apply_params.primary_button"
          >
            {setParamsMut.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Applying…
              </>
            ) : (
              "Apply Parameters"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base font-display">
            Currently Deployed Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paramsLoading ? (
            <div className="space-y-2">
              {["p1", "p2", "p3", "p4", "p5"].map((k) => (
                <Skeleton key={k} className="h-6 w-full" />
              ))}
            </div>
          ) : currentParams ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  label: "Target Profit %",
                  val: `${currentParams.targetProfitPct}%`,
                },
                {
                  label: "Per-Trade Limit",
                  val: `${currentParams.perTradeLimitPct}%`,
                },
                {
                  label: "Daily Drawdown",
                  val: `${currentParams.dailyDrawdownLimitPct}%`,
                },
                {
                  label: "Total Drawdown",
                  val: `${currentParams.totalDrawdownLimitPct}%`,
                },
                { label: "Base Fee", val: `${currentParams.baseFee} ICP` },
                {
                  label: "Performance Fee",
                  val: `${currentParams.performanceFee}%`,
                },
                { label: "Risk Level", val: currentParams.riskLevel },
                { label: "Updated At", val: formatTs(currentParams.updatedAt) },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="bg-muted/40 rounded-lg p-3 border border-border"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {label}
                  </div>
                  <div className="mono-price text-foreground font-medium truncate">
                    {val}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No parameters loaded.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setShowOverride((v) => !v)}
          data-ocid="admin.override.toggle"
        >
          <CardTitle className="text-base font-display flex items-center justify-between">
            <span>Override Parameters (Advanced)</span>
            <span className="text-muted-foreground text-sm font-normal">
              {showOverride ? "▲ Hide" : "▼ Expand"}
            </span>
          </CardTitle>
        </CardHeader>
        {showOverride && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {overrideKeys.map((field) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/Pct$/, " %")
                      .trim()}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={
                      typeof overrideForm[field] === "number"
                        ? (overrideForm[field] as number)
                        : ""
                    }
                    onChange={(e) =>
                      setOverrideForm((prev) => ({
                        ...prev,
                        [field]: Number.parseFloat(e.target.value),
                      }))
                    }
                    className="font-mono text-sm"
                    data-ocid={`admin.override.${field}.input`}
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={() => overrideMut.mutate()}
              disabled={overrideMut.isPending || actorLoading}
              variant="secondary"
              className="w-full"
              data-ocid="admin.override.submit_button"
            >
              {overrideMut.isPending ? "Applying Override…" : "Apply Override"}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ─── Challenges Tab ───────────────────────────────────────────────────────────
type ChallengeFilter = "all" | ChallengeStatus;

function ChallengesTab({
  actor,
  actorLoading,
  challenges,
  isLoading,
  onSuccess,
}: {
  actor: ActorType;
  actorLoading: boolean;
  challenges: Challenge[];
  isLoading: boolean;
  onSuccess: () => void;
}) {
  const [filter, setFilter] = useState<ChallengeFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null,
  );
  const [forceStatus, setForceStatus] = useState<
    ChallengeStatus.passed | ChallengeStatus.failed
  >(ChallengeStatus.passed);
  const [reason, setReason] = useState("");

  const filtered = challenges.filter(
    (c) => filter === "all" || c.status === filter,
  );

  const forceMut = useMutation({
    mutationFn: async () => {
      if (!actor || !selectedChallenge) throw new Error("Actor not ready");
      const result = await actor.forceChallenge(
        selectedChallenge.id,
        forceStatus,
        reason,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success(
        `Challenge ${forceStatus === ChallengeStatus.passed ? "passed" : "failed"} successfully`,
      );
      onSuccess();
      setDialogOpen(false);
      setReason("");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  function openDialog(
    c: Challenge,
    status: ChallengeStatus.passed | ChallengeStatus.failed,
  ) {
    setSelectedChallenge(c);
    setForceStatus(status);
    setReason("");
    setDialogOpen(true);
  }

  const filterOptions: { label: string; value: ChallengeFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: ChallengeStatus.active },
    { label: "Passed", value: ChallengeStatus.passed },
    { label: "Failed", value: ChallengeStatus.failed },
  ];

  return (
    <div className="space-y-4" data-ocid="admin.challenges.section">
      <div className="flex gap-2 flex-wrap" data-ocid="admin.challenges.filter">
        {filterOptions.map(({ label, value }) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
            data-ocid={`admin.challenges.filter.${value}`}
          >
            {label}
          </Button>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["c1", "c2", "c3", "c4"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-12 text-center text-muted-foreground text-sm"
              data-ocid="admin.challenges.empty_state"
            >
              No challenges match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Trader</th>
                    <th className="px-4 py-3 text-right">Start Bal.</th>
                    <th className="px-4 py-3 text-right">Current</th>
                    <th className="px-4 py-3 text-right">P&amp;L %</th>
                    <th className="px-4 py-3 text-right">Drawdown</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Days</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => {
                    const pnlPct =
                      c.startingBalance > 0
                        ? ((c.currentBalance - c.startingBalance) /
                            c.startingBalance) *
                          100
                        : 0;
                    const drawdownPct =
                      c.startingBalance > 0
                        ? Math.min(
                            0,
                            ((c.currentBalance - c.startingBalance) /
                              c.startingBalance) *
                              100,
                          )
                        : 0;
                    const daysElapsed = Math.max(
                      0,
                      Math.floor(
                        (Date.now() - Number(c.startTime) / 1_000_000) /
                          86_400_000,
                      ),
                    );

                    return (
                      <tr
                        key={String(c.id)}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        data-ocid={`admin.challenges.item.${idx + 1}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {truncatePrincipal(c.traderPrincipal.toText())}
                        </td>
                        <td className="px-4 py-3 text-right mono-price">
                          ${c.startingBalance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right mono-price">
                          ${c.currentBalance.toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-3 text-right mono-price font-semibold ${pctColor(pnlPct)}`}
                        >
                          {pnlPct >= 0 ? "+" : ""}
                          {pnlPct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right mono-price text-destructive">
                          {drawdownPct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={statusBadge(c.status)}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right mono-price text-muted-foreground">
                          {daysElapsed}d
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-chart-1 border-primary/30 hover:bg-primary/10 text-xs h-7 px-2"
                              onClick={() =>
                                openDialog(c, ChallengeStatus.passed)
                              }
                              data-ocid={`admin.challenges.force_pass.${idx + 1}`}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pass
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10 text-xs h-7 px-2"
                              onClick={() =>
                                openDialog(c, ChallengeStatus.failed)
                              }
                              data-ocid={`admin.challenges.force_fail.${idx + 1}`}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Fail
                            </Button>
                          </div>
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setReason("");
        }}
      >
        <DialogContent
          className="bg-card border-border"
          data-ocid="admin.force_challenge.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Force {forceStatus === ChallengeStatus.passed ? "Pass" : "Fail"}{" "}
              Challenge
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedChallenge && (
              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">Trader: </span>
                <span className="font-mono text-xs">
                  {truncatePrincipal(
                    selectedChallenge.traderPrincipal.toText(),
                  )}
                </span>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-sm">
                Reason <span className="text-muted-foreground">(required)</span>
              </Label>
              <Textarea
                placeholder="Provide a reason for this override…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
                data-ocid="admin.force_challenge.reason.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="admin.force_challenge.cancel_button"
            >
              Cancel
            </Button>
            <Button
              disabled={!reason.trim() || forceMut.isPending || actorLoading}
              onClick={() => forceMut.mutate()}
              className={
                forceStatus === ChallengeStatus.passed
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              }
              data-ocid="admin.force_challenge.confirm_button"
            >
              {forceMut.isPending
                ? "Processing…"
                : `Confirm ${forceStatus === ChallengeStatus.passed ? "Pass" : "Fail"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Controls Tab ─────────────────────────────────────────────────────────────
function ControlsTab({
  actor,
  actorLoading,
  currentParams,
  onSuccess,
}: {
  actor: ActorType;
  actorLoading: boolean;
  currentParams: AdminParams | null;
  onSuccess: () => void;
}) {
  const isPaused = currentParams?.tradingPaused ?? false;

  const toggleMut = useMutation({
    mutationFn: async (paused: boolean) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setPauseTrading(paused);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_, paused) => {
      toast.success(paused ? "Trading paused" : "Trading resumed");
      onSuccess();
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  return (
    <div className="space-y-6" data-ocid="admin.controls.section">
      {isPaused && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/40 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-destructive font-semibold text-sm">
              Trading is currently PAUSED
            </p>
            <p className="text-destructive/70 text-xs mt-0.5">
              All traders are blocked from submitting new orders until trading
              is resumed.
            </p>
          </div>
        </div>
      )}

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-display font-semibold">
                Trading {isPaused ? "Paused" : "Active"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Pausing trading blocks{" "}
                <strong className="text-foreground">ALL traders</strong> from
                submitting new orders. Use with caution.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-medium ${!isPaused ? "text-chart-1" : "text-muted-foreground"}`}
              >
                Active
              </span>
              <Switch
                checked={isPaused}
                onCheckedChange={(checked) => toggleMut.mutate(checked)}
                disabled={toggleMut.isPending || actorLoading}
                className="scale-125 data-[state=checked]:bg-destructive"
                data-ocid="admin.trading_pause.switch"
              />
              <span
                className={`text-sm font-medium ${isPaused ? "text-destructive" : "text-muted-foreground"}`}
              >
                Paused
              </span>
            </div>
            <Badge
              variant="outline"
              className={`px-4 py-1.5 text-sm font-semibold ${
                isPaused
                  ? "border-destructive/50 text-destructive bg-destructive/10"
                  : "border-primary/50 text-chart-1 bg-primary/10"
              }`}
              data-ocid="admin.trading_status.badge"
            >
              {isPaused ? "⏸ Trading Paused" : "▶ Trading Active"}
            </Badge>
            {toggleMut.isPending && (
              <div
                className="text-muted-foreground text-sm flex items-center gap-2"
                data-ocid="admin.trading_pause.loading_state"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating trading state…
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Audit Log Tab ────────────────────────────────────────────────────────────
function AuditLogTab({
  entries,
  isLoading,
}: { entries: AuditEntry[]; isLoading: boolean }) {
  return (
    <div data-ocid="admin.audit.section">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display">Audit Log</CardTitle>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" />
              Auto-refreshes every 30s
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["a1", "a2", "a3", "a4", "a5"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div
              className="p-12 text-center text-muted-foreground text-sm"
              data-ocid="admin.audit.empty_state"
            >
              No audit entries yet.
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto divide-y divide-border/50">
              {entries.map((entry, idx) => (
                <div
                  key={`${String(entry.timestamp)}-${entry.action}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.audit.item.${idx + 1}`}
                >
                  <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5 min-w-[140px]">
                    {formatTs(entry.timestamp)}
                  </span>
                  <span
                    className={`font-semibold text-sm shrink-0 min-w-[160px] ${auditColor(entry.action)}`}
                  >
                    {entry.action}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 min-w-[80px]">
                    {truncatePrincipal(entry.principal.toText())}
                  </span>
                  <span className="text-sm text-foreground/80 min-w-0 break-words">
                    {entry.details}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Phase Params Form ────────────────────────────────────────────────────────
function PhaseParamsForm({
  label,
  value,
  onChange,
  ocidPrefix,
}: {
  label: string;
  value: PhaseParams;
  onChange: (p: PhaseParams) => void;
  ocidPrefix: string;
}) {
  function update(field: keyof PhaseParams, raw: string) {
    const isBigInt = field === "minTradingDays" || field === "timeLimitDays";
    onChange({
      ...value,
      [field]: isBigInt
        ? BigInt(Number.parseInt(raw, 10) || 0)
        : Number.parseFloat(raw) || 0,
    });
  }

  const fields: { key: keyof PhaseParams; label: string; step: string }[] = [
    { key: "profitTarget", label: "Profit Target %", step: "0.1" },
    { key: "maxDailyDrawdown", label: "Max Daily Drawdown %", step: "0.1" },
    { key: "maxTotalDrawdown", label: "Max Total Drawdown %", step: "0.1" },
    { key: "minTradingDays", label: "Min Trading Days", step: "1" },
    { key: "timeLimitDays", label: "Time Limit Days", step: "1" },
    { key: "minConsistencyScore", label: "Min Consistency Score %", step: "1" },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, label: fl, step }) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fl}</Label>
            <Input
              type="number"
              step={step}
              value={
                typeof value[key] === "bigint"
                  ? String(value[key])
                  : String(value[key])
              }
              onChange={(e) => update(key, e.target.value)}
              className="font-mono text-sm h-8"
              data-ocid={`${ocidPrefix}.${key}.input`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cohorts Tab ──────────────────────────────────────────────────────────────
function CohortsTab({
  actor,
  actorLoading,
  cohorts,
  isLoading,
  onSuccess,
}: {
  actor: ActorType;
  actorLoading: boolean;
  cohorts: CohortParams[];
  isLoading: boolean;
  onSuccess: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editCohort, setEditCohort] = useState<CohortParams | null>(null);
  const [createName, setCreateName] = useState("");
  const [createP1, setCreateP1] = useState<PhaseParams>(defaultPhaseParams());
  const [createP2, setCreateP2] = useState<PhaseParams>({
    ...defaultPhaseParams(),
    profitTarget: 5,
    timeLimitDays: BigInt(60),
    minConsistencyScore: 65,
  });
  const [editP1, setEditP1] = useState<PhaseParams>(defaultPhaseParams());
  const [editP2, setEditP2] = useState<PhaseParams>(defaultPhaseParams());

  useEffect(() => {
    if (editCohort) {
      setEditP1(editCohort.phase1);
      setEditP2(editCohort.phase2);
    }
  }, [editCohort]);

  const createMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!createName.trim()) throw new Error("Cohort name is required");
      const result = await actor.createCohort(
        createName.trim(),
        createP1,
        createP2,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Cohort created successfully");
      onSuccess();
      setShowCreate(false);
      setCreateName("");
      setCreateP1(defaultPhaseParams());
      setCreateP2({
        ...defaultPhaseParams(),
        profitTarget: 5,
        timeLimitDays: BigInt(60),
        minConsistencyScore: 65,
      });
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      if (!actor || !editCohort) throw new Error("Actor not ready");
      const result = await actor.updateCohortParams(
        editCohort.id,
        editP1,
        editP2,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Cohort updated — applies to new challenges only");
      onSuccess();
      setEditCohort(null);
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  return (
    <div className="space-y-6" data-ocid="admin.cohorts.section">
      {/* Cohorts Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display">
              All Cohorts
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCreate((v) => !v)}
              data-ocid="admin.cohorts.create.open_modal_button"
            >
              {showCreate ? "Cancel" : "+ New Cohort"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["c1", "c2", "c3"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : cohorts.length === 0 ? (
            <div
              className="p-12 text-center text-muted-foreground text-sm"
              data-ocid="admin.cohorts.empty_state"
            >
              No cohorts yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">P1 Target</th>
                    <th className="px-4 py-3 text-right">P2 Target</th>
                    <th className="px-4 py-3 text-right">Created</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((c, idx) => (
                    <tr
                      key={String(c.id)}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.cohorts.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            c.active ? "badge-success" : "badge-warning"
                          }
                        >
                          {c.active ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right mono-price">
                        {c.phase1.profitTarget}%
                      </td>
                      <td className="px-4 py-3 text-right mono-price">
                        {c.phase2.profitTarget}%
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                        {formatTs(c.createdDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-3"
                          onClick={() => setEditCohort(c)}
                          data-ocid={`admin.cohorts.edit.${idx + 1}`}
                        >
                          Edit Params
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Cohort Form */}
      {showCreate && (
        <Card
          className="bg-card border-border border-primary/30"
          data-ocid="admin.cohorts.create.panel"
        >
          <CardHeader>
            <CardTitle className="text-base font-display">
              Create New Cohort
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label className="text-sm">Cohort Name</Label>
              <Input
                placeholder="e.g. Q2 2026 Cohort"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                data-ocid="admin.cohorts.create.name.input"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <PhaseParamsForm
                label="Phase 1 — Evaluation"
                value={createP1}
                onChange={setCreateP1}
                ocidPrefix="admin.cohorts.create.p1"
              />
              <PhaseParamsForm
                label="Phase 2 — Verification"
                value={createP2}
                onChange={setCreateP2}
                ocidPrefix="admin.cohorts.create.p2"
              />
            </div>
            <Button
              onClick={() => createMut.mutate()}
              disabled={
                createMut.isPending || actorLoading || !createName.trim()
              }
              className="w-full"
              data-ocid="admin.cohorts.create.submit_button"
            >
              {createMut.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Cohort"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Cohort Dialog */}
      <Dialog
        open={!!editCohort}
        onOpenChange={(o) => !o && setEditCohort(null)}
      >
        <DialogContent
          className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="admin.cohorts.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit Cohort: {editCohort?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-6">
            <div className="flex items-start gap-2 bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-primary/90">
                Parameter changes apply to new challenges only — existing
                challenges keep their original terms.
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <PhaseParamsForm
                label="Phase 1 — Evaluation"
                value={editP1}
                onChange={setEditP1}
                ocidPrefix="admin.cohorts.edit.p1"
              />
              <PhaseParamsForm
                label="Phase 2 — Verification"
                value={editP2}
                onChange={setEditP2}
                ocidPrefix="admin.cohorts.edit.p2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditCohort(null)}
              data-ocid="admin.cohorts.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateMut.mutate()}
              disabled={updateMut.isPending || actorLoading}
              data-ocid="admin.cohorts.edit.confirm_button"
            >
              {updateMut.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Performance Tab ──────────────────────────────────────────────────────────
function PerformanceTab({
  actor,
  actorLoading,
  cohorts,
  onSuccess,
}: {
  actor: ActorType;
  actorLoading: boolean;
  cohorts: CohortParams[];
  onSuccess: () => void;
}) {
  const [selectedCohortId, setSelectedCohortId] = useState<bigint | null>(null);
  const [passRateTarget, setPassRateTarget] = useState(60);
  const [returnTarget, setReturnTarget] = useState(15);
  const [consistencyTarget, setConsistencyTarget] = useState(65);

  const cohortId =
    selectedCohortId ?? (cohorts.length > 0 ? cohorts[0].id : null);

  useEffect(() => {
    if (!selectedCohortId && cohorts.length > 0) {
      setSelectedCohortId(cohorts[0].id);
    }
  }, [cohorts, selectedCohortId]);

  const { data: targetOutcome, isLoading: outcomeLoading } =
    useQuery<TargetOutcome | null>({
      queryKey: ["targetOutcomes", String(cohortId)],
      queryFn: async () => {
        if (!actor || cohortId === null) return null;
        const result = await actor.getTargetOutcomes(cohortId);
        if (result.__kind__ === "err") return null;
        return result.ok;
      },
      enabled: !!actor && !actorLoading && cohortId !== null,
      staleTime: 30_000,
    });

  const { data: suggestions = [], isLoading: suggestLoading } = useQuery<
    { metric: string; suggested: number; current: number; reason: string }[]
  >({
    queryKey: ["suggestAdjustments", String(cohortId)],
    queryFn: async () => {
      if (!actor || cohortId === null) return [];
      const result = await actor.suggestParamAdjustments(cohortId);
      if (result.__kind__ === "err") return [];
      return result.ok;
    },
    enabled: !!actor && !actorLoading && cohortId !== null,
    staleTime: 60_000,
  });

  const { data: payoutStats, isLoading: payoutLoading } = useQuery({
    queryKey: ["payoutStats"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getPayoutStats();
      if (result.__kind__ === "err") return null;
      return result.ok;
    },
    enabled: !!actor && !actorLoading,
    staleTime: 60_000,
  });

  const setTargetMut = useMutation({
    mutationFn: async () => {
      if (!actor || cohortId === null) throw new Error("Select a cohort first");
      const result = await actor.setTargetOutcomes(
        cohortId,
        passRateTarget,
        returnTarget,
        consistencyTarget,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Target outcomes saved");
      onSuccess();
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const applyMut = useMutation({
    mutationFn: async (_s: {
      metric: string;
      suggested: number;
      current: number;
      reason: string;
    }) => {
      if (!actor || cohortId === null) throw new Error("No cohort");
      const currentCohort = cohorts.find((c) => c.id === cohortId);
      if (!currentCohort) throw new Error("Cohort not found");
      const result = await actor.updateCohortParams(
        cohortId,
        currentCohort.phase1,
        currentCohort.phase2,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Suggestion applied");
      onSuccess();
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  useEffect(() => {
    if (targetOutcome) {
      setPassRateTarget(targetOutcome.passRateTarget);
      setReturnTarget(targetOutcome.returnTarget);
      setConsistencyTarget(targetOutcome.consistencyTarget);
    }
  }, [targetOutcome]);

  return (
    <div className="space-y-6" data-ocid="admin.performance.section">
      {/* Profitability metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {payoutLoading ? (
          ["m1", "m2", "m3"].map((k) => (
            <Skeleton key={k} className="h-24 w-full" />
          ))
        ) : payoutStats ? (
          [
            {
              label: "Total Trader Payouts",
              val: payoutStats.totalTraderPayouts,
              color: "text-chart-1",
            },
            {
              label: "Total Investor Payouts",
              val: payoutStats.totalInvestorPayouts,
              color: "text-primary",
            },
            {
              label: "Platform Revenue",
              val: payoutStats.totalPlatformRevenue,
              color: "text-accent",
            },
          ].map(({ label, val, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`mono-lg font-bold ${color}`}>
                  {val.toFixed(4)} ICP
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div
            className="col-span-3 text-sm text-muted-foreground"
            data-ocid="admin.performance.payouts.empty_state"
          >
            No payout data available.
          </div>
        )}
      </div>

      {/* Cohort selector */}
      {cohorts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-display">
              Target Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label className="text-sm">Select Cohort</Label>
              <select
                value={String(cohortId ?? "")}
                onChange={(e) => setSelectedCohortId(BigInt(e.target.value))}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="admin.performance.cohort.select"
              >
                {cohorts.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name} {c.active ? "(Active)" : "(Archived)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Pass Rate Target %",
                  val: passRateTarget,
                  set: setPassRateTarget,
                  actual: targetOutcome?.actualPassRate ?? 0,
                  ocid: "admin.performance.passrate.input",
                },
                {
                  label: "Return Target %",
                  val: returnTarget,
                  set: setReturnTarget,
                  actual: targetOutcome?.actualReturn ?? 0,
                  ocid: "admin.performance.return.input",
                },
                {
                  label: "Consistency Target %",
                  val: consistencyTarget,
                  set: setConsistencyTarget,
                  actual: targetOutcome?.actualConsistency ?? 0,
                  ocid: "admin.performance.consistency.input",
                },
              ].map(({ label, val, set, actual, ocid }) => {
                const pill = trackingPill(actual, val);
                return (
                  <div key={label} className="space-y-2">
                    <Label className="text-sm">{label}</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) =>
                        set(Number.parseFloat(e.target.value) || 0)
                      }
                      className="font-mono"
                      data-ocid={ocid}
                    />
                    {outcomeLoading ? (
                      <Skeleton className="h-5 w-24" />
                    ) : targetOutcome ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Actual: {actual.toFixed(1)}%
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${pill.cls}`}
                        >
                          {pill.label}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => setTargetMut.mutate()}
              disabled={
                setTargetMut.isPending || actorLoading || cohortId === null
              }
              className="w-full"
              data-ocid="admin.performance.set_targets.submit_button"
            >
              {setTargetMut.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Target Outcomes"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Suggestions Panel */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Suggested Adjustments
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              AI-assisted recommendations
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {suggestLoading ? (
            <div className="p-6 space-y-3">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="admin.performance.suggestions.empty_state"
            >
              {cohortId === null
                ? "Select a cohort to see suggestions."
                : "No adjustment suggestions at this time — parameters look healthy."}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {suggestions.map((s, idx) => (
                <div
                  key={`${s.metric}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.performance.suggestion.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      {s.metric}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">
                        Current
                      </div>
                      <div className="mono-price text-foreground">
                        {s.current.toFixed(1)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">
                        Suggested
                      </div>
                      <div className="mono-price text-primary font-semibold">
                        {s.suggested.toFixed(1)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-3 border-primary/40 text-primary hover:bg-primary/10"
                      onClick={() => applyMut.mutate(s)}
                      disabled={applyMut.isPending || actorLoading}
                      data-ocid={`admin.performance.suggestion.apply.${idx + 1}`}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Funded Traders Tab ───────────────────────────────────────────────────────
type FundedTrader = {
  status: string;
  traderId: Principal;
  username: string;
  monthlyReturn: number;
  allocation: number;
  consistencyScore: number;
};

function FundedTradersTab({
  actor,
  actorLoading,
}: {
  actor: ActorType;
  actorLoading: boolean;
}) {
  const [expandedTrader, setExpandedTrader] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    reviewedCount: bigint;
    changes: AllocationChange[];
  } | null>(null);

  const { data: traders = [], isLoading } = useQuery<FundedTrader[]>({
    queryKey: ["fundedTraderList"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFundedTraderList();
    },
    enabled: !!actor && !actorLoading,
    staleTime: 30_000,
  });

  const reviewMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.triggerMonthlyReview();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (data) => {
      setReviewResult(data);
      setReviewModalOpen(true);
      toast.success(
        `Monthly review complete: ${data.reviewedCount} traders updated`,
      );
    },
    onError: (e: Error) => toast.error(`Review failed: ${e.message}`),
  });

  function statusColor(status: string) {
    if (status === "active") return "badge-success";
    if (status === "suspended") return "badge-destructive";
    return "badge-warning";
  }

  return (
    <div className="space-y-6" data-ocid="admin.funded.section">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-foreground">
            Funded Traders
          </h3>
          <p className="text-sm text-muted-foreground">
            {traders.length} active funded account
            {traders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => reviewMut.mutate()}
          disabled={reviewMut.isPending || actorLoading}
          variant="secondary"
          data-ocid="admin.funded.monthly_review.button"
        >
          {reviewMut.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Review…
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Trigger Monthly Review
            </>
          )}
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["t1", "t2", "t3"].map((k) => (
                <Skeleton key={k} className="h-16 w-full" />
              ))}
            </div>
          ) : traders.length === 0 ? (
            <div
              className="p-12 text-center text-muted-foreground text-sm"
              data-ocid="admin.funded.empty_state"
            >
              No funded traders yet. Traders must pass both challenge phases.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {traders.map((t, idx) => {
                const traderId = t.traderId.toText();
                const isExpanded = expandedTrader === traderId;
                return (
                  <FundedTraderRow
                    key={traderId}
                    trader={t}
                    idx={idx}
                    isExpanded={isExpanded}
                    actor={actor}
                    actorLoading={actorLoading}
                    statusColor={statusColor}
                    onToggle={() =>
                      setExpandedTrader(isExpanded ? null : traderId)
                    }
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Review Result Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="admin.funded.review.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Monthly Review Complete
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            {reviewResult && (
              <>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                  <p className="text-primary font-semibold text-lg mono-lg">
                    {String(reviewResult.reviewedCount)} traders updated
                  </p>
                </div>
                {reviewResult.changes.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
                    {reviewResult.changes.map((change) => (
                      <div
                        key={`${change.traderId.toText()}-${String(change.timestamp)}`}
                        className="py-2 px-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {truncatePrincipal(change.traderId.toText())}
                          </span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="mono-price text-muted-foreground">
                              {change.oldAllocation.toFixed(2)} ICP
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span
                              className={`mono-price font-semibold ${change.newAllocation > change.oldAllocation ? "text-chart-1" : "text-destructive"}`}
                            >
                              {change.newAllocation.toFixed(2)} ICP
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {change.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No allocation changes were made.
                  </p>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setReviewModalOpen(false)}
              data-ocid="admin.funded.review.close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Funded Trader Row (expandable) ──────────────────────────────────────────
function FundedTraderRow({
  trader,
  idx,
  isExpanded,
  actor,
  actorLoading,
  statusColor,
  onToggle,
}: {
  trader: FundedTrader;
  idx: number;
  isExpanded: boolean;
  actor: ActorType;
  actorLoading: boolean;
  statusColor: (s: string) => string;
  onToggle: () => void;
}) {
  const { data: allocation, isLoading: allocLoading } = useQuery({
    queryKey: ["traderAllocation", trader.traderId.toText()],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getTraderAllocation(trader.traderId);
      if (result.__kind__ === "err") return null;
      return result.ok;
    },
    enabled: !!actor && !actorLoading && isExpanded,
    staleTime: 30_000,
  });

  const consistencyColor =
    trader.consistencyScore >= 80
      ? "text-chart-1"
      : trader.consistencyScore >= 60
        ? "text-accent"
        : "text-destructive";

  return (
    <>
      <button
        type="button"
        className="w-full flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-4 hover:bg-muted/20 transition-colors cursor-pointer text-left"
        onClick={onToggle}
        data-ocid={`admin.funded.item.${idx + 1}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-muted-foreground shrink-0" aria-hidden="true">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {trader.username || truncatePrincipal(trader.traderId.toText())}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {truncatePrincipal(trader.traderId.toText())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-sm shrink-0 flex-wrap">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Allocation</p>
            <p className="mono-price font-semibold text-foreground">
              {trader.allocation.toFixed(2)} ICP
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Consistency</p>
            <p className={`mono-price font-semibold ${consistencyColor}`}>
              {trader.consistencyScore.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Monthly Return</p>
            <p
              className={`mono-price font-semibold ${trader.monthlyReturn >= 0 ? "text-chart-1" : "text-destructive"}`}
            >
              {trader.monthlyReturn >= 0 ? "+" : ""}
              {trader.monthlyReturn.toFixed(2)}%
            </p>
          </div>
          <span className={statusColor(trader.status)}>{trader.status}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-4 bg-muted/10 border-b border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
            Allocation History
          </p>
          {allocLoading ? (
            <div className="space-y-2">
              {["h1", "h2", "h3"].map((k) => (
                <Skeleton key={k} className="h-8 w-full" />
              ))}
            </div>
          ) : allocation ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Base</p>
                  <p className="mono-price font-semibold">
                    {allocation.base.toFixed(2)} ICP
                  </p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="mono-price font-semibold text-primary">
                    {allocation.current.toFixed(2)} ICP
                  </p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Multiplier</p>
                  <p className="mono-price font-semibold text-accent">
                    {allocation.multiplier.toFixed(2)}×
                  </p>
                </div>
              </div>
              {allocation.history.length > 0 ? (
                <div className="divide-y divide-border/30 max-h-48 overflow-y-auto">
                  {allocation.history.map((h) => (
                    <div
                      key={`${String(h.timestamp)}-${h.oldAllocation}`}
                      className="flex items-center gap-3 py-2 text-xs"
                    >
                      <span className="text-muted-foreground min-w-[120px]">
                        {formatTs(h.timestamp)}
                      </span>
                      <span className="mono-price">
                        {h.oldAllocation.toFixed(2)}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span
                        className={`mono-price font-semibold ${h.newAllocation > h.oldAllocation ? "text-chart-1" : "text-destructive"}`}
                      >
                        {h.newAllocation.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground flex-1 truncate">
                        {h.reason}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No allocation history yet.
                </p>
              )}
            </div>
          ) : (
            <p
              className="text-xs text-muted-foreground"
              data-ocid="admin.funded.allocation.error_state"
            >
              Could not load allocation data.
            </p>
          )}
        </div>
      )}
    </>
  );
}
