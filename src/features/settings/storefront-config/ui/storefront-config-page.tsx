/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Button } from "@/shared/ui/button";
import { isAxiosError } from "@/shared/api/axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import {
  useGetStorefrontConfig,
  useUpdateStorefrontConfig,
} from "../hooks/use-storefront-config";
import { StorefrontConfigSchema } from "../schema/storefront-config.schema";

// ✅ shadcn tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

// ✅ your split forms
import { ThemeForm } from "./theme-form";
import { HeaderForm } from "./header-form";
import { PagesForm } from "./pages-form";
import { AdvancedJsonEditor } from "./advanced-json-editor";

export function StorefrontConfigClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const q = useGetStorefrontConfig(session, axios, activeStoreId);
  const update = useUpdateStorefrontConfig(session, axios, activeStoreId);

  const [tab, setTab] = useState<"theme" | "header" | "pages" | "advanced">(
    "theme"
  );
  const [error, setError] = useState<string | null>(null);

  const cfg = q.data;
  const [draft, setDraft] = useState<any>(null);

  useMemo(() => {
    if (cfg && !draft) {
      setDraft({
        theme: cfg.theme ?? {},
        header: cfg.header ?? {},
        pages: cfg.pages ?? {},
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  const reset = () => {
    setError(null);
    setDraft({
      theme: cfg?.theme ?? {},
      header: cfg?.header ?? {},
      pages: cfg?.pages ?? {},
    });
  };

  const save = async () => {
    setError(null);

    const parsed = StorefrontConfigSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid config");
      return;
    }

    try {
      await update.mutateAsync(parsed.data);
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        setError(getErrorMessage(err.response.data?.error));
      } else {
        setError(getErrorMessage(err));
      }
    }
  };

  if (q.isLoading) return <div className="p-6">Loading...</div>;
  if (!draft) return <div className="p-6">No config</div>;

  return (
    <div className="space-y-4">
      {/* top action bar */}
      <div className="flex items-center gap-2">
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <ThemeForm
            value={draft.theme}
            onChange={(theme) => setDraft((d: any) => ({ ...d, theme }))}
          />
        </TabsContent>

        <TabsContent value="header">
          <HeaderForm
            value={draft.header}
            onChange={(header) => setDraft((d: any) => ({ ...d, header }))}
          />
        </TabsContent>

        <TabsContent value="pages">
          <PagesForm
            value={draft.pages}
            onChange={(pages) => setDraft((d: any) => ({ ...d, pages }))}
          />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedJsonEditor value={draft} onChange={setDraft} />
        </TabsContent>
      </Tabs>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
