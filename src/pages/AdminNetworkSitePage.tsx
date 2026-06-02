import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkLayout } from "@/components/admin/NetworkLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ExternalLink,
  GripVertical,
  Trash2,
  Plus,
  Newspaper,
  Flame,
  Hash,
  Sparkles,
  Brain,
  Wand2,
  Save,
  ChevronDown,
  FileText,
  Rss,
  UserCircle2,
  Tag,
  Calendar,
} from "lucide-react";
import { BlockEditor } from "@/components/admin/BlockEditor";
import {
  ContentTemplatePicker,
  ContentModeToggle,
} from "@/components/admin/ContentTemplatePicker";
import { toast } from "sonner";
import type { NetworkSite, SiteSection } from "@/hooks/useNetwork";
import { getPageForEdit, savePage, type PageRow } from "@/lib/pages";


type SectionDef = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: "configure";
};

const SECTION_LIBRARY: SectionDef[] = [
  { id: "article-feed", name: "Article Feed", description: "Latest articles for this site.", icon: Newspaper },
  { id: "trending", name: "Trending", description: "Trending stars / people.", icon: Flame },
  { id: "social-wall", name: "Social Wall", description: "Social media mosaic.", icon: Hash },
  { id: "content-strategy", name: "Content Strategy", description: "Shortcut to strategy settings.", icon: Sparkles },
  { id: "ai-quiz", name: "AI Quiz", description: "AI-powered quiz.", icon: Brain, status: "configure" },
  { id: "custom-ai", name: "Custom AI Feature", description: "Placeholder for a new AI feature.", icon: Wand2 },
  { id: "content", name: "Content", description: "Custom content block.", icon: FileText },
  { id: "content-feed", name: "Content Feed", description: "Latest articles, filtered.", icon: Rss },
  { id: "passion-url", name: "Passion URL", description: "Feature a passion identity page.", icon: UserCircle2 },
  { id: "deals", name: "Deals", description: "Active discounts from brands.", icon: Tag },
  { id: "upcoming-events", name: "Upcoming Events", description: "Upcoming events from brands.", icon: Calendar },
];

const REPEATABLE_SECTIONS = new Set(["content"]);
const SECTION_BY_ID: Record<string, SectionDef> = Object.fromEntries(
  SECTION_LIBRARY.map((s) => [s.id, s]),
);
function defForId(id: string): SectionDef | undefined {
  if (SECTION_BY_ID[id]) return SECTION_BY_ID[id];
  return SECTION_BY_ID[id.replace(/-\d+$/, "")];
}

function normalize(list: SiteSection[] | undefined | null): SiteSection[] {
  return [...(list ?? []).filter((s) => !!defForId(s.id))]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s, i) => ({ ...s, order: i + 1 }));
}

