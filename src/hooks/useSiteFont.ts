import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Maps display name → Google Fonts `family=` value.
const FONT_MAP: Record<string, string> = {
  "Inter": "Inter:wght@400;600;700",
  "Roboto": "Roboto:wght@400;600;700",
  "Open Sans": "Open+Sans:wght@400;600;700",
  "Lato": "Lato:wght@400;700",
  "Montserrat": "Montserrat:wght@400;600;700",
  "Poppins": "Poppins:wght@400;600;700",
  "Raleway": "Raleway:wght@400;600;700",
  "Nunito": "Nunito:wght@400;600;700",
  "Source Sans Pro": "Source+Sans+Pro:wght@400;600;700",
  "PT Sans": "PT+Sans:wght@400;700",
  "Playfair Display": "Playfair+Display:wght@400;600;700",
  "Merriweather": "Merriweather:wght@400;700",
  "Lora": "Lora:wght@400;600;700",
  "Libre Baskerville": "Libre+Baskerville:wght@400;700",
  "Cormorant Garamond": "Cormorant+Garamond:wght@400;600;700",
  "EB Garamond": "EB+Garamond:wght@400;600;700",
  "DM Serif Display": "DM+Serif+Display",
  "Crimson Text": "Crimson+Text:wght@400;600;700",
  "Josefin Sans": "Josefin+Sans:wght@400;600;700",
  "Oswald": "Oswald:wght@400;600;700",
  "Bebas Neue": "Bebas+Neue",
  "Anton": "Anton",
  "Barlow": "Barlow:wght@400;600;700",
  "Mulish": "Mulish:wght@400;600;700",
  "Work Sans": "Work+Sans:wght@400;600;700",
  "DM Sans": "DM+Sans:wght@400;600;700",
  "Quicksand": "Quicksand:wght@400;600;700",
  "Karla": "Karla:wght@400;600;700",
  "Cabin": "Cabin:wght@400;600;700",
  "Figtree": "Figtree:wght@400;600;700",
};

function resolveFontName(raw: string | null | undefined): string {
  if (!raw) return "Inter";
  const match = Object.keys(FONT_MAP).find(
    (k) => k.toLowerCase() === raw.trim().toLowerCase(),
  );
  return match ?? "Inter";
}

function injectFont(displayName: string): void {
  if (typeof document === "undefined") return;
  const family = FONT_MAP[displayName];
  if (!family) return;
  const id = `gfont-${displayName.replace(/\s+/g, "-")}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
    document.head.appendChild(link);
  }
}

// Scope the site font ONLY to structural headings, nav, and card titles.
// Content blocks (.prose, .article-body, [data-content-section]) keep their
// own typography, including explicit inline block-level font selections.
function injectScopedOverride(slug: string, displayName: string): void {
  if (typeof document === "undefined") return;
  const id = `site-font-override-${slug}`;
  const sel = `[data-site-font="${slug}"]`;
  const applies = [
    `${sel} .section-title`,
    `${sel} .site-nav-link`,
    `${sel} .article-card-title`,
    `${sel} .page-section-heading`,
  ].join(",");
  const resets = [
    `${sel} .prose`,
    `${sel} .article-body`,
    `${sel} [data-content-section]`,
    `${sel} input`,
    `${sel} textarea`,
    `${sel} select`,
    `${sel} button`,
  ].join(",");
  const css =
    `${sel} { --site-font: '${displayName}', system-ui, sans-serif; }\n` +
    `${applies} { font-family: var(--site-font) !important; }\n` +
    `${resets} { font-family: 'Inter', system-ui, sans-serif; }`;
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
}


/**
 * Loads the site's font from Google Fonts and returns a CSS font-family value.
 * Apply via `style={{ fontFamily }}` on the topic site wrapper, AND set
 * `data-site-font={siteSlug}` on that wrapper so the override beats `font-serif`.
 */
export function useSiteFont(siteSlug?: string | null): string {
  const [fontName, setFontName] = useState<string>("Inter");

  useEffect(() => {
    if (!siteSlug) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("sites" as never)
        .select("font")
        .eq("slug", siteSlug)
        .maybeSingle();
      if (cancelled) return;
      const raw = (data as { font?: string | null } | null)?.font ?? null;
      const resolved = resolveFontName(raw);
      injectFont(resolved);
      injectScopedOverride(siteSlug, resolved);
      setFontName(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [siteSlug]);

  return `'${fontName}', system-ui, sans-serif`;
}
