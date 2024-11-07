export interface Token {
  access_token: string;
  token_type: "bearer";
}

export interface User {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  picture?: string | null;
  auth_provider: "email" | "google";
}
