/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import type { DraftState } from "../types/customiser.type";

type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "youtube";
type SocialLink = { platform: SocialPlatform; href: string };

function getSocialHref(social: any, platform: SocialPlatform) {
  const arr: SocialLink[] = Array.isArray(social) ? social : [];
  return arr.find((s) => s?.platform === platform)?.href ?? "";
}

export function buildDraft(resolved: ResolvedStorefrontConfig): DraftState {
  const logoUrl = resolved?.theme?.assets?.logoUrl ?? "";
  const primaryColor = resolved?.theme?.colors?.light?.primary ?? "";
  const topBar = resolved?.header?.topBar;
  const hero = resolved?.pages?.home?.hero;
  const footer: any = resolved?.footer ?? {};
  const seo: any = resolved?.seo ?? {};
  const contact: any = resolved?.pages?.contact ?? {};

  const aboutSections = Array.isArray(resolved?.pages?.about?.sections)
    ? ((resolved.pages.about.sections as any[]) ?? [])
    : [];

  const s0 = aboutSections?.[0] ?? {};
  const s1 = aboutSections?.[1] ?? {};
  const s2 = aboutSections?.[2] ?? {};

  const s1Paragraphs: string[] = Array.isArray(s1?.content?.paragraphs)
    ? s1.content.paragraphs
    : [];

  const social = footer?.social ?? [];

  return {
    // appearance
    logoUrl,
    primaryColor,

    // header
    wishlistEnabled: !!resolved?.header?.nav?.icons?.wishlist,
    announcementEnabled: !!topBar?.enabled,
    announcementText: topBar?.slides?.[0]?.text ?? "",
    headerMenu: (resolved as any)?.ui?.headerMenu,

    // homepage hero
    heroEnabled: !!hero?.enabled,
    heroHeading: hero?.content?.heading ?? "",
    heroSubtext: hero?.content?.description ?? "",
    heroImageSrc: hero?.image?.src ?? "",
    heroImageAlt: hero?.image?.alt ?? "",
    heroBottomStripEnabled: !!hero?.bottomStrip?.enabled,
    heroBottomStripText: hero?.bottomStrip?.text ?? "",
    heroCtaLabel: hero?.content?.cta?.label ?? "",
    heroCtaHref: hero?.content?.cta?.href ?? "#",

    // footer (legacy + new)
    footerBlurb: footer?.brand?.blurb ?? "",

    footerNewsletterEnabled: !!footer?.newsletter?.enabled,
    footerWhatsappEnabled: !!footer?.whatsapp?.enabled,
    footerWhatsappPhone: footer?.whatsapp?.agents?.[0]?.phone ?? "",

    footerFacebookHref: getSocialHref(social, "facebook"),
    footerInstagramHref: getSocialHref(social, "instagram"),
    footerTwitterHref: getSocialHref(social, "twitter"),
    footerLinkedinHref: getSocialHref(social, "linkedin"),
    footerYoutubeHref: getSocialHref(social, "youtube"),

    // seo (existing)
    seoTitle: seo?.title ?? "",
    seoDescription: seo?.description ?? "",

    // seo (new: favicon + OG)
    seoFaviconIco: seo?.favicon?.ico ?? "",
    seoFaviconPng: seo?.favicon?.png ?? "",
    seoFaviconSvg: seo?.favicon?.svg ?? "",
    seoFaviconAppleTouch: seo?.favicon?.appleTouch ?? "",

    seoOgImageUrl: seo?.ogImage?.url ?? "",
    seoOgImageAlt: seo?.ogImage?.alt ?? "",

    // ✅ About (index-based)
    aboutHero0Title: s0?.content?.title ?? "",
    aboutHero0Description: s0?.content?.description ?? "",
    aboutHero0BgSrc: s0?.background?.image?.src ?? "",
    aboutHero0BgAlt: s0?.background?.image?.alt ?? "",

    aboutSplit1Title: s1?.content?.title ?? "",
    aboutSplit1Paragraph1: s1Paragraphs?.[0] ?? "",
    aboutSplit1Paragraph2: s1Paragraphs?.[1] ?? "",
    aboutSplit1Paragraph3: s1Paragraphs?.[2] ?? "",
    aboutSplit1CtaLabel: s1?.content?.cta?.label ?? "",
    aboutSplit1CtaHref: s1?.content?.cta?.href ?? "",
    aboutSplit1ImgSrc: s1?.image?.src ?? "",
    aboutSplit1ImgAlt: s1?.image?.alt ?? "",

    aboutHero2Title: s2?.content?.title ?? "",
    aboutHero2Description: s2?.content?.description ?? "",
    aboutHero2CtaLabel: s2?.content?.cta?.label ?? "",
    aboutHero2CtaHref: s2?.content?.cta?.href ?? "",
    aboutHero2BgSrc: s2?.background?.image?.src ?? "",
    aboutHero2BgAlt: s2?.background?.image?.alt ?? "",

    // ✅ Contact
    contactPhone: contact.sections[1].info.phone ?? "",
    contactEmail: contact.sections[1].info.email ?? "",
    contactAddress: contact.sections[1].info.address ?? "",
    contactInstagram: contact.sections[1].info.social[0].handle,
  } as DraftState;
}
