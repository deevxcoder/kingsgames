import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Coin } from "@/components/ui/coin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";

type CoinSide = "heads" | "tails" | null;

export default function CoinToss() {
  const { balance, refreshBalance } = useWallet();
  const { toast } = useToast();
  const [selectedSide, setSelectedSide] = useState<CoinSide>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [potentialWin, setPotentialWin] = useState(20);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<CoinSide>(null);
  const [gameStatus, setGameStatus] = useState<"idle" | "betting" | "result">("idle");
  
  // Handle WebSocket messages
  const onMessage = (message: any) => {
    if (message.type === 'coin-toss-result') {
      // Could handle real-time updates from other players here
    }
  };
  
  const { isConnected } = useWebSocket({ onMessage });
  
  // Calculate potential win amount when bet amount changes
  useEffect(() => {
    setPotentialWin(betAmount * 2);
  }, [betAmount]);
  
  // Handle betting
  const betMutation = useMutation({
    mutationFn: async (data: { betAmount: number; selection: CoinSide }) => {
      const res = await apiRequest('POST', '/api/games/coin-toss', data);
      return res.json();
    },
    onSuccess: (data) => {
      setCoinResult(data.result);
      setIsFlipping(true);
      setGameStatus("result");
      refreshBalance();
    },
    onError: (error: Error) => {
      toast({
        title: "Error placing bet",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handlePlaceBet = () => {
    if (!selectedSide) {
      toast({
        title: "Please select a side",
        description: "You need to select Heads or Tails before placing a bet",
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
    
    betMutation.mutate({ betAmount, selection: selectedSide });
    setGameStatus("betting");
  };
  
  const handleFlipEnd = () => {
    setIsFlipping(false);
    
    if (coinResult === selectedSide) {
      toast({
        title: "You won!",
        description: `Congratulations! You've won $${betAmount * 2}.`,
        variant: "success",
      });
    } else {
      toast({
        title: "You lost",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }
  };
  
  const handleReset = () => {
    setSelectedSide(null);
    setCoinResult(null);
    setGameStatus("idle");
  };
  
  const decreaseBet = () => {
    if (betAmount > 1) {
      setBetAmount(prev => prev - 1);
    }
  };
  
  const increaseBet = () => {
    setBetAmount(prev => prev + 1);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Coin Toss</h2>
      </div>
      
      <Card className="bg-[#1A2C3D] border-gray-500/30">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Coin Animation Section */}
            <div className="flex flex-col items-center justify-center flex-1">
              <Coin 
                result={coinResult}
                isFlipping={isFlipping}
                onFlipEnd={handleFlipEnd}
              />
              
              <div className="h-6 mb-4 font-medium text-center">
                {gameStatus === "result" && !isFlipping && (
                  <span className={coinResult === selectedSide ? "text-[#00C853]" : "text-[#FF3B58]"}>
                    Result: {coinResult?.toUpperCase()}
                  </span>
                )}
              </div>
              
              {gameStatus === "idle" && (
                <Button 
                  className="bg-[#3EA6FF] hover:bg-[#4DB8FF]"
                  disabled={betMutation.isPending}
                  onClick={handlePlaceBet}
                >
                  Flip Coin
                </Button>
              )}
              
              {gameStatus === "result" && !isFlipping && (
                <Button 
                  className="bg-[#FF7C48] hover:bg-[#FF7C48]/80"
                  onClick={handleReset}
                >
                  Play Again
                </Button>
              )}
            </div>
            
            {/* Betting Section */}
            <div className="flex-1 p-4 bg-[#0F1923] rounded-xl">
              <h3 className="text-lg font-medium mb-4">Place Your Bet</h3>
              
              {/* Bet Selection */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-1">Select Outcome</label>
                <div className="flex gap-3 mb-4">
                  <button 
                    className={`flex-1 py-3 border-2 rounded-lg hover:border-[#3EA6FF] text-center ${
                      selectedSide === "heads" 
                        ? "border-[#3EA6FF] bg-[#3EA6FF]/10" 
                        : "border-gray-500"
                    }`}
                    onClick={() => setSelectedSide("heads")}
                    disabled={gameStatus !== "idle"}
                  >
                    Heads
                  </button>
                  <button 
                    className={`flex-1 py-3 border-2 rounded-lg hover:border-[#3EA6FF] text-center ${
                      selectedSide === "tails" 
                        ? "border-[#3EA6FF] bg-[#3EA6FF]/10" 
                        : "border-gray-500"
                    }`}
                    onClick={() => setSelectedSide("tails")}
                    disabled={gameStatus !== "idle"}
                  >
                    Tails
                  </button>
                </div>
              </div>
              
              {/* Bet Amount */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-1">Bet Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full py-2 px-3 bg-[#1A2C3D] border border-gray-500 rounded-lg focus:outline-none focus:border-[#3EA6FF]"
                    disabled={gameStatus !== "idle"}
                  />
                  <div className="absolute right-0 top-0 h-full flex">
                    <button 
                      className="px-3 flex items-center justify-center hover:text-[#3EA6FF]"
                      onClick={decreaseBet}
                      disabled={gameStatus !== "idle"}
                    >
                      -
                    </button>
                    <button 
                      className="px-3 flex items-center justify-center hover:text-[#3EA6FF]"
                      onClick={increaseBet}
                      disabled={gameStatus !== "idle"}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-300 mb-4">
                <span>Potential Win:</span>
                <span className="font-mono">${potentialWin.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full bg-[#FF7C48] hover:bg-[#FF7C48]/80"
                onClick={handlePlaceBet}
                disabled={!selectedSide || gameStatus !== "idle" || betMutation.isPending}
              >
                {betMutation.isPending ? "Placing Bet..." : "Place Bet"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
