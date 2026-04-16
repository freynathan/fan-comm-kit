import { useFeaturedProfiles } from "@/hooks/useHomepageStats";
import { HeroClaim } from "./HeroClaim";

function PlaceholderCard() {
  return (
    <div className="bg-white rounded-xl border border-[hsl(var(--grey-border))] p-6 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-2xl text-[hsl(var(--grey-text))] mb-3 font-bold">
        ?
      </div>
      <p className="text-[14px] font-semibold" style={{ color: "#0C447C" }}>
        tobe.fan/of/you
      </p>
      <p className="text-[13px] text-[hsl(var(--grey-text))] italic mt-1 mb-4">
        This could be you
      </p>
      <a
        href="/onboarding"
        className="inline-flex h-9 px-4 items-center rounded-lg text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#0C447C" }}
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
    <section className="w-full py-20 px-6" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(var(--grey-text))] mb-3">
          Creator profiles
        </p>
        <h2 className="text-[36px] font-bold text-[hsl(var(--navy))] leading-tight mb-2">
          The bio link that builds your business.
        </h2>
        <p className="text-[16px] text-[hsl(var(--grey-text))] mb-10 max-w-2xl mx-auto">
          tobe.fan/of/you — verified passion identity that AI agents find, trust, and cite. Free forever.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {cards.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-[hsl(var(--grey-border))] p-6 text-left"
            >
              <div className="flex items-start gap-3 mb-3">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.displayName}
                    className="w-14 h-14 rounded-full object-cover border-2"
                    style={{ borderColor: "#0C447C" }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-sm font-bold border-2"
                    style={{ backgroundColor: "#0C447C", borderColor: "#0C447C" }}
                  >
                    {p.initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-[hsl(var(--navy))] truncate">
                    {p.displayName}
                  </p>
                  <p className="text-[12px] text-[hsl(var(--grey-text))]">
                    tobe.fan/of/{p.username}
                  </p>
                </div>
              </div>
              {p.headline && (
                <p className="text-[13px] text-[hsl(var(--grey-text))] italic mb-3 line-clamp-2">
                  {p.headline}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[hsl(var(--muted))] text-[hsl(var(--grey-text))]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6FFFB] text-[#0D9488] mb-3">
                ✓ AI Search Ready
              </span>
              <div className="text-[12px] text-[hsl(var(--grey-text))] pt-2 border-t border-[hsl(var(--grey-border))]">
                {p.fanCount} fans · {p.clubCount} clubs · {p.totalPoints} passion points
              </div>
            </div>
          ))}
          {Array.from({ length: placeholders }).map((_, i) => (
            <PlaceholderCard key={`ph-${i}`} />
          ))}
        </div>

        <a
          href="/onboarding"
          className="inline-flex h-11 px-8 items-center rounded-lg text-[14px] font-semibold border-2 transition-colors hover:bg-[hsl(var(--muted))]"
          style={{ borderColor: "#0C447C", color: "#0C447C" }}
        >
          Get your free tobe.fan/of/you profile →
        </a>
        <p className="text-[12px] text-[hsl(var(--grey-text))] mt-3">
          Joins 50,000+ creators who replaced Linktree with tobe.fan
        </p>
      </div>
    </section>
  );
}
