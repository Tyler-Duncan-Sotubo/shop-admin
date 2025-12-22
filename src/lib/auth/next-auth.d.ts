// src/lib/auth/next-auth.d.ts
import { DefaultSession } from "next-auth";

interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      companyId: string;
      role: string;
      avatar: string;
      employmentStatus: string;
    };
    employeeId?: string | null;
    userAccountId?: string | null;
    backendTokens: BackendTokens;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      companyId: string;
      role: string;
      avatar: string;
      employmentStatus: string;
    };
    employeeId?: string | null;
    userAccountId?: string | null;
    backendTokens: BackendTokens;
    permissions: string[];
    accessTokenExpires: number;
  }
}
