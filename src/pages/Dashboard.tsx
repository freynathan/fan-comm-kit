import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useJoinedClubs } from "@/hooks/useJoinedClubs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Users, Plus, Heart, ArrowRight } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function deriveFirstName(displayName: string | null | undefined, fallbackUsername: string) {
  const source = (displayName ?? "").trim();
  if (source.length > 0) {
    const first = source.split(/\s+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  // Fallback: strip trailing digits from username and capitalize
  const letters = fallbackUsername.replace(/[0-9_]+$/g, "");
  const match = letters.match(/^[a-z]+/i);
  const base = match ? match[0] : letters || fallbackUsername;
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/?auth=signup", { replace: true });
    }
  }, [user, loading, navigate]);

  const { data, isLoading } = useDashboardData(user?.dbUserId);
  const { data: joinedClubs = [], isLoading: joinedLoading } = useJoinedClubs(user?.dbUserId);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  const stats = data?.stats;
  const clubs = data?.clubs ?? [];
  const hasClubs = (stats?.totalClubs ?? 0) > 0;
  const firstName = getFirstName(user.username);

  return (
    <>
      <Helmet>
        <title>Dashboard — ToBe.fan</title>
      </Helmet>
      <DashboardLayout user={user}>
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: "#0C447C" }}
          >
            Your dashboard
          </p>
          <h1 className="text-[36px] md:text-[44px] font-semibold tracking-[-1px] text-[#0A1628] leading-[1.1]">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-[15px] text-ds-text-secondary mt-3 max-w-[560px]">
            Your central hub for everything you own, manage, and earn across 28 passion communities.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            label="Fan clubs"
            value={isLoading ? "—" : stats?.totalClubs ?? 0}
            helper="Active clubs you own"
            accentColor="#0C447C"
          />
          <StatCard
            label="Total members"
            value={isLoading ? "—" : stats?.totalMembers ?? 0}
            helper={`${stats?.paidMembers ?? 0} paying`}
            accentColor="#0D9488"
          />
          <StatCard
            label="Monthly revenue"
            value={isLoading ? "—" : `€${(stats?.monthlyRevenue ?? 0).toFixed(0)}`}
            helper="From all paid clubs"
            accentColor="#10B981"
          />
          <StatCard
            label="Fan trust score"
            value={isLoading ? "—" : hasClubs ? stats?.trustScore ?? 0 : "—"}
            helper={hasClubs ? "Across all your clubs" : "Create a club to start building your score"}
            accentColor="#DAA520"
          />
        </div>

        {/* Your clubs preview */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#0A1628] tracking-[-0.3px]">
            Your fan clubs
          </h2>
          <button
            onClick={() => navigate("/dashboard/clubs/new")}
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium bg-transparent transition-colors hover:bg-[#0C447C]/[0.06]"
            style={{ border: "1px solid #0C447C", color: "#0C447C" }}
          >
            <Plus size={15} strokeWidth={2} />
            New club
          </button>
        </div>

        {clubs.length === 0 ? (
          <EmptyState
            compact
            icon={Users}
            title="No fan clubs yet"
            description="Create your first fan club and start building a community."
            action={
              <button
                onClick={() => navigate("/dashboard/clubs/new")}
                className="flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium text-white transition-all active:scale-[0.98]"
                style={{ backgroundColor: "#0C447C" }}
              >
                <Plus size={15} strokeWidth={2} />
                Create club
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.slice(0, 4).map((club) => (
              <button
                key={club.id}
                onClick={() => navigate("/dashboard/clubs")}
                className="text-left rounded-2xl p-5 bg-white transition-colors hover:bg-[#FAFAFB]"
                style={{ border: "0.5px solid hsl(var(--color-border))" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#0A1628] truncate">
                      {club.name}
                    </p>
                    {club.tagline && (
                      <p className="text-[13px] text-ds-text-tertiary mt-1 truncate">
                        {club.tagline}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: club.is_free ? "#F5F5F7" : "#E8F3EC",
                      color: club.is_free ? "#6B7280" : "#226B40",
                    }}
                  >
                    {club.is_free
                      ? "Free"
                      : `€${Number(club.price_monthly ?? club.price ?? 0).toFixed(0)}/mo`}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4 text-[12px] text-ds-text-tertiary">
                  <span>{club.member_count} members</span>
                  <span>•</span>
                  <span>Trust {club.fan_trust_score}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Clubs I'm in */}
        <div className="mt-16 mb-6 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#0A1628] tracking-[-0.3px]">
            Clubs I'm in
          </h2>
          {joinedClubs.length > 0 && (
            <span className="text-[12px] text-ds-text-tertiary">
              {joinedClubs.length} {joinedClubs.length === 1 ? "membership" : "memberships"}
            </span>
          )}
        </div>

        {joinedLoading ? (
          <div className="text-[13px] text-ds-text-tertiary">Loading…</div>
        ) : joinedClubs.length === 0 ? (
          <EmptyState
            compact
            icon={Heart}
            title="No memberships yet"
            description="Join clubs that match your passions to see them here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedClubs.map((club) => {
              const accent = club.accent_color ?? "#0C447C";
              const price = Number(club.price_monthly ?? club.price ?? 0);
              return (
                <div
                  key={club.membershipId}
                  className="rounded-2xl p-5 bg-white transition-colors hover:bg-[#FAFAFB]"
                  style={{ border: "0.5px solid hsl(var(--color-border))" }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-[16px] font-semibold shrink-0"
                      style={{ backgroundColor: accent }}
                    >
                      {club.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[15px] font-semibold text-[#0A1628] truncate">
                          {club.name}
                        </p>
                        <button
                          onClick={() => club.slug && navigate(`/c/${club.slug}`)}
                          className="text-[12px] font-medium flex items-center gap-1 shrink-0 hover:underline"
                          style={{ color: accent }}
                        >
                          View club
                          <ArrowRight size={12} strokeWidth={2} />
                        </button>
                      </div>
                      {club.ownerUsername && (
                        <p className="text-[12px] text-ds-text-tertiary mt-0.5 truncate">
                          by @{club.ownerUsername}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${accent}1A`,
                            color: accent,
                          }}
                        >
                          {club.is_free ? "Free" : `€${price.toFixed(0)}/mo`}
                        </span>
                        <span className="text-[12px] text-ds-text-tertiary">
                          Joined {new Date(club.joinedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
