import { InjectAxios } from "../inject";
import type { GetServicePriceDto, ServicePrice } from "./models";

export default class PriceMethod extends InjectAxios {
  getServicePrice(params: GetServicePriceDto) {
    return this.axios.get<ServicePrice>(
      this.buildQueryString({
        ...params,
        metod: "get_service_price",
      })
    );
  }
}
