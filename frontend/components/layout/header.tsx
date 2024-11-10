"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import Logo from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "../theme-toggle";
import { Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const AuthPages = new Set(["/login", "/register", "/forgot-password"]);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading: authLoading } = useAuth();

  // Hide header on auth pages
  if (AuthPages.has(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      logout();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (authLoading) {
    return (
      <header className="sticky top-0 w-full h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <nav className="container mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Skeleton className="w-20 h-9" />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 w-full h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <nav className="container mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="outline"
                className="min-w-[80px]"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Logging out</span>
                  </>
                ) : (
                  "Logout"
                )}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="default" className="ml-2">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
