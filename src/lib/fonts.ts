// Site-level font management. All fonts are loaded from Google Fonts on demand.

export const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Source Sans Pro",
  "PT Sans",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Libre Baskerville",
  "Cormorant Garamond",
  "EB Garamond",
  "DM Serif Display",
  "Crimson Text",
  "Josefin Sans",
  "Oswald",
  "Bebas Neue",
  "Anton",
  "Barlow",
  "Mulish",
  "Work Sans",
  "DM Sans",
  "Quicksand",
  "Karla",
  "Cabin",
  "Figtree",
] as const;

export type FontName = (typeof FONT_OPTIONS)[number] | string;

export function loadGoogleFont(fontName?: string | null): void {
  if (!fontName || typeof document === "undefined") return;
  const id = `gfont-${fontName.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontName,
  )}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

export function fontFamilyValue(fontName?: string | null): string | undefined {
  if (!fontName) return undefined;
  return `'${fontName}', system-ui, sans-serif`;
}
