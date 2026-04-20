import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDashboardFans } from "@/hooks/useDashboardFans";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Sparkles } from "lucide-react";

type PriceFilter = "all" | "paid" | "free";

const formatJoined = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const DashboardFans = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/?auth=signup", { replace: true });
  }, [user, loading, navigate]);

  const { data, isLoading } = useDashboardFans(user?.dbUserId);

  const [clubFilter, setClubFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");

  const fans = data?.fans ?? [];
  const clubs = data?.clubs ?? [];

  const filtered = useMemo(() => {
    return fans.filter((f) => {
      if (clubFilter !== "all" && f.clubId !== clubFilter) return false;
      if (priceFilter === "paid" && f.clubIsFree) return false;
      if (priceFilter === "free" && !f.clubIsFree) return false;
      return true;
    });
  }, [fans, clubFilter, priceFilter]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Fans — Dashboard</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="mb-10">
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.8px] text-[#0A1628] leading-[1.15]">
            Fans
          </h1>
          <p className="text-[15px] text-ds-text-secondary mt-2 max-w-[560px]">
            Every member across your clubs, with their fan trust score and join date.
          </p>
        </div>

        {isLoading ? (
          <div className="text-[14px] text-ds-text-tertiary">Loading your fans…</div>
        ) : fans.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No fans yet"
            description="Share your clubs to start attracting members. They'll show up here as soon as they join."
          />
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F5F5F7]">
                {(["all", "paid", "free"] as PriceFilter[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriceFilter(p)}
                    className={`h-8 px-3 rounded-md text-[13px] font-medium transition-colors ${
                      priceFilter === p
                        ? "bg-white text-[#0A1628]"
                        : "text-ds-text-secondary hover:text-[#0A1628]"
                    }`}
                  >
                    {p === "all" ? "All" : p === "paid" ? "Paid" : "Free"}
                  </button>
                ))}
              </div>

              <select
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
                className="h-10 px-3 rounded-lg bg-white text-[13px] font-medium text-[#0A1628] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0C447C]/20"
                style={{ border: "0.5px solid hsl(var(--color-border))" }}
              >
                <option value="all">All clubs</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <span className="text-[13px] text-ds-text-tertiary ml-auto">
                {filtered.length} {filtered.length === 1 ? "fan" : "fans"}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div
                className="rounded-2xl bg-white p-8 text-center text-[14px] text-ds-text-tertiary"
                style={{ border: "0.5px solid hsl(var(--color-border))" }}
              >
                No fans match these filters.
              </div>
            ) : (
              <div
                className="rounded-2xl bg-white overflow-hidden"
                style={{ border: "0.5px solid hsl(var(--color-border))" }}
              >
                {/* Table header — desktop */}
                <div
                  className="hidden md:grid grid-cols-[1fr_180px_140px_120px] items-center gap-4 px-5 h-11 text-[12px] font-medium uppercase tracking-wider text-ds-text-tertiary"
                  style={{ borderBottom: "0.5px solid hsl(var(--color-border))" }}
                >
                  <div>Fan</div>
                  <div>Club</div>
                  <div>Joined</div>
                  <div className="text-right">Trust score</div>
                </div>

                <div className="divide-y" style={{ borderColor: "hsl(var(--color-border))" }}>
                  {filtered.map((f) => (
                    <div
                      key={f.membershipId}
                      className="md:grid md:grid-cols-[1fr_180px_140px_120px] flex flex-col gap-3 md:gap-4 md:items-center px-5 py-4"
                      style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
                    >
                      {/* Fan */}
                      <div className="flex items-center gap-3 min-w-0">
                        {f.avatarUrl ? (
                          <img
                            src={f.avatarUrl}
                            alt={f.username}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium text-white shrink-0"
                            style={{ backgroundColor: "#0C447C" }}
                          >
                            {f.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#0A1628] truncate">
                            {f.displayName || f.username}
                          </p>
                          <p className="text-[12px] text-ds-text-tertiary truncate">@{f.username}</p>
                        </div>
                      </div>

                      {/* Club */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: f.clubAccent ?? "#0C447C" }}
                        />
                        <span className="text-[13px] text-[#0A1628] truncate">{f.clubName}</span>
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: f.clubIsFree ? "#F5F5F7" : "#E8F3EC",
                            color: f.clubIsFree ? "#6B7280" : "#226B40",
                          }}
                        >
                          {f.clubIsFree ? "Free" : "Paid"}
                        </span>
                      </div>

                      {/* Joined */}
                      <div className="text-[13px] text-ds-text-secondary">
                        <span className="md:hidden text-ds-text-tertiary mr-2">Joined</span>
                        {formatJoined(f.joinedAt)}
                      </div>

                      {/* Trust */}
                      <div className="md:text-right">
                        <span className="md:hidden text-ds-text-tertiary mr-2 text-[13px]">Trust</span>
                        <span className="text-[14px] font-semibold text-[#0A1628] tabular-nums">
                          {f.trustScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </>
  );
};

export default DashboardFans;
