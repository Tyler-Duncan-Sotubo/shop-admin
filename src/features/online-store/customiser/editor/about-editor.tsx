/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { DraftState } from "../types/customiser.type";
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { Panel, LabeledInput, ActionRow } from "../helpers/helpers";
import { useAutosaveDraft } from "../context/autosave-context";
import { Button } from "@/shared/ui/button";
import axios from "axios";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { UploadImageModal } from "@/features/content/files/ui/upload-image-modal";

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */

function mergeAtIndex(base: any[], index: number, patch: any) {
  const next = [...base];
  const current = next[index] ?? {};
  next[index] = deepMerge(current, patch);
  return next;
}

function deepMerge<T>(a: T, b: any): T {
  if (Array.isArray(a) || Array.isArray(b)) return b as T;
  if (a && typeof a === "object" && b && typeof b === "object") {
    const out: any = { ...(a as any) };
    for (const k of Object.keys(b)) out[k] = deepMerge(out[k], b[k]);
    return out;
  }
  return (b ?? a) as T;
}

/* -------------------------------------------------- */
/* editor                                             */
/* -------------------------------------------------- */

export function AboutEditor({
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

  const aboutSections = Array.isArray(resolved?.pages?.about?.sections)
    ? (resolved.pages.about.sections as any[])
    : [];

  const base0 = aboutSections?.[0] ?? {};
  const base1 = aboutSections?.[1] ?? {};

  const base1Paragraphs: string[] = Array.isArray(base1?.content?.paragraphs)
    ? base1.content.paragraphs
    : [];

  const [uploadOpen, setUploadOpen] = React.useState<null | "split1Img">(null);
  const [isUploading, setIsUploading] = React.useState(false);

  function autosaveAboutSections(nextSections: any[], toast = true) {
    autosave(
      {
        pages: {
          ...resolved.pages,
          about: {
            ...resolved.pages?.about,
            sections: nextSections,
          },
        },
      },
      { debounceMs: 0 }
    );
    flush({ toastOnSuccess: toast });
  }

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
      folder: "about",
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
      folder: "about",
      tag: "about-image",
      altText: "About page image",
    });

    return (finalized?.url ?? first.url) as string;
  }

  return (
    <div className="space-y-10">
      {/* ---------------------------------- */}
      {/* About Hero (index 0)               */}
      {/* ---------------------------------- */}
      <Panel title="About hero" description="Top section on the About page.">
        <LabeledInput
          label="Title"
          value={draft.aboutHero0Title}
          onChange={(v) => setDraft((d) => ({ ...d, aboutHero0Title: v }))}
        />

        <LabeledInput
          label="Description"
          value={draft.aboutHero0Description}
          onChange={(v) =>
            setDraft((d) => ({ ...d, aboutHero0Description: v }))
          }
        />

        <ActionRow
          onReset={() =>
            setDraft((d) => ({
              ...d,
              aboutHero0Title: base0?.content?.title ?? "",
              aboutHero0Description: base0?.content?.description ?? "",
            }))
          }
          onSave={() => {
            const nextSections = mergeAtIndex(aboutSections, 0, {
              content: {
                title: draft.aboutHero0Title,
                description: draft.aboutHero0Description,
              },
            });

            autosaveAboutSections(nextSections, true);
          }}
          saveLabel="Save about hero"
        />
      </Panel>

      {/* ---------------------------------- */}
      {/* About Split (index 1)              */}
      {/* ---------------------------------- */}
      <Panel
        title="About split"
        description="Middle section with image + paragraphs."
      >
        <LabeledInput
          label="Title"
          value={draft.aboutSplit1Title}
          onChange={(v) => setDraft((d) => ({ ...d, aboutSplit1Title: v }))}
        />

        <LabeledInput
          label="Paragraph 1"
          value={draft.aboutSplit1Paragraph1}
          onChange={(v) =>
            setDraft((d) => ({ ...d, aboutSplit1Paragraph1: v }))
          }
        />
        <LabeledInput
          label="Paragraph 2"
          value={draft.aboutSplit1Paragraph2}
          onChange={(v) =>
            setDraft((d) => ({ ...d, aboutSplit1Paragraph2: v }))
          }
        />
        <LabeledInput
          label="Paragraph 3"
          value={draft.aboutSplit1Paragraph3}
          onChange={(v) =>
            setDraft((d) => ({ ...d, aboutSplit1Paragraph3: v }))
          }
        />

        <LabeledInput
          label="CTA label"
          value={draft.aboutSplit1CtaLabel}
          onChange={(v) => setDraft((d) => ({ ...d, aboutSplit1CtaLabel: v }))}
        />
        <LabeledInput
          label="CTA link"
          value={draft.aboutSplit1CtaHref}
          onChange={(v) => setDraft((d) => ({ ...d, aboutSplit1CtaHref: v }))}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isUploading}
            onClick={() => setUploadOpen("split1Img")}
          >
            Upload image
          </Button>
        </div>

        <ActionRow
          onReset={() =>
            setDraft((d) => ({
              ...d,
              aboutSplit1Title: base1?.content?.title ?? "",
              aboutSplit1Paragraph1: base1Paragraphs?.[0] ?? "",
              aboutSplit1Paragraph2: base1Paragraphs?.[1] ?? "",
              aboutSplit1Paragraph3: base1Paragraphs?.[2] ?? "",
              aboutSplit1CtaLabel: base1?.content?.cta?.label ?? "",
              aboutSplit1CtaHref: base1?.content?.cta?.href ?? "",
              aboutSplit1ImgSrc: base1?.image?.src ?? "",
              aboutSplit1ImgAlt: base1?.image?.alt ?? "",
            }))
          }
          onSave={() => {
            const paragraphs = [
              draft.aboutSplit1Paragraph1,
              draft.aboutSplit1Paragraph2,
              draft.aboutSplit1Paragraph3,
            ].filter((x) => x?.trim().length > 0);

            const nextSections = mergeAtIndex(aboutSections, 1, {
              content: {
                title: draft.aboutSplit1Title,
                paragraphs,
                cta: {
                  label: draft.aboutSplit1CtaLabel,
                  href: draft.aboutSplit1CtaHref,
                },
              },
              image: {
                src: draft.aboutSplit1ImgSrc || base1?.image?.src,
                alt: draft.aboutSplit1ImgAlt || base1?.image?.alt,
              },
            });

            autosaveAboutSections(nextSections, true);
          }}
          saveLabel="Save section"
        />
      </Panel>

      {/* ---------------------------------- */}
      {/* Upload modal (split image only)    */}
      {/* ---------------------------------- */}
      <UploadImageModal
        open={uploadOpen === "split1Img"}
        onClose={() => setUploadOpen(null)}
        isSubmitting={isUploading}
        defaultFileName="about-split.jpg"
        title="Upload About split image"
        description="Upload the image used in the About split section."
        onUpload={async ({ file, fileName, mimeType }) => {
          setIsUploading(true);
          try {
            const url = await uploadAndGetUrl(file, fileName, mimeType);
            setDraft((d) => ({
              ...d,
              aboutSplit1ImgSrc: url,
              aboutSplit1ImgAlt: "About section image",
            }));
          } finally {
            setIsUploading(false);
          }
        }}
      />
    </div>
  );
}
