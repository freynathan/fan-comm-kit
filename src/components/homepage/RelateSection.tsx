import { Fingerprint, MessagesSquare, Handshake } from "lucide-react";

export function RelateSection() {
  return (
    <section className="w-full py-12 md:py-[80px] px-6 bg-ds-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-ds-text-tertiary mb-3">
            Fan Relate
          </p>
          <h2 className="text-[36px] font-semibold text-ds-text-primary leading-[1.2] tracking-[-0.8px] mb-2">
            Find your people.
          </h2>
          <p className="text-[15px] font-normal leading-[1.7] text-ds-text-tertiary mb-12 max-w-2xl mx-auto">
            The first genuine human connection experience built for the AI era — powered by verified passion identity, not swipe algorithms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center bg-ds-accent-light">
                <Fingerprint size={20} className="text-ds-accent" />
              </div>
              <h3 className="text-[15px] font-medium text-ds-text-primary mb-1">Verified passion matching</h3>
              <p className="text-[13px] font-normal text-ds-text-tertiary leading-[1.5]">
                Connected through what you actually love — proven by years of real activity.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center bg-ds-accent-light">
                <MessagesSquare size={20} className="text-ds-accent" />
              </div>
              <h3 className="text-[15px] font-medium text-ds-text-primary mb-1">Before the first message</h3>
              <p className="text-[13px] font-normal text-ds-text-tertiary leading-[1.5]">
                Fans already know each other through their content, clubs, and contributions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center bg-ds-accent-light">
                <Handshake size={20} className="text-ds-accent" />
              </div>
              <h3 className="text-[15px] font-medium text-ds-text-primary mb-1">Not a dating app</h3>
              <p className="text-[13px] font-normal text-ds-text-tertiary leading-[1.5]">
                Friends, collaborators, kindred spirits — and sometimes more.
              </p>
            </div>
          </div>

          {/* Blurred teaser */}
          <div className="relative rounded-xl overflow-hidden border border-ds-border p-8" style={{ borderWidth: '0.5px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 blur-sm opacity-50 pointer-events-none">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-ds-border p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ds-surface" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-24 h-3 rounded bg-ds-surface" />
                    <div className="w-32 h-2 rounded bg-ds-surface" />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[18px] font-semibold text-ds-text-primary mb-3 tracking-[-0.3px]">
                3 people near you share your exact passions.
              </p>
              <a
                href="/onboarding"
                className="inline-flex h-11 px-6 items-center rounded-lg text-[14px] font-medium text-ds-accent-text bg-ds-accent hover:bg-ds-accent-hover transition-all active:scale-[0.98]"
              >
                Find your kindred spirits →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
