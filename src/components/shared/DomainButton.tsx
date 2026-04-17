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

/** Per-site accent palette: border/icon/text use accent, bg uses accent-light (~8% opacity) */
const accentPalette: Record<string, { accent: string; border?: string; bg: string; bgHover: string }> = {
  /* Active lifestyle & fitness */
  yoga:        { accent: "#4A1970", bg: "#F0EAF7", bgHover: "#E3D6F0" },
  gym:         { accent: "#005CB9", bg: "#E6F0FB", bgHover: "#D1E2F5" },
  running:     { accent: "#AB2432", bg: "#F5E8EA", bgHover: "#EDD3D7" },
  bike:        { accent: "#01A7B7", bg: "#E6F7F9", bgHover: "#D1F0F3" },
  martialarts: { accent: "#1A1A1A", border: "#333333", bg: "#F0F0F0", bgHover: "#E0E0E0" },
  healthy:     { accent: "#8AA312", bg: "#F3F7E6", bgHover: "#E8EFD1" },

  /* Food & drink */
  cocktail:    { accent: "#CF3B12", bg: "#FBEEE9", bgHover: "#F7DDD3" },
  wine:        { accent: "#790222", bg: "#F2E6EA", bgHover: "#E8D1D7" },
  coffee:      { accent: "#775E35", bg: "#F2EDE4", bgHover: "#E8DECB" },
  gourmet:     { accent: "#8BDD4B", bg: "#F2F1F1", bgHover: "#E5E3E3" },
  burger:      { accent: "#D97904", bg: "#FBF0E2", bgHover: "#F7E1C5" },
  barbecue:    { accent: "#4A130C", bg: "#F0E8E7", bgHover: "#E3D3D1" },

  /* Style & living */
  fashion:     { accent: "#9A031E", bg: "#F5E6E9", bgHover: "#EDD1D6" },
  luxury:      { accent: "#DAA520", bg: "#FBF6E3", bgHover: "#F7EEC7" },
  beauty:      { accent: "#CA47BD", bg: "#FAECF9", bgHover: "#F5D9F2" },
  dance:       { accent: "#2460BD", bg: "#EAF0FB", bgHover: "#D6E2F5" },
  sneaker:     { accent: "#FF312E", bg: "#FFECEC", bgHover: "#FED9D9" },
  lifestyle:   { accent: "#004466", bg: "#E6EFF5", bgHover: "#D1E0EB" },

  /* Adventure & nature */
  trek:        { accent: "#898177", bg: "#F2F1F0", bgHover: "#E5E3E0" },
  wildlife:    { accent: "#B7683B", bg: "#F8EEE6", bgHover: "#F1DDCB" },
  boat:        { accent: "#1C749D", bg: "#E7F2F8", bgHover: "#D1E5F0" },

  /* Machines & tech */
  car:         { accent: "#FF2800", bg: "#FFEBEA", bgHover: "#FED7D5" },
  robotic:     { accent: "#084165", bg: "#EEEEF2", bgHover: "#DDDDE5" },

  /* Build & collect */
  capital:     { accent: "#2FA98C", bg: "#E8F7F3", bgHover: "#D1F0E7" },
  diy:         { accent: "#FF9040", bg: "#ECEEF2", bgHover: "#D9DDE5" },
  collector:   { accent: "#684792", bg: "#F0EBF6", bgHover: "#E1D7ED" },

  /* Hub */
  tobe:        { accent: "#1A1A2E", bg: "#EEEEF2", bgHover: "#DDDDE5" },
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
    ? (siteName.toLowerCase().endsWith(".fan") ? siteName.toLowerCase() : `${siteName.toLowerCase()}.fan`)
    : siteName.charAt(0).toUpperCase() + siteName.slice(1);

  const accentMode = useAccentStyle && palette;

  const accentInlineStyle: React.CSSProperties = accentMode
    ? {
        borderColor: palette.border ?? palette.accent,
        backgroundColor: hover ? "#F8F8F8" : "#FFFFFF",
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
