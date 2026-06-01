import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Network, Rss, Sparkles, ArrowLeft } from "lucide-react";
import { useIsSuperAdmin } from "@/hooks/useNetwork";

const tabs = [
  { to: "/admin/network", label: "Sites", icon: Network },
  { to: "/admin/network/feeds", label: "Feeds", icon: Rss },
  { to: "/admin/network/strategy", label: "Content Strategy", icon: Sparkles },
] as const;

export function NetworkLayout({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useIsSuperAdmin();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (!isSuperAdmin) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">Network admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The Network control panel is restricted to the super admin.
        </p>
        <Link to="/admin" className="mt-6 inline-block text-sm underline">
          ← Back to admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Admin
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-semibold">Network</h1>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex gap-1">
            {tabs.map((t) => {
              const active =
                t.to === "/admin/network"
                  ? pathname === "/admin/network"
                  : pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}
