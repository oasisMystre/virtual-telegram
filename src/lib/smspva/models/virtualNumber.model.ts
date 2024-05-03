import { HttpStatusCode } from "axios";
import type { Country, CountryCode, Service } from "../config";

export interface GetVirtualNumberDto {
  country: Country["code"];
  service: string;
}

export namespace V1 {
  export interface VirtualNumber {
    id: number;
    again: number;
    extra: string | null;
    response: string;
    number: string;
    othersms: string[];
    sms: string | null;
    text: string | null;
    CountryCode: string;
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

  export interface GetVirtualNumberSMSDto extends GetVirtualNumberDto {
    id: string;
  }

  export interface GetDenyVirtualNumber extends GetVirtualNumberSMSDto {}
}

export namespace V2 {
  export interface Response<T> {
    status: HttpStatusCode;
    data: T;
  }

  export interface VirtualNumber {
    orderId: string;
    phoneNumber: string;
    countryCode: CountryCode;
    orderExpireIn: number;
  }

  export type VirtualNumberSMS = {
    sms: {
      code: string;
      fullText: string;
    };
    orderId: string;
    orderExpireIn: number;
  };

  export type VirtualNumberDeny = Pick<VirtualNumber, "orderId">;

  export interface GetVirtualNumberSMSDto {
    orderId: string;
  }

  export interface GetDenyVirtualNumberDto {
    orderId: string,
  }
}
