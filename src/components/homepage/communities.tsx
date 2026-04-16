import { Car, UtensilsCrossed, Compass, Palette, Cpu, HeartPulse } from "lucide-react";
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
  d("cocktail", "🍹", "#C25B0A", true),
  d("car", "🚗", "#8B1A1A", true),
  d("yoga", "🧘", "#4A1970", true),
  d("boat", "⛵", "#0A3D62"),
  d("fashion", "👗", "#8B1A4A"),
  d("beauty", "💄", "#9B4F6E"),
  d("running", "🏃", "#0A6B5C"),
  d("gym", "💪", "#1A3A5C"),
  d("wildlife", "🦁", "#5C3D1A"),
  d("lifestyle", "🌿", "#1A5C38"),
  d("luxury", "💎", "#B8960C"),
  d("capital", "📈", "#1A3D2B"),
  d("gourmet", "👨‍🍳", "#8B3A0A"),
  d("burger", "🍔", "#8B4A0A"),
  d("dance", "💃", "#6B0A5C"),
  d("collector", "🏺", "#3D1A5C"),
  d("robotic", "🤖", "#0A3D5C"),
  d("trek", "🥾", "#2D5A1A"),
  d("diy", "🔧", "#5C3A0A"),
  d("bike", "🚴", "#0A4A5C"),
  d("martialarts", "🥋", "#3D0A0A"),
  d("healthy", "🥗", "#1A5C1A"),
];

const categoryIconMap: Record<string, React.ReactNode> = {
  "Motor & Outdoor": React.createElement(Car, { size: 16 }),
  "Food & Drink": React.createElement(UtensilsCrossed, { size: 16 }),
  "Nature & Adventure": React.createElement(Compass, { size: 16 }),
  "Style & Culture": React.createElement(Palette, { size: 16 }),
  "Creative & Tech": React.createElement(Cpu, { size: 16 }),
  "Lifestyle & Wellness": React.createElement(HeartPulse, { size: 16 }),
};

export function getCategoryIcon(title: string): React.ReactNode {
  return categoryIconMap[title] ?? null;
}

export const categories: CommunityCategory[] = [
  {
    title: "Motor & Outdoor",
    icon: "🏎️",
    domains: allDomains.filter((d) =>
      ["car", "boat", "bike", "trek"].includes(d.name)
    ),
  },
  {
    title: "Food & Drink",
    icon: "🍽️",
    domains: allDomains.filter((d) =>
      ["cocktail", "gourmet", "burger", "healthy"].includes(d.name)
    ),
  },
  {
    title: "Nature & Adventure",
    icon: "🌍",
    domains: allDomains.filter((d) =>
      ["wildlife", "running", "martialarts", "yoga"].includes(d.name)
    ),
  },
  {
    title: "Style & Culture",
    icon: "✨",
    domains: allDomains.filter((d) =>
      ["fashion", "beauty", "luxury", "collector"].includes(d.name)
    ),
  },
  {
    title: "Creative & Tech",
    icon: "🚀",
    domains: allDomains.filter((d) =>
      ["robotic", "diy", "capital", "dance"].includes(d.name)
    ),
  },
  {
    title: "Lifestyle & Wellness",
    icon: "🧘",
    domains: allDomains.filter((d) =>
      ["lifestyle", "gym"].includes(d.name)
    ),
  },
];
