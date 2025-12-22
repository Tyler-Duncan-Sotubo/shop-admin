import OrderDetailsClient from "@/features/orders/ui/order-details-client";

type PageParams = { orderId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { orderId } = await params;
  return <OrderDetailsClient orderId={orderId} />;
};

export default page;
