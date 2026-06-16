// features/email-marketing/types/email-sender-config.types.ts
export type EmailSenderConfig = {
  id: string;
  companyId: string;
  fromEmail: string;
  fromName: string;
  logoUrl: string | null;
  brandColor: string | null;
  companyAddress: string | null;
  socialLinks: string | null;
  footerTagline: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SocialLinks = {
  twitter?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
};

export type UpsertEmailSenderConfigInput = {
  fromEmail: string;
  fromName: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  companyAddress?: string | null;
  socialLinks?: string | null;
  footerTagline?: string | null;
};
