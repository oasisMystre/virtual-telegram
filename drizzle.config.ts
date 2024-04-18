import "dotenv/config";
import type { Config } from "drizzle-kit";
import { dbConfig } from "./src/config";

export default {
  driver: "pg",
  out: "./drizzle",
  schema: "./src/schema.ts",
  dbCredentials: {
    host: dbConfig.host!,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database!,
    ssl: Boolean(dbConfig.ssl),
  },
} satisfies Config;
