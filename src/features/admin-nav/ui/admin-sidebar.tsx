/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import { useSession } from "next-auth/react";
import { FiChevronDown } from "react-icons/fi";
import { filterMenu, main, type MenuItem } from "../config/admin-nav.config";
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarRightCollapseFilled,
} from "react-icons/tb";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Badge } from "@/shared/ui/badge";
import { useOrdersTotalCount } from "@/features/orders/hooks/use-orders-total-count";
import { useQuotesTotalCount } from "@/features/quotes/hooks/use-quotes-total-count";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import Image from "next/image";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const isDivider = (
  item: MenuItem
): item is Extract<MenuItem, { type: "divider" }> =>
  (item as any).type === "divider";

const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

// We only want the badge to appear on the Sales sub-items we care about
const SALES_ORDERS_LINKS = new Set(["/sales/orders"]);
const SALES_QUOTES_LINKS = new Set(["/sales/rfqs"]);

export default function AdminSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();
  const axios = useAxiosAuth();
  const pathname = usePathname();

  // ✅ counts used for badges
  const { data: ordersCount = 0 } = useOrdersTotalCount(
    session,
    axios,
    activeStoreId
  );

  const { data: quotesCount = 0 } = useQuotesTotalCount(
    session,
    axios,
    activeStoreId
  );

  const salesTotalCount = ordersCount + quotesCount;

  const userPermissions =
    (session as any)?.user?.permissions ?? (session as any)?.permissions ?? [];

  const filteredMenu = filterMenu(main, userPermissions);

  // Are we currently on any Sales route? (so we don't show badge on Sales parent)
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
          : []
      ),
    [filteredMenu]
  );

  const activeSubMatch = useMemo(() => {
    const matches = flatSubs.filter(({ sub }: any) =>
      isLinkOrDescendant(pathname, sub.link)
    );

    matches.sort(
      (a: any, b: any) => (b.sub.link?.length ?? 0) - (a.sub.link?.length ?? 0)
    );

    return matches[0] ?? null;
  }, [flatSubs, pathname]);

  const activeSectionTitle = activeSubMatch?.parent?.title ?? null;

  const [openSection, setOpenSection] = useState<string | null>(
    activeSectionTitle
  );

  const [suppressedSection, setSuppressedSection] = useState<string | null>(
    null
  );

  const clearSuppressionOnActiveChange = useEffectEvent(
    (nextActive: string | null) => {
      setSuppressedSection((prev) => {
        if (prev && prev !== nextActive) return null;
        return prev;
      });
    }
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

  // ✅ close any open section when navigating to a top-level item
  // that has NO subItems (a "parent" link without children).
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

  /**
   * Badge rules:
   * - Show badge on Sales ONLY when Sales is CLOSED/collapsed AND user is NOT already in /sales/*
   * - Show badge ONLY on Orders & Quote Requests sub-items when Sales is OPEN (expanded) or user is inside /sales/*
   */
  const getSubBadge = (link?: string | null) => {
    if (!link) return null;

    if (SALES_ORDERS_LINKS.has(link) && ordersCount > 0) return ordersCount;
    if (SALES_QUOTES_LINKS.has(link) && quotesCount > 0) return quotesCount;

    return null;
  };

  const salesParentBadgeVisible = (isSectionOpen: boolean) =>
    salesTotalCount > 0 && (isCollapsed || !isSectionOpen) && !isInSalesSection;

  return (
    <TooltipProvider>
      <motion.aside
        animate={{ width: isCollapsed ? "4rem" : "16%" }}
        transition={{ duration: 0.2 }}
        className="relative md:fixed hidden left-0 top-0 h-screen bg-white border-r p-2 md:flex flex-col overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between px-3 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">
              <Image
                src="/apple-touch-icon.png"
                alt="Logo"
                width={32}
                height={32}
              />
            </span>
          </Link>
        </div>

        <nav className="space-y-2 mt-2 flex-1">
          {filteredMenu.map((item) => {
            if (isDivider(item)) {
              return !isCollapsed ? (
                <div
                  key={item.name ?? item.title}
                  className="px-5 pt-4 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground"
                >
                  {item.name ?? item.title}
                </div>
              ) : null;
            }

            const hasSub = Boolean((item as any).subItems?.length);
            const isSectionOpen = hasSub && openSection === item.title;

            const isActiveTopLevel = !hasSub
              ? isLinkOrDescendant(pathname, (item as any).link)
              : false;

            // ✅ Show combined badge on Sales parent only when rules allow
            const showTopBadge =
              item.title === "Sales"
                ? salesParentBadgeVisible(isSectionOpen)
                : false;

            // ✅ IMPORTANT: do NOT show badge on any other top-level items
            const topBadge = showTopBadge ? salesTotalCount : null;

            const TopLevelContent = (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  isActiveTopLevel
                    ? "text-primary font-extrabold"
                    : "hover:bg-muted font-semibold text-gray-500"
                }`}
              >
                {(item as any).icon}

                {!isCollapsed && (
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
                )}
              </div>
            );

            return (
              <div key={item.title}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>

                  {isCollapsed && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>

                {hasSub && !isCollapsed && isSectionOpen && (
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
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              {(() => {
                                const isActiveSub =
                                  !!sub.link &&
                                  activeSubMatch?.sub.link === sub.link;

                                const subBadge = getSubBadge(sub.link);

                                return (
                                  <Link
                                    href={sub.link!}
                                    className={`flex items-center justify-between px-8 py-2 text-[13px] rounded transition-colors ${
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
                            </TooltipTrigger>

                            {isCollapsed && (
                              <TooltipContent side="right">
                                {sub.title}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            );
          })}

          <div className="absolute bottom-4 right-4">
            <button
              onClick={onToggle}
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm hover:bg-gray-100"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <TbLayoutSidebarRightCollapseFilled size={20} />
              ) : (
                <TbLayoutSidebarLeftCollapseFilled size={24} />
              )}
            </button>
          </div>
        </nav>
      </motion.aside>
    </TooltipProvider>
  );
}
