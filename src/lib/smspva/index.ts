import { xior, type XiorInstance } from "xior";

import Price from "./price";
import VirtualNumber from "./virtualNumber";

export class SMSPVA {
  readonly price: Price;
  readonly virtualNumber: VirtualNumber;

  constructor() {
    const xiorInstance = xior.create({
      baseURL: "https://smspva.com/priemnik.php",
    });

    this.price = new Price(xiorInstance);
    this.virtualNumber = new VirtualNumber(xiorInstance);
  }

  static #instance: SMSPVA;

  static get instance() {
    if (!this.#instance) this.#instance = new SMSPVA();

    return this.#instance;
  }
}

