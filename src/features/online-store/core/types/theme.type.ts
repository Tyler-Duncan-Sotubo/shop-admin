export type ThemeGalleryItem = {
  id: string;
  name: string;
  description?: string;
  imageSrc: string; // local /public path (recommended) or remote if configured
  disabled?: boolean; // true => “Coming soon”
};
