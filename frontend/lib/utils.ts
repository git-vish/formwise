import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { tokenService } from "./services/token";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FetchParams = {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  payload?: unknown;
  customHeaders?: Record<string, string>;
  authRequired?: boolean;
  errorMessages?: Record<number, string>;
};

export async function fetcher<T>({
  endpoint,
  method = "GET",
  payload = undefined,
  customHeaders = {},
  authRequired = false,
  errorMessages = {},
}: FetchParams): Promise<T> {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
      ...(authRequired
        ? { Authorization: `Bearer ${tokenService.token.get()}` }
        : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  };

  const response = await fetch(endpoint, fetchOptions);

  if (!response.ok) {
    const data = await response.json();
    const errorMessage =
      errorMessages[response.status as keyof typeof errorMessages] ||
      data.detail ||
      "Something went wrong. Please try again later.";
    throw new Error(errorMessage);
  }

  return response.json();
}
