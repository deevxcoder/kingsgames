import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { MarketCard } from "@/components/ui/market-card";

type GameType = "jodi" | "odd-even" | "hurf" | "cross";

export default function Sattamatka() {
  const { balance, refreshBalance } = useWallet();
  const { toast } = useToast();
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [activeGameType, setActiveGameType] = useState<GameType>("jodi");
  const [betAmount, setBetAmount] = useState(10);
  const [jodiSelection, setJodiSelection] = useState<string | null>(null);
  const [oddEvenSelection, setOddEvenSelection] = useState<"odd" | "even" | null>(null);
  const [hurfLeftDigit, setHurfLeftDigit] = useState<string | null>(null);
  const [hurfRightDigit, setHurfRightDigit] = useState<string | null>(null);
  const [crossDigits, setCrossDigits] = useState<string[]>([]);
  const [crossPermutations, setCrossPermutations] = useState<string[]>([]);
  const [potentialWin, setPotentialWin] = useState(0);
  const [currentOdds, setCurrentOdds] = useState(0);
  
  // Handle WebSocket messages
  const onMessage = (message: any) => {
    if (message.type === 'market-result') {
      // Refresh markets when new results are declared
      marketsQuery.refetch();
    }
    
    if (message.type === 'market-updated') {
      // Refresh markets when they are updated
      marketsQuery.refetch();
    }
  };
  
  const { isConnected } = useWebSocket({ onMessage });
  
  // Fetch markets
  const marketsQuery = useQuery({
    queryKey: ['/api/markets'],
  });
  
  // Fetch game types for selected market
  const gameTypesQuery = useQuery({
    queryKey: [`/api/markets/${selectedMarketId}/game-types`],
    enabled: !!selectedMarketId,
  });
  
  // Calculate cross game permutations
  useEffect(() => {
    if (crossDigits.length >= 2) {
      const perms = generatePermutations(crossDigits);
      setCrossPermutations(perms);
      
      // Set odds based on number of digits
      if (gameTypesQuery.data) {
        let odds = 0;
        switch (crossDigits.length) {
          case 2:
            odds = 45;
            break;
          case 3:
            odds = 15;
            break;
          case 4:
            odds = 7.5;
            break;
          default:
            odds = 0;
        }
        setCurrentOdds(odds);
        setPotentialWin(betAmount * odds);
      }
    } else {
      setCrossPermutations([]);
      setCurrentOdds(0);
      setPotentialWin(0);
    }
  }, [crossDigits, betAmount]);
  
  // Update potential win when game type or bet amount changes
  useEffect(() => {
    if (!gameTypesQuery.data) return;
    
    const gameTypeInfo = gameTypesQuery.data.find(gt => gt.type === activeGameType);
    if (!gameTypeInfo) return;
    
    let odds = parseFloat(gameTypeInfo.odds);
    
    if (activeGameType === "hurf" && hurfLeftDigit && hurfRightDigit && gameTypeInfo.doubleMatchOdds) {
      // Double match
      odds = parseFloat(gameTypeInfo.doubleMatchOdds);
    } else if (activeGameType === "cross") {
      // Cross game odds already calculated in the other effect
      return;
    }
    
    setCurrentOdds(odds);
    setPotentialWin(betAmount * odds);
  }, [activeGameType, betAmount, hurfLeftDigit, hurfRightDigit, gameTypesQuery.data]);
  
  // Handle betting
  const betMutation = useMutation({
    mutationFn: async (data: { 
      marketId: number; 
      gameType: string; 
      betAmount: number; 
      selection: string;
    }) => {
      const res = await apiRequest('POST', '/api/games/sattamatka', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bet placed successfully",
        description: "Your bet has been placed. Results will be declared soon.",
        variant: "success",
      });
      refreshBalance();
      
      // Reset selections
      resetSelections();
    },
    onError: (error: Error) => {
      toast({
        title: "Error placing bet",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetSelections = () => {
    setJodiSelection(null);
    setOddEvenSelection(null);
    setHurfLeftDigit(null);
    setHurfRightDigit(null);
    setCrossDigits([]);
    setCrossPermutations([]);
  };
  
  const handlePlaceBet = () => {
    if (!selectedMarketId) {
      toast({
        title: "No market selected",
        description: "Please select a market to place a bet",
        variant: "destructive",
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Bet amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(balance) < betAmount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds to place this bet",
        variant: "destructive",
      });
      return;
    }
    
    let selection = "";
    
    switch (activeGameType) {
      case "jodi":
        if (!jodiSelection) {
          toast({
            title: "No number selected",
            description: "Please select a number for Jodi game",
            variant: "destructive",
          });
          return;
        }
        selection = jodiSelection;
        break;
      
      case "odd-even":
        if (!oddEvenSelection) {
          toast({
            title: "No option selected",
            description: "Please select odd or even",
            variant: "destructive",
          });
          return;
        }
        selection = oddEvenSelection;
        break;
      
      case "hurf":
        if (!hurfLeftDigit && !hurfRightDigit) {
          toast({
            title: "No digit selected",
            description: "Please select at least one digit position",
            variant: "destructive",
          });
          return;
        }
        
        if (hurfLeftDigit && hurfRightDigit) {
          selection = `left:${hurfLeftDigit}:right:${hurfRightDigit}`;
        } else if (hurfLeftDigit) {
          selection = `left:${hurfLeftDigit}`;
        } else if (hurfRightDigit) {
          selection = `right:${hurfRightDigit}`;
        }
        break;
      
      case "cross":
        if (crossDigits.length < 2) {
          toast({
            title: "Not enough digits",
            description: "Please select at least 2 digits for Cross game",
            variant: "destructive",
          });
          return;
        }
        
        if (crossDigits.length > 4) {
          toast({
            title: "Too many digits",
            description: "You can select up to 4 digits for Cross game",
            variant: "destructive",
          });
          return;
        }
        
        selection = crossDigits.join(",");
        break;
    }
    
    betMutation.mutate({
      marketId: selectedMarketId,
      gameType: activeGameType,
      betAmount,
      selection,
    });
  };
  
  const toggleCrossDigit = (digit: string) => {
    if (crossDigits.includes(digit)) {
      setCrossDigits(prev => prev.filter(d => d !== digit));
    } else {
      // Limit to 4 digits
      if (crossDigits.length < 4) {
        setCrossDigits(prev => [...prev, digit]);
      }
    }
  };
  
  // Helper function to generate permutations for cross game
  const generatePermutations = (digits: string[]): string[] => {
    if (digits.length <= 1) return digits;
    
    const result: string[] = [];
    
    for (let i = 0; i < digits.length; i++) {
      const current = digits[i];
      const remaining = [...digits.slice(0, i), ...digits.slice(i + 1)];
      const perms = generatePermutations(remaining);
      
      for (const perm of perms) {
        result.push(current + perm);
      }
    }
    
    return result;
  };
  
  // Get the selected market data
  const selectedMarket = marketsQuery.data?.find(m => m.id === selectedMarketId);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sattamatka</h2>
      </div>
      
      <Card className="bg-[#1A2C3D] border-gray-500/30">
        <CardContent className="p-4 md:p-6">
          {/* Market Selection */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Select Market</h3>
            
            {marketsQuery.isLoading ? (
              <div className="text-center py-8">Loading markets...</div>
            ) : marketsQuery.data && marketsQuery.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketsQuery.data.map((market) => (
                  <MarketCard
                    key={market.id}
                    id={market.id}
                    name={market.name}
                    openTime={market.openTime}
                    closeTime={market.closeTime}
                    isOpen={market.isOpen}
                    lastResult={market.lastResult}
                    linkToDetails={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No markets available at the moment
              </div>
            )}
          </div>
          
          {/* This section is now handled in the market-details page */}
          {false && selectedMarketId && (
            <>
              {/* Game Type Tabs */}
              <div className="mb-5 border-b border-gray-500">
                <div className="flex overflow-x-auto pb-2 gap-2">
                  {gameTypesQuery.isLoading ? (
                    <div className="py-2 px-4">Loading game types...</div>
                  ) : (
                    gameTypesQuery.data?.map((gameType) => (
                      <button
                        key={gameType.type}
                        className={cn(
                          "py-2 px-4 rounded-t-lg whitespace-nowrap",
                          activeGameType === gameType.type
                            ? "bg-[#3EA6FF] text-white font-medium"
                            : "hover:bg-[#0A1018]"
                        )}
                        onClick={() => {
                          setActiveGameType(gameType.type as GameType);
                          resetSelections();
                        }}
                      >
                        {gameType.type.charAt(0).toUpperCase() + gameType.type.slice(1)}
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Game Type Content */}
              <div className="game-content-container">
                {/* Jodi Game */}
                {activeGameType === "jodi" && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Jodi Game</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Select any number between 00-99. Win {currentOdds}x if your number matches exactly!
                    </p>
                    
                    {/* Number Grid */}
                    <div className="grid grid-cols-10 gap-2 mb-6 sm:grid-cols-5 md:grid-cols-10">
                      {Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0')).map((number) => (
                        <button
                          key={number}
                          className={cn(
                            "py-2 bg-[#0A1018] hover:bg-[#3EA6FF]/20 rounded font-mono text-center border",
                            jodiSelection === number
                              ? "border-[#3EA6FF] bg-[#3EA6FF]/20"
                              : "border-gray-500/50"
                          )}
                          onClick={() => setJodiSelection(number)}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Odd-Even Game */}
                {activeGameType === "odd-even" && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Odd-Even Game</h3>
                    <p className="text-sm text-gray-300 mb-6">
                      Bet on whether the result will be an Odd or Even number. Win {currentOdds}x your bet amount!
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <button
                        className={cn(
                          "flex-1 p-6 bg-[#0A1018] hover:bg-[#3EA6FF]/20 rounded-lg border-2 flex flex-col items-center",
                          oddEvenSelection === "odd"
                            ? "border-[#3EA6FF] bg-[#3EA6FF]/10"
                            : "border-gray-500 hover:border-[#3EA6FF]"
                        )}
                        onClick={() => setOddEvenSelection("odd")}
                      >
                        <span className="text-3xl mb-2">1,3,5,7,9...</span>
                        <span className="font-medium">ODD</span>
                      </button>
                      
                      <button
                        className={cn(
                          "flex-1 p-6 bg-[#0A1018] hover:bg-[#3EA6FF]/20 rounded-lg border-2 flex flex-col items-center",
                          oddEvenSelection === "even"
                            ? "border-[#3EA6FF] bg-[#3EA6FF]/10"
                            : "border-gray-500 hover:border-[#3EA6FF]"
                        )}
                        onClick={() => setOddEvenSelection("even")}
                      >
                        <span className="text-3xl mb-2">0,2,4,6,8...</span>
                        <span className="font-medium">EVEN</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Hurf Game */}
                {activeGameType === "hurf" && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Hurf Game</h3>
                    <p className="text-sm text-gray-300 mb-6">
                      Bet on specific position digits (left or right). Win {currentOdds}x for single match or higher for both matches!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Left Digit Selection */}
                      <div className="bg-[#0A1018] rounded-lg p-4">
                        <h4 className="font-medium mb-2 text-center">Left Digit (Tens Position)</h4>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          {Array.from({ length: 10 }, (_, i) => i.toString()).map((digit) => (
                            <button
                              key={`left-${digit}`}
                              className={cn(
                                "p-2 bg-[#0F1923] hover:bg-[#3EA6FF]/20 rounded font-mono text-xl text-center border",
                                hurfLeftDigit === digit
                                  ? "border-[#3EA6FF] bg-[#3EA6FF]/20"
                                  : "border-gray-500/50"
                              )}
                              onClick={() => setHurfLeftDigit(digit)}
                            >
                              {digit}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Right Digit Selection */}
                      <div className="bg-[#0A1018] rounded-lg p-4">
                        <h4 className="font-medium mb-2 text-center">Right Digit (Units Position)</h4>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          {Array.from({ length: 10 }, (_, i) => i.toString()).map((digit) => (
                            <button
                              key={`right-${digit}`}
                              className={cn(
                                "p-2 bg-[#0F1923] hover:bg-[#3EA6FF]/20 rounded font-mono text-xl text-center border",
                                hurfRightDigit === digit
                                  ? "border-[#3EA6FF] bg-[#3EA6FF]/20"
                                  : "border-gray-500/50"
                              )}
                              onClick={() => setHurfRightDigit(digit)}
                            >
                              {digit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Cross Game */}
                {activeGameType === "cross" && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Cross Game</h3>
                    <p className="text-sm text-gray-300 mb-6">
                      Select multiple digits to generate permutations. Odds vary based on your selections!
                    </p>
                    
                    <div className="bg-[#0A1018] rounded-lg p-4 mb-6">
                      <h4 className="font-medium mb-2 text-center">Select Digits (2-4 digits)</h4>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-4">
                        {Array.from({ length: 10 }, (_, i) => i.toString()).map((digit) => (
                          <button
                            key={digit}
                            className={cn(
                              "p-2 bg-[#0F1923] hover:bg-[#3EA6FF]/20 rounded font-mono text-xl text-center border",
                              crossDigits.includes(digit)
                                ? "border-[#3EA6FF] bg-[#3EA6FF]/20"
                                : "border-gray-500/50"
                            )}
                            onClick={() => toggleCrossDigit(digit)}
                          >
                            {digit}
                          </button>
                        ))}
                      </div>
                      
                      <div className="bg-[#0F1923] rounded-lg p-3 mb-4">
                        <h5 className="text-sm font-medium mb-2">Generated Permutations</h5>
                        <div className="text-sm font-mono min-h-6 text-gray-300">
                          {crossPermutations.length > 0
                            ? crossPermutations.join(", ")
                            : "Select 2-4 digits to see permutations"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Betting Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2 bg-[#0F1923] p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Your Selection</h4>
                    <div className="min-h-10 mb-4 border border-dashed border-gray-500 rounded-lg p-2 text-center text-gray-300">
                      {activeGameType === "jodi" && (jodiSelection || "No number selected")}
                      {activeGameType === "odd-even" && (oddEvenSelection || "No selection made")}
                      {activeGameType === "hurf" && (
                        <>
                          {hurfLeftDigit && `Left: ${hurfLeftDigit}`}
                          {hurfLeftDigit && hurfRightDigit && ", "}
                          {hurfRightDigit && `Right: ${hurfRightDigit}`}
                          {!hurfLeftDigit && !hurfRightDigit && "No digits selected"}
                        </>
                      )}
                      {activeGameType === "cross" && (
                        crossDigits.length > 0 
                          ? `Selected: ${crossDigits.join(", ")}`
                          : "No digits selected"
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm mb-1">Bet Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full py-2 px-3 bg-[#1A2C3D] border border-gray-500 rounded-lg focus:outline-none focus:border-[#3EA6FF]"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {activeGameType === "cross" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Current Odds:</span>
                          <span className="font-mono">{currentOdds}x</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Potential Win:</span>
                        <span className="font-mono">₹{potentialWin.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#FF7C48] hover:bg-[#FF7C48]/80"
                      onClick={handlePlaceBet}
                      disabled={betMutation.isPending || !selectedMarket?.isOpen}
                    >
                      {betMutation.isPending ? "Placing Bet..." : "Place Bet"}
                    </Button>
                    {!selectedMarket?.isOpen && (
                      <p className="text-xs text-[#FF3B58] mt-2 text-center">
                        This market is currently closed
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-[#0F1923] p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Market Information</h4>
                    <div className="text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Market:</span>
                        <span>{selectedMarket?.name || "None selected"}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Status:</span>
                        <span className={selectedMarket?.isOpen ? "text-[#00C853]" : "text-[#FF3B58]"}>
                          {selectedMarket?.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Closes at:</span>
                        <span>{selectedMarket?.closeTime || "N/A"}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Last Result:</span>
                        <span className="font-mono font-medium">
                          {selectedMarket?.lastResult || "Pending"}
                        </span>
                      </div>
                    </div>
                    
                    {activeGameType === "cross" && (
                      <>
                        <h4 className="font-medium mt-4 mb-2">Odds Information</h4>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300">2 digits (2 permutations):</span>
                            <span>45x</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300">3 digits (6 permutations):</span>
                            <span>15x</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-300">4 digits (12 permutations):</span>
                            <span>7.5x</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
