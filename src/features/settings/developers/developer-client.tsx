"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import ApiKeysClient from "./api-keys/ui/api-keys-client";
import { AnalyticsTagsClient } from "./analytics-tags/ui/analytics-tags-client";

export default function DeveloperClient() {
  return (
    <section className="space-y-6">
      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="analytics-tags">Analytics Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="mt-6">
          <ApiKeysClient />
        </TabsContent>

        <TabsContent value="analytics-tags" className="mt-6">
          <AnalyticsTagsClient />
        </TabsContent>
      </Tabs>
    </section>
  );
}
