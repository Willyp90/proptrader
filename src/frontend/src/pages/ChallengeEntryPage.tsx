import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { ChallengeStatus, RiskLevel } from "../backend.d";
import { useAuth } from "../hooks/useAuth";
import { useChallenge } from "../hooks/useChallenge";
import { formatPrice } from "../types";

// ─── Risk derivation (mirrors backend logic) ──────────────────────────────────

interface DerivedParams {
  perTradeLimitPct: number;
  dailyDrawdownLimitPct: number;
  totalDrawdownLimitPct: number;
  baseFee: number;
  performanceFee: number;
}

function deriveParams(
  riskLevel: RiskLevel,
  targetProfitPct: number,
): DerivedParams {
  const scale = targetProfitPct / 10.0;
  const base = {
    [RiskLevel.low]: { perTrade: 1, daily: 3, total: 5, base: 0.5, perf: 10 },
    [RiskLevel.medium]: {
      perTrade: 2,
      daily: 5,
      total: 8,
      base: 1.0,
      perf: 15,
    },
    [RiskLevel.high]: { perTrade: 3, daily: 8, total: 12, base: 1.5, perf: 20 },
  }[riskLevel];

  return {
    perTradeLimitPct: base.perTrade * scale,
    dailyDrawdownLimitPct: base.daily * scale,
    totalDrawdownLimitPct: base.total * scale,
    baseFee: base.base * scale,
    performanceFee: base.perf,
  };
}

function riskColor(r: RiskLevel) {
  return {
    [RiskLevel.low]: "text-chart-1",
    [RiskLevel.medium]: "text-chart-3",
    [RiskLevel.high]: "text-destructive",
  }[r];
}

// ─── Risk preview card ────────────────────────────────────────────────────────

