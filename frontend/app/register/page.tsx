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
import { RegisterFormValues, registerSchema } from "@/lib/schemas";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, signInWithGoogle } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const isSubmitting = form.formState.isSubmitting || googleLoading;

  const handleRegister = async (formData: RegisterFormValues) => {
    await register({
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
    });
  };

  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    signInWithGoogle();
  };

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <form onSubmit={form.handleSubmit(handleRegister)} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="Vishwajeet"
              disabled={isSubmitting}
              {...form.register("first_name")}
            />
            {form.formState.errors.first_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.first_name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Ghatage"
              disabled={isSubmitting}
              {...form.register("last_name")}
            />
            {form.formState.errors.last_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.last_name.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            disabled={isSubmitting}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            disabled={isSubmitting}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            disabled={isSubmitting}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {form.formState.isSubmitting
            ? "Creating account..."
            : "Create account"}
        </Button>
      </form>

      <GoogleAuthButton
        isLoading={googleLoading}
        onClick={handleGoogleSignUp}
        disabled={isSubmitting}
      />

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </div>
    </AuthCard>
  );
}
