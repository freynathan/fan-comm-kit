import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, Check, X as XIcon, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useArticleDrawer } from "@/components/article";
import { toast } from "sonner";

type Tab = "queue" | "dispatch" | "sources";

interface PipelineStats {
  scanned24h: number;
  pending: number;
  approved: number;
  published: number;
  failed: number;
}

interface QueueArticle {
  id: string;
  original_title: string;
  original_url: string;
  original_author: string | null;
  original_published_at: string | null;
  relevance_score: number;
  quality_score: number;
  status: string;
  is_duplicate: boolean;
  created_at: string;
  site: { name: string; emoji: string; accent_color: string } | null;
  source: { source_name: string } | null;
}

interface DispatchRow {
  id: string;
  dispatched_at: string;
  synopsis: { id: string; title: string } | null;
  source_site: { name: string; emoji: string; accent_color: string } | null;
  dispatched_to: { name: string; emoji: string; accent_color: string } | null;
  status: string;
}

interface NewsSource {
  id: string;
  source_name: string;
  source_url: string;
  source_type: string;
  reliability_score: number;
  is_active: boolean;
  last_scanned_at: string | null;
  site_id: string | null;
  site: { name: string; emoji: string; accent_color: string } | null;
}

export default function DashboardContent() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-ds-text-tertiary" size={20} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Content pipeline · tobe.fan dashboard</title>
        <meta name="description" content="Manage news ingestion, AI synopses, dispatching, and sources across the tobe.fan network." />
      </Helmet>
      <DashboardLayout user={user}>
        <ContentPanel />
      </DashboardLayout>
    </>
  );
}

