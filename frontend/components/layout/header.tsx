"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "../theme-toggle";
import UserMenu from "@/components/auth/user-menu";

const EXCLUDED_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/f/",
  "/success",
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading: authLoading, updateUser } = useAuth();

  if (EXCLUDED_ROUTES.some((route) => pathname.startsWith(route))) {
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

  return (
    <header className="sticky top-0 w-full h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <nav className="container mx-auto h-full max-w-7xl px-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          {authLoading ? (
            <>
              <ThemeToggle />
              <UserMenu.Skeleton />
            </>
          ) : user ? (
            <>
              <ThemeToggle />
              <UserMenu
                user={user}
                onLogout={handleLogout}
                onUpdateUser={updateUser}
              />
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
