import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import {
  Plus,
  Trash2,
  Type,
  Heading1,
  Heading2,
  List as ListIcon,
  ListOrdered,
  Image as ImageIcon,
  Search,
  Youtube,
  AtSign,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Upload,
  ArrowUp,
  ArrowDown,
  Images,
  Minus,
  MousePointerClick,
  Sparkles,
  Loader2,
  Check,
  X,
  ChevronDown,
  Music2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentIncrease,
  IndentDecrease,
  Eraser,
  Palette,
  Highlighter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FONT_OPTIONS, loadGoogleFont } from "@/lib/fonts";
import { storeRemoteImage } from "@/lib/storeImage";

// Custom FontSize mark — extends TextStyle to support font-size via inline style.
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el: HTMLElement) =>
          el.style.fontSize ? el.style.fontSize.replace(/['"]+/g, "") : null,
        renderHTML: (attrs: { fontSize?: string | null }) =>
          attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
    };
  },
});

// Custom LineHeight extension — adds a `lineHeight` attribute to paragraph and headings.
const LineHeight = Extension.create({
  name: "lineHeight",
  addOptions() {
    return { types: ["paragraph", "heading"] as string[] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.lineHeight || null,
            renderHTML: (attrs: { lineHeight?: string | null }) =>
              attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
          },
        },
      },
    ];
  },
});


function FontDropdown({
  value,
  onChange,
  placeholder,
  defaultLabel,
  triggerClassName,
}: {
  value: string;
  onChange: (font: string) => void;
  placeholder?: string;
  defaultLabel: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    FONT_OPTIONS.forEach((f) => loadGoogleFont(f));
  }, []);
  const displayFont = value || placeholder || "";
  const label = value || defaultLabel;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            "h-7 inline-flex items-center gap-1 rounded border border-input bg-background px-2 text-xs"
          }
          style={displayFont ? { fontFamily: `'${displayFont}', sans-serif` } : undefined}
          title="Font family"
        >
          <span className="truncate max-w-[160px]">{label}</span>
          <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-1 w-60 max-h-80 overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-accent text-muted-foreground"
        >
          {defaultLabel}
        </button>
        {FONT_OPTIONS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              loadGoogleFont(f);
              onChange(f);
              setOpen(false);
            }}
            className="w-full text-left px-2 py-1.5 text-base rounded hover:bg-accent"
            style={{ fontFamily: `'${f}', sans-serif` }}
          >
            {f}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function HeadingFontPicker({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (font: string) => void;
}) {
  return (
    <FontDropdown
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      defaultLabel={`Site default (${placeholder})`}
      triggerClassName="text-xs border rounded px-2 py-1 text-gray-600 bg-white inline-flex items-center gap-1"
    />
  );
}

// ============= Block model =============

export type GalleryItem = {
  url: string;
  alt?: string;
  credit?: string;
};

export type MediaWallItem =
  | { kind: "pinterest"; imageUrl: string }
  | { kind: "instagram"; url: string }
  | { kind: "tweet"; url: string }
  | { kind: "tiktok"; url: string };

export type Block =
  | { id: string; type: "paragraph"; html: string }
  | { id: string; type: "h1"; text: string; font?: string }
  | { id: string; type: "h2"; text: string; font?: string }
  | { id: string; type: "bullets"; html: string }
  | { id: string; type: "image"; url: string; alt?: string; credit?: string }
  | {
      id: string;
      type: "gallery";
      items: GalleryItem[];
      size?: "auto" | "portrait" | "square" | "landscape";
      layout?: "grid" | "one-plus-two" | "one-plus-three" | "two-plus-three" | "row" | "list";
    }
  | {
      id: string;
      type: "carousel";
      items: GalleryItem[];
      size?: "auto" | "portrait" | "square" | "landscape";
    }
  | { id: string; type: "separator" }
  | { id: string; type: "button"; label: string; url: string; style?: "default" | "branded" }
  | { id: string; type: "youtube"; videoId: string }
  | { id: string; type: "tiktok"; url: string }
  | {
      id: string;
      type: "pinterest";
      layout?: "single" | "wall";
      imageUrl?: string;
      images?: string[];
      items?: MediaWallItem[];
    }
  | { id: string; type: "social"; provider: "twitter" | "instagram" | "other"; url: string };

// Extract a TikTok video/photo id from a URL like
// https://www.tiktok.com/@user/video/1234567890
function extractTikTokId(url: string): string {
  const m = url.match(/\/(?:video|photo)\/(\d+)/);
  return m?.[1] ?? "";
}

const uid = () => Math.random().toString(36).slice(2, 10);

// ============= HTML <-> Blocks serialization =============