function RiskPreview({
  params,
  balance,
  targetPct,
}: {
  params: DerivedParams;
  balance: number;
  targetPct: number;
}) {
  const passThreshold = balance * (1 + targetPct / 100);

  const rows = [
    {
      label: "Per-trade max loss",
      value: `${params.perTradeLimitPct.toFixed(2)}%`,
      usd: formatPrice((params.perTradeLimitPct / 100) * balance),
    },
    {
      label: "Daily drawdown limit",
      value: `${params.dailyDrawdownLimitPct.toFixed(2)}%`,
      usd: formatPrice((params.dailyDrawdownLimitPct / 100) * balance),
    },
    {
      label: "Total drawdown limit",
      value: `${params.totalDrawdownLimitPct.toFixed(2)}%`,
      usd: formatPrice((params.totalDrawdownLimitPct / 100) * balance),
    },
    {
      label: "Target balance (pass)",
      value: `+${targetPct.toFixed(0)}%`,
      usd: formatPrice(passThreshold),
    },
    {
      label: "Base fee",
      value: `${params.baseFee.toFixed(2)}%`,
      usd: formatPrice((params.baseFee / 100) * balance),
    },
    {
      label: "Performance fee",
      value: `${params.performanceFee.toFixed(0)}%`,
      usd: "of profits",
    },
  ];

  return (
    <Card
      className="bg-card border-border"
      data-ocid="challenge_entry.risk_preview_card"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          Risk Parameters Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between px-5 py-2.5 text-xs ${
              i % 2 === 0 ? "bg-muted/20" : ""
            }`}
          >
            <span className="text-muted-foreground">{r.label}</span>
            <div className="flex items-center gap-2 text-right">
              <span className="font-mono font-semibold text-foreground">
                {r.value}
              </span>
              {r.usd !== "of profits" && (
                <span className="text-muted-foreground/60 font-mono">
                  {r.usd}
                </span>
              )}
              {r.usd === "of profits" && (
                <span className="text-muted-foreground/60">of profits</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Existing challenge banner ────────────────────────────────────────────────

function ExistingChallengeBanner({
  challenge,
}: {
  challenge: {
    status: ChallengeStatus;
    currentBalance: number;
    startingBalance: number;
    targetProfitPct: number;
  };
}) {
  const pnl = challenge.currentBalance - challenge.startingBalance;
  const isPositive = pnl >= 0;
  const st =
    challenge.status === ChallengeStatus.active
      ? { label: "ACTIVE", cls: "bg-primary/10 text-primary border-primary/30" }
      : challenge.status === ChallengeStatus.passed
        ? {
            label: "PASSED",
            cls: "bg-chart-1/15 text-chart-1 border-chart-1/30",
          }
        : {
            label: "FAILED",
            cls: "bg-destructive/15 text-destructive border-destructive/30",
          };

  return (
    <Card
      className="bg-card border-border"
      data-ocid="challenge_entry.existing_challenge_card"
    >
      <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-display font-semibold text-foreground text-sm">
              Existing Challenge
            </p>
            <Badge variant="outline" className={`text-xs font-bold ${st.cls}`}>
              {st.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Balance:{" "}
            <span className="font-mono font-medium text-foreground">
              {formatPrice(challenge.currentBalance)}
            </span>{" "}
            · P&L:{" "}
            <span
              className={`font-mono font-semibold ${isPositive ? "text-chart-1" : "text-destructive"}`}
            >
              {isPositive ? "+" : ""}
              {formatPrice(pnl)} (
              {((pnl / challenge.startingBalance) * 100).toFixed(2)}%)
            </span>{" "}
            · Target:{" "}
            <span className="font-mono font-medium text-foreground">
              +{challenge.targetProfitPct.toFixed(0)}%
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const RISK_OPTIONS: { value: RiskLevel; label: string; desc: string }[] = [
  { value: RiskLevel.low, label: "Low", desc: "Conservative limits" },
  { value: RiskLevel.medium, label: "Medium", desc: "Balanced risk/reward" },
  { value: RiskLevel.high, label: "High", desc: "Aggressive scaling" },
];

export default function ChallengeEntryPage() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const { challenge, isLoading: challengeLoading } = useChallenge();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(10000);
  const [targetPct, setTargetPct] = useState(10);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.medium);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = deriveParams(riskLevel, targetPct);
  const hasExistingChallenge =
    challenge !== null &&
    (challenge.status === ChallengeStatus.active ||
      challenge.status === ChallengeStatus.passed);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor || actorLoading || !isAuthenticated) return;
    setIsSubmitting(true);
    try {
      const result = await actor.enterChallenge(balance, targetPct, riskLevel);
      if (result.__kind__ === "ok") {
        queryClient.invalidateQueries({ queryKey: ["challenge", principal] });
        toast.success("Challenge started!", {
          description: `Starting balance ${formatPrice(balance)} · Target +${targetPct}%`,
          duration: 5000,
        });
        await navigate({ to: "/dashboard" });
      } else {
        toast.error("Failed to enter challenge", {
          description: (result as { __kind__: "err"; err: string }).err,
        });
      }
    } catch (err) {
      toast.error("Error entering challenge", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl" data-ocid="challenge_entry.page">
      {/* Header */}
      <div>
        <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
          Enter Challenge
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure your trading challenge parameters and risk profile.
        </p>
      </div>

      {challengeLoading ? (
        <Card className="bg-card border-border">
          <CardContent className="py-6">
            <div className="space-y-3">
              <div className="h-4 w-48 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-64 bg-secondary rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ) : hasExistingChallenge && challenge ? (
        <div className="space-y-4">
          <ExistingChallengeBanner challenge={challenge} />
          <Card className="bg-muted/30 border-border border-dashed">
            <CardContent className="py-5 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                You already have an active or passed challenge. Complete or fail
                your current challenge before starting a new one.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Form */}
          <Card
            className="bg-card border-border"
            data-ocid="challenge_entry.form_card"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Challenge Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Starting Balance */}
                <div className="space-y-2">
                  <Label
                    htmlFor="balance"
                    className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Starting Balance (USD)
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    min={1000}
                    max={1_000_000}
                    step={500}
                    value={balance}
                    onChange={(e) =>
                      setBalance(Math.max(1000, Number(e.target.value)))
                    }
                    className="font-mono text-base"
                    data-ocid="challenge_entry.balance_input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum $1,000 · Simulated capital for evaluation traders
                  </p>
                </div>

                <Separator />

                {/* Target Profit */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                      Target Profit %
                    </Label>
                    <span
                      className="font-mono font-bold text-primary text-base"
                      data-ocid="challenge_entry.target_pct_display"
                    >
                      +{targetPct}%
                    </span>
                  </div>
                  <Slider
                    min={5}
                    max={50}
                    step={1}
                    value={[targetPct]}
                    onValueChange={([v]) => setTargetPct(v)}
                    className="w-full"
                    data-ocid="challenge_entry.target_pct_slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>5%</span>
                    <span className="text-foreground font-semibold">
                      Pass threshold:{" "}
                      {formatPrice(balance * (1 + targetPct / 100))}
                    </span>
                    <span>50%</span>
                  </div>
                </div>

                <Separator />

                {/* Risk Level */}
                <div className="space-y-3">
                  <Label className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                    Risk Level
                  </Label>
                  <div
                    className="grid grid-cols-3 gap-2"
                    data-ocid="challenge_entry.risk_level_select"
                  >
                    {RISK_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRiskLevel(opt.value)}
                        data-ocid={`challenge_entry.risk_${opt.value}_button`}
                        className={`px-3 py-2.5 rounded-md border text-xs font-display font-semibold transition-smooth ${
                          riskLevel === opt.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        <span
                          className={`block font-bold ${riskLevel === opt.value ? riskColor(opt.value) : ""}`}
                        >
                          {opt.label}
                        </span>
                        <span className="block text-[10px] mt-0.5 font-normal opacity-70">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 rounded-md bg-chart-3/10 border border-chart-3/30">
                  <AlertTriangle className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Evaluation traders
                    </span>{" "}
                    use simulated capital with live DEX price feeds. Funded
                    traders execute{" "}
                    <span className="font-semibold text-foreground">
                      real on-chain swaps
                    </span>
                    .
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 font-display font-semibold"
                  disabled={isSubmitting || !isAuthenticated || actorLoading}
                  data-ocid="challenge_entry.submit_button"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Entering Challenge…
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3.5 w-3.5" />
                      Enter Challenge
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <RiskPreview
            params={params}
            balance={balance}
            targetPct={targetPct}
          />
        </div>
      )}
    </div>
  );
}
