import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type SiteOpt = { id: string; name: string; slug: string };

function slugify(s: string) {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "untitled"}-${Date.now()}`;
}

export function NewArticleModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteOpt[]>([]);
  const [siteId, setSiteId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [generateUrl, setGenerateUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedBody, setGeneratedBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("sites" as never)
        .select("id, name, slug")
        .order("name", { ascending: true });
      setSites((data ?? []) as unknown as SiteOpt[]);
    })();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSynopsis("");
      setGenerateUrl("");
      setHeroImageUrl("");
      setPrompt("");
      setGeneratedBody("");
      setSiteId("");
      setError(null);
      setSaving(false);
      setGenerating(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    const url = generateUrl.trim();
    if (!url) return;
    setGenerating(true);
    try {
      const userMessage = `You are an editor for fashion.fan, a fashion news site.
A user has pasted this URL: ${url}

Generate a fashion article inspired by the content at that URL.
Return ONLY a valid JSON object with no markdown, no backticks, no preamble:
{
  "title": "compelling article title under 120 characters",
  "excerpt": "2-sentence summary under 300 characters",
  "content": "full article in plain text, 400-600 words",
  "hero_image": "leave as empty string"
}`;

      const { data, error: invokeErr } = await supabase.functions.invoke("smart-service", {
        body: {
          systemPrompt:
            "You are an expert fashion editor. Respond ONLY with valid JSON in the exact shape requested — no markdown, no preamble.",
          userMessage,
          maxTokens: 2000,
        },
      });
      if (invokeErr) throw invokeErr;
      const rawText =
        (data as { text?: string; content?: Array<{ text?: string }> })?.text ??
        (data as { content?: Array<{ text?: string }> })?.content?.[0]?.text ??
        "";
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as {
        title?: string;
        excerpt?: string;
        content?: string;
        hero_image?: string;
      };
      if (parsed.title) setTitle(parsed.title.trim());
      if (parsed.excerpt) setSynopsis(parsed.excerpt.trim());
      if (parsed.content) setGeneratedBody(parsed.content.trim());
      toast.success("Article generated — review and create");
    } catch (e) {
      console.error("generate from url failed", e);
      toast.error(
        "Couldn't read that URL — try describing the article in the Content Prompt field instead",
      );
    } finally {
      setGenerating(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (!siteId) {
      setError("Please select a site.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const finalTitle = title.trim();
      const slug = slugify(finalTitle);
      const excerpt = synopsis.trim();
      const hero = heroImageUrl.trim();
      const body = generatedBody.trim() || prompt.trim() || "";

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to create an article.");

      const { data: postData, error: postErr } = await supabase
        .from("posts" as never)
        .insert({
          author_id: user.id,
          site_id: siteId,
          status: "pending",
          content_type: "news",
          title: finalTitle,
          slug,
          excerpt,
          hero_image: hero || null,
          content: body,
          media_urls: hero ? [hero] : [],
          ai_analysis: { synopsis_title: finalTitle, source_url: generateUrl.trim() || null },
          created_at: new Date().toISOString(),
        } as never)
        .select("id")
        .single();
      if (postErr || !postData) {
        console.error("Supabase insert error:", postErr);
        throw postErr ?? new Error("Failed to create post");
      }
      const postId = (postData as { id: string }).id;

      onOpenChange(false);
      navigate(`/admin/post/${postId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create article";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Article</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="na-site">Site</Label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger id="na-site">
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="na-title">Title</Label>
            <Input
              id="na-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="na-synopsis">Synopsis</Label>
            <Textarea
              id="na-synopsis"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={3}
              placeholder="Short summary shown in article cards (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="na-image">Hero Image URL</Label>
            <Input
              id="na-image"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="Paste an Unsplash or image URL for the article card thumbnail"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="na-generate-url">Generate from URL</Label>
            <div className="flex gap-2">
              <Input
                id="na-generate-url"
                value={generateUrl}
                onChange={(e) => setGenerateUrl(e.target.value)}
                placeholder="Paste any article URL — AI will read it and generate content"
                disabled={generating}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                disabled={generating || !generateUrl.trim()}
              >
                {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="na-prompt">Content Prompt</Label>
            <Textarea
              id="na-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe what this article should cover — AI will use this as a guide (optional)"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            className="bg-green-700 text-white hover:bg-green-800"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
