import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkLayout } from "@/components/admin/NetworkLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Lock,
  ChevronDown,
  ChevronRight,
  X,
  FileText,
  Rss,
  UserCircle2,
  Tag,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { createPage, getPageForEdit, normalizePageSlug } from "@/lib/pages";
import { BlockEditor } from "@/components/admin/BlockEditor";
import {
  ContentTemplatePicker,
  ContentModeToggle,
} from "@/components/admin/ContentTemplatePicker";

import { toast } from "sonner";
import type {
  NetworkSite,
  SiteLayout,
  SiteSection,
  SiteHeader,
  SiteHeaderLink,
} from "@/hooks/useNetwork";



type SectionDef = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: "configure";
};

const SECTION_LIBRARY: SectionDef[] = [
  {
    id: "article-feed",
    name: "Article Feed",
    description: "Latest articles for this site only (filtered by site_id).",
    icon: Newspaper,
  },
  {
    id: "trending",
    name: "Trending",
    description: "Trending stars / people section.",
    icon: Flame,
  },
  {
    id: "social-wall",
    name: "Social Wall",
    description: "Social media mosaic wall.",
    icon: Hash,
  },
  {
    id: "content-strategy",
    name: "Content Strategy",
    description: "Shortcut to this site's content strategy settings.",
    icon: Sparkles,
  },
  {
    id: "ai-quiz",
    name: "AI Quiz",
    description: "AI-powered quiz (like Aria on healthy.fan).",
    icon: Brain,
    status: "configure",
  },
  {
    id: "custom-ai",
    name: "Custom AI Feature",
    description: "Placeholder for a new AI feature — describe what to build.",
    icon: Wand2,
  },
  {
    id: "content",
    name: "Content",
    description:
      "Add a custom content block — announcements, featured videos, editorial pieces. Removable anytime.",
    icon: FileText,
  },
  {
    id: "content-feed",
    name: "Content Feed",
    description:
      "Latest articles published on this site, filtered to this topic only.",
    icon: Rss,
  },
  {
    id: "passion-url",
    name: "Passion URL",
    description:
      "Feature a passion identity page — e.g. tobe.fan/of/nike — as a highlighted section on this site.",
    icon: UserCircle2,
  },
  {
    id: "deals",
    name: "Deals",
    description:
      "Active discounts from brands on this site. Featured deals shown first.",
    icon: Tag,
  },
  {
    id: "upcoming-events",
    name: "Upcoming Events",
    description:
      "Upcoming events from brands on this site, sorted by date.",
    icon: Calendar,
  },
];

// "content" is repeatable — instances live under ids like content, content-2, ...
const REPEATABLE_SECTIONS = new Set(["content"]);

function defForId(id: string): SectionDef | undefined {
  if (SECTION_BY_ID[id]) return SECTION_BY_ID[id];
  // strip "-N" suffix for repeatable ids (content-2 → content)
  const base = id.replace(/-\d+$/, "");
  return SECTION_BY_ID[base];
}


const SECTION_BY_ID: Record<string, SectionDef> = Object.fromEntries(
  SECTION_LIBRARY.map((s) => [s.id, s]),
);

const DEFAULT_LAYOUT: SiteLayout = {
  sections: [
    { id: "article-feed", enabled: true, order: 1 },
    { id: "trending", enabled: true, order: 2 },
    { id: "social-wall", enabled: false, order: 3 },
  ],
};

function defaultHeader(siteName: string): SiteHeader {
  return {
    links: [
      { label: `${siteName} 1`, url: "/", dropdown: [] },
      { label: `${siteName} 2`, url: "/", dropdown: [] },
      { label: `${siteName} 3`, url: "/", dropdown: [] },
    ],
  };
}

