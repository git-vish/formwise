"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tokenService } from "@/lib/services/token";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      setError("Authentication failed. Please try again.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    tokenService.token.set(token);
    router.push("/dashboard");
  }, [searchParams, router]);

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-4">
        <AlertDescription className="text-center">{error}</AlertDescription>
      </Alert>
    );
  }

  return <></>;
}

export default function GoogleCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Completing sign in...</span>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
