import { CampaignBuilderEdit } from "@/features/marketing/campaigns/builder/ui/campaign-builder-edit";

type PageParams = { id: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <CampaignBuilderEdit campaignId={id} />;
};

export default page;
