import { CONFIG_URL } from "@/config/api-urls";
import { Config } from "@/types/config";
import { apiRequest } from "@/lib/api";

export const configService = {
  async getConfig(): Promise<Config> {
    return apiRequest<Config>({
      endpoint: CONFIG_URL,
    });
  },
};
