import { tokenService } from "@/lib/services/token";

interface RequestParams {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  payload?: unknown;
  requireAuth?: boolean;
  errorMessages?: Record<number, string>;
}

export async function apiRequest<T>({
  endpoint,
  method = "GET",
  payload = undefined,
  requireAuth = false,
  errorMessages = {},
}: RequestParams): Promise<T> {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(requireAuth
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

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
