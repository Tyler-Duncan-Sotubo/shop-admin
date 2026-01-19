/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import axios from "axios";
import { Button } from "@/shared/ui/button";
import { UploadImageModal } from "@/features/content/files/ui/upload-image-modal";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useAutosaveDraft } from "../context/autosave-context";
import type { DraftState } from "../types/customiser.type";
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { ActionRow, LabeledInput, Panel } from "../helpers/helpers";

function ImagePreview({
  src,
  alt,
  size = "md",
}: {
  src?: string | null;
  alt?: string | null;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-16" : "h-40";

  if (!src) {
    return (
      <div
        className={`mb-3 ${h} w-full rounded-lg border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground`}
      >
        No image selected
      </div>
    );
  }

  return (
    <div
      className={`relative mb-3 ${h} w-full overflow-hidden rounded-lg border bg-muted`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || "Preview image"}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

type GeneratedFavicons = {
  ico?: string | null;
  png?: string | null;
  svg?: string | null;
  appleTouch?: string | null;
};

export function SeoEditor({
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

  const baseSeoTitle = (resolved as any)?.seo?.title ?? "";
  const baseSeoDescription = (resolved as any)?.seo?.description ?? "";

  const baseFaviconIco = (resolved as any)?.seo?.favicon?.ico ?? "";
  const baseFaviconPng = (resolved as any)?.seo?.favicon?.png ?? "";
  const baseFaviconSvg = (resolved as any)?.seo?.favicon?.svg ?? "";
  const baseFaviconApple = (resolved as any)?.seo?.favicon?.appleTouch ?? "";

  const [uploadOpen, setUploadOpen] = React.useState<null | "siteIcon">(null);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadAndGetUrl(
    file: File,
    fileName: string,
    mimeType?: string
  ) {
    const uniqueName = `${Date.now()}-${fileName}`;

    const presignRes = await axios.post<{
      uploads: Array<{ key: string; uploadUrl: string; url: string }>;
    }>("/api/uploads/media-presign", {
      storeId: activeStoreId,
      folder: "seo",
      files: [{ fileName: uniqueName, mimeType }],
    });

    const first = presignRes.data.uploads?.[0];
    if (!first) throw new Error("No presigned upload returned");

    const putRes = await fetch(first.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": mimeType || "application/octet-stream" },
    });

    if (!putRes.ok) {
      const t = await putRes.text().catch(() => "");
      throw new Error(`S3 upload failed (${putRes.status}) ${t}`);
    }

    const { data: finalized } = await axios.post("/api/uploads/finalize", {
      storeId: activeStoreId,
      key: first.key,
      url: first.url,
      fileName: uniqueName,
      mimeType,
      folder: "seo",
      tag: "seo-asset",
      altText: "SEO asset",
    });

    return (finalized?.url ?? first.url) as string;
  }

  async function generateFavicons(
    sourceUrl: string
  ): Promise<GeneratedFavicons> {
    const { data } = await axios.post("/api/seo/generate-favicons", {
      storeId: activeStoreId,
      sourceUrl,
    });

    return (data?.favicon ?? {}) as GeneratedFavicons;
  }

  const previewFaviconPng = draft.seoFaviconPng || baseFaviconPng;

  function saveSeo(toast = true) {
    autosave(
      {
        seo: {
          ...(resolved as any)?.seo,
          title: draft.seoTitle,
          description: draft.seoDescription,
          favicon: {
            ico: draft.seoFaviconIco || baseFaviconIco,
            png: draft.seoFaviconPng || baseFaviconPng,
            svg: draft.seoFaviconSvg || baseFaviconSvg,
            appleTouch: draft.seoFaviconAppleTouch || baseFaviconApple,
          },
        },
      },
      { debounceMs: 0 }
    );

    flush({ toastOnSuccess: toast });
  }

  return (
    <Panel
      title="SEO basics"
      description="How your site appears in Google and browser tabs."
    >
      <LabeledInput
        label="Site title"
        value={draft.seoTitle}
        onChange={(v) => setDraft((d) => ({ ...d, seoTitle: v }))}
      />

      <LabeledInput
        label="Site description"
        value={draft.seoDescription}
        onChange={(v) => setDraft((d) => ({ ...d, seoDescription: v }))}
      />

      {/* -------- Site Icon -------- */}
      <div className="pt-5 space-y-2">
        <div className="text-sm font-semibold">Site icon</div>

        <ImagePreview
          src={previewFaviconPng}
          alt="Site icon preview"
          size="sm"
        />

        <Button
          type="button"
          variant="secondary"
          disabled={isUploading}
          onClick={() => setUploadOpen("siteIcon")}
        >
          Upload site icon
        </Button>

        <div className="text-xs text-muted-foreground">
          Upload one square image. We’ll generate favicons automatically.
        </div>
      </div>

      <ActionRow
        onReset={() =>
          setDraft((d) => ({
            ...d,
            seoTitle: baseSeoTitle,
            seoDescription: baseSeoDescription,
            seoFaviconIco: baseFaviconIco,
            seoFaviconPng: baseFaviconPng,
            seoFaviconSvg: baseFaviconSvg,
            seoFaviconAppleTouch: baseFaviconApple,
          }))
        }
        onSave={() => saveSeo(true)}
        saveLabel="Save SEO"
      />

      {/* -------- Upload: Site Icon -------- */}
      <UploadImageModal
        open={uploadOpen === "siteIcon"}
        onClose={() => setUploadOpen(null)}
        isSubmitting={isUploading}
        defaultFileName="site-icon.png"
        title="Upload site icon"
        description="Upload one square PNG or JPG. Favicons will be generated automatically."
        onUpload={async ({ file, fileName, mimeType }) => {
          setIsUploading(true);
          try {
            const sourceUrl = await uploadAndGetUrl(file, fileName, mimeType);

            const fav = await generateFavicons(sourceUrl);

            setDraft((d) => ({
              ...d,
              seoFaviconIco: fav.ico ?? d.seoFaviconIco,
              seoFaviconPng: fav.png ?? d.seoFaviconPng,
              seoFaviconSvg: fav.svg ?? d.seoFaviconSvg,
              seoFaviconAppleTouch: fav.appleTouch ?? d.seoFaviconAppleTouch,
            }));
          } finally {
            setIsUploading(false);
          }
        }}
      />
    </Panel>
  );
}
