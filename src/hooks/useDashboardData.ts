import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardClub {
  id: string;
  name: string;
  slug: string | null;
  tagline: string | null;
  description: string | null;
  visibility: string;
  is_free: boolean;
  price_monthly: number | null;
  price: number | null;
  member_count: number;
  fan_trust_score: number;
  post_count: number;
  accent_color: string | null;
  cover_image_url: string | null;
  site_id: string | null;
  site_slug: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalClubs: number;
  totalMembers: number;
  paidMembers: number;
  trustScore: number;
  monthlyRevenue: number;
}

export function useDashboardData(dbUserId: string | null | undefined) {
  return useQuery({
    queryKey: ["dashboard-data", dbUserId],
    enabled: !!dbUserId,
    queryFn: async () => {
      if (!dbUserId) throw new Error("No user");

      const { data: clubs, error: clubsErr } = await supabase
        .from("fan_clubs")
        .select("*")
        .eq("owner_id", dbUserId)
        .order("created_at", { ascending: false });

      if (clubsErr) throw clubsErr;

      const clubList = (clubs ?? []) as DashboardClub[];
      const clubIds = clubList.map((c) => c.id);

      let memberships: { club_id: string; status: string }[] = [];
      if (clubIds.length > 0) {
        const { data: m } = await supabase
          .from("fan_club_memberships")
          .select("club_id, status")
          .in("club_id", clubIds);
        memberships = m ?? [];
      }

      const totalMembers = memberships.filter((m) => m.status === "active").length;
      const trustScore = clubList.reduce((sum, c) => sum + (c.fan_trust_score ?? 0), 0);

      // Paid members = active members in non-free clubs
      const paidClubIds = new Set(clubList.filter((c) => !c.is_free).map((c) => c.id));
      const paidMembers = memberships.filter(
        (m) => m.status === "active" && paidClubIds.has(m.club_id),
      ).length;

      const monthlyRevenue = clubList.reduce((sum, c) => {
        if (c.is_free) return sum;
        const price = Number(c.price_monthly ?? c.price ?? 0);
        const clubPaidActive = memberships.filter(
          (m) => m.status === "active" && m.club_id === c.id,
        ).length;
        return sum + price * clubPaidActive;
      }, 0);

      const stats: DashboardStats = {
        totalClubs: clubList.length,
        totalMembers,
        paidMembers,
        trustScore,
        monthlyRevenue,
      };

      return { clubs: clubList, stats };
    },
  });
}

export interface SiteOption {
  id: string;
  name: string;
  emoji: string;
  slug: string | null;
  accent_color: string;
}

export function useSites() {
  return useQuery({
    queryKey: ["dashboard-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("id, name, emoji, slug, accent_color")
        .order("name");
      if (error) throw error;
      return (data ?? []) as SiteOption[];
    },
  });
}
