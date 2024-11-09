"use client";

import { jwtDecode } from "jwt-decode";

export const COOKIE_NAME = "formwise_token";

interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
}

interface CookieOptions {
  secure: boolean;
  sameSite: "Strict" | "Lax";
  path: string;
  domain?: string;
}

export const tokenService = {
  cookieConfig: {
    getDefaultOptions(): CookieOptions {
      const secure =
        typeof window !== "undefined"
          ? window.location.protocol === "https:"
          : true;

      return {
        secure,
        sameSite: secure ? "Strict" : "Lax",
        path: "/",
      };
    },

    formatCookie(
      name: string,
      value: string,
      expires: Date,
      options: CookieOptions
    ): string {
      const { secure, sameSite, path, domain } = options;

      return [
        `${name}=${value}`,
        `expires=${expires.toUTCString()}`,
        `path=${path}`,
        `secure=${secure}`,
        `samesite=${sameSite}`,
        domain && `domain=${domain}`,
      ]
        .filter(Boolean)
        .join("; ");
    },
  },

  token: {
    set(token: string): void {
      if (typeof window === "undefined") return;

      const options = tokenService.cookieConfig.getDefaultOptions();
      const expiryDate = tokenService.token.getExpiryDate(token);

      document.cookie = tokenService.cookieConfig.formatCookie(
        COOKIE_NAME,
        token,
        expiryDate,
        options
      );
    },

    get(): string | null {
      if (typeof window === "undefined") return null;

      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((c) =>
        c.trim().startsWith(`${COOKIE_NAME}=`)
      );

      return tokenCookie ? tokenCookie.split("=")[1] : null;
    },

    remove(): void {
      if (typeof window === "undefined") return;

      const options = tokenService.cookieConfig.getDefaultOptions();
      const expiryDate = new Date(0);

      document.cookie = tokenService.cookieConfig.formatCookie(
        COOKIE_NAME,
        "",
        expiryDate,
        options
      );
    },

    isValid(token?: string | null): boolean {
      const tokenToCheck = token || tokenService.token.get();
      if (!tokenToCheck) return false;

      try {
        const decoded = jwtDecode<JWTPayload>(tokenToCheck);
        return decoded.exp ? decoded.exp * 1000 > Date.now() : false;
      } catch {
        return false;
      }
    },

    getExpiryDate(token: string): Date {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp) {
          return new Date(decoded.exp * 1000);
        }
      } catch {
        // Fall through to default
      }

      // Default expiry of 1 hour if token can't be decoded
      return new Date(Date.now() + 60 * 60 * 1000);
    },
  },
};
