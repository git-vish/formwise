export interface Config {
  max_forms: number;
  max_fields: number;
  max_responses: number;
}

export interface ConfigContextType {
  config: Config | null;
  isLoading: boolean;
  error: Error | null;
}
