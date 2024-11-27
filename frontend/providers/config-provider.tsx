"use client";

import { createContext, useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { configService } from "@/lib/services/config";
import type { AppConfig, ConfigContextType } from "@/types/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

// Constants
const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data: config,
    isLoading,
    error,
  } = useQuery<AppConfig>({
    queryKey: ["appConfig"],
    queryFn: configService.getConfig,
    enabled: isInitialized,
    retry: 1,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Memoized context value
  const contextValue = useMemo<ConfigContextType>(
    () => ({
      appConfig: config ?? null,
      isLoading: !isInitialized || isLoading,
      error: error instanceof Error ? error : null,
    }),
    [config, isInitialized, isLoading, error]
  );

  // Render error state if configuration fails
  if (error) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Service Unavailable</AlertTitle>
          <AlertDescription>
            Apologies for the inconvenience—technical issues are being
            addressed. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}
