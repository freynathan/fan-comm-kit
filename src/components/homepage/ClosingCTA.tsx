import { HeroClaim } from "./HeroClaim";

export function ClosingCTA() {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-[36px] font-bold text-[hsl(var(--navy))] leading-tight mb-3">
          Your passion identity. Free forever.
        </h2>
        <p className="text-[18px] text-[hsl(var(--grey-text))] mb-8">
          tobe.fan/of/you — the only profile AI agents find, trust, and cite.
        </p>
        <HeroClaim />
        <p className="text-[13px] text-[hsl(var(--grey-text))] mt-4">
          No credit card · No premium tier · No catch · Yours forever
        </p>
      </div>
    </section>
  );
}
