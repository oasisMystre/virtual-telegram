import axios, { type AxiosInstance } from "axios";
import { VirtualEmail } from "./virtualEmail";

export class GmailNator {
  private axios: AxiosInstance;
  readonly virtualEmail: VirtualEmail;

  constructor() {
    this.axios = axios.create({
      baseURL: "https://gmailnator.p.rapidapi.com",
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY!,
        "X-RapidAPI-Host": "gmailnator.p.rapidapi.com",
      },
    });

    this.virtualEmail = new VirtualEmail(this.axios);
  }

  static #instance: GmailNator;

  static get instance() {
    if (!GmailNator.#instance) GmailNator.#instance = new GmailNator();

    return GmailNator.#instance;
  }
}
