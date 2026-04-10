import { useEffect, useRef } from "react";

const categories: { label: string; sites: string[] }[] = [
  { label: "Active lifestyle & fitness", sites: ["yoga", "gym", "running", "bike", "martialarts", "healthy"] },
  { label: "Food & drink", sites: ["cocktail", "burger", "gourmet"] },
  { label: "Style & beauty", sites: ["fashion", "beauty", "dance"] },
  { label: "Adventure & machines", sites: ["car", "boat", "trek", "diy"] },
  { label: "Tech & collecting", sites: ["collector", "robotic"] },
  { label: "Ecosystem multipliers", sites: ["capital", "luxury", "lifestyle"] },
];

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
    <div ref={ref} className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-100 z-40">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.label}>
              <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-2">
                {cat.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cat.sites.map((s) => {
                  const isCurrent = s === currentSite;
                  return (
                    <a
                      key={s}
                      href={`https://${s}.fan`}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                      style={
                        isCurrent
                          ? { backgroundColor: accentColor, color: "#fff" }
                          : { backgroundColor: "#f3f4f6", color: "#4b5563" }
                      }
                    >
                      {s}.fan
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <a href="https://tobe.fan" className="text-sm font-medium" style={{ color: "#0C447C" }}>
            ← Back to tobe.fan
          </a>
          <a href="https://tobe.fan/communities" className="text-sm font-medium" style={{ color: "#0C447C" }}>
            View all 22 communities →
          </a>
        </div>
      </div>
    </div>
  );
}
