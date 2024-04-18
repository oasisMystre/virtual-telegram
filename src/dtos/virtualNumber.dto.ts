import { virtualNumbers } from "../schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const VirtualNumber = createSelectSchema(virtualNumbers);
export const PartialVirtualNumber = createInsertSchema(virtualNumbers);

export const SafePartialVirtualNumber = PartialVirtualNumber.omit({
  id: true,
  price: true,
  isCharged: true,
});
