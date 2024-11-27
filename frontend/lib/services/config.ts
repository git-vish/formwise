import { CONFIG_URL } from "@/config/api-urls";
import { AppConfig } from "@/types/config";
import { apiRequest } from "@/lib/api";

export const configService = {
  async getConfig(): Promise<AppConfig> {
    return await apiRequest<AppConfig>({
      endpoint: CONFIG_URL,
    });
  },
};
