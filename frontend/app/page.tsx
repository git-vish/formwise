"use client";

import HomePage from "@/components/home-page";
import Console from "@/components/console";
import { useEffect, useState, useCallback } from "react";
import { isTokenValid } from "@/lib/auth";

export default function Home() {
  const [authState, setAuthState] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");

  // Memoized authentication check function
  const checkAuth = useCallback(() => {
    const isValid = isTokenValid();
    setAuthState(isValid ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    // Initial authentication check
    checkAuth();

    // Event listeners for visibility and focus changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    const handleFocus = () => {
      checkAuth();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkAuth]);

  if (authState === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return authState === "authenticated" ? <Console /> : <HomePage />;
}
