import { z } from "zod";
import type { Form } from "@/types/form";
import type { DateField, Field, NumberField } from "@/types/field";

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

export const createFormSchema = z.object({
  title: z
    .string()
    .max(100, "Title cannot exceed 100 characters")
    .optional()
    .refine((title) => !title || title.trim().length > 0, {
      message: "Title cannot be empty",
    }),
  prompt: z
    .string()
    .min(50, "Prompt must be at least 50 characters")
    .max(500, "Prompt cannot exceed 500 characters")
    .refine((prompt) => prompt.trim().length > 50, {
      message: "Prompt must be at least 50 characters",
    }),
});

// Types
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
export type CreateFormFormValues = z.infer<typeof createFormSchema>;

// Generate dynamic form schemas
export function generateFormwiseSchema(form: Form) {
  const schema: Record<string, z.ZodTypeAny> = {};

  form.fields.forEach((field: Field) => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "text":
      case "paragraph":
        fieldSchema = z
          .string()
          .min(
            field.min_length,
            `Minimum ${field.min_length} characters required`
          )
          .max(
            field.max_length,
            `Maximum ${field.max_length} characters allowed`
          );
        break;
      case "select":
      case "dropdown":
        fieldSchema = z.enum(field.options as [string, ...string[]]);
        break;
      case "multi_select":
        fieldSchema = z.array(z.string()).min(1, "Select at least one option");
        break;
      case "date":
        fieldSchema = z.date();
        if ((field as DateField).min_date) {
          fieldSchema = (fieldSchema as z.ZodDate).min(
            new Date((field as DateField).min_date!),
            "Date is too early"
          );
        }
        if ((field as DateField).max_date) {
          fieldSchema = (fieldSchema as z.ZodDate).max(
            new Date((field as DateField).max_date!),
            "Date is too late"
          );
        }
        break;
      case "email":
        fieldSchema = z.string().email("Invalid email address");
        break;
      case "number":
        fieldSchema = z.number();
        if ((field as NumberField).min_value !== null) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(
            (field as NumberField).min_value!,
            `Minimum value is ${(field as NumberField).min_value}`
          );
        }
        if ((field as NumberField).max_value !== null) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(
            (field as NumberField).max_value!,
            `Maximum value is ${(field as NumberField).max_value}`
          );
        }
        break;
      case "url":
        fieldSchema = z.string().url("Invalid URL");
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      if (
        field.type === "text" ||
        field.type === "paragraph" ||
        field.type === "email" ||
        field.type === "url"
      ) {
        fieldSchema = (fieldSchema as z.ZodString).min(
          1,
          `${field.label} is required`
        );
      } else {
        fieldSchema = z
          .union([fieldSchema, z.undefined()])
          .refine((val) => val !== undefined, {
            message: `${field.label} is required`,
          });
      }
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schema[field.tag] = fieldSchema;
  });

  return z.object(schema);
}
