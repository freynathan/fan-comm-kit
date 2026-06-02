import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkLayout } from "@/components/admin/NetworkLayout";
import { useNetworkSites, type NetworkSite } from "@/hooks/useNetwork";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_OPTIONS, loadGoogleFont } from "@/lib/fonts";
import { Rss, Download, Check, ArrowUpDown, LayoutGrid, Image as ImageIcon, Upload, Trash2, Pencil, Loader2, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Filter = "all" | "active" | "coming_soon" | "inactive";
type SortKey = "name" | "status" | "category" | "priority";

export default function NetworkSitesPage() {
  return (
    <NetworkLayout>
      <SitesTable />
    </NetworkLayout>
  );
}

const STATUS_META: Record<string, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-green-500" },
  coming_soon: { label: "Coming Soon", dot: "bg-blue-500" },
  inactive: { label: "Inactive", dot: "bg-gray-400" },
};

function SitesTable() {
  const { sites, loading, error, refresh, setSites } = useNetworkSites();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [savedId, setSavedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [pendingGoLive, setPendingGoLive] = useState<NetworkSite | null>(null);

  const [llmsEditorOpen, setLlmsEditorOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<NetworkSite | null>(null);
  const [llmsContent, setLlmsContent] = useState("");
  const [llmsGenerating, setLlmsGenerating] = useState(false);

  const [logoSite, setLogoSite] = useState<NetworkSite | null>(null);

  const [descEditorOpen, setDescEditorOpen] = useState(false);
  const [descSite, setDescSite] = useState<NetworkSite | null>(null);
  const [descContent, setDescContent] = useState("");
  const [descGenerating, setDescGenerating] = useState(false);
  const [descIconUrl, setDescIconUrl] = useState<string | null>(null);
  const [descIconUploading, setDescIconUploading] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const openDescEditor = (site: NetworkSite) => {
    setDescSite(site);
    setDescContent(site.description ?? "");
    setDescIconUrl(site.icon_url ?? null);
    setDescEditorOpen(true);
  };

  const handleIconUpload = async (file: File) => {
    if (!descSite) return;
    setDescIconUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `icons/${descSite.slug}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-logos")
        .upload(path, file, { upsert: true, contentType: file.type || `image/${ext}`, cacheControl: "60" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("site-logos").getPublicUrl(path);
      setDescIconUrl(`${data.publicUrl}?v=${Date.now()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setDescIconUploading(false);
    }
  };

  const generateDesc = async (site: NetworkSite) => {
    setDescGenerating(true);
    try {
      const { data } = await supabase.functions.invoke("smart-service", {
        body: {
          systemPrompt: "You write short, warm, exciting community descriptions. Respond with only the description — no quotes, no preamble.",
          userMessage: `Write a 2-sentence description of ${site.name} (${site.domain ?? `${site.slug}.fan`}) — a passion community fan site for people who love ${site.slug}. Be warm, specific, and exciting. No marketing fluff.`,
          maxTokens: 120,
        },
      });
      const text = (data as { text?: string } | null)?.text?.trim() ?? "";
      setDescContent(text);
    } catch (e) {
      console.error("Description generation failed:", e);
      toast.error("AI generation failed");
    } finally {
      setDescGenerating(false);
    }
  };

  const saveDesc = async () => {
    if (!descSite) return;
    const patch: Record<string, unknown> = { description: descContent, icon_url: descIconUrl };
    const { error } = await supabase
      .from("sites" as never)
      .update(patch as never)
      .eq("id", descSite.id);
    if (error) {
      toast.error(`Save failed: ${error.message}`);
      return;
    }
    setSites((prev) =>
      prev.map((s) => (s.id === descSite.id ? { ...s, description: descContent, icon_url: descIconUrl } : s)),
    );
    setDescEditorOpen(false);
    toast.success(`Saved for ${descSite.name}`);
  };

  const openLlmsEditor = (site: NetworkSite) => {
    setEditingSite(site);
    setLlmsContent(site.llms_txt ?? "");
    setLlmsEditorOpen(true);
  };


  const generateLlmsTxt = async (site: NetworkSite) => {
    setLlmsGenerating(true);
    try {
      const { data } = await supabase.functions.invoke("smart-service", {
        body: {
          systemPrompt:
            "You are an expert in llms.txt format for AI search engines. Respond only with the llms.txt content, no explanation.",
          userMessage: `Generate an llms.txt file for this fan community website:

Site name: ${site.name}
Domain: ${site.domain}
Description: ${site.description || `A fan community for ${site.name} enthusiasts`}
Topic: ${site.name}

The llms.txt should follow this format:
# Site Name
> One sentence description

A paragraph about what the site covers and who it's for.

## Content
- Main topics covered
- Types of articles published
- Community features

## About
Part of the ToBe.fan network of passion community sites.
Contact: hello@tobe.fan

Generate a specific, useful llms.txt that helps AI search engines understand and recommend this site.`,
          maxTokens: 500,
        },
      });
      const text = (data as { text?: string } | null)?.text?.trim() ?? "";
      setLlmsContent(text);
    } catch (e) {
      console.error("llms.txt generation failed:", e);
      toast.error("AI generation failed");
    } finally {
      setLlmsGenerating(false);
    }
  };

  const saveLlmsTxt = async (siteId: string) => {
    const { error } = await supabase
      .from("sites" as never)
      .update({ llms_txt: llmsContent } as never)
      .eq("id", siteId);
    if (error) {
      console.error("Save failed:", error);
      toast.error("Save failed. Please try again.");
      return;
    }
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, llms_txt: llmsContent } : s)),
    );
    setLlmsEditorOpen(false);
    toast.success(`llms.txt saved for ${editingSite?.domain ?? editingSite?.slug}`);
  };

  const filtered = useMemo(() => {
    let list = sites;
    if (filter !== "all") list = list.filter((s) => (s.status ?? "active") === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) => s.slug.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
      );
    }
    const sorted = [...list].sort((a, b) => {
      const av = (a[sortKey] ?? "") as string | number;
      const bv = (b[sortKey] ?? "") as string | number;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sites, filter, search, sortKey, sortDir]);

  const [errorId, setErrorId] = useState<{ id: string; msg: string } | null>(null);

  const update = async (id: string, patch: Partial<NetworkSite>) => {
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const { data, error } = await supabase
      .from("sites" as never)
      .update(patch as never)
      .eq("id", id)
      .select("id");
    if (error) {
      console.error("[network] save failed", error);
      setErrorId({ id, msg: error.message });
      setTimeout(() => setErrorId((cur) => (cur?.id === id ? null : cur)), 4000);
      refresh();
      return;
    }
    if (!data || (data as unknown[]).length === 0) {
      const msg = "Blocked by RLS — make sure you are signed in as an admin and the sites UPDATE policy is in place.";
      console.error("[network] save blocked: 0 rows updated", { id, patch });
      setErrorId({ id, msg });
      setTimeout(() => setErrorId((cur) => (cur?.id === id ? null : cur)), 6000);
      refresh();
      return;
    }
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 1500);
  };

  const exportCsv = () => {
    const rows = [
      ["slug", "name", "domain", "status", "color", "category", "priority"],
      ...sites.map((s) => [
        s.slug,
        s.name,
        s.domain ?? "",
        s.status ?? "active",
        s.color ?? "",
        s.category ?? "passion",
        String(s.priority ?? 2),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tobe-fan-sites.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load sites: {error}
        <div className="mt-2 text-xs text-muted-foreground">
          Make sure the new columns (status, color, category, priority) exist on the sites table.
          See <code>scripts/network-tab-setup.sql</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search domains…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {(["all", "active", "coming_soon", "inactive"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : STATUS_META[f]?.label ?? f}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{filtered.length} sites</span>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <Th sortable onClick={() => toggleSort("name")}>Domain</Th>
              <Th sortable onClick={() => toggleSort("status")}>Status</Th>
              <Th>Color</Th>
              <Th>Font</Th>
              <Th sortable onClick={() => toggleSort("category")}>Category</Th>
              <Th sortable onClick={() => toggleSort("priority")}>Priority</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No sites match.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <SiteRow
                key={s.id}
                site={s}
                onChange={(patch) => update(s.id, patch)}
                onGoLive={() => setPendingGoLive(s)}
                saved={savedId === s.id}
                error={errorId?.id === s.id ? errorId.msg : null}
                onJump={(target) =>
                  navigate(`${target}?site=${s.slug}`)
                }
                onEditLlms={() => openLlmsEditor(s)}
                onEditLogo={() => setLogoSite(s)}
                onEditDescription={() => openDescEditor(s)}
              />
            ))}

          </tbody>
        </table>
      </div>

      {/* Go-live confirmation modal */}
      {pendingGoLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-5 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Push {pendingGoLive.domain ?? `${pendingGoLive.slug}.fan`} to Production?
              </h2>
            </div>
            <div className="px-6 py-5">
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0 mt-2" />
                  This site will go live at{" "}
                  <span className="font-medium">{pendingGoLive.domain ?? `${pendingGoLive.slug}.fan`}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0 mt-2" />
                  AI content generation will start immediately
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0 mt-2" />
                  Trending agents will include this site on next run
                </li>
              </ul>
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setPendingGoLive(null)}
                className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  update(pendingGoLive.id, { status: "active" });
                  setPendingGoLive(null);
                }}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Go Live 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {llmsEditorOpen && editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bot className="h-5 w-5 text-gray-500" /> llms.txt — {editingSite.domain ?? `${editingSite.slug}.fan`}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Tells AI search engines (Perplexity, ChatGPT, Grok) what this site is about
                </p>
              </div>
              <button
                onClick={() => setLlmsEditorOpen(false)}
                className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-gray-500">
                Served at {editingSite.domain ?? `${editingSite.slug}.fan`}/llms.txt
              </span>
              <button
                onClick={() => generateLlmsTxt(editingSite)}
                disabled={llmsGenerating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm text-purple-700 hover:bg-purple-100 disabled:opacity-50"
              >
                {llmsGenerating ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Auto-generate with AI</>
                )}
              </button>
            </div>

            <div className="px-6 py-4">
              <textarea
                value={llmsContent}
                onChange={(e) => setLlmsContent(e.target.value)}
                rows={16}
                className="w-full resize-none rounded-xl border px-4 py-3 font-mono text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder={`# ${editingSite.name}\n> A fan community for ${editingSite.name} enthusiasts.\n\nPart of the ToBe.fan network.`}
              />
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setLlmsEditorOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveLlmsTxt(editingSite.id)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {descEditorOpen && descSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-gray-500" /> {descSite.name}
                </h2>
                <p className="mt-1 text-xs text-gray-500">Icon · description · shown on site cards and /communities</p>
              </div>
              <button
                onClick={() => { setDescEditorOpen(false); setDescIconUrl(descSite.icon_url ?? null); }}
                className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Icon upload */}
            <div className="border-b px-6 py-4">
              <p className="mb-3 text-xs font-medium text-gray-700">Icon</p>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden text-xl"
                  style={descIconUrl ? undefined : {
                    backgroundColor: descSite.color ?? descSite.accent_color ?? "#888",
                    color: "#fff",
                  }}
                >
                  {descIconUrl ? (
                    <img src={descIconUrl} className="h-10 w-10 object-cover" alt="" />
                  ) : (
                    descSite.emoji ?? descSite.slug[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => iconInputRef.current?.click()}
                    disabled={descIconUploading}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {descIconUploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Upload icon</>
                    )}
                  </button>
                  {descIconUrl && descIconUrl !== (descSite.icon_url ?? null) && (
                    <span className="text-[11px] text-green-600">New icon ready — save to apply</span>
                  )}
                  <span className="text-[11px] text-gray-400">PNG, JPG, WebP, SVG · 40×40px recommended</span>
                </div>
              </div>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleIconUpload(f);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Description */}
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-gray-500">Description — 2 sentences · warm · specific</span>
              <button
                onClick={() => generateDesc(descSite)}
                disabled={descGenerating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm text-purple-700 hover:bg-purple-100 disabled:opacity-50"
              >
                {descGenerating ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Generate with AI</>
                )}
              </button>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={descContent}
                onChange={(e) => setDescContent(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder={`A fan community for people who love ${descSite.slug}. Join thousands of enthusiasts…`}
              />
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => { setDescEditorOpen(false); setDescIconUrl(descSite.icon_url ?? null); }}
                className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveDesc}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {logoSite && (
        <LogoUploadModal
          site={logoSite}
          onClose={() => setLogoSite(null)}
          onSaved={(url) => {
            setSites((prev) =>
              prev.map((s) => (s.id === logoSite.id ? { ...s, logo_url: url } : s)),
            );
            setLogoSite(null);
          }}
        />
      )}
    </div>
  );
}

