import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JoinedClub {
  membershipId: string;
  joinedAt: string;
  status: string;
  clubId: string;
  name: string;
  slug: string | null;
  tagline: string | null;
  is_free: boolean;
  price_monthly: number | null;
  price: number | null;
  accent_color: string | null;
  member_count: number;
  ownerUsername: string | null;
}

export function useJoinedClubs(dbUserId: string | null | undefined) {
  return useQuery({
    queryKey: ["joined-clubs", dbUserId],
    enabled: !!dbUserId,
    queryFn: async (): Promise<JoinedClub[]> => {
      if (!dbUserId) return [];

      const { data: memberships, error } = await supabase
        .from("fan_club_memberships")
        .select("id, joined_at, status, club_id")
        .eq("user_id", dbUserId)
        .eq("status", "active")
        .order("joined_at", { ascending: false });

      if (error) throw error;
      const rows = memberships ?? [];
      if (rows.length === 0) return [];

      const clubIds = rows.map((m) => m.club_id);
      const { data: clubs } = await supabase
        .from("fan_clubs")
        .select(
          "id, name, slug, tagline, is_free, price_monthly, price, accent_color, member_count, owner_id",
        )
        .in("id", clubIds);

      const ownerIds = Array.from(new Set((clubs ?? []).map((c) => c.owner_id)));
      const { data: owners } = await supabase
        .from("users")
        .select("id, username")
        .in("id", ownerIds.length ? ownerIds : ["00000000-0000-0000-0000-000000000000"]);

      const ownerMap = new Map((owners ?? []).map((o) => [o.id, o.username]));
      const clubMap = new Map((clubs ?? []).map((c) => [c.id, c]));

      return rows
        .map((m) => {
          const c = clubMap.get(m.club_id);
          if (!c) return null;
          return {
            membershipId: m.id,
            joinedAt: m.joined_at,
            status: m.status,
            clubId: c.id,
            name: c.name,
            slug: c.slug,
            tagline: c.tagline,
            is_free: c.is_free,
            price_monthly: c.price_monthly,
            price: c.price,
            accent_color: c.accent_color,
            member_count: c.member_count,
            ownerUsername: ownerMap.get(c.owner_id) ?? null,
          } as JoinedClub;
        })
        .filter((x): x is JoinedClub => x !== null);
    },
  });
}
