import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getToken } from "./auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FetchParams = {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  payload?: unknown;
  customHeaders?: Record<string, string>;
  authRequired?: boolean;
};

type FetchResult<T> = {
  status: number;
  data: T | null;
};

export async function fetcher<T>({
  endpoint,
  method = "GET",
  payload = undefined,
  customHeaders = {},
  authRequired = false,
}: FetchParams): Promise<FetchResult<T>> {
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
        ...(authRequired ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    };

    const response = await fetch(endpoint, fetchOptions);
    const data = await response.json();

    return {
      status: response.status,
      data: response.ok ? data : null,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      data: null,
    };
  }
}
