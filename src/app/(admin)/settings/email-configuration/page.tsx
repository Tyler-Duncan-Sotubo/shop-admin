import { EmailSenderConfigClient } from "@/features/settings/email-config/ui/email-sender-config-client";

export const metadata = { title: "Email Marketing Settings" };

export default function EmailMarketingSettingsPage() {
  return <EmailSenderConfigClient />;
}
