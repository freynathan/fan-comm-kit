import {
  Star, Wine, Car, Flower2, Dumbbell, PersonStanding, Bike,
  Award, Leaf, Beef, ChefHat, Flame, Coffee,
  Shirt, Sparkles, Music, Footprints,
  Sailboat, Mountain, Hammer, Trophy, Bot, PawPrint,
  TrendingUp, Diamond, Sun, GlassWater
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

export interface DomainButtonProps {
  siteName: string;
  domain: string;
  size?: "large" | "medium" | "small";
  isLive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DomainButton({
  siteName,
  domain,
  size = "medium",
  isLive = false,
  isSelected = false,
  onClick,
  className = "",
}: DomainButtonProps) {
  const cfg = sizeConfig[size];
  const key = siteName.toLowerCase().replace(/\s/g, "");
  const Icon = iconMap[key] ?? Star;
  const dotSize = size === "large" ? 8 : size === "medium" ? 7 : 6;

  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center bg-white cursor-pointer transition-all duration-150 ease-in-out
        border-2 border-ds-text-primary
        hover:border-ds-accent hover:bg-ds-accent-light
        ${isSelected ? "border-ds-accent bg-ds-accent-light text-ds-accent" : ""}
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
      }}
    >
      <Icon
        size={cfg.icon}
        strokeWidth={2}
        className={`shrink-0 ${isSelected ? "text-ds-accent" : "text-ds-text-primary"} group-hover:text-ds-accent`}
      />
      <span
        className={`font-medium whitespace-nowrap ${isSelected ? "text-ds-accent" : "text-ds-text-primary"} group-hover:text-ds-accent`}
        style={{ fontSize: cfg.text, letterSpacing: 0 }}
      >
        {siteName.charAt(0).toUpperCase() + siteName.slice(1)}
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
