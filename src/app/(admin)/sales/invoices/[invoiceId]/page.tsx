import { InvoiceEditClient } from "@/features/billing/invoices/ui/invoice-edit-client";

type PageParams = { invoiceId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { invoiceId } = await params;
  return <InvoiceEditClient invoiceId={invoiceId} />;
};

export default page;
