import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveCurrentSite } from "@/config/sites";

/**
 * Returns the live logo_url (string) for the current site, or null if not set.
 * Read from the Supabase `sites` table.
 */
export function useSiteLogo(slugOverride?: string): string | null {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const slug =
      slugOverride ?? (typeof window === "undefined" ? null : resolveCurrentSite().slug);
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("sites" as never)
        .select("logo_url")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      const row = (data ?? null) as { logo_url: string | null } | null;
      setLogo(row?.logo_url ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [slugOverride]);

  return logo;
}
