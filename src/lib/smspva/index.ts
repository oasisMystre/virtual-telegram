import axios from "axios";

import Price from "./price";
import { VirtualNumberV1, VirtualNumberV2 } from "./virtualNumber";
import { Micellenous } from "./micellenous";

export class SMSPVA {
  readonly price: Price;
  readonly micellenous: Micellenous;
  readonly virtualNumber: VirtualNumberV1;

  constructor() {
    const axiosInstanceV1 = axios.create({
      baseURL: "https://smspva.com/priemnik.php",
    });

    const axiosInstanceV2 = axios.create({
      baseURL: "https://api.smspva.com/",
      headers: {
        apiKey: process.env.SMS_PVA_API_KEY,
      },
    });

    this.price = new Price(axiosInstanceV1);
    this.micellenous = new Micellenous(axiosInstanceV2);
    this.virtualNumber = new VirtualNumberV1(axiosInstanceV1);
  }

  static #instance: SMSPVA;

  static get instance() {
    if (!this.#instance) this.#instance = new SMSPVA();

    return this.#instance;
  }
}
