import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkLayout } from "@/components/admin/NetworkLayout";
import { useNetworkSites } from "@/hooks/useNetwork";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
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
import { Plus, Trash2, Check, X } from "lucide-react";

export default function AdminNetworkStrategy() {
  return (
    <NetworkLayout>
      <StrategyPage />
    </NetworkLayout>
  );
}

type StrategyType = "rss_feed" | "web_search" | "social_wall";

type Strategy = {
  id: string;
  site_id: string | null;
  name: string;
  type: StrategyType;
  active: boolean | null;
  schedule_hours: number | null;
  config: Record<string, unknown> | null;
};

function StrategyPage() {
  const { sites } = useNetworkSites();
  const [searchParams] = useSearchParams();
  const [siteFilter, setSiteFilter] = useState<string>(searchParams.get("site") || "all");
  const [items, setItems] = useState<Strategy[]>([]);
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
      .from("content_strategies" as never)
      .select("id,site_id,name,type,active,schedule_hours,config")
      .order("name", { ascending: true });
    if (error) setError(error.message);
    else setError(null);
    setItems(((data ?? []) as unknown) as Strategy[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const sitesById = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);
  const sitesBySlug = useMemo(() => new Map(sites.map((s) => [s.slug, s])), [sites]);

  const filtered = useMemo(() => {
    const visible = items.filter((s) => s.type !== "social_wall");
    if (siteFilter === "all") return visible;
    const site = sitesBySlug.get(siteFilter);
    return visible.filter((s) => s.site_id === site?.id);
  }, [items, siteFilter, sitesBySlug]);

  const grouped = useMemo(() => {
    const map = new Map<string, Strategy[]>();
    for (const s of filtered) {
      const key = s.site_id ?? "_unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const patch = async (id: string, p: Partial<Strategy>) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));
    const { error } = await supabase
      .from("content_strategies" as never)
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
    if (!confirm("Delete this strategy?")) return;
    const { error } = await supabase.from("content_strategies" as never).delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setItems((prev) => prev.filter((s) => s.id !== id));
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load strategies: {error}
        <div className="mt-2 text-xs text-muted-foreground">
          Make sure the <code>content_strategies</code> table exists. See{" "}
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
            <SelectValue />
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
        <span className="text-xs text-muted-foreground">{filtered.length} strategies</span>
        <Button className="ml-auto" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Strategy
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No strategies yet.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([siteId, list]) => {
            const site = sitesById.get(siteId);
            return (
              <div key={siteId}>
                <h3 className="mb-2 text-sm font-semibold">
                  {site ? `${site.slug}.fan` : "Unassigned"}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {list.map((s) => (
                    <StrategyCard
                      key={s.id}
                      strategy={s}
                      saved={savedId === s.id}
                      onPatch={(p) => patch(s.id, p)}
                      onDelete={() => remove(s.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddStrategyModal
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

const TYPE_BADGE: Record<StrategyType, { label: string; className: string }> = {
  rss_feed: { label: "RSS Feed", className: "bg-orange-100 text-orange-700" },
  web_search: { label: "Web Search", className: "bg-blue-100 text-blue-700" },
  social_wall: { label: "Social Wall", className: "bg-pink-100 text-pink-700" },
};

function StrategyCard({
  strategy,
  saved,
  onPatch,
  onDelete,
}: {
  strategy: Strategy;
  saved: boolean;
  onPatch: (p: Partial<Strategy>) => void;
  onDelete: () => void;
}) {
  const badge = TYPE_BADGE[strategy.type];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium">{strategy.name}</h4>
            <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={!!strategy.active}
            onCheckedChange={(v) => onPatch({ active: v })}
          />
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Every</span>
        <Input
          type="number"
          min={1}
          value={strategy.schedule_hours ?? 24}
          onChange={(e) => onPatch({ schedule_hours: Number(e.target.value) })}
          className="h-7 w-20"
        />
        <span className="text-muted-foreground">hours</span>
      </div>

      <div className="mt-3">
        {strategy.type === "rss_feed" && (
          <p className="text-xs text-muted-foreground italic">Managed in Feeds tab</p>
        )}
        {strategy.type === "web_search" && (
          <WebSearchConfig
            value={(strategy.config as { queries?: string[] })?.queries ?? []}
            onChange={(queries) =>
              onPatch({ config: { ...(strategy.config ?? {}), queries } as Strategy["config"] })
            }
          />
        )}
        {strategy.type === "social_wall" && (
          <SocialWallConfig
            value={(strategy.config as SocialConfig) ?? {}}
            onChange={(c) =>
              onPatch({ config: { ...(strategy.config ?? {}), ...c } as Strategy["config"] })
            }
          />
        )}
      </div>
    </Card>
  );
}

function WebSearchConfig({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium">Queries</label>
      {value.map((q, i) => (
        <div key={i} className="flex gap-1">
          <Input
            value={q}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <div className="flex gap-1">
        <Input
          placeholder="Add query…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...value, draft.trim()]);
              setDraft("");
            }
          }}
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (draft.trim()) {
              onChange([...value, draft.trim()]);
              setDraft("");
            }
          }}
        >
          + Add
        </Button>
      </div>
    </div>
  );
}

type SocialConfig = {
  reddit?: string[];
  youtube?: string[];
  pinterest?: string[];
};

function SocialWallConfig({
  value,
  onChange,
}: {
  value: SocialConfig;
  onChange: (v: SocialConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <TagList
        label="Reddit communities"
        value={value.reddit ?? []}
        onChange={(reddit) => onChange({ reddit })}
      />
      <TagList
        label="YouTube queries"
        value={value.youtube ?? []}
        onChange={(youtube) => onChange({ youtube })}
      />
      <TagList
        label="Pinterest tags"
        value={value.pinterest ?? []}
        onChange={(pinterest) => onChange({ pinterest })}
      />
    </div>
  );
}

function TagList({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <div className="mt-1 flex flex-wrap gap-1">
        {value.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
          >
            {t}
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...value, draft.trim()]);
              setDraft("");
            }
          }}
          className="h-7 w-32 text-xs"
          placeholder="Add…"
        />
      </div>
    </div>
  );
}

function AddStrategyModal({
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
  const [siteId, setSiteId] = useState("");
  const [type, setType] = useState<StrategyType>("web_search");
  const [name, setName] = useState("");
  const [scheduleHours, setScheduleHours] = useState(24);
  const [queries, setQueries] = useState("");
  const [reddit, setReddit] = useState("");
  const [youtube, setYoutube] = useState("");
  const [pinterest, setPinterest] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setSiteId("");
      setType("web_search");
      setName("");
      setScheduleHours(24);
      setQueries("");
      setReddit("");
      setYoutube("");
      setPinterest("");
    }
  }, [open]);

  const split = (s: string) =>
    s
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);

  const save = async () => {
    if (!siteId || !name.trim()) return;
    const config =
      type === "web_search"
        ? { queries: split(queries) }
        : type === "social_wall"
          ? {
              reddit: split(reddit),
              youtube: split(youtube),
              pinterest: split(pinterest),
            }
          : {};
    setBusy(true);
    const { error } = await supabase.from("content_strategies" as never).insert({
      site_id: siteId,
      name: name.trim(),
      type,
      active: true,
      schedule_hours: scheduleHours,
      config,
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
          <DialogTitle>Add Strategy</DialogTitle>
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
            <label className="text-xs font-medium">Type</label>
            <Select value={type} onValueChange={(v) => setType(v as StrategyType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web_search">Web Search</SelectItem>
                
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Schedule (hours)</label>
            <Input
              type="number"
              min={1}
              value={scheduleHours}
              onChange={(e) => setScheduleHours(Number(e.target.value))}
            />
          </div>
          {type === "web_search" && (
            <div>
              <label className="text-xs font-medium">Queries (one per line)</label>
              <Textarea
                value={queries}
                onChange={(e) => setQueries(e.target.value)}
                rows={4}
              />
            </div>
          )}
          {type === "social_wall" && (
            <>
              <div>
                <label className="text-xs font-medium">Reddit communities</label>
                <Input value={reddit} onChange={(e) => setReddit(e.target.value)} placeholder="comma separated" />
              </div>
              <div>
                <label className="text-xs font-medium">YouTube queries</label>
                <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="comma separated" />
              </div>
              <div>
                <label className="text-xs font-medium">Pinterest tags</label>
                <Input
                  value={pinterest}
                  onChange={(e) => setPinterest(e.target.value)}
                  placeholder="comma separated"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy || !siteId || !name}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