export function blocksToHtml(blocks: Block[], siteColor?: string | null): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "paragraph":
          return `<div data-block="paragraph" data-id="${b.id}">${b.html || "<p></p>"}</div>`;
        case "h1": {
          const fontStyle = b.font ? ` style="font-family:'${b.font}',serif"` : "";
          const fontAttr = b.font ? ` data-font="${escapeHtml(b.font)}"` : "";
          return `<div data-block="h1" data-id="${b.id}"${fontAttr}><h1${fontStyle}>${escapeHtml(b.text)}</h1></div>`;
        }
        case "h2": {
          const fontStyle = b.font ? ` style="font-family:'${b.font}',serif"` : "";
          const fontAttr = b.font ? ` data-font="${escapeHtml(b.font)}"` : "";
          return `<div data-block="h2" data-id="${b.id}"${fontAttr}><h2${fontStyle}>${escapeHtml(b.text)}</h2></div>`;
        }
        case "bullets":
          return `<div data-block="bullets" data-id="${b.id}">${b.html || "<ul><li></li></ul>"}</div>`;
        case "image":
          // Empty image placeholders render nothing on the published page.
          if (!b.url || !b.url.trim()) {
            return `<div data-block="image" data-id="${b.id}" data-empty="true"></div>`;
          }
          return `<figure data-block="image" data-id="${b.id}"><img src="${b.url}" alt="${escapeHtml(b.alt ?? "")}" />${b.credit ? `<figcaption>${escapeHtml(b.credit)}</figcaption>` : ""}</figure>`;
        case "gallery": {
          const size = b.size ?? "auto";
          const layout = b.layout ?? "grid";
          const aspectMap: Record<string, string> = {
            portrait: "3 / 4",
            square: "1 / 1",
            landscape: "16 / 9",
          };
          const cover = "width:100%;height:100%;object-fit:cover;display:block";
          const aspect = aspectMap[size];
          const imgStyleAuto = "width:100%;height:auto;display:block;border-radius:8px";
          const imgStyleCover = "width:100%;height:100%;object-fit:cover;display:block;border-radius:8px";
          const imgStyle = size === "auto" ? imgStyleAuto : imgStyleCover;
          const figStyle =
            size === "auto"
              ? ""
              : ` style="aspect-ratio:${aspect};overflow:hidden;border-radius:8px"`;
          const cap = (it: GalleryItem) =>
            it.credit
              ? `<figcaption style="margin-top:6px;font-size:0.85em;color:#6b7280;line-height:1.4">${escapeHtml(it.credit)}</figcaption>`
              : "";
          const renderFig = (it: GalleryItem) =>
            `<figure${figStyle}><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${imgStyle}" />${cap(it)}</figure>`;
          const box = (it: GalleryItem, a?: string) =>
            `<div style="overflow:hidden;border-radius:8px${a ? `;aspect-ratio:${a}` : ""}"><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${cover}" /></div>`;

          // Row: all images side by side, equal width, caption below each
          if (layout === "row") {
            const figs = b.items
              .map((it) => {
                const inner =
                  size === "auto"
                    ? `<img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${imgStyleAuto}" />`
                    : `<div style="aspect-ratio:${aspect};overflow:hidden;border-radius:8px"><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${cover}" /></div>`;
                return `<figure style="flex:1;min-width:0;margin:0">${inner}${cap(it)}</figure>`;
              })
              .join("");
            return `<div data-block="gallery" data-id="${b.id}" data-count="${b.items.length}" data-size="${size}" data-layout="row" style="display:flex;gap:8px;width:100%;align-items:flex-start">${figs}</div>`;
          }

          // List: vertical stack, each row = image 30% + caption 70%
          if (layout === "list") {
            const rows = b.items
              .map((it) => {
                const tile =
                  size === "auto"
                    ? `<div style="width:30%;flex-shrink:0;overflow:hidden;border-radius:8px"><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${imgStyleAuto}" /></div>`
                    : `<div style="width:30%;flex-shrink:0;aspect-ratio:${aspect};overflow:hidden;border-radius:8px"><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${cover}" /></div>`;
                const caption = `<div style="flex:1;font-size:0.95em;color:#374151;line-height:1.6">${it.credit ? escapeHtml(it.credit) : ""}</div>`;
                return `<div style="display:flex;gap:16px;align-items:flex-start">${tile}${caption}</div>`;
              })
              .join("");
            return `<div data-block="gallery" data-id="${b.id}" data-count="${b.items.length}" data-size="${size}" data-layout="list" style="display:flex;flex-direction:column;gap:16px;width:100%">${rows}</div>`;
          }

          if (layout === "one-plus-two" && b.items.length >= 3) {
            const [first, second, third] = b.items;
            const leftAspect = aspectMap[size] ?? "3 / 4";
            const leftBox = `<div style="width:60%;aspect-ratio:${leftAspect};overflow:hidden;border-radius:8px"><img src="${first.url}" alt="${escapeHtml(first.alt ?? "")}" style="${cover}" /></div>`;
            const smallBox = (it: GalleryItem) =>
              `<div style="flex:1;overflow:hidden;border-radius:8px;min-height:0"><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${cover}" /></div>`;
            const rightCol = `<div style="width:40%;display:flex;flex-direction:column;gap:8px">${smallBox(second)}${smallBox(third)}</div>`;
            return `<div data-block="gallery" data-id="${b.id}" data-count="${b.items.length}" data-size="${size}" data-layout="one-plus-two" style="display:flex;align-items:stretch;gap:8px;width:100%">${leftBox}${rightCol}</div>`;
          }

          if (layout === "one-plus-three" && b.items.length >= 4) {
            const [first, ...rest] = b.items;
            const topFig = `<figure style="margin:0"><div style="aspect-ratio:16/9;overflow:hidden;border-radius:8px"><img src="${first.url}" alt="${escapeHtml(first.alt ?? "")}" style="${cover}" /></div>${cap(first)}</figure>`;
            const smallAspect = size === "auto" ? "1 / 1" : aspectMap[size];
            const bottom = rest
              .slice(0, 3)
              .map(
                (it) =>
                  `<figure style="margin:0"><div style="aspect-ratio:${smallAspect};overflow:hidden;border-radius:8px"><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" style="${cover}" /></div>${cap(it)}</figure>`,
              )
              .join("");
            return `<div data-block="gallery" data-id="${b.id}" data-count="${b.items.length}" data-size="${size}" data-layout="one-plus-three" style="display:flex;flex-direction:column;gap:12px;width:100%">${topFig}<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${bottom}</div></div>`;
          }

          if (layout === "two-plus-three" && b.items.length >= 5) {
            const a = aspectMap[size] ?? "1 / 1";
            const top = b.items.slice(0, 2).map((it) => box(it, a)).join("");
            const bottom = b.items.slice(2, 5).map((it) => box(it, a)).join("");
            return `<div data-block="gallery" data-id="${b.id}" data-count="${b.items.length}" data-size="${size}" data-layout="two-plus-three" style="display:flex;flex-direction:column;gap:8px;width:100%"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${top}</div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">${bottom}</div></div>`;
          }

          const count = b.items.length;
          let cols = Math.min(Math.max(count, 1), 3);
          if (count === 4) cols = 2;
          if (count === 6) cols = 3;
          const figs = b.items.map(renderFig).join("");
          return `<div data-block="gallery" data-id="${b.id}" data-count="${b.items.length}" data-cols="${cols}" data-size="${size}" data-layout="grid" style="display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:8px">${figs}</div>`;
        }
        case "carousel": {
          const size = b.size ?? "auto";
          const aspectMap: Record<string, string> = {
            portrait: "3 / 4",
            square: "1 / 1",
            landscape: "16 / 9",
            auto: "16 / 9",
          };
          const slideAspect = aspectMap[size];
          const items = b.items.filter((it) => it.url);
          if (items.length === 0) {
            return `<div data-block="carousel" data-id="${b.id}" data-size="${size}" data-empty="true" style="margin:24px 0"></div>`;
          }
          const slides = items
            .map(
              (it, i) =>
                `<div id="ac-${b.id}-${i}" class="ac-slide" style="aspect-ratio:${slideAspect}"><img src="${it.url}" alt="${escapeHtml(it.alt ?? "")}" /></div>`,
            )
            .join("");
          const dots = items
            .map(
              (_it, i) =>
                `<a href="#ac-${b.id}-${i}" class="ac-dot" data-idx="${i}" aria-label="Go to slide ${i + 1}">●</a>`,
            )
            .join("");
          const prev = `<a href="#" class="ac-prev" aria-label="Previous slide">‹</a>`;
          const next = `<a href="#" class="ac-next" aria-label="Next slide">›</a>`;
          return `<div data-block="carousel" data-id="${b.id}" data-size="${size}" class="article-carousel"><div class="ac-track">${slides}</div>${prev}${next}<div class="ac-dots">${dots}</div></div>`;
        }
        case "separator":
          return `<hr data-block="separator" data-id="${b.id}" />`;
        case "button": {
          const isBranded = b.style === "branded" && !!siteColor;
          const styleAttr = isBranded
            ? `display:inline-block;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;background:#fff;color:${siteColor};border:2px solid ${siteColor};box-shadow:0 1px 2px rgba(0,0,0,0.05)`
            : `display:inline-block;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;background:#fff;color:#111827;border:1px solid #d1d5db;box-shadow:0 1px 2px rgba(0,0,0,0.05)`;
          return `<div data-block="button" data-id="${b.id}" data-style="${b.style ?? "default"}" style="display:flex;justify-content:center;margin:24px 0"><a href="${b.url}" target="_blank" rel="noopener noreferrer" style="${styleAttr}">${escapeHtml(b.label || "Learn more")}</a></div>`;
        }
        case "youtube":
          return `<div data-block="youtube" data-id="${b.id}" style="position:relative;width:100%;padding-bottom:56.25%;margin:2rem 0;border-radius:8px;overflow:hidden;background:#000"><iframe src="https://www.youtube.com/embed/${b.videoId}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`;
        case "tiktok": {
          const vid = extractTikTokId(b.url);
          return `<div data-block="tiktok" data-id="${b.id}" style="display:flex;justify-content:center;margin:2rem auto;max-width:400px"><blockquote class="tiktok-embed" cite="${b.url}" data-video-id="${vid}" style="max-width:400px;min-width:280px;width:100%;margin:0 auto"><section><a href="${b.url}">View on TikTok</a></section></blockquote></div>`;
        }
        case "pinterest": {
          const layout = b.layout === "wall" ? "wall" : "single";
          const attribution = `<div style="display:flex;align-items:center;gap:4px;margin-top:8px;font-size:12px;color:#9ca3af"><svg width="10" height="10" viewBox="0 0 24 24" fill="#E60023" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>Images via Pinterest</div>`;
          if (layout === "wall") {
            // Backward-compat: convert legacy images to pinterest items
            const items: MediaWallItem[] =
              b.items && b.items.length
                ? b.items
                : (b.images ?? [])
                    .filter((u) => u && u.trim())
                    .map((u) => ({ kind: "pinterest" as const, imageUrl: u }));
            const filtered = items.filter((it) =>
              it.kind === "pinterest" ? !!it.imageUrl : !!it.url,
            );
            if (filtered.length === 0) {
              return `<div data-block="pinterest" data-id="${b.id}" data-layout="wall" data-empty="true" style="margin:24px 0"></div>`;
            }
            const dataItems = ` data-items="${escapeHtml(JSON.stringify(filtered))}"`;
            const renderItem = (it: MediaWallItem, i: number): string => {
              if (it.kind === "pinterest") {
                return `<img src="${escapeHtml(it.imageUrl)}" alt="Pinterest inspiration ${i + 1}" style="width:100%;object-fit:cover;border-radius:12px;margin-bottom:12px;break-inside:avoid;display:block" />`;
              }
              if (it.kind === "tweet") {
                return `<div style="break-inside:avoid;margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;background:#fff"><blockquote class="twitter-tweet" data-lang="en"><a href="${escapeHtml(it.url)}">${escapeHtml(it.url)}</a></blockquote></div>`;
              }
              if (it.kind === "instagram") {
                return `<div style="break-inside:avoid;margin-bottom:12px;border-radius:12px;overflow:hidden"><blockquote class="instagram-media" data-instgrm-permalink="${escapeHtml(it.url)}" data-instgrm-version="14" style="width:100%;min-width:0"><a href="${escapeHtml(it.url)}">${escapeHtml(it.url)}</a></blockquote></div>`;
              }
              // tiktok
              const vid = extractTikTokId(it.url);
              return `<div style="break-inside:avoid;margin-bottom:12px;border-radius:12px;overflow:hidden"><blockquote class="tiktok-embed" cite="${escapeHtml(it.url)}" data-video-id="${vid}" style="max-width:100%;min-width:0"><section><a href="${escapeHtml(it.url)}">View on TikTok</a></section></blockquote></div>`;
            };
            const renderedItems = filtered.map(renderItem).join("");
            return `<div data-block="pinterest" data-id="${b.id}" data-layout="wall" data-masonry="true"${dataItems} style="margin:24px 0"><div class="pinterest-wall-columns" style="column-gap:12px">${renderedItems}</div>${attribution}</div>`;
          }
          if (!b.imageUrl) {
            return `<div data-block="pinterest" data-id="${b.id}" data-layout="single" data-empty="true" style="margin:24px 0"></div>`;
          }
          return `<div data-block="pinterest" data-id="${b.id}" data-layout="single" data-image-url="${escapeHtml(b.imageUrl)}" style="margin:24px 0"><img src="${escapeHtml(b.imageUrl)}" alt="Pinterest inspiration" style="width:100%;object-fit:cover;border-radius:12px;display:block" />${attribution}</div>`;
        }
        case "social":
          if (b.provider === "twitter")
            return `<div data-block="social" data-provider="twitter" data-id="${b.id}"><blockquote class="twitter-tweet"><a href="${b.url}">${b.url}</a></blockquote></div>`;
          if (b.provider === "instagram")
            return `<div data-block="social" data-provider="instagram" data-id="${b.id}"><blockquote class="instagram-media" data-instgrm-permalink="${b.url}"><a href="${b.url}">${b.url}</a></blockquote></div>`;
          return `<div data-block="social" data-provider="other" data-id="${b.id}"><p><a href="${b.url}">${b.url}</a></p></div>`;
      }
    })
    .join("\n");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlToBlocks(html: string): Block[] {
  if (!html || !html.trim()) {
    return [{ id: uid(), type: "paragraph", html: "<p></p>" }];
  }
  const normalizedPlainText =
    html.includes("\\n\\n") && !html.includes("\n\n") ? html.replace(/\\n/g, "\n") : html;
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(normalizedPlainText);
  if (!looksLikeHtml && /\n\s*\n/.test(normalizedPlainText)) {
    const parts = normalizedPlainText
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      return parts.map((part) => ({
        id: uid(),
        type: "paragraph",
        html: `<p>${escapeHtml(part).replace(/\n/g, "<br/>")}</p>`,
      }));
    }
  }
  if (typeof window === "undefined") {
    return [{ id: uid(), type: "paragraph", html }];
  }
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return [{ id: uid(), type: "paragraph", html }];

  const blocks: Block[] = [];
  const tagged = root.querySelectorAll("[data-block]");
  if (tagged.length > 0) {
    tagged.forEach((el) => {
      const t = el.getAttribute("data-block");
      const id = el.getAttribute("data-id") ?? uid();
      if (t === "paragraph") {
        blocks.push({ id, type: "paragraph", html: el.innerHTML });
      } else if (t === "h1") {
        const font = el.getAttribute("data-font") ?? undefined;
        blocks.push({ id, type: "h1", text: el.textContent ?? "", ...(font ? { font } : {}) });
      } else if (t === "h2") {
        const font = el.getAttribute("data-font") ?? undefined;
        blocks.push({ id, type: "h2", text: el.textContent ?? "", ...(font ? { font } : {}) });
      } else if (t === "bullets") {
        blocks.push({ id, type: "bullets", html: el.innerHTML });
      } else if (t === "image") {
        const img = el.querySelector("img");
        const cap = el.querySelector("figcaption");
        blocks.push({
          id,
          type: "image",
          url: img?.getAttribute("src") ?? "",
          alt: img?.getAttribute("alt") ?? "",
          credit: cap?.textContent ?? "",
        });
      } else if (t === "gallery") {
        const figItems: GalleryItem[] = Array.from(el.querySelectorAll("figure")).map((fig) => {
          const cap = fig.querySelector("figcaption");
          const img = fig.querySelector("img");
          return {
            url: img?.getAttribute("src") ?? "",
            alt: img?.getAttribute("alt") ?? "",
            credit: cap?.textContent ?? "",
          };
        });
        const imgItems: GalleryItem[] = Array.from(el.querySelectorAll("img")).map((img) => ({
          url: img.getAttribute("src") ?? "",
          alt: img.getAttribute("alt") ?? "",
        }));
        const finalItems = figItems.filter((x) => x.url).length
          ? figItems.filter((x) => x.url)
          : imgItems.filter((x) => x.url);
        const sizeAttr = el.getAttribute("data-size");
        const size =
          sizeAttr === "portrait" || sizeAttr === "square" || sizeAttr === "landscape"
            ? sizeAttr
            : "auto";
        const layoutAttr = el.getAttribute("data-layout");
        const layout: "grid" | "one-plus-two" | "one-plus-three" | "two-plus-three" | "row" | "list" =
          layoutAttr === "one-plus-two" ||
          layoutAttr === "one-plus-three" ||
          layoutAttr === "two-plus-three" ||
          layoutAttr === "row" ||
          layoutAttr === "list"
            ? layoutAttr
            : "grid";
        blocks.push({
          id,
          type: "gallery",
          items: finalItems.length ? finalItems : [{ url: "" }, { url: "" }],
          size,
          layout,
        });
      } else if (t === "carousel") {
        const carouselItems: GalleryItem[] = Array.from(el.querySelectorAll("img")).map(
          (img) => ({
            url: img.getAttribute("src") ?? "",
            alt: img.getAttribute("alt") ?? "",
          }),
        );
        const sizeAttr = el.getAttribute("data-size");
        const size =
          sizeAttr === "portrait" || sizeAttr === "square" || sizeAttr === "landscape"
            ? sizeAttr
            : "auto";
        blocks.push({
          id,
          type: "carousel",
          items: carouselItems.filter((x) => x.url).length
            ? carouselItems.filter((x) => x.url)
            : [{ url: "" }, { url: "" }, { url: "" }],
          size,
        });
      } else if (t === "separator") {
        blocks.push({ id, type: "separator" });
      } else if (t === "button") {
        const a = el.querySelector("a");
        const styleAttr = el.getAttribute("data-style");
        const style = styleAttr === "branded" ? "branded" : "default";
        blocks.push({
          id,
          type: "button",
          label: a?.textContent ?? "Button",
          url: a?.getAttribute("href") ?? "",
          style,
        });
      } else if (t === "youtube") {
        const iframe = el.querySelector("iframe");
        const src = iframe?.getAttribute("src") ?? "";
        const m = src.match(/embed\/([^?&/]+)/);
        blocks.push({ id, type: "youtube", videoId: m?.[1] ?? "" });
      } else if (t === "tiktok") {
        const a = el.querySelector("a");
        blocks.push({ id, type: "tiktok", url: a?.getAttribute("href") ?? "" });
      } else if (t === "pinterest") {
        const layoutAttr = el.getAttribute("data-layout");
        const layout: "single" | "wall" = layoutAttr === "wall" ? "wall" : "single";
        if (layout === "wall") {
          const dataItemsAttr = el.getAttribute("data-items");
          let items: MediaWallItem[] = [];
          if (dataItemsAttr) {
            try {
              const parsed = JSON.parse(dataItemsAttr);
              if (Array.isArray(parsed)) items = parsed as MediaWallItem[];
            } catch {
              // ignore
            }
          }
          if (items.length === 0) {
            const dataImages = el.getAttribute("data-images") ?? "";
            let images = dataImages ? dataImages.split("|").filter(Boolean) : [];
            if (images.length === 0) {
              images = Array.from(el.querySelectorAll("img"))
                .map((im) => im.getAttribute("src") ?? "")
                .filter(Boolean);
            }
            items = images.map((u) => ({ kind: "pinterest", imageUrl: u }));
          }
          blocks.push({ id, type: "pinterest", layout: "wall", items });
        } else {
          const img = el.querySelector("img");
          const imageUrl =
            el.getAttribute("data-image-url") ?? img?.getAttribute("src") ?? "";
          blocks.push({ id, type: "pinterest", layout: "single", imageUrl });
        }
      } else if (t === "social") {
        const provider = (el.getAttribute("data-provider") ?? "other") as
          | "twitter"
          | "instagram"
          | "other";
        const a = el.querySelector("a");
        blocks.push({
          id,
          type: "social",
          provider,
          url: a?.getAttribute("href") ?? "",
        });
      }
    });
    if (blocks.length === 0) blocks.push({ id: uid(), type: "paragraph", html: "<p></p>" });
    return blocks;
  }

  // Fallback: convert legacy HTML by walking children of root
  Array.from(root.children).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "h1") {
      blocks.push({ id: uid(), type: "h1", text: el.textContent ?? "" });
    } else if (tag === "h2") {
      blocks.push({ id: uid(), type: "h2", text: el.textContent ?? "" });
    } else if (tag === "ul" || tag === "ol") {
      blocks.push({ id: uid(), type: "bullets", html: el.outerHTML });
    } else if (tag === "figure") {
      const img = el.querySelector("img");
      const cap = el.querySelector("figcaption");
      if (img)
        blocks.push({
          id: uid(),
          type: "image",
          url: img.getAttribute("src") ?? "",
          alt: img.getAttribute("alt") ?? "",
          credit: cap?.textContent ?? "",
        });
    } else if (tag === "img") {
      blocks.push({
        id: uid(),
        type: "image",
        url: (el as HTMLImageElement).src,
        alt: (el as HTMLImageElement).alt,
      });
    } else if (tag === "iframe") {
      const src = (el as HTMLIFrameElement).src;
      const m = src.match(/embed\/([^?&/]+)/);
      if (m) blocks.push({ id: uid(), type: "youtube", videoId: m[1] });
    } else if (tag === "blockquote") {
      const cls = el.getAttribute("class") ?? "";
      const a = el.querySelector("a");
      const url = a?.getAttribute("href") ?? "";
      if (cls.includes("twitter"))
        blocks.push({ id: uid(), type: "social", provider: "twitter", url });
      else if (cls.includes("instagram"))
        blocks.push({ id: uid(), type: "social", provider: "instagram", url });
      else blocks.push({ id: uid(), type: "social", provider: "other", url });
    } else {
      blocks.push({ id: uid(), type: "paragraph", html: el.outerHTML });
    }
  });

  if (blocks.length === 0) blocks.push({ id: uid(), type: "paragraph", html: html });
  return blocks;
}

