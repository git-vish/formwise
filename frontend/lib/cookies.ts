export const COOKIE_NAME = "formwise_token";

export const cookieConfig = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  httpOnly: true,
};

// Utility function to parse cookies on both client and server
export const parseCookies = (
  cookieString: string = ""
): Record<string, string> => {
  return cookieString
    .split(";")
    .reduce((cookies: Record<string, string>, cookie) => {
      const [name, value] = cookie.split("=").map((c) => c.trim());
      if (name && value) cookies[name] = value;
      return cookies;
    }, {});
};

// Get token from either client or server context
export const getTokenFromCookies = (cookieString?: string): string | null => {
  // Client-side
  if (typeof window !== "undefined") {
    return parseCookies(document.cookie)[COOKIE_NAME] || null;
  }

  // Server-side
  if (cookieString) {
    return parseCookies(cookieString)[COOKIE_NAME] || null;
  }

  return null;
};
