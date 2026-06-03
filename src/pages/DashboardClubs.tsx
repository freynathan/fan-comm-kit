import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Users, Plus, ChevronRight, Globe, Lock, EyeOff } from "lucide-react";

const visibilityIcon = (v: string) => {
  if (v === "private") return Lock;
  if (v === "unlisted") return EyeOff;
  return Globe;
};

const DashboardClubs = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/?auth=signup", { replace: true });
  }, [user, loading, navigate]);

  const { data, isLoading } = useDashboardData(user?.dbUserId);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  const clubs = data?.clubs ?? [];

  return (
    <>
      <Helmet>
        <title>Fan clubs — Dashboard</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="flex items-start justify-between gap-6 mb-10 flex-wrap">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.8px] text-[#0A1628] leading-[1.15]">
              Fan clubs
            </h1>
            <p className="text-[15px] text-ds-text-secondary mt-2 max-w-[520px]">
              Manage every club you own. Each club is its own private space for your most
              passionate fans.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/clubs/new")}
            className="flex items-center gap-2 h-10 px-5 rounded-lg text-[14px] font-medium text-white transition-all active:scale-[0.98] shrink-0"
            style={{ backgroundColor: "#0C447C" }}
          >
            <Plus size={16} strokeWidth={2} />
            New club
          </button>
        </div>

        {isLoading ? (
          <div className="text-[14px] text-ds-text-tertiary">Loading your clubs…</div>
        ) : clubs.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No fan clubs yet"
            description="Create your first fan club to start earning recurring income from your fans."
            action={
              <button
                onClick={() => navigate("/dashboard/clubs/new")}
                className="flex items-center gap-2 h-10 px-5 rounded-lg text-[14px] font-medium text-white transition-all active:scale-[0.98]"
                style={{ backgroundColor: "#0C447C" }}
              >
                <Plus size={16} strokeWidth={2} />
                Create your first club
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {clubs.map((club) => {
              const VIcon = visibilityIcon(club.visibility);
              return (
                <button
                  key={club.id}
                  onClick={() => navigate(`/admin/fan-clubs/${club.id}`)}
                  className="w-full text-left flex items-center gap-4 p-5 rounded-2xl bg-white transition-colors hover:bg-[#FAFAFB]"
                  style={{ border: "0.5px solid hsl(var(--color-border))" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white text-[18px] font-semibold"
                    style={{ backgroundColor: club.accent_color ?? "#0C447C" }}
                  >
                    {club.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-[#0A1628] truncate">
                        {club.name}
                      </p>
                      <VIcon size={13} strokeWidth={1.75} className="text-ds-text-tertiary shrink-0" />
                    </div>
                    {club.tagline && (
                      <p className="text-[13px] text-ds-text-tertiary mt-0.5 truncate">
                        {club.tagline}
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 min-w-[120px]">
                    <span className="text-[13px] font-medium text-[#0A1628]">
                      {club.member_count} members
                    </span>
                    <span className="text-[12px] text-ds-text-tertiary">
                      Trust {club.fan_trust_score}
                    </span>
                  </div>
                  <span
                    className="text-[12px] font-medium px-2.5 py-1 rounded-full shrink-0 hidden sm:inline-block"
                    style={{
                      backgroundColor: club.is_free ? "#F5F5F7" : "#E8F3EC",
                      color: club.is_free ? "#6B7280" : "#226B40",
                    }}
                  >
                    {club.is_free
                      ? "Free"
                      : `€${Number(club.price_monthly ?? club.price ?? 0).toFixed(0)}/mo`}
                  </span>
                  <ChevronRight size={18} className="text-ds-text-tertiary shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default DashboardClubs;
