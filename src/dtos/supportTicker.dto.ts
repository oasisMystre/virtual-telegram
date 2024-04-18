import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { supportTickers } from "../schema";

export const SupportTicker = createSelectSchema(supportTickers);
export const PartialSupportTicker = createInsertSchema(supportTickers);