function normalizeHeader(
  header: SiteHeader | null | undefined,
  siteName: string,
): SiteHeader {
  const defaults = defaultHeader(siteName);
  const links = (header?.links ?? defaults.links).slice(0, 3);
  while (links.length < 3) {
    links.push(defaults.links[links.length]);
  }
  return {
    links: links.map((l) => ({
      label: l.label ?? "",
      url: l.url ?? "",
      dropdown: Array.isArray(l.dropdown) ? l.dropdown : [],
    })),
  };
}

function normalize(layout: SiteLayout | null | undefined): SiteSection[] {
  return normalizeList(layout?.sections ?? DEFAULT_LAYOUT.sections);
}

function normalizeList(list: SiteSection[] | undefined | null): SiteSection[] {
  const usedIds = new Set<string>();
  const filtered = (list ?? []).filter((s) => !!defForId(s.id));
  return [...filtered]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s, i) => {
      let id = s.id;
      const baseId = id.replace(/-\d+$/, "");
      if (REPEATABLE_SECTIONS.has(baseId)) {
        let next = usedIds.size === 0 && baseId === id ? baseId : id;
        let suffix = 2;
        while (usedIds.has(next)) {
          next = `${baseId}-${suffix}`;
          suffix += 1;
        }
        id = next;
      }
      usedIds.add(id);
      return { ...s, id, order: i + 1 };
    });
}

type ViewKey = "loggedOut" | "loggedIn";

function migrateViews(layout: SiteLayout | null | undefined): Record<ViewKey, SiteSection[]> {
  if (layout?.loggedIn || layout?.loggedOut) {
    return {
      loggedOut: normalizeList(layout.loggedOut?.sections),
      loggedIn: normalizeList(layout.loggedIn?.sections),
    };
  }
  // Migrate legacy flat layout.sections → loggedIn; empty loggedOut
  return {
    loggedOut: [],
    loggedIn: normalize(layout),
  };
}

function buildSiteLayout(
  views: Record<ViewKey, SiteSection[]>,
  header: SiteHeader,
): SiteLayout {
  const reorder = (list: SiteSection[]) => list.map((s, i) => ({ ...s, order: i + 1 }));
  const loggedOutSections = reorder(views.loggedOut);
  const loggedInSections = reorder(views.loggedIn);
  return {
    loggedOut: { sections: loggedOutSections },
    loggedIn: { sections: loggedInSections },
    sections: loggedInSections,
    header,
  };
}



