import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileData {
  user: {
    id: string;
    auth_id: string | null;
    username: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    initials: string;
  };
  profile: {
    bio: string | null;
    headline: string | null;
    location: string | null;
    hire_available: boolean;
    verified: boolean;
  } | null;
  socialLinks: {
    id: string;
    platform: string;
    handle: string | null;
    url: string | null;
    follower_count: number;
    display_order: number;
  }[];
  fanClubs: {
    id: string;
    name: string;
    description: string | null;
    member_count: number;
    is_free: boolean;
    price: number | null;
    accent_color: string | null;
    site_name: string | null;
  }[];
  brandCollabs: {
    id: string;
    brand_name: string;
    brand_logo_url: string | null;
    role: string | null;
    year: number | null;
    reach: number | null;
    engagement_rate: number | null;
    post_count: number | null;
    site_id: string | null;
    site_name: string | null;
  }[];
  passionPoints: {
    id: string;
    points: number;
    level: string;
    site_name: string;
    site_emoji: string;
  }[];
  fanCount: number;
}

export function useProfileData(username: string | undefined) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);

      try {
        // 1. Get user by username
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (userError || !userData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const userId = userData.id;

        // 2. Fetch all related data in parallel
        const [profileRes, socialRes, clubsRes, collabsRes, passionRes, fanCountRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("social_links").select("*").eq("user_id", userId).order("display_order"),
          supabase
            .from("fan_clubs")
            .select("*, sites(name)")
            .eq("owner_id", userId),
          supabase
            .from("brand_collabs")
            .select("*, sites(name)")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          supabase
            .from("passion_points")
            .select("*, sites(name, emoji)")
            .eq("user_id", userId)
            .order("points", { ascending: false }),
          supabase
            .from("relationships")
            .select("id", { count: "exact" })
            .eq("to_user_id", userId)
            .eq("relationship_type", "fan"),
        ]);

        setData({
          user: {
            id: userData.id,
            auth_id: userData.auth_id,
            username: userData.username,
            email: userData.email,
            display_name: userData.display_name,
            avatar_url: userData.avatar_url,
            initials: userData.initials,
          },
          profile: profileRes.data
            ? {
                bio: profileRes.data.bio,
                headline: profileRes.data.headline,
                location: profileRes.data.location,
                hire_available: profileRes.data.hire_available,
                verified: profileRes.data.verified,
              }
            : null,
          socialLinks: (socialRes.data ?? []).map((s) => ({
            id: s.id,
            platform: s.platform,
            handle: s.handle,
            url: s.url,
            follower_count: s.follower_count,
            display_order: s.display_order,
          })),
          fanClubs: (clubsRes.data ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            member_count: c.member_count,
            is_free: c.is_free,
            price: c.price,
            accent_color: c.accent_color,
            site_name: c.sites?.name ?? null,
          })),
          brandCollabs: (collabsRes.data ?? []).map((b: any) => ({
            id: b.id,
            brand_name: b.brand_name,
            brand_logo_url: b.brand_logo_url,
            role: b.role,
            year: b.year,
            reach: b.reach,
            engagement_rate: b.engagement_rate,
            post_count: b.post_count,
            site_id: b.site_id,
            site_name: b.sites?.name ?? null,
          })),
          passionPoints: (passionRes.data ?? []).map((p: any) => ({
            id: p.id,
            points: p.points,
            level: p.level,
            site_name: p.sites?.name ?? "Unknown",
            site_emoji: p.sites?.emoji ?? "⭐",
          })),
          fanCount: fanCountRes.count ?? 0,
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username]);

  return { data, loading, notFound };
}
