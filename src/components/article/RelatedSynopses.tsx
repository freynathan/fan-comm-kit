import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useArticleDrawer } from "./ArticleDrawerContext";

interface RelatedItem {
  id: string;
  title: string;
  reading_time_seconds: number | null;
}

interface Props {
  siteId: string | null | undefined;
  excludeId: string | null | undefined;
  siteAccent: string;
  siteEmoji: string;
  siteName?: string;
}

export function RelatedSynopses({ siteId, excludeId, siteAccent, siteEmoji, siteName }: Props) {
  const [items, setItems] = useState<RelatedItem[] | null>(null);
  const { open } = useArticleDrawer();

  useEffect(() => {
    if (!siteId) {
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      let q = supabase
        .from("news_synopses")
        .select("id, title, reading_time_seconds")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false })
        .limit(6);
      if (excludeId) q = q.neq("id", excludeId);
      const { data } = await q;
      if (cancelled) return;
      setItems(((data ?? []) as RelatedItem[]).slice(0, 4));
    })();
    return () => {
      cancelled = true;
    };
  }, [siteId, excludeId]);

  if (!siteId) return null;
  if (items === null) {
    return (
      <div className="mt-8">
        <div className="h-3 w-32 bg-[#F5F5F7] rounded animate-pulse" />
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 bg-[#F5F5F7] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-2">
        More from {siteEmoji} {siteName || "this community"}
      </p>
      <div className="rounded-lg overflow-hidden" style={{ border: "0.5px solid hsl(var(--color-border))" }}>
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => open({ kind: "synopsis", synopsisId: it.id })}
            className="w-full text-left px-3.5 py-3 hover:bg-[#FAFAFA] transition-colors flex items-start gap-3"
            style={i > 0 ? { borderTop: "0.5px solid hsl(var(--color-border))" } : undefined}
          >
            <div
              className="shrink-0 w-1 h-10 rounded-full"
              style={{ backgroundColor: siteAccent }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-[1.4] text-[#0A1628] line-clamp-2 font-medium">
                {it.title}
              </p>
              {it.reading_time_seconds ? (
                <p className="mt-0.5 text-[11px] text-ds-text-tertiary">
                  {Math.max(1, Math.round(it.reading_time_seconds / 60))} min read
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
