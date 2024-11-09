"use client";

import { useAuth } from "@/hooks/use-auth";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isLoading, error, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Logo />
      <h1 className="text-2xl font-bold text-center">Welcome to Dashboard</h1>

      {isLoading && <UserCard.Skeleton />}

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

function UserCardSkeleton() {
  return (
    <Card className="max-w-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32" />
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </CardFooter>
    </Card>
  );
}
UserCard.Skeleton = UserCardSkeleton;
