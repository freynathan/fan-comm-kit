import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ExternalLink, Upload, Search, Sparkles,
  RefreshCw, Plus, Scissors, MessageSquare, FileText,
  Loader2, X, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RichTextEditor } from "./RichTextEditor";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  site_id: string;
  author_id: string | null;
  content: string | null;
  content_type: string | null;
  status: string;
  slug: string | null;
  title: string | null;
  excerpt: string | null;
  hero_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[] | null;
  created_at: string;
  ai_analysis: Record<string, unknown> | null;
  site?: { name: string; slug: string; domain: string | null; emoji: string | null } | null;
}

interface UnsplashPhoto {
  id: string;
  thumb: string;
  full: string;
  credit: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TONES = ["journalistic", "conversational", "editorial"] as const;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const directKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (directKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": directKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = (await res.json()) as { content?: Array<{ text: string }> };
    return data.content?.[0]?.text ?? "";
  }
  // Fallback: smart-service edge function
  const { data, error } = await supabase.functions.invoke("smart-service", {
    body: { systemPrompt, userMessage, maxTokens: 1000 },
  });
  if (error) throw error;
  return (data as { text?: string })?.text ?? "";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArticleEditor({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [heroImage, setHeroImage] = useState<string | null>(null);

  // Save state
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for stable timer closure
  const postRef = useRef<Post | null>(null);
  const saveDataRef = useRef({ title, content, excerpt, slug, seoTitle, seoDesc, tagsRaw, heroImage });

  // AI
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [toneIdx, setToneIdx] = useState(0);

  // Unsplash
  const [unsplashOpen, setUnsplashOpen] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);

  // Image upload
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Load post ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts" as never)
        .select("id, site_id, author_id, content, content_type, status, slug, title, excerpt, hero_image, seo_title, seo_description, tags, created_at, ai_analysis, site:sites(name, slug, domain, emoji)")
        .eq("id", postId)
        .maybeSingle();
      if (error || !data) {
        toast.error("Failed to load post");
        setLoading(false);
        return;
      }
      const p = data as unknown as Post;
      postRef.current = p;
      setPost(p);
      setTitle(p.title ?? "");
      setContent(p.content ?? "");
      setExcerpt(p.excerpt ?? "");
      setSlug(p.slug ?? "");
      setSeoTitle(p.seo_title ?? "");
      setSeoDesc(p.seo_description ?? "");
      setTagsRaw((p.tags ?? []).join(", "));
      setHeroImage(p.hero_image ?? null);
      setUnsplashQuery(p.title ?? "");
      setLoading(false);
    })();
  }, [postId]);

  // Keep ref current
  useEffect(() => {
    saveDataRef.current = { title, content, excerpt, slug, seoTitle, seoDesc, tagsRaw, heroImage };
  }, [title, content, excerpt, slug, seoTitle, seoDesc, tagsRaw, heroImage]);

  // ── Auto-save: 3s debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (!post || loading) return;
    setSaveState("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { void doSave(); }, 3000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, excerpt, slug, seoTitle, seoDesc, tagsRaw, heroImage]);

  const doSave = useCallback(async () => {
    const p = postRef.current;
    if (!p) return;
    const { title, content, excerpt, slug, seoTitle, seoDesc, tagsRaw, heroImage } = saveDataRef.current;
    setSaveState("saving");
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const { error } = await supabase
      .from("posts" as never)
      .update({
        title, content, excerpt,
        slug: slug || null,
        seo_title: seoTitle || null,
        seo_description: seoDesc || null,
        tags,
        hero_image: heroImage ?? null,
      } as never)
      .eq("id", p.id);
    if (error) {
      setSaveState("unsaved");
      toast.error("Save failed");
      return;
    }
    setSaveState("saved");
  }, []);

  const saveNow = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    void doSave();
  };

  // ── Status actions ─────────────────────────────────────────────────────────
  const updateStatus = async (newStatus: string) => {
    if (!post) return;
    const { error } = await supabase
      .from("posts" as never)
      .update({ status: newStatus } as never)
      .eq("id", post.id);
    if (error) { toast.error("Status update failed"); return; }
    const updated = { ...post, status: newStatus };
    setPost(updated);
    postRef.current = updated;
    toast.success(newStatus === "approved" ? "Approved ✓" : newStatus === "rejected" ? "Rejected" : "Updated");
  };

  // ── Hero image upload ──────────────────────────────────────────────────────
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("post-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      setHeroImage(data.publicUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Unsplash search ────────────────────────────────────────────────────────
  const searchUnsplash = async () => {
    const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
    if (!key) { toast.error("VITE_UNSPLASH_ACCESS_KEY not configured"); return; }
    if (!unsplashQuery.trim()) return;
    setUnsplashLoading(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(unsplashQuery)}&per_page=12&client_id=${key}`
      );
      const data = (await res.json()) as { results: Array<{ id: string; urls: { small: string; regular: string }; user: { name: string } }> };
      setUnsplashResults((data.results ?? []).map((p) => ({
        id: p.id, thumb: p.urls.small, full: p.urls.regular, credit: p.user.name,
      })));
    } catch {
      toast.error("Unsplash search failed");
    } finally {
      setUnsplashLoading(false);
    }
  };

  // ── AI actions ─────────────────────────────────────────────────────────────
  const aiAction = async (action: "rewrite" | "expand" | "shorten" | "tone" | "excerpt") => {
    if (!content && action !== "excerpt") return;
    setAiLoading(action);
    try {
      const sys = "You are an expert editor. Respond with ONLY the improved content, no preamble or explanation.";
      if (action === "rewrite") {
        const result = await callAI(sys, `Rewrite this article in the same style, improving clarity and engagement. Keep the same length:\n\n${content}`);
        setContent(result);
      } else if (action === "expand") {
        const result = await callAI(sys, `Add 2 more paragraphs to expand on the key points of this article:\n\n${content}`);
        setContent(content + "\n\n" + result);
      } else if (action === "shorten") {
        const result = await callAI(sys, `Condense this article by 30%, keeping the most important information:\n\n${content}`);
        setContent(result);
      } else if (action === "tone") {
        const nextTone = TONES[(toneIdx + 1) % TONES.length];
        const result = await callAI(sys, `Rewrite this article in a ${nextTone} tone:\n\n${content}`);
        setContent(result);
        setToneIdx((i) => (i + 1) % TONES.length);
      } else if (action === "excerpt") {
        const result = await callAI(
          "You write compelling article excerpts. Respond with ONLY the 2-sentence excerpt — no quotes, no preamble.",
          `Write a compelling 2-sentence excerpt for this article titled "${title}":\n\n${content || title}`
        );
        setExcerpt(result);
      }
    } catch {
      toast.error("AI action failed");
    } finally {
      setAiLoading(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[1280px] items-center justify-center bg-white shadow-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (!post) return null;

  const domain = post.site?.domain ?? `${post.site?.slug}.fan`;
  const liveUrl = `https://${domain}/articles/${slug || post.slug || ""}`;
  const sourceUrl = post.ai_analysis?.source_url as string | undefined;
  const origLang = post.ai_analysis?.original_language as string | undefined;

  const statusColor = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    published: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
  }[post.status] ?? "bg-gray-100 text-gray-600";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[1280px] flex-col bg-white shadow-2xl">

        {/* Header bar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500" />
            Back to {post.site?.name ?? "admin"}
          </button>
          <div className="flex items-center gap-5">
            {saveState === "saving" && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" /> Saving…
              </span>
            )}
            {saveState === "saved" && (
              <span className="flex items-center gap-1.5 text-xs text-green-600">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
            {saveState === "unsaved" && (
              <span className="text-xs text-gray-400">Unsaved changes</span>
            )}
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              View live <ExternalLink className="h-4 w-4 text-gray-500" />
            </a>
          </div>
        </div>

        {/* Body: two columns */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left column (2/3) ── */}
          <div className="flex-1 overflow-y-auto p-8 min-w-0">

            {/* Hero image */}
            <div className="mb-6">
              {heroImage ? (
                <div className="relative mb-3 overflow-hidden rounded-xl group" style={{ height: 220 }}>
                  <img src={heroImage} className="h-full w-full object-cover" alt="" />
                  <button
                    onClick={() => setHeroImage(null)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400"
                  style={{ height: 120 }}>
                  No hero image
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setUnsplashOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                >
                  <Search className="h-3.5 w-3.5 text-gray-500" /> Search Unsplash
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                    : <Upload className="h-3.5 w-3.5 text-gray-500" />}
                  Upload image
                </button>
                <input
                  ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
                />
              </div>

              {/* Unsplash panel */}
              {unsplashOpen && (
                <div className="mt-3 rounded-xl border bg-gray-50 p-4">
                  <div className="mb-3 flex gap-2">
                    <input
                      value={unsplashQuery}
                      onChange={(e) => setUnsplashQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") void searchUnsplash(); }}
                      placeholder="Search photos…"
                      className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <button
                      onClick={() => void searchUnsplash()}
                      disabled={unsplashLoading}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                      {unsplashLoading
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : "Search"}
                    </button>
                  </div>
                  {unsplashResults.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {unsplashResults.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => { setHeroImage(img.full); setUnsplashOpen(false); }}
                          className="relative overflow-hidden rounded-lg group"
                          title={`Photo by ${img.credit}`}
                        >
                          <img src={img.thumb} className="h-20 w-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) setSlug(slugify(e.target.value));
              }}
              placeholder="Article title…"
              className="mb-6 w-full border-0 bg-transparent text-[28px] font-bold leading-tight text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-0"
            />

            {/* AI toolbar */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {([
                { id: "rewrite",  icon: RefreshCw,      label: "Rewrite"           },
                { id: "expand",   icon: Plus,           label: "Expand"            },
                { id: "shorten",  icon: Scissors,       label: "Shorten"           },
                { id: "tone",     icon: MessageSquare,  label: `Tone: ${TONES[toneIdx]}` },
                { id: "excerpt",  icon: FileText,       label: "Generate excerpt"  },
              ] as const).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => void aiAction(id)}
                  disabled={!!aiLoading}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
                >
                  {aiLoading === id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Icon className="h-3.5 w-3.5 text-gray-500" />}
                  {label}
                </button>
              ))}
              {aiLoading && (
                <span className="ml-1 text-xs text-purple-500">AI working…</span>
              )}
            </div>

            {/* Content editor */}
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* ── Right column (1/3) ── */}
          <div className="w-[340px] shrink-0 overflow-y-auto border-l bg-gray-50/50 p-6">

            {/* Status + action buttons */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColor}`}>
                  {post.status}
                </span>
              </div>
              {post.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => void updateStatus("approved")}
                    className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => void updateStatus("rejected")}
                    className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              )}
              {post.status === "approved" && (
                <button
                  onClick={() => void updateStatus("pending")}
                  className="w-full rounded-lg border py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Unpublish
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Site */}
              {post.site && (
                <div>
                  <Label>Site</Label>
                  <p className="mt-1 text-sm text-gray-700">{post.site.name}.fan</p>
                </div>
              )}

              {/* Slug */}
              <div>
                <Label>Slug</Label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Excerpt</Label>
                  <button
                    onClick={() => void aiAction("excerpt")}
                    disabled={!!aiLoading}
                    className="flex items-center gap-0.5 text-[10px] text-purple-600 hover:text-purple-700 disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" /> Generate
                  </button>
                </div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>

              {/* SEO Title */}
              <div>
                <Label>SEO Title</Label>
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>

              {/* SEO Description */}
              <div>
                <Label>SEO Description</Label>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <input
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="fashion, luxury, trends"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <p className="mt-0.5 text-[10px] text-gray-400">Comma-separated</p>
              </div>

              {/* Source URL */}
              {sourceUrl && (
                <div>
                  <Label>Source URL</Label>
                  <a
                    href={sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-1 block truncate text-xs text-blue-600 hover:underline"
                  >
                    {sourceUrl}
                  </a>
                </div>
              )}

              {/* Original language */}
              {origLang && (
                <div>
                  <Label>Original Language</Label>
                  <p className="mt-1 text-sm capitalize text-gray-700">{origLang}</p>
                </div>
              )}

              {/* Created at */}
              <div>
                <Label>Created</Label>
                <p className="mt-1 text-sm text-gray-700">{fmtDate(post.created_at)}</p>
              </div>
            </div>

            {/* Save button */}
            <div className="mt-6 border-t pt-4">
              <button
                onClick={saveNow}
                disabled={saveState === "saving"}
                className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{children}</p>
  );
}
