// Switch the current topic site without a full page reload.
// Updates ?site= and emits a popstate event so listeners (HomePage,
// SiteLayoutRenderer, SharedHeader) re-resolve the active site.

export function switchSite(slug: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("site", slug);
  // Preserve path "/" so other routes aren't affected.
  window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Returns true if the page should re-resolve when the URL search changes. */
export function useSearchChangeListener(cb: () => void) {
  if (typeof window === "undefined") return;
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
}

/** Relative luminance of a #rrggbb color (0–1). */
export function colorLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 0;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function contrastTextColor(bgHex: string): string {
  return colorLuminance(bgHex) > 0.5 ? "#111111" : "#FFFFFF";
}
