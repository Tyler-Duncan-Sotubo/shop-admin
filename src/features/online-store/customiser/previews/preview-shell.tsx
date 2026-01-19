/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, User, ShoppingCart, Heart } from "lucide-react";
import { buildMenu } from "../helpers/header-editor";

export function PreviewShell({
  section,
  draft,
  storeName,
  logoUrl,
  topBar,
  headerItems,
  footer,
  seoCard,
  previewThemeVars,
  wishlistEnabled,
  navEnabled,
  children,
}: {
  section: string;
  draft: any;
  storeName: string;
  logoUrl: string;
  topBar: any;
  headerItems: any[];
  footer: any;
  seoCard?: React.ReactNode;
  previewThemeVars?: React.CSSProperties;
  wishlistEnabled: boolean;
  navEnabled: boolean;
  children: React.ReactNode;
}) {
  const previewLogo = section === "appearance" ? draft.logoUrl : logoUrl;

  const previewTopBarEnabled = draft.announcementEnabled ?? !!topBar?.enabled;

  const previewTopBarText =
    draft.announcementText ?? topBar?.slides?.[0]?.text ?? "Announcement";

  const previewWishlist = draft.wishlistEnabled ?? wishlistEnabled;

  const previewHeaderItems = buildMenu(draft.headerMenu) ?? headerItems;

  return (
    <div
      className="col-span-8 bg-muted/30 overflow-auto"
      style={previewThemeVars}
    >
      <div className="p-6">
        <div className="mx-auto max-w-[1100px] space-y-4">
          <div className="rounded-xl border bg-white overflow-hidden">
            {/* Topbar */}
            {previewTopBarEnabled && (
              <div
                className={cn(
                  "px-4 py-3 text-xs border-b text-center font-bold",
                  section === "header" &&
                    "ring-inset ring-2 ring-muted-foreground/30 "
                )}
                style={{
                  backgroundColor: "hsl(var(--preview-primary))",
                  color: "hsl(var(--preview-primary-foreground))",
                }}
              >
                {previewTopBarText}
              </div>
            )}

            {/* Header */}
            {navEnabled && (
              <div
                className={cn(
                  "flex items-center px-4 py-3 gap-4",
                  section === "header" &&
                    "ring-inset ring-2 ring-muted-foreground/30"
                )}
              >
                {/* Left: Logo */}
                <div className="flex items-center gap-3 shrink-0">
                  {previewLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewLogo}
                      alt={`${storeName} logo`}
                      className="h-7 w-auto"
                    />
                  ) : (
                    <div className="h-7 w-24 rounded bg-muted" />
                  )}
                </div>

                {/* Center: Nav */}
                <div className="flex-1 flex justify-center">
                  <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
                    {previewHeaderItems.map((it: any, idx: number) => (
                      <span
                        key={idx}
                        className="hover:text-foreground cursor-default"
                      >
                        {it.label}
                      </span>
                    ))}
                  </nav>
                </div>

                {/* Right: Icons */}
                <div className="flex items-center gap-2 shrink-0">
                  <HeaderIcon label="Search">
                    <Search className="size-4" />
                  </HeaderIcon>

                  <HeaderIcon label="Account">
                    <User className="size-4" />
                  </HeaderIcon>

                  <HeaderIcon label="Cart">
                    <ShoppingCart className="size-4" />
                  </HeaderIcon>

                  {previewWishlist && (
                    <HeaderIcon label="Wishlist">
                      <Heart className="size-4" />
                    </HeaderIcon>
                  )}
                </div>
              </div>
            )}

            {/* Page body */}
            <div>{children}</div>

            {/* Footer */}
            <div
              className={cn(
                "border-t px-4 py-4 space-y-3",
                section === "footer" &&
                  "ring-inset ring-2 ring-muted-foreground/30"
              )}
            >
              <div className="text-sm font-semibold">
                {(section === "footer"
                  ? draft.footerBlurb
                  : footer?.brand?.blurb) || "Footer description..."}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(footer?.columns ?? [])
                  .slice(0, 3)
                  .map((col: any, idx: number) => (
                    <div key={idx}>
                      <div className="text-xs font-semibold mb-2">
                        {col.title}
                      </div>
                      <div className="space-y-1">
                        {(col.links ?? [])
                          .slice(0, 4)
                          .map((l: any, i: number) => (
                            <div
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {l.label}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>
                  {footer?.bottomBar?.leftText?.replace(
                    "{year}",
                    String(new Date().getFullYear())
                  )}
                </span>
                <span>
                  {footer?.bottomBar?.payments?.enabled
                    ? "Payments on"
                    : "Payments off"}
                </span>
              </div>
            </div>
          </div>

          {/* Optional extra card (SEO, etc.) */}
          {seoCard}
        </div>
      </div>
    </div>
  );
}

function HeaderIcon({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
    >
      {children}
    </button>
  );
}
