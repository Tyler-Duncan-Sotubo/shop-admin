import type { ReactNode } from "react";
import {
  MdDashboard,
  MdShoppingCart,
  MdOutlineInventory2,
  MdBarChart,
  MdArticle,
  MdIntegrationInstructions,
} from "react-icons/md";
import { FaReceipt, FaFileAlt, FaCog } from "react-icons/fa";
import { TbUsers } from "react-icons/tb";
import { hasPermission } from "@/lib/auth/has-permission";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { FaGlobe, FaTruckFast } from "react-icons/fa6";

/** -----------------------------
 * Types
 * ------------------------------*/
export type Permission = string;

type BaseItem = {
  title: string;
  name?: string; // optional group label
  link?: string;
  icon?: ReactNode;
  permissions?: readonly Permission[];
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
  subItems?: undefined;
};

export type MenuItem = BaseItem | DividerItem;

/** -----------------------------
 * Type guard
 * ------------------------------*/
const isDivider = (i: MenuItem): i is DividerItem =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * Filtering by permissions
 * ------------------------------*/
export function filterMenu(
  menu: readonly MenuItem[],
  userPermissions: readonly string[],
): MenuItem[] {
  const filtered = menu
    .map<MenuItem | null>((item) => {
      if (isDivider(item)) return item;

      const parentAllowed = hasPermission(userPermissions, item.permissions);
      if (!parentAllowed) return null;

      const visibleSubs: MenuItem[] | undefined = item.subItems
        ? filterMenu(item.subItems, userPermissions)
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

  const cleaned: MenuItem[] = [];
  let lastWasDivider = true;
  for (const it of filtered) {
    if (isDivider(it)) {
      if (!lastWasDivider) {
        cleaned.push(it);
        lastWasDivider = true;
      }
    } else {
      cleaned.push(it);
      lastWasDivider = false;
    }
  }
  if (cleaned.at(-1) && isDivider(cleaned.at(-1)!)) cleaned.pop();

  return cleaned;
}

/** -----------------------------
 * Commerce Admin Menu
 * ------------------------------*/
export const main: readonly MenuItem[] = [
  {
    title: "Overview",
    icon: <MdDashboard size={18} />,
    link: "/dashboard",
  },

  // ✅ keep Sales exactly as-is (per your request)
  {
    title: "Sales",
    icon: <MdShoppingCart size={18} />,
    link: "/sales/orders",
    permissions: [
      "billing.invoices.read",
      "billing.payments.read",
      "billing.taxes.read",
      "billing.invoiceTemplates.read",
    ],
    subItems: [
      {
        title: "Orders",
        link: "/sales/orders",
        icon: <MdShoppingCart size={18} />,
        permissions: ["orders.read"],
        badgeKey: "ordersCount",
      },
      {
        title: "Quote Requests",
        link: "/sales/rfqs",
        icon: <FaReceipt size={18} />,
        permissions: ["quotes.read"],
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
    title: "Products",
    icon: <BsFillBoxSeamFill size={18} />,
    link: "/products",
    permissions: [
      "products.read",
      "products.create",
      "categories.read",
      "reviews.read",
    ],
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
    title: "Customers",
    icon: <TbUsers size={18} />,
    link: "/customers",
    permissions: ["customers.read"],
  },

  {
    title: "Shipping",
    link: "/shipping",
    icon: <FaTruckFast size={18} />,
    permissions: [
      "shipping.zones.read",
      "shipping.rates.read",
      "shipping.carriers.read",
    ],
  },

  {
    title: "Analytics",
    icon: <MdBarChart size={18} />,
    link: "/analytics",
    permissions: ["analytics.read"],
  },

  // ✅ keep Content exactly as-is (per your request)
  {
    title: "Content",
    link: "/content/files",
    icon: <FaFileAlt size={18} />,
    permissions: ["blog.posts.read"],
    subItems: [
      { title: "Files", link: "/content/files", icon: <FaFileAlt size={18} /> },
      {
        title: "Blogpost",
        link: "/content/blog",
        icon: <MdArticle size={18} />,
      },
    ],
  },

  {
    title: "Divider",
    name: "Account & Setup",
    type: "divider",
  },

  {
    title: "Online Store",
    link: "/online-store", // or "/stores" if you prefer
    icon: <FaGlobe size={18} />,
    permissions: ["stores.read"],
  },
  {
    title: "Apps",
    link: "/apps",
    icon: <MdIntegrationInstructions size={20} />,
    permissions: ["integrations.analytics.read"],
  },
  {
    title: "Settings",
    link: "/settings",
    icon: <FaCog size={20} />,
    permissions: ["settings.read"],
  },
] as const;
