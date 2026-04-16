import { allDomains } from "./communities.tsx";

export function DomainTicker() {
  const doubled = [...allDomains, ...allDomains];

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex animate-ticker gap-3" style={{ width: "max-content" }}>
        {doubled.map((d, i) => (
          <span
            key={`${d.domain}-${i}`}
            className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[13px] font-normal bg-ds-surface text-ds-text-secondary whitespace-nowrap shrink-0 border border-ds-border"
            style={{ borderWidth: '0.5px' }}
          >
            {d.emoji} {d.domain}
          </span>
        ))}
      </div>
    </div>
  );
}
