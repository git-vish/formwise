import { Suspense } from "react";
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormSkeleton />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterFormSkeleton() {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center px-4 space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-muted rounded" />
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
