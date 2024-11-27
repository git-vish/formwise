import { apiRequest } from "@/lib/api";
import { AUTH_URLS, USER_URLS } from "@/config/api-urls";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  Token,
} from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<Token> {
    return await apiRequest<Token>({
      endpoint: AUTH_URLS.LOGIN,
      method: "POST",
      payload: credentials,
      errorMessages: {
        404: "Account not found. Please check your email.",
        401: "Incorrect password. Please try again.",
      },
    });
  },

  async register(credentials: RegisterCredentials): Promise<Token> {
    return await apiRequest<Token>({
      endpoint: AUTH_URLS.REGISTER,
      method: "POST",
      payload: credentials,
      errorMessages: {
        409: "An account with this email already exists.",
      },
    });
  },

  initiateGoogleAuth(): void {
    if (typeof window === "undefined") return;

    const url = new URL(AUTH_URLS.GOOGLE);
    const returnUrl = new URL("/google-callback", window.location.origin);

    url.searchParams.set("return_url", returnUrl.toString());
    window.location.replace(url.toString());
  },

  async getCurrentUser(): Promise<User> {
    return await apiRequest<User>({
      endpoint: USER_URLS.ME,
      requireAuth: true,
    });
  },

  async updateUser(update: Partial<User>): Promise<User> {
    return await apiRequest<User>({
      endpoint: USER_URLS.ME,
      method: "PATCH",
      payload: update,
      requireAuth: true,
      errorMessages: {
        304: "No changes made.",
      },
    });
  },
};
