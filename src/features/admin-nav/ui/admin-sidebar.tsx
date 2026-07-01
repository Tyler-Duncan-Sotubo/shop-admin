/* eslint-disable react-hooks/set-state-in-effect */
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
  isDivider,
  main,
  type BadgeKey,
  type MenuItem,
  type NavItem,
} from "../config/admin-nav.config";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Badge } from "@/shared/ui/badge";
import { useOrdersTotalCount } from "@/features/orders/hooks/use-orders-total-count";
import { useQuotesTotalCount } from "@/features/quotes/hooks/use-quotes-total-count";
import { useDispatchesCount } from "@/features/inventory/dispatches/hooks/use-dispatches-count";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useGetMySubscription } from "@/features/subscription/hooks/use-subscriptions";

const TOPBAR_HEIGHT = "3.5rem";

const isLinkOrDescendant = (pathname: string, link?: string) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

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
  const { data: dispatchesCount = 0 } = useDispatchesCount(
    session,
    axios,
    activeStoreId,
    canReadInventory,
  );
  const { data: subscription } = useGetMySubscription(session, axios);

  const planName =
    subscription?.status === "trialing"
      ? "Pro"
      : (subscription?.plan.name ?? "Free");

  const filteredMenu = useMemo(
    () => flattenSingleSubMenus(filterMenu(main, userPermissions, planName)),
    [userPermissions, planName],
  );

  // ── Badge counts keyed by BadgeKey ────────────────────────
  const badgeCounts: Record<BadgeKey, number> = useMemo(
    () => ({
      ordersCount: canReadOrders ? ordersCount : 0,
      quotesCount: canReadQuotes ? quotesCount : 0,
      dispatchesCount: canReadInventory ? dispatchesCount : 0,
    }),
    [
      canReadOrders,
      ordersCount,
      canReadQuotes,
      quotesCount,
      canReadInventory,
      dispatchesCount,
    ],
  );

  const getItemBadge = (item: NavItem): number | null => {
    if (!item.badgeKey) return null;
    const count = badgeCounts[item.badgeKey];
    return count > 0 ? count : null;
  };

  // For group parents: sum sub-badges when collapsed
  const getParentBadge = (
    item: NavItem,
    isSectionOpen: boolean,
  ): number | null => {
    if (isSectionOpen || !item.subItems) return null;
    const total = item.subItems
      .filter((s): s is NavItem => !isDivider(s))
      .reduce(
        (sum, s) => sum + (s.badgeKey ? (badgeCounts[s.badgeKey] ?? 0) : 0),
        0,
      );
    return total > 0 ? total : null;
  };

  // ── Active section tracking ───────────────────────────────
  const activeSectionTitle = useMemo(() => {
    for (const item of filteredMenu) {
      if (isDivider(item)) continue;
      const hasActiveSub = (item.subItems ?? []).some(
        (s) =>
          !isDivider(s) && isLinkOrDescendant(pathname, (s as NavItem).link),
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
    const activeTopNoSub = filteredMenu.find(
      (m) =>
        !isDivider(m) &&
        !(m as NavItem).subItems?.length &&
        isLinkOrDescendant(pathname, (m as NavItem).link),
    );
    if (activeTopNoSub) setOpenSection(null);
  }, [activeSectionTitle, filteredMenu, pathname]);

  const toggleSection = (title: string) =>
    setOpenSection((prev) => (prev === title ? null : title));

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

          const hasSub = Boolean(item.subItems?.length);
          const isSectionOpen = hasSub && openSection === item.title;
          const isActiveTopLevel =
            !hasSub && isLinkOrDescendant(pathname, item.link);
          const isActiveParent =
            hasSub &&
            (item.subItems ?? []).some(
              (s) =>
                !isDivider(s) &&
                isLinkOrDescendant(pathname, (s as NavItem).link),
            );

          const topBadge = hasSub
            ? getParentBadge(item, isSectionOpen)
            : getItemBadge(item);

          const topLevelClassName = `flex items-center gap-2 px-2 py-[8px] rounded transition-colors cursor-pointer ${
            isActiveTopLevel || isActiveParent
              ? "text-primary font-extrabold"
              : "hover:bg-muted font-semibold text-gray-500"
          }`;

          const TopLevelContent = (
            <div className={topLevelClassName}>
              {item.icon}
              <span className="flex items-center justify-between w-full text-[14px]">
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
              ) : item.link ? (
                <Link href={item.link} className="block">
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
                    <div className="relative ml-[18px] mt-1 mb-1">
                      <div className="absolute left-0 w-px top-1 bottom-1 bg-border" />
                      <ul className="space-y-0.5">
                        {item.subItems!.map((sub, subIndex) => {
                          if (isDivider(sub)) {
                            return (
                              <li
                                key={sub.name ?? sub.title}
                                className="pl-4 py-4 text-[10px] uppercase tracking-wide text-muted-foreground"
                              >
                                {sub.name ?? sub.title}
                              </li>
                            );
                          }
                          const isActiveSub = isLinkOrDescendant(
                            pathname,
                            sub.link,
                          );
                          const subBadge = getItemBadge(sub);
                          return (
                            <motion.li
                              key={sub.link ?? sub.title}
                              custom={subIndex}
                              initial="hidden"
                              animate="visible"
                              variants={subItemVariants}
                              className="pl-3"
                            >
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
                            </motion.li>
                          );
                        })}
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
