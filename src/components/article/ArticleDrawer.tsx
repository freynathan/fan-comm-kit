import { useEffect, useState } from "react";
import { X, ExternalLink, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Source types accepted by the drawer:
 * - { kind: "synopsis", synopsisId } — full pipeline view (article + synopsis)
 * - { kind: "article", articleId } — raw article only
 * - { kind: "inline", data } — fallback for sample/static cards (passion wall) where no DB row exists
 */
export type ArticleDrawerSource =
  | { kind: "synopsis"; synopsisId: string }
  | { kind: "article"; articleId: string }
  | { kind: "inline"; data: InlineArticleData };

export interface InlineArticleData {
  title: string;
  siteName?: string;
  siteSlug?: string;
  siteAccent?: string;
  siteEmoji?: string;
  image?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  originalUrl?: string;
  originalAuthor?: string;
  originalPublishedAt?: string;
  readingTimeSeconds?: number;
  keyPoints?: string[];
  fanAngle?: string;
}

interface SiteRecord {
  id: string;
  name: string;
  slug: string | null;
  emoji: string;
  accent_color: string;
}

interface DrawerProps {
  open: boolean;
  source: ArticleDrawerSource | null;
  onClose: () => void;
  onAnimationEnd?: () => void;
}

interface LoadedArticle extends InlineArticleData {
  loveCount?: number;
  commentCount?: number;
  postId?: string | null;
  dispatchedTo?: { name: string; slug: string | null; emoji: string; accent: string }[];
}

export function ArticleDrawer({ open, source, onClose, onAnimationEnd }: DrawerProps) {
  const [data, setData] = useState<LoadedArticle | null>(null);
  const [loading, setLoading] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Esc key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Load source
  useEffect(() => {
    if (!open || !source) return;

    if (source.kind === "inline") {
      setData(source.data);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setData(null);

    (async () => {
      try {
        if (source.kind === "synopsis") {
          const { data: syn } = await supabase
            .from("news_synopses")
            .select(
              "id, title, synopsis_content, key_points, fan_angle, reading_time_seconds, post_id, article_id, site_id"
            )
            .eq("id", source.synopsisId)
            .maybeSingle();

          if (cancelled || !syn) return;

          const [{ data: article }, { data: site }, { data: post }, { data: dispatches }] = await Promise.all([
            syn.article_id
              ? supabase
                  .from("news_articles")
                  .select("id, original_url, original_title, original_author, original_published_at, original_content")
                  .eq("id", syn.article_id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            syn.site_id
              ? supabase
                  .from("sites")
                  .select("id, name, slug, emoji, accent_color")
                  .eq("id", syn.site_id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            syn.post_id
              ? supabase
                  .from("posts")
                  .select("love_count, comment_count")
                  .eq("id", syn.post_id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            supabase
              .from("content_dispatches")
              .select("dispatched_to_site_id")
              .eq("synopsis_id", syn.id),
          ]);

          const dispatchSiteIds = Array.from(
            new Set((dispatches ?? []).map((dispatch) => dispatch.dispatched_to_site_id).filter(Boolean))
          ) as string[];

          const { data: dispatchSites } = dispatchSiteIds.length
            ? await supabase
                .from("sites")
                .select("id, name, slug, emoji, accent_color")
                .in("id", dispatchSiteIds)
            : { data: [] as SiteRecord[] };

          const dispatchedTo = (dispatchSites ?? []).map((s) => ({
            name: s.name,
            slug: s.slug,
            emoji: s.emoji,
            accent: s.accent_color || "#0C447C",
          }));

          const keyPoints = Array.isArray(syn.key_points)
            ? (syn.key_points as string[])
            : syn.key_points && typeof syn.key_points === "object"
              ? Object.values(syn.key_points as Record<string, string>)
              : [];

          setData({
            title: syn.title,
            content: syn.synopsis_content,
            excerpt: syn.synopsis_content?.slice(0, 200),
            keyPoints: keyPoints as string[],
            fanAngle: syn.fan_angle ?? undefined,
            readingTimeSeconds: syn.reading_time_seconds,
            originalUrl: article?.original_url,
            originalAuthor: article?.original_author,
            originalPublishedAt: article?.original_published_at,
            siteName: site?.name,
            siteSlug: site?.slug,
            siteAccent: site?.accent_color || "#0C447C",
            siteEmoji: site?.emoji || "⭐",
            postId: syn.post_id,
            loveCount: post?.love_count ?? 0,
            commentCount: post?.comment_count ?? 0,
            dispatchedTo,
          });
        } else if (source.kind === "article") {
          const { data: art } = await supabase
            .from("news_articles")
            .select("id, original_url, original_title, original_author, original_published_at, original_content, site_id")
            .eq("id", source.articleId)
            .maybeSingle();

          if (cancelled || !art) return;
          const { data: site } = art.site_id
            ? await supabase
                .from("sites")
                .select("id, name, slug, emoji, accent_color")
                .eq("id", art.site_id)
                .maybeSingle()
            : { data: null };

          setData({
            title: art.original_title,
            content: art.original_content ?? "",
            originalUrl: art.original_url,
            originalAuthor: art.original_author ?? undefined,
            originalPublishedAt: art.original_published_at ?? undefined,
            siteName: site?.name,
            siteSlug: site?.slug,
            siteAccent: site?.accent_color || "#0C447C",
            siteEmoji: site?.emoji || "⭐",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, source]);

  // Always render so close transition can play. Hide via opacity/transform.
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        onTransitionEnd={onAnimationEnd}
        className={`fixed inset-0 z-[80] bg-black transition-opacity duration-200 ${
          open ? "opacity-60 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      />
      {/* Full-screen modal */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={data?.title || "Article reader"}
        className={`fixed inset-0 z-[81] bg-white flex flex-col
          transition-all duration-300 ease-out
          ${
            open
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-[0.98] pointer-events-none"
          }`}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 h-14 shrink-0"
          style={{ borderBottom: "0.5px solid hsl(var(--color-border))" }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F5F7] transition-colors"
          >
            <X size={18} strokeWidth={1.75} className="text-[#0A1628]" />
          </button>
          {data?.siteName ? (
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
              style={{ backgroundColor: data.siteAccent || "#0C447C" }}
            >
              <span>{data.siteEmoji}</span>
              <span>{data.siteName}</span>
            </div>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1">
            <button
              aria-label="Bookmark"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F5F7] transition-colors"
            >
              <Bookmark size={16} strokeWidth={1.75} className="text-[#3D3D3D]" />
            </button>
            <button
              aria-label="Share"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F5F7] transition-colors"
              onClick={() => {
                if (navigator.share && data?.title) {
                  navigator.share({ title: data.title, url: data.originalUrl }).catch(() => {});
                }
              }}
            >
              <Share2 size={16} strokeWidth={1.75} className="text-[#3D3D3D]" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-6 space-y-3">
              <div className="h-5 w-2/3 bg-[#F5F5F7] rounded animate-pulse" />
              <div className="h-4 w-full bg-[#F5F5F7] rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-[#F5F5F7] rounded animate-pulse" />
              <div className="h-44 w-full bg-[#F5F5F7] rounded-lg animate-pulse mt-4" />
            </div>
          )}

          {!loading && data && (
            <article className="px-5 md:px-6 py-6">
              {data.image && (
                <img
                  src={data.image}
                  alt={data.title}
                  className="w-full h-44 md:h-48 object-cover rounded-lg mb-5"
                />
              )}

              <h1
                className="text-[22px] md:text-[24px] font-semibold leading-[1.25] text-[#0A1628]"
                style={{ letterSpacing: "-0.01em" }}
              >
                {data.title}
              </h1>

              {(data.originalAuthor || data.originalPublishedAt || data.readingTimeSeconds) && (
                <p className="mt-3 text-[12px] text-ds-text-tertiary">
                  {data.originalAuthor && <span>{data.originalAuthor}</span>}
                  {data.originalAuthor && data.originalPublishedAt && <span> · </span>}
                  {data.originalPublishedAt && (
                    <span>
                      {new Date(data.originalPublishedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {data.readingTimeSeconds ? (
                    <>
                      {(data.originalAuthor || data.originalPublishedAt) && <span> · </span>}
                      <span>{Math.max(1, Math.round(data.readingTimeSeconds / 60))} min read</span>
                    </>
                  ) : null}
                </p>
              )}

              {data.fanAngle && (
                <div
                  className="mt-5 px-4 py-3 rounded-lg text-[13px] leading-[1.55] text-[#0A1628]"
                  style={{
                    backgroundColor: `${data.siteAccent || "#0C447C"}10`,
                    borderLeft: `2px solid ${data.siteAccent || "#0C447C"}`,
                  }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: data.siteAccent || "#0C447C" }}>
                    Fan angle
                  </span>
                  {data.fanAngle}
                </div>
              )}

              {data.keyPoints && data.keyPoints.length > 0 && (
                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-2">
                    Key points
                  </p>
                  <ul className="space-y-1.5">
                    {data.keyPoints.map((kp, i) => (
                      <li key={i} className="text-[14px] leading-[1.55] text-[#0A1628] pl-4 relative">
                        <span
                          className="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: data.siteAccent || "#0C447C" }}
                        />
                        {kp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.content && (
                <div className="mt-5 text-[15px] leading-[1.65] text-[#1F2937] whitespace-pre-wrap">
                  {data.content}
                </div>
              )}

              {data.tags && data.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-ds-text-secondary"
                      style={{ border: "0.5px solid hsl(var(--color-border))" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {data.dispatchedTo && data.dispatchedTo.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-2">
                    Also published in
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.dispatchedTo.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                        style={{ backgroundColor: s.accent }}
                      >
                        <span>{s.emoji}</span>
                        <span>{s.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.originalUrl && (
                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-medium text-ds-text-tertiary hover:text-[#0C447C] transition-colors"
                >
                  Read original
                  <ExternalLink size={12} strokeWidth={1.75} />
                </a>
              )}
            </article>
          )}
        </div>

        {/* Footer engagement bar */}
        {data && (
          <footer
            className="shrink-0 flex items-center gap-4 px-5 h-14"
            style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
          >
            <button className="flex items-center gap-1.5 text-[13px] text-ds-text-secondary hover:text-[#CF3B12] transition-colors">
              <Heart size={16} strokeWidth={1.75} />
              {data.loveCount ?? 0}
            </button>
            <button className="flex items-center gap-1.5 text-[13px] text-ds-text-secondary hover:text-[#0C447C] transition-colors">
              <MessageCircle size={16} strokeWidth={1.75} />
              {data.commentCount ?? 0}
            </button>
            <span className="ml-auto text-[11px] text-ds-text-tertiary">tobe.fan</span>
          </footer>
        )}
      </aside>
    </>
  );
}
