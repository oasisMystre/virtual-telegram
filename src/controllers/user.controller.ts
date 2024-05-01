import type { z } from "zod";
import { ethers } from "ethers";

import { db } from "../connection";
import { users, wallets } from "../schema";
import type { PartialUser } from "../dtos";

export const findOrCreateUser = async (values: z.infer<typeof PartialUser>) => {
  const update: Partial<z.infer<typeof PartialUser>> = {};

  if (values.isVerified) update.isVerified = values.isVerified;

  const [user] = await db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({
      target: users.id,
      set: { id: values.id, ...update },
    })
    .returning()
    .execute();

  ///  ignored and won't be needed if wallet
  const { privateKey } = ethers.Wallet.createRandom();
  const [wallet] = await db
    .insert(wallets)
    .values({
      privateKey,
      chain: "ETH",
      userId: user.id,
    })
    .onConflictDoUpdate({ target: [wallets.userId], set: { userId: user.id } })
    .returning()
    .execute();

  return { user, wallet };
};
