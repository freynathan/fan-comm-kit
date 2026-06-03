import { useEffect, useRef } from "react";
import { DomainButton } from "./DomainButton";
import { openCommunitiesModal } from "@/lib/communitiesModal";
import { clearActiveSite } from "@/hooks/useActiveSite";

const categories: { label: string; sites: string[] }[] = [
  { label: "Active lifestyle & fitness", sites: ["yoga", "gym", "running", "bike", "martialarts", "healthy"] },
  { label: "Food & drink", sites: ["cocktail", "wine", "coffee", "gourmet", "burger", "barbecue"] },
  { label: "Style & living", sites: ["fashion", "luxury", "beauty", "dance", "sneaker", "lifestyle"] },
  { label: "Adventure & nature", sites: ["trek", "wildlife", "boat"] },
  { label: "Machines & tech", sites: ["car", "robotic"] },
  { label: "Build & collect", sites: ["capital", "diy", "collector"] },
];

const liveSites = new Set(["cocktail", "car", "yoga", "tobe"]);

interface AllSitesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentSite: string;
  accentColor: string;
}

export function AllSitesDropdown({ isOpen, onClose, currentSite, accentColor }: AllSitesDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={ref} className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-ds-border z-40">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.label}>
              <h4 className="text-[10px] uppercase tracking-widest text-ds-text-tertiary font-medium mb-2">
                {cat.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cat.sites.map((s) => (
                  <DomainButton
                    key={s}
                    siteName={s}
                    domain={`${s}.fan`}
                    size="medium"
                    isLive={liveSites.has(s)}
                    isSoon={!liveSites.has(s)}
                    isSelected={s === currentSite}
                    onClick={() => window.open(`https://${s}.fan`, "_blank")}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6 pt-4 border-t border-ds-border">
          <a
            href="https://tobe.fan"
            className="text-sm font-medium text-ds-accent"
            onClick={() => clearActiveSite()}
          >
            ← Back to tobe.fan
          </a>
          <button
            onClick={() => { onClose(); openCommunitiesModal(); }}
            className="text-sm font-medium text-ds-accent hover:underline"
          >
            View all communities →
          </button>
        </div>
      </div>
    </div>
  );
}