function ContentPanel() {
  const [tab, setTab] = useState<Tab>("queue");
  const [stats, setStats] = useState<PipelineStats>({ scanned24h: 0, pending: 0, approved: 0, published: 0, failed: 0 });

  const loadStats = async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [scanned, pending, approved, published, failed] = await Promise.all([
      supabase.from("news_articles").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    ]);
    setStats({
      scanned24h: scanned.count ?? 0,
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      published: published.count ?? 0,
      failed: failed.count ?? 0,
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#0C447C" }}>
          Content pipeline
        </p>
      </div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-[#0A1628] leading-[1.15]" style={{ letterSpacing: "-0.01em" }}>
        News & synopses
      </h1>
      <p className="mt-1 text-[14px] text-ds-text-tertiary">
        Monitor scanning, review AI synopses, and dispatch to communities.
      </p>

      {/* Pipeline stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatTile label="Scanned 24h" value={stats.scanned24h} />
        <StatTile label="Pending" value={stats.pending} accent="#B7683B" />
        <StatTile label="Approved" value={stats.approved} accent="#2D7A3E" />
        <StatTile label="Published" value={stats.published} accent="#0C447C" />
        <StatTile label="Failed" value={stats.failed} accent="#9A031E" />
      </div>

      {/* Tabs */}
      <div
        className="mt-8 flex items-center gap-1 overflow-x-auto"
        style={{ borderBottom: "0.5px solid hsl(var(--color-border))" }}
      >
        {([
          { id: "queue", label: "Article queue" },
          { id: "dispatch", label: "Dispatch log" },
          { id: "sources", label: "Active sources" },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 h-10 text-[13px] font-medium transition-colors whitespace-nowrap relative ${
              tab === t.id ? "text-[#0C447C]" : "text-ds-text-tertiary hover:text-[#0A1628]"
            }`}
            style={tab === t.id ? { boxShadow: "inset 0 -2px 0 0 #0C447C" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "queue" && <QueueTab onChange={loadStats} />}
        {tab === "dispatch" && <DispatchTab />}
        {tab === "sources" && <SourcesTab />}
      </div>
    </div>
  );
}

function StatTile({ label, value, accent = "#0A1628" }: { label: string; value: number; accent?: string }) {
  return (
    <div
      className="rounded-lg px-3 py-3 md:px-4 md:py-4"
      style={{ border: "0.5px solid hsl(var(--color-border))" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ds-text-tertiary">{label}</p>
      <p className="mt-1 text-[22px] md:text-[26px] font-semibold leading-none" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

/* === Article queue === */
function QueueTab({ onChange }: { onChange: () => void }) {
  const [articles, setArticles] = useState<QueueArticle[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { open } = useArticleDrawer();

  const load = async () => {
    let q = supabase
      .from("news_articles")
      .select(`
        id, original_title, original_url, original_author, original_published_at,
        relevance_score, quality_score, status, is_duplicate, created_at,
        site:sites!news_articles_site_id_fkey ( name, emoji, accent_color ),
        source:news_sources!news_articles_source_id_fkey ( source_name )
      `)
      .order("created_at", { ascending: false })
      .limit(50);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data, error } = await q;
    if (error) {
      toast.error("Couldn't load articles");
      return;
    }
    setArticles((data ?? []) as any);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("news_articles").update({ status }).eq("id", id);
    if (error) {
      toast.error("Update failed");
      return;
    }
    toast.success(`Marked ${status}`);
    await load();
    onChange();
  };

  if (articles === null) {
    return <SkeletonRows />;
  }

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {["all", "pending", "approved", "published", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 h-7 rounded-full text-[11px] font-medium capitalize transition-colors whitespace-nowrap ${
              statusFilter === s
                ? "text-white"
                : "text-ds-text-secondary hover:text-[#0A1628]"
            }`}
            style={
              statusFilter === s
                ? { backgroundColor: "#0C447C" }
                : { border: "0.5px solid hsl(var(--color-border))" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <EmptyBlock label="No articles in queue." />
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: "0.5px solid hsl(var(--color-border))" }}>
          {articles.map((a, i) => (
            <div
              key={a.id}
              className="px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
              style={i > 0 ? { borderTop: "0.5px solid hsl(var(--color-border))" } : undefined}
            >
              <div className="flex items-start gap-3">
                {a.site && (
                  <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px]"
                    style={{ backgroundColor: `${a.site.accent_color}15` }}
                  >
                    {a.site.emoji}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => open({ kind: "article", articleId: a.id })}
                    className="text-left text-[14px] font-medium text-[#0A1628] hover:text-[#0C447C] transition-colors line-clamp-2 leading-[1.4]"
                  >
                    {a.original_title}
                  </button>
                  <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-ds-text-tertiary">
                    {a.source?.source_name && <span>{a.source.source_name}</span>}
                    {a.original_author && <><span>·</span><span>{a.original_author}</span></>}
                    <span>·</span>
                    <span>{relativeTime(a.created_at)}</span>
                    {a.is_duplicate && (
                      <>
                        <span>·</span>
                        <span style={{ color: "#9A031E" }}>duplicate</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                    <span className="text-ds-text-tertiary">
                      Relevance <span className="text-[#0A1628] font-medium">{Math.round(a.relevance_score * 100) / 100}</span>
                    </span>
                    <span className="text-ds-text-tertiary">
                      Quality <span className="text-[#0A1628] font-medium">{Math.round(a.quality_score * 100) / 100}</span>
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <a
                    href={a.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#F5F5F7] text-ds-text-tertiary"
                    aria-label="Open original"
                  >
                    <ExternalLink size={13} strokeWidth={1.75} />
                  </a>
                  {a.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(a.id, "approved")}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#E8F4EA] text-[#2D7A3E]"
                        aria-label="Approve"
                      >
                        <Check size={14} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, "rejected")}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#FBEAEA] text-[#9A031E]"
                        aria-label="Reject"
                      >
                        <XIcon size={14} strokeWidth={2} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* === Dispatch log === */
function DispatchTab() {
  const [rows, setRows] = useState<DispatchRow[] | null>(null);
  const { open } = useArticleDrawer();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("news_synopses")
        .select(`
          id, title, created_at, article_id,
          site:sites!news_synopses_site_id_fkey ( name, emoji, accent_color ),
          dispatches:content_dispatches!content_dispatches_synopsis_id_fkey (
            id, dispatched_at,
            dispatched_to:sites!content_dispatches_dispatched_to_site_id_fkey ( name, emoji, accent_color )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) {
        toast.error("Couldn't load dispatch log");
        setRows([]);
        return;
      }
      const flattened: DispatchRow[] = (data ?? []).map((s: any) => ({
        id: s.id,
        dispatched_at: s.dispatches?.[0]?.dispatched_at ?? s.created_at,
        synopsis: { id: s.id, title: s.title },
        source_site: s.site,
        dispatched_to: null,
        status: "published",
      }));
      // Use the raw with all dispatch sites for rendering
      const rich = (data ?? []).map((s: any) => ({
        synopsis_id: s.id,
        title: s.title,
        when: s.created_at,
        source_site: s.site,
        targets: (s.dispatches ?? []).map((d: any) => d.dispatched_to).filter(Boolean),
      }));
      // Replace state shape with a simpler one carried via closure render below
      (DispatchTab as any)._rich = rich;
      setRows(flattened);
    })();
  }, []);

  if (rows === null) return <SkeletonRows />;
  if (rows.length === 0) return <EmptyBlock label="No dispatches yet." />;

  const rich: { synopsis_id: string; title: string; when: string; source_site: any; targets: any[] }[] =
    (DispatchTab as any)._rich || [];

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "0.5px solid hsl(var(--color-border))" }}>
      {rich.map((r, i) => (
        <div
          key={r.synopsis_id}
          className="px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
          style={i > 0 ? { borderTop: "0.5px solid hsl(var(--color-border))" } : undefined}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#0A1628] line-clamp-1 leading-[1.4]">{r.title}</p>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                {r.source_site && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: r.source_site.accent_color || "#0C447C" }}
                  >
                    <span>{r.source_site.emoji}</span>
                    <span>{r.source_site.name}</span>
                  </span>
                )}
                {r.targets.length > 0 && (
                  <>
                    <span className="text-[10px] text-ds-text-tertiary">→</span>
                    {r.targets.slice(0, 3).map((t, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: t.accent_color || "#0C447C" }}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.name}</span>
                      </span>
                    ))}
                    {r.targets.length > 3 && (
                      <span className="text-[10px] text-ds-text-tertiary">+{r.targets.length - 3}</span>
                    )}
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] text-ds-text-tertiary">{relativeTime(r.when)}</p>
            </div>
            <button
              onClick={() => open({ kind: "synopsis", synopsisId: r.synopsis_id })}
              className="shrink-0 text-[12px] font-medium text-[#0C447C] hover:underline"
            >
              View →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* === Sources === */
function SourcesTab() {
  const [sources, setSources] = useState<NewsSource[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data, error } = await supabase
      .from("news_sources")
      .select(`
        id, source_name, source_url, source_type, reliability_score, is_active, last_scanned_at, site_id,
        site:sites!news_sources_site_id_fkey ( name, emoji, accent_color )
      `)
      .order("source_name", { ascending: true });
    if (error) {
      toast.error("Couldn't load sources");
      return;
    }
    setSources((data ?? []) as any);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSource = async (s: NewsSource) => {
    const next = !s.is_active;
    setSources((prev) => prev?.map((x) => (x.id === s.id ? { ...x, is_active: next } : x)) ?? null);
    const { error } = await supabase.from("news_sources").update({ is_active: next }).eq("id", s.id);
    if (error) {
      toast.error("Toggle failed");
      load();
    }
  };

  const grouped = useMemo(() => {
    if (!sources) return [];
    const map = new Map<string, { siteKey: string; site: NewsSource["site"]; items: NewsSource[] }>();
    for (const s of sources) {
      const key = s.site_id ?? "ungrouped";
      if (!map.has(key)) map.set(key, { siteKey: key, site: s.site, items: [] });
      map.get(key)!.items.push(s);
    }
    return Array.from(map.values());
  }, [sources]);

  if (sources === null) return <SkeletonRows />;
  if (sources.length === 0) return <EmptyBlock label="No active sources." />;

  return (
    <div className="space-y-2">
      {grouped.map((g) => {
        const isOpen = expanded[g.siteKey] ?? true;
        return (
          <div
            key={g.siteKey}
            className="rounded-lg overflow-hidden"
            style={{ border: "0.5px solid hsl(var(--color-border))" }}
          >
            <button
              onClick={() => setExpanded((e) => ({ ...e, [g.siteKey]: !isOpen }))}
              className="w-full flex items-center gap-2 px-4 h-11 text-left hover:bg-[#FAFAFA]"
            >
              {isOpen ? <ChevronDown size={14} className="text-ds-text-tertiary" /> : <ChevronRight size={14} className="text-ds-text-tertiary" />}
              {g.site && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
                  style={{ backgroundColor: `${g.site.accent_color}15` }}
                >
                  {g.site.emoji}
                </div>
              )}
              <span className="text-[13px] font-medium text-[#0A1628]">
                {g.site?.name ?? "Other"}
              </span>
              <span className="text-[11px] text-ds-text-tertiary">{g.items.length}</span>
            </button>
            {isOpen && (
              <div>
                {g.items.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#0A1628] truncate">{s.source_name}</p>
                      <p className="text-[11px] text-ds-text-tertiary truncate">{s.source_url}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1 rounded-full bg-[#F0F0F0] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, s.reliability_score * 100))}%`,
                                backgroundColor: s.reliability_score >= 0.7 ? "#2D7A3E" : s.reliability_score >= 0.4 ? "#B7683B" : "#9A031E",
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-ds-text-tertiary">
                            {Math.round(s.reliability_score * 100)}%
                          </span>
                        </div>
                        <span className="text-[10px] text-ds-text-tertiary flex items-center gap-1">
                          <RefreshCw size={9} strokeWidth={1.75} />
                          {s.last_scanned_at ? relativeTime(s.last_scanned_at) : "never"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSource(s)}
                      role="switch"
                      aria-checked={s.is_active}
                      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                        s.is_active ? "bg-[#0C447C]" : "bg-[#D4D4D4]"
                      }`}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                        style={{ transform: s.is_active ? "translateX(16px)" : "translateX(0)" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#FBF1E7", fg: "#B7683B" },
    approved: { bg: "#E8F4EA", fg: "#2D7A3E" },
    published: { bg: "#E6EEF7", fg: "#0C447C" },
    rejected: { bg: "#FBEAEA", fg: "#9A031E" },
  };
  const c = map[status] ?? { bg: "#F0F0F0", fg: "#3D3D3D" };
  return (
    <span
      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {status}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-lg bg-[#F5F5F7] animate-pulse" />
      ))}
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div
      className="rounded-lg px-4 py-8 text-center text-[13px] text-ds-text-tertiary"
      style={{ border: "0.5px dashed hsl(var(--color-border))" }}
    >
      {label}
    </div>
  );
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
