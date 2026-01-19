/* eslint-disable @typescript-eslint/no-explicit-any */
import { DraftState } from "../types/customiser.type";
import type { HeaderNavItem } from "../types/storefront-config.types";

const BASE_MENU: HeaderNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" }, // change to your real shop route if needed
];

type NavItemLike = { label: string; href: string } & Record<string, any>;

const OPTIONAL = {
  about: { label: "About Us", href: "/about-us" },
  contact: { label: "Contact", href: "/contact" },
  blog: { label: "Blog", href: "/blog" },
} as const;

function normalizeLabel(s: string) {
  return s.trim().toLowerCase();
}

const OPTIONAL_MENU: Record<keyof DraftState["headerMenu"], HeaderNavItem> = {
  about: { label: "About", href: "/about" },
  contact: { label: "Contact", href: "/contact" },
  blog: { label: "Blog", href: "/blog" },
};

export function flagsFromResolved(items: HeaderNavItem[]) {
  const has = (label: string) =>
    items.some((it) => it.label.toLowerCase() === label.toLowerCase());

  return {
    about: has("About"),
    contact: has("Contact"),
    blog: has("Blog"),
  };
}

export function buildMenu(flags: DraftState["headerMenu"]): HeaderNavItem[] {
  return [
    ...BASE_MENU,
    ...(flags.about ? [OPTIONAL_MENU.about] : []),
    ...(flags.contact ? [OPTIONAL_MENU.contact] : []),
    ...(flags.blog ? [OPTIONAL_MENU.blog] : []),
  ];
}

export function upsertOptionalItems(
  resolvedItems: NavItemLike[],
  flags: { about: boolean; contact: boolean; blog: boolean }
) {
  // remove any existing optional items first (so we can re-add based on flags)
  const filtered = resolvedItems.filter((it) => {
    const l = normalizeLabel(it.label);
    return (
      l !== normalizeLabel(OPTIONAL.about.label) &&
      l !== normalizeLabel(OPTIONAL.contact.label) &&
      l !== normalizeLabel(OPTIONAL.blog.label)
    );
  });

  // add back enabled ones (at the end, like your JSON)
  const out = [...filtered];
  if (flags.about) out.push(OPTIONAL.about as any);
  if (flags.contact) out.push(OPTIONAL.contact as any);
  if (flags.blog) out.push(OPTIONAL.blog as any);

  return out;
}
