"use client";

import * as React from "react";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { Button } from "@/shared/ui/button";
import { useDownloadQuotePdf } from "../hooks/use-quotes";

type Props = {
  quoteId: string;
  session: Session | null;
  axios: AxiosInstance;
};

export function DownloadQuotePdfButton({ quoteId, session, axios }: Props) {
  const genPdf = useDownloadQuotePdf(session, axios);

  const onClick = async () => {
    const pdf = await genPdf.mutateAsync({ quoteId });
    if (!pdf?.pdfUrl) throw new Error("PDF generated but no URL returned.");
    const a = document.createElement("a");
    a.href = pdf.pdfUrl;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Button variant="clean" onClick={onClick} disabled={genPdf.isPending}>
      <BsFileEarmarkPdfFill />
      {genPdf.isPending ? "Preparing..." : "Download PDF"}
    </Button>
  );
}
