/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiChevronDown } from "react-icons/fi";
import {
  filterMenu,
  flattenSingleSubMenus,
  main,
  type MenuItem,
} from "../config/admin-nav.config";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Badge } from "@/shared/ui/badge";
import { useOrdersTotalCount } from "@/features/orders/hooks/use-orders-total-count";
import { useQuotesTotalCount } from "@/features/quotes/hooks/use-quotes-total-count";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { useStores } from "@/features/settings/stores/core/hooks/use-stores";
import { StoreSwitcher } from "./store-select";

const TOPBAR_HEIGHT = "3.5rem";

const isDivider = (
  item: MenuItem,
): item is Extract<MenuItem, { type: "divider" }> =>
  (item as any).type === "divider";

const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

const SALES_ORDERS_LINKS = new Set(["/sales/orders"]);
const SALES_QUOTES_LINKS = new Set(["/sales/rfqs"]);

export default function AdminSidebar() {
  const { data: session } = useSession();
  const { activeStoreId, setActiveStoreId } = useStoreScope();
  const { stores } = useStores();

  const axios = useAxiosAuth();
  const pathname = usePathname();

  const userPermissions = useMemo(() => session?.permissions ?? [], [session]);

  const canReadOrders = userPermissions.includes("orders.read");
  const canReadQuotes = userPermissions.includes("quotes.read");

  const { data: ordersCount = 0 } = useOrdersTotalCount(
    session,
    axios,
    activeStoreId,
    canReadOrders,
  );

  const { data: quotesCount = 0 } = useQuotesTotalCount(
    session,
    axios,
    activeStoreId,
    canReadQuotes,
  );

  const salesTotalCount =
    (canReadOrders ? ordersCount : 0) + (canReadQuotes ? quotesCount : 0);

  const filteredMenu = useMemo(
    () => flattenSingleSubMenus(filterMenu(main, userPermissions)),
    [userPermissions],
  );

  const activeSectionTitle = useMemo(() => {
    for (const item of filteredMenu) {
      if (isDivider(item)) continue;

      const subItems = (item as any).subItems ?? [];
      const hasActiveSub = subItems.some(
        (sub: any) => !sub.name && isLinkOrDescendant(pathname, sub.link),
      );

      if (hasActiveSub) return item.title;
    }

    return null;
  }, [filteredMenu, pathname]);

  const [openSection, setOpenSection] = useState<string | null>(
    activeSectionTitle,
  );

  useEffect(() => {
    if (activeSectionTitle) {
      setOpenSection(activeSectionTitle);
      return;
    }

    const activeTopNoSub = filteredMenu.find((m: any) => {
      const hasSub = !!m?.subItems?.length;
      if (hasSub) return false;
      return isLinkOrDescendant(pathname, m.link);
    });

    if (activeTopNoSub) {
      setOpenSection(null);
    }
  }, [activeSectionTitle, filteredMenu, pathname]);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const isInSalesSection = useMemo(() => {
    return pathname === "/sales/orders" || pathname.startsWith("/sales/");
  }, [pathname]);

  const getSubBadge = (link?: string | null) => {
    if (!link) return null;

    if (SALES_ORDERS_LINKS.has(link) && canReadOrders && ordersCount > 0) {
      return ordersCount;
    }

    if (SALES_QUOTES_LINKS.has(link) && canReadQuotes && quotesCount > 0) {
      return quotesCount;
    }

    return null;
  };

  const salesParentBadgeVisible = (isSectionOpen: boolean) =>
    salesTotalCount > 0 && !isSectionOpen && !isInSalesSection;

  return (
    <aside
      className="md:fixed hidden left-0 z-40 bg-white border-r p-2 md:flex flex-col overflow-y-auto no-scrollbar w-[180px]"
      style={{
        top: TOPBAR_HEIGHT,
        height: `calc(100dvh - ${TOPBAR_HEIGHT})`,
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      }}
    >
      <div className="py-1">
        <StoreSwitcher
          stores={stores}
          value={activeStoreId}
          onChange={setActiveStoreId}
        />
      </div>

      <nav className="space-y-2 mt-2 flex-1">
        {filteredMenu.map((item) => {
          if (isDivider(item)) {
            return (
              <div
                key={item.name ?? item.title}
                className="px-2 pt-4 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                {item.name ?? item.title}
              </div>
            );
          }

          const hasSub = Boolean((item as any).subItems?.length);
          const isSectionOpen = hasSub && openSection === item.title;

          const isActiveTopLevel = !hasSub
            ? isLinkOrDescendant(pathname, (item as any).link)
            : false;

          const isActiveParent =
            hasSub &&
            ((item as any).subItems ?? []).some(
              (sub: any) => !sub.name && isLinkOrDescendant(pathname, sub.link),
            );

          const showTopBadge =
            item.title === "Sales"
              ? salesParentBadgeVisible(isSectionOpen)
              : false;

          const topBadge = showTopBadge ? salesTotalCount : null;

          const topLevelClassName = `flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer ${
            isActiveTopLevel || isActiveParent
              ? "text-primary font-extrabold"
              : "hover:bg-muted font-semibold text-gray-500"
          }`;

          const TopLevelContent = (
            <div className={topLevelClassName}>
              {(item as any).icon}

              <span className="flex items-center justify-between w-full text-[13px]">
                <span className="flex items-center gap-2">
                  {item.title}
                  {topBadge ? (
                    <Badge className="h-5 px-2 text-xs">{topBadge}</Badge>
                  ) : null}
                </span>

                {hasSub ? (
                  <FiChevronDown
                    size={16}
                    className={`transition-transform ${
                      isSectionOpen ? "rotate-180" : ""
                    }`}
                  />
                ) : null}
              </span>
            </div>
          );

          return (
            <div key={item.title}>
              {hasSub ? (
                <button
                  type="button"
                  onClick={() => toggleSection(item.title)}
                  className="block w-full text-left"
                >
                  {TopLevelContent}
                </button>
              ) : (item as any).link ? (
                <Link href={(item as any).link} className="block">
                  {TopLevelContent}
                </Link>
              ) : (
                <div>{TopLevelContent}</div>
              )}

              {hasSub && isSectionOpen && (
                <ul className="mt-1 space-y-1">
                  {(item as any).subItems!.map((sub: any) =>
                    sub.name ? (
                      <li
                        key={sub.name}
                        className="text-xs uppercase bg-muted px-5 py-1"
                      >
                        {sub.name}
                      </li>
                    ) : (
                      <li key={sub.link}>
                        {(() => {
                          const isActiveSub = isLinkOrDescendant(
                            pathname,
                            sub.link,
                          );

                          const subBadge = getSubBadge(sub.link);

                          return (
                            <Link
                              href={sub.link!}
                              className={`flex items-center justify-between px-4 py-1.5 text-[13px] rounded transition-colors ${
                                isActiveSub
                                  ? "text-primary font-bold"
                                  : "hover:bg-muted text-black font-medium"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {sub.title}
                                {subBadge ? (
                                  <Badge className="h-5 px-2 text-xs">
                                    {subBadge}
                                  </Badge>
                                ) : null}
                              </span>
                            </Link>
                          );
                        })()}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
