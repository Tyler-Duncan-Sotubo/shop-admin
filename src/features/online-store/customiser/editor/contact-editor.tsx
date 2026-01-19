"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { DraftState } from "../types/customiser.type";
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { ActionRow, LabeledInput, Panel } from "../helpers/helpers";
import { useAutosaveDraft } from "../context/autosave-context";

/**
 * Helpers
 */
function normalizeInstagramHandle(value: string) {
  return value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^@/, "@");
}

function instagramHrefFromHandle(handle: string) {
  const clean = handle.replace(/^@/, "");
  return clean ? `https://www.instagram.com/${clean}` : "";
}

function mapEmbedUrlFromAddress(address: string) {
  if (!address?.trim()) return "";
  return (
    "https://www.google.com/maps?q=" +
    encodeURIComponent(address) +
    "&output=embed"
  );
}

export function ContactEditor({
  resolved,
  draft,
  setDraft,
}: {
  resolved: ResolvedStorefrontConfig;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
}) {
  const { autosave, flush } = useAutosaveDraft();

  const contactSection = resolved?.pages?.contact?.sections?.[1];
  const baseInfo: any = contactSection?.info ?? {};

  const basePhone = baseInfo?.phone?.[0] ?? "";
  const baseEmail = baseInfo?.email?.[0] ?? "";
  const baseAddress = baseInfo?.address ?? "";
  const baseInstagram =
    baseInfo?.social?.find((s: any) => s.platform === "instagram")?.handle ??
    "";

  function saveContact() {
    const nextInfo = {
      phone: draft.contactPhone ? [draft.contactPhone] : [],
      email: draft.contactEmail ? [draft.contactEmail] : [],
      address: draft.contactAddress,
      social: draft.contactInstagram
        ? [
            {
              platform: "instagram",
              handle: normalizeInstagramHandle(draft.contactInstagram),
              href: instagramHrefFromHandle(draft.contactInstagram),
            },
          ]
        : [],
    };

    const prevSections = resolved?.pages?.contact?.sections ?? [];
    const nextSections = [...prevSections];

    if (nextSections[1]) {
      const prev = nextSections[1];

      nextSections[1] = {
        ...prev,
        info: nextInfo,
        layout: {
          ...(prev.layout ?? {}),
          map: {
            ...(prev.layout as any)?.map,
            embedUrl: mapEmbedUrlFromAddress(draft.contactAddress),
          },
        },
      };
    }

    autosave(
      {
        pages: {
          ...resolved.pages,
          contact: {
            ...resolved.pages?.contact,
            sections: nextSections,
          },
        },
      },
      { debounceMs: 0 }
    );

    flush({ toastOnSuccess: true });
  }

  return (
    <Panel
      title="Contact details"
      description="How customers can reach you. Used on the Contact page and map."
    >
      <LabeledInput
        label="Phone"
        value={draft.contactPhone}
        onChange={(v) => setDraft((d) => ({ ...d, contactPhone: v }))}
        placeholder="+234 816 529 5314"
      />

      <LabeledInput
        label="Email"
        value={draft.contactEmail}
        onChange={(v) => setDraft((d) => ({ ...d, contactEmail: v }))}
        placeholder="info@yourcompany.com"
      />

      <LabeledInput
        label="Address"
        value={draft.contactAddress}
        onChange={(v) => setDraft((d) => ({ ...d, contactAddress: v }))}
        placeholder="Plot 8, Omorinre Johnson Street, Lekki Phase 1, Lagos"
      />

      <LabeledInput
        label="Instagram"
        value={draft.contactInstagram}
        onChange={(v) =>
          setDraft((d) => ({
            ...d,
            contactInstagram: normalizeInstagramHandle(v),
          }))
        }
        placeholder="@yourcompany"
      />

      <ActionRow
        onReset={() =>
          setDraft((d) => ({
            ...d,
            contactPhone: basePhone,
            contactEmail: baseEmail,
            contactAddress: baseAddress,
            contactInstagram: baseInstagram,
          }))
        }
        onSave={saveContact}
        saveLabel="Save contact details"
      />
    </Panel>
  );
}
