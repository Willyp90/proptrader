import { u as useNavigate, a as useAuth, b as useTraderProfile, r as reactExports, j as jsxRuntimeExports, T as TrendingUp, B as Button } from "./index-n7jmytJ0.js";
import { C as Card, a as CardContent } from "./card-D-cSpQXq.js";
import { L as LoaderCircle } from "./loader-circle-BlXE_Dry.js";
function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    isAuthenticated,
    isLoggingIn,
    isInitializing,
    isLoginSuccess
  } = useAuth();
  const { profile, isLoading, register } = useTraderProfile();
  reactExports.useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    async function handlePostLogin() {
      if (profile === null) {
        try {
          await register();
        } catch {
        }
      }
      const role = profile == null ? void 0 : profile.role;
      if (role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
    if (isLoginSuccess || isAuthenticated && profile !== void 0) {
      handlePostLogin();
    }
  }, [isAuthenticated, isLoginSuccess, isLoading, profile, register, navigate]);
  const isProcessing = isLoggingIn || isInitializing || isLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen flex items-center justify-center bg-background p-4",
      "data-ocid": "login.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed inset-0 pointer-events-none opacity-[0.03]",
            style: {
              backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-7 w-7 text-primary-foreground" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground tracking-tight", children: "PropTrader" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 font-body", children: "Trade. Prove. Get Funded." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Card,
            {
              className: "border-border bg-card shadow-lg",
              "data-ocid": "login.card",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-6 pb-6 space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-display font-semibold text-foreground", children: "Connect your identity" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: "Use Internet Identity for secure, on-chain authentication. No password required." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    className: "w-full gap-2 font-display font-semibold",
                    size: "lg",
                    onClick: login,
                    disabled: isProcessing,
                    "data-ocid": "login.connect_button",
                    children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                      "Connecting…"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
                      "Connect with Internet Identity"
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 pt-1", children: [
                  { label: "On-chain", sub: "Verified" },
                  { label: "No password", sub: "Passwordless" },
                  { label: "Self-custody", sub: "Your keys" }
                ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "text-center space-y-0.5 py-2 rounded-md bg-secondary",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-display font-semibold text-foreground", children: item.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: item.sub })
                    ]
                  },
                  item.label
                )) })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground mt-5 leading-relaxed", children: "By connecting, you agree to participate in on-chain simulated or funded trading under the platform's risk parameters." })
        ] })
      ]
    }
  );
}
export {
  LoginPage as default
};
