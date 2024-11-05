"use client";

import Logo from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { USER_URLS } from "@/config/api-urls";
import { getToken, removeToken } from "@/lib/auth";
import { User } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(USER_URLS.ME, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Logo />
      <h1 className="text-2xl font-bold text-center">Welcome to Dashboard</h1>
      <h1 className="text-xl">{user?.email}</h1>
      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
      <ThemeToggle />
    </div>
  );
}
