"use client";

import { useSession, signOut } from "next-auth/react";

interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  accessTokenExpiresAt?: number;
}

export const useRefreshToken = () => {
  const { data: session, update } = useSession();

  return async function refreshToken() {
    const refresh = session?.backendTokens?.refreshToken;

    if (!refresh) {
      await signOut();
      return null;
    }

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          authorization: `Refresh ${refresh}`,
        },
      },
    );

    if (!resp.ok) {
      await signOut();
      return null;
    }

    const refreshedTokens: BackendTokens = await resp.json();

    const nextTokens = {
      accessToken: refreshedTokens.accessToken,
      refreshToken: session.backendTokens.refreshToken,
      expiresIn: refreshedTokens.expiresIn,
      accessTokenExpiresAt: Date.now() + refreshedTokens.expiresIn * 1000,
    };

    await update({
      backendTokens: nextTokens,
    });

    return nextTokens.accessToken;
  };
};
