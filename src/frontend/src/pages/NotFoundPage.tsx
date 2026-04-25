import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-6"
      data-ocid="notfound.page"
    >
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-foreground">
            PropTrader
          </span>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-6xl font-bold text-primary">404</p>
          <h1 className="text-xl font-display font-semibold text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This route doesn't exist. Head back to the dashboard to continue
            trading.
          </p>
        </div>

        <Link to="/">
          <Button
            variant="outline"
            className="gap-2"
            data-ocid="notfound.home_button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
