import { CategoryUpsertClient } from "@/features/products/categories/ui/category-upsert-client";

type PageParams = { categoryId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { categoryId } = await params;
  return <CategoryUpsertClient mode="edit" categoryId={categoryId} />;
};

export default page;
