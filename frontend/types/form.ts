export interface Form {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  accepting_responses: boolean;
  responses: number;
}
