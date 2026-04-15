import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { OnboardingData } from "./OnboardingFlow";

interface Site {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  cluster: string;
  is_active: boolean;
}

const CLUSTER_ORDER = [
  "Active lifestyle & fitness",
  "Food & drink",
  "Style & beauty",
  "Adventure & machines",
  "Tech & collecting",
  "Ecosystem multipliers",
];

// Fallback data if sites table doesn't exist yet
const FALLBACK_SITES: Site[] = [
  { id: "1", name: "yoga", emoji: "🧘", accent_color: "#7C3AED", cluster: "Active lifestyle & fitness", is_active: true },
  { id: "2", name: "gym", emoji: "💪", accent_color: "#DC2626", cluster: "Active lifestyle & fitness", is_active: false },
  { id: "3", name: "running", emoji: "🏃", accent_color: "#EA580C", cluster: "Active lifestyle & fitness", is_active: false },
  { id: "4", name: "bike", emoji: "🚴", accent_color: "#16A34A", cluster: "Active lifestyle & fitness", is_active: false },
  { id: "5", name: "martialarts", emoji: "🥋", accent_color: "#1D4ED8", cluster: "Active lifestyle & fitness", is_active: false },
  { id: "6", name: "healthy", emoji: "🥗", accent_color: "#059669", cluster: "Active lifestyle & fitness", is_active: false },
  { id: "7", name: "cocktail", emoji: "🍹", accent_color: "#0C447C", cluster: "Food & drink", is_active: true },
  { id: "8", name: "burger", emoji: "🍔", accent_color: "#B45309", cluster: "Food & drink", is_active: false },
  { id: "9", name: "gourmet", emoji: "👨‍🍳", accent_color: "#7C2D12", cluster: "Food & drink", is_active: false },
  { id: "10", name: "fashion", emoji: "👗", accent_color: "#BE185D", cluster: "Style & beauty", is_active: false },
  { id: "11", name: "beauty", emoji: "💄", accent_color: "#DB2777", cluster: "Style & beauty", is_active: false },
  { id: "12", name: "dance", emoji: "💃", accent_color: "#9333EA", cluster: "Style & beauty", is_active: false },
  { id: "13", name: "car", emoji: "🚗", accent_color: "#1E3A5F", cluster: "Adventure & machines", is_active: true },
  { id: "14", name: "boat", emoji: "⛵", accent_color: "#065F46", cluster: "Adventure & machines", is_active: false },
  { id: "15", name: "trek", emoji: "🥾", accent_color: "#92400E", cluster: "Adventure & machines", is_active: false },
  { id: "16", name: "diy", emoji: "🔧", accent_color: "#525252", cluster: "Adventure & machines", is_active: false },
  { id: "17", name: "collector", emoji: "🎯", accent_color: "#4338CA", cluster: "Tech & collecting", is_active: false },
  { id: "18", name: "robotic", emoji: "🤖", accent_color: "#0F766E", cluster: "Tech & collecting", is_active: false },
  { id: "19", name: "capital", emoji: "📈", accent_color: "#15803D", cluster: "Ecosystem multipliers", is_active: false },
  { id: "20", name: "luxury", emoji: "💎", accent_color: "#6D28D9", cluster: "Ecosystem multipliers", is_active: false },
  { id: "21", name: "lifestyle", emoji: "✨", accent_color: "#0369A1", cluster: "Ecosystem multipliers", is_active: false },
  { id: "22", name: "pet", emoji: "🐾", accent_color: "#A16207", cluster: "Active lifestyle & fitness", is_active: false },
  { id: "23", name: "music", emoji: "🎵", accent_color: "#7E22CE", cluster: "Style & beauty", is_active: false },
];

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step2Passions({ data, update, onContinue, onBack }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("sites")
      .select("*")
      .order("name")
      .then(({ data: rows, error }) => {
        if (error || !rows || rows.length === 0) {
          setSites(FALLBACK_SITES);
        } else {
          setSites(rows);
        }
      });
  }, []);

  const selectedIds = new Set(data.selectedSites.map((s) => s.id));

  const toggle = (site: Site) => {
    setError("");
    if (selectedIds.has(site.id)) {
      update({ selectedSites: data.selectedSites.filter((s) => s.id !== site.id) });
    } else {
      update({
        selectedSites: [
          ...data.selectedSites,
          { id: site.id, name: site.name, emoji: site.emoji, accent_color: site.accent_color },
        ],
      });
    }
  };

  const handleContinue = () => {
    if (data.selectedSites.length === 0) {
      setError("Choose at least one passion to get started.");
      return;
    }
    onContinue();
  };

  // Group by cluster
  const grouped = CLUSTER_ORDER.map((cluster) => ({
    cluster,
    sites: sites.filter((s) => s.cluster === cluster),
  })).filter((g) => g.sites.length > 0);

  return (
    <div className="text-center">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm mb-6 mx-auto"
        style={{ color: "#6b7280" }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0A1628" }}>
        What are you passionate about?
      </h1>
      <p className="mt-2 text-[15px]" style={{ color: "#6b7280" }}>
        Choose the communities you want to join. You can always add more later.
      </p>

      {/* Passion grid */}
      <div className="mt-8 text-left space-y-6">
        {grouped.map((group) => (
          <div key={group.cluster}>
            <div className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "#9ca3af" }}>
              {group.cluster}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {group.sites.map((site) => {
                const selected = selectedIds.has(site.id);
                return (
                  <button
                    key={site.id}
                    onClick={() => toggle(site)}
                    className="relative flex items-center gap-2 rounded-xl border-2 p-3 transition-all text-left"
                    style={{
                      borderColor: selected ? "#0C447C" : "#e5e7eb",
                      backgroundColor: selected ? "#E6F1FB" : "white",
                    }}
                  >
                    <span
                      className="flex items-center justify-center rounded-lg text-sm shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: site.accent_color,
                      }}
                    >
                      {site.emoji}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[13px] font-semibold" style={{ color: "#0A1628" }}>
                        {site.name}
                      </span>
                      <span className="text-[13px]" style={{ color: site.accent_color }}>
                        .fan
                      </span>
                    </div>
                    {site.is_active && (
                      <span className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                        Live
                      </span>
                    )}
                    {selected && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0C447C" }}>
                        <Check size={12} color="white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
      )}

      <p className="mt-6 text-[13px]" style={{ color: "#9ca3af" }}>
        Don't worry — you can join more communities anytime from your dashboard.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={handleContinue}
          className="h-12 px-8 rounded-xl text-[15px] font-semibold text-white flex items-center gap-2 transition-opacity"
          style={{ backgroundColor: "#0C447C" }}
        >
          Join {data.selectedSites.length} communit{data.selectedSites.length === 1 ? "y" : "ies"} <ArrowRight size={16} />
        </button>
        <button
          onClick={onContinue}
          className="text-[13px] font-medium"
          style={{ color: "#9ca3af" }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
