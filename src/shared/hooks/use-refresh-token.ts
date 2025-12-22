"use client";

import { useSession, signOut } from "next-auth/react";

interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const useRefreshToken = () => {
  const { data: session, update } = useSession();

  async function refreshToken() {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          authorization: `Refresh ${session?.backendTokens?.refreshToken}`,
        },
      }
    );

    if (!resp.ok) {
      signOut();
    }

    const refreshedTokens: BackendTokens = await resp.json();

    if (session) {
      await update({
        ...session,
        backendTokens: {
          ...session.backendTokens,
          accessToken: refreshedTokens.accessToken,
        },
      });
    } else {
      signOut();
    }
  }

  return refreshToken;
};
