"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth";
import {
  getToken,
  setToken,
  removeToken,
  initiateGoogleAuth,
  isTokenValid,
} from "@/lib/auth";
import type {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenValid(token)) {
      removeToken();
    }
    setIsInitialized(true);
  }, []);

  const {
    data: user,
    isLoading,
    error,
    refetch: refreshUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: authService.getCurrentUser,
    enabled: isInitialized && !!getToken(),
    retry: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const { access_token: token } = await authService.login(credentials);
        setToken(token);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        router.push("/dashboard");
      } catch (err) {
        throw err instanceof Error ? err : new Error("Login failed");
      }
    },
    [queryClient, router]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        const { access_token: token } = await authService.register(credentials);
        setToken(token);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        router.push("/dashboard");
      } catch (err) {
        throw err instanceof Error ? err : new Error("Registration failed");
      }
    },
    [queryClient, router]
  );

  const loginWithGoogle = useCallback(() => {
    initiateGoogleAuth();
  }, []);

  const logout = useCallback(() => {
    removeToken();
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router]);

  // Token validity check interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = getToken();
      if (token && !isTokenValid(token)) {
        logout();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [logout]);

  const contextValue: AuthContextType = {
    user: user ?? null,
    isLoading: !isInitialized || isLoading,
    error: error instanceof Error ? error : null,
    login,
    register,
    logout,
    loginWithGoogle,
    refreshUser: async () => {
      await refreshUser();
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
