export interface SiteMenuFeature {
  label: string;
  icon: string;
  path: string;
}

export interface CustomNavLink {
  label: string;
  url: string;
  dropdown?: { label: string; url: string }[];
}

export interface SharedHeaderProps {
  siteName: string;
  siteEmoji: string;
  accentColor: string;
  aiFeatureLabel: string;
  siteMenuFeatures?: SiteMenuFeature[];
  /** When set, replaces the ToBe.fan logo + default nav with site-specific branding */
  customNavLinks?: CustomNavLink[];
  logoUrl?: string | null;
}
