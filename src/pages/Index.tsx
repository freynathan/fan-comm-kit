import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SharedHeader } from "@/components/shared/SharedHeader";
import { SharedFooter } from "@/components/shared/SharedFooter";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import { DomainTicker } from "@/components/homepage/DomainTicker";
import { ContentHubSection } from "@/components/homepage/ContentHubSection";
import { FeaturedProfilesSection } from "@/components/homepage/FeaturedProfilesSection";
import { RelateSection } from "@/components/homepage/RelateSection";
import { CommunitiesSection } from "@/components/homepage/CommunitiesSection";
import { ForBrandsSection } from "@/components/homepage/ForBrandsSection";
import { ClosingCTA } from "@/components/homepage/ClosingCTA";
import { AIAdvantageStrip } from "@/components/homepage/AIAdvantageStrip";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayoutRenderer } from "@/components/topic/SiteLayoutRenderer";
import type { SiteLayout, SiteSection } from "@/hooks/useNetwork";
import { persistActiveSite, clearActiveSite } from "@/hooks/useActiveSite";

interface SiteData {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  emoji: string | null;
  accent_color: string | null;
  color: string | null;
  font: string | null;
  logo_url: string | null;
  layout: SiteLayout | null;
}

function getSections(layout: SiteLayout | null, preview: string | null): SiteSection[] {
  if (!layout) return [];
  // Default to logged-out view unless explicitly requested as logged-in
  const viewMode = preview === "loggedin" ? "loggedin" : "loggedout";
  if (viewMode === "loggedin" && layout.loggedIn?.sections?.length) {
    return layout.loggedIn.sections;
  }
  if (layout.loggedOut?.sections?.length) {
    return layout.loggedOut.sections;
  }
  // fallback for legacy flat layout
  return layout.sections ?? [];
}

function SiteHomepage({ site, preview }: { site: SiteData; preview: string | null }) {
  const accent = site.color ?? site.accent_color ?? "#111";
  const sections = getSections(site.layout, preview);
  const hasLayout = sections.length > 0;
  const headerLinks = site.layout?.header?.links;

  // Persist site context so dashboard/profile pages keep this site's header
  useEffect(() => {
    persistActiveSite({
      slug: site.slug, name: site.name,
      color: site.color, accent_color: site.accent_color,
      emoji: site.emoji, logo_url: site.logo_url, icon_url: null,
      headerLinks: headerLinks ?? [],
    });
  }, [site.slug]);

  return (
    <div className="min-h-screen bg-ds-bg">
      <Helmet>
        <title>{site.name}.fan — {site.name} community on ToBe.fan</title>
        <meta name="description" content={`Join the ${site.name} fan community on ToBe.fan.`} />
      </Helmet>

      <SharedHeader
        siteName={site.slug}
        siteEmoji={site.emoji ?? ""}
        accentColor={accent}
        aiFeatureLabel={`AI ${site.name}`}
        customNavLinks={headerLinks?.length ? headerLinks : undefined}
        logoUrl={site.logo_url}
      />

      {!hasLayout && (
        <section className="w-full bg-ds-bg px-6" style={{ paddingTop: 80, paddingBottom: 40 }}>
          <div className="max-w-[960px] mx-auto text-center">
            <div className="text-[56px] mb-4">{site.emoji}</div>
            <h1
              className="text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-[-1.5px] text-ds-text-primary"
              style={{ marginBottom: 16 }}
            >
              {site.name}.fan
            </h1>
            <p className="text-[16px] text-ds-text-tertiary max-w-[480px] mx-auto leading-[1.6]">
              The home of {site.name.toLowerCase()} fans. Discover, connect, and join fan clubs.
            </p>
          </div>
        </section>
      )}

      {hasLayout ? (
        <SiteLayoutRenderer site={site} sections={sections} />
      ) : (
        <DefaultArticleFeed site={site} />
      )}

      <SharedFooter />
    </div>
  );
}

function DefaultArticleFeed({ site }: { site: SiteData }) {
  const [posts, setPosts] = useState<{ id: string; title: string; excerpt: string | null; created_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, title, excerpt, created_at")
      .eq("site_id", site.id)
      .in("status", ["approved", "published"])
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => setPosts(data ?? []));
  }, [site.id]);

  if (posts.length === 0) return null;

  return (
    <section className="w-full px-6 pb-16" style={{ backgroundColor: "#F8F8F8" }}>
      <div className="max-w-[960px] mx-auto pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-6">
          Latest from {site.name}.fan
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-5"
              style={{ border: "0.5px solid hsl(var(--color-border))" }}
            >
              <h3 className="text-[15px] font-medium text-ds-text-primary leading-[1.4] line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-2 text-[13px] text-ds-text-secondary leading-[1.5] line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  const { data: stats } = useHomepageStats();
  const [searchParams] = useSearchParams();
  const siteSlug = searchParams.get("site");
  const preview = searchParams.get("preview");

  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [siteLoading, setSiteLoading] = useState(!!siteSlug);

  useEffect(() => {
    if (!siteSlug) {
      clearActiveSite();
      setSiteData(null);
      setSiteLoading(false);
      return;
    }
    setSiteLoading(true);
    supabase
      .from("sites" as never)
      .select("id, name, slug, domain, emoji, accent_color, color, font, logo_url, layout")
      .eq("slug", siteSlug)
      .maybeSingle()
      .then(({ data }) => {
        setSiteData((data as unknown as SiteData) ?? null);
        setSiteLoading(false);
      });
  }, [siteSlug]);

  if (siteSlug && siteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ds-bg">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  if (siteSlug && siteData) {
    return <SiteHomepage site={siteData} preview={preview} />;
  }

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
      <section className="w-full bg-ds-bg px-6" style={{ paddingTop: 80, paddingBottom: 0 }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[960px] mx-auto text-center">
            <h1 className="text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-[-1.5px] text-ds-text-primary" style={{ marginBottom: 24 }}>
              Reinventing social in the{" "}
              <span className="text-[#0C447C]">AI</span> era.
            </h1>
            <p className="text-[15px] md:text-[18px] font-normal leading-[1.7] text-ds-text-tertiary max-w-[560px] mx-auto">
              Come for the passion. Relate with fellow fans. Convert your social clout into passive income, forever.
            </p>
          </div>
          <div className="max-w-[960px] mx-auto" style={{ marginTop: 56 }}>
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
