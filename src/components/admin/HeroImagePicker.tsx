import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { storeRemoteImage } from "@/lib/storeImage";
import { toast } from "sonner";

function isPinterestUrl(u: string): boolean {
  try {
    const h = new URL(u).hostname.toLowerCase();
    return h.includes("pinterest.") || h.includes("pinimg.com");
  } catch {
    return false;
  }
}

interface Props {
  current: string | null;
  onPick: (url: string) => void;
  onEditImage?: (imageUrl: string, onSave: (newUrl: string) => void) => void;
}

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string };
  alt_description: string | null;
  user: { name: string };
}

interface PexelsPhoto {
  id: number;
  src: { medium: string; large: string };
  alt: string;
  photographer: string;
}

export function HeroImagePicker({ current, onPick, onEditImage }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pexelsQuery, setPexelsQuery] = useState("");
  const [pexelsResults, setPexelsResults] = useState<PexelsPhoto[]>([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsError, setPexelsError] = useState<string | null>(null);
  const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

  const searchPexels = async () => {
    if (!pexelsQuery.trim()) return;
    if (!pexelsKey) { setPexelsError("VITE_PEXELS_API_KEY is not configured"); return; }
    setPexelsLoading(true); setPexelsError(null);
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?per_page=18&query=${encodeURIComponent(pexelsQuery)}`,
        { headers: { Authorization: pexelsKey } }
      );
      if (!res.ok) throw new Error(`Pexels error ${res.status}`);
      const json = (await res.json()) as { photos: PexelsPhoto[] };
      setPexelsResults(json.photos);
    } catch (e) {
      setPexelsError(e instanceof Error ? e.message : "Search failed");
    } finally { setPexelsLoading(false); }
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("post-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      onPick(data.publicUrl);
      setOpen(false);
      toast.success("Image uploaded");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? `Upload failed: ${e.message}` : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
    <div className="space-y-3">
      <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
        {current ? (
          <>
            <img src={current} alt="hero" className="h-full w-full object-cover" />
            {onEditImage && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
                <button
                  type="button"
                  onClick={() => onEditImage(current, onPick)}
                  className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-800 opacity-0 shadow-lg transition-all group-hover:opacity-100"
                >
                  ✏️ Edit image
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No hero image
          </div>
        )}
      </div>
      <Button type="button" variant="outline" onClick={() => setOpen((o) => !o)}>
        {open ? "Cancel" : "Replace hero image"}
      </Button>

      {open && (
        <div className="rounded-lg border p-4">
          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="unsplash">Search Unsplash</TabsTrigger>
              <TabsTrigger value="pexels">Search Pexels</TabsTrigger>
              <TabsTrigger value="url">Paste URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-3 pt-3">
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
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Upload className="h-6 w-6" />
                <div>
                  {uploading ? "Uploading…" : "Click to choose a file or drag & drop"}
                </div>
                <div className="text-xs">PNG, JPG, WEBP up to ~20MB</div>
              </div>
            </TabsContent>
            <TabsContent value="unsplash" className="space-y-3 pt-3">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  placeholder="Search Unsplash…"
                />
                <Button type="button" onClick={search} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={async () => {
                      const t = toast.loading("Saving image…");
                      const stored = await storeRemoteImage(p.urls.regular, "unsplash");
                      toast.dismiss(t);
                      onPick(stored);
                      setOpen(false);
                    }}
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
            </TabsContent>
            <TabsContent value="pexels" className="space-y-3 pt-3">
              <div className="flex gap-2">
                <Input
                  value={pexelsQuery}
                  onChange={(e) => setPexelsQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchPexels()}
                  placeholder="Search Pexels…"
                />
                <Button type="button" onClick={searchPexels} disabled={pexelsLoading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {pexelsError && <p className="text-sm text-destructive">{pexelsError}</p>}
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {pexelsResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={async () => {
                      const t = toast.loading("Saving image…");
                      const stored = await storeRemoteImage(p.src.large, "pexels");
                      toast.dismiss(t);
                      onPick(stored);
                      setOpen(false);
                    }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-md border"
                  >
                    <img src={p.src.medium} alt={p.alt}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    <span className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
                      {p.photographer}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-3 pt-3">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                onClick={async () => {
                  const v = urlInput.trim();
                  if (!v) return;
                  if (isPinterestUrl(v)) {
                    toast.error("Pinterest images can only be used in article body, not as hero image.");
                    return;
                  }
                  const t = toast.loading("Saving image…");
                  const stored = await storeRemoteImage(v, "url");
                  toast.dismiss(t);
                  onPick(stored);
                  setOpen(false);
                  setUrlInput("");
                }}
              >
                Use this URL
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
