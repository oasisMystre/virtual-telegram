import { relations } from "drizzle-orm";
import {
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
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  chain: text("chain", { enum: ["ETH"] }).notNull(),
  privateKey: text("private_key").unique().notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});

export const virtualNumbers = pgTable("virtual_numbers", {
  id: text("id").primaryKey(),
  price: integer("price").notNull(),
  jsonData: json("json_data").notNull(),
  isCharged: boolean("is_charged").default(false).notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  virtualNumbers,
  supportTickers,
  userRelations,
  walletRelations,
  virtualNumberRelations,
};
