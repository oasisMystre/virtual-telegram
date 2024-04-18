import type { Country, Service } from "../config";

export interface VirtualNumber {
  id: number;
  again: number;
  extra: string | null;
  response: string;
  number: string;
  othersms: string[];
  sms: string | null;
  text: string | null;
  countryCode: string;
  service: Service | null;
  karma: number;
  country: Country["code"];
  branchId: number;
  lifeSpan: number;
  balanceOnPhone: number;
  callForwarding: boolean;
  pass: string;
  goipSlotId: number;
}

export type VirtualNumberSMS = Pick<
  VirtualNumber,
  | "id"
  | "number"
  | "text"
  | "extra"
  | "karma"
  | "pass"
  | "sms"
  | "balanceOnPhone"
> & {
  sms: string | null;
};

export interface GetVirtualNumberDto {
  country: Country["code"];
  service: string;
}

export interface GetVirtualNumberSMSDto extends GetVirtualNumberDto {
  id: string;
}

export interface GetDenyVirtualNumber extends GetVirtualNumberSMSDto {}
