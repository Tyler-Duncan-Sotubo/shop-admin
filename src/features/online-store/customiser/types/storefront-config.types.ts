export type ThemeMode = {
  default: "light" | "dark";
  strategy: "class" | "media";
  darkClass?: string;
};

export type ThemeFonts = {
  mono: string;
  sans: string;
  heading: string;
};

export type ThemeAssets = {
  logoUrl: string;
};

export type ThemeColors = {
  light: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    primaryForeground: string;
    secondaryForeground: string;
  };
  dark: {
    primary: string;
    background: string;
    foreground: string;
    primaryForeground: string;
  };
};

export type ThemeRadius = {
  base: string;
};

export type ThemeComponents = {
  card: { radius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | string };
  button: { radius: "none" | "sm" | "md" | "lg" | "pill" | string };
};

export type ThemeConfig = {
  mode: ThemeMode;
  fonts: ThemeFonts;
  assets: ThemeAssets;
  colors: ThemeColors;
  radius: ThemeRadius;
  components: ThemeComponents;
};

export type SeoFavicon = {
  ico: string;
  png: string;
  svg: string;
  appleTouch: string;
};

export type SeoImage = {
  alt: string | null;
  url: string;
};

export type SeoConfig = {
  title: string;
  siteName: string;
  description: string;
  canonicalBaseUrl: string;
  favicon: SeoFavicon;
  ogImage: SeoImage;
};

export type HeaderNavIconToggles = {
  cart: boolean;
  quote: boolean;
  search: boolean;
  account: boolean;
  wishlist: boolean;
};

export type HeaderNavItem = {
  href: string;
  label: string;
};

export type HeaderNav = {
  enabled: boolean;
  icons: HeaderNavIconToggles;
  items: HeaderNavItem[];
  variant: "V1" | "V2" | string;
};

export type HeaderTopBarSlide = {
  text: string;
};

export type HeaderTopBar = {
  slides: HeaderTopBarSlide[];
  enabled: boolean;
  autoplay: {
    enabled: boolean;
    intervalMs: number;
  };
};

export type HeaderConfig = {
  nav: HeaderNav;
  topBar: HeaderTopBar;
};

export type FooterSocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "youtube"
  | "linkedin"
  | string;

export type FooterSocialLink = {
  href: string;
  platform: FooterSocialPlatform;
};

export type FooterColumnLink = {
  href: string;
  label: string;
};

export type FooterColumn = {
  title: string;
  links: FooterColumnLink[];
};

export type FooterContacts = {
  title: string;
  lines: string[];
};

export type WhatsappAgent = {
  name: string;
  role: string;
  phone: string;
  prefill: string;
};

export type FooterWhatsapp = {
  note: string;
  intro: string;
  title: string;
  agents: WhatsappAgent[];
  enabled: boolean;
  position: "bottom-right" | "bottom-left" | string;
};

export type PaymentMethod =
  | "visa"
  | "verve"
  | "mastercard"
  | "bank_transfer"
  | string;

export type FooterBottomBar = {
  leftText: string;
  rightText: string | null;
  payments: {
    enabled: boolean;
    methods: Record<PaymentMethod, boolean>;
  };
};

export type FooterNewsletter = {
  title: string;
  enabled: boolean;
  ctaLabel: string;
  description: string;
  placeholder: string;
};

export type FooterBrand = {
  blurb: string;
  logoUrl: string;
};

export type FooterConfig = {
  brand: FooterBrand;
  social: FooterSocialLink[];
  columns: FooterColumn[];
  variant: "V1" | "V2" | string;
  contacts: FooterContacts;
  whatsapp: FooterWhatsapp;
  bottomBar: FooterBottomBar;
  newsletter: FooterNewsletter;
};

/* ---------- UI config ---------- */

export type UiHeaderMenu = {
  about: boolean;
  contact: boolean;
  blog: boolean;
};

export type UiAccountHeaderNav = {
  showRewardIcon: boolean;
  showWishlistIcon: boolean;
  showOurStoresIcon: boolean;
};

export type UiAccount = {
  headerNav: UiAccountHeaderNav;
};

export type UiPricing = {
  showPriceInDetails: "always" | "never" | "whenOnSale" | string;
};

export type UiProductRecommendations = {
  variant: "TABBED" | "GRID" | string;
  defaultTab: "collection" | "related" | "recent" | string;
};

export type UiProductDetails = {
  context: "CART" | "PAGE" | string;
  variant: "V1" | "V2" | string;
  showInfoSections: boolean;
};

export type UiProduct = {
  galleryVariant: "V1" | "V2" | string;
  productDetails: UiProductDetails;
  recommendations: UiProductRecommendations;
  productCardVariant: "HOVER_ACTIONS" | "DEFAULT" | string;
  showWishlistButton: boolean;
};

export type UiQuickView = {
  enabled: boolean;
  detailsVariant: "V1" | "V2" | string;
};

export type UiConfig = {
  account: UiAccount;
  pricing: UiPricing;
  product: UiProduct;
  quickView: UiQuickView;
  headerMenu: UiHeaderMenu;
};

