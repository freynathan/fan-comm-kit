import { Helmet } from "react-helmet-async";
import { SharedHeader } from "@/components/shared/SharedHeader";
import { SharedFooter } from "@/components/shared/SharedFooter";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import { HeroClaim } from "@/components/homepage/HeroClaim";

import { DomainTicker } from "@/components/homepage/DomainTicker";
import { ContentHubSection } from "@/components/homepage/ContentHubSection";
import { FeaturedProfilesSection } from "@/components/homepage/FeaturedProfilesSection";
import { RelateSection } from "@/components/homepage/RelateSection";
import { CommunitiesSection } from "@/components/homepage/CommunitiesSection";
import { ForBrandsSection } from "@/components/homepage/ForBrandsSection";
import { ClosingCTA } from "@/components/homepage/ClosingCTA";
import { AIAdvantageStrip } from "@/components/homepage/AIAdvantageStrip";

const Index = () => {
  const { data: stats } = useHomepageStats();

  return (
    <div className="min-h-screen bg-ds-bg">
      <Helmet>
        <title>ToBe.fan — Reinventing social in the AI era</title>
        <meta
          name="description"
          content="Come for the passion. Relate with fellow fans. Convert your social clout into passive income, forever. 28 AI-native passion communities. Free forever."
        />
        <meta property="og:title" content="ToBe.fan — Reinventing social in the AI era" />
        <meta
          property="og:description"
          content="The first passion platform built for the AI era. Free creator profiles. Genuine human connection. Passive income forever."
        />
      </Helmet>

      <SharedHeader
        siteName="tobe"
        siteEmoji="⭐"
        accentColor="hsl(var(--color-accent))"
        aiFeatureLabel="AI Relate"
      />

      {/* SECTION 1 — HERO (white) */}
      <section className="w-full bg-ds-bg py-20 md:py-[120px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[960px] mx-auto text-center">
            <h1 className="text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-[-1.5px] mb-4 text-ds-text-primary">
              Reinventing social in the{" "}
              <span className="text-[#0C447C]">AI</span> era.
            </h1>
            <p className="text-[15px] md:text-[18px] font-normal leading-[1.7] text-ds-text-tertiary max-w-[560px] mx-auto">
              Come for the passion. Relate with fellow fans. Convert your social clout into passive income, forever.
            </p>
          </div>
          <div className="max-w-[960px] mx-auto" style={{ marginTop: 32 }}>
            <DomainTicker />
          </div>
        </div>
      </section>

      {/* SECTION 2 — CONTENT HUB (grey) */}
      <ContentHubSection />

      {/* SECTION 3 — FEATURED PROFILES (white) */}
      <FeaturedProfilesSection />

      {/* SECTION 4 — RELATE (grey) */}
      <RelateSection />

      {/* SECTION 5 — COMMUNITIES (white) */}
      <CommunitiesSection />

      {/* SECTION 6 — FOR BRANDS (grey) */}
      <ForBrandsSection />

      {/* SECTION 7 — CLOSING CTA (white) */}
      <ClosingCTA />

      {/* SECTION 8 — AI ADVANTAGE STRIP (grey) */}
      <AIAdvantageStrip />

      <SharedFooter />
    </div>
  );
};

export default Index;
