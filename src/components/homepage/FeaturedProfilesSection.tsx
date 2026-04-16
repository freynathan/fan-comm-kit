import { useFeaturedProfiles } from "@/hooks/useHomepageStats";

const mockCreators = [
  {
    initials: "MK",
    bg: "#C25B0A",
    name: "Marco K.",
    handle: "marco",
    headline: "Cocktail creator · car.fan editor · Stuttgart",
    tags: ["cocktail.fan", "car.fan", "lifestyle.fan"],
    stats: "847 fans · 89 club members · 312K reach",
  },
  {
    initials: "EL",
    bg: "#8B1A4A",
    name: "Elena L.",
    handle: "elena",
    headline: "Fashion editor · beauty.fan contributor · Paris",
    tags: ["fashion.fan", "beauty.fan", "luxury.fan"],
    stats: "1.2K fans · 203 club members · 148K reach",
  },
  {
    initials: "JR",
    bg: "#5C3D1A",
    name: "James R.",
    handle: "james",
    headline: "Wildlife photographer · trek.fan guide · Cape Town",
    tags: ["wildlife.fan", "trek.fan", "coffee.fan"],
    stats: "534 fans · 47 club members · 224K reach",
  },
];

function CreatorCard({ creator }: { creator: typeof mockCreators[number] }) {
  return (
    <div className="relative bg-white rounded-xl border border-ds-border p-5 text-left transition-colors hover:border-ds-border-strong" style={{ borderWidth: '0.5px' }}>
      <span
        className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
        style={{ background: '#EAF5EA', color: '#1A5C1A' }}
      >
        ✓ AI Search Ready
      </span>
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[16px] font-semibold shrink-0"
          style={{ background: creator.bg }}
        >
          {creator.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-ds-text-primary truncate">
            {creator.name}
          </p>
          <p className="text-[13px] font-normal" style={{ color: '#2563EB' }}>
            tobe.fan/of/{creator.handle}
          </p>
        </div>
      </div>
      <p className="text-[13px] font-normal text-ds-text-tertiary italic mb-3">
        {creator.headline}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {creator.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-ds-surface text-ds-text-tertiary border border-ds-border"
            style={{ borderWidth: '0.5px' }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="text-[13px] font-normal text-ds-text-tertiary pt-3 border-t border-ds-border">
        {creator.stats}
      </div>
    </div>
  );
}

export function FeaturedProfilesSection() {
  const { data: profiles } = useFeaturedProfiles();

  const realCards = profiles && profiles.length > 0 ? profiles : [];
  const mocksNeeded = Math.max(0, 3 - realCards.length);

  return (
    <section className="w-full py-12 md:py-[80px] px-6 bg-ds-bg">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-ds-text-tertiary mb-3">
            Creator profiles
          </p>
          <h2 className="text-[36px] font-semibold text-ds-text-primary leading-[1.2] tracking-[-0.8px] mb-2">
            The bio link that builds your business.
          </h2>
          <p className="text-[15px] font-normal leading-[1.7] text-ds-text-tertiary mb-10 max-w-2xl mx-auto">
            Real creators. Verified passions. Passive income. Free forever.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {realCards.map((p) => (
              <div
                key={p.id}
                className="relative bg-white rounded-xl border border-ds-border p-5 text-left transition-colors hover:border-ds-border-strong"
                style={{ borderWidth: '0.5px' }}
              >
                <span
                  className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ background: '#EAF5EA', color: '#1A5C1A' }}
                >
                  ✓ AI Search Ready
                </span>
                <div className="flex items-start gap-3 mb-3">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.displayName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-ds-accent"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-ds-accent-text text-sm font-medium border-2 border-ds-accent bg-ds-accent">
                      {p.initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-ds-text-primary truncate">
                      {p.displayName}
                    </p>
                    <p className="text-[13px] font-normal text-ds-text-tertiary">
                      tobe.fan/of/{p.username}
                    </p>
                  </div>
                </div>
                {p.headline && (
                  <p className="text-[13px] font-normal text-ds-text-tertiary italic mb-3 line-clamp-2">
                    {p.headline}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-ds-surface text-ds-text-tertiary border border-ds-border"
                      style={{ borderWidth: '0.5px' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[13px] font-normal text-ds-text-tertiary pt-3 border-t border-ds-border">
                  {p.fanCount} fans · {p.clubCount} clubs · {p.totalPoints} passion points
                </div>
              </div>
            ))}
            {mockCreators.slice(0, mocksNeeded).map((creator) => (
              <CreatorCard key={creator.handle} creator={creator} />
            ))}
          </div>

          <p className="text-[13px] font-normal text-ds-text-tertiary">
            These profiles are free forever — <span style={{ color: '#0C447C' }}>tobe.fan/of/you</span> is waiting for you.
          </p>
        </div>
      </div>
    </section>
  );
}
