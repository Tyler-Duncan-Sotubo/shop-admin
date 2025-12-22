import AdminCustomerDetailClient from "@/features/customers/ui/admin-customer-detail-client";

type PageParams = { customerId: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { customerId } = await params;
  return <AdminCustomerDetailClient customerId={customerId} />;
};

export default page;
