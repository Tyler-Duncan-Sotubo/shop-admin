/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import {
  MdDashboard,
  MdShoppingCart,
  MdOutlineInventory2,
  MdBarChart,
  MdArticle,
  MdCreditScore,
  MdEmail,
} from "react-icons/md";
import {
  FaReceipt,
  FaFileAlt,
  FaMapMarkedAlt,
  FaPercentage,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { TbUsers } from "react-icons/tb";
import { hasPermission } from "@/lib/auth/has-permission";
import { BsFillBoxSeamFill } from "react-icons/bs";
import {
  FaCode,
  FaCreditCard,
  FaGlobe,
  FaPlug,
  FaTruckFast,
  FaWallet,
} from "react-icons/fa6";
import { RiMailSendLine } from "react-icons/ri";
import {
  PlanFeatureKey,
  planHasFeature,
} from "@/features/subscription/config/plan-features.map";

/** -----------------------------
 * Types
 * ------------------------------*/
export type Permission = string;

type BaseItem = {
  title: string;
  name?: string;
  link?: string;
  icon?: ReactNode;
  permissions?: readonly Permission[];
  planFeature?: PlanFeatureKey;
  subItems?: readonly MenuItem[];
  badgeKey?: "ordersCount";
};

type DividerItem = {
  title: string;
  name?: string;
  type: "divider";
  link?: undefined;
  icon?: undefined;
  permissions?: undefined;
  planFeature?: undefined;
  subItems?: undefined;
};

export type MenuItem = BaseItem | DividerItem;

/** -----------------------------
 * Type guard
 * ------------------------------*/
const isDivider = (i: MenuItem): i is DividerItem =>
  (i as any).type === "divider";

/** -----------------------------
 * Helpers
 * ------------------------------*/
export function withBasePerm(
  menu: readonly MenuItem[],
  basePerm: string,
): MenuItem[];
export function withBasePerm<M extends MenuItem>(
  menu: readonly M[],
  basePerm: string,
): M[];

export function withBasePerm(menu: readonly MenuItem[], basePerm: string) {
  return menu.map((item) => {
    if (isDivider(item)) return item;

    const permissions = Array.from(
      new Set([...(item.permissions ?? []), basePerm]),
    );
    const subItems = item.subItems
      ? withBasePerm(item.subItems, basePerm)
      : undefined;

    return { ...item, permissions, subItems } as typeof item;
  });
}

/** -----------------------------
 * Filtering by permissions + plan
 * ------------------------------*/
export function filterMenu(
  menu: readonly MenuItem[],
  userPermissions: readonly string[],
  userPlanName?: string,
): MenuItem[] {
  const filtered = menu
    .map<MenuItem | null>((item) => {
      if (isDivider(item)) return item;

      const parentAllowed = hasPermission(userPermissions, item.permissions);
      if (!parentAllowed) return null;

      if (item.planFeature && userPlanName) {
        const allowed = planHasFeature(userPlanName, item.planFeature);
        if (!allowed) return null;
      }

      const visibleSubs: MenuItem[] | undefined = item.subItems
        ? filterMenu(item.subItems, userPermissions, userPlanName)
        : undefined;

      if (!item.link) {
        const hasClickableChild = (visibleSubs ?? []).some(
          (s) => !isDivider(s),
        );
        if (!hasClickableChild) return null;
      }

      return { ...item, subItems: visibleSubs } as MenuItem;
    })
    .filter((x): x is MenuItem => x !== null);

  // ── Remove orphaned dividers ──────────────────────────────
  const cleaned: MenuItem[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const item = filtered[i];
    if (isDivider(item)) {
      // Look ahead only until the next divider
      const itemsUntilNextDivider: MenuItem[] = [];
      for (let j = i + 1; j < filtered.length; j++) {
        if (isDivider(filtered[j])) break;
        itemsUntilNextDivider.push(filtered[j]);
      }
      // Only keep divider if it has at least one non-divider item after it
      if (itemsUntilNextDivider.length > 0) {
        cleaned.push(item);
      }
    } else {
      cleaned.push(item);
    }
  }

  // Remove trailing divider
  if (cleaned.length > 0 && isDivider(cleaned[cleaned.length - 1])) {
    cleaned.pop();
  }

  return cleaned;
}

/** Flatten single-child submenus into direct nav items */
export function flattenSingleSubMenus(menu: MenuItem[]): MenuItem[] {
  return menu.map((item) => {
    if (isDivider(item)) return item;

    const subs = item.subItems;
    if (subs && subs.length === 1 && !isDivider(subs[0])) {
      const onlyChild = subs[0] as BaseItem;
      return {
        ...onlyChild,
        icon: item.icon ?? onlyChild.icon,
        subItems: undefined,
      } satisfies MenuItem;
    }

    return item;
  });
}

/** -----------------------------
 * Commerce Admin Menu
 * ------------------------------*/
export const main: readonly MenuItem[] = [
  // ── Core ──────────────────────────────────────────────────
  {
    title: "Overview",
    icon: <MdDashboard size={18} />,
    link: "/dashboard",
  },

  {
    title: "Products",
    icon: <BsFillBoxSeamFill size={18} />,
    link: "/products",
    permissions: ["products.read", "categories.read", "attributes.read"],
  },

  {
    title: "Sales",
    icon: <MdShoppingCart size={18} />,
    subItems: [
      {
        title: "Orders",
        link: "/sales/orders",
        icon: <MdShoppingCart size={18} />,
        permissions: ["orders.read"],
        badgeKey: "ordersCount",
      },
      {
        title: "Quotes",
        link: "/sales/rfqs",
        icon: <FaReceipt size={18} />,
        permissions: ["quotes.read"],
        planFeature: "quotes",
      },
      {
        title: "Invoices",
        link: "/sales/invoices",
        icon: <FaReceipt size={18} />,
        permissions: ["billing.invoices.read"],
      },
      {
        title: "Payments Received",
        link: "/sales/payments-received",
        icon: <FaReceipt size={18} />,
        permissions: ["billing.payments.read"],
      },
    ],
  },

  {
    title: "Customers",
    icon: <TbUsers size={18} />,
    link: "/customers",
    permissions: ["customers.read"],
  },

  {
    title: "Inventory",
    icon: <MdOutlineInventory2 size={18} />,
    link: "/inventory",
    permissions: [
      "inventory.read",
      "inventory.transfers.read",
      "inventory.adjustments.read",
    ],
  },

  {
    title: "Analytics",
    icon: <MdBarChart size={18} />,
    link: "/analytics",
    permissions: ["analytics.read"],
    planFeature: "analyticsDeep",
  },

  // ── Marketing ─────────────────────────────────────────────
  {
    title: "Marketing",
    icon: <RiMailSendLine size={18} />,
    subItems: [
      {
        title: "Campaigns",
        link: "/marketing/campaigns",
        icon: <MdEmail size={18} />,
        planFeature: "emailCampaigns",
      },
      {
        title: "Credits",
        link: "/marketing/credits",
        icon: <MdCreditScore size={18} />,
        planFeature: "emailCampaigns",
      },
    ],
  },

  {
    title: "Content",
    icon: <FaFileAlt size={18} />,
    permissions: ["blog.posts.read"],
    subItems: [
      {
        title: "Files",
        link: "/content/files",
        icon: <FaFileAlt size={18} />,
      },
      {
        title: "Blogpost",
        link: "/content/blog",
        icon: <MdArticle size={18} />,
      },
    ],
  },

  // ── Finance ───────────────────────────────────────────────
  {
    title: "FinanceDivider",
    name: "Finance",
    type: "divider",
  },

  {
    title: "Finance",
    icon: <FaWallet size={18} />,
    subItems: [
      {
        title: "Payment Methods",
        link: "/settings/payment-methods",
        icon: <FaCreditCard size={18} />,
        permissions: ["payments.read"],
      },
      {
        title: "Tax Settings",
        link: "/settings/tax-settings",
        icon: <FaPercentage size={18} />,
        permissions: ["billing.taxes.read", "settings.manage_tax"],
        planFeature: "taxSettings",
      },
      {
        title: "Invoice Template",
        link: "/settings/invoice-template",
        icon: <FaFileInvoiceDollar size={18} />,
        permissions: [
          "billing.invoiceTemplates.read",
          "billing.invoiceBranding.read",
        ],
      },
    ],
  },

  // ── Operations ────────────────────────────────────────────
  {
    title: "OperationsDivider",
    name: "Operations",
    type: "divider",
  },

  {
    title: "Operations",
    icon: <FaPlug size={18} />,
    subItems: [
      {
        title: "Shipping",
        link: "/shipping",
        icon: <FaTruckFast size={18} />,
        permissions: [
          "shipping.zones.read",
          "shipping.rates.read",
          "shipping.carriers.read",
        ],
        planFeature: "shippingZones",
      },
      {
        title: "Locations",
        link: "/settings/inventory/locations",
        icon: <FaMapMarkedAlt size={18} />,
        permissions: ["locations.read"],
        planFeature: "multiLocation",
      },

      {
        title: "Integrations",
        link: "/settings/integrations",
        icon: <FaPlug size={18} />,
        permissions: ["integrations.analytics.read", "integrations.zoho.read"],
        planFeature: "googleAnalytics",
      },
      {
        title: "API & Webhooks",
        link: "/settings/developers",
        icon: <FaCode size={18} />,
        permissions: ["apikeys.read"],
      },
    ],
  },

  // ── Account & Setup ───────────────────────────────────────
  {
    title: "AccountDivider",
    name: "Account & Setup",
    type: "divider",
  },

  {
    title: "Online Store",
    link: "/online-store",
    icon: <FaGlobe size={18} />,
    permissions: ["stores.read"],
  },
] as const;
