"use client";

import * as React from "react";
import { DraftState } from "../types/customiser.type";
import { LabeledColorInput, Panel } from "../helpers/helpers";
import { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { useAutosaveDraft } from "../context/autosave-context";
import { Button } from "@/shared/ui/button";
import axios from "axios";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { UploadImageModal } from "@/features/content/files/ui/upload-image-modal";

export function AppearanceEditor({
  resolved,
  draft,
  setDraft,
}: {
  resolved: ResolvedStorefrontConfig;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
}) {
  const { autosave, flush } = useAutosaveDraft();
  const { activeStoreId } = useStoreScope();

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Logo panel */}
      <Panel
        title="Logo"
        description="Your brand logo shown in the header and footer."
      >
        {/* Preview */}
        {draft.logoUrl ? (
          <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl border bg-muted flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.logoUrl ?? resolved.theme.assets.logoUrl}
              alt="Logo preview"
              className="max-h-16 max-w-[220px] object-contain"
            />
          </div>
        ) : (
          <div className="mb-3 h-40 w-full rounded-xl border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
            No logo selected
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setUploadOpen(true)}
            disabled={isUploading}
          >
            Upload logo
          </Button>
        </div>

        <UploadImageModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          isSubmitting={isUploading}
          defaultFileName="logo.png"
          title="Upload logo"
          description="Upload a logo to use across your storefront."
          onUpload={async ({ file, fileName, mimeType }) => {
            setIsUploading(true);
            try {
              const uniqueName = `${Date.now()}-${fileName}`;

              // 1) presign
              const presignRes = await axios.post<{
                uploads: Array<{ key: string; uploadUrl: string; url: string }>;
              }>("/api/uploads/media-presign", {
                storeId: activeStoreId,
                folder: "theme",
                files: [{ fileName: uniqueName, mimeType }],
              });

              const first = presignRes.data.uploads?.[0];
              if (!first) throw new Error("No presigned upload returned");

              // 2) PUT to S3
              const putRes = await fetch(first.uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                  "Content-Type": mimeType || "application/octet-stream",
                },
              });

              if (!putRes.ok) {
                const t = await putRes.text().catch(() => "");
                throw new Error(`S3 upload failed (${putRes.status}) ${t}`);
              }

              // 3) finalize (creates DB row + size)
              const { data: finalized } = await axios.post(
                "/api/uploads/finalize",
                {
                  storeId: activeStoreId,
                  key: first.key,
                  url: first.url,
                  fileName: uniqueName,
                  mimeType,
                  folder: "theme",
                  tag: "storefront-logo",
                  altText: "Storefront logo",
                }
              );

              const rawUrl = (finalized?.url ?? first.url) as string;
              const url = `${rawUrl}${
                rawUrl.includes("?") ? "&" : "?"
              }v=${Date.now()}`;

              setDraft((d) => ({ ...d, logoUrl: url }));

              autosave(
                {
                  theme: {
                    assets: { logoUrl: url },
                    colors: { light: { primary: draft.primaryColor } }, // preserve
                  },
                },
                { debounceMs: 0 }
              );

              flush({ toastOnSuccess: true });
            } finally {
              setIsUploading(false);
            }
          }}
        />
      </Panel>

      {/* Brand color panel */}
      <Panel
        title="Brand color"
        description="Your primary brand color used for buttons and highlights."
      >
        <LabeledColorInput
          label="Primary color"
          value={draft.primaryColor}
          onChange={(v) => {
            setDraft((d) => ({ ...d, primaryColor: v }));
            autosave(
              {
                theme: {
                  colors: { light: { primary: v } },
                  assets: { logoUrl: draft.logoUrl }, // preserve
                },
              },
              { debounceMs: 900 }
            );
          }}
        />
      </Panel>
    </div>
  );
}
