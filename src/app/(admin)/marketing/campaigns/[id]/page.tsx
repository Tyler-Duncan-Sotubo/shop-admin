import CampaignDetailClient from "@/features/marketing/campaigns/ui/campaign-detail-client";

type PageParams = { id: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <CampaignDetailClient campaignId={id} />;
};

export default page;
