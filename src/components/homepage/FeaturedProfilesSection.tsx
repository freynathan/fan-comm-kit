import { useFeaturedProfiles } from "@/hooks/useHomepageStats";

const placeholderHooks = [
  "Turn your passion into passive income",
  "The only bio link AI agents find and trust",
  "Free forever. Pays you back.",
];

function PlaceholderCard({ index }: { index: number }) {
  return (
    <div className="bg-white rounded-xl border border-ds-border p-5 text-center transition-colors hover:border-ds-border-strong" style={{ borderWidth: '0.5px' }}>
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-[18px] font-semibold mb-3" style={{ background: '#DBEAFE', color: '#2563EB' }}>
        YN
      </div>
      <p className="text-[14px] font-medium" style={{ color: '#2563EB' }}>
        tobe.fan/of/yourname
      </p>
      <p className="text-[13px] text-ds-text-tertiary italic mt-1 mb-4 font-normal">
        {placeholderHooks[index] ?? placeholderHooks[0]}
      </p>
      <a
        href="/onboarding"
        className="inline-flex h-9 px-4 items-center rounded-lg text-[14px] font-medium text-ds-text-primary bg-transparent border transition-all active:scale-[0.98]"
        style={{ borderColor: '#C8C8C8' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--color-accent))')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#C8C8C8')}
      >
        Claim your profile →
      </a>
    </div>
  );
}

export function FeaturedProfilesSection() {
  const { data: profiles } = useFeaturedProfiles();

  const cards = profiles && profiles.length > 0 ? profiles : [];
  const placeholders = Math.max(0, 3 - cards.length);

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
            tobe.fan/of/you — verified passion identity that AI agents find, trust, and cite. Free forever.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {cards.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-ds-border p-5 text-left transition-colors hover:border-ds-border-strong"
                style={{ borderWidth: '0.5px' }}
              >
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium mb-3"
                  style={{ background: '#EAF5EA', color: '#1A5C1A' }}
                >
                  ✓ AI Search Ready
                </span>
                <div className="text-[13px] font-normal text-ds-text-tertiary pt-3 border-t border-ds-border">
                  {p.fanCount} fans · {p.clubCount} clubs · {p.totalPoints} passion points
                </div>
              </div>
            ))}
            {Array.from({ length: placeholders }).map((_, i) => (
              <PlaceholderCard key={`ph-${i}`} index={i} />
            ))}
          </div>

          <a
            href="/onboarding"
            className="inline-flex h-11 px-8 items-center rounded-lg text-[14px] font-medium border border-ds-border-strong text-ds-text-primary transition-colors hover:border-ds-accent hover:text-ds-accent"
          >
            Get your free profile →
          </a>
          <p className="text-[13px] font-normal text-ds-text-tertiary mt-3">
            Joins 50,000+ creators who replaced Linktree with tobe.fan
          </p>
        </div>
      </div>
    </section>
  );
}
