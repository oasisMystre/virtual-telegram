import { Wallet } from "ethers";

import { db } from "../connection";
import { charges } from "../schema";

import { SMSPVA } from "../lib/smspva";
import { Country, Service } from "../lib/smspva/config";


type CreateChargeParams = {
  service: Service;
  country: Country;
  wallet: Wallet;
};

export const createCharge = async function ({
  service,
  country,
}: CreateChargeParams) {
  const { data: price } = await SMSPVA.instance.price.getServicePrice({
    service,
    country: country.code,
  });

  return db
    .insert(charges)
    .values({
      price: Number(price.price),
    })
    .returning()
    .execute();
};
