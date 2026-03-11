import { PendingOrderPaymentReviewClient } from "@/features/billing/payments/ui/pending-order-payment-review-client";

type PageParams = { paymentId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { paymentId } = await params;
  return <PendingOrderPaymentReviewClient paymentId={paymentId} />;
};

export default page;
