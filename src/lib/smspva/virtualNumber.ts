import { InjectAxios } from "../inject";
import type {
  GetDenyVirtualNumber,
  GetVirtualNumberDto,
  GetVirtualNumberSMSDto,
  VirtualNumber,
  VirtualNumberSMS,
} from "./models";

export default class VirtualNumberMethod extends InjectAxios {
  getNumber(params: GetVirtualNumberDto) {
    return this.axios.get<VirtualNumber>(
      this.buildQueryString({
        ...params,
        metod: "get_number",
      })
    );
  }

  getSMS(params: GetVirtualNumberSMSDto) {
    return this.axios.get<VirtualNumberSMS>(
      this.buildQueryString({
        ...params,
        metod: "get_sms",
      })
    );
  }

  denyNumber(params: GetDenyVirtualNumber) {
    return this.axios.get<VirtualNumber>(
      this.buildQueryString({
        ...params,
        metod: "denial",
      })
    );
  }
}