export default function SiteCompositionPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  console.log("AdminNetworkSite rendering, slug:", slug);
  const [site, setSite] = useState<NetworkSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewKey>("loggedOut");
  const [viewsSections, setViewsSections] = useState<Record<ViewKey, SiteSection[]>>({
    loggedOut: [],
    loggedIn: [],
  });
  const sections = viewsSections[view];
  const setSections: React.Dispatch<React.SetStateAction<SiteSection[]>> = (updater) =>
    setViewsSections((prev) => ({
      ...prev,
      [view]: typeof updater === "function"
        ? (updater as (s: SiteSection[]) => SiteSection[])(prev[view])
        : updater,
    }));
  const [header, setHeader] = useState<SiteHeader>({ links: [] });
  const [aiBrief, setAiBrief] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragSectionsRef = useRef<SiteSection[] | null>(null);
  const persistChainRef = useRef<Promise<void>>(Promise.resolve());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedFlashId, setSavedFlashId] = useState<string | null>(null);

  const expandSection = (id: string) => {
    if (expandedId === id) return;
    if (expandedId) {
      // auto-save on collapse of previously open one
      void autoSaveAndFlash(expandedId);
    }
    setExpandedId(id);
  };
  const collapseSection = (id: string) => {
    void autoSaveAndFlash(id);
    setExpandedId((cur) => (cur === id ? null : cur));
  };
  const autoSaveAndFlash = async (id: string) => {
    await save();
    setSavedFlashId(id);
    setTimeout(() => {
      setSavedFlashId((cur) => (cur === id ? null : cur));
    }, 1800);
  };


  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sites" as never)
        .select(
          "id,slug,name,domain,emoji,accent_color,status,color,category,priority,font,description,llms_txt,layout,custom_ai_brief,logo_url,icon_url",
        )
        .eq("slug", slug)
        .maybeSingle();
      if (error) toast.error(error.message);
      const s = (data as unknown) as NetworkSite | null;
      setSite(s);
      setViewsSections(migrateViews(s?.layout));
      setHeader(normalizeHeader(s?.layout?.header, s?.name ?? slug));
      setAiBrief(s?.custom_ai_brief ?? "");
      setLoading(false);
    })();
  }, [slug]);


  const availableToAdd = useMemo(() => {
    const active = new Set(sections.map((s) => s.id));
    return SECTION_LIBRARY.filter(
      (s) => REPEATABLE_SECTIONS.has(s.id) || !active.has(s.id),
    );
  }, [sections]);

  const persistViews = async (nextViews: Record<ViewKey, SiteSection[]>, options?: { toast?: boolean }) => {
    if (!site) return;
    const run = async () => {
    try {
      setSaving(true);
      const layout = buildSiteLayout(nextViews, header);
      const { error } = await supabase
        .from("sites" as never)
        .update({ layout, custom_ai_brief: aiBrief } as never)
        .eq("id", site.id);
      if (error) {
        toast.error(`Save failed: ${error.message}`);
        return;
      }
      const { data, error: reloadError } = await supabase
        .from("sites" as never)
        .select(
          "id,slug,name,domain,emoji,accent_color,status,color,category,priority,font,description,llms_txt,layout,custom_ai_brief,logo_url,icon_url",
        )
        .eq("id", site.id)
        .maybeSingle();
      if (reloadError) {
        toast.error(`Reload failed: ${reloadError.message}`);
        return;
      }
      const fresh = (data as unknown) as NetworkSite | null;
      if (fresh) {
        setSite(fresh);
        setViewsSections(migrateViews(fresh.layout));
        setHeader(normalizeHeader(fresh.layout?.header, fresh.name ?? slug));
      }
      if (options?.toast) toast.success("Layout saved");
    } catch (error) {
      console.error("Failed to persist site layout", error);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
    };
    const queued = persistChainRef.current.catch(() => undefined).then(run);
    persistChainRef.current = queued.then(() => undefined, () => undefined);
    await queued;
  };

  const toggle = (id: string) => {
    const next = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    const nextViews = { ...viewsSections, [view]: next };
    setViewsSections(nextViews);
    void persistViews(nextViews);
  };

  const remove = (id: string) => {
    const next = sections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    const nextViews = { ...viewsSections, [view]: next };
    setViewsSections(nextViews);
    setExpandedId((cur) => (cur === id ? null : cur));
    void persistViews(nextViews);
  };

  const updateSection = (id: string, patch: Partial<SiteSection>) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const add = (baseId: string) => {
    let next: SiteSection[];
    if (REPEATABLE_SECTIONS.has(baseId)) {
      // Find unique id: content, content-2, content-3, ...
      const existing = sections.filter((s) => s.id === baseId || s.id.startsWith(`${baseId}-`));
      const isFirst = existing.length === 0;
      let newId = isFirst ? baseId : `${baseId}-${existing.length + 1}`;
      let suffix = existing.length + 2;
      while (sections.some((s) => s.id === newId)) {
        newId = `${baseId}-${suffix}`;
        suffix += 1;
      }
      let label: string | undefined;
      if (!isFirst) {
        const entered = window.prompt(
          `Internal label for this ${baseId} section (e.g. "Summer announcement", "Featured video"):`,
          "",
        );
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
    const nextViews = { ...viewsSections, [view]: next };
    setViewsSections(nextViews);
    void persistViews(nextViews);
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
      const ordered = next.map((s, i) => ({ ...s, order: i + 1 }));
      dragSectionsRef.current = ordered;
      return ordered;
    });
  };
  const onDragEnd = () => {
    setDragId(null);
    const nextViews = { ...viewsSections, [view]: dragSectionsRef.current ?? sections };
    dragSectionsRef.current = null;
    void persistViews(nextViews);
  };

  const save = async () => {
    if (!site) return;
    const currentViews: Record<ViewKey, SiteSection[]> = {
      ...viewsSections,
      [view]: sections,
    };
    await persistViews(currentViews, { toast: true });
  };

  const updateLink = (idx: number, patch: Partial<SiteHeaderLink>) =>
    setHeader((prev) => ({
      links: prev.links.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));
  const toggleDropdown = (idx: number) =>
    setHeader((prev) => ({
      links: prev.links.map((l, i) =>
        i === idx
          ? { ...l, dropdown: l.dropdown && l.dropdown.length ? [] : [{ label: "", url: "" }] }
          : l,
      ),
    }));
  const addSubLink = (idx: number) =>
    setHeader((prev) => ({
      links: prev.links.map((l, i) =>
        i === idx ? { ...l, dropdown: [...(l.dropdown ?? []), { label: "", url: "" }] } : l,
      ),
    }));
  const updateSubLink = (
    idx: number,
    subIdx: number,
    patch: Partial<{ label: string; url: string }>,
  ) =>
    setHeader((prev) => ({
      links: prev.links.map((l, i) =>
        i === idx
          ? {
              ...l,
              dropdown: (l.dropdown ?? []).map((d, j) =>
                j === subIdx ? { ...d, ...patch } : d,
              ),
            }
          : l,
      ),
    }));
  const removeSubLink = (idx: number, subIdx: number) =>
    setHeader((prev) => ({
      links: prev.links.map((l, i) =>
        i === idx
          ? { ...l, dropdown: (l.dropdown ?? []).filter((_, j) => j !== subIdx) }
          : l,
      ),
    }));


  if (loading) {
    return (
      <NetworkLayout>
        <div className="py-16 text-center text-sm text-muted-foreground">Loading site…</div>
      </NetworkLayout>
    );
  }

  if (!site) {
    return (
      <NetworkLayout>
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Site "{slug}" not found.</p>
          <Button asChild variant="link">
            <Link to="/admin/network">← Back to sites</Link>
          </Button>
        </div>
      </NetworkLayout>
    );
  }

  const accent = site.color ?? site.accent_color ?? "#111";
  const domain = site.domain ?? `${site.slug}.fan`;

  return (
    <NetworkLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/network">
                <ArrowLeft className="mr-1 h-4 w-4" /> Sites
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
              <h2 className="text-lg font-semibold leading-tight">{site.name}</h2>
              <p className="text-xs text-muted-foreground">{domain}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://tobe.fan/?site=${site.slug}&preview=${
                  view === "loggedIn" ? "loggedin" : "loggedout"
                }`}
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
              {saving ? "Saving…" : "Save Layout"}
            </Button>
          </div>
        </div>

        {/* Logged-out / Logged-in view toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border bg-card p-0.5">
            {(["loggedOut", "loggedIn"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                size="sm"
                variant={view === v ? "default" : "ghost"}
                onClick={() => {
                  if (expandedId) {
                    void autoSaveAndFlash(expandedId);
                    setExpandedId(null);
                  }
                  setView(v);
                }}
                className="h-8 px-3 text-xs"
              >
                {v === "loggedOut" ? "👤 Logged-out view" : "🔒 Logged-in view"}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Editing the <strong>{view === "loggedOut" ? "logged-out" : "logged-in"}</strong>{" "}
            layout. Each view has its own independent sections.
          </p>
        </div>

        {/* Header section — permanent, always first, collapsible */}
        {(() => {
          const isOpen = expandedId === "__header";
          const flashed = savedFlashId === "__header";
          return (
            <div className="rounded-lg border bg-card">
              <button
                type="button"
                onClick={() =>
                  isOpen ? collapseSection("__header") : expandSection("__header")
                }
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Hash className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Header</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      always first
                    </span>
                    {flashed && (
                      <span className="text-[11px] font-medium text-green-700">
                        Saved ✓
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    Logo + 3 nav links · cannot be removed or reordered
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t p-4">
                  {/* Logo preview */}
                  <div className="mb-4 flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                    {site.logo_url ? (
                      <img
                        src={site.logo_url}
                        alt={`${site.name} logo`}
                        className="h-10 w-auto max-w-[160px] object-contain"
                      />
                    ) : (
                      <span className="text-base font-semibold" style={{ color: accent }}>
                        {site.name}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {site.logo_url
                        ? "Logo set — upload a new one from the Sites table"
                        : "No logo — site name shown. Upload one from the Sites table."}
                    </span>
                  </div>

                  {/* 3 nav link slots */}
                  <div className="space-y-3">
                    {header.links.map((link, i) => (
                      <LinkSlotEditor
                        key={i}
                        idx={i}
                        link={link}
                        siteSlug={site.slug}
                        siteId={site.id}
                        onChange={(patch) => updateLink(i, patch)}
                        onToggleDropdown={() => toggleDropdown(i)}
                        onAddSub={() => addSubLink(i)}
                        onUpdateSub={(j, patch) => updateSubLink(i, j, patch)}
                        onRemoveSub={(j) => removeSubLink(i, j)}
                      />
                    ))}
                  </div>

                  {/* Fixed network-wide links */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                    <span className="text-xs text-muted-foreground">
                      Fixed network-wide links (not editable):
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                      <Lock className="h-3 w-3" /> Fan Clubs
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                      <Lock className="h-3 w-3" /> All sites ∨
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => collapseSection("__header")}
                      className="bg-green-700 text-white hover:bg-green-800"
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save section
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Section list */}
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
                const flashed = savedFlashId === s.id;
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
                        onClick={() =>
                          isOpen ? collapseSection(s.id) : expandSection(s.id)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{displayName}</span>
                          {def.status === "configure" && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                              Configure
                            </span>
                          )}
                          {isContent && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {s.data?.blocks ? "Has content" : "Empty"}
                            </span>
                          )}
                          {flashed && (
                            <span className="text-[11px] font-medium text-green-700">
                              Saved ✓
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(s.id)}
                        title="Remove section"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          isOpen ? collapseSection(s.id) : expandSection(s.id)
                        }
                        title={isOpen ? "Collapse" : "Expand"}
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
                        <SectionBody
                          section={s}
                          aiBrief={aiBrief}
                          setAiBrief={setAiBrief}
                          updateSection={updateSection}
                          site={site}
                        />
                        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                          <label className="flex items-center gap-2 text-sm">
                            <Switch
                              checked={
                                !!(s.config as { edgeToEdge?: boolean } | undefined)
                                  ?.edgeToEdge
                              }
                              onCheckedChange={(v) =>
                                updateSection(s.id, {
                                  config: {
                                    ...((s.config as Record<string, unknown> | undefined) ??
                                      {}),
                                    edgeToEdge: v,
                                  },
                                })
                              }
                            />
                            <span>↔️ Edge-to-edge (full viewport width)</span>
                          </label>
                          <Button
                            size="sm"
                            onClick={() => collapseSection(s.id)}
                            className="bg-green-700 text-white hover:bg-green-800"
                          >
                            <Save className="mr-1 h-4 w-4" />
                            Save section
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

      {/* Section picker modal */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a section</DialogTitle>
            <DialogDescription>
              Choose a section to add to {site.name}.
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
                      {def.status === "configure" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          Configure
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {def.description}
                    </p>
                  </div>
                </button>
              );
            })}
            {availableToAdd.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                Every section is already on this site.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </NetworkLayout>

  );
}

function SectionBody({
  section,
  aiBrief,
  setAiBrief,
  updateSection,
  site,
}: {
  section: SiteSection;
  aiBrief: string;
  setAiBrief: (v: string) => void;
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
            onChange={(e) =>
              setData({ maxArticles: Math.max(1, Number(e.target.value) || 10) })
            }
            className="mt-1 w-32"
          />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={showExcerpt}
            onCheckedChange={(v) => setData({ showExcerpt: v })}
          />
          Show excerpt
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={showHero}
            onCheckedChange={(v) => setData({ showHero: v })}
          />
          Show hero image
        </label>
      </div>
    );
  }

  if (s.id === "trending") {
    return (
      <p className="text-sm text-muted-foreground">
        Displays trending people/brands for this site. Managed in the{" "}
        <Link to="/admin/trends" className="underline">
          Trends admin
        </Link>
        .
      </p>
    );
  }

  if (s.id === "social-wall") {
    const config = (s.config ?? {}) as {
      redditCommunities?: string[];
      youtubeQueries?: string[];
      pinterestTags?: string[];
      refreshHours?: number;
    };
    const setConfig = (patch: Partial<typeof config>) =>
      updateSection(s.id, { config: { ...config, ...patch } });
    return (
      <div className="space-y-4">
        <TagInput
          label="Reddit communities"
          placeholder="Type a subreddit and press Enter"
          value={config.redditCommunities ?? []}
          onChange={(v) => setConfig({ redditCommunities: v })}
        />
        <TagInput
          label="YouTube search queries"
          placeholder="Type a query and press Enter"
          value={config.youtubeQueries ?? []}
          onChange={(v) => setConfig({ youtubeQueries: v })}
        />
        <TagInput
          label="Pinterest tags"
          placeholder="Type a tag and press Enter"
          value={config.pinterestTags ?? []}
          onChange={(v) => setConfig({ pinterestTags: v })}
        />
        <div>
          <Label className="text-xs">Refresh every X hours</Label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={config.refreshHours ?? 1}
              onChange={(e) =>
                setConfig({ refreshHours: Math.max(1, Number(e.target.value) || 1) })
              }
              className="w-24"
            />
            <span className="text-xs text-muted-foreground">hours</span>
          </div>
        </div>
      </div>
    );
  }

  if (s.id === "ai-quiz") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Quiz title</Label>
          <Input
            value={(data.title as string | undefined) ?? ""}
            onChange={(e) => setData({ title: e.target.value })}
            placeholder="e.g. Find your wellness archetype"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Intro text</Label>
          <Textarea
            value={(data.intro as string | undefined) ?? ""}
            onChange={(e) => setData({ intro: e.target.value })}
            rows={3}
            placeholder="Short intro shown above the quiz."
            className="mt-1"
          />
        </div>
        <Link to="/admin/quiz-builder" className="text-sm text-primary underline">
          Go to quiz settings →
        </Link>
      </div>
    );
  }

  if (s.id === "custom-ai") {
    return (
      <div>
        <Label htmlFor="ai-brief" className="text-xs">
          Describe the AI feature to build for this site
        </Label>
        <Textarea
          id="ai-brief"
          value={aiBrief}
          onChange={(e) => setAiBrief(e.target.value)}
          rows={4}
          placeholder="e.g. A nutrition coach quiz that recommends recipes based on user answers."
          className="mt-1"
        />
      </div>
    );
  }

  if (s.id === "passion-url") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs">Passion URL</Label>
          <Input
            value={(data.url as string | undefined) ?? ""}
            onChange={(e) => setData({ url: e.target.value })}
            placeholder="e.g. tobe.fan/of/nike"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Section title (optional)</Label>
          <Input
            value={(data.title as string | undefined) ?? ""}
            onChange={(e) => setData({ title: e.target.value })}
            placeholder="e.g. Featured Brand"
            className="mt-1"
          />
        </div>
      </div>
    );
  }

  if (s.id === "article-feed") {
    return (
      <p className="text-sm text-muted-foreground">
        Latest articles for this site (filtered by site_id). No settings.
      </p>
    );
  }

  if (s.id === "deals") {
    return (
      <p className="text-sm text-muted-foreground">
        Lists active discounts from brands published on this site. Featured first. Managed by brand owners in their dashboard.
      </p>
    );
  }

  if (s.id === "upcoming-events") {
    return (
      <p className="text-sm text-muted-foreground">
        Lists upcoming events from brands on this site, sorted by date. Managed by brand owners in their dashboard.
      </p>
    );
  }

  if (s.id === "content-strategy") {
    return (
      <p className="text-sm text-muted-foreground">
        Shortcut to this site's content strategy settings.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">No settings for this section.</p>
  );
}

function LinkSlotEditor({
  idx,
  link,
  siteSlug,
  siteId,
  onChange,
  onToggleDropdown,
  onAddSub,
  onUpdateSub,
  onRemoveSub,
}: {
  idx: number;
  link: SiteHeaderLink;
  siteSlug: string;
  siteId: string;
  onChange: (patch: Partial<SiteHeaderLink>) => void;
  onToggleDropdown: () => void;
  onAddSub: () => void;
  onUpdateSub: (j: number, patch: Partial<{ label: string; url: string }>) => void;
  onRemoveSub: (j: number) => void;
}) {
  const hasDropdown = (link.dropdown ?? []).length > 0;
  const [open, setOpen] = useState(hasDropdown);
  const navigate = useNavigate();
  const pageSlug = normalizePageSlug(link.url ?? "");
  // Only show "Go to page" for relative internal single-segment paths.
  const canGoToPage =
    pageSlug.length > 0 &&
    !/^https?:/i.test(link.url ?? "") &&
    !pageSlug.includes("/") &&
    (link.url ?? "").trim().startsWith("/");

  const goToPage = async () => {
    if (!canGoToPage) return;
    const existing = await getPageForEdit(siteId, pageSlug);
    if (!existing) {
      const { error } = await createPage(siteId, pageSlug, link.label || pageSlug);
      if (error) {
        toast.error(`Couldn't create page: ${error.message}`);
        return;
      }
    }
    navigate(`/admin/network/sites/${siteSlug}/pages/${pageSlug}`);
  };

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground w-12">
          Link {idx + 1}
        </span>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Input
            placeholder="Label"
            value={link.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
          <Input
            placeholder="/path or https://…"
            value={link.url}
            onChange={(e) => onChange({ url: e.target.value })}
          />
        </div>
        {canGoToPage && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={goToPage}
            className="shrink-0 h-8"
            title={`Edit page /${pageSlug}`}
          >
            Go to page <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
        <label className="ml-2 flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <Switch
            checked={hasDropdown}
            onCheckedChange={() => {
              onToggleDropdown();
              setOpen(true);
            }}
          />
          Dropdown
        </label>
      </div>

      {hasDropdown && (
        <div className="mt-3 border-t pt-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {open ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Sub-links ({(link.dropdown ?? []).length})
          </button>
          {open && (
            <div className="space-y-2">
              {(link.dropdown ?? []).map((d, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Input
                    placeholder="Sub-label"
                    value={d.label}
                    onChange={(e) => onUpdateSub(j, { label: e.target.value })}
                    className="h-8"
                  />
                  <Input
                    placeholder="/path or https://…"
                    value={d.url}
                    onChange={(e) => onUpdateSub(j, { url: e.target.value })}
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveSub(j)}
                    title="Remove sub-link"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={onAddSub}
                className="h-7 border-dashed"
              >
                <Plus className="mr-1 h-3 w-3" /> Add sub-link
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TagInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || value.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex flex-wrap items-center gap-1 rounded-md border bg-background p-1.5">
        {value.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 bg-transparent px-1 text-xs outline-none"
        />
      </div>
    </div>
  );
}


