"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/providers/query-provider";
import { ConfigProvider } from "@/providers/config-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { FormsProvider } from "@/providers/forms-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ConfigProvider>
          <AuthProvider>
            <FormsProvider>
              {children}
              <Toaster />
            </FormsProvider>
          </AuthProvider>
        </ConfigProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
