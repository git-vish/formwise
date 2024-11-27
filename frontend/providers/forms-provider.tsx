"use client";

import { formService } from "@/lib/services/form";
import { FormOverview, FormsContextType } from "@/types/form";
import { useQuery } from "@tanstack/react-query";
import { createContext, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";

// Constants
const FORMS_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const FormsContext = createContext<FormsContextType | null>(null);

export function FormsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();

  // Forms query
  const {
    data: forms,
    isLoading,
    error,
    refetch: refreshForms,
  } = useQuery<FormOverview[]>({
    queryKey: ["forms"],
    queryFn: formService.getForms,
    enabled: user !== null,
    retry: false,
    staleTime: FORMS_STALE_TIME,
  });

  // Memoized context value
  const contextValue = useMemo<FormsContextType>(
    () => ({
      forms: forms ?? [],
      isLoading: authLoading || isLoading,
      error: error instanceof Error ? error : null,
      refreshForms: async () => {
        await refreshForms();
      },
    }),
    [forms, authLoading, isLoading, error, refreshForms]
  );

  return (
    <FormsContext.Provider value={contextValue}>
      {children}
    </FormsContext.Provider>
  );
}
