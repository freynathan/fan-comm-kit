import { HeroClaim } from "./HeroClaim";

export function ClosingCTA() {
  return (
    <section className="w-full py-12 md:py-[80px] px-6 bg-ds-bg">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[960px] mx-auto text-center">
          <h2 className="text-[44px] font-semibold text-ds-text-primary leading-[1.2] tracking-[-0.8px] mb-3">
            Your passion identity. Free forever.
          </h2>
          <p className="text-[18px] font-normal text-ds-text-tertiary mb-8 leading-[1.7]">
            tobe.fan/of/you — the only profile AI agents find, trust, and cite.
          </p>
          <HeroClaim />
          <p className="text-[13px] font-normal text-ds-text-tertiary mt-4 leading-[1.5]">
            No credit card · No premium tier · No catch · Yours forever
          </p>
        </div>
      </div>
    </section>
  );
}
