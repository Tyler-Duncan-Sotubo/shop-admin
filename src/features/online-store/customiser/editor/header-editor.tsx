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

export function HeaderEditor({
  resolved,
  draft,
  setDraft,
}: {
  resolved: ResolvedStorefrontConfig;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
}) {
  const { autosave, flush } = useAutosaveDraft();
  const topBar = resolved?.header?.topBar;

  const baseEnabled = !!topBar?.enabled;
  const baseText = topBar?.slides?.[0]?.text ?? "";

  return (
    <div className="mb-10 space-y-6">
      <Panel
        title="Announcement bar"
        description="Show a short message at the top of your store."
      >
        <LabeledSwitch
          label="Show announcement bar"
          checked={draft.announcementEnabled}
          onCheckedChange={(v) => {
            const nav = resolved.header.nav;

            setDraft((d) => ({ ...d, announcementEnabled: v }));

            autosave(
              {
                header: {
                  topBar: { enabled: v },
                  nav: {
                    enabled: nav.enabled,
                    items: nav.items,
                    icons: nav.icons,
                  },
                },
              },
              { debounceMs: 500 }
            );
          }}
        />

        <LabeledInput
          label="Announcement text"
          value={draft.announcementText}
          onChange={(v) => setDraft((d) => ({ ...d, announcementText: v }))}
          disabled={!draft.announcementEnabled}
          placeholder="e.g. Free shipping on orders over £50"
        />

        <ActionRow
          onReset={() =>
            setDraft((d) => ({
              ...d,
              announcementEnabled: baseEnabled,
              announcementText: baseText,
            }))
          }
          onSave={() => {
            const nav = resolved.header.nav;

            autosave(
              {
                header: {
                  topBar: {
                    slides: [{ text: draft.announcementText }],
                  },
                  nav: {
                    enabled: nav.enabled,
                    items: nav.items,
                    icons: nav.icons,
                  },
                },
              },
              { debounceMs: 0 }
            );

            flush({ toastOnSuccess: true });
          }}
          saveLabel="Save header"
        />
      </Panel>

      <LabeledSwitch
        label="Show navigation"
        checked={resolved.header.nav.enabled}
        onCheckedChange={(v) => {
          autosave(
            {
              header: {
                nav: {
                  enabled: v,
                  icons: resolved.header.nav.icons, // ✅ preserve wishlist
                },
              },
            },
            { debounceMs: 500 }
          );
        }}
      />

      <Panel
        title="Header icons"
        description="Choose which icons appear in the header."
      >
        <LabeledSwitch
          label="Show wishlist icon"
          checked={draft.wishlistEnabled}
          onCheckedChange={(v) => {
            setDraft((d) => ({ ...d, wishlistEnabled: v }));

            autosave(
              {
                header: {
                  nav: {
                    enabled: resolved.header.nav.enabled,
                  },
                },
              },
              { debounceMs: 500 }
            );
          }}
        />
      </Panel>

      <Panel
        title="Menu"
        description="Choose which links appear in your top nav."
      >
        {/* Home + Shop are permanent */}
        <div className="text-xs text-muted-foreground">
          Home and Shop are always shown.
        </div>

        <LabeledSwitch
          label="About"
          checked={draft.headerMenu.about}
          onCheckedChange={(v) => {
            const next = {
              ...draft.headerMenu,
              about: v,
            };

            setDraft((d) => ({
              ...d,
              headerMenu: next,
            }));

            autosave({ ui: { headerMenu: next } }, { debounceMs: 500 });
          }}
        />

        <LabeledSwitch
          label="Contact"
          checked={draft.headerMenu.contact}
          onCheckedChange={(v) => {
            const next = {
              ...draft.headerMenu,
              contact: v,
            };

            setDraft((d) => ({
              ...d,
              headerMenu: next,
            }));

            autosave({ ui: { headerMenu: next } }, { debounceMs: 500 });
          }}
        />

        <LabeledSwitch
          label="Blog"
          checked={draft.headerMenu.blog}
          onCheckedChange={(v) => {
            const next = {
              ...draft.headerMenu,
              blog: v,
            };

            setDraft((d) => ({
              ...d,
              headerMenu: next,
            }));

            autosave({ ui: { headerMenu: next } }, { debounceMs: 500 });
          }}
        />
      </Panel>
    </div>
  );
}
