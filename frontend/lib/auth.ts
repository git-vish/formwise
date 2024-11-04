import { jwtDecode } from "jwt-decode";

export const COOKIE_NAME = "formwise_token";

export const setToken = (token: string) => {
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
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${COOKIE_NAME}=`)
  );
  if (!tokenCookie) return null;

  return tokenCookie.split("=")[1];
};

export const removeToken = () => {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 > Date.now() : false;
  } catch {
    return false;
  }
};
