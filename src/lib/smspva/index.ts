import axios from "axios";

import Price from "./price";
import VirtualNumber from "./virtualNumber";
import { Micellenous } from "./micellenous";

export class SMSPVA {
  readonly price: Price;
  readonly virtualNumber: VirtualNumber;
  readonly micellenous: Micellenous;

  constructor() {
    const axiosInstance = axios.create({
      baseURL: "https://smspva.com/priemnik.php",
    });

    this.price = new Price(axiosInstance);
    this.virtualNumber = new VirtualNumber(axiosInstance);
    this.micellenous = new Micellenous(
      axios.create({
        baseURL: "https://api.smspva.com/",
        headers: {
          apiKey: process.env.SMS_PVA_API_KEY,
        },
      })
    );
  }

  static #instance: SMSPVA;

  static get instance() {
    if (!this.#instance) this.#instance = new SMSPVA();

    return this.#instance;
  }
}
