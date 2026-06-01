import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth as useAuth } from "@/hooks/useSupabaseAuth";

const SUPER_ADMIN_EMAIL = "nathan@hasht.ag";

export function useIsSuperAdmin() {
  const { user, loading } = useAuth();
  return {
    isSuperAdmin: !!user && user.email?.toLowerCase() === SUPER_ADMIN_EMAIL,
    loading,
    user,
  };
}

// Live network site row used by the Network tab and AllSitesDropdown.
export type SiteSection = {
  id: string;
  enabled: boolean;
  order: number;
  label?: string;
  data?: { blocks?: string; [k: string]: unknown };
  config?: Record<string, unknown>;
};

export type SiteHeaderLink = {
  label: string;
  url: string;
  dropdown?: { label: string; url: string }[];
};
export type SiteHeader = {
  links: SiteHeaderLink[];
};
export type SiteLayout = {
  sections?: SiteSection[];
  header?: SiteHeader;
  loggedOut?: { sections: SiteSection[] };
  loggedIn?: { sections: SiteSection[] };
};


export type NetworkSite = {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  emoji: string | null;
  accent_color: string | null;
  status: "active" | "coming_soon" | "inactive" | null;
  color: string | null;
  category: "passion" | "venue" | "business" | null;
  priority: number | null;
  font?: string | null;
  description?: string | null;
  llms_txt?: string | null;
  layout?: SiteLayout | null;
  custom_ai_brief?: string | null;
  logo_url?: string | null;
};

export function useNetworkSites() {
  const [sites, setSites] = useState<NetworkSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sites" as never)
      .select("id,slug,name,domain,emoji,accent_color,status,color,category,priority,font,description,llms_txt,layout,custom_ai_brief,logo_url")

      .order("name", { ascending: true });
    if (error) setError(error.message);
    setSites(((data ?? []) as unknown) as NetworkSite[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { sites, loading, error, refresh, setSites };
}
