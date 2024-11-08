"use client";

import Loader from "@/components/layout/loader";
import Logo from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { USER_URLS } from "@/config/api-urls";
import { removeToken } from "@/lib/auth";
import { User } from "@/lib/types";
import { fetcher } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetcher<User>({
          endpoint: USER_URLS.ME,
          method: "GET",
          authRequired: true,
        });
        setUser(response);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.reload();
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Logo />
      <h1 className="text-2xl font-bold text-center">Welcome to Dashboard</h1>
      {error ? (
        <Alert variant="destructive" className="max-w-md mx-4">
          <AlertDescription className="text-center">{error}</AlertDescription>
        </Alert>
      ) : (
        <h1 className="text-xl">
          {user?.first_name} {user?.last_name}
        </h1>
      )}
      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
      <ThemeToggle />
    </div>
  );
}
