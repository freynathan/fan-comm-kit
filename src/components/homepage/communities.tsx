import { Car, UtensilsCrossed, Compass, Palette, Cpu, HeartPulse, TreePine, Sparkles } from "lucide-react";
import React from "react";

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
  // Active lifestyle & fitness
  d("yoga", "🧘", "#4A1970", true),
  d("gym", "💪", "#1A3A5C"),
  d("running", "🏃", "#0A6B5C"),
  d("bike", "🚴", "#0A4A5C"),
  d("martialarts", "🥋", "#3D0A0A"),
  d("healthy", "🥗", "#1A5C1A"),
  // Food & drink
  d("cocktail", "🍹", "#C25B0A", true),
  d("burger", "🍔", "#8B4A0A"),
  d("gourmet", "👨‍🍳", "#8B3A0A"),
  d("barbecue", "🔥", "#CC4A00"),
  d("coffee", "☕", "#6B3A2A"),
  d("wine", "🍷", "#6B1A2A"),
  // Style & culture
  d("fashion", "👗", "#8B1A4A"),
  d("beauty", "💄", "#9B4F6E"),
  d("dance", "💃", "#6B0A5C"),
  d("sneaker", "👟", "#1A1A1A"),
  // Adventure & machines
  d("car", "🚗", "#8B1A1A", true),
  d("boat", "⛵", "#0A3D62"),
  d("trek", "🥾", "#2D5A1A"),
  d("diy", "🔧", "#5C3A0A"),
  // Tech & collecting
  d("collector", "🏺", "#3D1A5C"),
  d("robotic", "🤖", "#0A3D5C"),
  // Nature & wildlife
  d("wildlife", "🦁", "#5C3D1A"),
  // Ecosystem multipliers
  d("capital", "📈", "#1A3D2B"),
  d("luxury", "💎", "#B8960C"),
  d("lifestyle", "🌿", "#1A5C38"),
];

// Ticker order: active first, then curated order
export const tickerDomains: CommunityDomain[] = [
  "cocktail", "car", "yoga",
  "wine", "coffee", "sneaker", "fashion", "beauty", "luxury", "lifestyle",
  "running", "healthy", "gym", "bike", "martialarts",
  "burger", "gourmet", "barbecue",
  "boat", "trek", "diy", "wildlife",
  "collector", "robotic", "capital", "dance",
].map((name) => allDomains.find((d) => d.name === name)!).filter(Boolean);

const categoryIconMap: Record<string, React.ReactNode> = {
  "Active lifestyle & fitness": React.createElement(HeartPulse, { size: 16 }),
  "Food & drink": React.createElement(UtensilsCrossed, { size: 16 }),
  "Style & culture": React.createElement(Palette, { size: 16 }),
  "Adventure & machines": React.createElement(Car, { size: 16 }),
  "Tech & collecting": React.createElement(Cpu, { size: 16 }),
  "Nature & wildlife": React.createElement(TreePine, { size: 16 }),
  "Ecosystem multipliers": React.createElement(Sparkles, { size: 16 }),
};

export function getCategoryIcon(title: string): React.ReactNode {
  return categoryIconMap[title] ?? null;
}

export const categories: CommunityCategory[] = [
  {
    title: "Active lifestyle & fitness",
    icon: "🏋️",
    domains: allDomains.filter((d) =>
      ["yoga", "gym", "running", "bike", "martialarts", "healthy"].includes(d.name)
    ),
  },
  {
    title: "Food & drink",
    icon: "🍽️",
    domains: allDomains.filter((d) =>
      ["cocktail", "burger", "gourmet", "barbecue", "coffee", "wine"].includes(d.name)
    ),
  },
  {
    title: "Style & culture",
    icon: "✨",
    domains: allDomains.filter((d) =>
      ["fashion", "beauty", "dance", "sneaker"].includes(d.name)
    ),
  },
  {
    title: "Adventure & machines",
    icon: "🚗",
    domains: allDomains.filter((d) =>
      ["car", "boat", "trek", "diy"].includes(d.name)
    ),
  },
  {
    title: "Tech & collecting",
    icon: "🤖",
    domains: allDomains.filter((d) =>
      ["collector", "robotic"].includes(d.name)
    ),
  },
  {
    title: "Nature & wildlife",
    icon: "🦁",
    domains: allDomains.filter((d) =>
      ["wildlife"].includes(d.name)
    ),
  },
  {
    title: "Ecosystem multipliers",
    icon: "💎",
    domains: allDomains.filter((d) =>
      ["capital", "luxury", "lifestyle"].includes(d.name)
    ),
  },
];
