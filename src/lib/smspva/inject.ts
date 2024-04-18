import { smsPvaApiKey } from "../../config";
import type { AxiosInstance } from "axios";

export abstract class InjectAxios {
  private query: Record<string, any> = {
    apikey: smsPvaApiKey,
  };

  constructor(protected axios: AxiosInstance) {}

  protected buildQueryString(query: Record<string, any>) {
    const q = new URLSearchParams(Object.assign(query, this.query));
    return "?" + q.toString();
  }
}
