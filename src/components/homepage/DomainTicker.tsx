import { tickerDomains } from "./communities.tsx";
import { DomainButton } from "@/components/shared/DomainButton";

export function DomainTicker() {
  const doubled = [...tickerDomains, ...tickerDomains];

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex animate-ticker gap-3" style={{ width: "max-content" }}>
        {doubled.map((d, i) => (
          <DomainButton
            key={`${d.domain}-${i}`}
            siteName={d.name}
            domain={d.domain}
            size="medium"
            isLive={d.live}
          />
        ))}
      </div>
    </div>
  );
}
