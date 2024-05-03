import { InjectAxios } from "../inject";


import { CountryInfo } from "./models";

import { Service } from "./config";
import countries, { Country } from "./config/countries";

export class Micellenous extends InjectAxios {
  async getCountriesInfo(service: Service) {
    const formData = new FormData();
    formData.set("method", "GET_AMOUNT_AND_CONVERSATIONS_BY_SERVICE");
    formData.set("service", service);

    const { data } = await this.axios.post<CountryInfo>(
      "https://smspva.com/sms_api/orders.php?n=10-3",
      formData
    );

    return data.data;
  }

  async getActiveCountries(service: Service = Service.TELEGRAM) {
    const countriesInfo = await this.getCountriesInfo(service);
    return Object.entries(countriesInfo.amount)
      .filter(([, value]) => {
        return Object.values(value).reduceRight((a, b) => a + b, 0) > 0;
      })
      .map(([key]) => {
        return countries.find(({ code }) => code === key);
      })
      .filter(Boolean) as Country[];
  }
}
