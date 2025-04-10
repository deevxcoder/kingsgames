import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("1000").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Market schema
export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  openTime: text("open_time").notNull(), // Format: HH:MM
  closeTime: text("close_time").notNull(), // Format: HH:MM
  lastResult: text("last_result"),
  lastResultTime: timestamp("last_result_time"),
});

export const insertMarketSchema = createInsertSchema(markets).pick({
  name: true,
  isOpen: true,
  openTime: true,
  closeTime: true,
});

// Game types
export const gameTypes = pgTable("game_types", {
  id: serial("id").primaryKey(),
  marketId: integer("market_id").notNull(),
  type: text("type").notNull(), // "jodi", "hurf", "cross", "odd-even"
  odds: decimal("odds", { precision: 10, scale: 2 }).notNull(),
  doubleMatchOdds: decimal("double_match_odds", { precision: 10, scale: 2 }), // For Hurf game
});

export const insertGameTypeSchema = createInsertSchema(gameTypes).pick({
  marketId: true,
  type: true,
  odds: true,
  doubleMatchOdds: true,
});

// Team Matches schema
export const teamMatches = pgTable("team_matches", {
  id: serial("id").primaryKey(),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  matchDate: timestamp("match_date").notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  openTime: text("open_time").notNull(), // Format: HH:MM
  closeTime: text("close_time").notNull(), // Format: HH:MM
  oddsTeamA: decimal("odds_team_a", { precision: 10, scale: 2 }).notNull(),
  oddsTeamB: decimal("odds_team_b", { precision: 10, scale: 2 }).notNull(),
  result: text("result"), // "teamA", "teamB"
  image: text("image").default("default-match.jpg"), // Image cover for the match
  category: text("category").default("cricket"), // cricket, football, etc.
});

export const insertTeamMatchSchema = createInsertSchema(teamMatches).pick({
  teamA: true,
  teamB: true,
  matchDate: true,
  isOpen: true,
  openTime: true,
  closeTime: true,
  oddsTeamA: true,
  oddsTeamB: true,
  image: true,
  category: true,
});

// Bets schema
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  marketId: integer("market_id"), // For sattamatka bets
  matchId: integer("match_id"), // For team match bets
  gameType: text("game_type").notNull(), // "coin-toss", "jodi", "hurf", "cross", "odd-even", "team-match"
  betAmount: decimal("bet_amount", { precision: 10, scale: 2 }).notNull(),
  selection: text("selection").notNull(), // "heads", "tails", "00-99" for jodi, "teamA", "teamB" for team matches
  odds: decimal("odds", { precision: 10, scale: 2 }).notNull(),
  result: text("result"),
  winAmount: decimal("win_amount", { precision: 10, scale: 2 }),
  status: text("status").default("pending").notNull(), // "pending", "won", "lost"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  result: true,
  winAmount: true,
  status: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Market = typeof markets.$inferSelect;
export type InsertMarket = z.infer<typeof insertMarketSchema>;

export type GameType = typeof gameTypes.$inferSelect;
export type InsertGameType = z.infer<typeof insertGameTypeSchema>;

export type TeamMatch = typeof teamMatches.$inferSelect;
export type InsertTeamMatch = z.infer<typeof insertTeamMatchSchema>;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

// Custom schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const coinTossBetSchema = z.object({
  betAmount: z.number().min(1, "Bet amount must be at least 1"),
  selection: z.enum(["heads", "tails"], {
    required_error: "You must select heads or tails",
  }),
});

export const sattamatkaBetSchema = z.object({
  marketId: z.number(),
  gameType: z.enum(["jodi", "hurf", "cross", "odd-even"]),
  betAmount: z.number().min(1, "Bet amount must be at least 1"),
  selection: z.string(),
});

export const teamMatchBetSchema = z.object({
  matchId: z.number(),
  betAmount: z.number().min(1, "Bet amount must be at least 1"),
  selection: z.enum(["teamA", "teamB"], {
    required_error: "You must select a team",
  }),
});

export const declareResultSchema = z.object({
  marketId: z.number(),
  result: z.string(),
});

export const declareMatchResultSchema = z.object({
  matchId: z.number(),
  result: z.enum(["teamA", "teamB"], {
    required_error: "Result must be either teamA or teamB",
  }),
});

export type LoginData = z.infer<typeof loginSchema>;
export type CoinTossBetData = z.infer<typeof coinTossBetSchema>;
export type SattamatkaBetData = z.infer<typeof sattamatkaBetSchema>;
export type TeamMatchBetData = z.infer<typeof teamMatchBetSchema>;
export type DeclareResultData = z.infer<typeof declareResultSchema>;
export type DeclareMatchResultData = z.infer<typeof declareMatchResultSchema>;
