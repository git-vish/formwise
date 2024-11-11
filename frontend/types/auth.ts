export interface User {
  email: string;
  first_name: string;
  last_name: string;
  picture?: string;
  auth_provider: "email" | "google";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  first_name: string;
  last_name: string;
}

export interface Token {
  access_token: string;
  token_type: "bearer";
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  signInWithGoogle: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (update: Partial<User>) => Promise<void>;
}
