"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/toaster";

import dynamic from "next/dynamic";

const QueryProvider = dynamic(
  () => import("@/providers/query-provider").then((mod) => mod.QueryProvider),
  { ssr: false }
);

const ConfigProvider = dynamic(
  () => import("@/providers/config-provider").then((mod) => mod.ConfigProvider),
  { ssr: false }
);

const AuthProvider = dynamic(
  () => import("@/providers/auth-provider").then((mod) => mod.AuthProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ConfigProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ConfigProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
