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
  // Read from resolved
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

  const previewSeoTitle = section === "seo" ? draft.seoTitle : seo?.title ?? "";
  const previewSeoDescription =
    section === "seo" ? draft.seoDescription : seo?.description ?? "";

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
      // OR keep existing GeneralPreview body extracted
    );

  return (
    <div className="h-full w-full grid grid-cols-12">
      <div className="col-span-4 border-r bg-white overflow-auto">
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
        seoCard={
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
        }
      >
        {body}
      </PreviewShell>
    </div>
  );
}
