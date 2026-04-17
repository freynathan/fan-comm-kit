import { Radio } from "lucide-react";

export function ContentHubSection() {
  return (
    <section className="w-full py-12 md:py-[80px] px-6 bg-ds-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] uppercase text-[#0C447C] mb-3">
            Latest from the network
          </p>
          <h2 className="text-[44px] font-semibold text-ds-text-primary leading-[1.2] tracking-[-0.8px] mb-2">
            Every passion. One hub.
          </h2>
          <p className="text-[15px] font-normal leading-[1.7] text-ds-text-tertiary mb-10 max-w-2xl mx-auto">
            AI-powered content published here first — dispatched to the communities that care most.
          </p>

          {/* Placeholder state */}
          <div className="rounded-xl border border-ds-border bg-white py-16 px-8" style={{ borderWidth: '0.5px' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ds-accent-light flex items-center justify-center">
              <Radio size={28} className="text-ds-accent" />
            </div>
            <p className="text-[15px] font-medium text-ds-text-primary mb-1">
              Content arriving soon
            </p>
            <p className="text-[13px] font-normal text-ds-text-tertiary">
              Our AI is scanning the web as we speak.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
