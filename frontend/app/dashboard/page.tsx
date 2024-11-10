"use client";

import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/types/auth";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isLoading, error } = useAuth();

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to Dashboard
        </h1>

        {isLoading && <UserProfile.Skeleton />}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {user && <UserProfile user={user} />}
      </div>
    </main>
  );
}

function UserProfile({ user }: { user: User }) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage
              src={user.picture}
              alt={`${user.first_name} ${user.last_name}`}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-xl">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              Auth Provider: {user.auth_provider}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function UserProfileSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-6">
        <div className="flex flex-col items-center">
          <Skeleton className="h-20 w-20 rounded-full mb-4" />
          <div className="space-y-2 w-full max-w-[200px]">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

UserProfile.Skeleton = UserProfileSkeleton;
