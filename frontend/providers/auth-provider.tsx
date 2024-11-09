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
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

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
        await refreshUser();
        router.push("/dashboard");
      } catch (err) {
        toast({
          title: (err as Error).message,
          variant: "destructive",
        });
      }
    },
    [refreshUser, router, toast]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        const { access_token: token } = await authService.register(credentials);
        setToken(token);
        await refreshUser();
        router.push("/dashboard");
      } catch (err) {
        toast({
          title: (err as Error).message,
          variant: "destructive",
        });
      }
    },
    [refreshUser, router, toast]
  );

  const signInWithGoogle = useCallback(() => {
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
    signInWithGoogle,
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
