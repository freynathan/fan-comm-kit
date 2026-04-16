import { categories, type CommunityDomain } from "./communities";

function DomainPill({ d }: { d: CommunityDomain }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[hsl(var(--muted))] text-[hsl(var(--navy))]">
      {d.emoji} {d.domain}
      {d.live ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#059669]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          Live
        </span>
      ) : (
        <span className="text-[10px] text-[hsl(var(--grey-text))]">Soon</span>
      )}
    </span>
  );
}

export function CommunitiesSection() {
  return (
    <section className="w-full py-20 px-6" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(var(--grey-text))] mb-3">
          The network
        </p>
        <h2 className="text-[36px] font-bold text-[hsl(var(--navy))] leading-tight mb-2">
          23 passion communities. One identity.
        </h2>
        <p className="text-[16px] text-[hsl(var(--grey-text))] mb-10 max-w-2xl mx-auto">
          Join the communities that match your passions. One login. One profile. Everything connected.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-white rounded-xl border border-[hsl(var(--grey-border))] p-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#0C447C" }}>
                  {cat.icon}
                </span>
                <h3 className="text-[15px] font-bold text-[hsl(var(--navy))]">{cat.title}</h3>
              </div>
              <p className="text-[12px] text-[hsl(var(--grey-text))] mb-3">
                {cat.domains.length} communities
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.domains.map((d) => (
                  <DomainPill key={d.domain} d={d} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Hub pill */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white" style={{ backgroundColor: "#0C447C" }}>
          ⭐ tobe.fan — connecting all 23 communities under one login
        </div>
      </div>
    </section>
  );
}
