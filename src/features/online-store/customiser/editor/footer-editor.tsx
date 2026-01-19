/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Panel, LabeledInput, ActionRow } from "../helpers/helpers";
import type { DraftState } from "../types/customiser.type";
import type { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { useAutosaveDraft } from "../context/autosave-context";
import { Button } from "@/shared/ui/button";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "youtube";
type SocialLink = { platform: SocialPlatform; href: string };

function getSocialHref(footer: any, platform: SocialPlatform) {
  const arr: SocialLink[] = Array.isArray(footer?.social) ? footer.social : [];
  return arr.find((s) => s.platform === platform)?.href ?? "";
}

function buildSocialArray(draft: DraftState): SocialLink[] {
  const items: Array<SocialLink | null> = [
    draft.footerFacebookHref?.trim()
      ? { platform: "facebook", href: draft.footerFacebookHref.trim() }
      : null,
    draft.footerInstagramHref?.trim()
      ? { platform: "instagram", href: draft.footerInstagramHref.trim() }
      : null,
    draft.footerTwitterHref?.trim()
      ? { platform: "twitter", href: draft.footerTwitterHref.trim() }
      : null,
    draft.footerLinkedinHref?.trim()
      ? { platform: "linkedin", href: draft.footerLinkedinHref.trim() }
      : null,
    draft.footerYoutubeHref?.trim()
      ? { platform: "youtube", href: draft.footerYoutubeHref.trim() }
      : null,
  ];

  // Filter nulls + remove obviously invalid values (optional)
  return items
    .filter(Boolean)
    .map((x) => x as SocialLink)
    .filter((x) => x.href.length > 0);
}

function normalizePhone(raw: string) {
  // keep digits only (WhatsApp expects international format e.g. 2348...)
  return (raw ?? "").replace(/\D+/g, "");
}

export function FooterEditor({
  resolved,
  draft,
  setDraft,
}: {
  resolved: ResolvedStorefrontConfig;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
}) {
  const { autosave, flush } = useAutosaveDraft();

  const baseFooter: any = (resolved as any)?.footer ?? {};

  // Base values (resolved)
  const baseNewsletterEnabled = !!baseFooter?.newsletter?.enabled;
  const baseWhatsappEnabled = !!baseFooter?.whatsapp?.enabled;
  const baseWhatsappPhone = baseFooter?.whatsapp?.agents?.[0]?.phone ?? "";

  const baseSocial = baseFooter?.social ?? [];

  const baseFacebook = getSocialHref(baseSocial, "facebook");
  const baseInstagram = getSocialHref(baseSocial, "instagram");
  const baseTwitter = getSocialHref(baseSocial, "twitter");
  const baseLinkedin = getSocialHref(baseSocial, "linkedin");
  const baseYoutube = getSocialHref(baseSocial, "youtube");
  const baseContactsLines = Array.isArray(baseFooter?.contacts?.lines)
    ? baseFooter.contacts.lines
    : [];
  // Draft-first preview (optional)
  const socialPreview = buildSocialArray(draft);

  function saveFooter(toast = true) {
    const nextSocial = buildSocialArray(draft);
    const baseAgent0 = (baseFooter?.whatsapp?.agents?.[0] ?? {}) as any;

    autosave(
      {
        footer: {
          ...baseFooter,

          social: nextSocial,

          newsletter: {
            ...(baseFooter?.newsletter ?? {}),
            enabled: !!draft.footerNewsletterEnabled,
          },

          whatsapp: {
            ...(baseFooter?.whatsapp ?? {}),
            enabled: !!draft.footerWhatsappEnabled,
            agents: [
              {
                ...baseAgent0,
                phone: normalizePhone(draft.footerWhatsappPhone || ""),
              },
            ],
          },

          // ✅ NEW: contacts
          contacts: {
            ...(baseFooter?.contacts ?? {}),
            title: draft.footerContactsTitle ?? "Contact",
            lines: (draft.footerContactsLines ?? [])
              .map((l) => l.trim())
              .filter(Boolean),
          },
        },
      },
      { debounceMs: 0 }
    );

    flush({ toastOnSuccess: toast });
  }

  return (
    <Panel
      title="Footer"
      description="What people see at the bottom of every page."
    >
      {/* Newsletter + WhatsApp toggles */}
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div>
            <div className="text-sm font-medium">Newsletter signup</div>
            <div className="text-xs text-muted-foreground">
              Show the email subscription box in the footer.
            </div>
          </div>

          <input
            type="checkbox"
            className="h-4 w-4"
            checked={!!draft.footerNewsletterEnabled}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                footerNewsletterEnabled: e.target.checked,
              }))
            }
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div>
            <div className="text-sm font-medium">WhatsApp chat</div>
            <div className="text-xs text-muted-foreground">
              Show a WhatsApp chat button on the storefront.
            </div>
          </div>

          <input
            type="checkbox"
            className="h-4 w-4"
            checked={!!draft.footerWhatsappEnabled}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                footerWhatsappEnabled: e.target.checked,
              }))
            }
          />
        </label>
      </div>

      {/* WhatsApp phone */}
      <div className="pt-4">
        <LabeledInput
          label="WhatsApp phone (international format)"
          value={draft.footerWhatsappPhone || ""}
          onChange={(v) => setDraft((d) => ({ ...d, footerWhatsappPhone: v }))}
          placeholder="e.g. 2348165295314"
        />
        <div className="text-xs text-muted-foreground mt-1">
          Use country code, no + sign needed. Example:{" "}
          <span className="font-mono">2348165295314</span>
        </div>
      </div>

      {/* Social links */}
      <div className="pt-6 space-y-3">
        <div className="text-sm font-semibold">Social links</div>

        <div className="grid grid-cols-1 gap-3">
          <SocialRow
            icon={<FaFacebookF className="h-4 w-4" />}
            label="Facebook"
            value={draft.footerFacebookHref || ""}
            placeholder="https://facebook.com/yourpage"
            onChange={(v) => setDraft((d) => ({ ...d, footerFacebookHref: v }))}
          />

          <SocialRow
            icon={<FaInstagram className="h-4 w-4" />}
            label="Instagram"
            value={draft.footerInstagramHref || ""}
            placeholder="https://instagram.com/yourhandle"
            onChange={(v) =>
              setDraft((d) => ({ ...d, footerInstagramHref: v }))
            }
          />

          <SocialRow
            icon={<FaTwitter className="h-4 w-4" />}
            label="Twitter / X"
            value={draft.footerTwitterHref || ""}
            placeholder="https://x.com/yourhandle"
            onChange={(v) => setDraft((d) => ({ ...d, footerTwitterHref: v }))}
          />

          <SocialRow
            icon={<FaLinkedinIn className="h-4 w-4" />}
            label="LinkedIn"
            value={draft.footerLinkedinHref || ""}
            placeholder="https://linkedin.com/company/yourcompany"
            onChange={(v) => setDraft((d) => ({ ...d, footerLinkedinHref: v }))}
          />

          <SocialRow
            icon={<FaYoutube className="h-4 w-4" />}
            label="YouTube"
            value={draft.footerYoutubeHref || ""}
            placeholder="https://youtube.com/@yourchannel"
            onChange={(v) => setDraft((d) => ({ ...d, footerYoutubeHref: v }))}
          />
        </div>

        {/* Optional: tiny preview chips */}
        {socialPreview.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {socialPreview.map((s) => (
              <span
                key={s.platform}
                className="text-xs rounded-full border px-2 py-1 text-muted-foreground"
              >
                {s.platform}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contacts */}
      <div className="pt-6 space-y-3">
        <div className="text-sm font-semibold">Contact information</div>

        <div className="space-y-2">
          {(draft.footerContactsLines ?? baseContactsLines).map(
            (line: any, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                  value={line}
                  placeholder="e.g. info@example.com"
                  onChange={(e) =>
                    setDraft((d) => {
                      const lines = [
                        ...(d.footerContactsLines ?? baseContactsLines),
                      ];
                      lines[idx] = e.target.value;
                      return { ...d, footerContactsLines: lines };
                    })
                  }
                />

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      footerContactsLines: (
                        d.footerContactsLines ?? baseContactsLines
                      ).filter((_: any, i: any) => i !== idx),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            )
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              footerContactsLines: [
                ...(d.footerContactsLines ?? baseContactsLines),
                "",
              ],
            }))
          }
        >
          Add line
        </Button>
      </div>

      <ActionRow
        onReset={() =>
          setDraft((d) => ({
            ...d,
            footerNewsletterEnabled: baseNewsletterEnabled,
            footerWhatsappEnabled: baseWhatsappEnabled,
            footerWhatsappPhone: baseWhatsappPhone,

            footerFacebookHref: baseFacebook,
            footerInstagramHref: baseInstagram,
            footerTwitterHref: baseTwitter,
            footerLinkedinHref: baseLinkedin,
            footerYoutubeHref: baseYoutube,
          }))
        }
        onSave={() => saveFooter(true)}
        saveLabel="Save footer"
      />
    </Panel>
  );
}

function SocialRow(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const { icon, label, value, placeholder, onChange } = props;

  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="h-9 w-9 rounded-lg border bg-muted/30 flex items-center justify-center text-muted-foreground">
        {icon}
      </div>

      <div className="flex-1">
        <LabeledInput
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>

      {value?.trim() ? (
        <Button
          type="button"
          size={"sm"}
          variant="clean"
          onClick={() =>
            window.open(value.trim(), "_blank", "noopener,noreferrer")
          }
        >
          Test
        </Button>
      ) : (
        <Button type="button" size={"sm"} variant="clean" disabled>
          Test
        </Button>
      )}
    </div>
  );
}
