import QuoteDetailsClient from "@/features/quotes/ui/quote-details";

type PageParams = { quoteId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { quoteId } = await params;
  return <QuoteDetailsClient quoteId={quoteId} />;
};

export default page;
