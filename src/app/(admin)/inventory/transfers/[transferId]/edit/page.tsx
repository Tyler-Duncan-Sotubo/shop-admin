import { EditTransferItemsPage } from "@/features/inventory/transfer/ui/edit-transfer-items-client";

type PageParams = { transferId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { transferId } = await params;
  return <EditTransferItemsPage transferId={transferId} />;
};

export default page;
