"use client";

import * as React from "react";
import { StorefrontSectionId } from "../ui/customiser-sidebar";
import { DraftState } from "../types/customiser.type";
import { AppearanceEditor } from "./appearance-editor";
import { HeaderEditor } from "./header-editor";
import { HomepageEditor } from "./homepage-editor";
import { FooterEditor } from "./footer-editor";
import { AdvancedEditor } from "./advanced-editor";
import { SeoEditor } from "./seo-editor";
import { friendlyTitle } from "../helpers/helpers";
import { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { SaveStatus } from "../helpers/save-status";
import { AboutEditor } from "./about-editor";
import { ContactEditor } from "./contact-editor";
import { Button } from "@/shared/ui/button";
import { PublishConfirmDialog } from "../ui/publish-confirm-dialog";
import { ThemeLiveBadge } from "../ui/theme-live-badge";

export function EditorPanel({
  section,
  resolved,
  draft,
  setDraft,
}: {
  section: StorefrontSectionId;
  resolved: ResolvedStorefrontConfig;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
}) {
  const [publishOpen, setPublishOpen] = React.useState(false);
  return (
    <div className="col-span-4 border-r bg-white overflow-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">
                {friendlyTitle(section)}
              </h3>
              <SaveStatus />
              <ThemeLiveBadge
                storeId={resolved.store.id}
                onPublishClick={() => setPublishOpen(true)}
              />
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Edit this section — changes show in the preview
            </p>
          </div>

          {/* 🔴 Global actions */}
          <PublishConfirmDialog
            storeId={resolved.store.id}
            open={publishOpen}
            onOpenChange={setPublishOpen}
          >
            <Button size="sm">Publish</Button>
          </PublishConfirmDialog>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {section === "appearance" && (
          <AppearanceEditor
            resolved={resolved}
            draft={draft}
            setDraft={setDraft}
          />
        )}
        {section === "header" && (
          <HeaderEditor resolved={resolved} draft={draft} setDraft={setDraft} />
        )}
        {section === "homepage" && (
          <HomepageEditor
            resolved={resolved}
            draft={draft}
            setDraft={setDraft}
          />
        )}
        {section === "footer" && (
          <FooterEditor resolved={resolved} draft={draft} setDraft={setDraft} />
        )}
        {section === "seo" && (
          <SeoEditor resolved={resolved} draft={draft} setDraft={setDraft} />
        )}
        {section === "advanced" && <AdvancedEditor resolved={resolved} />}

        {section === "about" && (
          <AboutEditor resolved={resolved} draft={draft} setDraft={setDraft} />
        )}

        {section === "contact" && (
          <ContactEditor
            resolved={resolved}
            draft={draft}
            setDraft={setDraft}
          />
        )}
      </div>
    </div>
  );
}
