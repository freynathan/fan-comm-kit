export interface CommunityDomain {
  name: string;
  emoji: string;
  domain: string;
  accentColor: string;
  live: boolean;
}

export interface CommunityCategory {
  title: string;
  icon: string;
  domains: CommunityDomain[];
}

const d = (name: string, emoji: string, accent: string, live = false): CommunityDomain => ({
  name,
  emoji,
  domain: `${name.toLowerCase()}.fan`,
  accentColor: accent,
  live,
});

export const allDomains: CommunityDomain[] = [
  d("cocktail", "🍹", "#0C447C", true),
  d("car", "🚗", "#1E3A5F", true),
  d("yoga", "🧘", "#065F46", true),
  d("boat", "⛵", "#065F46"),
  d("golf", "⛳", "#16A34A"),
  d("surf", "🏄", "#0EA5E9"),
  d("ski", "⛷️", "#3B82F6"),
  d("wine", "🍷", "#7C2D12"),
  d("coffee", "☕", "#78350F"),
  d("gourmet", "👨‍🍳", "#B45309"),
  d("wildlife", "🦁", "#15803D"),
  d("dive", "🤿", "#0369A1"),
  d("fashion", "👗", "#BE185D"),
  d("sneaker", "👟", "#7C3AED"),
  d("watch", "⌚", "#1E3A5F"),
  d("art", "🎨", "#F59E0B"),
  d("photo", "📸", "#6D28D9"),
  d("music", "🎵", "#EC4899"),
  d("gaming", "🎮", "#7C3AED"),
  d("fitness", "💪", "#10B981"),
  d("travel", "✈️", "#0284C7"),
  d("tech", "💻", "#3B82F6"),
  d("lifestyle", "🌿", "#059669"),
];

export const categories: CommunityCategory[] = [
  {
    title: "Motor & Outdoor",
    icon: "🏎️",
    domains: allDomains.filter((d) =>
      ["car", "boat", "golf", "surf", "ski"].includes(d.name)
    ),
  },
  {
    title: "Food & Drink",
    icon: "🍽️",
    domains: allDomains.filter((d) =>
      ["cocktail", "wine", "coffee", "gourmet"].includes(d.name)
    ),
  },
  {
    title: "Nature & Adventure",
    icon: "🌍",
    domains: allDomains.filter((d) =>
      ["wildlife", "dive", "travel", "yoga"].includes(d.name)
    ),
  },
  {
    title: "Style & Culture",
    icon: "✨",
    domains: allDomains.filter((d) =>
      ["fashion", "sneaker", "watch", "art"].includes(d.name)
    ),
  },
  {
    title: "Creative & Tech",
    icon: "🚀",
    domains: allDomains.filter((d) =>
      ["photo", "music", "gaming", "tech"].includes(d.name)
    ),
  },
  {
    title: "Lifestyle & Wellness",
    icon: "🧘",
    domains: allDomains.filter((d) =>
      ["fitness", "lifestyle"].includes(d.name)
    ),
  },
];
