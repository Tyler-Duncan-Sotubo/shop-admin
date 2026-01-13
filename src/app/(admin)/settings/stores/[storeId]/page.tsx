import StoreDetailTabsClient from "@/features/settings/stores/store-detail-tabs-client";

type PageParams = { storeId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { storeId } = await params;
  return <StoreDetailTabsClient storeId={storeId} />;
};

export default page;
