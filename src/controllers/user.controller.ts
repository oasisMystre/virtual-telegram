import type { z } from "zod";

import { db } from "../connection";
import { users } from "../schema";
import type { PartialUser } from "../dtos";

export const findOrCreateUser = (values: z.infer<typeof PartialUser>) => {
  return db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({ target: users.id, set: { id: values.id } })
    .returning()
    .execute();
};
