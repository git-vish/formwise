// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = "v1";
const BASE_API_URL = `${API_BASE_URL}/${API_VERSION}`;

// Config Endpoint
export const CONFIG_URL = `${BASE_API_URL}/config`;

// Auth Endpoints
export const AUTH_URLS = {
  LOGIN: `${BASE_API_URL}/auth/login`,
  REGISTER: `${BASE_API_URL}/auth/register`,
  GOOGLE: `${BASE_API_URL}/auth/google`,
};

// User Endpoints
export const USER_URLS = {
  ME: `${BASE_API_URL}/users/me`,
};

// Form Endpoints
export const FORM_URLS = {
  BASE: `${BASE_API_URL}/forms`,
  BY_ID: (id: string) => `${BASE_API_URL}/forms/${id}`,
  CREATE: `${BASE_API_URL}/forms/generate`,
  SUBMIT: (id: string) => `${BASE_API_URL}/forms/${id}/submit`,
  RESPONSES: (id: string, limit: number, skip: number) => `
    ${BASE_API_URL}/forms/${id}/responses?limit=${limit}&skip=${skip}`,
};
