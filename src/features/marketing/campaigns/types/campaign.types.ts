// features/campaigns/types/campaign.types.ts
export type TemplateType = "new_arrival" | "promotion" | "newsletter";
export type AudienceType = "all" | "customers" | "subscribers";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed";

export type Campaign = {
  id: string;
  companyId: string;
  storeId: string;
  templateType: TemplateType;
  status: CampaignStatus;
  audienceType: AudienceType;
  subject: string;
  previewText: string | null;
  contentJson: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
  resendBatchId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListCampaignsParams = {
  storeId: string;
  status?: CampaignStatus;
  search?: string;
  limit?: number;
  offset?: number;
};

export type ListCampaignsResponse = {
  rows: Campaign[];
  count: number;
  limit: number;
  offset: number;
};

export type CreateCampaignInput = {
  storeId: string;
  templateType: TemplateType;
  audienceType?: AudienceType;
  subject: string;
  previewText?: string | null;
  contentJson?: string | null;
};

export type UpdateCampaignInput = {
  id: string;
  templateType?: TemplateType;
  audienceType?: AudienceType;
  subject?: string;
  previewText?: string | null;
  contentJson?: string | null;
  scheduledAt?: string | null;
};
