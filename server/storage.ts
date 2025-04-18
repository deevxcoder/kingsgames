import { 
  users, type User, type InsertUser,
  markets, type Market, type InsertMarket,
  gameTypes, type GameType, type InsertGameType,
  teamMatches, type TeamMatch, type InsertTeamMatch,
  bets, type Bet, type InsertBet
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: number, amount: number): Promise<User | undefined>;

  // Market methods
  getMarkets(): Promise<Market[]>;
  getMarket(id: number): Promise<Market | undefined>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarket(id: number, data: Partial<Market>): Promise<Market | undefined>;
  setMarketResult(id: number, result: string): Promise<Market | undefined>;

  // Game Type methods
  getGameTypes(marketId: number): Promise<GameType[]>;
  createGameType(gameType: InsertGameType): Promise<GameType>;
  updateGameType(id: number, data: Partial<GameType>): Promise<GameType | undefined>;

  // Team Match methods
  getTeamMatches(): Promise<TeamMatch[]>;
  getTeamMatch(id: number): Promise<TeamMatch | undefined>;
  createTeamMatch(match: InsertTeamMatch): Promise<TeamMatch>;
  updateTeamMatch(id: number, data: Partial<TeamMatch>): Promise<TeamMatch | undefined>;
  setTeamMatchResult(id: number, result: string): Promise<TeamMatch | undefined>;

  // Bet methods
  getBets(userId: number): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(id: number, result: string, status: string, winAmount?: number): Promise<Bet | undefined>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private marketsMap: Map<number, Market>;
  private gameTypesMap: Map<number, GameType>;
  private teamMatchesMap: Map<number, TeamMatch>;
  private betsMap: Map<number, Bet>;
  private userId: number;
  private marketId: number;
  private gameTypeId: number;
  private teamMatchId: number;
  private betId: number;

  constructor() {
    this.usersMap = new Map();
    this.marketsMap = new Map();
    this.gameTypesMap = new Map();
    this.teamMatchesMap = new Map();
    this.betsMap = new Map();
    this.userId = 1;
    this.marketId = 1;
    this.gameTypeId = 1;
    this.teamMatchId = 1;
    this.betId = 1;

    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true,
    });

    // Initialize with test user
    this.createUser({
      username: "user",
      password: "user123",
      isAdmin: false,
    });

    // Initialize with some markets
    const mumbai = this.createMarket({
      name: "Mumbai Matka",
      isOpen: true,
      openTime: "10:00",
      closeTime: "20:30",
    });

    const kalyan = this.createMarket({
      name: "Kalyan Matka",
      isOpen: true,
      openTime: "11:30",
      closeTime: "21:00",
    });

    const rajdhani = this.createMarket({
      name: "Rajdhani Night",
      isOpen: true,
      openTime: "14:00",
      closeTime: "23:30",
    });

    // Initialize with game types for Mumbai market
    this.createGameType({
      marketId: 1, // Mumbai market ID
      type: "jodi",
      odds: "90",
    });

    this.createGameType({
      marketId: 1, // Mumbai market ID
      type: "odd-even",
      odds: "1.8",
    });

    this.createGameType({
      marketId: 1, // Mumbai market ID
      type: "hurf",
      odds: "9",
      doubleMatchOdds: "80",
    });

    this.createGameType({
      marketId: 1, // Mumbai market ID
      type: "cross",
      odds: "45", // For 2 digits
    });

    // Initialize game types for other markets
    this.createGameType({
      marketId: 2, // Kalyan market ID
      type: "jodi",
      odds: "90",
    });

    this.createGameType({
      marketId: 2, // Kalyan market ID
      type: "odd-even",
      odds: "1.8",
    });

    this.createGameType({
      marketId: 3, // Rajdhani market ID
      type: "jodi",
      odds: "90",
    });
    
    // Initialize with sample team matches
    this.createTeamMatch({
      teamA: "India",
      teamB: "Pakistan",
      matchDate: new Date(Date.now() + 86400000), // tomorrow
      isOpen: true,
      openTime: "12:00",
      closeTime: "18:00",
      oddsTeamA: "1.7",
      oddsTeamB: "2.1",
      image: "ind-vs-pak.jpg",
      category: "cricket"
    });

    this.createTeamMatch({
      teamA: "Chennai Super Kings",
      teamB: "Mumbai Indians",
      matchDate: new Date(Date.now() + 2 * 86400000), // day after tomorrow
      isOpen: true,
      openTime: "14:00",
      closeTime: "20:00",
      oddsTeamA: "1.8",
      oddsTeamB: "1.9",
      image: "csk-vs-mi.jpg",
      category: "cricket"
    });

    this.createTeamMatch({
      teamA: "Mumbai Indians",
      teamB: "Royal Challengers Bangalore",
      matchDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
      isOpen: true,
      openTime: "16:00",
      closeTime: "22:00",
      oddsTeamA: "1.6",
      oddsTeamB: "2.2",
      image: "mi-vs-rcb.jpg",
      category: "cricket"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      walletBalance: "1000"
    };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUserWallet(id: number, amount: number): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;

    const newBalance = parseFloat(user.walletBalance.toString()) + amount;
    if (newBalance < 0) return undefined; // Prevent negative balance
    
    const updatedUser = { 
      ...user, 
      walletBalance: newBalance.toString() 
    };
    
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  // Market methods
  async getMarkets(): Promise<Market[]> {
    return Array.from(this.marketsMap.values());
  }

  async getMarket(id: number): Promise<Market | undefined> {
    return this.marketsMap.get(id);
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const id = this.marketId++;
    const market: Market = { 
      ...insertMarket, 
      id, 
      lastResult: null,
      lastResultTime: null
    };
    this.marketsMap.set(id, market);
    return market;
  }

  async updateMarket(id: number, data: Partial<Market>): Promise<Market | undefined> {
    const market = this.marketsMap.get(id);
    if (!market) return undefined;
    
    const updatedMarket = { ...market, ...data };
    this.marketsMap.set(id, updatedMarket);
    return updatedMarket;
  }

  async setMarketResult(id: number, result: string): Promise<Market | undefined> {
    const market = this.marketsMap.get(id);
    if (!market) return undefined;
    
    const updatedMarket = { 
      ...market, 
      lastResult: result,
      lastResultTime: new Date()
    };
    
    this.marketsMap.set(id, updatedMarket);
    return updatedMarket;
  }

  // Game Type methods
  async getGameTypes(marketId: number): Promise<GameType[]> {
    return Array.from(this.gameTypesMap.values()).filter(
      (gameType) => gameType.marketId === marketId,
    );
  }

  async createGameType(insertGameType: InsertGameType): Promise<GameType> {
    const id = this.gameTypeId++;
    const gameType: GameType = { ...insertGameType, id };
    this.gameTypesMap.set(id, gameType);
    return gameType;
  }

  async updateGameType(id: number, data: Partial<GameType>): Promise<GameType | undefined> {
    const gameType = this.gameTypesMap.get(id);
    if (!gameType) return undefined;
    
    const updatedGameType = { ...gameType, ...data };
    this.gameTypesMap.set(id, updatedGameType);
    return updatedGameType;
  }

  // Team Match methods
  async getTeamMatches(): Promise<TeamMatch[]> {
    return Array.from(this.teamMatchesMap.values());
  }

  async getTeamMatch(id: number): Promise<TeamMatch | undefined> {
    return this.teamMatchesMap.get(id);
  }

  async createTeamMatch(insertMatch: InsertTeamMatch): Promise<TeamMatch> {
    const id = this.teamMatchId++;
    const match: TeamMatch = { 
      ...insertMatch, 
      id, 
      result: null 
    };
    this.teamMatchesMap.set(id, match);
    return match;
  }

  async updateTeamMatch(id: number, data: Partial<TeamMatch>): Promise<TeamMatch | undefined> {
    const match = this.teamMatchesMap.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...data };
    this.teamMatchesMap.set(id, updatedMatch);
    return updatedMatch;
  }

  async setTeamMatchResult(id: number, result: string): Promise<TeamMatch | undefined> {
    const match = this.teamMatchesMap.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { 
      ...match, 
      result,
      isOpen: false // Close the match once result is declared
    };
    
    this.teamMatchesMap.set(id, updatedMatch);
    return updatedMatch;
  }

  // Bet methods
  async getBets(userId: number): Promise<Bet[]> {
    return Array.from(this.betsMap.values()).filter(
      (bet) => bet.userId === userId,
    );
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.betId++;
    const bet: Bet = { 
      ...insertBet, 
      id, 
      result: null,
      winAmount: null,
      status: "pending",
      createdAt: new Date()
    };
    this.betsMap.set(id, bet);
    return bet;
  }

  async updateBetStatus(id: number, result: string, status: string, winAmount?: number): Promise<Bet | undefined> {
    const bet = this.betsMap.get(id);
    if (!bet) return undefined;
    
    const updatedBet = { 
      ...bet, 
      result,
      status,
      winAmount: winAmount ? winAmount.toString() : null
    };
    
    this.betsMap.set(id, updatedBet);
    return updatedBet;
  }
}

import { drizzleStorage } from './drizzle-storage';

// Use the Drizzle implementation for real database storage
export const storage = drizzleStorage;
