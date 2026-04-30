import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getDefaultPathForRole,
  isProtectedRoute,
  isRoleAllowedForPath,
  normalizeNextPath,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (pathname === "/signin") {
    if (!session) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(getDefaultPathForRole(session.role), request.url));
  }

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    const nextPath = normalizeNextPath(`${pathname}${search}`);
    const signInUrl = new URL("/signin", request.url);

    if (nextPath) {
      signInUrl.searchParams.set("next", nextPath);
    }

    return NextResponse.redirect(signInUrl);
  }

  if (!isRoleAllowedForPath(session.role, pathname)) {
    return NextResponse.redirect(new URL(getDefaultPathForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/patient/:path*", "/doctor/:path*", "/research/:path*"],
};