import { Heart, MessageCircle, Users } from "lucide-react";

export function RelateSection() {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(var(--grey-text))] mb-3">
          Fan Relate
        </p>
        <h2 className="text-[36px] font-bold text-[hsl(var(--navy))] leading-tight mb-2">
          Find your people.
        </h2>
        <p className="text-[16px] text-[hsl(var(--grey-text))] mb-12 max-w-2xl mx-auto">
          The first genuine human connection experience built for the AI era — powered by verified passion identity, not swipe algorithms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EBF5FF" }}>
              <Heart size={20} style={{ color: "#0C447C" }} />
            </div>
            <h3 className="text-[15px] font-bold text-[hsl(var(--navy))] mb-1">Verified passion matching</h3>
            <p className="text-[13px] text-[hsl(var(--grey-text))]">
              Connected through what you actually love — proven by years of real activity.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#E6FFFB" }}>
              <MessageCircle size={20} style={{ color: "#0D9488" }} />
            </div>
            <h3 className="text-[15px] font-bold text-[hsl(var(--navy))] mb-1">Before the first message</h3>
            <p className="text-[13px] text-[hsl(var(--grey-text))]">
              Fans already know each other through their content, clubs, and contributions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#ECFDF5" }}>
              <Users size={20} style={{ color: "#059669" }} />
            </div>
            <h3 className="text-[15px] font-bold text-[hsl(var(--navy))] mb-1">Not a dating app</h3>
            <p className="text-[13px] text-[hsl(var(--grey-text))]">
              Friends, collaborators, kindred spirits — and sometimes more.
            </p>
          </div>
        </div>

        {/* Blurred teaser */}
        <div className="relative rounded-2xl overflow-hidden border border-[hsl(var(--grey-border))] p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 blur-sm opacity-50 pointer-events-none">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[hsl(var(--grey-border))] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))]" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-24 h-3 rounded bg-[hsl(var(--muted))]" />
                  <div className="w-32 h-2 rounded bg-[hsl(var(--muted))]" />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[18px] font-bold text-[hsl(var(--navy))] mb-3">
              3 people near you share your exact passions.
            </p>
            <a
              href="/onboarding"
              className="inline-flex h-11 px-6 items-center rounded-lg text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0C447C" }}
            >
              Find your kindred spirits →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
