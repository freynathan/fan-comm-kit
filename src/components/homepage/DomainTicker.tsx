import { DomainButton } from "@/components/shared/DomainButton";

const tickerOrder = [
  "cocktail", "car", "yoga", "wine", "coffee", "sneaker", "fashion", "beauty",
  "luxury", "lifestyle", "running", "healthy", "gym", "bike", "martialarts",
  "burger", "gourmet", "barbecue", "boat", "trek", "diy", "wildlife",
  "collector", "robotic", "capital", "dance", "tobe",
];

const liveSites = new Set(["cocktail", "car", "yoga"]);

export function DomainTicker() {
  const doubled = [...tickerOrder, ...tickerOrder];

  return (
    <div className="w-full" style={{ paddingLeft: 24, paddingRight: 24 }}>
      <div className="w-full overflow-hidden py-4">
        <div className="flex animate-ticker gap-3" style={{ width: "max-content" }}>
          {doubled.map((name, i) => (
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
    </div>
  );
}
