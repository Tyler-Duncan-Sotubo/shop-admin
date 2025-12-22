import CartDetailClient from "@/features/cart/ui/cart-detail-client";

type PageParams = { cartId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { cartId } = await params;
  return <CartDetailClient cartId={cartId} />;
};

export default page;
