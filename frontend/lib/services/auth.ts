import { fetcher } from "@/lib/utils";
import { AUTH_URLS, USER_URLS } from "@/config/api-urls";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  Token,
} from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<Token> {
    return fetcher<Token>({
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
    return fetcher<Token>({
      endpoint: AUTH_URLS.REGISTER,
      method: "POST",
      payload: credentials,
      errorMessages: {
        409: "An account with this email already exists.",
      },
    });
  },

  async getCurrentUser(): Promise<User> {
    const user = await fetcher<User>({
      endpoint: USER_URLS.ME,
      authRequired: true,
    });
    return user;
  },
};
