"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
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
  User,
} from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

// Constants
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minute
const STALE_TIME = 60 * 60 * 1000; // 1 hour

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const token = getToken();
    if (token && !isTokenValid(token)) {
      removeToken();
    }
    setIsInitialized(true);
  }, []);

  // User data query
  const {
    data: user,
    isLoading,
    error,
    refetch: refreshUser,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: authService.getCurrentUser,
    enabled: isInitialized && !!getToken(),
    retry: false,
    staleTime: STALE_TIME,
  });

  // Auth handlers
  const handleAuthSuccess = useCallback(
    async (token: string) => {
      setToken(token);
      await refreshUser();
      router.push("/dashboard");
    },
    [refreshUser, router]
  );

  const handleAuthError = useCallback(
    (error: Error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    },
    [toast]
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const { access_token } = await authService.login(credentials);
        handleAuthSuccess(access_token);
      } catch (err) {
        handleAuthError(err as Error);
      }
    },
    [handleAuthSuccess, handleAuthError]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        const { access_token } = await authService.register(credentials);
        handleAuthSuccess(access_token);
      } catch (err) {
        handleAuthError(err as Error);
      }
    },
    [handleAuthSuccess, handleAuthError]
  );

  const signInWithGoogle = useCallback(() => {
    initiateGoogleAuth();
  }, []);

  const logout = useCallback(() => {
    removeToken();
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router]);

  // Token validity check
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkToken = () => {
      const token = getToken();
      if (token && !isTokenValid(token)) {
        logout();
      }
    };

    const intervalId = setInterval(checkToken, TOKEN_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [logout]);

  // Memoized context value
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: user ?? null,
      isLoading: !isInitialized || isLoading,
      error: error instanceof Error ? error : null,
      login,
      register,
      logout,
      signInWithGoogle,
      refreshUser: async () => {
        await refreshUser();
      },
    }),
    [
      user,
      isInitialized,
      isLoading,
      error,
      login,
      register,
      logout,
      signInWithGoogle,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