export default function PageBuilderPage() {
  const { slug = "", pageSlug = "" } = useParams<{ slug: string; pageSlug: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<NetworkSite | null>(null);
  const [page, setPage] = useState<PageRow | null>(null);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: siteData } = await supabase
        .from("sites" as never)
        .select(
          "id,slug,name,domain,emoji,accent_color,status,color,category,priority,font,description,llms_txt,layout,custom_ai_brief,logo_url,icon_url",
        )
        .eq("slug", slug)
        .maybeSingle();
      const s = siteData as unknown as NetworkSite | null;
      setSite(s);
      if (s) {
        const p = await getPageForEdit(s.id, pageSlug);
        setPage(p);
        setSections(normalize(p?.layout?.sections));
      }
      setLoading(false);
    })();
  }, [slug, pageSlug]);

  const availableToAdd = useMemo(() => {
    const active = new Set(sections.map((s) => s.id));
    return SECTION_LIBRARY.filter(
      (s) => REPEATABLE_SECTIONS.has(s.id) || !active.has(s.id),
    );
  }, [sections]);

  const persistSections = async (next: SiteSection[]) => {
    if (!page) return;
    const ordered = next.map((s, i) => ({ ...s, order: i + 1 }));
    const error = await savePage(page.id, { ...(page.layout ?? {}), sections: ordered });
    if (error) {
      toast.error(`Save failed: ${error.message}`);
      return;
    }
    if (site) {
      const fresh = await getPageForEdit(site.id, pageSlug);
      if (fresh) {
        setPage(fresh);
        setSections(normalize(fresh.layout?.sections));
      }
    }
  };

  const toggle = (id: string) => {
    const next = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSections(next);
    void persistSections(next);
  };
  const remove = (id: string) => {
    const next = sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
    setSections(next);
    void persistSections(next);
  };
  const updateSection = (id: string, patch: Partial<SiteSection>) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const add = (baseId: string) => {
    let next: SiteSection[] | null = null;
    if (REPEATABLE_SECTIONS.has(baseId)) {
      const existing = sections.filter((s) => s.id === baseId || s.id.startsWith(`${baseId}-`));
      const isFirst = existing.length === 0;
      const newId = isFirst ? baseId : `${baseId}-${existing.length + 1}`;
      let label: string | undefined;
      if (!isFirst) {
        const entered = window.prompt(`Internal label for this ${baseId} section:`, "");
        if (entered === null) {
          setPickerOpen(false);
          return;
        }
        label = entered.trim() || undefined;
      }
      next = [
        ...sections,
        { id: newId, enabled: true, order: sections.length + 1, label, data: { blocks: "" } },
      ];
    } else {
      next = [...sections, { id: baseId, enabled: true, order: sections.length + 1 }];
    }
    setSections(next);
    void persistSections(next);
    setPickerOpen(false);
  };
  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setSections((prev) => {
      const fromIdx = prev.findIndex((s) => s.id === dragId);
      const toIdx = prev.findIndex((s) => s.id === overId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };
  const onDragEnd = () => {
    setDragId(null);
    void persistSections(sections);
  };

  const save = async () => {
    if (!page) return;
    setSaving(true);
    const ordered = sections.map((s, i) => ({ ...s, order: i + 1 }));
    const error = await savePage(page.id, { ...(page.layout ?? {}), sections: ordered });
    setSaving(false);
    if (error) {
      toast.error(`Save failed: ${error.message}`);
      return;
    }
    toast.success("Page saved!");
  };


  if (loading) {
    return (
      <NetworkLayout>
        <div className="py-16 text-center text-sm text-muted-foreground">Loading page…</div>
      </NetworkLayout>
    );
  }
  if (!site || !page) {
    return (
      <NetworkLayout>
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Page /{pageSlug} not found on {slug}.
          </p>
          <Button variant="link" onClick={() => navigate(`/admin/network/sites/${slug}`)}>
            ← Back to site editor
          </Button>
        </div>
      </NetworkLayout>
    );
  }

  const domain = site.domain ?? `${site.slug}.fan`;
  const accent = site.color ?? site.accent_color ?? "#111";

  return (
    <NetworkLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/admin/network/sites/${slug}`}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to {site.name}
              </Link>
            </Button>
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-base text-white overflow-hidden"
              style={{ backgroundColor: accent }}
            >
              {site.icon_url ? (
                <img src={site.icon_url} className="h-9 w-9 object-cover" alt="" />
              ) : (
                site.emoji ?? site.slug[0]?.toUpperCase()
              )}
            </span>
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                Editing page: /{page.slug}
              </h2>
              <p className="text-xs text-muted-foreground">
                {page.title} · {domain}/{page.slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://tobe.fan/${page.slug}?site=${site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1 h-4 w-4" /> Preview
              </a>
            </Button>
            <Button
              size="sm"
              onClick={save}
              disabled={saving}
              className="bg-green-700 text-white hover:bg-green-800"
            >
              <Save className="mr-1 h-4 w-4" />
              {saving ? "Saving…" : "Save Page"}
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Sections</h3>
            <p className="text-xs text-muted-foreground">
              Drag to reorder · toggle to enable/disable · trash to remove
            </p>
          </div>

          {sections.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              No sections yet. Click "+ Add Section" below to start.
            </div>
          ) : (
            <ul className="space-y-2">
              {sections.map((s) => {
                const def = defForId(s.id);
                if (!def) return null;
                const Icon = def.icon;
                const isContent = s.id === "content" || s.id.startsWith("content-");
                const displayName = s.label ? `${def.name} — ${s.label}` : def.name;
                const isOpen = expandedId === s.id;
                return (
                  <li
                    key={s.id}
                    draggable
                    onDragStart={() => onDragStart(s.id)}
                    onDragOver={(e) => onDragOver(e, s.id)}
                    onDragEnd={onDragEnd}
                    className={`rounded-lg border bg-card transition-shadow ${
                      dragId === s.id ? "opacity-50" : "hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-4 w-4" />
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : s.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{displayName}</span>
                          {isContent && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {s.data?.blocks ? "Has content" : "Empty"}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {def.description}
                        </p>
                      </button>
                      <Switch
                        checked={s.enabled}
                        onCheckedChange={() => toggle(s.id)}
                        aria-label={`Toggle ${def.name}`}
                      />
                      <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isOpen ? null : s.id)}
                      >
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>
                    {isOpen && (
                      <div className="border-t p-4">
                        <PageSectionBody
                          section={s}
                          updateSection={updateSection}
                          site={site}
                        />
                        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                          <label className="flex items-center gap-2 text-sm">
                            <Switch
                              checked={
                                !!(s.config as { edgeToEdge?: boolean } | undefined)?.edgeToEdge
                              }
                              onCheckedChange={(v) =>
                                updateSection(s.id, {
                                  config: {
                                    ...((s.config as Record<string, unknown> | undefined) ?? {}),
                                    edgeToEdge: v,
                                  },
                                })
                              }
                            />
                            <span>↔️ Edge-to-edge (full viewport width)</span>
                          </label>
                          <Button
                            size="sm"
                            onClick={() => setExpandedId(null)}
                            variant="outline"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setPickerOpen(true)}
              disabled={availableToAdd.length === 0}
              className="w-full border-dashed"
            >
              <Plus className="mr-1 h-4 w-4" />
              {availableToAdd.length === 0 ? "All sections added" : "Add Section"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a section</DialogTitle>
            <DialogDescription>
              Choose a section to add to /{page.slug}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableToAdd.map((def) => {
              const Icon = def.icon;
              return (
                <button
                  key={def.id}
                  onClick={() => add(def.id)}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-foreground/30 hover:bg-muted/50"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted group-hover:bg-background">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{def.name}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{def.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </NetworkLayout>
  );
}

function PageSectionBody({
  section,
  updateSection,
  site,
}: {
  section: SiteSection;
  updateSection: (id: string, patch: Partial<SiteSection>) => void;
  site: NetworkSite;
}) {
  const s = section;
  const isContent = s.id === "content" || s.id.startsWith("content-");
  const data = s.data ?? {};
  const setData = (patch: Record<string, unknown>) =>
    updateSection(s.id, { data: { ...data, ...patch } });

  if (isContent) {
    const mode = ((data.mode as "blocks" | "template" | undefined) ?? "blocks");
    return (
      <div className="space-y-4">
        <ContentModeToggle mode={mode} onChange={(m) => setData({ mode: m })} />
        {mode === "blocks" ? (
          <BlockEditor
            key={s.id}
            value={(data.blocks as string | undefined) ?? ""}
            onChange={(html) => setData({ blocks: html })}
            siteColor={site.color ?? site.accent_color ?? undefined}
            siteFont={site.font ?? "Inter"}
          />

        ) : (
          <ContentTemplatePicker
            data={data}
            setData={setData}
            siteId={site.id}
            siteColor={site.color ?? site.accent_color ?? undefined}
            siteFont={site.font ?? "Inter"}
          />
        )}
      </div>
    );
  }

  if (s.id === "content-feed") {
    const maxArticles = (data.maxArticles as number | undefined) ?? 10;
    const showExcerpt = (data.showExcerpt as boolean | undefined) ?? true;
    const showHero = (data.showHero as boolean | undefined) ?? true;
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs">Max articles to show</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={maxArticles}
            onChange={(e) => setData({ maxArticles: Math.max(1, Number(e.target.value) || 10) })}
            className="mt-1 w-32"
          />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={showExcerpt} onCheckedChange={(v) => setData({ showExcerpt: v })} />
          Show excerpt
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={showHero} onCheckedChange={(v) => setData({ showHero: v })} />
          Show hero image
        </label>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      This section type uses default settings on sub-pages. Configure global options from the
      main site editor.
    </p>
  );
}
