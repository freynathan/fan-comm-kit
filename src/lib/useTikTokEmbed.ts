import { useEffect } from "react";

/**
 * Loads the TikTok embed script when the given HTML/content contains a
 * TikTok embed (data-block="tiktok" or class="tiktok-embed"). Re-renders
 * via tiktokEmbed.lib.render() when content changes and the script is
 * already loaded.
 */
export function useTikTokEmbed(content: string | null | undefined) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!content) return;
    const hasTikTok =
      content.includes('data-block="tiktok"') || content.includes('class="tiktok-embed"');
    if (!hasTikTok) return;

    const w = window as unknown as { tiktokEmbed?: { lib?: { render?: () => void } } };
    if (document.querySelector('script[src*="tiktok.com/embed"]')) {
      w.tiktokEmbed?.lib?.render?.();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [content]);
}
