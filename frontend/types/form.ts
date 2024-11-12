export interface Form {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  status: "active" | "inactive";
  responses: number;
}
