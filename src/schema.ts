import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  lastName: text("last_name"),
  firstName: text("first_name").notNull(),
  username: text("username").unique().notNull(),
  isVerified: boolean("is_verified").default(false),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  chain: text("chain", { enum: ["ETH"] }).notNull(),
  privateKey: text("private_key").unique().notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
});

export const charges = pgTable("charges", {
  id: serial("id").primaryKey(),
  price: bigint("price", { mode: "number" }).notNull(),
  isCharged: boolean("is_charged").default(false).notNull(),
});

export const virtualNumbers = pgTable("virtual_numbers", {
  id: text("id").primaryKey(),
  jsonData: json("json_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  chargeId: serial("charge_id").references(() => charges.id, {
    onDelete: "set null",
  }),
});

export const supportTickers = pgTable("support_ticker", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  wallet: many(wallets),
  tickers: many(supportTickers),
}));

export const virtualNumberRelations = relations(virtualNumbers, ({ one }) => ({
  user: one(users, {
    references: [users.id],
    fields: [virtualNumbers.userId],
  }),
  charge: one(charges, {
    references: [charges.id],
    fields: [virtualNumbers.chargeId],
  }),
}));

export const chargeRelations = relations(charges, ({ many }) => ({
  virtualNumber: many(virtualNumbers),
}));

export const walletRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    references: [users.id],
    fields: [wallets.userId],
  }),
}));

export const supportTickerRelations = relations(supportTickers, ({ one }) => ({
  user: one(users, {
    references: [users.id],
    fields: [supportTickers.userId],
  }),
}));

export default {
  users,
  wallets,
  charges,
  virtualNumbers,
  supportTickers,
  userRelations,
  walletRelations,
  chargeRelations,
  virtualNumberRelations,
};
