import { EditBlogPost } from "@/features/blog/ui/edit-blog-post";

type PageParams = { postId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { postId } = await params;
  return <EditBlogPost postId={postId} />;
};

export default page;
