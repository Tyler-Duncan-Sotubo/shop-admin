import ZoneDetailClient from "@/features/fulfillment/shipping/zones/ui/zone-location-client";

type PageParams = { zoneId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { zoneId } = await params;
  return <ZoneDetailClient zoneId={zoneId} />;
};

export default page;
