// TODO: refactor, define and use base type
export interface Form {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  accepting_responses: boolean;
  responses: number;
}

export interface FormOverview {
  id: string;
  title: string;
  is_active: boolean;
  response_count: number;
  created_at: string;
}
