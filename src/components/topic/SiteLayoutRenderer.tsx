import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SiteSection } from "@/hooks/useNetwork";

interface SiteMeta {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  color: string | null;
  accent_color: string | null;
}

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  hero_image: string | null;
  created_at: string;
}

function ArticleFeedSection({ site, limit }: { site: SiteMeta; limit: number }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, title, excerpt, hero_image, created_at")
      .eq("site_id", site.id)
      .in("status", ["approved", "published"])
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => setPosts(data ?? []));
  }, [site.id, limit]);

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
              className="bg-white rounded-xl overflow-hidden"
              style={{ border: "0.5px solid hsl(var(--color-border))" }}
            >
              {post.hero_image && (
                <img
                  src={post.hero_image}
                  alt=""
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-5">
                <h3 className="text-[15px] font-medium text-ds-text-primary leading-[1.4] line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-[13px] text-ds-text-secondary leading-[1.5] line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContentSection({ section }: { section: SiteSection }) {
  const blocks = section.data?.blocks as string | undefined;
  if (!blocks) return null;
  const edgeToEdge = (section.config as { edgeToEdge?: boolean } | undefined)?.edgeToEdge;
  return (
    <section className={`w-full py-10 bg-ds-bg${edgeToEdge ? "" : " px-6"}`}>
      <div className={edgeToEdge ? "" : "max-w-[960px] mx-auto"}>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: blocks }}
        />
      </div>
    </section>
  );
}

function TrendingSection({ site }: { site: SiteMeta }) {
  const accent = site.color ?? site.accent_color ?? "#111";
  return (
    <section className="w-full px-6 py-10 bg-ds-bg">
      <div className="max-w-[960px] mx-auto">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider mb-4"
          style={{ color: accent }}
        >
          Trending on {site.name}.fan
        </p>
        <div className="rounded-xl border py-8 text-center text-sm text-ds-text-tertiary">
          Trending — coming soon
        </div>
      </div>
    </section>
  );
}

function CustomAISection({ site }: { site: SiteMeta }) {
  const accent = site.color ?? site.accent_color ?? "#111";
  return (
    <section className="w-full px-6 py-10 bg-ds-bg">
      <div className="max-w-[960px] mx-auto">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider mb-4"
          style={{ color: accent }}
        >
          AI Feature
        </p>
        <div className="rounded-xl border py-8 text-center text-sm text-ds-text-tertiary">
          Custom AI feature — coming soon
        </div>
      </div>
    </section>
  );
}

export interface SiteLayoutRendererProps {
  site: SiteMeta;
  sections: SiteSection[];
}

export function SiteLayoutRenderer({ site, sections }: SiteLayoutRendererProps) {
  const enabled = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (enabled.length === 0) return null;

  return (
    <>
      {enabled.map((section) => {
        const isContent = section.id === "content" || section.id.startsWith("content-");
        if (isContent) {
          return <ContentSection key={section.id} section={section} />;
        }
        if (section.id === "article-feed" || section.id === "content-feed") {
          const limit = (section.data?.maxArticles as number | undefined) ?? 12;
          return <ArticleFeedSection key={section.id} site={site} limit={limit} />;
        }
        if (section.id === "trending") {
          return <TrendingSection key={section.id} site={site} />;
        }
        if (section.id === "custom-ai") {
          return <CustomAISection key={section.id} site={site} />;
        }
        return null;
      })}
    </>
  );
}
