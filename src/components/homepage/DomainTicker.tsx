import { useEffect, useRef, useState } from "react";
import { DomainButton } from "@/components/shared/DomainButton";

const visibleDomains = [
  "cocktail", "car", "yoga", "wine", "coffee", "sneaker",
  "fashion", "beauty", "running", "lifestyle", "wildlife", "luxury",
];

const moreDomains = [
  "healthy", "gym", "bike", "martialarts", "burger", "gourmet", "barbecue",
  "boat", "trek", "diy", "collector", "robotic", "capital", "dance", "sneaker", "tobe",
];

const liveSites = new Set(["cocktail", "car", "yoga", "tobe"]);

export function DomainTicker() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={wrapRef} className="w-full relative">
      <div className="flex flex-wrap justify-center gap-2">
        {visibleDomains.map((name) => (
          <DomainButton
            key={name}
            siteName={`${name}.fan`}
            domain={`${name}.fan`}
            size="medium"
            isLive={liveSites.has(name)}
            showDomainFormat
          />
        ))}
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150 ease-in-out text-white"
          style={{
            height: 36,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 12,
            fontSize: 13,
            backgroundColor: "#0A0A0A",
          }}
        >
          +13 more
        </button>
      </div>

      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white border border-ds-border z-40"
          style={{ borderRadius: 12, padding: 16, top: "100%" }}
        >
          <div className="flex flex-wrap justify-center gap-2" style={{ maxWidth: 720 }}>
            {moreDomains.map((name, i) => (
              <DomainButton
                key={`${name}-${i}`}
                siteName={`${name}.fan`}
                domain={`${name}.fan`}
                size="medium"
                isLive={liveSites.has(name)}
                showDomainFormat
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
