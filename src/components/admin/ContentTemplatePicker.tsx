import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { HeroImagePicker } from "@/components/admin/HeroImagePicker";
import { BlockEditor } from "@/components/admin/BlockEditor";

export type TemplateId =
  | "hero"
  | "editorial"
  | "feature-row"
  | "elle"
  | "vogue"
  | "split-screen";

export type TemplateConfig = Record<string, unknown>;

const TEMPLATES: Array<{
  id: TemplateId;
  name: string;
  description: string;
  Wireframe: () => React.ReactElement;
}> = [
  {
    id: "hero",
    name: "Hero",
    description: "Full-bleed image or article with overlaid title and CTA.",
    Wireframe: () => (
      <div className="relative h-full w-full rounded bg-neutral-300">
        <div className="absolute bottom-2 left-2 right-6 space-y-1">
          <div className="h-2 w-3/4 rounded bg-white/90" />
          <div className="h-1.5 w-1/2 rounded bg-white/70" />
          <div className="h-2 w-12 rounded bg-white" />
        </div>
      </div>
    ),
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "1 large article left, 2 stacked right.",
    Wireframe: () => (
      <div className="grid h-full w-full grid-cols-5 gap-1">
        <div className="col-span-3 rounded bg-neutral-300" />
        <div className="col-span-2 grid grid-rows-2 gap-1">
          <div className="rounded bg-neutral-300" />
          <div className="rounded bg-neutral-300" />
        </div>
      </div>
    ),
  },
  {
    id: "feature-row",
    name: "Feature Row",
    description: "Image or article left, text content right.",
    Wireframe: () => (
      <div className="grid h-full w-full grid-cols-2 gap-1">
        <div className="rounded bg-neutral-300" />
        <div className="flex flex-col justify-center gap-1 px-1">
          <div className="h-1.5 w-3/4 rounded bg-neutral-400" />
          <div className="h-1 w-full rounded bg-neutral-300" />
          <div className="h-1 w-full rounded bg-neutral-300" />
          <div className="mt-1 h-2 w-10 rounded bg-neutral-500" />
        </div>
      </div>
    ),
  },
  {
    id: "elle",
    name: "Elle Style",
    description: "1 large portrait left + 4 horizontal cards right.",
    Wireframe: () => (
      <div className="grid h-full w-full grid-cols-5 gap-1">
        <div className="col-span-2 rounded bg-neutral-300" />
        <div className="col-span-3 grid grid-rows-4 gap-0.5">
          <div className="rounded bg-neutral-300" />
          <div className="rounded bg-neutral-300" />
          <div className="rounded bg-neutral-300" />
          <div className="rounded bg-neutral-300" />
        </div>
      </div>
    ),
  },
  {
    id: "vogue",
    name: "Vogue Style",
    description: "3 columns with large center, side stacks.",
    Wireframe: () => (
      <div className="grid h-full w-full grid-cols-4 gap-1">
        <div className="grid grid-rows-2 gap-1">
          <div className="rounded bg-neutral-300" />
          <div className="rounded bg-neutral-300" />
        </div>
        <div className="col-span-2 rounded bg-neutral-300" />
        <div className="flex flex-col gap-0.5">
          <div className="h-1 rounded bg-neutral-300" />
          <div className="h-1 rounded bg-neutral-300" />
          <div className="h-1 rounded bg-neutral-300" />
          <div className="h-1 rounded bg-neutral-300" />
          <div className="h-1 rounded bg-neutral-300" />
          <div className="h-1 rounded bg-neutral-300" />
        </div>
      </div>
    ),
  },
  {
    id: "split-screen",
    name: "Split Screen",
    description: "Two independent block editors side by side.",
    Wireframe: () => (
      <div className="grid h-full w-full grid-cols-2 gap-1">
        <div className="rounded bg-neutral-300" />
        <div className="rounded bg-neutral-300" />
      </div>
    ),
  },
];

type ArticleHit = { id: string; title: string };

