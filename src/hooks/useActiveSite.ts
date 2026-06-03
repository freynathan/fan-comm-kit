import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SiteHeaderLink } from "@/hooks/useNetwork";

const SLUG_KEY = "activeSiteSlug";
const DATA_KEY = "activeSiteData";

// ─── Persisted shape ──────────────────────────────────────────────────────────

interface StoredSiteData {
  slug: string;
  name: string;
  color: string | null;
  accent_color: string | null;
  emoji: string | null;
  logo_url: string | null;
  icon_url: string | null;
  headerLinks: SiteHeaderLink[];
}

// ─── Read/write helpers ───────────────────────────────────────────────────────

function readSlug(): string | null {
  try { return localStorage.getItem(SLUG_KEY); } catch { return null; }
}

function readData(): StoredSiteData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? (JSON.parse(raw) as StoredSiteData) : null;
  } catch { return null; }
}

/** Call from SiteHomepage (Index.tsx) when the user enters a site context. */
export function persistActiveSite(data: StoredSiteData) {
  try {
    localStorage.setItem(SLUG_KEY, data.slug);
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch { /* storage blocked */ }
}

/** Call when the user explicitly navigates away from a site context. */
export function clearActiveSite() {
  try {
    localStorage.removeItem(SLUG_KEY);
    localStorage.removeItem(DATA_KEY);
  } catch { /* storage blocked */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ActiveSiteHeaderProps {
  siteName: string;
  siteEmoji: string;
  accentColor: string;
  aiFeatureLabel: string;
  customNavLinks: SiteHeaderLink[] | undefined;
  logoUrl: string | null | undefined;
}

const DEFAULT_HEADER: ActiveSiteHeaderProps = {
  siteName: "tobe",
  siteEmoji: "⭐",
  accentColor: "hsl(var(--color-accent))",
  aiFeatureLabel: "AI Relate",
  customNavLinks: undefined,
  logoUrl: undefined,
};

function toHeaderProps(d: StoredSiteData): ActiveSiteHeaderProps {
  return {
    siteName: d.slug,
    siteEmoji: d.emoji ?? "",
    accentColor: d.color ?? d.accent_color ?? "hsl(var(--color-accent))",
    aiFeatureLabel: `AI ${d.name}`,
    customNavLinks: d.headerLinks.length ? d.headerLinks : undefined,
    logoUrl: d.logo_url ?? d.icon_url ?? null,
  };
}

/**
 * Returns SharedHeader-compatible props for the active site context.
 * Reads synchronously from localStorage for instant (no-flash) render,
 * then silently refreshes from the DB in the background.
 */
export function useActiveSiteHeader(): ActiveSiteHeaderProps {
  const [headerProps, setHeaderProps] = useState<ActiveSiteHeaderProps>(() => {
    const cached = readData();
    return cached ? toHeaderProps(cached) : DEFAULT_HEADER;
  });

  useEffect(() => {
    const slug = readSlug();
    if (!slug) return;
    // Background refresh — keeps header data current if site config changed
    supabase
      .from("sites" as never)
      .select("slug, name, color, accent_color, emoji, logo_url, icon_url, layout")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const s = data as unknown as {
          slug: string; name: string; color: string | null;
          accent_color: string | null; emoji: string | null;
          logo_url: string | null; icon_url: string | null;
          layout: { header?: { links: SiteHeaderLink[] } } | null;
        };
        const fresh: StoredSiteData = {
          slug: s.slug, name: s.name, color: s.color, accent_color: s.accent_color,
          emoji: s.emoji, logo_url: s.logo_url, icon_url: s.icon_url,
          headerLinks: s.layout?.header?.links ?? [],
        };
        persistActiveSite(fresh);
        setHeaderProps(toHeaderProps(fresh));
      });
  }, []);

  return headerProps;
}
