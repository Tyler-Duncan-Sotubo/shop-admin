/* eslint-disable @typescript-eslint/no-explicit-any */
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/2fa",
  "/no-store-access",
  "/billing",
  "/billing/plans",
  "/setup",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip static and public routes ────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api") ||
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  // ── Get session token ─────────────────────────────────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── Not logged in → login ─────────────────────────────────
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const accessToken = (token as any)?.backendTokens?.accessToken;

  // ── Store check — only on dashboard ──────────────────────
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/api/stores/accessible-stores`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      // ── Session expired ─────────────────────────────────
      if (res.status === 401) {
        const redirectRes = NextResponse.redirect(
          new URL("/?reason=session_expired", request.url),
        );
        redirectRes.cookies.delete("next-auth.session-token");
        redirectRes.cookies.delete("__Secure-next-auth.session-token");
        return redirectRes;
      }

      if (res.ok) {
        const data = await res.json();
        if (!data?.data?.length) {
          return NextResponse.redirect(
            new URL("/no-store-access?reason=no_stores", request.url),
          );
        }
      }
    } catch {
      return NextResponse.redirect(
        new URL("/no-store-access?reason=error", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