function LogoUploadModal({
  site,
  onClose,
  onSaved,
}: {
  site: NetworkSite;
  onClose: () => void;
  onSaved: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [current, setCurrent] = useState<string | null>(site.logo_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${site.slug}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("site-logos")
        .upload(path, file, {
          upsert: true,
          contentType: file.type || `image/${ext}`,
          cacheControl: "60",
        });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("site-logos").getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      const { error: updErr } = await supabase
        .from("sites" as never)
        .update({ logo_url: url } as never)
        .eq("id", site.id);
      if (updErr) throw updErr;
      setCurrent(url);
      onSaved(url);
      toast.success("Logo uploaded");
    } catch (e) {
      console.error("[logo upload]", e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Upload failed. Run scripts/site-logos-setup.sql first.",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    setUploading(true);
    try {
      const { error } = await supabase
        .from("sites" as never)
        .update({ logo_url: null } as never)
        .eq("id", site.id);
      if (error) throw error;
      setCurrent(null);
      onSaved(null);
      toast.success("Logo removed");
    } catch (e) {
      console.error("[logo remove]", e);
      toast.error(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Logo — {site.name}</h2>
            <p className="mt-1 text-xs text-gray-500">
              Shown in the site header instead of the text name.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="flex h-28 items-center justify-center rounded-lg border bg-muted/30">
            {current ? (
              <img
                src={current}
                alt={`${site.name} logo`}
                className="max-h-20 max-w-full object-contain"
              />
            ) : (
              <span className="text-sm text-muted-foreground">No logo set</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              size="sm"
            >
              <Upload className="mr-1 h-4 w-4" />
              {uploading ? "Uploading…" : current ? "Replace logo" : "Upload logo"}
            </Button>
            {current && (
              <Button
                onClick={removeLogo}
                disabled={uploading}
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" /> Remove logo
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Saved to <code>site-logos/{site.slug}.[ext]</code>. PNG, JPG, WEBP or SVG.
          </p>
        </div>
      </div>
    </div>
  );
}


function Th({
  children,
  sortable,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  sortable?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2 font-medium ${sortable ? "cursor-pointer select-none" : ""} ${className}`}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </span>
    </th>
  );
}

function SiteRow({
  site,
  onChange,
  onGoLive,
  saved,
  error,
  onJump,
  onEditLlms: _onEditLlms,
  onEditLogo,
  onEditDescription,
}: {
  site: NetworkSite;
  onChange: (patch: Partial<NetworkSite>) => void;
  onGoLive: () => void;
  saved: boolean;
  error: string | null;
  onJump: (target: "/admin/network/feeds" | "/admin/network/strategy") => void;
  onEditLlms: () => void;
  onEditLogo: () => void;
  onEditDescription: () => void;
}) {

  const [color, setColor] = useState(site.color ?? site.accent_color ?? "#000000");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setColor(site.color ?? site.accent_color ?? "#000000");
  }, [site.color, site.accent_color]);

  const onColorChange = (v: string) => {
    setColor(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange({ color: v }), 300);
  };

  const status = site.status ?? "active";
  const meta = STATUS_META[status] ?? STATUS_META.active;

  return (
    <tr className="group border-t">
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded text-xs overflow-hidden"
            style={site.icon_url ? undefined : { backgroundColor: color, color: "#fff" }}
          >
            {site.icon_url ? (
              <img src={site.icon_url} className="h-6 w-6 object-cover" alt="" />
            ) : (
              site.emoji ?? site.slug[0]?.toUpperCase()
            )}
          </span>
          <span className="font-medium">{site.slug}.fan</span>
          {status === "active" && (
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
              LIVE
            </span>
          )}
          {status === "coming_soon" && (
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              DEV
            </span>
          )}
          {site.logo_url && (
            <img
              src={site.logo_url}
              alt=""
              className="hidden h-5 w-auto max-w-[80px] object-contain opacity-0 transition-opacity group-hover:inline-block group-hover:opacity-100"
            />
          )}
          {saved && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          {error && (
            <span className="ml-2 text-xs text-destructive" title={error}>
              ⚠ {error.length > 60 ? error.slice(0, 60) + "…" : error}
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-2">
        <Select
          value={status}
          onValueChange={(v) => {
            if (v === "active" && status !== "active") {
              onGoLive();
            } else {
              onChange({ status: v as NetworkSite["status"] });
            }
          }}
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue>
              <span className="inline-flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">🟢 Active</SelectItem>
            <SelectItem value="coming_soon">🔵 Coming Soon</SelectItem>
            <SelectItem value="inactive">⚫ Inactive</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-2">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span
            className="inline-block h-6 w-6 rounded-full border"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="h-6 w-10 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
      </td>
      <td className="px-4 py-2">
        <Select
          value={site.font ?? "Inter"}
          onValueChange={(v) => {
            loadGoogleFont(v);
            onChange({ font: v });
          }}
          onOpenChange={(open) => {
            if (open) FONT_OPTIONS.forEach((f) => loadGoogleFont(f));
          }}
        >
          <SelectTrigger
            className="h-8 w-[170px]"
            style={{ fontFamily: `'${site.font ?? "Inter"}', system-ui, sans-serif` }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[320px]">
            {FONT_OPTIONS.map((f) => (
              <SelectItem
                key={f}
                value={f}
                style={{ fontFamily: `'${f}', system-ui, sans-serif` }}
              >
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-2">
        <Select
          value={site.category ?? "passion"}
          onValueChange={(v) => onChange({ category: v as NetworkSite["category"] })}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passion">Passion</SelectItem>
            <SelectItem value="venue">Venue</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-2">
        <Input
          type="number"
          min={1}
          max={3}
          value={site.priority ?? 2}
          onChange={(e) => onChange({ priority: Number(e.target.value) })}
          className="h-8 w-16"
        />
      </td>
      <td className="px-4 py-2 text-right">
        <div className="inline-flex gap-1">
          <Button asChild size="sm" variant="ghost" title="Edit layout / sections">
            <Link to={`/admin/network/sites/${site.slug}`}>
              <LayoutGrid className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Upload logo"
            onClick={onEditLogo}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            title="Edit feeds"
            onClick={() => onJump("/admin/network/feeds")}
          >
            <Rss className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Edit description"
            onClick={onEditDescription}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
