import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  coinTossBetSchema, 
  sattamatkaBetSchema,
  teamMatchBetSchema,
  declareResultSchema,
  declareMatchResultSchema,
  insertMarketSchema,
  insertGameTypeSchema,
  insertTeamMatchSchema
} from "@shared/schema";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";
import { nanoid } from "nanoid";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Helper for validating request body
const validateBody = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(400).json({ error: "Invalid request body" });
    }
  };
};

// Helper to ensure user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

// Helper to ensure user is admin
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Setup PostgreSQL session store
  const pgStore = pgSession(session);
  
  // Setup session middleware
  app.use(
    session({
      store: new pgStore({
        pool: pool,
        tableName: 'session', // Sessions table name
        createTableIfMissing: true
      }),
      secret: process.env.SESSION_SECRET || "betx-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
      name: "betx.sid",
    })
  );

  // Authentication Routes
  app.post(
    "/api/login", 
    validateBody(loginSchema), 
    async (req, res) => {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Compare passwords using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Store user ID in session
      req.session.userId = user.id;
      
      return res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        walletBalance: user.walletBalance
      });
    }
  );

  app.post(
    "/api/register", 
    validateBody(insertUserSchema), 
    async (req, res) => {
      const { username, password } = req.body;
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: false,
      });
      
      // Store user ID in session
      req.session.userId = user.id;
      
      return res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        walletBalance: user.walletBalance
      });
    }
  );

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("betx.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      walletBalance: user.walletBalance
    });
  });

  // Wallet Routes
  app.get("/api/wallet", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.json({ balance: user.walletBalance });
  });

  // Coin Toss Game Routes
  app.post(
    "/api/games/coin-toss", 
    requireAuth, 
    validateBody(coinTossBetSchema), 
    async (req, res) => {
      const { betAmount, selection } = req.body;
      const userId = req.session.userId!;
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (parseFloat(user.walletBalance.toString()) < betAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      // Deduct bet amount from user balance
      await storage.updateUserWallet(userId, -betAmount);
      
      // Create bet record
      const bet = await storage.createBet({
        userId,
        marketId: 0, // Coin toss doesn't use markets
        gameType: "coin-toss",
        betAmount: betAmount.toString(),
        selection,
        odds: "2", // 2x payout for coin toss
      });
      
      // Determine result (random for coin toss)
      const result = Math.random() < 0.5 ? "heads" : "tails";
      const won = selection === result;
      
      // Calculate winnings
      const winAmount = won ? betAmount * 2 : 0;
      
      // Update bet status
      await storage.updateBetStatus(
        bet.id, 
        result, 
        won ? "won" : "lost", 
        winAmount
      );
      
      // If user won, add winnings to balance
      if (won) {
        await storage.updateUserWallet(userId, winAmount);
      }
      
      // Get updated user for current balance
      const updatedUser = await storage.getUser(userId);
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'coin-toss-result',
            data: {
              betId: bet.id,
              userId,
              result,
              won,
              winAmount,
              selection
            }
          }));
        }
      });
      
      return res.json({
        result,
        won,
        winAmount,
        newBalance: updatedUser?.walletBalance
      });
    }
  );

  // Sattamatka Game Routes
  app.get("/api/markets", async (req, res) => {
    const markets = await storage.getMarkets();
    return res.json(markets);
  });
  
  // Get market by ID
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      const market = await storage.getMarket(marketId);
      
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }
      
      return res.json(market);
    } catch (error) {
      console.error('Error fetching market:', error);
      return res.status(500).json({ error: 'Failed to fetch market' });
    }
  });

  app.get("/api/markets/:id/game-types", async (req, res) => {
    const marketId = parseInt(req.params.id);
    console.log("Fetching game types for marketId:", marketId);
    
    // Log the contents of the game types map for debugging
    console.log("All game types:", Array.from((storage as any).gameTypesMap.values()));
    
    const gameTypes = await storage.getGameTypes(marketId);
    console.log("Filtered game types:", gameTypes);
    
    return res.json(gameTypes);
  });

  app.post(
    "/api/games/sattamatka", 
    requireAuth, 
    validateBody(sattamatkaBetSchema), 
    async (req, res) => {
      const { marketId, gameType, betAmount, selection } = req.body;
      const userId = req.session.userId!;
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (parseFloat(user.walletBalance.toString()) < betAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      // Check if market exists and is open
      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      
      if (!market.isOpen) {
        return res.status(400).json({ error: "Market is closed" });
      }
      
      // Get odds for the game type
      const gameTypes = await storage.getGameTypes(marketId);
      const gameTypeInfo = gameTypes.find(gt => gt.type === gameType);
      
      if (!gameTypeInfo) {
        return res.status(404).json({ error: "Game type not found for this market" });
      }
      
      let odds = gameTypeInfo.odds;
      
      // For cross game, odds depend on number of selected digits
      if (gameType === "cross") {
        const selectedDigits = selection.split(",").length;
        
        if (selectedDigits === 2) {
          odds = "45";
        } else if (selectedDigits === 3) {
          odds = "15";
        } else if (selectedDigits === 4) {
          odds = "7.5";
        } else {
          return res.status(400).json({ error: "Invalid selection for cross game" });
        }
      }
      
      // Deduct bet amount from user balance
      await storage.updateUserWallet(userId, -betAmount);
      
      // Create bet record
      const bet = await storage.createBet({
        userId,
        marketId,
        gameType,
        betAmount: betAmount.toString(),
        selection,
        odds,
      });
      
      // Get updated user for current balance
      const updatedUser = await storage.getUser(userId);
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'sattamatka-bet',
            data: {
              betId: bet.id,
              userId,
              marketId,
              gameType,
              selection
            }
          }));
        }
      });
      
      return res.json({
        bet: {
          id: bet.id,
          gameType,
          betAmount,
          selection,
          odds,
          status: "pending"
        },
        newBalance: updatedUser?.walletBalance
      });
    }
  );

  // Admin Routes
  app.post(
    "/api/admin/markets", 
    requireAdmin, 
    validateBody(insertMarketSchema), 
    async (req, res) => {
      const market = await storage.createMarket(req.body);
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'market-created',
            data: market
          }));
        }
      });
      
      return res.json(market);
    }
  );

  app.put(
    "/api/admin/markets/:id", 
    requireAdmin, 
    async (req, res) => {
      const marketId = parseInt(req.params.id);
      const market = await storage.updateMarket(marketId, req.body);
      
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'market-updated',
            data: market
          }));
        }
      });
      
      return res.json(market);
    }
  );

  app.post(
    "/api/admin/game-types", 
    requireAdmin, 
    validateBody(insertGameTypeSchema), 
    async (req, res) => {
      const gameType = await storage.createGameType(req.body);
      return res.json(gameType);
    }
  );

  app.post(
    "/api/admin/declare-result", 
    requireAdmin, 
    validateBody(declareResultSchema), 
    async (req, res) => {
      const { marketId, result } = req.body;
      
      // Update market with result
      const market = await storage.setMarketResult(marketId, result);
      
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      
      // Get all pending bets for this market
      const allBets = await Promise.all(
        Array.from({ length: storage.betId }, (_, id) => id + 1)
          .map(id => storage.betsMap.get(id))
          .filter(bet => bet && bet.marketId === marketId && bet.status === "pending")
      );
      
      // Process each bet
      for (const bet of allBets) {
        if (!bet) continue;
        
        let won = false;
        let winAmount = 0;
        
        // Check if bet won based on game type
        switch (bet.gameType) {
          case "jodi":
            // Direct match
            won = bet.selection === result;
            break;
          case "odd-even":
            // Check if result is odd or even
            const resultNum = parseInt(result);
            const isOdd = resultNum % 2 === 1;
            won = (bet.selection === "odd" && isOdd) || (bet.selection === "even" && !isOdd);
            break;
          case "hurf":
            // Check left or right or both positions
            const positions = bet.selection.split(":");
            if (positions.length === 2) {
              const [position, digit] = positions;
              if (position === "left") {
                won = result[0] === digit;
              } else if (position === "right") {
                won = result[1] === digit;
              }
            } else if (positions.length === 4) {
              // Both positions selected
              const [leftPos, leftDigit, rightPos, rightDigit] = positions;
              const leftMatch = result[0] === leftDigit;
              const rightMatch = result[1] === rightDigit;
              
              if (leftMatch && rightMatch) {
                // Double match, use higher odds
                won = true;
                winAmount = parseFloat(bet.betAmount) * parseFloat(bet.doubleMatchOdds || "0");
              } else if (leftMatch || rightMatch) {
                // Single match
                won = true;
                winAmount = parseFloat(bet.betAmount) * parseFloat(bet.odds);
              }
            }
            break;
          case "cross":
            // Check if any permutation matches
            const digits = bet.selection.split(",");
            const permutations = generatePermutations(digits);
            won = permutations.includes(result);
            break;
        }
        
        // If winAmount not calculated yet
        if (won && winAmount === 0) {
          winAmount = parseFloat(bet.betAmount) * parseFloat(bet.odds);
        }
        
        // Update bet status
        await storage.updateBetStatus(
          bet.id, 
          result, 
          won ? "won" : "lost", 
          winAmount
        );
        
        // If user won, add winnings to balance
        if (won) {
          await storage.updateUserWallet(bet.userId, winAmount);
        }
      }
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'market-result',
            data: {
              marketId,
              result,
              time: market.lastResultTime
            }
          }));
        }
      });
      
      return res.json({ 
        message: "Result declared successfully",
        market
      });
    }
  );

  // Team Match Routes
  app.get("/api/team-matches", async (req, res) => {
    const matches = await storage.getTeamMatches();
    return res.json(matches);
  });

  app.get("/api/team-matches/:id", async (req, res) => {
    const matchId = parseInt(req.params.id);
    const match = await storage.getTeamMatch(matchId);
    
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    
    return res.json(match);
  });

  app.post(
    "/api/admin/team-matches", 
    requireAdmin, 
    validateBody(insertTeamMatchSchema), 
    async (req, res) => {
      const match = await storage.createTeamMatch(req.body);
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'team-match-created',
            data: match
          }));
        }
      });
      
      return res.json(match);
    }
  );

  app.put(
    "/api/admin/team-matches/:id", 
    requireAdmin, 
    async (req, res) => {
      const matchId = parseInt(req.params.id);
      const match = await storage.updateTeamMatch(matchId, req.body);
      
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'team-match-updated',
            data: match
          }));
        }
      });
      
      return res.json(match);
    }
  );

  app.post(
    "/api/admin/declare-match-result", 
    requireAdmin, 
    validateBody(declareMatchResultSchema), 
    async (req, res) => {
      const { matchId, result } = req.body;
      
      // Update match with result
      const match = await storage.setTeamMatchResult(matchId, result);
      
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      // Get all pending bets for this match
      const allBets = Array.from(
        await storage.getBets(0) // Temporary solution to get all bets
      ).filter(bet => bet.matchId === matchId && bet.status === "pending");
      
      // Process each bet
      for (const bet of allBets) {
        let won = false;
        let winAmount = 0;
        
        // Determine if bet won
        if (bet.selection === result) {
          won = true;
          // Calculate winnings based on odds
          const odds = result === "teamA" ? match.oddsTeamA : match.oddsTeamB;
          winAmount = parseFloat(bet.betAmount) * parseFloat(odds);
        }
        
        // Update bet status
        await storage.updateBetStatus(
          bet.id, 
          result, 
          won ? "won" : "lost", 
          winAmount
        );
        
        // If user won, add winnings to balance
        if (won) {
          await storage.updateUserWallet(bet.userId, winAmount);
        }
      }
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'match-result',
            data: {
              matchId,
              result,
              teamA: match.teamA,
              teamB: match.teamB,
              winningTeam: result === "teamA" ? match.teamA : match.teamB
            }
          }));
        }
      });
      
      return res.json({ 
        message: "Match result declared successfully",
        match
      });
    }
  );

  app.post(
    "/api/games/team-match", 
    requireAuth, 
    validateBody(teamMatchBetSchema), 
    async (req, res) => {
      const { matchId, betAmount, selection } = req.body;
      const userId = req.session.userId!;
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (parseFloat(user.walletBalance.toString()) < betAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      // Check if match exists and is open
      const match = await storage.getTeamMatch(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      if (!match.isOpen) {
        return res.status(400).json({ error: "Match is closed for betting" });
      }
      
      // Determine odds based on selected team
      const odds = selection === "teamA" ? match.oddsTeamA : match.oddsTeamB;
      
      // Deduct bet amount from user balance
      await storage.updateUserWallet(userId, -betAmount);
      
      // Create bet record
      const bet = await storage.createBet({
        userId,
        matchId,
        gameType: "team-match",
        betAmount: betAmount.toString(),
        selection,
        odds,
      });
      
      // Get updated user for current balance
      const updatedUser = await storage.getUser(userId);
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'team-match-bet',
            data: {
              betId: bet.id,
              userId,
              matchId,
              teamA: match.teamA,
              teamB: match.teamB,
              selectedTeam: selection === "teamA" ? match.teamA : match.teamB
            }
          }));
        }
      });
      
      return res.json({
        bet: {
          id: bet.id,
          gameType: "team-match",
          betAmount,
          selection,
          odds,
          status: "pending",
          teamA: match.teamA,
          teamB: match.teamB,
          selectedTeam: selection === "teamA" ? match.teamA : match.teamB
        },
        newBalance: updatedUser?.walletBalance
      });
    }
  );

  // Bet History Route
  app.get("/api/bets", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const bets = await storage.getBets(userId);
    return res.json(bets);
  });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    // Send initial connection message
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to BetX WebSocket server' }));
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
  });

  return httpServer;
}

// Helper function to generate permutations for cross game
function generatePermutations(digits: string[]): string[] {
  if (digits.length <= 1) return digits;
  
  const result: string[] = [];
  
  for (let i = 0; i < digits.length; i++) {
    const current = digits[i];
    const remaining = [...digits.slice(0, i), ...digits.slice(i + 1)];
    const perms = generatePermutations(remaining);
    
    for (let perm of perms) {
      result.push(current + perm);
    }
  }
  
  return result;
}
