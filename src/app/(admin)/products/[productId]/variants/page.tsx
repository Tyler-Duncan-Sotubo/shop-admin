import { ProductVariants } from "@/features/products/core/ui/product-variants";

type PageParams = { productId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { productId } = await params;
  return <ProductVariants productId={productId} />;
};

export default page;
