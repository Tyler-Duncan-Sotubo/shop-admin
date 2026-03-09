import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface CustomUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  role: string;
  avatar: string;
  onboardingCompleted: boolean;
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
      credentials: {},
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
    async jwt({ token, user, trigger, session }) {
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
          onboardingCompleted: u.onboardingCompleted,
        };

        token.backendTokens = u.backendTokens;
        token.permissions = u.permissions ?? [];
        token.accessTokenExpires =
          Date.now() + u.backendTokens.expiresIn * 1000;

        return token;
      }

      // Client-side useSession().update(...)
      if (trigger === "update" && session?.backendTokens) {
        const current = (token.backendTokens ?? {}) as Partial<BackendTokens>;
        const next = session.backendTokens as BackendTokens;

        token.backendTokens = {
          ...current,
          ...next,
        };

        if (next.expiresIn) {
          token.accessTokenExpires = Date.now() + next.expiresIn * 1000;
        }

        return token;
      }

      return token;
    },

    async session({ token, session }) {
      session.user = token.user as typeof session.user;
      session.backendTokens = token.backendTokens as BackendTokens;
      session.permissions = (token.permissions as string[]) ?? [];

      session.expires = token.accessTokenExpires
        ? new Date(token.accessTokenExpires as number).toISOString()
        : session.expires;

      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
