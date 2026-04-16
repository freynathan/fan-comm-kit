import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHomepageStats() {
  return useQuery({
    queryKey: ["homepage-stats"],
    queryFn: async () => {
      const [usersRes, clubsRes] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("fan_clubs").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalFans: usersRes.count ?? 0,
        totalClubs: clubsRes.count ?? 0,
        totalCommunities: 23,
        postsToday: 0,
      };
    },
    staleTime: 60_000,
  });
}

export function useFeaturedProfiles() {
  return useQuery({
    queryKey: ["featured-profiles"],
    queryFn: async () => {
      // Get top 3 users by total passion points
      const { data: topUsers } = await supabase
        .from("passion_points")
        .select("user_id, points")
        .order("points", { ascending: false })
        .limit(20);

      if (!topUsers?.length) return [];

      // Aggregate by user
      const userTotals = new Map<string, number>();
      topUsers.forEach((pp) => {
        userTotals.set(pp.user_id, (userTotals.get(pp.user_id) || 0) + pp.points);
      });
      const sorted = [...userTotals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const userIds = sorted.map((s) => s[0]);
      if (!userIds.length) return [];

      const { data: users } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url, initials")
        .in("id", userIds);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, headline, verified")
        .in("user_id", userIds);

      const { data: passionPoints } = await supabase
        .from("passion_points")
        .select("user_id, site_id, points")
        .in("user_id", userIds);

      const { data: sites } = await supabase.from("sites").select("id, name, emoji");

      const { data: relationships } = await supabase
        .from("relationships")
        .select("to_user_id")
        .in("to_user_id", userIds);

      const { data: clubs } = await supabase
        .from("fan_clubs")
        .select("owner_id")
        .in("owner_id", userIds);

      const siteMap = new Map(sites?.map((s) => [s.id, s]) || []);

      return sorted.map(([userId, totalPoints]) => {
        const user = users?.find((u) => u.id === userId);
        const profile = profiles?.find((p) => p.user_id === userId);
        const userPassions = passionPoints?.filter((pp) => pp.user_id === userId) || [];
        const fanCount = relationships?.filter((r) => r.to_user_id === userId).length || 0;
        const clubCount = clubs?.filter((c) => c.owner_id === userId).length || 0;

        const tags = userPassions
          .sort((a, b) => b.points - a.points)
          .slice(0, 3)
          .map((pp) => {
            const site = siteMap.get(pp.site_id);
            return site ? `${site.emoji} ${site.name}` : "";
          })
          .filter(Boolean);

        return {
          id: userId,
          username: user?.username || "user",
          displayName: user?.display_name || user?.username || "User",
          avatarUrl: user?.avatar_url,
          initials: user?.initials || "??",
          headline: profile?.headline || "",
          verified: profile?.verified || false,
          tags,
          fanCount,
          clubCount,
          totalPoints,
        };
      });
    },
    staleTime: 60_000,
  });
}
