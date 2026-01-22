/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const baseImageAlt = hero?.image?.alt ?? "";
  const baseCtaLabel = hero?.content?.cta?.label ?? "";
  const baseCtaHref = hero?.content?.cta?.href ?? "";

  /**
   * Build the FULL hero payload every time so partial updates don't wipe other fields
   * (important if backend "replaces" hero instead of deep-merging).
   */
  const buildHeroPayload = React.useCallback(
    (
      overrides?: Partial<{
        enabled: boolean;
        content: {
          heading: string;
          description: string;
          cta: { label: string; href: string };
        };
        image: { src: string; alt: string };
        bottomStrip: { enabled: boolean; text: string };
      }>,
    ) => {
      const basePayload = {
        enabled: draft.heroEnabled,
        content: {
          heading: draft.heroHeading,
          description: draft.heroSubtext,
          cta: {
            label: draft.heroCtaLabel,
            href: draft.heroCtaHref,
          },
        },
        image: {
          src: draft.heroImageSrc,
          alt: draft.heroImageAlt,
        },
        bottomStrip: {
          enabled: draft.heroBottomStripEnabled,
          text: draft.heroBottomStripText,
        },
      };

      // shallow merge top-level + deep merge for known nested nodes
      return {
        ...basePayload,
        ...overrides,
        content: {
          ...basePayload.content,
          ...(overrides?.content ?? {}),
          cta: {
            ...basePayload.content.cta,
            ...(overrides?.content?.cta ?? {}),
          },
        },
        image: {
          ...basePayload.image,
          ...(overrides?.image ?? {}),
        },
        bottomStrip: {
          ...basePayload.bottomStrip,
          ...(overrides?.bottomStrip ?? {}),
        },
      };
    },
    [
      draft.heroEnabled,
      draft.heroHeading,
      draft.heroSubtext,
      draft.heroCtaLabel,
      draft.heroCtaHref,
      draft.heroImageSrc,
      draft.heroImageAlt,
      draft.heroBottomStripEnabled,
      draft.heroBottomStripText,
    ],
  );

  const autosaveHero = React.useCallback(
    (
      opts?: { debounceMs?: number },
      overrides?: Parameters<typeof buildHeroPayload>[0],
    ) => {
      autosave(
        {
          pages: {
            home: {
              hero: buildHeroPayload(overrides),
            },
          },
        },
        { debounceMs: opts?.debounceMs ?? 500 },
      );
    },
    [autosave, buildHeroPayload],
  );

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
            // ensure full hero is saved (override enabled with new value)
            autosaveHero({ debounceMs: 500 }, { enabled: v });
          }}
        />

        <LabeledInput
          label="Headline"
          value={draft.heroHeading}
          onChange={(v) => {
            setDraft((d) => ({ ...d, heroHeading: v }));
            autosaveHero(
              { debounceMs: 800 },
              { content: { heading: v } as any },
            );
          }}
          disabled={!draft.heroEnabled}
        />

        <LabeledInput
          label="Subtext"
          value={draft.heroSubtext}
          onChange={(v) => {
            setDraft((d) => ({ ...d, heroSubtext: v }));
            autosaveHero(
              { debounceMs: 800 },
              { content: { description: v } as any },
            );
          }}
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
            autosaveHero({ debounceMs: 0 });
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
              setDraft((d) => ({
                ...d,
                heroImageSrc: baseImageSrc,
                heroImageAlt: baseImageAlt,
              }));

              autosaveHero(
                { debounceMs: 0 },
                { image: { src: baseImageSrc, alt: baseImageAlt } },
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
              },
            );

            const url = (finalized?.url ?? first.url) as string;
            const alt = "Homepage hero image";

            setDraft((d) => ({
              ...d,
              heroImageSrc: url,
              heroImageAlt: alt,
            }));

            // save FULL hero, overriding image with new values
            autosaveHero({ debounceMs: 0 }, { image: { src: url, alt } });
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
          onChange={(v) => {
            setDraft((d) => ({ ...d, heroCtaLabel: v }));
            autosaveHero(
              { debounceMs: 800 },
              { content: { cta: { label: v } } as any },
            );
          }}
          disabled={!draft.heroEnabled}
        />

        <LabeledInput
          label="CTA link"
          value={draft.heroCtaHref}
          onChange={(v) => {
            setDraft((d) => ({ ...d, heroCtaHref: v }));
            autosaveHero(
              { debounceMs: 800 },
              { content: { cta: { href: v } } as any },
            );
          }}
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
            autosaveHero({ debounceMs: 0 });
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
          autosaveHero(
            { debounceMs: 500 },
            { bottomStrip: { enabled: v } as any },
          );
        }}
      />

      {draft.heroBottomStripEnabled && (
        <LabeledInput
          label="Bottom strip text"
          value={draft.heroBottomStripText}
          onChange={(v) => {
            setDraft((d) => ({ ...d, heroBottomStripText: v }));
            autosaveHero(
              { debounceMs: 800 },
              { bottomStrip: { text: v } as any },
            );
          }}
        />
      )}
    </div>
  );
}
