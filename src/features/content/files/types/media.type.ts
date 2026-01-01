// src/features/media/types/media.type.ts
export type MediaRow = {
  id: string;
  storeId: string;
  companyId: string;

  url: string;
  fileName: string;
  mimeType: string;
  size: number | null;

  width?: number | null;
  height?: number | null;

  folder?: string | null;
  tag?: string | null;

  createdAt: string | Date;
};
