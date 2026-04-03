import { VerifyInvitationView } from "@/features/auth/invitation/ui/verify-invitation-view";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  return <VerifyInvitationView token={token} />;
}
