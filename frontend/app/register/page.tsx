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
// import { Checkbox } from "@/components/ui/checkbox";

import Logo from "@/components/layout/logo";

const registerSchema = z
  .object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(64, "Password must not exceed 64 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    // terms: z
    //   .boolean()
    //   .refine(
    //     (val) => val === true,
    //     "You must accept the terms and privacy policy"
    //   ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    // defaultValues: {
    //   terms: false,
    // },
  });

  const handleRegister = async (data: RegisterFormValues) => {
    try {
      // Here you would typically make an API call to your register endpoint
      console.log("Form data:", data);
    } catch (error) {
      console.error("Registration error:", error);
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
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleRegister)}
            className="grid gap-4"
          >
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
            {/* <div className="flex items-center space-x-2">
              <Checkbox id="terms" {...form.register("terms")} />
              <Label htmlFor="terms" className="text-sm">
                I accept the{" "}
                <Link href="#" className="underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline">
                  privacy policy
                </Link>
              </Label>
            </div>
            {form.formState.errors.terms && (
              <p className="text-sm text-destructive">
                {form.formState.errors.terms.message}
              </p>
            )} */}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Create account
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Sign up with Google
            </Button>
          </form>
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
