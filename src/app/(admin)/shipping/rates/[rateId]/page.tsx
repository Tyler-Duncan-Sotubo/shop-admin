import RateDetailClient from "@/features/fulfillment/shipping/rates/ui/rate-detail-client";

type PageParams = { rateId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { rateId } = await params;
  return <RateDetailClient rateId={rateId} />;
};

export default page;
