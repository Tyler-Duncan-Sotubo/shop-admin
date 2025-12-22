import EditProductClient from "@/features/products/core/ui/edit-product-client";

type PageParams = { productId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { productId } = await params;
  return <EditProductClient productId={productId} />;
};

export default page;
