import { supabase } from "@/integrations/supabase/client";

/**
 * Download a remote image (Unsplash/Pexels/etc) and re-upload it to the
 * `post-images` bucket so we own the asset. Returns the public URL on
 * success; falls back to the original URL on failure.
 */
export async function storeRemoteImage(
  sourceUrl: string,
  source: string = "remote",
): Promise<string> {
  try {
    if (!sourceUrl) return sourceUrl;
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const blob = await res.blob();
    const ext = blob.type.includes("png")
      ? "png"
      : blob.type.includes("webp")
      ? "webp"
      : "jpg";
    const filename = `${source}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("post-images")
      .upload(filename, blob, { contentType: blob.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("post-images").getPublicUrl(filename);
    return data.publicUrl;
  } catch (e) {
    console.error("storeRemoteImage failed, using original:", e);
    return sourceUrl;
  }
}
