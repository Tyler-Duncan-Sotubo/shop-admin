import * as React from "react";
import { BsLink45Deg } from "react-icons/bs";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { useGenerateInvoicePublicLink } from "../hooks/use-invoices";
import { Button } from "@/shared/ui/button";

type Props = {
  invoiceId: string;
  session: Session | null;
  axios: AxiosInstance;
};

const PUBLIC_BASE = process.env.NEXT_PUBLIC_PUBLIC_INVOICE_BASE_URL!;

export function ShareInvoiceLinkButton({ invoiceId, session, axios }: Props) {
  const generateLink = useGenerateInvoicePublicLink(session, axios);
  const [copied, setCopied] = React.useState(false);

  const onClick = async () => {
    const res = await generateLink.mutateAsync({ invoiceId });

    const url = `${PUBLIC_BASE}/i/${res.token}`;
    await navigator.clipboard.writeText(url);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="clean" onClick={onClick} disabled={generateLink.isPending}>
      <BsLink45Deg />
      {copied
        ? "Link copied"
        : generateLink.isPending
        ? "Generating…"
        : "Share link"}
    </Button>
  );
}
