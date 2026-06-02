// Multi-site network config.
// tobe.fan is the hub. Every other entry is a topic site that shares this
// codebase. The active slug is detected from window.location.hostname, with
// a `?site=<slug>` query-param override for development/preview where the
// hostname is always lovable.app.

export type NavLink = { label: string; href: string; children?: { label: string; href: string }[] };

export interface SiteConfig {
  /** URL slug — also used as the news_synopses → sites.slug filter value. */
  slug: string;
  /** Display name shown in the header. */
  label: string;
  /** Production hostname (no protocol). */
  domain: string;
  /** 3 topic-specific nav links shown in the middle of the header. */
  navLinks: NavLink[];
}

export const HUB_SLUG = "tobe";
export const HUB_DOMAIN = "tobe.fan";

// Placeholder nav links for every topic site. Fill these in per site as we
// build out each one.
const placeholderNav = (topic: string): NavLink[] => [
  { label: `${topic} 1`, href: "#" },
  { label: `${topic} 2`, href: "#" },
  { label: `${topic} 3`, href: "#" },
];

export const SITES: Record<string, SiteConfig> = {
  tobe: { slug: "tobe", label: "ToBe.fan", domain: "tobe.fan", navLinks: [] },

  car: {
    slug: "car",
    label: "car.fan",
    domain: "car.fan",
    navLinks: [
      { label: "Car Types", href: "/car-types" },
      { label: "Race Cars", href: "/race-cars" },
      { label: "Find a Mechanic", href: "/mechanics" },
    ],
  },
  wine: {
    slug: "wine",
    label: "wine.fan",
    domain: "wine.fan",
    navLinks: [
      { label: "Recipes", href: "/recipes" },
      { label: "Wineries", href: "/wineries" },
      { label: "Tastings", href: "/tastings" },
    ],
  },

  // ---- Remaining topic sites: placeholder nav, fill in as each launches ----
  barbecue: { slug: "barbecue", label: "barbecue.fan", domain: "barbecue.fan", navLinks: placeholderNav("BBQ") },
  beauty: { slug: "beauty", label: "beauty.fan", domain: "beauty.fan", navLinks: placeholderNav("Beauty") },
  bike: { slug: "bike", label: "bike.fan", domain: "bike.fan", navLinks: placeholderNav("Bike") },
  boat: { slug: "boat", label: "boat.fan", domain: "boat.fan", navLinks: placeholderNav("Boat") },
  burger: { slug: "burger", label: "burger.fan", domain: "burger.fan", navLinks: placeholderNav("Burger") },
  capital: { slug: "capital", label: "capital.fan", domain: "capital.fan", navLinks: placeholderNav("Capital") },
  cocktail: { slug: "cocktail", label: "cocktail.fan", domain: "cocktail.fan", navLinks: placeholderNav("Cocktail") },
  coffee: { slug: "coffee", label: "coffee.fan", domain: "coffee.fan", navLinks: placeholderNav("Coffee") },
  collector: { slug: "collector", label: "collector.fan", domain: "collector.fan", navLinks: placeholderNav("Collector") },
  dance: { slug: "dance", label: "dance.fan", domain: "dance.fan", navLinks: placeholderNav("Dance") },
  diy: { slug: "diy", label: "diy.fan", domain: "diy.fan", navLinks: placeholderNav("DIY") },
  fashion: {
    slug: "fashion",
    label: "fashion.fan",
    domain: "fashion.fan",
    navLinks: [
      { label: "Outfit Generator", href: "/outfit-generator" },
      {
        label: "Shop the Look",
        href: "#",
        children: [{ label: "LVMH Demo", href: "/lvmh" }],
      },
    ],
  },
  gourmet: { slug: "gourmet", label: "gourmet.fan", domain: "gourmet.fan", navLinks: placeholderNav("Gourmet") },
  gym: { slug: "gym", label: "gym.fan", domain: "gym.fan", navLinks: placeholderNav("Gym") },
  healthy: {
    slug: "healthy",
    label: "healthy.fan",
    domain: "healthy.fan",
    navLinks: [
      { label: "Nutrition", href: "#" },
      {
        label: "Wellness",
        href: "#",
        children: [
          { label: "Health Conditions", href: "#" },
          { label: "Mind", href: "#" },
          { label: "Sleep", href: "#" },
          { label: "Fitness", href: "#" },
        ],
      },
      {
        label: "Vitality",
        href: "#",
        children: [
          { label: "Pregnancy", href: "#" },
          { label: "Parenthood", href: "#" },
          { label: "Disability", href: "#" },
          { label: "Surgery", href: "#" },
          { label: "Smart Aging", href: "/smart-aging" },
        ],
      },
    ],
  },
  lifestyle: { slug: "lifestyle", label: "lifestyle.fan", domain: "lifestyle.fan", navLinks: placeholderNav("Lifestyle") },
  luxury: { slug: "luxury", label: "luxury.fan", domain: "luxury.fan", navLinks: placeholderNav("Luxury") },
  martialarts: { slug: "martialarts", label: "martialarts.fan", domain: "martialarts.fan", navLinks: placeholderNav("Martial Arts") },
  robotic: { slug: "robotic", label: "robotic.fan", domain: "robotic.fan", navLinks: placeholderNav("Robotic") },
  running: { slug: "running", label: "running.fan", domain: "running.fan", navLinks: placeholderNav("Running") },
  trek: { slug: "trek", label: "trek.fan", domain: "trek.fan", navLinks: placeholderNav("Trek") },
  vegetarian: { slug: "vegetarian", label: "vegetarian.fan", domain: "vegetarian.fan", navLinks: placeholderNav("Vegetarian") },
  wildlife: { slug: "wildlife", label: "wildlife.fan", domain: "wildlife.fan", navLinks: placeholderNav("Wildlife") },
  yoga: { slug: "yoga", label: "yoga.fan", domain: "yoga.fan", navLinks: placeholderNav("Yoga") },
  sneaker: { slug: "sneaker", label: "sneaker.fan", domain: "sneaker.fan", navLinks: placeholderNav("Sneaker") },
  adventure: { slug: "adventure", label: "adventure.fan", domain: "adventure.fan", navLinks: placeholderNav("Adventure") },
  discount: { slug: "discount", label: "discount.fan", domain: "discount.fan", navLinks: [] },
  events: { slug: "events", label: "events.fan", domain: "events.fan", navLinks: [] },
};

