import type { Form, FormCreateValues, FormOverview } from "@/types/form";
import { apiRequest } from "@/lib/api";
import { FORM_URLS } from "@/config/api-urls";

export const formService = {
  async getForms(): Promise<FormOverview[]> {
    return await apiRequest<FormOverview[]>({
      endpoint: FORM_URLS.BASE,
      requireAuth: true,
    });
  },

  async getForm(id: string): Promise<Form> {
    return await apiRequest<Form>({
      endpoint: FORM_URLS.BY_ID(id),
    });
  },

  async deleteForm(id: string): Promise<void> {
    return await apiRequest<void>({
      endpoint: FORM_URLS.BY_ID(id),
      method: "DELETE",
      requireAuth: true,
    });
  },

  async createForm(data: FormCreateValues): Promise<Form> {
    return await apiRequest<Form>({
      endpoint: FORM_URLS.CREATE,
      method: "POST",
      payload: data,
      requireAuth: true,
      errorMessages: {
        // use non tech user friendly messages
        429: "Request limit reached. Try again shortly.",
      },
    });
  },
};
