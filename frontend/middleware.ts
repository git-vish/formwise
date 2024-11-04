import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "./lib/auth";

const authPaths = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value || "";
  const { pathname } = request.nextUrl;

  const consoleUrl = new URL("/", request.url);

  if (token && authPaths.includes(pathname)) {
    return NextResponse.redirect(consoleUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/forgot-password"],
};
