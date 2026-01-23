// section-preview.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { StorefrontSectionId } from "./customiser-sidebar";
import GeneralPreview from "../previews/general-preview";
import { EditorPanel } from "../editor/editor-panel";
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { hexToHslParts, pickForegroundForHex } from "../helpers/color";
import type { DraftState } from "../types/customiser.type";
import { AboutPreview } from "../previews/about-preview";
import { PreviewShell } from "../previews/preview-shell";
import { GoogleSerpPreview } from "../previews/google-serp-preview";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function SectionPreview({
  section,
  resolved,
  draft,
  setDraft,
}: {
  section: StorefrontSectionId;
  resolved: ResolvedStorefrontConfig;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState | null>>;
}) {
  const [open, setOpen] = useState(false);
  const storeName = resolved?.store?.name ?? "Store";
  const logoUrl = resolved?.theme?.assets?.logoUrl ?? "";
  const topBar = resolved?.header?.topBar;
  const headerItems = resolved?.header?.nav?.items ?? [];
  const navEnabled = !!resolved?.header?.nav?.enabled;
  const hero = resolved?.pages?.home?.hero;
  const footer = resolved?.footer;
  const seo = resolved?.seo;

  const primaryHex =
    (draft.primaryColor as any) ||
    resolved?.theme?.colors?.light?.primary ||
    "#000000";

  const primaryHsl = hexToHslParts(primaryHex);
  const primaryFg = pickForegroundForHex(primaryHex);

  const previewSeoTitle =
    section === "seo" ? draft.seoTitle : (seo?.title ?? "");
  const previewSeoDescription =
    section === "seo" ? draft.seoDescription : (seo?.description ?? "");

  const previewFavicon = draft.seoFaviconPng ?? resolved?.seo?.favicon.png;

  const previewThemeVars = primaryHsl
    ? ({
        ["--preview-primary" as any]: primaryHsl,
        ["--preview-primary-foreground" as any]: primaryFg,
      } as React.CSSProperties)
    : undefined;

  const body =
    section === "about" ? (
      <AboutPreview resolved={resolved} draft={draft} />
    ) : (
      <GeneralPreview section={section} draft={draft} hero={hero} />
    );

  const seoCard = (
    <GoogleSerpPreview
      active={section === "seo"}
      siteName={storeName}
      canonicalBaseUrl="store.centa.africa"
      title={previewSeoTitle}
      description={
        previewSeoDescription ||
        "Discover our range of products designed to make your life better. Shop now for great deals and fast shipping."
      }
      previewFavicon={previewFavicon}
    />
  );

  const editor = (
    <EditorPanel
      section={section}
      resolved={resolved}
      draft={draft}
      setDraft={(updater) => {
        setDraft((prev) => {
          if (!prev) return prev;
          return typeof updater === "function"
            ? (updater as any)(prev)
            : updater;
        });
      }}
    />
  );

  return (
    <div className="h-full w-full">
      {/* DESKTOP: split */}
      <div className="hidden md:grid h-full w-full grid-cols-12">
        <div className="col-span-4 border-r bg-white overflow-auto">
          {editor}
        </div>

        <PreviewShell
          section={section}
          draft={draft}
          storeName={storeName}
          logoUrl={logoUrl}
          topBar={topBar}
          headerItems={headerItems}
          footer={footer}
          previewThemeVars={previewThemeVars}
          wishlistEnabled={!!draft.wishlistEnabled}
          navEnabled={navEnabled}
          seoCard={seoCard}
        >
          {body}
        </PreviewShell>
      </div>

      {/* MOBILE: preview first + bottom sheet editor */}
      <div className="md:hidden h-full w-full flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
          <div className="flex items-center justify-end px-3 py-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="clean"
                  className="h-9 w-9"
                  aria-label={open ? "Close editor" : "Open editor"}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetTitle className="sr-only">Edit section</SheetTitle>

              {/* 
                Fixed/controlled height:
                - clamp() gives a consistent feel across phones
                - dvh works better with mobile browser UI (address bar)
                Also: add padding-top so the built-in close button isn't covered.
              */}
              <SheetContent
                side="bottom"
                className={[
                  "p-0",
                  // controlled height across devices
                  "h-[clamp(22rem,85dvh,44rem)]",
                  // safe areas (iOS notch/home indicator)
                  "pb-[calc(env(safe-area-inset-bottom)+0px)]",
                  // ensure overlay content doesn't visually fight
                  "bg-white",
                ].join(" ")}
              >
                {/* drag handle area (optional but nice) */}
                <div className="px-4 pt-3">
                  <div className="mx-auto h-1.5 w-10 rounded-full bg-muted" />
                </div>

                {/* 
                  Reserve space for the Sheet close (X) button:
                  Shadcn sheet places the close button near the top-right inside SheetContent.
                  So we add top padding and make the inner area scroll.
                */}
                <div className="h-full pt-8">
                  <div className="h-full overflow-auto px-0">{editor}</div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto">
          <PreviewShell
            section={section}
            draft={draft}
            storeName={storeName}
            logoUrl={logoUrl}
            topBar={topBar}
            headerItems={headerItems}
            footer={footer}
            previewThemeVars={previewThemeVars}
            wishlistEnabled={!!draft.wishlistEnabled}
            navEnabled={navEnabled}
            seoCard={seoCard}
          >
            {body}
          </PreviewShell>
        </div>
      </div>
    </div>
  );
}