function ArticleSearch({
  siteId,
  value,
  onChange,
  placeholder,
}: {
  siteId: string | null;
  value: string;
  onChange: (id: string, title?: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ArticleHit[]>([]);
  const [picked, setPicked] = useState<string>(value);

  useEffect(() => setPicked(value), [value]);

  useEffect(() => {
    if (!siteId || q.trim().length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("news_synopses" as never)
        .select("id,title")
        .eq("site_id", siteId)
        .ilike("title", `%${q.trim()}%`)
        .limit(8);
      if (cancelled) return;
      setHits(((data ?? []) as unknown) as ArticleHit[]);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, siteId]);

  return (
    <div className="space-y-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder ?? "Search articles…"}
      />
      {picked && (
        <div className="text-[11px] text-muted-foreground">
          Selected article id: <code className="rounded bg-muted px-1">{picked}</code>{" "}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => {
              setPicked("");
              onChange("");
            }}
          >
            clear
          </button>
        </div>
      )}
      {hits.length > 0 && (
        <ul className="max-h-48 overflow-auto rounded border bg-card text-sm">
          {hits.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => {
                  setPicked(h.id);
                  onChange(h.id, h.title);
                  setQ("");
                  setHits([]);
                }}
                className="block w-full px-3 py-2 text-left hover:bg-muted"
              >
                {h.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Radio: image source vs article source. */
function ImageOrArticleSource({
  config,
  setConfig,
  siteId,
}: {
  config: Record<string, unknown>;
  setConfig: (p: Record<string, unknown>) => void;
  siteId: string | null;
}) {
  const source = ((config.source as string) ?? "image") as "image" | "article";
  const articleMode = ((config.articleMode as string) ?? "single") as "single" | "carousel";

  return (
    <div className="space-y-3 rounded-md border bg-card p-3">
      <Label className="text-xs">Image source</Label>
      <div className="flex flex-wrap gap-3 text-sm">
        {[
          { v: "image", label: "Image (Upload / Unsplash / Pexels / URL)" },
          { v: "article", label: "Use an article" },
        ].map((o) => (
          <label key={o.v} className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={`src-${siteId ?? "x"}`}
              checked={source === o.v}
              onChange={() => setConfig({ source: o.v })}
            />
            {o.label}
          </label>
        ))}
      </div>

      {source === "image" && (
        <HeroImagePicker
          current={(config.imageUrl as string) ?? null}
          onPick={(url) => setConfig({ imageUrl: url })}
        />
      )}

      {source === "article" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 text-sm">
            {[
              { v: "single", label: "Single article" },
              { v: "carousel", label: "Carousel of 6 latest articles" },
            ].map((o) => (
              <label key={o.v} className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`am-${siteId ?? "x"}`}
                  checked={articleMode === o.v}
                  onChange={() => setConfig({ articleMode: o.v })}
                />
                {o.label}
              </label>
            ))}
          </div>
          {articleMode === "single" && (
            <ArticleSearch
              siteId={siteId}
              value={(config.articleId as string) ?? ""}
              onChange={(id) => setConfig({ articleId: id })}
              placeholder="Search approved articles…"
            />
          )}
          {articleMode === "carousel" && (
            <p className="text-xs text-muted-foreground">
              Auto-rotates 6 most-recent approved articles every 4s.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ContentTemplatePicker({
  data,
  setData,
  siteId,
  siteColor,
  siteFont,
}: {
  data: Record<string, unknown>;
  setData: (patch: Record<string, unknown>) => void;
  siteId: string | null;
  siteColor?: string;
  siteFont?: string | null;
}) {
  const template = (data.template as TemplateId | undefined) ?? null;
  const config = ((data.templateConfig as TemplateConfig | undefined) ?? {}) as Record<
    string,
    unknown
  >;
  const setConfig = (patch: Record<string, unknown>) =>
    setData({ templateConfig: { ...config, ...patch } });

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs">Choose a template</Label>
        <div
          className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3"
          style={{ ["--site-color" as never]: siteColor ?? "#0C447C" }}
        >
          {TEMPLATES.map((t) => {
            const active = template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setData({ template: t.id })}
                className={`group relative rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/30 ${
                  active ? "border-foreground ring-2 ring-foreground/20" : ""
                }`}
              >
                {active && (
                  <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <div className="aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100 p-2">
                  <t.Wireframe />
                </div>
                <div className="mt-2 text-sm font-medium">{t.name}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {template && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Configure {TEMPLATES.find((t) => t.id === template)?.name}
          </div>
          {template === "hero" && (
            <HeroConfig config={config} setConfig={setConfig} siteId={siteId} />
          )}
          {template === "editorial" && (
            <EditorialConfig config={config} setConfig={setConfig} siteId={siteId} />
          )}
          {template === "feature-row" && (
            <FeatureRowConfig config={config} setConfig={setConfig} siteId={siteId} />
          )}
          {template === "elle" && (
            <p className="text-xs text-muted-foreground">
              Auto-pulls the 5 most-recent approved articles. No configuration needed.
            </p>
          )}
          {template === "vogue" && (
            <p className="text-xs text-muted-foreground">
              Auto-pulls up to 9 most-recent approved articles. No configuration needed.
            </p>
          )}
          {template === "split-screen" && (
            <SplitScreenConfig
              config={config}
              setConfig={setConfig}
              siteColor={siteColor}
              siteFont={siteFont}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        className="mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextColorRadio({
  config,
  setConfig,
}: {
  config: Record<string, unknown>;
  setConfig: (p: Record<string, unknown>) => void;
}) {
  const color = ((config.textColor as string) ?? "white") as "white" | "black";
  return (
    <div>
      <Label className="text-xs">Text color</Label>
      <div className="mt-1 flex gap-3 text-sm">
        {(["white", "black"] as const).map((c) => (
          <label key={c} className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              checked={color === c}
              onChange={() => setConfig({ textColor: c })}
            />
            {c[0].toUpperCase() + c.slice(1)}
          </label>
        ))}
      </div>
    </div>
  );
}

function HeroConfig({
  config,
  setConfig,
  siteId,
}: {
  config: Record<string, unknown>;
  setConfig: (p: Record<string, unknown>) => void;
  siteId: string | null;
}) {
  const usingArticle = config.source === "article";
  return (
    <div className="space-y-3">
      <ImageOrArticleSource config={config} setConfig={setConfig} siteId={siteId} />
      {!usingArticle && (
        <>
          <TextField
            label="Title"
            value={(config.title as string) ?? ""}
            onChange={(v) => setConfig({ title: v })}
          />
          <TextField
            label="Subtitle"
            value={(config.subtitle as string) ?? ""}
            onChange={(v) => setConfig({ subtitle: v })}
          />
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="CTA text"
          value={(config.ctaText as string) ?? ""}
          onChange={(v) => setConfig({ ctaText: v })}
        />
        <TextField
          label="CTA URL"
          value={(config.ctaUrl as string) ?? ""}
          onChange={(v) => setConfig({ ctaUrl: v })}
        />
      </div>
      <TextColorRadio config={config} setConfig={setConfig} />
    </div>
  );
}

function EditorialConfig({
  config,
  setConfig,
  siteId,
}: {
  config: Record<string, unknown>;
  setConfig: (p: Record<string, unknown>) => void;
  siteId: string | null;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Auto-pulls the latest 3 approved articles for this site. Optionally pin one
        specific article to the large slot.
      </p>
      <div>
        <Label className="text-xs">Pin a specific article (optional)</Label>
        <div className="mt-1">
          <ArticleSearch
            siteId={siteId}
            value={(config.pinnedId as string) ?? ""}
            onChange={(id) => setConfig({ pinnedId: id })}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureRowConfig({
  config,
  setConfig,
  siteId,
}: {
  config: Record<string, unknown>;
  setConfig: (p: Record<string, unknown>) => void;
  siteId: string | null;
}) {
  return (
    <div className="space-y-3">
      <ImageOrArticleSource config={config} setConfig={setConfig} siteId={siteId} />
      <TextField
        label="Heading"
        value={(config.heading as string) ?? ""}
        onChange={(v) => setConfig({ heading: v })}
      />
      <div>
        <Label className="text-xs">Body</Label>
        <Textarea
          className="mt-1"
          rows={4}
          value={(config.body as string) ?? ""}
          onChange={(e) => setConfig({ body: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="CTA text"
          value={(config.ctaText as string) ?? ""}
          onChange={(v) => setConfig({ ctaText: v })}
        />
        <TextField
          label="CTA URL"
          value={(config.ctaUrl as string) ?? ""}
          onChange={(v) => setConfig({ ctaUrl: v })}
        />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <Switch
          checked={!!config.flip}
          onCheckedChange={(v) => setConfig({ flip: v })}
        />
        Flip layout (image on right)
      </label>
    </div>
  );
}

function SplitScreenConfig({
  config,
  setConfig,
  siteColor,
  siteFont,
}: {
  config: Record<string, unknown>;
  setConfig: (p: Record<string, unknown>) => void;
  siteColor?: string;
  siteFont?: string | null;
}) {
  const leftHtml = (config.leftHtml as string) ?? "";
  const rightHtml = (config.rightHtml as string) ?? "";
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Each side has its own independent Block Editor. Good for comparisons,
        dual editorials, or bilingual content.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border bg-card p-3">
          <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Left
          </div>
          <BlockEditor
            value={leftHtml}
            onChange={(html) => setConfig({ leftHtml: html })}
            siteColor={siteColor}
            siteFont={siteFont ?? "Inter"}
          />
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Right
          </div>
          <BlockEditor
            value={rightHtml}
            onChange={(html) => setConfig({ rightHtml: html })}
            siteColor={siteColor}
            siteFont={siteFont ?? "Inter"}
          />
        </div>
      </div>
    </div>
  );
}

export function ContentModeToggle({
  mode,
  onChange,
}: {
  mode: "blocks" | "template";
  onChange: (m: "blocks" | "template") => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-card p-0.5">
      {(["blocks", "template"] as const).map((m) => (
        <Button
          key={m}
          type="button"
          size="sm"
          variant={mode === m ? "default" : "ghost"}
          onClick={() => onChange(m)}
          className="h-7 px-3 text-xs"
        >
          {m === "blocks" ? "Block Editor" : "Layout Template"}
        </Button>
      ))}
    </div>
  );
}
