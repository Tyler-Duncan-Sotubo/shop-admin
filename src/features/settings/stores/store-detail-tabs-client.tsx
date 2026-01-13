"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/shared/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import StoreGeneralClient from "./core/ui/store-general-client";
import StoreDomainsClient from "./core/ui/store-domain-client";
import { Settings, Globe } from "lucide-react";

type StoreTabKey = "general" | "domains";

const DEFAULT_TAB: StoreTabKey = "general";

export default function StoreDetailTabsClient({
  storeId,
}: {
  storeId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab") as StoreTabKey | null;
  const [tab, setTab] = useState<StoreTabKey>(urlTab ?? DEFAULT_TAB);

  // keep state in sync with back/forward navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (urlTab && urlTab !== tab) setTab(urlTab);
  }, [tab, urlTab]);

  const onTabChange = (next: StoreTabKey) => {
    setTab(next);
    router.replace(`?tab=${next}`, { scroll: false });
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Store settings"
        description="Manage your online store configuration."
        tooltip="Update store details, domains, branding, and checkout settings."
      />

      <Tabs value={tab} onValueChange={(v) => onTabChange(v as StoreTabKey)}>
        <TabsList>
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 text-base"
          >
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>

          <TabsTrigger
            value="domains"
            className="flex items-center gap-2 text-base"
          >
            <Globe className="h-4 w-4" />
            Domains
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <StoreGeneralClient storeId={storeId} />
        </TabsContent>

        <TabsContent value="domains" className="mt-4">
          <StoreDomainsClient storeId={storeId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
