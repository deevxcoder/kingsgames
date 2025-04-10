import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: doublePrecision("balance").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
});

// Markets (e.g., Mumbai Matka, Kalyan Matka)
export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isOpen: boolean("is_open").notNull().default(true),
  closingTime: timestamp("closing_time"),
  lastResult: text("last_result"),
  lastResultTimestamp: timestamp("last_result_timestamp"),
  createdBy: integer("created_by").references(() => users.id),
});

// Game Types (Jodi, Odd-Even, Hurf, Cross)
export const gameTypes = pgTable("game_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  odds: doublePrecision("odds").notNull(),
});

// Market Game Types (relation table)
export const marketGameTypes = pgTable("market_game_types", {
  id: serial("id").primaryKey(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  gameTypeId: integer("game_type_id").references(() => gameTypes.id).notNull(),
  odds: doublePrecision("odds").notNull(),
});

// Bets
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  gameTypeId: integer("game_type_id").references(() => gameTypes.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  selection: text("selection").notNull(), // Store as string (e.g., "57" for Jodi, "Odd" for Odd-Even)
  potentialWin: doublePrecision("potential_win").notNull(),
  result: text("result"),
  status: text("status").notNull().default("pending"), // pending, won, lost
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // deposit, withdraw, bet, win
  description: text("description"),
  betId: integer("bet_id").references(() => bets.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coin Toss Results
export const coinTossResults = pgTable("coin_toss_results", {
  id: serial("id").primaryKey(),
  result: text("result").notNull(), // heads, tails
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertMarketSchema = createInsertSchema(markets).pick({
  name: true,
  isOpen: true,
  closingTime: true,
  createdBy: true,
});

export const insertGameTypeSchema = createInsertSchema(gameTypes).pick({
  name: true,
  description: true,
  odds: true,
});

export const insertMarketGameTypeSchema = createInsertSchema(marketGameTypes).pick({
  marketId: true,
  gameTypeId: true,
  odds: true,
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  marketId: true,
  gameTypeId: true,
  amount: true,
  selection: true,
  potentialWin: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  description: true,
  betId: true,
});

export const insertCoinTossResultSchema = createInsertSchema(coinTossResults).pick({
  result: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type Market = typeof markets.$inferSelect;

export type InsertGameType = z.infer<typeof insertGameTypeSchema>;
export type GameType = typeof gameTypes.$inferSelect;

export type InsertMarketGameType = z.infer<typeof insertMarketGameTypeSchema>;
export type MarketGameType = typeof marketGameTypes.$inferSelect;

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertCoinTossResult = z.infer<typeof insertCoinTossResultSchema>;
export type CoinTossResult = typeof coinTossResults.$inferSelect;
