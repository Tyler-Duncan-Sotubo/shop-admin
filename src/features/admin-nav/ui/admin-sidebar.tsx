/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiChevronDown } from "react-icons/fi";
import { filterMenu, main, type MenuItem } from "../config/admin-nav.config";

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

// Badge rules
const SALES_ORDERS_LINKS = new Set(["/sales/orders"]);
const SALES_QUOTES_LINKS = new Set(["/sales/rfqs"]);

export default function AdminSidebar() {
  const { data: session } = useSession();
  const { activeStoreId, setActiveStoreId } = useStoreScope();
  const { stores } = useStores();

  const axios = useAxiosAuth();
  const pathname = usePathname();

  const { data: ordersCount = 0 } = useOrdersTotalCount(
    session,
    axios,
    activeStoreId,
  );

  const { data: quotesCount = 0 } = useQuotesTotalCount(
    session,
    axios,
    activeStoreId,
  );

  const salesTotalCount = ordersCount + quotesCount;

  const userPermissions =
    (session as any)?.user?.permissions ?? (session as any)?.permissions ?? [];

  const filteredMenu = filterMenu(main, userPermissions);

  const isInSalesSection = useMemo(() => {
    return pathname === "/sales/orders" || pathname.startsWith("/sales/");
  }, [pathname]);

  const flatSubs = useMemo(
    () =>
      filteredMenu.flatMap((menu) =>
        "subItems" in menu && (menu as any).subItems
          ? (menu as any).subItems
              .filter((s: any) => !s.name)
              .map((sub: any) => ({ parent: menu, sub }))
          : [],
      ),
    [filteredMenu],
  );

  const activeSubMatch = useMemo(() => {
    const matches = flatSubs.filter(({ sub }: any) =>
      isLinkOrDescendant(pathname, sub.link),
    );

    matches.sort(
      (a: any, b: any) => (b.sub.link?.length ?? 0) - (a.sub.link?.length ?? 0),
    );

    return matches[0] ?? null;
  }, [flatSubs, pathname]);

  const activeSectionTitle = activeSubMatch?.parent?.title ?? null;

  const [openSection, setOpenSection] = useState<string | null>(
    activeSectionTitle,
  );

  const [suppressedSection, setSuppressedSection] = useState<string | null>(
    null,
  );

  const clearSuppressionOnActiveChange = useEffectEvent(
    (nextActive: string | null) => {
      setSuppressedSection((prev) => {
        if (prev && prev !== nextActive) return null;
        return prev;
      });
    },
  );

  useEffect(() => {
    clearSuppressionOnActiveChange(activeSectionTitle);
  }, [activeSectionTitle]);

  const syncOpenSection = useEffectEvent((title: string | null) => {
    if (!title) return;
    if (suppressedSection === title) return;
    setOpenSection(title);
  });

  useEffect(() => {
    syncOpenSection(activeSectionTitle);
  }, [activeSectionTitle]);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => {
      const willClose = prev === title;

      if (willClose && activeSectionTitle === title) {
        setSuppressedSection(title);
        return null;
      }

      if (!willClose) {
        setSuppressedSection((s) => (s === title ? null : s));
        return title;
      }

      return null;
    });
  };

  const closeAllSections = useEffectEvent(() => {
    setOpenSection(null);
    setSuppressedSection(null);
  });

  useEffect(() => {
    const activeTopNoSub = filteredMenu.find((m: any) => {
      const hasSub = "subItems" in m && m.subItems?.length;
      if (hasSub) return false;
      return isLinkOrDescendant(pathname, m.link);
    });

    if (activeTopNoSub) closeAllSections();
  }, [pathname, filteredMenu]);

  const getSubBadge = (link?: string | null) => {
    if (!link) return null;

    if (SALES_ORDERS_LINKS.has(link) && ordersCount > 0) return ordersCount;
    if (SALES_QUOTES_LINKS.has(link) && quotesCount > 0) return quotesCount;

    return null;
  };

  const salesParentBadgeVisible = (isSectionOpen: boolean) =>
    salesTotalCount > 0 && !isSectionOpen && !isInSalesSection;

  return (
    <aside
      className="md:fixed hidden left-0 z-40 bg-white border-r p-2 md:flex flex-col overflow-y-auto no-scrollbar w-[14.5%]"
      style={{
        top: TOPBAR_HEIGHT,
        height: `calc(100vh - ${TOPBAR_HEIGHT})`,
      }}
    >
      {/* Store selector */}
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

          const showTopBadge =
            item.title === "Sales"
              ? salesParentBadgeVisible(isSectionOpen)
              : false;

          const topBadge = showTopBadge ? salesTotalCount : null;

          const TopLevelContent = (
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer ${
                isActiveTopLevel
                  ? "text-primary font-extrabold"
                  : "hover:bg-muted font-semibold text-gray-500"
              }`}
            >
              {(item as any).icon}

              <span className="flex items-center justify-between w-full text-[13px]">
                <span className="flex items-center gap-2">
                  {item.title}
                  {topBadge ? (
                    <Badge className="h-5 px-2 text-xs">{topBadge}</Badge>
                  ) : null}
                </span>

                {hasSub && (
                  <FiChevronDown
                    size={16}
                    className={`transition-transform ${
                      isSectionOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </span>
            </div>
          );

          return (
            <div key={item.title}>
              {(item as any).link ? (
                <Link
                  href={(item as any).link}
                  className="block"
                  onClick={() => {
                    if (hasSub) toggleSection(item.title);
                    else closeAllSections();
                  }}
                >
                  {TopLevelContent}
                </Link>
              ) : (
                <div
                  onClick={() => {
                    if (hasSub) toggleSection(item.title);
                  }}
                >
                  {TopLevelContent}
                </div>
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
                          const isActiveSub =
                            !!sub.link && activeSubMatch?.sub.link === sub.link;

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
