import {
  users, type User, type InsertUser,
  markets, type Market, type InsertMarket,
  gameTypes, type GameType, type InsertGameType,
  marketGameTypes, type MarketGameType, type InsertMarketGameType,
  bets, type Bet, type InsertBet,
  transactions, type Transaction, type InsertTransaction,
  coinTossResults, type CoinTossResult, type InsertCoinTossResult
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: number): Promise<User | undefined>;
  
  // Market operations
  getAllMarkets(): Promise<Market[]>;
  getMarket(id: number): Promise<Market | undefined>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarket(id: number, data: Partial<Market>): Promise<Market | undefined>;
  setMarketResult(id: number, result: string): Promise<Market | undefined>;
  
  // Game Type operations
  getAllGameTypes(): Promise<GameType[]>;
  getGameType(id: number): Promise<GameType | undefined>;
  createGameType(gameType: InsertGameType): Promise<GameType>;
  
  // Market Game Type operations
  getMarketGameTypes(marketId: number): Promise<MarketGameType[]>;
  createMarketGameType(marketGameType: InsertMarketGameType): Promise<MarketGameType>;
  
  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getBet(id: number): Promise<Bet | undefined>;
  getUserBets(userId: number): Promise<Bet[]>;
  getMarketBets(marketId: number): Promise<Bet[]>;
  updateBetStatus(id: number, status: string, result?: string): Promise<Bet | undefined>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Coin Toss operations
  createCoinTossResult(result: InsertCoinTossResult): Promise<CoinTossResult>;
  getRecentCoinTossResults(limit: number): Promise<CoinTossResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private markets: Map<number, Market>;
  private gameTypes: Map<number, GameType>;
  private marketGameTypes: Map<number, MarketGameType>;
  private bets: Map<number, Bet>;
  private transactions: Map<number, Transaction>;
  private coinTossResults: Map<number, CoinTossResult>;
  
  private currentUserId: number;
  private currentMarketId: number;
  private currentGameTypeId: number;
  private currentMarketGameTypeId: number;
  private currentBetId: number;
  private currentTransactionId: number;
  private currentCoinTossResultId: number;

  constructor() {
    this.users = new Map();
    this.markets = new Map();
    this.gameTypes = new Map();
    this.marketGameTypes = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    this.coinTossResults = new Map();
    
    this.currentUserId = 1;
    this.currentMarketId = 1;
    this.currentGameTypeId = 1;
    this.currentMarketGameTypeId = 1;
    this.currentBetId = 1;
    this.currentTransactionId = 1;
    this.currentCoinTossResultId = 1;
    
    // Initialize with default game types
    this.initializeGameTypes();
    this.initializeDefaultMarkets();
    this.createAdminUser();
  }

  private initializeGameTypes() {
    const gameTypes: InsertGameType[] = [
      { name: "Jodi", description: "Bet on a two-digit number from 00 to 99", odds: 90 },
      { name: "Odd-Even", description: "Bet on whether the result will be odd or even", odds: 1.8 },
      { name: "Hurf", description: "Bet on specific digits of a two-digit number", odds: 9 },
      { name: "Cross", description: "Bet on multiple digits to form permutations", odds: 15 }
    ];
    
    gameTypes.forEach(gameType => this.createGameType(gameType));
  }

  private initializeDefaultMarkets() {
    const markets: InsertMarket[] = [
      { name: "Mumbai Matka", isOpen: true, closingTime: new Date(Date.now() + 86400000), createdBy: 1 },
      { name: "Kalyan Matka", isOpen: true, closingTime: new Date(Date.now() + 43200000), createdBy: 1 },
      { name: "Star Matka", isOpen: true, closingTime: new Date(Date.now() + 28800000), createdBy: 1 }
    ];
    
    markets.forEach(market => {
      const createdMarket = this.createMarket(market);
      
      // Add all game types to each market
      for (let i = 1; i <= 4; i++) {
        this.createMarketGameType({
          marketId: createdMarket.id,
          gameTypeId: i,
          odds: i === 1 ? 90 : i === 2 ? 1.8 : i === 3 ? 9 : 15
        });
      }
    });
  }

  private createAdminUser() {
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, balance: 1000 };  // Give new users $1000 to start
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (user) {
      const updatedUser = { ...user, balance };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getAllMarkets(): Promise<Market[]> {
    return Array.from(this.markets.values());
  }

  async getMarket(id: number): Promise<Market | undefined> {
    return this.markets.get(id);
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const id = this.currentMarketId++;
    const market: Market = { 
      ...insertMarket, 
      id, 
      lastResult: null, 
      lastResultTimestamp: null 
    };
    this.markets.set(id, market);
    return market;
  }

  async updateMarket(id: number, data: Partial<Market>): Promise<Market | undefined> {
    const market = await this.getMarket(id);
    if (market) {
      const updatedMarket = { ...market, ...data };
      this.markets.set(id, updatedMarket);
      return updatedMarket;
    }
    return undefined;
  }

  async setMarketResult(id: number, result: string): Promise<Market | undefined> {
    const market = await this.getMarket(id);
    if (market) {
      const updatedMarket = { 
        ...market, 
        lastResult: result, 
        lastResultTimestamp: new Date() 
      };
      this.markets.set(id, updatedMarket);
      
      // Process bets for this market
      const marketBets = await this.getMarketBets(id);
      for (const bet of marketBets) {
        if (bet.status === "pending") {
          let won = false;
          
          // Check if bet won based on game type
          if (bet.gameTypeId === 1) { // Jodi
            won = bet.selection === result;
          } else if (bet.gameTypeId === 2) { // Odd-Even
            const resultNum = parseInt(result);
            const isOdd = resultNum % 2 !== 0;
            won = (bet.selection === "Odd" && isOdd) || (bet.selection === "Even" && !isOdd);
          } else if (bet.gameTypeId === 3) { // Hurf
            // For Hurf, the selection format is "L:digit" or "R:digit" or both "L:digit,R:digit"
            const parts = bet.selection.split(',');
            const leftPart = parts.find(p => p.startsWith("L:"));
            const rightPart = parts.find(p => p.startsWith("R:"));
            
            if (leftPart && rightPart) {
              const leftDigit = leftPart.split(':')[1];
              const rightDigit = rightPart.split(':')[1];
              won = result[0] === leftDigit && result[1] === rightDigit;
            } else if (leftPart) {
              const leftDigit = leftPart.split(':')[1];
              won = result[0] === leftDigit;
            } else if (rightPart) {
              const rightDigit = rightPart.split(':')[1];
              won = result[1] === rightDigit;
            }
          } else if (bet.gameTypeId === 4) { // Cross
            // For Cross, the selection is a comma-separated list of individual digits
            const digits = bet.selection.split(',');
            
            // Generate all possible 2-digit permutations
            const permutations = [];
            for (let i = 0; i < digits.length; i++) {
              for (let j = 0; j < digits.length; j++) {
                if (i !== j) {
                  permutations.push(digits[i] + digits[j]);
                }
              }
            }
            
            won = permutations.includes(result);
          }
          
          // Update bet status
          const status = won ? "won" : "lost";
          await this.updateBetStatus(bet.id, status, result);
          
          // If user won, update their balance
          if (won) {
            const user = await this.getUser(bet.userId);
            if (user) {
              await this.updateUserBalance(user.id, user.balance + bet.potentialWin);
              
              // Create win transaction
              await this.createTransaction({
                userId: user.id,
                amount: bet.potentialWin,
                type: "win",
                description: `Win from bet #${bet.id}`,
                betId: bet.id
              });
            }
          }
        }
      }
      
      return updatedMarket;
    }
    return undefined;
  }

  async getAllGameTypes(): Promise<GameType[]> {
    return Array.from(this.gameTypes.values());
  }

  async getGameType(id: number): Promise<GameType | undefined> {
    return this.gameTypes.get(id);
  }

  async createGameType(insertGameType: InsertGameType): Promise<GameType> {
    const id = this.currentGameTypeId++;
    const gameType: GameType = { ...insertGameType, id };
    this.gameTypes.set(id, gameType);
    return gameType;
  }

  async getMarketGameTypes(marketId: number): Promise<MarketGameType[]> {
    return Array.from(this.marketGameTypes.values()).filter(
      (marketGameType) => marketGameType.marketId === marketId,
    );
  }

  async createMarketGameType(insertMarketGameType: InsertMarketGameType): Promise<MarketGameType> {
    const id = this.currentMarketGameTypeId++;
    const marketGameType: MarketGameType = { ...insertMarketGameType, id };
    this.marketGameTypes.set(id, marketGameType);
    return marketGameType;
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const now = new Date();
    const bet: Bet = { 
      ...insertBet, 
      id, 
      result: null, 
      status: "pending",
      createdAt: now 
    };
    this.bets.set(id, bet);
    
    // Deduct amount from user balance
    const user = await this.getUser(bet.userId);
    if (user) {
      await this.updateUserBalance(user.id, user.balance - bet.amount);
      
      // Create bet transaction
      await this.createTransaction({
        userId: user.id,
        amount: -bet.amount,
        type: "bet",
        description: `Bet #${id}`,
        betId: id
      });
    }
    
    return bet;
  }

  async getBet(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter((bet) => bet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMarketBets(marketId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter((bet) => bet.marketId === marketId);
  }

  async updateBetStatus(id: number, status: string, result?: string): Promise<Bet | undefined> {
    const bet = await this.getBet(id);
    if (bet) {
      const updatedBet = { 
        ...bet, 
        status, 
        result: result || bet.result 
      };
      this.bets.set(id, updatedBet);
      return updatedBet;
    }
    return undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCoinTossResult(insertResult: InsertCoinTossResult): Promise<CoinTossResult> {
    const id = this.currentCoinTossResultId++;
    const now = new Date();
    const result: CoinTossResult = { 
      ...insertResult, 
      id, 
      createdAt: now 
    };
    this.coinTossResults.set(id, result);
    return result;
  }

  async getRecentCoinTossResults(limit: number): Promise<CoinTossResult[]> {
    return Array.from(this.coinTossResults.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
