"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // adjust if your cn path differs
import { Badge } from "@/shared/ui/badge";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useOrdersTotalCount } from "@/features/orders/hooks/use-orders-total-count";
import { useQuotesTotalCount } from "@/features/quotes/hooks/use-quotes-total-count";
import { filterMenu, main } from "../config/admin-nav.config";
import { FaHome } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { FaBox } from "react-icons/fa";
import { FaShoppingBag } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { MobileMoreNav } from "./mobile-more-nav";

type BottomTab = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | null;
  isActive?: (pathname: string) => boolean;
};

const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

export function MobileAppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const permissions = React.useMemo(
    () =>
      (session as any)?.user?.permissions ??
      (session as any)?.permissions ??
      [],
    [session],
  );

  const filteredMenu = React.useMemo(
    () => filterMenu(main, permissions),
    [permissions],
  );

  // badges
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
  const salesBadge =
    ordersCount + quotesCount > 0 ? ordersCount + quotesCount : null;

  // Choose your “app style” primary tabs (keep it 4–5 max)
  const tabs: BottomTab[] = [
    {
      key: "dashboard",
      label: "Home",
      href: "/dashboard",
      icon: <FaHome className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/dashboard"),
    },
    {
      key: "analytics",
      label: "Analytics",
      href: "/analytics",
      icon: <FaChartLine className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/analytics"),
    },
    {
      key: "sales",
      label: "Sales",
      href: "/sales/orders",
      icon: <FaShoppingBag className="h-5 w-5" />,
      badge: salesBadge,
      isActive: (p) => isLinkOrDescendant(p, "/sales"),
    },
    {
      key: "products",
      label: "Products",
      href: "/products",
      icon: <FaBox className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/products"),
    },
    {
      key: "shipping",
      label: "Shipping",
      href: "/shipping?tab=zones",
      icon: <FaTruckFast className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/shipping"),
    },
  ];

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white py-1">
        <div className="grid grid-cols-6 items-center">
          {tabs.map((t) => {
            const active = t.isActive
              ? t.isActive(pathname)
              : isLinkOrDescendant(pathname, t.href);
            return (
              <Link
                key={t.key}
                href={t.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 text-[10px]",
                  active
                    ? "text-primary font-extrabold"
                    : "text-muted-foreground font-semibold",
                )}
              >
                <div className="relative">
                  {t.icon}
                  {t.badge ? (
                    <span className="absolute -top-2 -right-3">
                      <Badge className="h-5 px-2 text-[10px]">{t.badge}</Badge>
                    </span>
                  ) : null}
                </div>
                <span className="leading-none">{t.label}</span>
              </Link>
            );
          })}

          {/* More */}
          <MobileMoreNav filteredMenu={filteredMenu} />
        </div>
      </nav>

      {/* Spacer so content doesn’t hide behind bottom bar */}
      <div className="md:hidden h-16" />
    </>
  );
}
