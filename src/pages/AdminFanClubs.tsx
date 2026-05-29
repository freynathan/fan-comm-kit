import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Pencil, Users, Globe, Tag } from "lucide-react";

const AdminFanClubs = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();

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

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["admin-fan-clubs"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fan_clubs")
        .select(
          "id, name, slug, type, site_id, site_slug, member_count, fan_trust_score, is_free, price_monthly, visibility, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || adminLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Fan Clubs — Admin</title>
      </Helmet>
      <AdminLayout user={user}>
        <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0C447C] mb-1.5">
              Admin
            </p>
            <h1 className="text-[32px] font-semibold tracking-[-0.6px] text-[#0A1628] leading-[1.15]">
              Fan Clubs
            </h1>
            <p className="text-[14px] text-ds-text-secondary mt-1.5">
              {isLoading ? "…" : `${clubs.length} club${clubs.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/fan-clubs/new")}
            className="flex items-center gap-2 h-10 px-5 rounded-lg text-[14px] font-medium text-white transition-all active:scale-[0.98] shrink-0"
            style={{ backgroundColor: "#0C447C" }}
          >
            <Plus size={16} strokeWidth={2} />
            New Fan Club
          </button>
        </div>

        {isLoading ? (
          <div className="text-[14px] text-ds-text-tertiary">Loading clubs…</div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-24">
            <Users size={36} strokeWidth={1.5} className="mx-auto mb-4 text-ds-text-tertiary opacity-40" />
            <p className="text-[15px] font-semibold text-[#0A1628]">No fan clubs yet</p>
            <p className="text-[13px] text-ds-text-tertiary mt-1 mb-6">
              Create the first one to get started.
            </p>
            <button
              onClick={() => navigate("/admin/fan-clubs/new")}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-[14px] font-medium text-white"
              style={{ backgroundColor: "#0C447C" }}
            >
              <Plus size={15} strokeWidth={2} />
              New Fan Club
            </button>
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
                  <th className="text-left px-5 py-3 font-medium text-ds-text-secondary">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden md:table-cell">
                    Site
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-ds-text-secondary hidden md:table-cell">
                    Members
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-ds-text-secondary hidden lg:table-cell">
                    Trust
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-ds-text-secondary hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-ds-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club, i) => (
                  <tr
                    key={club.id}
                    style={{
                      borderTop: i === 0 ? undefined : "0.5px solid hsl(var(--color-border))",
                    }}
                    className="hover:bg-[#FAFAFB] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-semibold shrink-0"
                          style={{ backgroundColor: "#0C447C" }}
                        >
                          {club.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#0A1628] truncate">{club.name}</p>
                          {club.slug && (
                            <p className="text-[11px] text-ds-text-tertiary">/c/{club.slug}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: club.type === "brand" ? "#FEF3C7" : "#EEF2FF",
                          color: club.type === "brand" ? "#92400E" : "#3730A3",
                        }}
                      >
                        {club.type === "brand" ? (
                          <Globe size={10} strokeWidth={2} />
                        ) : (
                          <Tag size={10} strokeWidth={2} />
                        )}
                        {club.type === "brand" ? "Brand" : "Passion"}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-ds-text-secondary">
                      {club.site_slug ? `${club.site_slug}.fan` : "—"}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-right font-medium text-[#0A1628]">
                      {club.member_count}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-right text-ds-text-secondary">
                      {club.fan_trust_score}
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: club.is_free ? "#F5F5F7" : "#E8F3EC",
                          color: club.is_free ? "#6B7280" : "#226B40",
                        }}
                      >
                        {club.is_free
                          ? "Free"
                          : `€${Number(club.price_monthly ?? 0).toFixed(0)}/mo`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/fan-clubs/${club.id}`)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0C447C] hover:opacity-70 transition-opacity"
                      >
                        <Pencil size={13} strokeWidth={2} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminFanClubs;
