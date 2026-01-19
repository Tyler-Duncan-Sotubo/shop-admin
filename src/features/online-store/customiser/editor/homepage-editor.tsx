"use client";

import * as React from "react";
import { DraftState } from "../types/customiser.type";
import {
  ActionRow,
  LabeledInput,
  LabeledSwitch,
  Panel,
} from "../helpers/helpers";
import { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { useAutosaveDraft } from "../context/autosave-context";
import { Button } from "@/shared/ui/button";
import axios from "axios";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { UploadImageModal } from "@/features/content/files/ui/upload-image-modal";

export function HomepageEditor({
  resolved,
  draft,
  setDraft,
}: {
  resolved: ResolvedStorefrontConfig;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
}) {
  const { autosave, flush } = useAutosaveDraft();
  const hero = resolved?.pages?.home?.hero;
  const { activeStoreId } = useStoreScope();

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const baseEnabled = !!hero?.enabled;
  const baseHeading = hero?.content?.heading ?? "";
  const baseSubtext = hero?.content?.description ?? "";
  const baseImageSrc = hero?.image?.src ?? "";
  const baseCtaLabel = hero?.content?.cta?.label ?? "";
  const baseCtaHref = hero?.content?.cta?.href ?? "";

  return (
    <div className="space-y-10">
      {/* TEXT + ENABLE */}
      <Panel
        title="Homepage hero"
        description="The big banner your visitors see first."
      >
        <LabeledSwitch
          label="Show hero section"
          checked={draft.heroEnabled}
          onCheckedChange={(v) => {
            setDraft((d) => ({ ...d, heroEnabled: v }));
            autosave(
              { pages: { home: { hero: { enabled: v } } } },
              { debounceMs: 500 }
            );
          }}
        />

        <LabeledInput
          label="Headline"
          value={draft.heroHeading}
          onChange={(v) => setDraft((d) => ({ ...d, heroHeading: v }))}
          disabled={!draft.heroEnabled}
        />

        <LabeledInput
          label="Subtext"
          value={draft.heroSubtext}
          onChange={(v) => setDraft((d) => ({ ...d, heroSubtext: v }))}
          disabled={!draft.heroEnabled}
        />

        <ActionRow
          onReset={() =>
            setDraft((d) => ({
              ...d,
              heroEnabled: baseEnabled,
              heroHeading: baseHeading,
              heroSubtext: baseSubtext,
            }))
          }
          onSave={() => {
            autosave(
              {
                pages: {
                  home: {
                    hero: {
                      content: {
                        heading: draft.heroHeading,
                        description: draft.heroSubtext,
                      },
                    },
                  },
                },
              },
              { debounceMs: 0 }
            );
            flush({ toastOnSuccess: true });
          }}
          saveLabel="Save hero text"
        />
      </Panel>

      {/* IMAGE */}
      <Panel
        title="Hero image"
        description="Upload or paste the image used in the hero."
      >
        {/* Preview */}
        {hero?.image?.src ? (
          <div className="relative mb-3 h-40 w-full overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.image.src}
              alt={hero.image.alt || "Hero image"}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 h-40 w-full rounded-lg border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
            No image selected
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!draft.heroEnabled || isUploading}
            onClick={() => setUploadOpen(true)}
          >
            Upload image
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={!draft.heroEnabled}
            onClick={() => {
              setDraft((d) => ({ ...d, heroImageSrc: baseImageSrc }));
              autosave(
                { pages: { home: { hero: { image: { src: baseImageSrc } } } } },
                { debounceMs: 0 }
              );
              flush({ toastOnSuccess: true });
            }}
          >
            Reset
          </Button>
        </div>
      </Panel>

      <UploadImageModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        isSubmitting={isUploading}
        defaultFileName="homepage-hero.jpg"
        title="Upload hero image"
        description="Upload an image to use in your homepage hero."
        onUpload={async ({ file, fileName, mimeType }) => {
          setIsUploading(true);
          try {
            const uniqueName = `${Date.now()}-${fileName}`;

            // 1) presign (Next.js API -> NestJS)
            const presignRes = await axios.post<{
              uploads: Array<{ key: string; uploadUrl: string; url: string }>;
            }>("/api/uploads/media-presign", {
              storeId: activeStoreId,
              folder: "homepage",
              files: [{ fileName: uniqueName, mimeType }],
            });

            const first = presignRes.data.uploads?.[0];
            if (!first) throw new Error("No presigned upload returned");

            // 2) PUT to S3 (browser -> S3)
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

            // 3) finalize (Next.js API -> NestJS) => creates DB row + size
            const { data: finalized } = await axios.post(
              "/api/uploads/finalize",
              {
                storeId: activeStoreId,
                key: first.key,
                url: first.url,
                fileName: uniqueName,
                mimeType,
                folder: "homepage",
                tag: "hero-image",
                altText: "Homepage hero image",
              }
            );

            const url = (finalized?.url ?? first.url) as string;
            const alt = "Homepage hero image";

            setDraft((d) => ({
              ...d,
              heroImageSrc: url,
              heroImageAlt: alt,
            }));

            autosave(
              {
                pages: {
                  home: {
                    hero: {
                      image: {
                        src: url,
                        alt,
                      },
                    },
                  },
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

      <Panel
        title="Hero CTA"
        description="Button text and link shown on the hero."
      >
        <LabeledInput
          label="CTA label"
          value={draft.heroCtaLabel}
          onChange={(v) => setDraft((d) => ({ ...d, heroCtaLabel: v }))}
          disabled={!draft.heroEnabled}
        />

        <LabeledInput
          label="CTA link"
          value={draft.heroCtaHref}
          onChange={(v) => setDraft((d) => ({ ...d, heroCtaHref: v }))}
          disabled={!draft.heroEnabled}
        />

        <ActionRow
          onReset={() =>
            setDraft((d) => ({
              ...d,
              heroCtaLabel: baseCtaLabel,
              heroCtaHref: baseCtaHref,
            }))
          }
          onSave={() => {
            autosave(
              {
                pages: {
                  home: {
                    hero: {
                      content: {
                        cta: {
                          label: draft.heroCtaLabel,
                          href: draft.heroCtaHref,
                        },
                      },
                    },
                  },
                },
              },
              { debounceMs: 0 }
            );
            flush({ toastOnSuccess: true });
          }}
          saveLabel="Save CTA"
        />
      </Panel>

      <LabeledSwitch
        label="Show bottom strip"
        checked={draft.heroBottomStripEnabled}
        onCheckedChange={(v) => {
          setDraft((d) => ({ ...d, heroBottomStripEnabled: v }));
          autosave(
            {
              pages: {
                home: {
                  hero: {
                    bottomStrip: { enabled: v },
                  },
                },
              },
            },
            { debounceMs: 500 }
          );
        }}
      />

      {draft.heroBottomStripEnabled && (
        <LabeledInput
          label="Bottom strip text"
          value={draft.heroBottomStripText}
          onChange={(v) => {
            setDraft((d) => ({ ...d, heroBottomStripText: v }));
            autosave(
              {
                pages: {
                  home: {
                    hero: {
                      bottomStrip: { text: v },
                    },
                  },
                },
              },
              { debounceMs: 800 }
            );
          }}
        />
      )}
    </div>
  );
}
