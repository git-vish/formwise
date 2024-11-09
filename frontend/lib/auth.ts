"use client";

import { jwtDecode } from "jwt-decode";
import { COOKIE_NAME } from "./cookies";
import { AUTH_URLS } from "@/config/api-urls";

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;

  const secure = window.location.protocol === "https:";
  const sameSite = secure ? "Strict" : "Lax";

  let expiryDate;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp) {
      expiryDate = new Date(decoded.exp * 1000);
    } else {
      expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    }
  } catch {
    expiryDate = new Date(Date.now() + 60 * 60 * 1000);
  }

  document.cookie = `${COOKIE_NAME}=${token}; expires=${expiryDate.toUTCString()}; path=/; secure=${secure}; samesite=${sameSite}`;
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    document.cookie
      .split(";")
      .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1] || null
  );
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const isTokenValid = (token?: string | null): boolean => {
  const tokenToCheck = token || getToken();
  if (!tokenToCheck) return false;

  try {
    const decoded = jwtDecode(tokenToCheck);
    return decoded.exp ? decoded.exp * 1000 > Date.now() : false;
  } catch {
    return false;
  }
};

export function initiateGoogleAuth() {
  if (typeof window === "undefined") return;

  const url = new URL(AUTH_URLS.GOOGLE);
  url.searchParams.set(
    "return_url",
    `${window.location.origin}/google-callback`
  );
  window.location.href = url.toString();
}
