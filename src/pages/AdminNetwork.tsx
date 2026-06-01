import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Check, Globe } from "lucide-react";
import { toast } from "sonner";

interface SiteRow {
  id: string;
  name: string;
  slug: string | null;
  emoji: string;
  accent_color: string;
  is_active: boolean | null;
  description: string | null;
  member_count: number | null;
}

const AdminNetwork = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();
  const queryClient = useQueryClient();

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

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ["admin-network-sites"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("id, name, slug, emoji, accent_color, is_active, description, member_count")
        .order("name");
      if (error) throw error;
      return (data ?? []) as SiteRow[];
    },
  });

  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [colorDraft, setColorDraft] = useState("");

  const toggleActive = async (site: SiteRow) => {
    const next = !site.is_active;
    await supabase.from("sites").update({ is_active: next }).eq("id", site.id);
    queryClient.invalidateQueries({ queryKey: ["admin-network-sites"] });
    toast.success(`${site.name} ${next ? "activated" : "deactivated"}`);
  };

  const saveColor = async (site: SiteRow) => {
    if (!colorDraft.match(/^#[0-9a-fA-F]{6}$/)) {
      toast.error("Enter a valid hex color (e.g. #FF5733)");
      return;
    }
    await supabase.from("sites").update({ accent_color: colorDraft }).eq("id", site.id);
    queryClient.invalidateQueries({ queryKey: ["admin-network-sites"] });
    setEditingColor(null);
    toast.success(`${site.name} color updated`);
  };

  if (loading || adminLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  const active = sites.filter((s) => s.is_active !== false);
  const inactive = sites.filter((s) => s.is_active === false);

  return (
    <>
      <Helmet>
        <title>Network Sites — Admin</title>
      </Helmet>
      <AdminLayout user={user}>
        <div className="max-w-[860px]">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0C447C] mb-1.5">
              Admin
            </p>
            <h1 className="text-[32px] font-semibold tracking-[-0.6px] text-[#0A1628] leading-[1.15]">
              Network Sites
            </h1>
            <p className="text-[14px] text-ds-text-secondary mt-1.5">
              {isLoading ? "…" : `${sites.length} domains — ${active.length} active, ${inactive.length} inactive`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-[#F5F5F7] animate-pulse" />
              ))}
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
                    <th className="text-left px-5 py-3 font-medium text-ds-text-secondary">Site</th>
                    <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden sm:table-cell">
                      Domain
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden md:table-cell">
                      Accent color
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-ds-text-secondary hidden md:table-cell">
                      Members
                    </th>
                    <th className="text-right px-5 py-3 font-medium text-ds-text-secondary">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site, i) => (
                    <tr
                      key={site.id}
                      style={{
                        borderTop: i === 0 ? undefined : "0.5px solid hsl(var(--color-border))",
                        opacity: site.is_active === false ? 0.5 : 1,
                      }}
                      className="hover:bg-[#FAFAFB] transition-colors"
                    >
                      {/* Name + emoji */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px] shrink-0"
                            style={{ backgroundColor: `${site.accent_color}18` }}
                          >
                            {site.emoji}
                          </div>
                          <span className="font-medium text-[#0A1628]">{site.name}</span>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1 text-ds-text-secondary">
                          <Globe size={11} strokeWidth={1.75} className="shrink-0" />
                          {site.slug ? `${site.slug}.fan` : "—"}
                        </span>
                      </td>

                      {/* Color picker */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {editingColor === site.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={colorDraft}
                              onChange={(e) => setColorDraft(e.target.value)}
                              className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                              type="text"
                              value={colorDraft}
                              onChange={(e) => setColorDraft(e.target.value)}
                              maxLength={7}
                              className="w-20 h-7 px-2 rounded text-[12px] font-mono focus:outline-none focus:ring-1 focus:ring-[#0C447C]"
                              style={{ border: "0.5px solid hsl(var(--color-border-strong))" }}
                            />
                            <button
                              onClick={() => saveColor(site)}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#2D7A3E] hover:bg-[#E8F4EA]"
                            >
                              <Check size={13} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setEditingColor(null)}
                              className="text-[11px] text-ds-text-tertiary hover:text-[#0A1628]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingColor(site.id);
                              setColorDraft(site.accent_color);
                            }}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <div
                              className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
                              style={{ backgroundColor: site.accent_color }}
                            />
                            <span className="text-[12px] font-mono text-ds-text-secondary">
                              {site.accent_color}
                            </span>
                          </button>
                        )}
                      </td>

                      {/* Member count */}
                      <td className="px-4 py-3 hidden md:table-cell text-right text-ds-text-secondary">
                        {site.member_count ?? 0}
                      </td>

                      {/* Active toggle */}
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => toggleActive(site)}
                          role="switch"
                          aria-checked={site.is_active !== false}
                          className="relative inline-flex w-9 h-5 rounded-full transition-colors"
                          style={{
                            backgroundColor: site.is_active !== false ? "#0C447C" : "#D4D4D4",
                          }}
                        >
                          <span
                            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                            style={{
                              transform: site.is_active !== false ? "translateX(16px)" : "translateX(0)",
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminNetwork;
