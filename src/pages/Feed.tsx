import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SharedHeader } from "@/components/shared/SharedHeader";
import { SharedFooter } from "@/components/shared/SharedFooter";
import { useArticleDrawer } from "@/components/article";

interface SiteLite {
  id: string;
  name: string;
  slug: string | null;
  emoji: string;
  accent_color: string;
}

interface SynopsisRow {
  id: string;
  title: string;
  synopsis_content: string;
  fan_angle: string | null;
  reading_time_seconds: number;
  created_at: string;
  site_id: string | null;
  site: SiteLite | null;
}

interface SynopsisRecord {
  id: string;
  title: string;
  synopsis_content: string;
  fan_angle: string | null;
  reading_time_seconds: number;
  created_at: string;
  site_id: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("site");
  const { open } = useArticleDrawer();

  const PAGE_SIZE = 30;
  const [rows, setRows] = useState<SynopsisRow[]>([]);
  const [sites, setSites] = useState<SiteLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = async (cursor: string | null) => {
    let q = supabase
      .from("news_synopses")
      .select("id, title, synopsis_content, fan_angle, reading_time_seconds, created_at, site_id")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (cursor) q = q.lt("created_at", cursor);
    const { data } = await q;
    const synopses = (data ?? []) as SynopsisRecord[];

    const siteIds = Array.from(new Set(synopses.map((row) => row.site_id).filter(Boolean))) as string[];
    const { data: siteRows } = siteIds.length
      ? await supabase
          .from("sites")
          .select("id, name, slug, emoji, accent_color")
          .in("id", siteIds)
      : { data: [] as SiteLite[] };

    const siteById = new Map((siteRows ?? []).map((site) => [site.id, site]));
    return synopses.map((row) => ({
      ...row,
      site: row.site_id ? siteById.get(row.site_id) ?? null : null,
    }));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHasMore(true);
    (async () => {
      const list = await fetchPage(null);
      if (cancelled) return;
      setRows(list);
      setHasMore(list.length === PAGE_SIZE);

      const map = new Map<string, SiteLite>();
      list.forEach((r) => {
        if (r.site && r.site.slug) map.set(r.site.slug, r.site);
      });
      setSites(Array.from(map.values()));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore || rows.length === 0) return;
    setLoadingMore(true);
    const cursor = rows[rows.length - 1].created_at;
    const more = await fetchPage(cursor);
    setRows((prev) => {
      const seen = new Set(prev.map((r) => r.id));
      const dedup = more.filter((r) => !seen.has(r.id));
      return [...prev, ...dedup];
    });
    setHasMore(more.length === PAGE_SIZE);
    setSites((prev) => {
      const map = new Map(prev.map((s) => [s.slug!, s]));
      more.forEach((r) => {
        if (r.site && r.site.slug && !map.has(r.site.slug)) map.set(r.site.slug, r.site);
      });
      return Array.from(map.values());
    });
    setLoadingMore(false);
  };

  const filtered = useMemo(() => {
    if (!activeSlug) return rows;
    return rows.filter((r) => r.site?.slug === activeSlug);
  }, [rows, activeSlug]);

  const setFilter = (slug: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("site", slug);
    else next.delete("site");
    setSearchParams(next, { replace: false });
  };

  return (
    <div className="min-h-screen bg-ds-bg flex flex-col">
      <Helmet>
        <title>{activeSlug ? `${activeSlug} feed` : "Feed"} — ToBe.fan</title>
        <meta
          name="description"
          content="The latest stories across every passion on ToBe.fan."
        />
      </Helmet>

      <SharedHeader
        siteName="tobe"
        siteEmoji="⭐"
        accentColor="hsl(var(--color-accent))"
        aiFeatureLabel="AI Relate"
      />

      <main className="flex-1 w-full px-6" style={{ paddingTop: 64, paddingBottom: 80 }}>
        <div className="max-w-[960px] mx-auto">
          <header className="mb-8">
            <h1 className="text-[32px] md:text-[40px] font-semibold leading-[1.15] tracking-[-0.5px] text-ds-text-primary">
              {activeSlug ? `${activeSlug}` : "The Feed"}
            </h1>
            <p className="mt-2 text-[14px] text-ds-text-tertiary">
              {activeSlug
                ? `Latest stories from ${activeSlug}`
                : "Latest stories across every passion."}
            </p>
          </header>

          {/* Filter chips */}
          {sites.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              <button
                type="button"
                onClick={() => setFilter(null)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  !activeSlug
                    ? "bg-ds-text-primary text-white"
                    : "text-ds-text-secondary hover:text-ds-text-primary"
                }`}
                style={!activeSlug ? undefined : { border: "0.5px solid hsl(var(--color-border))" }}
              >
                All
              </button>
              {sites.map((s) => {
                const active = activeSlug === s.slug;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFilter(s.slug)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
                    style={
                      active
                        ? { backgroundColor: s.accent_color, color: "#fff" }
                        : { border: "0.5px solid hsl(var(--color-border))", color: "hsl(var(--color-text-secondary))" }
                    }
                  >
                    <span>{s.emoji}</span>
                    <span>{s.slug}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 w-full rounded-xl bg-[#F5F5F7] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-xl px-6 py-12 text-center"
              style={{ border: "0.5px solid hsl(var(--color-border))" }}
            >
              <p className="text-[14px] text-ds-text-secondary">
                {activeSlug
                  ? `No posts yet for ${activeSlug}.`
                  : "No posts yet. Check back soon."}
              </p>
              {activeSlug && (
                <button
                  onClick={() => setFilter(null)}
                  className="mt-3 text-[12px] font-medium text-ds-text-tertiary hover:text-ds-text-primary"
                >
                  ← View all posts
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((r) => {
                const accent = r.site?.accent_color || "#0C447C";
                const minutes = Math.max(1, Math.round((r.reading_time_seconds || 0) / 60));
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => open({ kind: "synopsis", synopsisId: r.id })}
                      className="w-full text-left rounded-xl px-5 py-5 transition-colors hover:bg-[#F5F5F7] group"
                      style={{ border: "0.5px solid hsl(var(--color-border))" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {r.site?.slug && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                            style={{ backgroundColor: accent }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilter(r.site!.slug!);
                            }}
                          >
                            <span>{r.site.emoji}</span>
                            <span>{r.site.slug}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-ds-text-tertiary">
                          {timeAgo(r.created_at)} · {minutes} min read
                        </span>
                      </div>
                      <h2 className="text-[16px] md:text-[17px] font-medium leading-[1.35] text-ds-text-primary group-hover:text-[#0C447C] transition-colors">
                        {r.title}
                      </h2>
                      {r.synopsis_content && (
                        <p className="mt-1.5 text-[13px] leading-[1.55] text-ds-text-secondary line-clamp-2">
                          {r.synopsis_content}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && filtered.length > 0 && hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center rounded-full px-5 py-2 text-[13px] font-medium text-ds-text-primary transition-colors hover:bg-[#F5F5F7] disabled:opacity-50"
                style={{ border: "0.5px solid hsl(var(--color-border))" }}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && !hasMore && (
            <p className="mt-8 text-center text-[12px] text-ds-text-tertiary">
              You're all caught up.
            </p>
          )}
        </div>
      </main>

      <SharedFooter />
    </div>
  );
}
