/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { FiMoreHorizontal } from "react-icons/fi";

const isDivider = (m: any) => (m as any)?.type === "divider";

const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

export function MobileMoreNav({ filteredMenu }: { filteredMenu: any[] }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  // ✅ default open the section that contains the active route
  const defaultOpen = React.useMemo(() => {
    const match = filteredMenu
      .filter((m: any) => !isDivider(m))
      .find((item: any) =>
        (item.subItems ?? []).some((sub: any) =>
          isLinkOrDescendant(pathname, sub.link),
        ),
      );

    return match?.title ? [String(match.title)] : [];
  }, [filteredMenu, pathname]);

  return (
    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-2 text-[10px] ",
            "text-muted-foreground",
          )}
        >
          <FiMoreHorizontal className="h-6 w-6 border p-1 rounded-full" />
          <span className="leading-none">More</span>
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-[86vw] sm:w-[420px]">
        <div className="p-4 border-b">
          <div className="font-semibold">More</div>
          <div className="text-xs text-muted-foreground">All sections</div>
        </div>

        <SheetTitle className="sr-only">More Navigation</SheetTitle>

        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <Accordion type="multiple" defaultValue={defaultOpen} className="p-2">
            {filteredMenu.map((item: any, idx: number) => {
              // ✅ RESPECT DIVIDERS (Account & Setup, etc.)
              if (isDivider(item)) {
                // Use divider.name if present, else fallback to title.
                const label = String(item.name ?? item.title ?? "");

                return (
                  <div
                    key={`divider-${label}-${idx}`}
                    className="px-4 pt-4 pb-2"
                  >
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {label}
                    </div>
                  </div>
                );
              }

              const hasSub = Boolean(item.subItems?.length);
              const title = String(item.title ?? "");
              const icon = item.icon;

              // No children → render as a single link row (no accordion)
              if (!hasSub && item.link) {
                const active = isLinkOrDescendant(pathname, item.link);

                return (
                  <div key={title} className="px-2 py-1">
                    <Link
                      href={item.link}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                        "hover:bg-muted/60",
                        active ? "font-semibold text-primary" : "font-medium",
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {icon ? (
                          <span className="text-base shrink-0">{icon}</span>
                        ) : null}
                        <span className="truncate">{title}</span>
                      </span>
                    </Link>
                  </div>
                );
              }

              // Has children → accordion section
              const parentActive = (item.subItems ?? []).some((sub: any) =>
                isLinkOrDescendant(pathname, sub.link),
              );

              return (
                <AccordionItem key={title} value={title} className="border-0">
                  <div className="px-2">
                    <AccordionTrigger
                      className={cn(
                        "rounded-md px-3 py-2 text-sm hover:no-underline hover:bg-muted/60",
                        parentActive
                          ? "font-semibold text-primary"
                          : "font-medium",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {icon ? (
                          <span className="text-base shrink-0">{icon}</span>
                        ) : null}
                        <span className="truncate">{title}</span>
                      </div>
                    </AccordionTrigger>
                  </div>

                  <AccordionContent className="pt-1 pb-2">
                    <div className="space-y-1 px-2">
                      {(item.subItems ?? [])
                        .filter((s: any) => !s.name) // skip section headers
                        .map((sub: any) => {
                          const active = isLinkOrDescendant(pathname, sub.link);

                          return (
                            <Link
                              key={sub.link}
                              href={sub.link}
                              onClick={() => setMoreOpen(false)}
                              className={cn(
                                "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                                "hover:bg-muted/60",
                                // ✅ NO bg for active. Just bold + primary text.
                                active
                                  ? "font-semibold text-primary"
                                  : "font-normal",
                              )}
                            >
                              {/* subitems: NO icons */}
                              <span className="truncate">{sub.title}</span>
                            </Link>
                          );
                        })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
