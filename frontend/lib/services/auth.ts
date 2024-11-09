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
    });
  },

  async register(credentials: RegisterCredentials): Promise<Token> {
    return fetcher<Token>({
      endpoint: AUTH_URLS.REGISTER,
      method: "POST",
      payload: credentials,
    });
  },

  async getCurrentUser(): Promise<User> {
    console.log("Fetching current user...");
    const user = await fetcher<User>({
      endpoint: USER_URLS.ME,
      authRequired: true,
    });
    console.log("Fetched current user:", user);
    return user;
  },
};
