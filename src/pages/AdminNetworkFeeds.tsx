import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkLayout } from "@/components/admin/NetworkLayout";
import { useNetworkSites } from "@/hooks/useNetwork";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, Check } from "lucide-react";

export default function AdminNetworkFeeds() {
  return (
    <NetworkLayout>
      <FeedsPage />
    </NetworkLayout>
  );
}

const LANGS = [
  { code: "en", flag: "🇺🇸" },
  { code: "en-gb", flag: "🇬🇧" },
  { code: "fr", flag: "🇫🇷" },
  { code: "de", flag: "🇩🇪" },
  { code: "ja", flag: "🇯🇵" },
  { code: "ko", flag: "🇰🇷" },
  { code: "zh", flag: "🇨🇳" },
  { code: "pt-br", flag: "🇧🇷" },
  { code: "it", flag: "🇮🇹" },
  { code: "es", flag: "🇪🇸" },
  { code: "en-au", flag: "🇦🇺" },
  { code: "other", flag: "🌍" },
];

type Source = {
  id: string;
  site_id: string | null;
  name: string;
  url: string;
  language: string | null;
  active: boolean | null;
  last_scanned_at: string | null;
};

function FeedsPage() {
  const { sites } = useNetworkSites();
  const [searchParams] = useSearchParams();
  const [siteFilter, setSiteFilter] = useState<string>(searchParams.get("site") || "all");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const site = searchParams.get("site");
    if (site) setSiteFilter(site);
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_sources" as never)
      .select("id,site_id,name,url,language,active,last_scanned_at")
      .order("name", { ascending: true });
    if (error) setError(error.message);
    else setError(null);
    setSources(((data ?? []) as unknown) as Source[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const sitesById = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);
  const sitesBySlug = useMemo(() => new Map(sites.map((s) => [s.slug, s])), [sites]);

  const filtered = useMemo(() => {
    if (siteFilter === "all") return sources;
    const site = sitesBySlug.get(siteFilter);
    return sources.filter((s) => s.site_id === site?.id);
  }, [sources, siteFilter, sitesBySlug]);

  const grouped = useMemo(() => {
    const map = new Map<string, Source[]>();
    for (const s of filtered) {
      const key = s.site_id ?? "_unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const patch = async (id: string, p: Partial<Source>) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
    const { error } = await supabase
      .from("news_sources" as never)
      .update(p as never)
      .eq("id", id);
    if (error) {
      alert(`Save failed: ${error.message}`);
      load();
      return;
    }
    setSavedId(id);
    setTimeout(() => setSavedId((c) => (c === id ? null : c)), 1200);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this feed?")) return;
    const { error } = await supabase.from("news_sources" as never).delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load feeds: {error}
        <div className="mt-2 text-xs text-muted-foreground">
          Make sure the <code>news_sources</code> table exists. See{" "}
          <code>scripts/network-tab-setup.sql</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sites</SelectItem>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.slug}>
                {s.slug}.fan
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} feeds</span>
        <Button className="ml-auto" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Feed
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No feeds yet.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([siteId, list]) => {
            const site = sitesById.get(siteId);
            return (
              <div key={siteId} className="overflow-hidden rounded-lg border">
                <div className="bg-muted/40 px-4 py-2 text-sm font-medium">
                  {site ? `${site.slug}.fan` : "Unassigned"}{" "}
                  <span className="text-xs text-muted-foreground">({list.length})</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Source</th>
                      <th className="px-4 py-2 font-medium">URL</th>
                      <th className="px-4 py-2 font-medium">Lang</th>
                      <th className="px-4 py-2 font-medium">Active</th>
                      <th className="px-4 py-2 font-medium">Last scan</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((s) => {
                      const lang = LANGS.find((l) => l.code === s.language) ?? LANGS[0];
                      return (
                        <tr key={s.id} className="border-t">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{s.name}</span>
                              {savedId === s.id && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                  <Check className="h-3 w-3" /> Saved
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              {s.url.length > 50 ? s.url.slice(0, 50) + "…" : s.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-4 py-2">
                            <Select
                              value={s.language ?? "en"}
                              onValueChange={(v) => patch(s.id, { language: v })}
                            >
                              <SelectTrigger className="h-8 w-[80px]">
                                <SelectValue>{lang.flag}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {LANGS.map((l) => (
                                  <SelectItem key={l.code} value={l.code}>
                                    {l.flag} {l.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-2">
                            <Switch
                              checked={!!s.active}
                              onCheckedChange={(v) => patch(s.id, { active: v })}
                            />
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">
                            {s.last_scanned_at
                              ? new Date(s.last_scanned_at).toLocaleString()
                              : "Never"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => remove(s.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      <AddFeedModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          load();
        }}
        sites={sites}
      />
    </div>
  );
}

function AddFeedModal({
  open,
  onClose,
  onCreated,
  sites,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  sites: ReturnType<typeof useNetworkSites>["sites"];
}) {
  const [siteId, setSiteId] = useState<string>("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string[] | null>(null);
  const [previewErr, setPreviewErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSiteId("");
      setName("");
      setUrl("");
      setLanguage("en");
      setPreview(null);
      setPreviewErr(null);
    }
  }, [open]);

  const test = async () => {
    setPreview(null);
    setPreviewErr(null);
    if (!url.trim()) return;
    try {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      const text = await res.text();
      const titles: string[] = [];
      const re = /<title[^>]*>([\s\S]*?)<\/title>/gi;
      let m: RegExpExecArray | null;
      let i = 0;
      while ((m = re.exec(text)) && i < 4) {
        const t = m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        if (i > 0) titles.push(t);
        i++;
      }
      if (!titles.length) setPreviewErr("No titles found in feed.");
      else setPreview(titles.slice(0, 3));
    } catch (e) {
      setPreviewErr(e instanceof Error ? e.message : "Failed to fetch");
    }
  };

  const save = async () => {
    if (!siteId || !name.trim() || !url.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("news_sources" as never).insert({
      site_id: siteId,
      name: name.trim(),
      url: url.trim(),
      language,
      active: true,
    } as never);
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add RSS Feed</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Site</label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.slug}.fan
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Source name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">RSS URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="text-xs font-medium">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.flag} {l.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={test} disabled={!url}>
              Test feed
            </Button>
            {preview && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                {preview.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
            {previewErr && <p className="mt-2 text-xs text-destructive">{previewErr}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy || !siteId || !name || !url}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
