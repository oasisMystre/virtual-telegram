import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db } from "./src/connection";

export default migrate(db, { migrationsFolder: "./drizzle" });
