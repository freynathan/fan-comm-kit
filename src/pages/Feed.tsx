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

interface SynopsisQueryRow {
  id: string;
  title: string;
  synopsis_content: string;
  fan_angle: string | null;
  reading_time_seconds: number;
  created_at: string;
  site_id: string | null;
  site: SiteLite | null;
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

  const [rows, setRows] = useState<SynopsisRow[]>([]);
  const [sites, setSites] = useState<SiteLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<{
    table: string;
    select: string;
    filters: string;
    order: string;
    limit: string;
    returnedCount: number;
    error: string | null;
    elapsedMs: number;
  } | null>(null);

  const SELECT_FIELDS =
    "id, title, synopsis_content, fan_angle, reading_time_seconds, created_at, site_id, site:sites!news_synopses_site_id_fkey(id, name, slug, emoji, accent_color)";

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      setLoading(true);
      const startedAt = performance.now();

      const { data, error } = await supabase
        .from("news_synopses")
        .select(SELECT_FIELDS)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      const elapsedMs = Math.round(performance.now() - startedAt);

      if (error) {
        console.error("Failed to load feed", error);
        setRows([]);
        setSites([]);
        setDebug({
          table: "news_synopses",
          select: SELECT_FIELDS,
          filters: "(none)",
          order: "created_at desc",
          limit: "(none — default 1000)",
          returnedCount: 0,
          error: error.message,
          elapsedMs,
        });
        setLoading(false);
        return;
      }

      const list = ((data ?? []) as SynopsisQueryRow[]).map((row) => ({
        ...row,
        site: row.site ?? null,
      }));

      const siteMap = new Map<string, SiteLite>();
      list.forEach((row) => {
        if (row.site?.slug) siteMap.set(row.site.slug, row.site);
      });

      setRows(list);
      setSites(Array.from(siteMap.values()));
      setDebug({
        table: "news_synopses",
        select: SELECT_FIELDS,
        filters: "(none)",
        order: "created_at desc",
        limit: "(none — default 1000)",
        returnedCount: list.length,
        error: null,
        elapsedMs,
      });
      setLoading(false);
    };

    void loadFeed();

    return () => {
      cancelled = true;
    };
  }, []);

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

          {/* Debug panel */}
          {debug && (
            <div
              className="mb-6 rounded-xl px-4 py-3 text-[11px] font-mono leading-[1.55] text-ds-text-secondary"
              style={{ border: "0.5px solid hsl(var(--color-border))", backgroundColor: "#FAFAFA" }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ds-text-tertiary">
                  Feed query debug
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    debug.error ? "text-[#B91C1C]" : "text-[#047857]"
                  }`}
                >
                  {debug.error ? "ERROR" : `${debug.returnedCount} rows · ${debug.elapsedMs}ms`}
                </span>
              </div>
              <div>
                <span className="text-ds-text-tertiary">table:</span> {debug.table}
              </div>
              <div className="break-all">
                <span className="text-ds-text-tertiary">select:</span> {debug.select}
              </div>
              <div>
                <span className="text-ds-text-tertiary">filters:</span> {debug.filters}
              </div>
              <div>
                <span className="text-ds-text-tertiary">order:</span> {debug.order}
              </div>
              <div>
                <span className="text-ds-text-tertiary">limit:</span> {debug.limit}
              </div>
              <div>
                <span className="text-ds-text-tertiary">returned rows:</span> {debug.returnedCount}
                {activeSlug && (
                  <>
                    {" "}
                    <span className="text-ds-text-tertiary">| client filter site=</span>
                    {activeSlug}{" "}
                    <span className="text-ds-text-tertiary">→</span> {filtered.length} shown
                  </>
                )}
              </div>
              {debug.error && (
                <div className="mt-1 text-[#B91C1C]">
                  <span className="text-ds-text-tertiary">error:</span> {debug.error}
                </div>
              )}
            </div>
          )}

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
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => open({ kind: "synopsis", synopsisId: r.id })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          open({ kind: "synopsis", synopsisId: r.id });
                        }
                      }}
                      className="w-full text-left rounded-xl px-5 py-5 transition-colors hover:bg-[#F5F5F7] group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C447C]"
                      style={{ border: "0.5px solid hsl(var(--color-border))" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {r.site?.slug && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: accent }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilter(r.site!.slug!);
                            }}
                          >
                            <span>{r.site.emoji}</span>
                            <span>{r.site.slug}</span>
                          </button>
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
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

        </div>
      </main>

      <SharedFooter />
    </div>
  );
}
