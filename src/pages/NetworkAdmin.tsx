import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Image, Rss, Search, Settings } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteStatus = "active" | "coming_soon" | "inactive";
type Tab = "sites" | "feeds" | "content_strategy";
type StatusFilter = "all" | SiteStatus;

interface SiteRow {
  id: string;
  name: string;
  slug: string | null;
  domain: string | null;
  emoji: string;
  color: string | null;
  font: string | null;
  status: SiteStatus | null;
  category: string | null;
  priority: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<SiteStatus, string> = {
  active: "Active",
  coming_soon: "Coming Soon",
  inactive: "Inactive",
};

const STATUS_COLORS: Record<SiteStatus, { bg: string; fg: string }> = {
  active: { bg: "#E8F4EA", fg: "#226B40" },
  coming_soon: { bg: "#FEF3C7", fg: "#92400E" },
  inactive: { bg: "#F5F5F7", fg: "#6B7280" },
};

function statusStyle(status: SiteStatus | null) {
  if (!status) return { bg: "#F5F5F7", fg: "#6B7280" };
  return STATUS_COLORS[status] ?? { bg: "#F5F5F7", fg: "#6B7280" };
}

// ─── Sites tab ────────────────────────────────────────────────────────────────

function SitesTab() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ["admin-network-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("id, name, slug, domain, emoji, color, font, status, category, priority")
        .order("name");
      if (error) throw error;
      return (data ?? []) as SiteRow[];
    },
  });

  const filtered = useMemo(() => {
    let rows = sites;
    if (statusFilter !== "all") rows = rows.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.slug ?? "").toLowerCase().includes(q) ||
          (s.domain ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [sites, statusFilter, search]);

  const updateStatus = async (site: SiteRow, value: SiteStatus) => {
    const { error } = await supabase
      .from("sites")
      .update({ status: value })
      .eq("id", site.id);
    if (error) {
      toast.error(`Could not update ${site.name}`);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-network-sites"] });
    toast.success(`${site.name} → ${STATUS_LABELS[value]}`);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div
          className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white flex-1 min-w-[200px] max-w-[320px]"
          style={{ border: "0.5px solid hsl(var(--color-border-strong))" }}
        >
          <Search size={13} strokeWidth={1.75} className="text-ds-text-tertiary shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domains…"
            className="flex-1 text-[13px] bg-transparent focus:outline-none text-[#0A1628] placeholder:text-ds-text-tertiary"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5">
          {(["all", "active", "coming_soon", "inactive"] as StatusFilter[]).map((f) => {
            const active = statusFilter === f;
            const label =
              f === "all" ? "All" : STATUS_LABELS[f as SiteStatus];
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap"
                style={
                  active
                    ? { backgroundColor: "#0C447C", color: "#fff" }
                    : { border: "0.5px solid hsl(var(--color-border))", color: "hsl(var(--color-text-secondary))" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Count */}
        <span className="text-[13px] text-ds-text-tertiary ml-auto whitespace-nowrap">
          {isLoading ? "…" : `${filtered.length} site${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-[#F5F5F7] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl px-6 py-10 text-center text-[13px] text-ds-text-tertiary"
          style={{ border: "0.5px dashed hsl(var(--color-border))" }}
        >
          No sites match your filter.
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "0.5px solid hsl(var(--color-border))" }}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr
                style={{
                  borderBottom: "0.5px solid hsl(var(--color-border))",
                  backgroundColor: "#FAFAFB",
                }}
              >
                <th className="text-left px-4 py-3 font-medium text-ds-text-secondary">Site</th>
                <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden sm:table-cell">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-ds-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden md:table-cell">Color</th>
                <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden lg:table-cell">Font</th>
                <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden lg:table-cell">Priority</th>
                <th className="text-right px-4 py-3 font-medium text-ds-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((site, i) => {
                const st = statusStyle(site.status);
                return (
                  <tr
                    key={site.id}
                    style={{
                      borderTop: i === 0 ? undefined : "0.5px solid hsl(var(--color-border))",
                    }}
                    className="hover:bg-[#FAFAFB] transition-colors"
                  >
                    {/* Site */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[18px] shrink-0">{site.emoji}</span>
                        <span className="font-medium text-[#0A1628]">{site.name}</span>
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="px-4 py-3 hidden sm:table-cell text-ds-text-secondary">
                      {site.slug ? `${site.slug}.fan` : (site.domain ?? "—")}
                    </td>

                    {/* Status dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={site.status ?? ""}
                        onChange={(e) => updateStatus(site, e.target.value as SiteStatus)}
                        className="h-7 pl-2 pr-6 rounded-full text-[11px] font-medium appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0C447C]"
                        style={{
                          backgroundColor: st.bg,
                          color: st.fg,
                          border: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='${encodeURIComponent(st.fg)}' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 6px center",
                        }}
                      >
                        <option value="">—</option>
                        <option value="active">Active</option>
                        <option value="coming_soon">Coming Soon</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>

                    {/* Color swatch */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {site.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: site.color, border: "1px solid rgba(0,0,0,0.08)" }}
                          />
                          <span className="text-[11px] font-mono text-ds-text-tertiary">{site.color}</span>
                        </div>
                      ) : (
                        <span className="text-ds-text-tertiary">—</span>
                      )}
                    </td>

                    {/* Font */}
                    <td className="px-4 py-3 hidden lg:table-cell text-ds-text-secondary">
                      {site.font ?? <span className="text-ds-text-tertiary">—</span>}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden lg:table-cell text-ds-text-secondary">
                      {site.category ?? <span className="text-ds-text-tertiary">—</span>}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 hidden lg:table-cell text-ds-text-secondary">
                      {site.priority ?? <span className="text-ds-text-tertiary">—</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/network/sites/${site.slug}`)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-ds-text-tertiary hover:bg-[#F0F0F0] hover:text-[#0C447C] transition-colors"
                          title="Site builder"
                        >
                          <Settings size={13} strokeWidth={1.75} />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-ds-text-tertiary hover:bg-[#F0F0F0] transition-colors"
                          title="Upload logo"
                        >
                          <Image size={13} strokeWidth={1.75} />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-ds-text-tertiary hover:bg-[#F0F0F0] transition-colors"
                          title="Feeds"
                        >
                          <Rss size={13} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const NetworkAdmin = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();
  const [tab, setTab] = useState<Tab>("sites");

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["admin-check", user?.dbUserId],
    enabled: !!user?.dbUserId,
    queryFn: async () => {
      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user!.dbUserId!)
        .maybeSingle();
      return !!data;
    },
  });

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) navigate("/", { replace: true });
  }, [isAdmin, adminLoading, navigate]);

  if (loading || adminLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "sites", label: "Sites" },
    { id: "feeds", label: "Feeds" },
    { id: "content_strategy", label: "Content Strategy" },
  ];

  return (
    <>
      <Helmet>
        <title>Network — Admin</title>
      </Helmet>
      <AdminLayout user={user}>
        {/* Breadcrumb */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0C447C] mb-1.5">
          Admin / Network
        </p>

        {/* Title */}
        <h1 className="text-[32px] font-semibold tracking-[-0.6px] text-[#0A1628] leading-[1.15] mb-6">
          Network
        </h1>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 mb-6 overflow-x-auto"
          style={{ borderBottom: "0.5px solid hsl(var(--color-border))" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 h-10 text-[13px] font-medium transition-colors whitespace-nowrap relative ${
                tab === t.id ? "text-[#0C447C]" : "text-ds-text-tertiary hover:text-[#0A1628]"
              }`}
              style={tab === t.id ? { boxShadow: "inset 0 -2px 0 0 #0C447C" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "sites" && <SitesTab />}

        {tab === "feeds" && (
          <div
            className="rounded-xl px-6 py-10 text-center text-[13px] text-ds-text-tertiary"
            style={{ border: "0.5px dashed hsl(var(--color-border))" }}
          >
            Feed management — coming soon
          </div>
        )}

        {tab === "content_strategy" && (
          <div
            className="rounded-xl px-6 py-10 text-center text-[13px] text-ds-text-tertiary"
            style={{ border: "0.5px dashed hsl(var(--color-border))" }}
          >
            Content strategy — coming soon
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default NetworkAdmin;
