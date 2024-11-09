"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/toaster";

import dynamic from "next/dynamic";

const QueryProvider = dynamic(
  () => import("@/providers/query-provider").then((mod) => mod.QueryProvider),
  { ssr: false }
);

const AuthProvider = dynamic(
  () => import("@/providers/auth-provider").then((mod) => mod.AuthProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
