import React from "react";
import ResetPasswordForm from "@/features/auth/reset-password/ui/reset-password-form";

type PageParams = { token: string };
type PageProps = {
  params: Promise<PageParams>;
};

const page = async ({ params }: PageProps) => {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
};

export default page;
