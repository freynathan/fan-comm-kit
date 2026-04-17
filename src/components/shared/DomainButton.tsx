import {
  Star, Wine, Car, Flower2, Dumbbell, PersonStanding, Bike,
  Award, Leaf, Beef, ChefHat, Flame, Coffee,
  Shirt, Sparkles, Music, Footprints,
  Sailboat, Mountain, Hammer, Trophy, Bot, PawPrint,
  TrendingUp, Diamond, Sun, GlassWater
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  tobe: Star,
  cocktail: GlassWater,
  car: Car,
  yoga: Flower2,
  gym: Dumbbell,
  running: PersonStanding,
  bike: Bike,
  martialarts: Award,
  healthy: Leaf,
  burger: Beef,
  gourmet: ChefHat,
  barbecue: Flame,
  coffee: Coffee,
  wine: Wine,
  fashion: Shirt,
  beauty: Sparkles,
  dance: Music,
  sneaker: Footprints,
  boat: Sailboat,
  trek: Mountain,
  diy: Hammer,
  collector: Trophy,
  robotic: Bot,
  wildlife: PawPrint,
  capital: TrendingUp,
  luxury: Diamond,
  lifestyle: Sun,
};

const sizeConfig = {
  large:  { height: 44, icon: 24, text: 14, px: 16, py: 10, radius: 14 },
  medium: { height: 36, icon: 20, text: 13, px: 12, py: 8,  radius: 12 },
  small:  { height: 28, icon: 16, text: 12, px: 10, py: 5,  radius: 8  },
} as const;

/** Per-site accent palette: border/icon/text use accent, bg uses accent at ~8% opacity */
const accentPalette: Record<string, { accent: string; bg: string; bgHover: string }> = {
  yoga:        { accent: "#4A1970", bg: "#F0EAF7", bgHover: "#E3D6F0" },
  gym:         { accent: "#1A3A5C", bg: "#EAF0F7", bgHover: "#D6E2F0" },
  running:     { accent: "#0A6B5C", bg: "#E8F5F2", bgHover: "#D1ECE6" },
  bike:        { accent: "#0A4A5C", bg: "#E8F3F7", bgHover: "#D1E8F0" },
  martialarts: { accent: "#3D0A0A", bg: "#F5E8E8", bgHover: "#EDD3D3" },
  healthy:     { accent: "#1A5C1A", bg: "#EAF5EA", bgHover: "#D6ECD6" },
  cocktail:    { accent: "#C25B0A", bg: "#FDF0E8", bgHover: "#FCE2D1" },
  wine:        { accent: "#6B1A2A", bg: "#F5EAF0", bgHover: "#EDD6E0" },
  coffee:      { accent: "#6B3A2A", bg: "#F5EEE8", bgHover: "#EDDFD3" },
  gourmet:     { accent: "#8B3A0A", bg: "#F5EDE8", bgHover: "#EDDDD3" },
  burger:      { accent: "#8B4A0A", bg: "#F5F0E8", bgHover: "#EDE3D3" },
  barbecue:    { accent: "#CC4A00", bg: "#FDF0E8", bgHover: "#FCE2D1" },
  fashion:     { accent: "#8B1A4A", bg: "#F5EAF0", bgHover: "#EDD6E0" },
  luxury:      { accent: "#B8960C", bg: "#FBF6E3", bgHover: "#F7EEC7" },
  beauty:      { accent: "#9B4F6E", bg: "#F7EEF2", bgHover: "#F0DDE6" },
  dance:       { accent: "#6B0A5C", bg: "#F5E8F3", bgHover: "#EDD3E8" },
  sneaker:     { accent: "#1A1A1A", bg: "#F0F0F0", bgHover: "#E0E0E0" },
  lifestyle:   { accent: "#1A5C38", bg: "#EAF5EE", bgHover: "#D6ECDD" },
  trek:        { accent: "#2D5A1A", bg: "#EDF5E8", bgHover: "#DCEDD3" },
  wildlife:    { accent: "#5C3D1A", bg: "#F5EFE8", bgHover: "#EDE0D3" },
  boat:        { accent: "#0A3D62", bg: "#E8F1F8", bgHover: "#D1E4F0" },
  car:         { accent: "#8B1A1A", bg: "#F5EAEA", bgHover: "#EDD6D6" },
  robotic:     { accent: "#0A3D5C", bg: "#E8F1F7", bgHover: "#D1E4F0" },
  capital:     { accent: "#1A3D2B", bg: "#EAF2EE", bgHover: "#D6E5DD" },
  diy:         { accent: "#5C3A0A", bg: "#F5EEE8", bgHover: "#EDDDD3" },
  collector:   { accent: "#3D1A5C", bg: "#F0EAF7", bgHover: "#E3D6F0" },
};

