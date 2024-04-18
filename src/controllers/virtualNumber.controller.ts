import type { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "../connection";
import { virtualNumbers } from "../schema";
import type {
  PartialVirtualNumber,
  SafePartialVirtualNumber,
  VirtualNumber,
} from "../dtos";

export const createVirtualNumber = (
  values: z.infer<typeof PartialVirtualNumber>
) => {
  return db.insert(virtualNumbers).values(values).returning();
};

export const updateVirtualNumber = (
  id: z.infer<typeof VirtualNumber>["id"],
  values: Partial<z.infer<typeof SafePartialVirtualNumber>>
) => {
  return db
    .update(virtualNumbers)
    .set(values)
    .where(eq(virtualNumbers.id, id))
    .returning()
    .execute();
};
