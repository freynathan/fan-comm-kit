import { Helmet } from "react-helmet-async";
import { SharedHeader } from "@/components/shared/SharedHeader";
import { SharedFooter } from "@/components/shared/SharedFooter";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import { HeroClaim } from "@/components/homepage/HeroClaim";
import { StatPills } from "@/components/homepage/StatPills";
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
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>ToBe.fan — Reinventing social in the AI era</title>
        <meta
          name="description"
          content="Come for the passion. Relate with fellow fans. Convert your social clout into passive income, forever. 23 AI-native passion communities. Free forever."
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
        accentColor="#0C447C"
        aiFeatureLabel="AI Relate"
      />

      {/* SECTION 1 — HERO */}
      <section className="w-full pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.1] tracking-tight mb-4" style={{ color: "#0A1628" }}>
            Reinventing social in the{" "}
            <span style={{ color: "#0C447C" }}>AI</span> era.
          </h1>
          <p className="text-[16px] md:text-[18px] text-[hsl(var(--grey-text))] mb-8 max-w-2xl mx-auto">
            Come for the passion. Relate with fellow fans. Convert your social clout into passive income, forever.
          </p>
          <HeroClaim />
          <div className="mt-8">
            <StatPills
              totalFans={stats?.totalFans ?? 0}
              totalClubs={stats?.totalClubs ?? 0}
              totalCommunities={stats?.totalCommunities ?? 23}
              postsToday={stats?.postsToday ?? 0}
            />
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-6">
          <DomainTicker />
        </div>
      </section>

      {/* SECTION 2 — CONTENT HUB */}
      <ContentHubSection />

      {/* SECTION 3 — FEATURED PROFILES */}
      <FeaturedProfilesSection />

      {/* SECTION 4 — RELATE */}
      <RelateSection />

      {/* SECTION 5 — COMMUNITIES */}
      <CommunitiesSection />

      {/* SECTION 6 — FOR BRANDS */}
      <ForBrandsSection />

      {/* SECTION 7 — CLOSING CTA */}
      <ClosingCTA />

      {/* SECTION 8 — AI ADVANTAGE STRIP */}
      <AIAdvantageStrip />

      <SharedFooter />
    </div>
  );
};

export default Index;
