"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import Loader from "@/components/layout/loader";
import Logo from "@/components/layout/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { User } from "@/types/auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading, error, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("User:", user);
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Logo />
      <h1 className="text-2xl font-bold text-center">Welcome to Dashboard</h1>

      {user && <UserCard user={user} onLogout={logout} />}

      {error && (
        <Alert variant="destructive" className="max-w-md mx-4">
          <AlertDescription className="text-center">
            {error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function UserCard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  console.log("Picture:", user.picture);

  return (
    <Card className="max-w-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="relative h-16 w-16">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.picture}
              alt={`${user.first_name} ${user.last_name}`}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{`${user.first_name} ${user.last_name}`}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Auth Provider: {user.auth_provider}</p>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button variant="outline" onClick={onLogout} className="flex-1">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
        <ThemeToggle />
      </CardFooter>
    </Card>
  );
}
