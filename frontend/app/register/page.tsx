"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Logo from "@/components/layout/logo";
import { AUTH_URLS } from "@/config/api-urls";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(20, "Max 20 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(20, "Max 20 characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(64, "Password must not exceed 64 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (fromData: RegisterFormValues) => {
    try {
      const res = await fetch(AUTH_URLS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fromData.email,
          first_name: fromData.firstName,
          last_name: fromData.lastName,
          password: fromData.password,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("An account with this email already exists.");
        } else {
          const error = await res.json();
          throw new Error(
            error.detail || "Something went wrong. Please try again later."
          );
        }
      }

      const data = await res.json();
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center px-4 space-y-6">
      <Logo />
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={form.handleSubmit(handleRegister)}
            className="grid gap-4"
          >
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
              <Input
                id="password"
                type="password"
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
                type="text"
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
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Creating account..."
                : "Create account"}
            </Button>
          </form>
          <Button
            variant="outline"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            <Icons.google className="h-5 w-5" />
            <span>Sign up with Google</span>
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
