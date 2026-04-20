import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicClub {
  id: string;
  name: string;
  slug: string | null;
  tagline: string | null;
  description: string | null;
  benefits: string[] | null;
  visibility: string;
  is_free: boolean;
  price_monthly: number | null;
  price: number | null;
  member_count: number;
  fan_trust_score: number;
  accent_color: string | null;
  cover_image_url: string | null;
  welcome_message: string | null;
  owner_id: string;
  ownerUsername: string | null;
  ownerDisplayName: string | null;
  ownerInitials: string | null;
  ownerAvatarUrl: string | null;
}

export function usePublicClub(slug: string | undefined) {
  return useQuery({
    queryKey: ["public-club", slug],
    enabled: !!slug,
    queryFn: async (): Promise<PublicClub | null> => {
      if (!slug) return null;
      const { data: club, error } = await supabase
        .from("fan_clubs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!club) return null;

      const { data: owner } = await supabase
        .from("users")
        .select("username, display_name, initials, avatar_url")
        .eq("id", club.owner_id)
        .maybeSingle();

      return {
        ...club,
        ownerUsername: owner?.username ?? null,
        ownerDisplayName: owner?.display_name ?? null,
        ownerInitials: owner?.initials ?? null,
        ownerAvatarUrl: owner?.avatar_url ?? null,
      } as PublicClub;
    },
  });
}

export function useMembershipStatus(
  clubId: string | undefined,
  dbUserId: string | null | undefined,
) {
  return useQuery({
    queryKey: ["membership-status", clubId, dbUserId],
    enabled: !!clubId && !!dbUserId,
    queryFn: async () => {
      if (!clubId || !dbUserId) return null;
      const { data } = await supabase
        .from("fan_club_memberships")
        .select("id, status")
        .eq("club_id", clubId)
        .eq("user_id", dbUserId)
        .maybeSingle();
      return data;
    },
  });
}
