import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SiteHeaderLink, SiteLayout } from "@/hooks/useNetwork";

/**
 * Fetch the per-site header config from `sites.layout.header` for a topic site.
 * Returns null while loading or if no custom header is set.
 */
export function useSiteHeader(siteSlug: string | undefined): SiteHeaderLink[] | null {
  const [links, setLinks] = useState<SiteHeaderLink[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!siteSlug) {
      setLinks(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("sites" as never)
        .select("layout")
        .eq("slug", siteSlug)
        .maybeSingle();
      if (cancelled) return;
      const layout = (data as { layout?: SiteLayout | null } | null)?.layout;
      const dbLinks = layout?.header?.links ?? null;
      setLinks(
        Array.isArray(dbLinks) && dbLinks.length > 0
          ? dbLinks.filter((l) => (l.label ?? "").trim().length > 0)
          : null,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [siteSlug]);

  return links;
}
