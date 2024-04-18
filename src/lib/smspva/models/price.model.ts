import type { Country, Service } from "../config";
import type { GetVirtualNumberDto } from "./virtualNumber.model";

export type GetServicePriceDto = GetVirtualNumberDto;

export type ServicePrice = {
  price: string;
  response: string;
  service: Service;
  country: Country["code"];
};
