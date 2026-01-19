export type DraftState = {
  // existing
  logoUrl: string;
  primaryColor: string;
  wishlistEnabled: boolean;
  announcementEnabled: boolean;
  announcementText: string;

  heroEnabled: boolean;
  heroHeading: string;
  heroSubtext: string;
  heroImageSrc: string;
  heroImageAlt: string;

  footerBlurb: string;
  footerNewsletterEnabled?: boolean;
  footerWhatsappEnabled?: boolean;
  footerWhatsappPhone?: string;

  footerFacebookHref?: string;
  footerInstagramHref?: string;
  footerTwitterHref?: string;
  footerLinkedinHref?: string;
  footerYoutubeHref?: string;

  footerContactsTitle?: string;
  footerContactsLines?: string[];

  seoTitle: string;
  seoDescription: string;

  headerMenu: {
    about: boolean;
    contact: boolean;
    blog: boolean;
  };

  heroBottomStripEnabled: boolean;
  heroBottomStripText: string;
  heroCtaLabel: string;
  heroCtaHref: string;

  /* ---------------- NEW: About (MVP) ---------------- */

  // About Hero section (index 0)
  aboutHero0Title: string;
  aboutHero0Description: string;
  aboutHero0BgSrc: string;
  aboutHero0BgAlt: string;

  // About Split section (index 1)
  aboutSplit1Title: string;
  aboutSplit1Paragraph1: string;
  aboutSplit1Paragraph2: string;
  aboutSplit1Paragraph3: string;
  aboutSplit1CtaLabel: string;
  aboutSplit1CtaHref: string;
  aboutSplit1ImgSrc: string;
  aboutSplit1ImgAlt: string;

  // About Hero section (index 2)
  aboutHero2Title: string;
  aboutHero2Description: string;
  aboutHero2CtaLabel: string;
  aboutHero2CtaHref: string;
  aboutHero2BgSrc: string;
  aboutHero2BgAlt: string;

  // SEO

  seoFaviconIco?: string;
  seoFaviconPng?: string;
  seoFaviconSvg?: string;
  seoFaviconAppleTouch?: string;

  seoOgImageUrl?: string;
  seoOgImageAlt?: string;

  // Contact
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactInstagram: string;
};
