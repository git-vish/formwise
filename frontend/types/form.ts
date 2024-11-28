import { Field } from "./field";

interface BaseForm {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

export interface FormOverview extends BaseForm {
  response_count: number;
}

export interface FormsContextType {
  forms: FormOverview[];
  isLoading: boolean;
  error: Error | null;
  refreshForms: () => Promise<void>;
}

export interface Form extends BaseForm {
  description: string | null;
  fields: Field[];
  creator: {
    first_name: string;
    last_name: string;
    email: string;
  };
  // Add optional properties for FormRead (creator) model when implemented
}
