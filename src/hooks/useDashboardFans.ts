import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FanRow {
  membershipId: string;
  userId: string;
  username: string;
  displayName: string | null;
  initials: string;
  avatarUrl: string | null;
  joinedAt: string;
  status: string;
  clubId: string;
  clubName: string;
  clubAccent: string | null;
  clubIsFree: boolean;
  trustScore: number;
}

export interface FanClubOption {
  id: string;
  name: string;
  is_free: boolean;
  accent_color: string | null;
}

export function useDashboardFans(dbUserId: string | null | undefined) {
  return useQuery({
    queryKey: ["dashboard-fans", dbUserId],
    enabled: !!dbUserId,
    queryFn: async () => {
      if (!dbUserId) throw new Error("No user");

      const { data: clubs, error: clubsErr } = await supabase
        .from("fan_clubs")
        .select("id, name, is_free, accent_color")
        .eq("owner_id", dbUserId)
        .order("name");
      if (clubsErr) throw clubsErr;

      const clubList = (clubs ?? []) as FanClubOption[];
      const clubIds = clubList.map((c) => c.id);
      if (clubIds.length === 0) return { fans: [] as FanRow[], clubs: clubList };

      const clubMap = new Map(clubList.map((c) => [c.id, c]));

      const { data: memberships, error: mErr } = await supabase
        .from("fan_club_memberships")
        .select("id, club_id, user_id, joined_at, status")
        .in("club_id", clubIds)
        .order("joined_at", { ascending: false });
      if (mErr) throw mErr;

      const rows = memberships ?? [];
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      if (userIds.length === 0) return { fans: [] as FanRow[], clubs: clubList };

      const [{ data: usersData }, { data: events }] = await Promise.all([
        supabase
          .from("users")
          .select("id, username, display_name, initials, avatar_url")
          .in("id", userIds),
        supabase
          .from("fan_trust_events")
          .select("club_id, user_id, points_awarded")
          .in("club_id", clubIds)
          .in("user_id", userIds),
      ]);

      const userMap = new Map((usersData ?? []).map((u) => [u.id, u]));
      const trustMap = new Map<string, number>();
      (events ?? []).forEach((e) => {
        const key = `${e.club_id}:${e.user_id}`;
        trustMap.set(key, (trustMap.get(key) ?? 0) + (e.points_awarded ?? 0));
      });

      const fans: FanRow[] = rows.map((r) => {
        const u = userMap.get(r.user_id);
        const club = clubMap.get(r.club_id);
        return {
          membershipId: r.id,
          userId: r.user_id,
          username: u?.username ?? "unknown",
          displayName: u?.display_name ?? null,
          initials: u?.initials ?? (u?.username ?? "?").slice(0, 2).toUpperCase(),
          avatarUrl: u?.avatar_url ?? null,
          joinedAt: r.joined_at,
          status: r.status,
          clubId: r.club_id,
          clubName: club?.name ?? "Unknown club",
          clubAccent: club?.accent_color ?? null,
          clubIsFree: club?.is_free ?? true,
          trustScore: trustMap.get(`${r.club_id}:${r.user_id}`) ?? 0,
        };
      });

      return { fans, clubs: clubList };
    },
  });
}
