import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useTraderProfile } from "@/hooks/useTraderProfile";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Existing pages
const TraderDashboard = lazy(() => import("@/pages/TraderDashboard"));
const ChallengeEntryPage = lazy(() => import("@/pages/ChallengeEntryPage"));
const TradePage = lazy(() => import("@/pages/TradePage"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

// New pages
const InvestorDashboard = lazy(() => import("@/pages/InvestorDashboard"));
const PublicLeaderboard = lazy(() => import("@/pages/PublicLeaderboard"));
const FundedAccountPage = lazy(() => import("@/pages/FundedAccountPage"));

// ─── Page loader fallback ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
  );
}

// ─── Auth guard wrappers ──────────────────────────────────────────────────────
function TraderGuard() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { profile, isLoading } = useTraderProfile();

  if (isInitializing || isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (profile?.role === "admin") return <Navigate to="/admin" />;

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function AdminGuard() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { profile, isLoading } = useTraderProfile();

  if (isInitializing || isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (profile?.role !== "admin") return <Navigate to="/dashboard" />;

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function InvestorGuard() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { profile, isLoading } = useTraderProfile();

  if (isInitializing || isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  // No investor role in UserRole enum — admins go to admin panel
  if (profile?.role === "admin") return <Navigate to="/admin" />;

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <Suspense fallback={<PageLoader />}>
      <NotFoundPage />
    </Suspense>
  ),
});

// ─── Index: smart redirect ────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function IndexRedirect() {
    const { isAuthenticated, isInitializing } = useAuth();
    const { profile, isLoading } = useTraderProfile();

    if (isInitializing || isLoading) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (profile?.role === "admin") return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
  },
});

// ─── Login ────────────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <LoginPage />
    </Suspense>
  ),
});

// ─── Public leaderboard ───────────────────────────────────────────────────────
const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <PublicLeaderboard />
    </Suspense>
  ),
});

// ─── Trader routes ────────────────────────────────────────────────────────────
const traderLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: TraderGuard,
});

const dashboardRoute = createRoute({
  getParentRoute: () => traderLayoutRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TraderDashboard />
    </Suspense>
  ),
});

const challengeEntryRoute = createRoute({
  getParentRoute: () => traderLayoutRoute,
  path: "/challenge",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ChallengeEntryPage />
    </Suspense>
  ),
});

const tradeRoute = createRoute({
  getParentRoute: () => traderLayoutRoute,
  path: "/trade",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TradePage />
    </Suspense>
  ),
});

const fundedAccountRoute = createRoute({
  getParentRoute: () => traderLayoutRoute,
  path: "/funded",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <FundedAccountPage />
    </Suspense>
  ),
});

// ─── Investor routes ──────────────────────────────────────────────────────────
const investorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/investor",
  component: InvestorGuard,
});

const investorDashboardRoute = createRoute({
  getParentRoute: () => investorLayoutRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <InvestorDashboard />
    </Suspense>
  ),
});

// ─── Admin routes ─────────────────────────────────────────────────────────────
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminGuard,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AdminDashboard />
    </Suspense>
  ),
});

// ─── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  leaderboardRoute,
  traderLayoutRoute.addChildren([
    dashboardRoute,
    challengeEntryRoute,
    tradeRoute,
    fundedAccountRoute,
  ]),
  investorLayoutRoute.addChildren([investorDashboardRoute]),
  adminLayoutRoute.addChildren([adminDashboardRoute]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