/**
 * Resolve which site we're currently rendering.
 *
 * Resolution order:
 *  1. `?site=<slug>` query param — used in development & preview where the
 *     hostname is `lovable.app`.
 *  2. Hostname match against `domain` (handles www. prefix).
 *  3. Subdomain slug, e.g. `car.fan` → `car`.
 *  4. Falls back to the hub (tobe).
 */
export function resolveCurrentSite(): SiteConfig {
  if (typeof window === "undefined") return SITES[HUB_SLUG];

  // 1. Query-param override (dev/preview). Persist to sessionStorage so
  //    subsequent in-app navigation that drops the param (e.g. clicking a
  //    relative <a href="/outfit">) still resolves to the same site.
  try {
    const param = new URLSearchParams(window.location.search).get("site");
    if (param && SITES[param]) {
      try { sessionStorage.setItem("currentSiteSlug", param); } catch { /* ignore */ }
      return SITES[param];
    }
  } catch {
    /* ignore */
  }


  const host = window.location.hostname.replace(/^www\./, "").toLowerCase();

  // 2. Exact domain match.
  for (const cfg of Object.values(SITES)) {
    if (cfg.domain === host) return cfg;
  }

  // 3. First label of host as slug (e.g. car.fan → car).
  const firstLabel = host.split(".")[0];
  if (firstLabel && SITES[firstLabel]) return SITES[firstLabel];

  // 4. Unknown *.fan subdomain — synthesize a minimal config so the topic
  //    site renderer can look it up in the sites table and show the correct
  //    page (active layout, coming_soon capture, or inactive redirect).
  //    Without this, unregistered sites fall back to the hub.
  if (firstLabel && host.endsWith(".fan") && firstLabel !== HUB_SLUG) {
    return {
      slug: firstLabel,
      label: `${firstLabel}.fan`,
      domain: host,
      navLinks: [],
    };
  }

  // 5. Dev/preview fallback: hostname has no topic info (e.g. *.lovable.app)
  //    and no ?site= param this navigation. Use the last site we resolved
  //    via ?site= in this tab so client-side nav keeps the site context.
  try {
    const stored = sessionStorage.getItem("currentSiteSlug");
    if (stored && SITES[stored]) return SITES[stored];
  } catch { /* ignore */ }

  return SITES[HUB_SLUG];
}


export function isHub(site: SiteConfig): boolean {
  return site.slug === HUB_SLUG;
}

/** Absolute URL on the hub (tobe.fan) for a given path. */
export function hubUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${HUB_DOMAIN}${p}`;
}