export interface DomainButtonProps {
  siteName: string;
  domain: string;
  size?: "large" | "medium" | "small";
  isLive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  /** When true, display siteName as-is (e.g. "car.fan") instead of capitalising */
  showDomainFormat?: boolean;
  /** When true, button uses its per-site accent color for border/icon/text/bg */
  useAccentStyle?: boolean;
}

export function DomainButton({
  siteName,
  domain,
  size = "medium",
  isLive = false,
  isSelected = false,
  onClick,
  className = "",
  showDomainFormat = false,
  useAccentStyle = false,
}: DomainButtonProps) {
  const cfg = sizeConfig[size];
  const key = siteName.toLowerCase().replace(/\.fan$/, "").replace(/\s/g, "");
  const Icon = iconMap[key] ?? Star;
  const dotSize = size === "large" ? 8 : size === "medium" ? 7 : 6;
  const palette = accentPalette[key];
  const [hover, setHover] = useState(false);

  const label = showDomainFormat
    ? siteName.toLowerCase()
    : siteName.charAt(0).toUpperCase() + siteName.slice(1);

  const accentMode = useAccentStyle && palette;

  const accentInlineStyle: React.CSSProperties = accentMode
    ? {
        borderColor: palette.accent,
        backgroundColor: hover ? palette.bgHover : palette.bg,
        color: palette.accent,
        transform: hover ? "scale(1.02)" : "scale(1)",
      }
    : {};

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative inline-flex items-center cursor-pointer transition-all duration-150 ease-in-out
        ${accentMode
          ? "border"
          : `bg-white border border-[#C8C8C8] hover:border-[#767676] hover:bg-ds-accent-light ${isSelected ? "border-ds-accent bg-ds-accent-light text-ds-accent" : ""}`
        }
        ${className}`}
      style={{
        height: cfg.height,
        paddingLeft: cfg.px,
        paddingRight: cfg.px,
        paddingTop: cfg.py,
        paddingBottom: cfg.py,
        borderRadius: cfg.radius,
        gap: size === "large" ? 10 : size === "medium" ? 8 : 6,
        minWidth: "fit-content",
        ...accentInlineStyle,
      }}
    >
      <Icon
        size={cfg.icon}
        strokeWidth={2}
        className={accentMode
          ? "shrink-0"
          : `shrink-0 ${isSelected ? "text-ds-accent" : "text-ds-text-primary"} group-hover:text-ds-accent`}
        style={accentMode ? { color: palette.accent } : undefined}
      />
      <span
        className={accentMode
          ? "font-medium whitespace-nowrap"
          : `font-medium whitespace-nowrap ${isSelected ? "text-ds-accent" : "text-ds-text-primary"} group-hover:text-ds-accent`}
        style={{ fontSize: cfg.text, letterSpacing: 0, ...(accentMode ? { color: palette.accent } : {}) }}
      >
        {label}
      </span>

      {isLive && (
        <span
          className="absolute bg-[#1A5C1A] rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            top: -dotSize / 2 + 1,
            right: -dotSize / 2 + 1,
          }}
        />
      )}
    </button>
  );
}
