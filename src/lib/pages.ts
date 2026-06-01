// Helpers for the per-site sub-page system (e.g. fashion.fan/outfit).
// Backed by the `pages` table — see scripts/pages-table.sql.
import { supabase } from "@/integrations/supabase/client";
import type { SiteLayout, SiteSection } from "@/hooks/useNetwork";

export type PageRow = {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  layout: { sections?: SiteSection[] } & Partial<SiteLayout>;
  status: "published" | "draft" | string;
  created_at: string;
  updated_at: string;
};

export function normalizePageSlug(path: string): string {
  return (path ?? "").trim().replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
}

export async function getPage(siteId: string, slug: string) {
  const { data } = await supabase
    .from("pages" as never)
    .select("*")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as unknown as PageRow) ?? null;
}

export async function getPageForEdit(siteId: string, slug: string) {
  const { data } = await supabase
    .from("pages" as never)
    .select("*")
    .eq("site_id", siteId)
    .ilike("slug", slug)
    .maybeSingle();
  return (data as unknown as PageRow) ?? null;
}

export async function savePage(pageId: string, layout: PageRow["layout"]) {
  const { data, error } = await supabase
    .from("pages" as never)
    .update({ layout, updated_at: new Date().toISOString() } as never)
    .eq("id", pageId)
    .select("id,layout,updated_at");
  if (error) return error;
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return { message: "No row updated (check page id or permissions)." } as { message: string };
  }
  return null;
}

export async function createPage(siteId: string, slug: string, title: string) {
  const { data, error } = await supabase
    .from("pages" as never)
    .insert({
      site_id: siteId,
      slug,
      title,
      layout: { sections: [] },
      status: "published",
    } as never)
    .select()
    .single();
  return { data: (data as unknown as PageRow) ?? null, error };
}
