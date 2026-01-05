"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { TabLabel } from "@/shared/ui/tab-label";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { useGetContactEmails } from "../hooks/use-contact-emails";
import { useContactEmailCountsForTabs } from "../hooks/use-contact-email-counts";
import {
  CONTACT_EMAIL_TAB_TO_STATUS,
  ContactEmailTab,
} from "../constants/contact-email-tabs";
import { ContactEmailsTable } from "./contact-emails-table";

export default function ContactEmailsClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [tab, setTab] = useState<ContactEmailTab>("new");

  const counts = useContactEmailCountsForTabs(session, axios, activeStoreId);

  const params = useMemo(
    () => ({
      limit: 50,
      offset: 0,
      status: CONTACT_EMAIL_TAB_TO_STATUS[tab],
      storeId: activeStoreId,
    }),
    [tab, activeStoreId]
  );

  const { data, isLoading } = useGetContactEmails(session, axios, params);
  const rows = data?.rows ?? [];
  const hasData = rows.length > 0;

  if (authStatus === "loading" || isLoading) return <Loading />;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Contact Emails"
        description="View and manage messages submitted from your storefront contact forms."
        tooltip="New messages appear here. Open a message to mark it as read."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as ContactEmailTab)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">
              <TabLabel label="All" count={counts.all} />
            </TabsTrigger>

            <TabsTrigger value="new">
              <TabLabel label="New" count={counts.new} />
            </TabsTrigger>

            <TabsTrigger value="read">
              <TabLabel label="Read" count={counts.read} showZero={false} />
            </TabsTrigger>

            <TabsTrigger value="archived">
              <TabLabel
                label="Archived"
                count={counts.archived}
                showZero={false}
              />
            </TabsTrigger>

            <TabsTrigger value="spam">
              <TabLabel label="Spam" count={counts.spam} showZero={false} />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={tab} className="mt-4">
          {!hasData ? (
            <EmptyState
              title="No messages found"
              description="Try another tab or check back later."
            />
          ) : (
            <ContactEmailsTable data={rows} />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
