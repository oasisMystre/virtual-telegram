import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import schema from "./schema";

export const createDb = (connection: ReturnType<typeof postgres>) => {
  return drizzle(connection, { schema });
};
export const connection = postgres(process.env.DATABASE_URL!);
export const db = createDb(connection);
