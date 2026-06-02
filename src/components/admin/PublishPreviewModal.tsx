import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DomainButton } from "@/components/shared/DomainButton";
import { useTikTokEmbed } from "@/lib/useTikTokEmbed";

interface Props {
  open: boolean;
  title: string;
  content: string;
  hero: string | null;
  siteId: string | null;
  publishing: boolean;
  onClose: () => void;
  onPublish: () => void;
}

type SiteLite = {
  name: string;
  slug: string;
  emoji: string | null;
  accent_color: string | null;
};

export function PublishPreviewModal({
  open,
  title,
  content,
  hero,
  siteId,
  publishing,
  onClose,
  onPublish,
}: Props) {
  const [site, setSite] = useState<SiteLite | null>(null);

  useTikTokEmbed(open ? content : null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open || !siteId) {
      setSite(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("sites" as never)
        .select("name, slug, emoji, accent_color")
        .eq("id", siteId)
        .maybeSingle();
      if (!cancelled && data) setSite(data as unknown as SiteLite);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, siteId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !publishing) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, publishing]);

  if (!open) return null;

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  const siteSlug = site?.slug || site?.name;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Publish preview"
        className="fixed inset-0 z-[91] bg-white flex flex-col"
      >
        <header
          className="flex items-center justify-between px-5 md:px-8 h-14 shrink-0"
          style={{ borderBottom: "0.5px solid hsl(var(--color-border-token))" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={publishing}
              aria-label="Close preview"
              className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
            >
              <X size={18} strokeWidth={1.75} className="text-[#0A1628]" />
            </button>
            <span className="text-xs font-medium uppercase tracking-wider text-ds-text-tertiary">
              Preview
            </span>
          </div>
          {siteSlug ? (
            <DomainButton
              siteName={siteSlug}
              domain={`${siteSlug.toLowerCase()}.fan`}
              size="medium"
              showDomainFormat
              useAccentStyle
            />
          ) : (
            <span />
          )}
          <span className="w-9" />
        </header>

        <div className="flex-1 overflow-y-auto">
          <article className="max-w-[720px] mx-auto px-5 md:px-8 py-8 md:py-12">
            {hero && (
              <img
                src={hero}
                alt={title}
                className="w-full h-72 md:h-96 rounded-lg mb-5"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            )}

            <h1
              className="text-[22px] md:text-[24px] font-semibold leading-[1.25] text-[#0A1628]"
              style={{ letterSpacing: "-0.01em" }}
            >
              {title || "Untitled"}
            </h1>

            {content &&
              (looksLikeHtml ? (
                <div
                  className="mt-5 text-[15px] leading-[1.65] text-[#1F2937] prose prose-sm max-w-none [&_p]:m-0 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[16px] [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#0C447C] [&_a]:underline [&_[data-block=paragraph]]:rounded-lg [&_[data-block=paragraph]]:border [&_[data-block=paragraph]]:border-[#E5E7EB] [&_[data-block=paragraph]]:bg-white [&_[data-block=paragraph]]:p-4 [&_[data-block=paragraph]]:shadow-sm [&_[data-block=paragraph]]:mb-3 [&_[data-block=image][data-empty=true]]:hidden [&_figure[data-block=image]]:my-4 [&_figure[data-block=image]_img]:rounded-lg [&_[data-block=youtube]]:relative [&_[data-block=youtube]]:my-4 [&_[data-block=youtube]]:w-full [&_[data-block=youtube]]:overflow-hidden [&_[data-block=youtube]]:rounded-lg [&_[data-block=youtube]]:pb-[56.25%] [&_[data-block=youtube]>iframe]:absolute [&_[data-block=youtube]>iframe]:inset-0 [&_[data-block=youtube]>iframe]:h-full [&_[data-block=youtube]>iframe]:w-full [&_[data-block=youtube]>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="mt-5 text-[15px] leading-[1.65] text-[#1F2937] whitespace-pre-wrap">
                  {content}
                </div>
              ))}
          </article>
        </div>

        <footer
          className="flex items-center justify-end gap-3 px-5 md:px-8 py-4 shrink-0 bg-white"
          style={{ borderTop: "0.5px solid hsl(var(--color-border-token))" }}
        >
          <Button variant="outline" onClick={onClose} disabled={publishing}>
            Back to editing
          </Button>
          <Button onClick={onPublish} disabled={publishing}>
            {publishing ? "Publishing…" : "Publish now"}
          </Button>
        </footer>
      </div>
    </>
  );
}
