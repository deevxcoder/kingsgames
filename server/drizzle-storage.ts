import { and, eq, desc } from "drizzle-orm";
import { db } from "./db";
import { 
  users, type User, type InsertUser,
  markets, type Market, type InsertMarket,
  gameTypes, type GameType, type InsertGameType,
  teamMatches, type TeamMatch, type InsertTeamMatch,
  bets, type Bet, type InsertBet
} from "@shared/schema";
import { IStorage } from "./storage";
import bcrypt from "bcryptjs";

export class DrizzleStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash the password before saving to database
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Insert the user with the hashed password
    const result = await db.insert(users).values({
      ...userData,
      password: hashedPassword
    }).returning();
    
    return result[0];
  }

  async updateUserWallet(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Parse current balance as float and add the amount
    const currentBalance = parseFloat(user.walletBalance.toString());
    const newBalance = currentBalance + amount;
    
    // Update the user's wallet balance
    const result = await db.update(users)
      .set({ walletBalance: newBalance.toString() })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  // Market methods
  async getMarkets(): Promise<Market[]> {
    return db.select().from(markets);
  }

  async getMarket(id: number): Promise<Market | undefined> {
    const result = await db.select().from(markets).where(eq(markets.id, id));
    return result[0];
  }

  async createMarket(market: InsertMarket): Promise<Market> {
    const result = await db.insert(markets).values(market).returning();
    return result[0];
  }

  async updateMarket(id: number, data: Partial<Market>): Promise<Market | undefined> {
    const result = await db.update(markets)
      .set(data)
      .where(eq(markets.id, id))
      .returning();
    
    return result[0];
  }

  async setMarketResult(id: number, result: string): Promise<Market | undefined> {
    const market = await db.update(markets)
      .set({ 
        lastResult: result,
        lastResultTime: new Date(),
        isOpen: false 
      })
      .where(eq(markets.id, id))
      .returning();
    
    if (market.length === 0) return undefined;
    
    // Update all related bets
    const marketBets = await db.select().from(bets)
      .where(and(
        eq(bets.marketId, id),
        eq(bets.status, "pending")
      ));
    
    for (const bet of marketBets) {
      if (bet.selection === result) {
        // Player won
        const winAmount = parseFloat(bet.betAmount.toString()) * parseFloat(bet.odds.toString());
        await this.updateBetStatus(bet.id, result, "won", winAmount);
        await this.updateUserWallet(bet.userId, winAmount);
      } else {
        // Player lost
        await this.updateBetStatus(bet.id, result, "lost");
      }
    }
    
    return market[0];
  }

  // Game Type methods
  async getGameTypes(marketId: number): Promise<GameType[]> {
    return db.select().from(gameTypes).where(eq(gameTypes.marketId, marketId));
  }

  async createGameType(gameType: InsertGameType): Promise<GameType> {
    const result = await db.insert(gameTypes).values(gameType).returning();
    return result[0];
  }

  async updateGameType(id: number, data: Partial<GameType>): Promise<GameType | undefined> {
    const result = await db.update(gameTypes)
      .set(data)
      .where(eq(gameTypes.id, id))
      .returning();
    
    return result[0];
  }

  // Team Match methods
  async getTeamMatches(): Promise<TeamMatch[]> {
    return db.select().from(teamMatches);
  }

  async getTeamMatch(id: number): Promise<TeamMatch | undefined> {
    const result = await db.select().from(teamMatches).where(eq(teamMatches.id, id));
    return result[0];
  }

  async createTeamMatch(match: InsertTeamMatch): Promise<TeamMatch> {
    const result = await db.insert(teamMatches).values(match).returning();
    return result[0];
  }

  async updateTeamMatch(id: number, data: Partial<TeamMatch>): Promise<TeamMatch | undefined> {
    const result = await db.update(teamMatches)
      .set(data)
      .where(eq(teamMatches.id, id))
      .returning();
    
    return result[0];
  }

  async setTeamMatchResult(id: number, result: string): Promise<TeamMatch | undefined> {
    const match = await db.update(teamMatches)
      .set({ 
        result,
        isOpen: false 
      })
      .where(eq(teamMatches.id, id))
      .returning();
    
    if (match.length === 0) return undefined;
    
    // Update all related bets
    const matchBets = await db.select().from(bets)
      .where(and(
        eq(bets.matchId, id),
        eq(bets.status, "pending")
      ));
    
    for (const bet of matchBets) {
      if (bet.selection === result) {
        // Player won
        const winAmount = parseFloat(bet.betAmount.toString()) * parseFloat(bet.odds.toString());
        await this.updateBetStatus(bet.id, result, "won", winAmount);
        await this.updateUserWallet(bet.userId, winAmount);
      } else {
        // Player lost
        await this.updateBetStatus(bet.id, result, "lost");
      }
    }
    
    return match[0];
  }

  // Bet methods
  async getBets(userId: number): Promise<Bet[]> {
    return db.select()
      .from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.createdAt));
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    // First deduct the bet amount from the user's wallet
    await this.updateUserWallet(bet.userId, -parseFloat(bet.betAmount.toString()));
    
    // Then create the bet
    const result = await db.insert(bets).values(bet).returning();
    return result[0];
  }

  async updateBetStatus(id: number, result: string, status: string, winAmount?: number): Promise<Bet | undefined> {
    const updateData: any = { result, status };
    if (winAmount) {
      updateData.winAmount = winAmount;
    }
    
    const updatedBet = await db.update(bets)
      .set(updateData)
      .where(eq(bets.id, id))
      .returning();
    
    return updatedBet[0];
  }
}

// Create an instance of the Drizzle storage
export const drizzleStorage = new DrizzleStorage();