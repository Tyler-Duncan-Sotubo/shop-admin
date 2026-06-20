/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
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
import { useDispatchesCount } from "@/features/inventory/dispatches/hooks/use-dispatches-count";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useGetMySubscription } from "@/features/subscription/hooks/use-subscriptions";

const TOPBAR_HEIGHT = "3.5rem";

const isDivider = (
  item: MenuItem,
): item is Extract<MenuItem, { type: "divider" }> =>
  (item as any).type === "divider";

const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

const SALES_ORDERS_LINKS = new Set(["/sales/orders"]);
const SALES_QUOTES_LINKS = new Set(["/sales/rfqs"]);
const INVENTORY_LINKS = new Set(["/inventory"]);

const navItemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.2, ease: "easeOut" as const },
  }),
};

const subItemVariants: Variants = {
  hidden: { opacity: 0, x: -4 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.15, ease: "easeOut" as const },
  }),
};

export default function AdminSidebar() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();

  const axios = useAxiosAuth();
  const pathname = usePathname();

  const userPermissions = useMemo(() => session?.permissions ?? [], [session]);

  const canReadOrders = userPermissions.includes("orders.read");
  const canReadQuotes = userPermissions.includes("quotes.read");
  const canReadInventory = userPermissions.includes("inventory.read");

  const { data: dispatchesCount = 0 } = useDispatchesCount(
    session,
    axios,
    activeStoreId,
    canReadInventory,
  );

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

  const { data: subscription } = useGetMySubscription(session, axios);

  const salesTotalCount =
    (canReadOrders ? ordersCount : 0) + (canReadQuotes ? quotesCount : 0);

  const planName =
    subscription?.status === "trialing"
      ? "Pro"
      : (subscription?.plan.name ?? "Free");

  const filteredMenu = useMemo(
    () => flattenSingleSubMenus(filterMenu(main, userPermissions, planName)),
    [userPermissions, planName],
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
    if (activeTopNoSub) setOpenSection(null);
  }, [activeSectionTitle, filteredMenu, pathname]);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const isInSalesSection = useMemo(
    () => pathname === "/sales/orders" || pathname.startsWith("/sales/"),
    [pathname],
  );

  const getSubBadge = (link?: string | null) => {
    if (!link) return null;
    if (SALES_ORDERS_LINKS.has(link) && canReadOrders && ordersCount > 0)
      return ordersCount;
    if (SALES_QUOTES_LINKS.has(link) && canReadQuotes && quotesCount > 0)
      return quotesCount;
    if (INVENTORY_LINKS.has(link) && canReadInventory && dispatchesCount > 0)
      return dispatchesCount;
    return null;
  };

  const salesParentBadgeVisible = (isSectionOpen: boolean) =>
    salesTotalCount > 0 && !isSectionOpen && !isInSalesSection;

  return (
    <aside
      className="md:fixed hidden left-0 z-40 bg-white border-r p-2 md:flex flex-col overflow-y-auto no-scrollbar w-[210px]"
      style={{
        top: TOPBAR_HEIGHT,
        height: `calc(100dvh - ${TOPBAR_HEIGHT})`,
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      }}
    >
      <nav className="flex-1 min-h-0 mt-2 space-y-1">
        {filteredMenu.map((item, index) => {
          if (isDivider(item)) {
            return (
              <motion.div
                key={item.name ?? item.title}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
                className="px-2 pt-4 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                {item.name ?? item.title}
              </motion.div>
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
              : item.title === "Inventory"
                ? dispatchesCount > 0 && !isSectionOpen
                : false;

          const topBadge = showTopBadge
            ? item.title === "Sales"
              ? salesTotalCount
              : dispatchesCount
            : null;

          const topLevelClassName = `flex items-center gap-2 px-2 py-[7px] rounded transition-colors cursor-pointer ${
            isActiveTopLevel || isActiveParent
              ? "text-primary font-extrabold"
              : "hover:bg-muted font-semibold text-gray-500"
          }`;

          const TopLevelContent = (
            <div className={topLevelClassName}>
              {(item as any).icon}
              <span className="flex items-center justify-between w-full text-sm">
                <span className="flex items-center gap-2">
                  {item.title}
                  {topBadge ? (
                    <Badge className="h-5 px-2 text-xs">{topBadge}</Badge>
                  ) : null}
                </span>
                {hasSub ? (
                  <motion.span
                    animate={{ rotate: isSectionOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ display: "flex" }}
                  >
                    <FiChevronDown size={16} />
                  </motion.span>
                ) : null}
              </span>
            </div>
          );

          return (
            <motion.div
              key={`${item.title}-${index}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
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

              <AnimatePresence initial={false}>
                {hasSub && isSectionOpen && (
                  <motion.div
                    key={`${item.title}-sub`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    {/* ── Indent line + items ── */}
                    <div className="relative ml-[18px] mt-1 mb-1">
                      {/* Vertical line */}
                      <div className="absolute left-0 w-px top-1 bottom-1 bg-border" />

                      <ul className="space-y-0.5">
                        {(item as any).subItems!.map(
                          (sub: any, subIndex: number) =>
                            sub.name ? (
                              <li
                                key={sub.name}
                                className="pl-4 py-4 text-[10px] uppercase tracking-wide text-muted-foreground"
                              >
                                {sub.name}
                              </li>
                            ) : (
                              <motion.li
                                key={sub.link}
                                custom={subIndex}
                                initial="hidden"
                                animate="visible"
                                variants={subItemVariants}
                                className="pl-3"
                              >
                                {(() => {
                                  const isActiveSub = isLinkOrDescendant(
                                    pathname,
                                    sub.link,
                                  );
                                  const subBadge = getSubBadge(sub.link);
                                  return (
                                    <Link
                                      href={sub.link!}
                                      className={`flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                                        isActiveSub
                                          ? "text-primary font-bold bg-primary/5"
                                          : "hover:bg-muted text-black/70 font-medium"
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
                              </motion.li>
                            ),
                        )}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}
