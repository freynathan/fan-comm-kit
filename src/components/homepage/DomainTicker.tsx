import { allDomains } from "./communities.tsx";

export function DomainTicker() {
  const doubled = [...allDomains, ...allDomains];

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex animate-ticker gap-3" style={{ width: "max-content" }}>
        {doubled.map((d, i) => (
          <span
            key={`${d.domain}-${i}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[hsl(var(--muted))] text-[hsl(var(--grey-text))] whitespace-nowrap shrink-0"
          >
            {d.emoji} {d.domain}
          </span>
        ))}
      </div>
    </div>
  );
}
