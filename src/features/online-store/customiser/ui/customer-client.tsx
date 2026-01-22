/* eslint-disable react-hooks/set-state-in-effect */
// CustomiserClient.tsx
"use client";

import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useStorefrontResolvedConfig } from "../../core/hooks/use-storefront-config";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";
import {
  CustomiserSidebar,
  CustomiserSidebarMobile,
  StorefrontSectionId,
} from "./customiser-sidebar";
import { useEffect, useState } from "react";
import { SectionPreview } from "./section-preview";
import { ResolvedStorefrontConfig } from "../types/storefront-config.types";
import { AutosaveProvider } from "../context/autosave-context";
import type { DraftState } from "../types/customiser.type";
import { buildDraft } from "../draft/build-draft";

export function CustomiserClient() {
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session } = useSession();
  const [active, setActive] = useState<StorefrontSectionId>("appearance");

  const storeId = activeStoreId ?? "";
  const enabled = !!session?.backendTokens?.accessToken && !!storeId;

  const { data, isLoading, error } = useStorefrontResolvedConfig(
    session,
    axios,
    storeId,
  );

  const resolved = data as ResolvedStorefrontConfig | undefined;
  const [draft, setDraft] = useState<DraftState | null>(null);

  useEffect(() => {
    if (!resolved) return;
    setDraft(buildDraft(resolved));
  }, [resolved]);

  useEffect(() => {
    if (!resolved || !draft) return;

    const menu = draft.headerMenu ?? resolved.ui.headerMenu;

    const aboutVisible =
      !!menu?.about && Array.isArray(resolved.pages?.about?.sections);
    const contactVisible =
      !!menu?.contact && Array.isArray(resolved.pages?.contact?.sections);

    if (active === "about" && !aboutVisible) setActive("appearance");
    if (active === "contact" && !contactVisible) setActive("appearance");
  }, [active, draft, resolved]);

  if (!enabled) return <div className="p-6">Select a store to continue.</div>;
  if (isLoading) return <div className="p-6">Loading preview…</div>;
  if (error || !resolved)
    return <div className="p-6">Failed to load preview</div>;
  if (!draft) return <div className="p-6">Preparing editor…</div>;

  return (
    <AutosaveProvider session={session} axios={axios} storeId={storeId}>
      <div className="flex h-screen w-full overflow-hidden bg-muted">
        {/* Mobile sheet + top bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50">
          <CustomiserSidebarMobile
            active={active}
            onSelect={setActive}
            resolved={resolved}
            headerMenu={draft.headerMenu}
          />
        </div>

        {/* Desktop sidebar */}
        <CustomiserSidebar
          active={active}
          onSelect={setActive}
          resolved={resolved}
          headerMenu={draft.headerMenu}
        />

        {/* Preview */}
        <main className="flex-1 overflow-hidden pt-12 md:pt-0">
          <SectionPreview
            section={active}
            resolved={resolved}
            draft={draft}
            setDraft={setDraft}
          />
        </main>
      </div>
    </AutosaveProvider>
  );
}
