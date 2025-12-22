/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2, Save } from "lucide-react";
import { useGetInvoiceWithLines, useIssueInvoice } from "../hooks/use-invoices";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useUpdateInvoiceDraft } from "../hooks/use-invoices";
import { useGetTaxes } from "@/features/settings/tax-settings/hooks/use-taxes";
import { InvoiceLineItemsTable } from "./invoice-line-items";
import { DownloadInvoicePdfButton } from "./download-invoice-pdf-button";
import { ShareInvoiceLinkButton } from "./share-invoice-link-button";

function DateField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: Date | null;
  disabled?: boolean;
  onChange: (d: Date | null) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground whitespace-nowrap">{label}</p>

      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className="h-9 w-[190px] justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {value ? format(value, "dd MMM yyyy") : "—"}
            </span>
            <CalendarIcon className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0" align="end">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(d) => onChange(d ?? null)}
          />
          <div className="p-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              disabled={disabled}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function InvoiceEditClient({ invoiceId }: { invoiceId: string }) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [invoiceDate, setInvoiceDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const { data, isLoading } = useGetInvoiceWithLines(invoiceId, session, axios);
  const updateDraft = useUpdateInvoiceDraft(session, axios);
  const issue = useIssueInvoice(session, axios);

  // Taxes for per-line selector
  const { data: taxes = [] } = useGetTaxes(
    { active: true, storeId: activeStoreId },
    session,
    axios
  );

  const inv = data?.invoice as any;
  const lines = (data?.lines ?? []) as any[];

  if (isLoading || !inv) return <Loading />;

  const isDraft = inv.status === "draft";

  const initialInvoiceDate: Date | null = (() => {
    const v = inv.invoiceDate ?? inv.issuedAt ?? inv.createdAt ?? null;
    return v ? new Date(v) : null;
  })();

  const initialDueDate: Date | null = (() => {
    const v = inv.dueAt ?? null;
    return v ? new Date(v) : null;
  })();

  const resolvedInvoiceDate = invoiceDate ?? initialInvoiceDate;
  const resolvedDueDate = dueDate ?? initialDueDate;

  const hasHeaderEdits = invoiceDate !== null || dueDate !== null;

  const saveHeaderDates = async () => {
    const toISO = (d: Date | null) => (d ? d.toISOString() : null);

    await updateDraft.mutateAsync({
      invoiceId,
      input: {
        issuedAt: toISO(resolvedInvoiceDate),
        dueAt: toISO(resolvedDueDate),
      },
    });

    setInvoiceDate(null);
    setDueDate(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={inv.number ? `Invoice ${inv.number}` : "Invoice"}
        description={`Order: ${inv.meta?.orderNumber ?? "—"}`}
        tooltip="Draft invoices are editable. Issued invoices are locked."
      >
        <div className="flex gap-2">
          {isDraft ? (
            <>
              <Button
                variant="clean"
                onClick={saveHeaderDates}
                disabled={updateDraft.isPending || !hasHeaderEdits}
              >
                {updateDraft.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-2">Save</span>
              </Button>

              <Button
                onClick={async () => {
                  await issue.mutateAsync({ invoiceId, input: {} });
                }}
                disabled={issue.isPending}
              >
                {issue.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span className="ml-2">Issue invoice</span>
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <DownloadInvoicePdfButton
                invoiceId={invoiceId}
                session={session}
                axios={axios}
                storeId={activeStoreId}
                invoiceStatus={inv.status}
              />

              <ShareInvoiceLinkButton
                invoiceId={invoiceId}
                session={session}
                axios={axios}
              />
            </div>
          )}
        </div>
      </PageHeader>

      {/* Details + Dates */}
      <div className="rounded-2xl">
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Invoice details</p>
              <p className="text-sm text-muted-foreground">
                Update invoice date and due date (draft only).
              </p>
            </div>
          </div>

          <Separator />

          <div className="w-1/2 space-y-5">
            <DateField
              label="Invoice date"
              value={resolvedInvoiceDate}
              disabled={!isDraft || updateDraft.isPending}
              onChange={(d) => setInvoiceDate(d)}
            />

            <DateField
              label="Due date"
              value={resolvedDueDate}
              disabled={!isDraft || updateDraft.isPending}
              onChange={(d) => setDueDate(d)}
            />
          </div>

          {isDraft ? (
            <div className="flex justify-end">
              <Button
                variant="clean"
                onClick={saveHeaderDates}
                disabled={updateDraft.isPending || !hasHeaderEdits}
              >
                {updateDraft.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-2">Save</span>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* ✅ Split: Line items table + totals */}
      <InvoiceLineItemsTable
        invoiceId={invoiceId}
        inv={inv}
        lines={lines}
        taxes={taxes}
        isDraft={isDraft}
      />
    </div>
  );
}
