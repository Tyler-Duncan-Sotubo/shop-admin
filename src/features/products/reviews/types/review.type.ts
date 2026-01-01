export type Review = {
  id: string;
  companyId: string;
  productId: string;

  userId: string | null;

  authorName: string;
  authorEmail: string;

  rating: number;
  review: string;

  isApproved: boolean;
  approvedAt: string | Date | null;

  moderationNote: string | null;
  moderatedByUserId: string | null;
  moderatedAt: string | Date | null;

  createdAt: string | Date;
  updatedAt: string | Date;

  deletedAt?: string | Date | null;
};

export type ReviewQuery = {
  productId?: string;
  search?: string;
  isApproved?: boolean;
  limit?: number;
  offset?: number;
  storeId?: string;
};

export type UpdateReviewPayload = {
  // allow partial moderation updates
  isApproved?: boolean;
  rating?: number;
  review?: string;
  moderationNote?: string;
};
