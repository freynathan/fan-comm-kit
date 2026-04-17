import { useState } from "react";
import { categories, getCategoryIcon } from "./communities.tsx";
import { DomainButton } from "@/components/shared/DomainButton";

export function CommunitiesSection() {
  const [toastDomain, setToastDomain] = useState<string | null>(null);

  const handleClick = (domain: string, isLive: boolean) => {
    if (isLive) {
      window.location.href = `#${domain.replace(".fan", "")}`;
      return;
    }
    setToastDomain(domain);
    setTimeout(() => {
      setToastDomain((current) => (current === domain ? null : current));
    }, 3000);
  };

  return (
    <section className="w-full py-20 md:py-[120px] px-6 bg-ds-bg">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[16px] font-medium tracking-[0.08em] uppercase text-[#0C447C] mb-4">
            The network
          </p>
          <h2 className="text-[48px] font-semibold text-ds-text-primary leading-[1.2] tracking-[-0.8px] mb-5">
            28 communities. One identity.
          </h2>
          <p className="text-[15px] font-normal leading-[1.7] text-ds-text-tertiary mb-12 max-w-2xl mx-auto">
            Join the communities that match your passions. One login. One profile. Everything connected.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-xl border border-ds-border p-6 transition-colors hover:border-ds-border-strong"
                style={{ borderWidth: '0.5px' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center text-ds-accent-text bg-ds-accent">
                    {getCategoryIcon(cat.title)}
                  </span>
                  <h3 className="text-[15px] font-medium text-ds-text-primary">{cat.title}</h3>
                </div>
                <p className="text-[13px] font-normal text-ds-text-tertiary mb-4">
                  {cat.domains.length} communities
                </p>
                <div
                  className={
                    cat.domains.length === 6
                      ? "grid grid-cols-3 gap-2.5"
                      : cat.domains.length === 3
                        ? "grid grid-cols-3 gap-2.5"
                        : "flex flex-wrap gap-2.5"
                  }
                >
                  {cat.domains.map((d) => (
                    <div key={d.domain} className="relative">
                      <DomainButton
                        siteName={d.name}
                        domain={d.domain}
                        size="large"
                        isLive={d.live}
                        showDomainFormat
                        useAccentStyle
                        onClick={() => handleClick(d.domain, d.live)}
                      />
                      {toastDomain === d.domain && (
                        <div
                          role="status"
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 whitespace-nowrap bg-white px-3 py-2 text-[12px] text-ds-text-secondary animate-in fade-in-0 zoom-in-95 duration-200"
                          style={{ border: '1px solid #E5E5E5', borderRadius: 10 }}
                        >
                          Coming soon — join the waitlist to be notified when {d.domain} launches.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-medium text-ds-accent-text bg-ds-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            tobe.fan — connecting all 28 communities under one login
          </div>
        </div>
      </div>
    </section>
  );
}
