export interface SiteMenuFeature {
  label: string;
  icon: string;
  path: string;
}

export interface SharedHeaderProps {
  siteName: string;
  siteEmoji: string;
  accentColor: string;
  aiFeatureLabel: string;
  siteMenuFeatures?: SiteMenuFeature[];
}
