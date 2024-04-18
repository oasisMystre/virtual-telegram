import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { users } from "../schema";

export const User = createSelectSchema(users);
export const PartialUser = createInsertSchema(users);
