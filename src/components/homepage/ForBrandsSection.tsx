export function ForBrandsSection() {
  const stats = [
    { value: "$200B", desc: "spent on social ads annually with near-zero AI visibility" },
    { value: "48hrs", desc: "until every social post disappears forever" },
    { value: "0", desc: "other platforms where brand presence is permanent and AI-readable" },
    { value: "€149/mo", desc: "for permanent verified presence across the entire passion network" },
  ];

  return (
    <section className="w-full py-20 md:py-[120px] px-6 bg-ds-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[16px] font-medium tracking-[0.08em] uppercase text-[#0C447C] mb-4">
            For brands
          </p>
          <h2 className="text-[48px] font-semibold text-ds-text-primary leading-[1.2] tracking-[-0.8px] mb-5">
            Your audience is already here.
          </h2>
          <p className="text-[15px] font-normal leading-[1.7] text-ds-text-tertiary mb-12 max-w-2xl mx-auto">
            Permanent, community-verified, AI-readable brand presence — for less than the cost of one sponsored post.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-10">
            {/* Left — brand page mock */}
            <div className="rounded-xl border border-ds-border p-5 bg-white transition-colors hover:border-ds-border-strong" style={{ borderWidth: '0.5px' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex items-center h-10 rounded-lg border border-ds-border px-3">
                  <span className="text-[14px] font-normal text-ds-text-tertiary">yourbrand.com</span>
                </div>
                <button className="h-10 px-4 rounded-lg text-[14px] font-medium text-ds-accent-text whitespace-nowrap bg-ds-accent hover:bg-ds-accent-hover transition-all active:scale-[0.98]">
                  Generate →
                </button>
              </div>
              <div className="rounded-lg border border-ds-border p-4 bg-ds-surface">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-ds-border" />
                  <div>
                    <p className="text-[13px] font-medium text-ds-text-primary">tobe.fan/of/YourBrand</p>
                    <p className="text-[11px] font-normal text-ds-text-tertiary">Verified brand presence</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded bg-ds-border" />
                  <div className="w-3/4 h-2.5 rounded bg-ds-border" />
                  <div className="w-1/2 h-2.5 rounded bg-ds-border" />
                </div>
              </div>
              <p className="text-[13px] font-normal text-ds-text-tertiary mt-3 text-center">
                Paste your URL. Your community page is live in seconds.
              </p>
            </div>

            {/* Right — stats */}
            <div className="flex flex-col justify-center gap-4">
              {stats.map((s) => (
                <div key={s.value} className="flex items-start gap-3 pl-3 border-l-[3px] border-ds-accent">
                  <span className="text-[22px] font-semibold text-ds-text-primary whitespace-nowrap tracking-[-0.3px]">{s.value}</span>
                  <span className="text-[13px] font-normal text-ds-text-tertiary pt-1 leading-[1.5]">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/brands"
            className="inline-flex h-11 px-8 items-center rounded-lg text-[14px] font-medium border border-ds-border-strong text-ds-text-primary transition-colors hover:border-ds-accent hover:text-ds-accent"
          >
            See your brand's presence →
          </a>
          <p className="text-[13px] font-normal text-ds-text-tertiary mt-3">
            First 10 founding brand partners get lifetime preferred pricing
          </p>
        </div>
      </div>
    </section>
  );
}
