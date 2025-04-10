import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { 
  insertUserSchema, 
  insertMarketSchema, 
  insertBetSchema,
  insertCoinTossResultSchema
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// Create a session store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Set up session middleware
  app.use(
    session({
      secret: "betwise-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
  
  // Set up passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Broadcast updates to all connected clients
  function broadcastUpdate(type: string, data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  }
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types if needed
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json({ 
        id: user.id, 
        username: user.username,
        balance: user.balance,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ 
          id: user.id, 
          username: user.username,
          balance: user.balance,
          isAdmin: user.isAdmin
        });
      });
    })(req, res, next);
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    return res.json({ 
      id: user.id, 
      username: user.username,
      balance: user.balance,
      isAdmin: user.isAdmin
    });
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });
  
  // Middleware to check if user is authenticated
  function isAuthenticated(req: Request, res: Response, next: any) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Middleware to check if user is admin
  function isAdmin(req: Request, res: Response, next: any) {
    if (req.isAuthenticated() && (req.user as any).isAdmin) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  }
  
  // Wallet routes
  app.post("/api/wallet/deposit", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const updatedUser = await storage.updateUserBalance(user.id, user.balance + amount);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        amount: amount,
        type: "deposit",
        description: "Deposit to wallet",
        betId: null
      });
      
      return res.json({ balance: updatedUser.balance });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/wallet/withdraw", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const updatedUser = await storage.updateUserBalance(user.id, user.balance - amount);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        amount: -amount,
        type: "withdraw",
        description: "Withdraw from wallet",
        betId: null
      });
      
      return res.json({ balance: updatedUser.balance });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/wallet/transactions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const transactions = await storage.getUserTransactions(user.id);
      return res.json(transactions);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  // Market routes
  app.get("/api/markets", async (req, res) => {
    try {
      const markets = await storage.getAllMarkets();
      return res.json(markets);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      const market = await storage.getMarket(marketId);
      
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }
      
      return res.json(market);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/markets", isAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const marketData = insertMarketSchema.parse({
        ...req.body,
        createdBy: user.id
      });
      
      const market = await storage.createMarket(marketData);
      
      // Add game types to the market
      const { gameTypes } = req.body;
      if (Array.isArray(gameTypes)) {
        for (const gameTypeId of gameTypes) {
          const gameType = await storage.getGameType(gameTypeId);
          if (gameType) {
            await storage.createMarketGameType({
              marketId: market.id,
              gameTypeId: gameType.id,
              odds: gameType.odds
            });
          }
        }
      }
      
      broadcastUpdate('marketCreated', market);
      return res.status(201).json(market);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/markets/:id", isAdmin, async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      const market = await storage.getMarket(marketId);
      
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }
      
      const updatedMarket = await storage.updateMarket(marketId, req.body);
      broadcastUpdate('marketUpdated', updatedMarket);
      return res.json(updatedMarket);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/markets/:id/result", isAdmin, async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      const { result } = req.body;
      
      if (!result) {
        return res.status(400).json({ message: "Result is required" });
      }
      
      const market = await storage.getMarket(marketId);
      
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }
      
      const updatedMarket = await storage.setMarketResult(marketId, result);
      broadcastUpdate('marketResult', { marketId, result });
      return res.json(updatedMarket);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/markets/:id/game-types", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      const marketGameTypes = await storage.getMarketGameTypes(marketId);
      
      // Get full game type information
      const result = [];
      for (const mgt of marketGameTypes) {
        const gameType = await storage.getGameType(mgt.gameTypeId);
        if (gameType) {
          result.push({
            ...mgt,
            gameType
          });
        }
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  // Game type routes
  app.get("/api/game-types", async (req, res) => {
    try {
      const gameTypes = await storage.getAllGameTypes();
      return res.json(gameTypes);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  // Bet routes
  app.post("/api/bets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const betData = insertBetSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      // Check if user has enough balance
      if (user.balance < betData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Check if market is open
      const market = await storage.getMarket(betData.marketId);
      if (!market || !market.isOpen) {
        return res.status(400).json({ message: "Market is closed" });
      }
      
      const bet = await storage.createBet(betData);
      
      // Return updated user balance
      const updatedUser = await storage.getUser(user.id);
      
      // Send WebSocket update
      broadcastUpdate('newBet', { bet, userBalance: updatedUser?.balance });
      
      return res.status(201).json({ 
        bet, 
        balance: updatedUser?.balance 
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/bets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const bets = await storage.getUserBets(user.id);
      
      // Enrich bets with market and game type information
      const enrichedBets = [];
      for (const bet of bets) {
        const market = await storage.getMarket(bet.marketId);
        const gameType = await storage.getGameType(bet.gameTypeId);
        
        if (market && gameType) {
          enrichedBets.push({
            ...bet,
            market: { id: market.id, name: market.name },
            gameType: { id: gameType.id, name: gameType.name }
          });
        }
      }
      
      return res.json(enrichedBets);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  // Coin Toss routes
  app.post("/api/coin-toss", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { amount, selection } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      if (selection !== "heads" && selection !== "tails") {
        return res.status(400).json({ message: "Invalid selection" });
      }
      
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Determine result
      const result = Math.random() > 0.5 ? "heads" : "tails";
      
      // Create result record
      await storage.createCoinTossResult({ result });
      
      // Determine win/loss
      const won = selection === result;
      const winAmount = won ? amount * 2 : 0;
      
      // Update user balance
      const newBalance = user.balance - amount + winAmount;
      const updatedUser = await storage.updateUserBalance(user.id, newBalance);
      
      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        amount: -amount,
        type: "bet",
        description: `Coin Toss bet on ${selection}`,
        betId: null
      });
      
      if (won) {
        await storage.createTransaction({
          userId: user.id,
          amount: winAmount,
          type: "win",
          description: `Win from Coin Toss`,
          betId: null
        });
      }
      
      // Send WebSocket update
      broadcastUpdate('coinTossResult', { 
        result, 
        won, 
        amount, 
        selection, 
        winAmount, 
        userBalance: updatedUser?.balance 
      });
      
      return res.json({ 
        result, 
        won, 
        winAmount, 
        balance: updatedUser?.balance 
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/coin-toss/history", async (req, res) => {
    try {
      const results = await storage.getRecentCoinTossResults(10);
      return res.json(results);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  return httpServer;
}
