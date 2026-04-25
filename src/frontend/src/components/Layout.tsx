import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useTraderProfile } from "@/hooks/useTraderProfile";
import { truncatePrincipal } from "@/types";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { TraderMode } from "../backend.d";
import { TraderMode as TraderModeEnum, UserRole } from "../backend.d";

const TRADER_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trade", href: "/dashboard/trade", icon: TrendingUp },
  { label: "Challenge", href: "/dashboard/challenge", icon: Trophy },
  { label: "Funded Account", href: "/dashboard/funded", icon: Wallet },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
];

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Parameters", href: "/admin", icon: Settings },
  { label: "Challenges", href: "/admin", icon: Users },
  { label: "Audit Log", href: "/admin", icon: FileText },
];

const INVESTOR_NAV = [
  { label: "Investor Dashboard", href: "/investor", icon: LayoutDashboard },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
];

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

function NavItem({ href, icon: Icon, label, onClick }: NavItemProps) {
  const router = useRouter();
  const isActive = router.state.location.pathname === href;

  return (
    <Link
      to={href}
      onClick={onClick}
      data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}.link`}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-display font-medium transition-smooth ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function ModeBadge({ mode }: { mode: TraderMode }) {
  return mode === TraderModeEnum.funded ? (
    <span className="badge-real flex items-center gap-1.5">
      <ShieldCheck className="h-3 w-3" />
      REAL
    </span>
  ) : (
    <span className="badge-simulated flex items-center gap-1.5">
      <Activity className="h-3 w-3" />
      SIMULATED
    </span>
  );
}

interface SidebarContentProps {
  isAdmin: boolean;
  isInvestor?: boolean;
  mode?: TraderMode;
  principal: string | null;
  onLogout: () => void;
  onNavClick?: () => void;
}

function SidebarContent({
  isAdmin,
  isInvestor,
  mode,
  principal,
  onLogout,
  onNavClick,
}: SidebarContentProps) {
  const navItems = isAdmin ? ADMIN_NAV : isInvestor ? INVESTOR_NAV : TRADER_NAV;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2">
        <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-base font-display font-bold text-foreground tracking-tight">
          PropTrader
        </span>
      </div>

      <Separator className="mb-3" />

      {/* Mode badge for traders */}
      {!isAdmin && !isInvestor && mode && (
        <div className="px-4 pb-3">
          <ModeBadge mode={mode} />
        </div>
      )}

      {/* Admin badge */}
      {isAdmin && (
        <div className="px-4 pb-3">
          <span className="badge-warning flex items-center gap-1.5 w-fit">
            <ShieldCheck className="h-3 w-3" />
            ADMIN
          </span>
        </div>
      )}

      {/* Investor badge */}
      {isInvestor && !isAdmin && (
        <div className="px-4 pb-3">
          <span className="badge-real flex items-center gap-1.5 w-fit">
            <Users className="h-3 w-3" />
            INVESTOR
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5" data-ocid="sidebar.nav">
        {navItems.map((item) => (
          <NavItem
            key={item.href + item.label}
            href={item.href}
            icon={item.icon}
            label={item.label}
            onClick={onNavClick}
          />
        ))}
      </nav>

      <Separator className="my-3" />

      {/* Footer */}
      <div className="px-4 pb-4 space-y-3">
        {principal && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-display">
              Principal
            </p>
            <p className="font-mono text-xs text-foreground tracking-tight break-all">
              {truncatePrincipal(principal)}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={onLogout}
          data-ocid="sidebar.logout_button"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, principal } = useAuth();
  const { profile } = useTraderProfile();

  const isAdmin = profile?.role === UserRole.admin;
  const isInvestor =
    !isAdmin && typeof window !== "undefined"
      ? window.location.pathname.startsWith("/investor")
      : false;
  const mode = profile?.mode;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 flex-col border-r border-border bg-card shrink-0 fixed left-0 top-0 h-screen z-30"
        data-ocid="sidebar"
      >
        <SidebarContent
          isAdmin={isAdmin}
          isInvestor={isInvestor}
          mode={mode}
          principal={principal}
          onLogout={logout}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-56 p-0 bg-card"
          data-ocid="sidebar.mobile"
        >
          <SidebarContent
            isAdmin={isAdmin}
            isInvestor={isInvestor}
            mode={mode}
            principal={principal}
            onLogout={logout}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-56 min-w-0">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-4 bg-card border-b border-border sticky top-0 z-20"
          data-ocid="topbar"
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileOpen(true)}
              data-ocid="topbar.menu_toggle"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <span className="font-display font-bold text-sm text-foreground md:hidden">
              PropTrader
            </span>
          </div>

          {/* Right side: principal on desktop */}
          <div className="hidden md:flex items-center gap-3">
            {principal && (
              <span className="font-mono text-xs text-muted-foreground">
                {truncatePrincipal(principal)}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground h-8"
              onClick={logout}
              data-ocid="topbar.logout_button"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6" data-ocid="main_content">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 md:px-6 py-3 border-t border-border bg-muted/40 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} PropTrader</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
          >
            Built with love using caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
