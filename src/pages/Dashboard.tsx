import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Users, Sparkles, Wallet, TrendingUp, Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/?auth=signup", { replace: true });
    }
  }, [user, loading, navigate]);

  const { data, isLoading } = useDashboardData(user?.dbUserId);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  const stats = data?.stats;
  const clubs = data?.clubs ?? [];

  return (
    <>
      <Helmet>
        <title>Dashboard — ToBe.fan</title>
      </Helmet>
      <DashboardLayout user={user}>
        {/* Header */}
        <div className="mb-10">
          <p className="text-[13px] font-medium uppercase tracking-wider text-ds-text-tertiary mb-2">
            Welcome back
          </p>
          <h1 className="text-[36px] md:text-[44px] font-semibold tracking-[-1px] text-[#0A1628] leading-[1.1]">
            Hi, @{user.username}
          </h1>
          <p className="text-[15px] text-ds-text-secondary mt-3 max-w-[520px]">
            Your central hub for everything you create, manage, and earn across ToBe.fan.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            label="Fan clubs"
            value={isLoading ? "—" : stats?.totalClubs ?? 0}
            helper="Active clubs you own"
            icon={Users}
          />
          <StatCard
            label="Total members"
            value={isLoading ? "—" : stats?.totalMembers ?? 0}
            helper={`${stats?.paidMembers ?? 0} paying`}
            icon={Sparkles}
          />
          <StatCard
            label="Monthly revenue"
            value={isLoading ? "—" : `€${(stats?.monthlyRevenue ?? 0).toFixed(0)}`}
            helper="From all paid clubs"
            icon={Wallet}
          />
          <StatCard
            label="Fan trust score"
            value={isLoading ? "—" : stats?.trustScore ?? 0}
            helper="Across all your clubs"
            icon={TrendingUp}
          />
        </div>

        {/* Your clubs preview */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#0A1628] tracking-[-0.3px]">
            Your fan clubs
          </h2>
          <button
            onClick={() => navigate("/dashboard/clubs/new")}
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: "#0C447C" }}
          >
            <Plus size={15} strokeWidth={2} />
            New club
          </button>
        </div>

        {clubs.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No fan clubs yet"
            description="Create your first fan club and start building a community of fans who pay to be closer to you."
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
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