/* ---------- Pages ---------- */

export type PageSeo = {
  title: string;
  description?: string | null;
  keywords?: string[];
  ogImage?: SeoImage;
  collections?: Record<string, unknown>;
};

export type BlogPage = {
  version: number;
  listVariant: "V1" | "V2" | string;
  sections: unknown[];
  seo: PageSeo;
  post: {
    version: number;
    variant: "V1" | "V2" | string;
    ui: { showShare: boolean; showCoverImage: boolean };
  };
};

export type HomeHero = {
  enabled: boolean;
  variant: "V1" | "V2" | string;
  image: { src: string; alt: string };
  layout: { align: "left" | "center" | "right" | string };
  overlay?: { className?: string };
  bottomStrip?: { enabled: boolean; text: string; className?: string };
  content: {
    eyebrow: string;
    heading: string;
    description: string;
    cta: { href: string; label: string };
  };
};

export type HomeSectionTopCategories = {
  type: "topCategories";
  title: string;
  subtitle: string;
  categories: { src: string; alt: string; href: string }[];
};

export type HomeSectionProductTabs = {
  type: "productTabs";
  enabled: boolean;
  title: string;
  subtitle: string;
  tabs: { key: string; label: string; limit: number; windowDays?: number }[];
};

export type HomeSectionLatestProducts = {
  type: "latestProducts";
  enabled: boolean;
  title: string;
  subtitle: string;
  limit: number;
  categoryId?: string;
};

export type HomeSectionOnSaleProducts = {
  type: "onSaleProducts";
  enabled: boolean;
  title: string;
  subtitle: string;
  limit: number;
  layout?: { sectionClassName?: string };
};

export type HomeSectionBestSellersProducts = {
  type: "bestSellersProducts";
  enabled: boolean;
  title: string;
  subtitle: string;
  limit: number;
  windowDays?: number;
  layout?: { sectionClassName?: string };
};

export type HomeSection =
  | HomeSectionTopCategories
  | HomeSectionProductTabs
  | HomeSectionLatestProducts
  | HomeSectionOnSaleProducts
  | HomeSectionBestSellersProducts
  // allow future section types without breaking
  | (Record<string, unknown> & { type: string });

export type HomePage = {
  hero: HomeHero;
  sections: HomeSection[];
};

export type AboutSectionAboutHero = {
  type: "aboutHero";
  enabled: boolean;
  layout: Record<string, unknown>;
  content: {
    title: string;
    description: string;
    cta?: { href: string; label: string };
  };
  background: {
    image: { src: string; alt: string; overlayClassName?: string };
  };
  overlay?: { className?: string };
};

export type AboutSectionAboutSplit = {
  type: "aboutSplit";
  enabled: boolean;
  layout: Record<string, unknown>;
  content: {
    title: string;
    paragraphs: string[];
    cta?: { href: string; label: string };
  };
  image: { src: string; alt: string };
  overlay?: { className?: string };
};

export type AboutPage = {
  version: number;
  seo: PageSeo;
  sections: (
    | AboutSectionAboutHero
    | AboutSectionAboutSplit
    | Record<string, unknown>
  )[];
};

export type AccountLoginPage = {
  version: number;
  seo: PageSeo;
  ui: { variant: "V1" | "V2" | string; content: Record<string, unknown> };
};

export type AccountRegisterPage = {
  version: number;
  seo: PageSeo;
  ui: { variant: "V1" | "V2" | string; content: Record<string, unknown> };
};

export type AccountDashboardPage = {
  version: number;
  seo: PageSeo;
  ui: {
    variant: "V1" | "V2" | string;
    userLabel: string;
    greetingLines: string[];
    nav: (
      | { href: string; label: string }
      | { label: string; action: string }
    )[];
  };
};

export type AccountPages = {
  login: AccountLoginPage;
  register: AccountRegisterPage;
  account: AccountDashboardPage;
};

export type AccountPage = {
  version: number;
  pages: AccountPages;
};

export type ContactPage = {
  version: number;
  seo: PageSeo;
  sections: Record<string, unknown>[];
};

export type CataloguePage = {
  version: number;
  seo: PageSeo;
  sections: unknown[];
};

export type CollectionsPage = {
  version: number;
  seo: PageSeo;
  ui: {
    exploreMoreColumns: number;
    afterContentExpandable: boolean;
    afterContentCollapsedHeightPx: number;
  };
  defaults: Record<string, unknown>;
};

export type PagesConfig = {
  blog: BlogPage;
  home: HomePage;
  about: AboutPage;
  account: AccountPage;
  contact: ContactPage;
  catalogue: CataloguePage;
  collections: CollectionsPage;
  // future pages
  [key: string]: unknown;
};

/* ---------- Root ---------- */

export type StoreInfo = {
  id: string;
  name: string;
};

export type ResolvedStorefrontConfig = {
  version: number;
  store: StoreInfo;
  theme: ThemeConfig;
  ui: UiConfig;
  seo: SeoConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  pages: PagesConfig;
};
