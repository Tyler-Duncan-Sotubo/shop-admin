import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

interface BackendTokens {
  accessToken: string; // e.g. JWT string used for API calls
  refreshToken: string; // e.g. refresh token string
  expiresIn: number; // how many seconds until accessToken expires
}

interface CustomUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  role: string;
  avatar: string;
  employmentStatus: string;
  backendTokens: BackendTokens;
  permissions: string[];
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {}, // no built‐in fields; we pass user+tokens manually at signIn()
      async authorize(credentials: unknown) {
        const { user, backendTokens, permissions } = credentials as {
          user: string;
          backendTokens: string;
          permissions: string[];
        };

        const parsedUser = JSON.parse(user);
        const parsedBackendTokens = JSON.parse(backendTokens);

        if (!parsedUser || !parsedBackendTokens) return null;

        return {
          ...parsedUser,
          backendTokens: parsedBackendTokens,
          permissions,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in
      if (user) {
        const u = user as CustomUser & { userId?: string | null };

        token.user = {
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          companyId: u.companyId,
          role: u.role,
          avatar: u.avatar,
          employmentStatus: u.employmentStatus,
        };

        token.backendTokens = u.backendTokens;
        token.permissions = u.permissions ?? [];
        token.accessTokenExpires = u.backendTokens.expiresIn;

        return token;
      }

      return token;
    },

    async session({ token, session }) {
      session.user = token.user;
      session.backendTokens = token.backendTokens;
      session.permissions = token.permissions;
      session.expires = new Date(token.accessTokenExpires).toISOString();
      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
