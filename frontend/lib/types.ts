export interface User {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  picture?: string | null;
  auth_provider: "email" | "google";
}
