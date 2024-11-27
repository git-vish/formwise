export interface AppConfig {
  max_forms: number;
  max_fields: number;
  max_responses: number;
}

export interface ConfigContextType {
  appConfig: AppConfig | null;
  isLoading: boolean;
  error: Error | null;
}
