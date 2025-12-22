"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Separator } from "@/shared/ui/separator";
import { TemplatePicker } from "./template-picker";
import { BrandingForm } from "./branding-form";
import { InvoicePreviewPane } from "./invoice-preview-pane";
import {
  useGetInvoiceBranding,
  useInvoiceTemplatePreviewHtml,
  useListInvoiceTemplates,
  useUpsertInvoiceBranding,
  useInvoiceTemplatePreviewPdf,
} from "../hooks/use-invoice-templates";
import PageHeader from "@/shared/ui/page-header";
import InvoiceTemplateLogoUploader from "./invoice-template-logo-uploader";

export function InvoiceTemplateClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope(); // ✅ your store scope

  // Selected template override (optional). If null => backend resolves using branding/default.
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const { data: templates = [], isLoading: templatesLoading } =
    useListInvoiceTemplates(session, axios);

  const { data: branding, isLoading: brandingLoading } = useGetInvoiceBranding(
    activeStoreId,
    session,
    axios
  );

  // If branding has templateId and user hasn't selected one yet, keep UI aligned
  useEffect(() => {
    if (!branding) return;
    if (selectedTemplateId !== null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (branding.templateId) setSelectedTemplateId(branding.templateId);
  }, [branding, selectedTemplateId]);

  const previewQuery = useInvoiceTemplatePreviewHtml(
    { storeId: activeStoreId, templateId: selectedTemplateId },
    session,
    axios
  );

  const upsert = useUpsertInvoiceBranding(activeStoreId, session, axios);

  const previewPdf = useInvoiceTemplatePreviewPdf(
    { storeId: activeStoreId, templateId: selectedTemplateId },
    session,
    axios
  );

  return (
    <section>
      <PageHeader
        title="Invoice Template"
        description="Customize your invoice template"
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: settings */}
        <div className="space-y-4">
          <Card className="p-4">
            <Tabs defaultValue="template">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="mt-4 space-y-4">
                <TemplatePicker
                  templates={templates}
                  loading={templatesLoading}
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                />

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Preview updates automatically.
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => previewQuery.refetch()}
                    disabled={previewQuery.isFetching}
                  >
                    Refresh preview
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="branding" className="mt-4">
                <BrandingForm
                  loading={brandingLoading}
                  initial={branding}
                  onSubmit={async (values) => {
                    await upsert.mutateAsync({
                      ...values,
                      templateId: selectedTemplateId, // keep selection in sync
                    });
                  }}
                  isSubmitting={upsert.isPending}
                />
                <InvoiceTemplateLogoUploader storeId={activeStoreId} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* RIGHT: preview */}
        <InvoicePreviewPane
          html={previewQuery.data?.html ?? ""}
          loading={previewQuery.isLoading || previewQuery.isFetching}
          error={previewQuery.error?.message ?? null}
          onDownloadPdf={async () => {
            const data = await previewPdf.mutateAsync();
            window.open(data.pdfUrl, "_blank");
          }}
          downloading={previewPdf.isPending}
        />
      </div>
    </section>
  );
}
