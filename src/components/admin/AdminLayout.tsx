import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Globe, Users, Newspaper, LogOut } from "lucide-react";
import { useSupabaseAuth, type AuthUser } from "@/hooks/useSupabaseAuth";

const NAV_ITEMS = [
  { label: "Network", icon: Globe, path: "/admin/network" },
  { label: "Fan Clubs", icon: Users, path: "/admin/fan-clubs" },
  { label: "Content", icon: Newspaper, path: "/admin/content" },
];

export function AdminLayout({ user, children }: { user: AuthUser; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useSupabaseAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-white">
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col bg-white z-20"
        style={{ borderRight: "0.5px solid hsl(var(--color-border))" }}
      >
        <div
          className="px-5 h-14 flex items-center shrink-0"
          style={{ borderBottom: "0.5px solid hsl(var(--color-border))" }}
        >
          <span className="text-[12px] font-semibold text-[#0A1628] tracking-widest uppercase">
            ToBe Admin
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-colors relative ${
                  active
                    ? "text-[#0C447C]"
                    : "text-ds-text-secondary hover:bg-[#F5F5F7] hover:text-[#0A1628]"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: "rgba(12, 68, 124, 0.10)",
                        boxShadow: "inset 2px 0 0 0 #0C447C",
                      }
                    : undefined
                }
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 shrink-0" style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
              style={{ backgroundColor: "#0C447C" }}
            >
              {user.initials}
            </div>
            <p className="text-[12px] font-medium text-[#0A1628] truncate">@{user.username}</p>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="w-full mt-1 flex items-center gap-3 px-3 h-9 rounded-lg text-[12px] text-ds-text-tertiary hover:bg-[#F5F5F7] hover:text-[#0A1628] transition-colors"
          >
            <LogOut size={14} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      <main className="md:ml-[220px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
