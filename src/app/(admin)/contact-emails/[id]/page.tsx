import { ContactEmailDetailClient } from "@/features/contact-emails/ui/contact-email-detail-client";

type PageParams = { id: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <ContactEmailDetailClient id={id} />;
};

export default page;
