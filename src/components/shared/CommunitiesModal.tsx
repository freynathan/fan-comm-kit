import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SiteRow {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  emoji: string | null;
  color: string | null;
  accent_color: string | null;
  status: "active" | "coming_soon" | "inactive" | null;
  category: string | null;
  description: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  passion: "Passion Communities",
  venue: "Venues",
  business: "Business",
  professional: "Professional",
};

function categoryLabel(cat: string | null) {
  if (!cat) return "Other";
  return CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
}

function StatusBadge({ status }: { status: SiteRow["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        <span className="text-[11px] text-green-700 font-medium">Live</span>
      </span>
    );
  }
  if (status === "coming_soon") {
    return (
      <span className="text-[11px] text-ds-text-tertiary font-medium bg-muted px-1.5 py-0.5 rounded-full">
        Soon
      </span>
    );
  }
  return null;
}

function SiteCard({ site }: { site: SiteRow }) {
  const accent = site.color ?? site.accent_color ?? "#888";
  const isLive = site.status === "active";
  const isSoon = site.status === "coming_soon";
  const href = isLive ? `https://${site.domain ?? `${site.slug}.fan`}` : undefined;

  const inner = (
    <>
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: `${accent}18`, border: `1.5px solid ${accent}30` }}
      >
        {site.emoji ?? site.slug[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-ds-text-primary">
            {site.name}.fan
          </span>
          <StatusBadge status={site.status} />
          {isLive && (
            <ExternalLink size={12} className="ml-auto text-ds-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        {site.description ? (
          <p className="mt-1 text-[12px] text-ds-text-secondary leading-[1.5]">
            {site.description}
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-ds-text-tertiary italic">
            {site.domain ?? `${site.slug}.fan`}
          </p>
        )}
      </div>
    </>
  );

  if (isLive) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 rounded-xl border p-4 transition-all hover:border-ds-border-strong hover:shadow-sm hover:bg-gray-50/60 cursor-pointer"
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${isSoon ? "opacity-55" : ""}`}
    >
      {inner}
    </div>
  );
}

export function CommunitiesModal() {
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-communities-modal", handler);
    return () => window.removeEventListener("open-communities-modal", handler);
  }, []);

  useEffect(() => {
    if (!open || sites.length > 0) return;
    setLoading(true);
    supabase
      .from("sites" as never)
      .select("id, slug, name, domain, emoji, color, accent_color, status, category, description")
      .neq("slug", "tobe")
      .order("name", { ascending: true })
      .then(({ data }) => {
        setSites((data as unknown as SiteRow[]) ?? []);
        setLoading(false);
      });
  }, [open, sites.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // Group by category, preserve insertion order: passion first, then others alphabetically
  const grouped = new Map<string, SiteRow[]>();
  for (const site of sites) {
    const key = site.category ?? "other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(site);
  }
  // Sort groups: passion first, then alphabetical
  const sortedGroups = [...grouped.entries()].sort(([a], [b]) => {
    if (a === "passion") return -1;
    if (b === "passion") return 1;
    return a.localeCompare(b);
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-8"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b bg-white px-8 py-5">
          <div>
            <h2 className="text-[22px] font-semibold text-ds-text-primary tracking-tight">
              All communities
            </h2>
            <p className="text-[13px] text-ds-text-tertiary mt-0.5">
              {sites.length} passion sites · one identity
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ds-text-tertiary transition-colors hover:bg-muted hover:text-ds-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {loading && (
            <div className="py-16 text-center text-[14px] text-ds-text-tertiary">
              Loading communities…
            </div>
          )}
          {!loading && sortedGroups.map(([category, items]) => (
            <div key={category} className="mb-8">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ds-text-tertiary">
                {categoryLabel(category)}
                <span className="ml-2 font-normal normal-case">({items.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((site) => (
                  <SiteCard key={site.id} site={site} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
