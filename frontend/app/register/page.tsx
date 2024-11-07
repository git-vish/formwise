"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { RegisterFormValues, registerSchema } from "@/lib/schemas";
import { AUTH_URLS } from "@/config/api-urls";
import { setToken, initiateGoogleAuth } from "@/lib/auth";
import { fetcher } from "@/lib/utils";
import { Token } from "@/lib/types";

export default function RegisterForm() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (formData: RegisterFormValues) => {
    const { status, data } = await fetcher<Token>({
      endpoint: AUTH_URLS.REGISTER,
      method: "POST",
      payload: {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
      },
    });

    if (status === 201 && data) {
      setToken(data.access_token);
      router.push("/dashboard");
    } else {
      const errorMessages = {
        409: "An account with this email already exists.",
      };
      const message =
        errorMessages[status as keyof typeof errorMessages] ||
        "Something went wrong. Please try again later.";
      toast({
        title: message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    initiateGoogleAuth();
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
              {...form.register("firstName")}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Ghatage"
              {...form.register("lastName")}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
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
          <Input id="password" type="password" {...form.register("password")} />
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
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || googleLoading}
        >
          {form.formState.isSubmitting
            ? "Creating account..."
            : "Create account"}
        </Button>
      </form>

      <GoogleAuthButton
        isLoading={googleLoading}
        onClick={handleGoogleSignUp}
        disabled={form.formState.isSubmitting || googleLoading}
        variant="register"
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
