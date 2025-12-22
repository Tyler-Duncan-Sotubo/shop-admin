import React from "react";
import { StoreLocationsSection } from "@/features/stores/ui/store-locations-section";

type PageParams = { storeId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { storeId } = await params;
  return <StoreLocationsSection storeId={storeId} />;
};

export default page;
