import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { wallets } from "../schema";

export const Wallet = createSelectSchema(wallets);
export const PartialWallet = createInsertSchema(wallets);
