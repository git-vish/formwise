import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "./lib/cookies";

const ROUTE_CONFIG = {
  guestOnly: new Set(["/", "/login", "/register", "/forgot-password"]),
  authRequired: new Set(["/dashboard"]),
} as const;

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (token) {
    if (ROUTE_CONFIG.guestOnly.has(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    if (ROUTE_CONFIG.authRequired.has(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
