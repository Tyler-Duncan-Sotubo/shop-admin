export type ApiKeyScope = string;

export type ApiKeyRow = {
  id: string;
  companyId: string;

  name: string;

  // include these if you return them; otherwise optional
  prefix?: string;
  allowedOrigins?: string[] | null;

  scopes: ApiKeyScope[] | null;
  isActive: boolean;

  createdAt: string | null;
  expiresAt: string | null;
  lastUsedAt: string | null;
};

export type CreateApiKeyPayload = {
  name: string;
  prefix?: string; // pk_live / pk_test etc
  scopes?: ApiKeyScope[];
  allowedOrigins?: string[]; // if you add to DTO
  expiresAt?: string | null; // ISO string
  storeId?: string | null; // optional store scope
};

export type CreateApiKeyResponse = {
  apiKey: ApiKeyRow;
  rawKey: string; // show once
};

export type RevokeApiKeyResponse = {
  message: string;
};
