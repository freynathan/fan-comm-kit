import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Users, Sparkles, Wallet, BarChart3, Settings, LogOut } from "lucide-react";
import { useSupabaseAuth, type AuthUser } from "@/hooks/useSupabaseAuth";
import { SharedHeader } from "@/components/shared/SharedHeader";

interface NavItem {
  label: string;
  icon: typeof LayoutGrid;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", icon: LayoutGrid, path: "/dashboard" },
  { label: "Clubs", icon: Users, path: "/dashboard/clubs" },
  { label: "Fans", icon: Sparkles, path: "/dashboard/fans" },
  { label: "Earnings", icon: Wallet, path: "/dashboard/earnings" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export function DashboardLayout({ user, children }: { user: AuthUser; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useSupabaseAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col bg-white"
        style={{ borderRight: "0.5px solid hsl(var(--color-border))" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center px-6 h-20"
          style={{ borderBottom: "0.5px solid hsl(var(--color-border))" }}
        >
          <img src={tobeLogo} alt="ToBe.fan" style={{ height: 36, width: "auto" }} />
        </button>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-[#F5F5F7] text-[#0A1628]"
                    : "text-ds-text-secondary hover:bg-[#F5F5F7] hover:text-[#0A1628]"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
              style={{ backgroundColor: "#0C447C" }}
            >
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#0A1628] truncate">@{user.username}</p>
              <p className="text-[11px] text-ds-text-tertiary truncate">tobe.fan</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] text-ds-text-tertiary hover:bg-[#F5F5F7] hover:text-[#0A1628] transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-30 flex items-center justify-around h-16"
        style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? "text-[#0C447C]" : "text-ds-text-tertiary"
              }`}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main */}
      <main className="md:ml-[240px] min-h-screen pb-20 md:pb-0">
        <div className="max-w-[1100px] mx-auto px-5 md:px-12 py-10 md:py-14">{children}</div>
      </main>
    </div>
  );
}
