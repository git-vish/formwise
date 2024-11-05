import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "./lib/auth";

const routes = {
  guestOnly: ["/", "/login", "/register", "/forgot-password"],
  authRequired: ["/dashboard"],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value || "";
  const { pathname } = request.nextUrl;

  if (token && routes.guestOnly.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && routes.authRequired.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/forgot-password", "/dashboard"],
};
