import type { Form, FormOverview } from "@/types/form";
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
};
