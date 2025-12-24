import type { ReactNode } from "react";
import {
  MdDashboard,
  MdShoppingCart,
  MdOutlineInventory2,
  MdBarChart,
  MdArticle,
} from "react-icons/md";
import { FaBoxOpen, FaTag, FaReceipt, FaMapMarkedAlt } from "react-icons/fa";
import { TbUsers } from "react-icons/tb";
import { hasPermission } from "@/lib/auth/has-permission";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { FaStore, FaTruckFast } from "react-icons/fa6";

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

// Optionally apply a base permission to a whole subtree
export function withBasePerm(
  menu: readonly MenuItem[],
  basePerm: string
): MenuItem[];
export function withBasePerm<M extends MenuItem>(
  menu: readonly M[],
  basePerm: string
): M[];

export function withBasePerm(menu: readonly MenuItem[], basePerm: string) {
  return menu.map((item) => {
    if (isDivider(item)) {
      return item;
    }

    const permissions = Array.from(
      new Set([...(item.permissions ?? []), basePerm])
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

/**
 * Recursively filters a menu tree by permissions (ALL-of).
 * - Removes parents the user can't access.
 * - Cleans up leading/trailing/consecutive dividers.
 * - Hides parents with no link and no visible children.
 */
export function filterMenu(
  menu: readonly MenuItem[],
  userPermissions: readonly string[]
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
          (s) => !isDivider(s)
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
  if (cleaned.at(-1) && isDivider(cleaned.at(-1)!)) {
    cleaned.pop();
  }

  return cleaned;
}

/** -----------------------------
 * Commerce Admin Menu
 * ------------------------------*/
export const main: readonly MenuItem[] = [
  {
    title: "Overview",
    icon: <MdDashboard size={20} />,
    link: "/dashboard",
  },
  {
    title: "Orders",
    icon: <MdShoppingCart size={20} />,
    link: "/orders",
    permissions: ["orders.read"],
  },

  {
    title: "Products",
    icon: <BsFillBoxSeamFill size={20} />,
    link: "/products",
    permissions: ["products.read"],
    subItems: [
      {
        title: "All Products",
        link: "/products",
        icon: <FaBoxOpen size={20} />,
        permissions: ["products.read"],
      },
      {
        title: "Add New Product",
        link: "/products/new",
        icon: <FaBoxOpen size={18} />,
        permissions: ["products.create"],
      },
      {
        title: "Collections",
        link: "/products/categories",
        icon: <FaTag size={18} />,
        permissions: ["categories.read"],
      },
      {
        title: "Reviews",
        link: "/products/reviews",
        icon: <FaReceipt size={18} />,
        permissions: ["reviews.read"],
      },
    ],
  },

  {
    title: "Inventory",
    icon: <MdOutlineInventory2 size={20} />,
    link: "/inventory",
    permissions: ["inventory.read"],
    subItems: [
      {
        title: "Overview",
        link: "/inventory",
        icon: <MdOutlineInventory2 size={18} />,
        permissions: ["inventory.read"],
      },
      {
        title: "Transfers",
        link: "/inventory/transfers",
        icon: <FaBoxOpen size={18} />,
        permissions: ["inventory.transfers.read"],
      },
      {
        title: "Locations",
        link: "/inventory/locations",
        icon: <FaMapMarkedAlt size={18} />,
        permissions: ["inventory.adjustments.read"],
      },
      {
        title: "Movements",
        link: "/inventory/movements",
        icon: <MdOutlineInventory2 size={18} />,
        permissions: ["inventory.read"],
      },
    ],
  },
  {
    title: "Customers",
    icon: <TbUsers size={20} />,
    link: "/customers",
    permissions: ["customers.read"],
  },
  {
    title: "Fulfillment",
    icon: <FaTruckFast size={20} />,
    permissions: [
      "shipping.zones.read",
      "shipping.rates.read",
      "shipping.carriers.read",
    ],
    subItems: [
      {
        title: "Zones",
        link: "/shipping/zones",
        icon: <FaMapMarkedAlt size={18} />,
        permissions: ["shipping.zones.read"],
      },
      {
        title: "Carriers",
        link: "/shipping/carriers",
        icon: <FaTruckFast size={18} />, // see note below
        permissions: ["shipping.carriers.read"],
      },
      {
        title: "Rates",
        link: "/shipping/rates",
        icon: <FaReceipt size={18} />,
        permissions: ["shipping.rates.read"],
      },
      {
        title: "Pickup Locations",
        link: "/pickup-locations",
        icon: <FaMapMarkedAlt size={18} />,
        permissions: ["shipping.zones.read"],
      },
    ],
  },
  {
    title: "Billing",
    icon: <FaReceipt size={20} />,
    permissions: [
      "billing.invoices.read",
      "billing.payments.read",
      "billing.taxes.read",
      "billing.invoiceTemplates.read",
    ],
    subItems: [
      {
        title: "Invoices",
        link: "/billing/invoices",
        icon: <FaReceipt size={18} />,
        permissions: ["billing.invoices.read"],
      },
      {
        title: "Payments",
        link: "/billing/payments",
        icon: <FaReceipt size={18} />,
        permissions: ["billing.payments.read"],
      },
    ],
  },

  {
    title: "Analytics",
    icon: <MdBarChart size={22} />,
    link: "/analytics",
    permissions: ["products.read"],
  },
  {
    title: "Blogpost",
    icon: <MdArticle size={22} />, // swap to a better icon if you want (e.g. MdArticle)
    link: "/blog",
    permissions: ["blog.posts.read"],
  },
  {
    title: "Divider",
    name: "Management",
    type: "divider",
  },
  {
    title: "Stores",
    link: "/stores",
    icon: <FaStore size={20} />,
    permissions: ["inventory.transfers.read"],
  },
] as const;
