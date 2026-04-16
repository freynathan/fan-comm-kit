export function ContentHubSection() {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(var(--grey-text))] mb-3">
          Latest from the network
        </p>
        <h2 className="text-[36px] font-bold text-[hsl(var(--navy))] leading-tight mb-2">
          Every passion. One hub.
        </h2>
        <p className="text-[16px] text-[hsl(var(--grey-text))] mb-10 max-w-2xl mx-auto">
          AI-powered content published here first — dispatched to the communities that care most.
        </p>

        {/* Placeholder state */}
        <div className="rounded-2xl border border-[hsl(var(--grey-border))] bg-[hsl(var(--muted))] py-16 px-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--grey-border))] flex items-center justify-center text-2xl">
            📡
          </div>
          <p className="text-[15px] font-medium text-[hsl(var(--navy))] mb-1">
            Content arriving soon
          </p>
          <p className="text-[13px] text-[hsl(var(--grey-text))]">
            Our AI is scanning the web as we speak.
          </p>
        </div>
      </div>
    </section>
  );
}
