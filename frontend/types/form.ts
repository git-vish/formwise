export interface FormOverview {
  id: string;
  title: string;
  is_active: boolean;
  response_count: number;
  created_at: string;
}

export interface FormsContextType {
  forms: FormOverview[];
  isLoading: boolean;
  error: Error | null;
  refreshForms: () => Promise<void>;
}
