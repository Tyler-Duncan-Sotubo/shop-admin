import * as React from "react";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { Button } from "@/shared/ui/button";
import { useGenerateInvoicePdf, useIssueInvoice } from "../hooks/use-invoices";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPdfUrl(payload: any): string | null {
  // Adapt to whatever generateAndUploadPdf returns.
  // Common patterns:
  return (
    payload?.url ??
    payload?.downloadUrl ??
    payload?.signedUrl ??
    payload?.fileUrl ??
    payload?.pdfUrl ??
    payload?.data?.url ??
    null
  );
}

function downloadUrl(url: string, filename?: string) {
  const a = document.createElement("a");
  a.href = url;
  if (filename) a.download = filename; // works best if same-origin; signed URLs often ignore this
  a.target = "_blank"; // nice for signed urls
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

type Props = {
  invoiceId: string;
  session: Session | null;
  axios: AxiosInstance;
  storeId?: string | null;
  templateId?: string;
  invoiceStatus?: string;
};

export function DownloadInvoicePdfButton({
  invoiceId,
  session,
  axios,
  storeId,
  templateId,
  invoiceStatus,
}: Props) {
  const issue = useIssueInvoice(session, axios);
  const genPdf = useGenerateInvoicePdf(session, axios);

  const busy = issue.isPending || genPdf.isPending;

  const onClick = async () => {
    // 1) Issue if draft (optional optimization; backend is idempotent anyway)
    if (!invoiceStatus || invoiceStatus === "draft") {
      await issue.mutateAsync({
        invoiceId,
        input: { storeId }, // include seriesName/dueAt if you need
      });
    }

    // 2) Generate + upload pdf
    const pdf = await genPdf.mutateAsync({
      invoiceId,
      storeId: storeId || undefined,
      templateId,
    });

    // 3) Download/open
    const url = getPdfUrl(pdf);
    if (!url) {
      // If your backend returns something else (like {fileKey}), you’ll need to map it to a download URL.
      throw new Error("PDF generated but no URL returned from API.");
    }

    downloadUrl(url, `invoice-${invoiceId}.pdf`);
  };

  return (
    <Button variant={"clean"} onClick={onClick} disabled={busy}>
      <BsFileEarmarkPdfFill />
      {busy ? "Preparing..." : "Download PDF"}
    </Button>
  );
}
