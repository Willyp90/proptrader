import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTraderProfile } from "@/hooks/useTraderProfile";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, TrendingUp } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    isAuthenticated,
    isLoggingIn,
    isInitializing,
    isLoginSuccess,
  } = useAuth();
  const { profile, isLoading, register } = useTraderProfile();

  // Auto-register and redirect after login
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    async function handlePostLogin() {
      if (profile === null) {
        try {
          await register();
        } catch {
          // Registration may fail if already registered — safe to ignore
        }
      }
      const role = profile?.role;
      if (role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }

    if (isLoginSuccess || (isAuthenticated && profile !== undefined)) {
      handlePostLogin();
    }
  }, [isAuthenticated, isLoginSuccess, isLoading, profile, register, navigate]);

  const isProcessing = isLoggingIn || isInitializing || isLoading;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      data-ocid="login.page"
    >
      {/* Background grid decoration */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Header mark */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              PropTrader
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Trade. Prove. Get Funded.
            </p>
          </div>
        </div>

        {/* Login card */}
        <Card
          className="border-border bg-card shadow-lg"
          data-ocid="login.card"
        >
          <CardContent className="pt-6 pb-6 space-y-5">
            <div className="space-y-1.5 text-center">
              <h2 className="text-base font-display font-semibold text-foreground">
                Connect your identity
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use Internet Identity for secure, on-chain authentication. No
                password required.
              </p>
            </div>

            <Button
              className="w-full gap-2 font-display font-semibold"
              size="lg"
              onClick={login}
              disabled={isProcessing}
              data-ocid="login.connect_button"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Connect with Internet Identity
                </>
              )}
            </Button>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: "On-chain", sub: "Verified" },
                { label: "No password", sub: "Passwordless" },
                { label: "Self-custody", sub: "Your keys" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center space-y-0.5 py-2 rounded-md bg-secondary"
                >
                  <p className="text-xs font-display font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
          By connecting, you agree to participate in on-chain simulated or
          funded trading under the platform's risk parameters.
        </p>
      </div>
    </div>
  );
}
