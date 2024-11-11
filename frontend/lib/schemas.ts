import { z } from "zod";

// Base schemas
const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(64, "Password must not exceed 64 characters");

const optionalPasswordSchema = z
  .string()
  .max(64, "Password must not exceed 64 characters")
  .optional()
  .refine((value) => !value || value.length >= 6, {
    message: "Password must be at least 6 characters",
  });

const firstNameSchema = z
  .string()
  .min(1, "First name is required")
  .max(20, "Max 20 characters");

const lastNameSchema = z
  .string()
  .min(1, "Last name is required")
  .max(20, "Max 20 characters");

// Form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    first_name: firstNameSchema,
    last_name: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const editProfileSchema = z
  .object({
    first_name: firstNameSchema.optional(),
    last_name: lastNameSchema.optional(),
    password: optionalPasswordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Types
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
