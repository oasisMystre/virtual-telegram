import { InjectAxios } from "../inject";
import type { GetVirtualNumberDto, V1, V2 } from "./models";

export class VirtualNumberV1 extends InjectAxios {
  getNumber(params: GetVirtualNumberDto) {
    return this.axios.get<V1.VirtualNumber>(
      this.buildQueryString({
        ...params,
        metod: "get_number",
      })
    );
  }

  getSMS(params: V1.GetVirtualNumberSMSDto) {
    return this.axios.get<V1.VirtualNumberSMS>(
      this.buildQueryString({
        ...params,
        metod: "get_sms",
      })
    );
  }

  denyNumber(params: V1.GetDenyVirtualNumber) {
    return this.axios.get<V1.VirtualNumber>(
      this.buildQueryString({
        ...params,
        metod: "denial",
      })
    );
  }
}

export class VirtualNumberV2 extends InjectAxios {
  getNumber(params: GetVirtualNumberDto) {
    return this.axios.get<V2.VirtualNumber>(
      this.buildPath("activation/number", params.country, params.service)
    );
  }

  getSMS(params: V2.GetVirtualNumberSMSDto) {
    return this.axios.get(this.buildPath("activation/sms", params.orderId));
  }

  denyNumber(params: V2.GetDenyVirtualNumberDto) {
    return this.axios.put<V2.Response<V2.VirtualNumberDeny>>(
      this.buildPath("activation/cancelorder", params.orderId)
    );
  }
}
