import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveCurrentSite } from "@/config/sites";
import { SITE_ACCENT_FALLBACK } from "@/lib/siteAccents";

const DEFAULT = "#0C447C";

/**
 * Returns the live accent/brand color (hex) for the current site,
 * read from the Supabase `sites` table. Falls back to the hardcoded
 * map in src/lib/siteAccents.ts if the fetch fails.
 *
 * The current site is resolved via `?site=<slug>` or hostname.
 */
export function useSiteColor(slugOverride?: string): string {
  const [color, setColor] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT;
    const site = slugOverride
      ? { slug: slugOverride, domain: `${slugOverride}.fan` }
      : resolveCurrentSite();
    return SITE_ACCENT_FALLBACK[site.domain] ?? DEFAULT;
  });

  useEffect(() => {
    let cancelled = false;
    const slug = slugOverride ?? resolveCurrentSite().slug;
    (async () => {
      const { data, error } = await supabase
        .from("sites" as never)
        .select("color,accent_color,domain")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      const row = (data ?? null) as
        | { color: string | null; accent_color: string | null; domain: string | null }
        | null;
      const live = row?.color || row?.accent_color;
      if (!error && live) {
        setColor(live);
      } else if (row?.domain && SITE_ACCENT_FALLBACK[row.domain]) {
        setColor(SITE_ACCENT_FALLBACK[row.domain]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slugOverride]);

  return color;
}
