// Frontend fallback for site accent colors, keyed by domain.
// Source of truth is sites.accent_color in Supabase — see scripts/update-site-accents.sql.
// This map ensures colors render immediately even if the DB hasn't been updated yet.

export const SITE_ACCENT_FALLBACK: Record<string, string> = {
  "barbecue.fan": "#FF4500",
  "beauty.fan": "#FF69B4",
  "bike.fan": "#00A86B",
  "boat.fan": "#0077BE",
  "burger.fan": "#FF6B35",
  "capital.fan": "#2E8B57",
  "car.fan": "#CC0000",
  "cocktail.fan": "#9B59B6",
  "coffee.fan": "#6F4E37",
  "collector.fan": "#FFD700",
  "dance.fan": "#FF1493",
  "diy.fan": "#FF8C00",
  "fashion.fan": "#1A1A2E",
  "gourmet.fan": "#8B0000",
  "gym.fan": "#FF6B00",
  "healthy.fan": "#00C853",
  "lifestyle.fan": "#7B68EE",
  "luxury.fan": "#C5A028",
  "martialarts.fan": "#8B0000",
  "robotic.fan": "#00BCD4",
  "running.fan": "#FF4081",
  "tobe.fan": "#6C63FF",
  "trek.fan": "#795548",
  "vegetarian.fan": "#4CAF50",
  "wildlife.fan": "#FF8F00",
  "wine.fan": "#722F37",
  "yoga.fan": "#FF7043",
  "sneaker.fan": "#212121",
  "adventure.fan": "#FF5722",
};

export function getSiteAccent(
  site: { domain?: string | null; accent_color?: string | null },
  fallback = "#6C63FF",
): string {
  if (site.accent_color) return site.accent_color;
  if (site.domain && SITE_ACCENT_FALLBACK[site.domain]) {
    return SITE_ACCENT_FALLBACK[site.domain];
  }
  return fallback;
}
