"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { LoginFormValues, loginSchema } from "@/lib/schemas";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (formData: LoginFormValues) => {
    await login(formData);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signInWithGoogle();
  };

  return (
    <AuthCard
      title="Login"
      description="Enter your email below to login to your account"
    >
      <form onSubmit={form.handleSubmit(handleLogin)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || googleLoading}
        >
          {form.formState.isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>

      <GoogleAuthButton
        isLoading={googleLoading}
        onClick={handleGoogleLogin}
        disabled={form.formState.isSubmitting || googleLoading}
        variant="login"
      />

      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">
          Sign up
        </Link>
      </div>
    </AuthCard>
  );
}