// Auto-insert an empty image placeholder block after every N paragraph blocks,
// but only if there isn't already an image block adjacent. This is a one-time
// transform applied when the editor first loads existing content so editors
// have natural slots to drop inline images into.
export function interleaveImagePlaceholders(blocks: Block[], every = 2): Block[] {
  const out: Block[] = [];
  let paragraphCount = 0;
  blocks.forEach((b, i) => {
    out.push(b);
    if (b.type === "paragraph") {
      paragraphCount++;
      const next = blocks[i + 1];
      const nextIsImage = next && (next.type === "image" || next.type === "gallery");
      if (paragraphCount % every === 0 && !nextIsImage) {
        out.push({ id: uid(), type: "image", url: "", alt: "" });
      }
    }
  });
  return out;
}

// ============= AI selection context =============

type AiSelection = {
  blockId: string;
  text: string;
  editor: TiptapEditor;
};

type AiContextValue = {
  setSelection: (s: AiSelection | null) => void;
  setFocusedBlockId: (id: string | null) => void;
  openWithSelection: (s: AiSelection) => void;
};

const AiCtxRef: { current: AiContextValue | null } = { current: null };

// ============= Inline rich text (paragraph & bullets) =============

function InlineEditor({
  value,
  onChange,
  bullets,
  placeholder,
  blockId,
}: {
  value: string;
  onChange: (html: string) => void;
  bullets?: boolean;
  placeholder?: string;
  blockId?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      FontSize,
      FontFamily.configure({ types: ["textStyle"] }),
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LineHeight,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
    ],
    content: value || (bullets ? "<ul><li></li></ul>" : "<p></p>"),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: ({ editor }) => {
      if (!blockId || !AiCtxRef.current) return;
      const { from, to, empty } = editor.state.selection;
      if (empty) {
        AiCtxRef.current.setSelection(null);
        AiCtxRef.current.setFocusedBlockId(blockId);
        return;
      }
      const text = editor.state.doc.textBetween(from, to, " ");
      if (text.trim()) {
        AiCtxRef.current.setSelection({ blockId, text, editor });
      }
    },
    onFocus: () => {
      if (blockId && AiCtxRef.current) AiCtxRef.current.setFocusedBlockId(blockId);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose max-w-none min-h-[60px] focus:outline-none",
        "data-placeholder": placeholder ?? "",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Preload Google fonts for the font-family dropdown.
  useEffect(() => {
    FONT_OPTIONS.forEach((f) => loadGoogleFont(f));
  }, []);

  if (!editor) return null;

  const insertLink = () => {
    const url = prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const askAi = () => {
    if (!AiCtxRef.current) return;
    const { from, to, empty } = editor.state.selection;
    if (empty) return;
    const text = editor.state.doc.textBetween(from, to, " ");
    if (!text.trim() || !blockId) return;
    AiCtxRef.current.openWithSelection({ blockId, text, editor });
  };

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  const setHeading = (level: 0 | 1 | 2 | 3) => {
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
  };

  const currentHeading = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : "0";

  const currentFont = (editor.getAttributes("textStyle").fontFamily as string) || "";
  const currentSize = (editor.getAttributes("textStyle").fontSize as string) || "";
  const currentLineHeight =
    (editor.getAttributes("paragraph").lineHeight as string) ||
    (editor.getAttributes("heading").lineHeight as string) ||
    "";

  const TBtn = ({
    active,
    onClick,
    title,
    children,
  }: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs ${
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="mx-0.5 inline-block h-5 w-px bg-border" />;

  return (
    <div className="space-y-1">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-1 overflow-x-auto rounded-md border border-border/70 bg-card/95 px-1.5 py-1 shadow-sm backdrop-blur">
        {/* Row 1: text style */}
        <TBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </TBtn>
        <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded px-1.5 text-xs hover:bg-muted" title="Text color">
          <Palette className="h-3.5 w-3.5" />
          <input
            type="color"
            className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>
        <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded px-1.5 text-xs hover:bg-muted" title="Highlight color">
          <Highlighter className="h-3.5 w-3.5" />
          <input
            type="color"
            className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
            onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
          />
        </label>

        <Divider />

        {/* Row 2: paragraph style */}
        <FontDropdown
          value={currentFont}
          defaultLabel="Font"
          onChange={(f) => {
            if (!f) editor.chain().focus().unsetFontFamily().run();
            else {
              loadGoogleFont(f);
              editor.chain().focus().setFontFamily(f).run();
            }
          }}
        />
        <select
          value={currentSize}
          onChange={(e) => {
            const s = e.target.value;
            if (!s) editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
            else editor.chain().focus().setMark("textStyle", { fontSize: s }).run();
          }}
          className="h-7 rounded border border-input bg-background px-1 text-xs"
          title="Font size"
        >
          <option value="">Size</option>
          {["12px", "14px", "16px", "18px", "24px", "32px", "48px", "64px", "80px", "96px", "128px", "160px"].map((s) => (
            <option key={s} value={s}>
              {s.replace("px", "")}
            </option>
          ))}
        </select>
        <select
          value={currentHeading}
          onChange={(e) => setHeading(Number(e.target.value) as 0 | 1 | 2 | 3)}
          className="h-7 rounded border border-input bg-background px-1 text-xs"
          title="Heading style"
        >
          <option value="0">Normal</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>

        <Divider />

        {/* Row 3: lists and alignment */}
        <TBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <ListIcon className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn
          onClick={() =>
            editor.isActive("listItem")
              ? editor.chain().focus().sinkListItem("listItem").run()
              : null
          }
          title="Indent"
        >
          <IndentIncrease className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn
          onClick={() =>
            editor.isActive("listItem")
              ? editor.chain().focus().liftListItem("listItem").run()
              : null
          }
          title="Outdent"
        >
          <IndentDecrease className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">
          <AlignLeft className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">
          <AlignCenter className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">
          <AlignRight className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify">
          <AlignJustify className="h-3.5 w-3.5" />
        </TBtn>
        <select
          value={currentLineHeight}
          onChange={(e) => {
            const v = e.target.value;
            editor.chain().focus().updateAttributes("paragraph", { lineHeight: v || null }).updateAttributes("heading", { lineHeight: v || null }).run();
          }}
          className="h-7 rounded border border-input bg-background px-1 text-xs"
          title="Line spacing"
        >
          <option value="">Spacing</option>
          {["1", "1.15", "1.25", "1.5", "1.75", "2", "2.5", "3"].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <Divider />

        {/* Row 4: insert */}
        <TBtn active={editor.isActive("link")} onClick={insertLink} title="Link">
          <LinkIcon className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={clearFormatting} title="Clear formatting">
          <Eraser className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={askAi} title="Ask AI about selection">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </TBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}


// ============= Unsplash search dialog =============

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string };
  alt_description: string | null;
  user: { name: string };
}

function UnsplashDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (url: string, alt: string, credit: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

  const search = async () => {
    if (!query.trim()) return;
    if (!accessKey) {
      setError("VITE_UNSPLASH_ACCESS_KEY is not configured");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?per_page=18&query=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Client-ID ${accessKey}` } },
      );
      if (!res.ok) throw new Error(`Unsplash error ${res.status}`);
      const json = (await res.json()) as { results: UnsplashPhoto[] };
      setResults(json.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Search Unsplash</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search Unsplash…"
            autoFocus
          />
          <Button type="button" onClick={search} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                onPick(
                  p.urls.regular,
                  p.alt_description ?? "",
                  `Photo by ${p.user.name} on Unsplash`,
                )
              }
              className="group relative aspect-[4/3] overflow-hidden rounded-md border"
            >
              <img
                src={p.urls.small}
                alt={p.alt_description ?? ""}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
                {p.user.name}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============= Pexels search dialog =============

interface PexelsPhoto {
  id: number;
  src: { medium: string; large: string };
  alt: string;
  photographer: string;
}

function PexelsDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (url: string, alt: string, credit: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

  const search = async () => {
    if (!query.trim()) return;
    if (!apiKey) {
      setError("VITE_PEXELS_API_KEY is not configured");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?per_page=18&query=${encodeURIComponent(query)}`,
        { headers: { Authorization: apiKey } },
      );
      if (!res.ok) throw new Error(`Pexels error ${res.status}`);
      const json = (await res.json()) as { photos: PexelsPhoto[] };
      setResults(json.photos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Search Pexels</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search Pexels…"
            autoFocus
          />
          <Button type="button" onClick={search} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.src.large, p.alt, `Photo by ${p.photographer} on Pexels`)}
              className="group relative aspect-[4/3] overflow-hidden rounded-md border"
            >
              <img
                src={p.src.medium}
                alt={p.alt}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
                {p.photographer}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============= YouTube search dialog =============

interface YouTubeResult {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
}

function YouTubeSearchDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (videoId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;

  const search = async () => {
    if (!query.trim()) return;
    if (!apiKey) {
      setError("VITE_YOUTUBE_API_KEY is not configured");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(query)}&key=${apiKey}`,
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`YouTube error ${res.status}: ${body.slice(0, 200)}`);
      }
      const json = (await res.json()) as { items: YouTubeResult[] };
      setResults(json.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const insertFromUrl = () => {
    const id = youtubeIdFromUrl(urlInput.trim());
    if (!id) {
      setError("Could not parse YouTube URL");
      return;
    }
    onPick(id);
    setUrlInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add YouTube video</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search YouTube…"
              autoFocus
            />
            <Button type="button" onClick={search} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && insertFromUrl()}
              placeholder="…or paste a YouTube URL"
              className="text-xs"
            />
            <Button type="button" variant="outline" onClick={insertFromUrl}>
              Insert
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
            {results.map((r) => {
              const thumb = r.snippet.thumbnails.medium?.url ?? r.snippet.thumbnails.default?.url;
              return (
                <button
                  key={r.id.videoId}
                  type="button"
                  onClick={() => onPick(r.id.videoId)}
                  className="group overflow-hidden rounded-md border text-left hover:border-primary"
                >
                  {thumb && (
                    <img
                      src={thumb}
                      alt={r.snippet.title}
                      className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <div className="space-y-0.5 p-2">
                    <p className="line-clamp-2 text-xs font-medium leading-snug">
                      {r.snippet.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{r.snippet.channelTitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============= TikTok dialog =============

function TikTokDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (url: string) => void;
}) {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const insert = () => {
    const trimmed = urlInput.trim();
    if (!trimmed.includes("tiktok.com")) {
      setError("Please paste a valid TikTok URL");
      return;
    }
    onPick(trimmed);
    setUrlInput("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add TikTok video</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste a TikTok video URL to embed it in your article.
          </p>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && insert()}
              placeholder="https://www.tiktok.com/@user/video/..."
              autoFocus
            />
            <Button type="button" onClick={insert}>
              Insert
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const i = parts.indexOf("embed");
    if (i >= 0) return parts[i + 1] ?? null;
    return null;
  } catch {
    return null;
  }
}

function detectSocial(url: string): "twitter" | "instagram" | "other" {
  if (/twitter\.com|x\.com/i.test(url)) return "twitter";
  if (/instagram\.com/i.test(url)) return "instagram";
  return "other";
}

// ============= Add-block menu =============

function AddBlockMenu({ onAdd }: { onAdd: (block: Block) => void }) {
  const [open, setOpen] = useState(false);
  const [unsplashOpen, setUnsplashOpen] = useState(false);
  const [pexelsOpen, setPexelsOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [tiktokOpen, setTiktokOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const close = () => setOpen(false);

  const addImageByUrl = () => {
    const url = prompt("Image URL");
    if (!url) return;
    onAdd({ id: uid(), type: "image", url });
    close();
  };
  const addYouTube = () => {
    setYoutubeOpen(true);
    close();
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      onAdd({ id: uid(), type: "image", url: data.publicUrl, alt: file.name });
      close();
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? `Upload failed: ${e.message}. Make sure the "post-images" storage bucket exists and is public.`
          : "Upload failed",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const items: { label: string; icon: React.ReactNode; onClick: () => void }[] = [
    {
      label: "Paragraph",
      icon: <Type className="h-4 w-4" />,
      onClick: () => {
        onAdd({ id: uid(), type: "paragraph", html: "<p></p>" });
        close();
      },
    },
    {
      label: "Heading 1",
      icon: <Heading1 className="h-4 w-4" />,
      onClick: () => {
        onAdd({ id: uid(), type: "h1", text: "" });
        close();
      },
    },
    {
      label: "Heading 2",
      icon: <Heading2 className="h-4 w-4" />,
      onClick: () => {
        onAdd({ id: uid(), type: "h2", text: "" });
        close();
      },
    },
    {
      label: uploading ? "Uploading…" : "Upload image",
      icon: <Upload className="h-4 w-4" />,
      onClick: () => fileInputRef.current?.click(),
    },
    {
      label: "Image by URL",
      icon: <ImageIcon className="h-4 w-4" />,
      onClick: addImageByUrl,
    },
    {
      label: "Image from Unsplash",
      icon: <Search className="h-4 w-4" />,
      onClick: () => {
        setUnsplashOpen(true);
        close();
      },
    },
    {
      label: "Image from Pexels",
      icon: <Search className="h-4 w-4" />,
      onClick: () => {
        setPexelsOpen(true);
        close();
      },
    },
    {
      label: "YouTube video",
      icon: <Youtube className="h-4 w-4" />,
      onClick: addYouTube,
    },
    {
      label: "📌 Media Wall",
      icon: <span className="text-base leading-none">📌</span>,
      onClick: () => {
        onAdd({ id: uid(), type: "pinterest", layout: "single", imageUrl: "" });
        close();
      },
    },
    {
      label: "Gallery (2 images)",
      icon: <Images className="h-4 w-4" />,
      onClick: () => {
        onAdd({ id: uid(), type: "gallery", items: [{ url: "" }, { url: "" }] });
        close();
      },
    },
    {
      label: "Gallery (3 images)",
      icon: <Images className="h-4 w-4" />,
      onClick: () => {
        onAdd({ id: uid(), type: "gallery", items: [{ url: "" }, { url: "" }, { url: "" }] });
        close();
      },
    },
    {
      label: "Gallery 1+2 (editorial)",
      icon: <Images className="h-4 w-4" />,
      onClick: () => {
        onAdd({
          id: uid(),
          type: "gallery",
          layout: "one-plus-two",
          size: "portrait",
          items: [{ url: "" }, { url: "" }, { url: "" }],
        });
        close();
      },
    },
    {
      label: "Gallery (4 images)",
      icon: <Images className="h-4 w-4" />,
      onClick: () => {
        onAdd({
          id: uid(),
          type: "gallery",
          layout: "row",
          size: "square",
          items: [{ url: "" }, { url: "" }, { url: "" }, { url: "" }],
        });
        close();
      },
    },
    {
      label: "Gallery (5 images)",
      icon: <Images className="h-4 w-4" />,
      onClick: () => {
        onAdd({
          id: uid(),
          type: "gallery",
          layout: "row",
          size: "square",
          items: [{ url: "" }, { url: "" }, { url: "" }, { url: "" }, { url: "" }],
        });
        close();
      },
    },
    {
      label: "Gallery (6 images)",
      icon: <Images className="h-4 w-4" />,
      onClick: () => {
        onAdd({
          id: uid(),
          type: "gallery",
          layout: "row",
          size: "square",
          items: [
            { url: "" },
            { url: "" },
            { url: "" },
            { url: "" },
            { url: "" },
            { url: "" },
          ],
        });
        close();
      },
    },
    {
      label: "Carousel",
      icon: <Images className="h-4 w-4" />,
      onClick: () => {
        onAdd({
          id: uid(),
          type: "carousel",
          size: "landscape",
          items: [{ url: "" }, { url: "" }, { url: "" }],
        });
        close();
      },
    },
    {
      label: "Separator",
      icon: <Minus className="h-4 w-4" />,
      onClick: () => {
        onAdd({ id: uid(), type: "separator" });
        close();
      },
    },
    {
      label: "Button",
      icon: <MousePointerClick className="h-4 w-4" />,
      onClick: () => {
        onAdd({ id: uid(), type: "button", label: "", url: "" });
        close();
      },
    },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div className="relative flex items-center justify-center py-1.5">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border/60" />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary data-[state=open]:border-primary data-[state=open]:text-primary"
              aria-label="Add block"
            >
              <Plus className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-1">
            <div className="grid">
              {items.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  onClick={it.onClick}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {it.icon}
                  {it.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <UnsplashDialog
        open={unsplashOpen}
        onOpenChange={setUnsplashOpen}
        onPick={async (url, alt, credit) => {
          setUnsplashOpen(false);
          const t = toast.loading("Saving image…");
          const stored = await storeRemoteImage(url, "unsplash");
          toast.dismiss(t);
          onAdd({ id: uid(), type: "image", url: stored, alt, credit });
        }}
      />
      <PexelsDialog
        open={pexelsOpen}
        onOpenChange={setPexelsOpen}
        onPick={async (url, alt, credit) => {
          setPexelsOpen(false);
          const t = toast.loading("Saving image…");
          const stored = await storeRemoteImage(url, "pexels");
          toast.dismiss(t);
          onAdd({ id: uid(), type: "image", url: stored, alt, credit });
        }}
      />
      <YouTubeSearchDialog
        open={youtubeOpen}
        onOpenChange={setYoutubeOpen}
        onPick={(videoId) => {
          onAdd({ id: uid(), type: "youtube", videoId });
          setYoutubeOpen(false);
        }}
      />
      <TikTokDialog
        open={tiktokOpen}
        onOpenChange={setTiktokOpen}
        onPick={(url) => {
          onAdd({ id: uid(), type: "tiktok", url });
          setTiktokOpen(false);
        }}
      />
    </>
  );
}

// ============= TikTok block body =============

function TikTokBlockBody({
  block,
  onChange,
}: {
  block: Extract<Block, { type: "tiktok" }>;
  onChange: (b: Block) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      {block.url ? (
        <div className="rounded-md border bg-muted/30 p-3 text-xs">
          <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
            <Music2 className="h-3.5 w-3.5" />
            TikTok video
          </div>
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary underline"
          >
            {block.url}
          </a>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
          No TikTok video
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={block.url}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="Add TikTok URL"
          className="text-xs"
        />
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Music2 className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <TikTokDialog
        open={open}
        onOpenChange={setOpen}
        onPick={(url) => {
          onChange({ ...block, url });
          setOpen(false);
        }}
      />
    </div>
  );
}

// ============= Block render =============

function BlockView({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  siteColor,
  siteFont,
  onEditImage,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  siteColor?: string | null;
  siteFont?: string | null;
  onEditImage?: (imageUrl: string, onSave: (newUrl: string) => void) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const [galleryUploadIdx, setGalleryUploadIdx] = useState<number | null>(null);
  const [imageUnsplashOpen, setImageUnsplashOpen] = useState(false);
  const [imagePexelsOpen, setImagePexelsOpen] = useState(false);
  const [galleryUnsplashIdx, setGalleryUnsplashIdx] = useState<number | null>(null);
  const [galleryPexelsIdx, setGalleryPexelsIdx] = useState<number | null>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const carouselFileRef = useRef<HTMLInputElement>(null);
  const [carouselUploadIdx, setCarouselUploadIdx] = useState<number | null>(null);

  const uploadInlineImage = async (file: File) => {
    if (block.type !== "image") return;
    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      onChange({ ...block, url: data.publicUrl, alt: file.name });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? `Upload failed: ${e.message}` : "Upload failed");
    } finally {
      setImageUploading(false);
      if (imageFileRef.current) imageFileRef.current.value = "";
    }
  };

  const promptUrlForImage = () => {
    if (block.type !== "image") return;
    const url = prompt("Paste image URL");
    if (!url || !url.trim()) return;
    onChange({ ...block, url: url.trim() });
  };

  const uploadGalleryImage = async (idx: number, file: File) => {
    if (block.type !== "gallery") return;
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      const items = block.items.map((it, i) =>
        i === idx ? { ...it, url: data.publicUrl, alt: it.alt || file.name } : it,
      );
      onChange({ ...block, items });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? `Upload failed: ${e.message}` : "Upload failed");
    }
  };

  const uploadCarouselImage = async (idx: number, file: File) => {
    if (block.type !== "carousel") return;
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      const items = block.items.map((it, i) =>
        i === idx ? { ...it, url: data.publicUrl, alt: it.alt || file.name } : it,
      );
      onChange({ ...block, items });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? `Upload failed: ${e.message}` : "Upload failed");
    }
  };

  let body: React.ReactNode;
  let bodyWrapperClass: string | undefined;
  switch (block.type) {
    case "paragraph":
      bodyWrapperClass =
        "rounded-lg border border-border/70 bg-card/60 p-4 shadow-sm transition-colors focus-within:border-primary/60 focus-within:bg-card";
      body = (
        <InlineEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          placeholder="Write something…"
          blockId={block.id}
        />
      );
      break;
    case "h1": {
      const activeFont = block.font ?? siteFont ?? undefined;
      body = (
        <div className="space-y-2">
          <HeadingFontPicker
            value={block.font ?? ""}
            placeholder={siteFont ?? "Inter"}
            onChange={(font) => onChange({ ...block, font: font || undefined })}
          />
          <Input
            ref={inputRef}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Heading 1"
            className="border-0 bg-transparent px-0 text-3xl font-bold shadow-none focus-visible:ring-0"
            style={activeFont ? { fontFamily: `'${activeFont}', serif` } : undefined}
          />
        </div>
      );
      break;
    }
    case "h2": {
      const activeFont = block.font ?? siteFont ?? undefined;
      body = (
        <div className="space-y-2">
          <HeadingFontPicker
            value={block.font ?? ""}
            placeholder={siteFont ?? "Inter"}
            onChange={(font) => onChange({ ...block, font: font || undefined })}
          />
          <Input
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Heading 2"
            className="border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
            style={activeFont ? { fontFamily: `'${activeFont}', serif` } : undefined}
          />
        </div>
      );
      break;
    }
    case "bullets":
      body = (
        <InlineEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
          bullets
          placeholder="List item"
          blockId={block.id}
        />
      );
      break;
    case "image":
      body = (
        <div className="space-y-2">
          {block.url ? (
            <div className="group relative overflow-hidden rounded-md border bg-muted">
              <img src={block.url} alt={block.alt ?? ""} className="h-auto w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
              <button
                type="button"
                onClick={() =>
                  block.type === "image" &&
                  onEditImage?.(block.url ?? "", (newUrl) => onChange({ ...block, url: newUrl }))
                }
                className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-800 opacity-0 shadow-lg transition-all group-hover:opacity-100"
              >
                ✏️ Edit image
              </button>
            </div>
          ) : (
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              <ImageIcon className="h-6 w-6 opacity-60" />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setImageUnsplashOpen(true)}>
                  <Search className="mr-1.5 h-3.5 w-3.5" />
                  Search Unsplash
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setImagePexelsOpen(true)}>
                  <Search className="mr-1.5 h-3.5 w-3.5" />
                  Search Pexels
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={imageUploading} onClick={() => imageFileRef.current?.click()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {imageUploading ? "Uploading…" : "Upload file"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={promptUrlForImage}>
                  <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
                  Paste URL
                </Button>
              </div>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadInlineImage(f);
                }}
              />
              <span className="text-xs">Optional — leave empty to skip on the published page</span>
            </div>
          )}
          {block.url && (
            <>
              <div className="flex gap-2">
                <Input
                  value={block.url}
                  onChange={(e) => onChange({ ...block, url: e.target.value })}
                  placeholder="Image URL"
                  className="text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 shrink-0"
                  onClick={() => setImageUnsplashOpen(true)}
                >
                  <Search className="mr-1 h-3.5 w-3.5" />
                  Replace
                </Button>
              </div>
              <Input
                value={block.credit ?? ""}
                onChange={(e) => onChange({ ...block, credit: e.target.value })}
                placeholder="Caption / credit (optional)"
                className="text-xs"
              />
            </>
          )}
          <UnsplashDialog
            open={imageUnsplashOpen}
            onOpenChange={setImageUnsplashOpen}
            onPick={(url, alt, credit) => {
              onChange({ ...block, url, alt, credit });
              setImageUnsplashOpen(false);
            }}
          />
          <PexelsDialog
            open={imagePexelsOpen}
            onOpenChange={setImagePexelsOpen}
            onPick={(url, alt, credit) => {
              onChange({ ...block, url, alt, credit });
              setImagePexelsOpen(false);
            }}
          />
        </div>
      );
      break;
    case "youtube":
      body = (
        <div className="space-y-2">
          {block.videoId ? (
            <div className="aspect-video overflow-hidden rounded-md border">
              <iframe
                src={`https://www.youtube.com/embed/${block.videoId}`}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
              No video
            </div>
          )}
          <Input
            value={block.videoId}
            onChange={(e) => onChange({ ...block, videoId: e.target.value })}
            placeholder="YouTube video ID"
            className="text-xs"
          />
        </div>
      );
      break;
    case "tiktok":
      body = <TikTokBlockBody block={block} onChange={onChange} />;
      break;
    case "pinterest": {
      const layout: "single" | "wall" = block.layout === "wall" ? "wall" : "single";
      const legacyItems: MediaWallItem[] =
        block.items && block.items.length
          ? block.items
          : (block.images ?? []).map((u) => ({ kind: "pinterest" as const, imageUrl: u }));
      const wallItems: MediaWallItem[] =
        legacyItems.length >= 2
          ? legacyItems
          : [
              ...legacyItems,
              ...Array.from({ length: 2 - legacyItems.length }, () => ({
                kind: "pinterest" as const,
                imageUrl: "",
              })),
            ];
      const updateItems = (items: MediaWallItem[]) =>
        onChange({ ...block, items, images: undefined });
      body = (
        <div className="space-y-3">
          {/* Layout selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                onChange({ ...block, layout: "single", imageUrl: block.imageUrl ?? "" })
              }
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                layout !== "wall"
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              Single Image
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...block, layout: "wall", items: wallItems })}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                layout === "wall"
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              📌 Media Wall
            </button>
          </div>

          {/* Single layout */}
          {layout !== "wall" && (
            <input
              type="text"
              placeholder="Pin image URL (https://i.pinimg.com/1200x/...)"
              value={block.imageUrl ?? ""}
              onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          )}

          {/* Wall layout */}
          {layout === "wall" && (
            <div className="space-y-2">
              {wallItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>

                  {item.kind === "pinterest" && (
                    <input
                      type="text"
                      placeholder={`Pin image URL ${i < 2 ? "(required)" : ""}`}
                      value={item.imageUrl ?? ""}
                      onChange={(e) => {
                        const updated = [...wallItems];
                        updated[i] = { ...item, imageUrl: e.target.value };
                        updateItems(updated);
                      }}
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                  )}

                  {(item.kind === "tweet" ||
                    item.kind === "instagram" ||
                    item.kind === "tiktok") && (
                    <input
                      type="text"
                      placeholder={
                        item.kind === "tweet"
                          ? "X / Twitter post URL"
                          : item.kind === "instagram"
                            ? "Instagram post URL"
                            : "TikTok video URL"
                      }
                      value={item.url ?? ""}
                      onChange={(e) => {
                        const updated = [...wallItems];
                        updated[i] = { ...item, url: e.target.value };
                        updateItems(updated);
                      }}
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                  )}

                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
                    {item.kind === "pinterest"
                      ? "📌"
                      : item.kind === "tweet"
                        ? "𝕏"
                        : item.kind === "instagram"
                          ? "📸"
                          : "🎵"}
                  </span>

                  {i >= 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateItems(wallItems.filter((_, idx) => idx !== i))
                      }
                      className="text-gray-400 hover:text-red-500 text-lg"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <div className="flex flex-col gap-1 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    updateItems([...wallItems, { kind: "pinterest", imageUrl: "" }])
                  }
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <span className="text-lg leading-none">+</span> Add another image
                </button>
                <button
                  type="button"
                  onClick={() => updateItems([...wallItems, { kind: "tweet", url: "" }])}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span className="text-lg leading-none">+</span> Add a 𝕏 / Tweet
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateItems([...wallItems, { kind: "instagram", url: "" }])
                  }
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span className="text-lg leading-none">+</span> Add an Instagram post
                </button>
                <button
                  type="button"
                  onClick={() => updateItems([...wallItems, { kind: "tiktok", url: "" }])}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span className="text-lg leading-none">+</span> Add a TikTok video
                </button>
              </div>
            </div>
          )}

          {/* Single preview */}
          {layout !== "wall" && block.imageUrl && (
            <img
              src={block.imageUrl}
              alt="Preview"
              className="w-full object-cover rounded-lg mt-2 max-h-64"
            />
          )}

          {/* Attribution */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#E60023">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            Images via Pinterest
          </div>
        </div>
      );
      break;
    }
    case "gallery":
      body = (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Size:</span>
            {(["auto", "portrait", "square", "landscape"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  block.type === "gallery" && onChange({ ...block, size: s })
                }
                className={`px-2 py-1 rounded border ${
                  (block.size ?? "auto") === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {(() => {
              const len = block.items.length;
              const opts: { value: NonNullable<typeof block.layout>; label: string }[] =
                len === 3
                  ? [
                      { value: "grid", label: "Grid" },
                      { value: "one-plus-two", label: "1 + 2" },
                    ]
                  : len === 4
                    ? [
                        { value: "row", label: "Row" },
                        { value: "list", label: "List" },
                        { value: "one-plus-three", label: "1 + 3" },
                      ]
                    : len === 5
                      ? [
                          { value: "row", label: "Row" },
                          { value: "list", label: "List" },
                        ]
                      : len === 6
                        ? [{ value: "row", label: "Row" }]
                        : [];
              if (opts.length === 0) return null;
              return (
                <>
                  <span className="ml-2 text-muted-foreground">Layout:</span>
                  {opts.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() =>
                        block.type === "gallery" && onChange({ ...block, layout: o.value })
                      }
                      className={`px-2 py-1 rounded border ${
                        (block.layout ?? "grid") === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </>
              );
            })()}
          </div>
          {(() => {
            const size = block.type === "gallery" ? block.size ?? "auto" : "auto";
            const aspectMap: Record<string, string> = {
              portrait: "3 / 4",
              square: "1 / 1",
              landscape: "16 / 9",
            };
            const tileAspectStyle =
              size === "auto" ? {} : { aspectRatio: aspectMap[size] };
            const isAuto = size === "auto";
            const layout = block.layout ?? "grid";

            const renderTile = (it: GalleryItem, i: number, opts?: { fillHeight?: boolean }) => (
              <div
                className="group relative overflow-hidden rounded-md border bg-muted"
                style={
                  opts?.fillHeight
                    ? { ...tileAspectStyle, width: "100%" }
                    : tileAspectStyle
                }
              >
                {it.url ? (
                  <>
                    <img
                      src={it.url}
                      alt={it.alt ?? ""}
                      className={
                        isAuto
                          ? "h-32 w-full object-cover"
                          : "h-full w-full object-cover absolute inset-0"
                      }
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
                    <button
                      type="button"
                      onClick={() =>
                        block.type === "gallery" &&
                        onEditImage?.(it.url, (newUrl) => {
                          const items = block.items.map((x, j) =>
                            j === i ? { ...x, url: newUrl } : x,
                          );
                          onChange({ ...block, items });
                        })
                      }
                      className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-800 opacity-0 shadow-lg transition-all group-hover:opacity-100"
                    >
                      ✏️ Edit
                    </button>
                  </>
                ) : (
                  <div
                    className={
                      isAuto
                        ? "flex h-32 items-center justify-center text-xs text-muted-foreground"
                        : "flex h-full w-full items-center justify-center text-xs text-muted-foreground"
                    }
                  >
                    Image {i + 1}
                  </div>
                )}
              </div>
            );

            const renderControls = (it: GalleryItem, i: number) => (
              <>
                <div className="flex gap-1">
                  <Input
                    value={it.url}
                    onChange={(e) => {
                      const items = block.items.map((x, j) =>
                        j === i ? { ...x, url: e.target.value } : x,
                      );
                      onChange({ ...block, items });
                    }}
                    placeholder="Image URL"
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-2"
                    onClick={() => {
                      setGalleryUploadIdx(i);
                      galleryFileRef.current?.click();
                    }}
                    aria-label="Upload"
                    title="Upload file"
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-2"
                    onClick={() => setGalleryUnsplashIdx(i)}
                    aria-label="Search Unsplash"
                    title="Search Unsplash"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 px-2 text-green-700 hover:text-green-800"
                    onClick={() => setGalleryPexelsIdx(i)}
                    aria-label="Search Pexels"
                    title="Search Pexels"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span className="ml-0.5 text-[10px] font-bold">P</span>
                  </Button>
                </div>
                <Input
                  value={it.credit ?? ""}
                  onChange={(e) => {
                    const items = block.items.map((x, j) =>
                      j === i ? { ...x, credit: e.target.value } : x,
                    );
                    onChange({ ...block, items });
                  }}
                  placeholder="Caption (optional)"
                  className="text-xs"
                />
              </>
            );

            // List layout: vertical, each row = tile 30% + controls 70%
            if (layout === "list") {
              return (
                <div className="flex flex-col gap-4">
                  {block.items.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3"
                    >
                      <div className="w-[30%] shrink-0">{renderTile(it, i)}</div>
                      <div className="flex-1 space-y-1">{renderControls(it, i)}</div>
                    </div>
                  ))}
                </div>
              );
            }

            // Row layout: side-by-side, equal width
            if (layout === "row") {
              return (
                <div className="flex gap-2 items-start">
                  {block.items.map((it, i) => (
                    <div key={i} className="flex-1 min-w-0 space-y-1">
                      {renderTile(it, i)}
                      {renderControls(it, i)}
                    </div>
                  ))}
                </div>
              );
            }

            // 1 + 3: first full width, then 3 in a row
            if (layout === "one-plus-three" && block.items.length >= 4) {
              const [first, ...rest] = block.items;
              return (
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    {renderTile(first, 0)}
                    {renderControls(first, 0)}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {rest.slice(0, 3).map((it, k) => {
                      const i = k + 1;
                      return (
                        <div key={i} className="space-y-1">
                          {renderTile(it, i)}
                          {renderControls(it, i)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Default: grid (also covers one-plus-two, two-plus-three legacy)
            const cols =
              block.items.length === 4
                ? 2
                : block.items.length === 6
                  ? 3
                  : block.items.length === 5
                    ? 3
                    : Math.min(Math.max(block.items.length, 1), 3);
            return (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {block.items.map((it, i) => (
                  <div key={i} className="space-y-1">
                    {renderTile(it, i)}
                    {renderControls(it, i)}
                  </div>
                ))}
              </div>
            );
          })()}
          <input
            ref={galleryFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && galleryUploadIdx !== null) uploadGalleryImage(galleryUploadIdx, f);
              if (galleryFileRef.current) galleryFileRef.current.value = "";
              setGalleryUploadIdx(null);
            }}
          />
          <UnsplashDialog
            open={galleryUnsplashIdx !== null}
            onOpenChange={(v) => { if (!v) setGalleryUnsplashIdx(null); }}
            onPick={(url, alt, credit) => {
              if (block.type !== "gallery" || galleryUnsplashIdx === null) return;
              const items = block.items.map((x, j) =>
                j === galleryUnsplashIdx ? { ...x, url, alt, credit } : x,
              );
              onChange({ ...block, items });
              setGalleryUnsplashIdx(null);
            }}
          />
          <PexelsDialog
            open={galleryPexelsIdx !== null}
            onOpenChange={(v) => { if (!v) setGalleryPexelsIdx(null); }}
            onPick={(url, alt, credit) => {
              if (block.type !== "gallery" || galleryPexelsIdx === null) return;
              const items = block.items.map((x, j) =>
                j === galleryPexelsIdx ? { ...x, url, alt, credit } : x,
              );
              onChange({ ...block, items });
              setGalleryPexelsIdx(null);
            }}
          />
        </div>
      );
      break;
    case "carousel": {
      const cSize = block.size ?? "auto";
      const cAspectMap: Record<string, string> = {
        auto: "16 / 9",
        portrait: "3 / 4",
        square: "1 / 1",
        landscape: "16 / 9",
      };
      const cAspect = cAspectMap[cSize];
      body = (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Size:</span>
            {(["auto", "portrait", "square", "landscape"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  block.type === "carousel" && onChange({ ...block, size: s })
                }
                className={`px-2 py-1 rounded border ${
                  (block.size ?? "auto") === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <span className="ml-auto text-muted-foreground">
              {block.items.length} / 9 images
            </span>
          </div>
          <div
            className="flex gap-2 overflow-x-auto rounded-md border bg-muted/30 p-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {block.items.map((it, i) => (
              <div
                key={i}
                className="relative shrink-0 overflow-hidden rounded-md bg-muted"
                style={{
                  width: "60%",
                  aspectRatio: cAspect,
                  scrollSnapAlign: "start",
                }}
              >
                {it.url ? (
                  <img
                    src={it.url}
                    alt={it.alt ?? ""}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    Slide {i + 1}
                  </div>
                )}
                {block.items.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (block.type !== "carousel") return;
                      onChange({
                        ...block,
                        items: block.items.filter((_, j) => j !== i),
                      });
                    }}
                    className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-800 shadow"
                    aria-label="Remove slide"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {block.items.map((it, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-6 shrink-0 text-xs text-muted-foreground">
                  {i + 1}.
                </span>
                <Input
                  value={it.url}
                  onChange={(e) => {
                    if (block.type !== "carousel") return;
                    const items = block.items.map((x, j) =>
                      j === i ? { ...x, url: e.target.value } : x,
                    );
                    onChange({ ...block, items });
                  }}
                  placeholder="Image URL"
                  className="text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-2"
                  onClick={() => {
                    setCarouselUploadIdx(i);
                    carouselFileRef.current?.click();
                  }}
                  aria-label="Upload"
                  title="Upload file"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          {block.items.length < 9 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (block.type !== "carousel") return;
                onChange({ ...block, items: [...block.items, { url: "" }] });
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add image
            </Button>
          )}
          <input
            ref={carouselFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && carouselUploadIdx !== null) uploadCarouselImage(carouselUploadIdx, f);
              if (carouselFileRef.current) carouselFileRef.current.value = "";
              setCarouselUploadIdx(null);
            }}
          />
        </div>
      );
      break;
    }
    case "social":
      body = (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AtSign className="h-3.5 w-3.5" />
            {block.provider === "twitter"
              ? "Twitter / X embed"
              : block.provider === "instagram"
                ? "Instagram embed"
                : "Link embed"}
          </div>
          <Input
            value={block.url}
            onChange={(e) =>
              onChange({ ...block, url: e.target.value, provider: detectSocial(e.target.value) })
            }
            placeholder="Post URL"
            className="text-xs"
          />
          {block.url && (
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-xs text-primary underline"
            >
              {block.url}
            </a>
          )}
        </div>
      );
      break;
    case "separator":
      body = <hr className="my-2 border-t border-border" />;
      break;
    case "button": {
      const isBranded = block.style === "branded";
      const brandedStyle: CSSProperties = siteColor
        ? { border: `2px solid ${siteColor}`, color: siteColor, background: "#fff" }
        : { border: "2px solid #999", color: "#333", background: "#fff" };
      body = (
        <div className="space-y-2">
          <div className="flex justify-center py-2">
            <span
              className="inline-flex items-center justify-center rounded px-5 py-2.5 text-sm font-semibold shadow-sm"
              style={
                isBranded
                  ? brandedStyle
                  : { border: "1px solid #d1d5db", color: "#111827", background: "#fff" }
              }
            >
              {block.label || "Learn more"}
            </span>
          </div>
          <Input
            value={block.label}
            maxLength={120}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Name"
            className="text-xs"
          />
          <div className="text-right text-[10px] text-muted-foreground">
            {(block.label?.length ?? 0)}/120
          </div>
          <Input
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="Link (https://…)"
            className="text-xs"
          />
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => onChange({ ...block, style: "default" })}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                isBranded ? "border-gray-200" : "border-blue-500 bg-blue-50"
              }`}
            >
              <div className="px-4 py-2 rounded border border-gray-300 shadow-sm bg-white text-black text-sm font-medium">
                Button
              </div>
              <span className="text-xs text-gray-500">Default</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...block, style: "branded" })}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                isBranded ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <div
                className="px-4 py-2 rounded text-sm font-medium bg-white shadow-sm"
                style={brandedStyle}
              >
                Button
              </div>
              <span className="text-xs text-gray-500">Branded</span>
            </button>
          </div>
        </div>
      );
      break;
    }
  }

  return (
    <div className="group/block relative rounded-md border border-transparent px-2 py-1 pr-10 hover:border-border hover:bg-muted/30">
      <div className="absolute right-1 top-1 flex flex-col gap-0.5 opacity-60 transition-opacity group-hover/block:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Move block up"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Move block down"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Delete block"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {bodyWrapperClass ? <div className={bodyWrapperClass}>{body}</div> : body}
    </div>
  );
}

// ============= AI Assistant Panel =============

type AiAction =
  | "rewrite"
  | "expand"
  | "shorten"
  | "tone_enthusiastic"
  | "tone_formal"
  | "tone_casual"
  | "generate_related"
  | "custom";

type AiMode =
  | { kind: "closed" }
  | { kind: "selection"; selection: AiSelection }
  | { kind: "no_selection" };

function AiAssistantPanel({
  mode,
  onClose,
  articleTitle,
  articleSynopsis,
  onAcceptReplace,
  onAcceptInsertAfter,
  focusedBlockId,
}: {
  mode: AiMode;
  onClose: () => void;
  articleTitle: string;
  articleSynopsis: string;
  onAcceptReplace: (selection: AiSelection, newText: string) => void;
  onAcceptInsertAfter: (afterBlockId: string | null, newText: string) => void;
  focusedBlockId: string | null;
}) {
  const callAi = async ({ data }: { data: { action: AiAction; selectedText: string; customPrompt: string; articleTitle: string; articleSynopsis: string } }) => {
    const prompts: Record<AiAction, string> = {
      rewrite: `Rewrite the following text in the same enthusiastic fan voice. Keep the meaning and roughly the same length. Return only the rewritten text, no preamble.\n\nTEXT:\n${data.selectedText}`,
      expand: `Expand the following text into a longer, more detailed paragraph. Keep the same enthusiastic fan voice. Return only the expanded text, no preamble.\n\nTEXT:\n${data.selectedText}`,
      shorten: `Condense the following text to roughly half its length while keeping the key facts and enthusiastic voice. Return only the shortened text, no preamble.\n\nTEXT:\n${data.selectedText}`,
      tone_enthusiastic: `Rewrite with a MORE enthusiastic, hyped fan tone. Keep the meaning. Return only the rewritten text.\n\nTEXT:\n${data.selectedText}`,
      tone_formal: `Rewrite with a more formal, journalistic tone. Keep the meaning. Return only the rewritten text.\n\nTEXT:\n${data.selectedText}`,
      tone_casual: `Rewrite with a more casual, conversational tone. Keep the meaning. Return only the rewritten text.\n\nTEXT:\n${data.selectedText}`,
      generate_related: `Write ONE new paragraph (3-6 sentences) related to this article's topic. Match the enthusiastic fan voice. Return only the paragraph text.`,
      custom: `${data.customPrompt}\n\n${data.selectedText ? `SELECTED TEXT:\n${data.selectedText}` : ""}\n\nReturn only the resulting text, no preamble.`,
    };
    try {
      const { data: result, error } = await supabase.functions.invoke("smart-service", {
        body: {
          systemPrompt: `You are an AI writing assistant for a fan site. You write in an enthusiastic fan voice unless told otherwise. Return ONLY the requested text — no preamble, no markdown fences.\n\nARTICLE CONTEXT\nTitle: ${data.articleTitle || "(untitled)"}\nSynopsis:\n${data.articleSynopsis || "(empty)"}`,
          userMessage: prompts[data.action],
          maxTokens: 1500,
        },
      });
      if (error) return { ok: false as const, error: error.message };
      const text = (result as { text?: string } | null)?.text?.trim() ?? "";
      return { ok: true as const, text };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "AI request failed" };
    }
  };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultAction, setResultAction] = useState<AiAction | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [toneOpen, setToneOpen] = useState(false);

  useEffect(() => {
    if (mode.kind === "closed") {
      setResult(null);
      setResultAction(null);
      setCustomPrompt("");
      setLoading(false);
      setToneOpen(false);
    }
  }, [mode.kind]);

  if (mode.kind === "closed") return null;

  const selectedText = mode.kind === "selection" ? mode.selection.text : "";

  const run = async (action: AiAction, prompt = "") => {
    setLoading(true);
    setResult(null);
    setResultAction(action);
    setToneOpen(false);
    try {
      const res = await callAi({
        data: {
          action,
          selectedText,
          customPrompt: prompt,
          articleTitle,
          articleSynopsis,
        },
      });
      if (!res.ok) {
        toast.error(res.error);
        setResult(null);
        setResultAction(null);
      } else {
        setResult(res.text);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
      setResult(null);
      setResultAction(null);
    } finally {
      setLoading(false);
    }
  };

  const accept = () => {
    if (!result) return;
    if (resultAction === "generate_related") {
      onAcceptInsertAfter(focusedBlockId, result);
    } else if (mode.kind === "selection") {
      onAcceptReplace(mode.selection, result);
    } else {
      onAcceptInsertAfter(focusedBlockId, result);
    }
    onClose();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] rounded-lg border bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI assistant
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-3">
        {mode.kind === "selection" && (
          <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground line-clamp-3">
            "{selectedText}"
          </div>
        )}

        {!result && !loading && mode.kind === "selection" && (
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => run("rewrite")}>
              Rewrite
            </Button>
            <Button size="sm" variant="outline" onClick={() => run("expand")}>
              Expand
            </Button>
            <Button size="sm" variant="outline" onClick={() => run("shorten")}>
              Make shorter
            </Button>
            <Popover open={toneOpen} onOpenChange={setToneOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  Change tone <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-1">
                <button
                  type="button"
                  className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onClick={() => run("tone_enthusiastic")}
                >
                  More enthusiastic
                </button>
                <button
                  type="button"
                  className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onClick={() => run("tone_formal")}
                >
                  More formal
                </button>
                <button
                  type="button"
                  className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onClick={() => run("tone_casual")}
                >
                  More casual
                </button>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {!result && !loading && mode.kind === "no_selection" && (
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full"
              variant="outline"
              onClick={() => run("generate_related")}
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Generate related paragraph
            </Button>
            <div className="text-xs text-muted-foreground">Or write your own instruction:</div>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Write an intro paragraph in a punchy fan voice…"
              rows={3}
              className="text-sm"
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!customPrompt.trim()}
              onClick={() => run("custom", customPrompt)}
            >
              Generate
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </div>
        )}

        {result && !loading && (
          <div className="space-y-2">
            <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-2 text-sm">
              {result}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={accept}>
                <Check className="mr-1 h-3.5 w-3.5" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setResult(null);
                  setResultAction(null);
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= Image editor modal =============

export function ImageEditorModal({
  open,
  imageUrl,
  onClose,
  onApply,
}: {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onApply: (newUrl: string) => void;
}) {
  const [editorTab, setEditorTab] = useState<"Basic Edits" | "AI Tools">("Basic Edits");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [cropRatio, setCropRatio] = useState<number | null>(null);
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);
  const [upscaleMode, setUpscaleMode] = useState("2x");
  const [upscaleStyle, setUpscaleStyle] = useState("Photography");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImage = useRef<HTMLImageElement | null>(null);

  const sourceUrl = imageUrl ?? "";

  // Load image into canvas when modal opens
  useEffect(() => {
    if (!open || !sourceUrl) return;
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setCropRatio(null);
    setEditorTab("Basic Edits");
    setAiProcessing(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      sourceImage.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
    };
    img.onerror = () => {
      console.error("Failed to load image for editor:", sourceUrl);
    };
    img.src = sourceUrl;
  }, [open, sourceUrl]);

  // Re-render canvas when crop changes
  useEffect(() => {
    const img = sourceImage.current;
    const canvas = canvasRef.current;
    if (!open || !img || !canvas) return;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    let sx = 0;
    let sy = 0;
    let sw = w;
    let sh = h;
    if (cropRatio) {
      const currentRatio = w / h;
      if (currentRatio > cropRatio) {
        sw = h * cropRatio;
        sx = (w - sw) / 2;
      } else {
        sh = w / cropRatio;
        sy = (h - sh) / 2;
      }
      w = Math.round(sw);
      h = Math.round(sh);
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = "none";
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  }, [cropRatio, open]);

  const applyEdits = async () => {
    const img = sourceImage.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    // Render with filters baked in
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    let sx = 0;
    let sy = 0;
    let sw = w;
    let sh = h;
    if (cropRatio) {
      const currentRatio = w / h;
      if (currentRatio > cropRatio) {
        sw = h * cropRatio;
        sx = (w - sw) / 2;
      } else {
        sh = w / cropRatio;
        sy = (h - sh) / 2;
      }
      w = Math.round(sw);
      h = Math.round(sh);
    }
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

    await new Promise<void>((resolve) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            resolve();
            return;
          }
          try {
            const filename = `edited/${Date.now()}.jpg`;
            const { error } = await supabase.storage
              .from("post-images")
              .upload(filename, blob, { contentType: "image/jpeg" });
            if (error) {
              console.error(error);
              toast.error("Could not save edited image");
              resolve();
              return;
            }
            const {
              data: { publicUrl },
            } = supabase.storage.from("post-images").getPublicUrl(filename);
            onApply(publicUrl);
          } catch (e) {
            console.error(e);
            toast.error("Could not save edited image");
          } finally {
            resolve();
          }
        },
        "image/jpeg",
        0.92,
      );
    });
  };

  const removeBackground = async () => {
    if (!sourceUrl) return;
    setAiProcessing("removebg");
    try {
      const apiKey = import.meta.env.VITE_REMOVEBG_API_KEY as string | undefined;
      if (!apiKey) throw new Error("Missing VITE_REMOVEBG_API_KEY");
      const formData = new FormData();
      const imgRes = await fetch(sourceUrl);
      const imgBlob = await imgRes.blob();
      formData.append("image_file", imgBlob);
      formData.append("size", "auto");
      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey },
        body: formData,
      });
      if (!res.ok) throw new Error("Remove.bg failed");
      const blob = await res.blob();
      const filename = `edited/nobg-${Date.now()}.png`;
      const { error } = await supabase.storage
        .from("post-images")
        .upload(filename, blob, { contentType: "image/png" });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(filename);
      onApply(publicUrl);
    } catch (e) {
      console.error("Remove.bg error:", e);
      toast.error("Background removal failed. Please try again.");
    } finally {
      setAiProcessing(null);
    }
  };

  const enhanceWithMagnific = async () => {
    if (!sourceUrl) return;
    if (
      !window.confirm(
        `This will use Magnific AI credits (~$${upscaleMode === "4x" ? "0.16" : "0.08"}). Continue?`,
      )
    )
      return;
    setAiProcessing("magnific");
    try {
      const imgRes = await fetch(sourceUrl);
      const imgBlob = await imgRes.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(imgBlob);
      });

      const { data, error } = await supabase.functions.invoke("magnific-enhance", {
        body: {
          imageBase64: base64,
          scaleFactor: upscaleMode,
          optimizedFor: upscaleStyle,
        },
      });

      if (error || !data?.base64) throw new Error(error?.message || "No result returned");

      const resultBlob = await fetch(`data:image/jpeg;base64,${data.base64}`).then((r) =>
        r.blob(),
      );
      const filename = `edited/magnific-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filename, resultBlob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(filename);
      onApply(publicUrl);
    } catch (e) {
      console.error("Magnific error:", e);
      toast.error("AI enhancement failed. Please try again.");
    } finally {
      setAiProcessing(null);
    }
  };

  if (!open || !sourceUrl) return null;

  const ratios: { label: string; value: number | null }[] = [
    { label: "Original", value: null },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "1:1", value: 1 },
    { label: "4:5", value: 4 / 5 },
    { label: "9:16", value: 9 / 16 },
  ];
  const tabs: ("Basic Edits" | "AI Tools")[] = ["Basic Edits", "AI Tools"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Edit Image</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyEdits}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              ✓ Apply & Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex border-b px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setEditorTab(tab)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                editorTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 items-center justify-center bg-gray-100 p-6">
            <canvas
              ref={canvasRef}
              className="max-h-full max-w-full rounded-lg shadow-lg"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
              }}
            />
          </div>

          <div className="w-72 space-y-6 overflow-y-auto border-l p-6">
            {editorTab === "Basic Edits" && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Crop & Resize
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ratios.map(({ label, value }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setCropRatio(value)}
                        className={`rounded-lg border py-2 text-sm transition-all ${
                          cropRatio === value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Brightness: {brightness}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contrast: {contrast}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Saturation: {saturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                    setSaturation(100);
                    setCropRatio(null);
                  }}
                  className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50"
                >
                  Reset all
                </button>
              </>
            )}

            {editorTab === "AI Tools" && (
              <div className="space-y-4">
                <div className="rounded-xl border p-4">
                  <h4 className="mb-1 font-medium text-gray-900">Remove Background</h4>
                  <p className="mb-3 text-xs text-gray-500">
                    Powered by Remove.bg · ~$0.02/image
                  </p>
                  <button
                    type="button"
                    onClick={removeBackground}
                    disabled={!!aiProcessing}
                    className="w-full rounded-lg bg-gray-900 py-2.5 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {aiProcessing === "removebg" ? "⏳ Removing..." : "✂️ Remove Background"}
                  </button>
                </div>

                <div className="rounded-xl border p-4">
                  <h4 className="mb-1 font-medium text-gray-900">AI Enhance & Upscale</h4>
                  <p className="mb-3 text-xs text-gray-500">
                    Powered by Magnific · ~$0.08-0.16/image · Takes 30-60 seconds
                  </p>
                  <select
                    value={upscaleMode}
                    onChange={(e) => setUpscaleMode(e.target.value)}
                    className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="2x">2× upscale</option>
                    <option value="4x">4× upscale</option>
                  </select>
                  <select
                    value={upscaleStyle}
                    onChange={(e) => setUpscaleStyle(e.target.value)}
                    className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="Photography">Photography</option>
                    <option value="Portrait Soft">Portrait</option>
                    <option value="Art">Art</option>
                    <option value="Illustrations">Illustration</option>
                    <option value="Nature">Nature</option>
                    <option value="Standard Ultra">Standard</option>
                  </select>
                  <button
                    type="button"
                    onClick={enhanceWithMagnific}
                    disabled={!!aiProcessing}
                    className="w-full rounded-lg bg-purple-600 py-2.5 text-sm text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {aiProcessing === "magnific" ? "⏳ Enhancing..." : "✨ Enhance with AI"}
                  </button>
                  {aiProcessing === "magnific" && (
                    <p className="mt-2 text-center text-xs text-gray-400">
                      This takes 30-60 seconds...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= Main editor =============

interface BlockEditorProps {
  value: string;
  onChange: (html: string) => void;
  articleTitle?: string;
  siteColor?: string | null;
  siteFont?: string | null;
  openImageEditor?: (imageUrl: string, onSave: (newUrl: string) => void) => void;
}

export function BlockEditor({
  value,
  onChange,
  articleTitle = "",
  siteColor,
  siteFont,
  openImageEditor: externalOpenImageEditor,
}: BlockEditorProps) {
  useEffect(() => {
    loadGoogleFont(siteFont);
  }, [siteFont]);
  const [blocks, setBlocks] = useState<Block[]>(() =>
    interleaveImagePlaceholders(htmlToBlocks(value)),
  );
  const initialized = useRef(true);

  // AI state
  const [selection, setSelection] = useState<AiSelection | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>({ kind: "closed" });

  // Internal image editor modal state (used as fallback when no external opener provided)
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [onImageSave, setOnImageSave] = useState<((url: string) => void) | null>(null);

  const openImageEditor = (imageUrl: string, onSave: (newUrl: string) => void) => {
    if (externalOpenImageEditor) {
      externalOpenImageEditor(imageUrl, onSave);
      return;
    }
    setEditingImageUrl(imageUrl);
    setOnImageSave(() => onSave);
    setImageEditorOpen(true);
  };

  // Re-init when external value changes from empty -> loaded (e.g. async fetch).
  useEffect(() => {
    if (!initialized.current) return;
    setBlocks(interleaveImagePlaceholders(htmlToBlocks(value)));
    initialized.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    onChange(blocksToHtml(blocks, siteColor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Register AI context (module-level ref, simplest cross-tree wiring)
  useEffect(() => {
    AiCtxRef.current = {
      setSelection,
      setFocusedBlockId,
      openWithSelection: (s) => {
        setSelection(s);
        setAiMode({ kind: "selection", selection: s });
      },
    };
    return () => {
      AiCtxRef.current = null;
    };
  }, []);

  const insertAt = (idx: number, b: Block) =>
    setBlocks((prev) => [...prev.slice(0, idx), b, ...prev.slice(idx)]);
  const updateAt = (idx: number, b: Block) =>
    setBlocks((prev) => prev.map((x, i) => (i === idx ? b : x)));
  const removeAt = (idx: number) =>
    setBlocks((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [{ id: uid(), type: "paragraph", html: "<p></p>" }];
    });
  const moveBy = (idx: number, delta: number) =>
    setBlocks((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    });

  const openAi = () => {
    if (selection) {
      setAiMode({ kind: "selection", selection });
    } else {
      setAiMode({ kind: "no_selection" });
    }
  };

  const acceptReplace = (sel: AiSelection, newText: string) => {
    const { editor } = sel;
    try {
      const { from, to } = editor.state.selection;
      // Insert as plain text with paragraph breaks preserved
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent(newText.replace(/\n/g, "<br/>"))
        .run();
    } catch (e) {
      console.error("Failed to replace selection", e);
      toast.error("Could not replace selection");
    }
  };

  const acceptInsertAfter = (afterBlockId: string | null, newText: string) => {
    const html = newText
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");
    const newBlock: Block = { id: uid(), type: "paragraph", html };
    setBlocks((prev) => {
      const idx = afterBlockId ? prev.findIndex((b) => b.id === afterBlockId) : prev.length - 1;
      const at = idx >= 0 ? idx + 1 : prev.length;
      return [...prev.slice(0, at), newBlock, ...prev.slice(at)];
    });
  };

  // Build current article synopsis text (plain) for AI context
  const articleSynopsisHtml = blocksToHtml(blocks, siteColor);

  return (
    <div
      className="rounded-md border bg-background p-2"
      style={siteFont ? { fontFamily: `'${siteFont}', system-ui, sans-serif` } : undefined}
    >
      {/* Top toolbar with AI button */}
      <div className="flex items-center justify-end border-b pb-2">
        <Button type="button" size="sm" variant="outline" onClick={openAi} className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI
        </Button>
      </div>

      <div className="group/divider">
        <AddBlockMenu onAdd={(b) => insertAt(0, b)} />
      </div>
      {blocks.map((b, idx) => (
        <div key={b.id}>
          <BlockView
            block={b}
            onChange={(nb) => updateAt(idx, nb)}
            onDelete={() => removeAt(idx)}
            onMoveUp={() => moveBy(idx, -1)}
            onMoveDown={() => moveBy(idx, 1)}
            canMoveUp={idx > 0}
            canMoveDown={idx < blocks.length - 1}
            siteColor={siteColor}
            siteFont={siteFont}
            onEditImage={openImageEditor}
          />
          <div className="group/divider">
            <AddBlockMenu onAdd={(nb) => insertAt(idx + 1, nb)} />
          </div>
        </div>
      ))}

      <ImageEditorModal
        open={imageEditorOpen}
        imageUrl={editingImageUrl}
        onClose={() => setImageEditorOpen(false)}
        onApply={(newUrl) => {
          onImageSave?.(newUrl);
          setImageEditorOpen(false);
        }}
      />

      <AiAssistantPanel
        mode={aiMode}
        onClose={() => setAiMode({ kind: "closed" })}
        articleTitle={articleTitle}
        articleSynopsis={articleSynopsisHtml}
        onAcceptReplace={acceptReplace}
        onAcceptInsertAfter={acceptInsertAfter}
        focusedBlockId={focusedBlockId}
      />
    </div>
  );
}
