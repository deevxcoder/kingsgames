import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/lib/websocket';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CoinTossResult = {
  id: number;
  result: 'heads' | 'tails';
  createdAt: string;
};

const CoinTossGame: React.FC = () => {
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [potentialWin, setPotentialWin] = useState(20);
  const { toast } = useToast();
  const { addMessageListener } = useWebSocket();
  const coinRef = useRef<HTMLDivElement>(null);
  
  const { data: recentResults = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ['/api/coin-toss/history'],
    staleTime: 60000, // 1 minute
  });
  
  useEffect(() => {
    // Calculate potential win whenever bet amount changes
    setPotentialWin(betAmount * 2);
  }, [betAmount]);
  
  useEffect(() => {
    // Listen for coin toss results from WebSocket
    const removeListener = addMessageListener('coinTossResult', (data) => {
      if (data.result) {
        setResult(data.result);
        setHasWon(data.won);
        
        // Update balance if this is the user's bet
        if (user && user.id === data.userId) {
          refreshBalance();
        }
      }
    });
    
    return removeListener;
  }, [addMessageListener, user, refreshBalance]);
  
  const handleSelectSide = (side: 'heads' | 'tails') => {
    setSelectedSide(side);
  };
  
  const handleSetBetAmount = (amount: number) => {
    setBetAmount(amount);
  };
  
  const handleChangeBetAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };
  
  const flipCoin = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to place bets',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedSide) {
      toast({
        title: 'Select a side',
        description: 'Please select either Heads or Tails',
        variant: 'destructive',
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: 'Invalid bet amount',
        description: 'Please enter a valid bet amount',
        variant: 'destructive',
      });
      return;
    }
    
    if (betAmount > balance) {
      toast({
        title: 'Insufficient balance',
        description: 'Please deposit more funds or reduce your bet amount',
        variant: 'destructive',
      });
      return;
    }
    
    setIsFlipping(true);
    setResult(null);
    setHasWon(null);
    
    // Animate coin flip
    if (coinRef.current) {
      coinRef.current.style.animation = 'none';
      // Trigger reflow
      void coinRef.current.offsetWidth;
      coinRef.current.style.animation = 'flip 1s ease-in-out forwards';
    }
    
    try {
      const response = await apiRequest('POST', '/api/coin-toss', {
        amount: betAmount,
        selection: selectedSide
      });
      
      const data = await response.json();
      
      // Wait for animation to complete before showing result
      setTimeout(() => {
        setResult(data.result);
        setHasWon(data.won);
        refreshBalance();
        setIsFlipping(false);
        
        // Show toast notification
        if (data.won) {
          toast({
            title: 'You won!',
            description: `Congratulations! You won $${data.winAmount.toFixed(2)}`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'You lost',
            description: 'Better luck next time!',
            variant: 'destructive',
          });
        }
      }, 1000);
      
    } catch (error) {
      setIsFlipping(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to place bet',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="bg-primary-lighter rounded-xl p-6">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Choose Your Side</h3>
            <div className="flex space-x-4">
              <Button
                className={`bet-button flex-1 py-3 px-4 rounded-lg ${
                  selectedSide === 'heads'
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-medium border-2 border-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                    : 'bg-primary border border-primary-lighter text-white font-medium hover:border-yellow-600'
                }`}
                onClick={() => handleSelectSide('heads')}
                disabled={isFlipping}
              >
                <div className="flex items-center justify-center">
                  <i className="ri-record-circle-line mr-2 text-xl"></i>
                  Heads
                </div>
              </Button>
              <Button
                className={`bet-button flex-1 py-3 px-4 rounded-lg ${
                  selectedSide === 'tails'
                    ? 'bg-gradient-to-br from-secondary to-secondary-darker text-white font-medium hover:from-secondary-darker hover:to-secondary-darker'
                    : 'bg-primary border border-primary-lighter text-white font-medium hover:border-secondary'
                }`}
                onClick={() => handleSelectSide('tails')}
                disabled={isFlipping}
              >
                <div className="flex items-center justify-center">
                  <i className="ri-record-circle-line mr-2 text-xl"></i>
                  Tails
                </div>
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Bet Amount</h3>
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <Input
                  type="number"
                  value={betAmount}
                  min="1"
                  onChange={handleChangeBetAmount}
                  className="w-full bg-primary border border-primary-lighter rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isFlipping}
                />
                <span className="absolute right-4 top-3 text-textSecondary">₹</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  className="bet-button py-2 rounded bg-primary border border-primary-lighter text-white hover:border-accent"
                  onClick={() => handleSetBetAmount(5)}
                  disabled={isFlipping}
                >
                  ₹5
                </Button>
                <Button
                  className="bet-button py-2 rounded bg-primary border border-primary-lighter text-white hover:border-accent"
                  onClick={() => handleSetBetAmount(10)}
                  disabled={isFlipping}
                >
                  ₹10
                </Button>
                <Button
                  className="bet-button py-2 rounded bg-primary border border-primary-lighter text-white hover:border-accent"
                  onClick={() => handleSetBetAmount(25)}
                  disabled={isFlipping}
                >
                  ₹25
                </Button>
                <Button
                  className="bet-button py-2 rounded bg-primary border border-primary-lighter text-white hover:border-accent"
                  onClick={() => handleSetBetAmount(50)}
                  disabled={isFlipping}
                >
                  ₹50
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-textSecondary">Potential Win</p>
              <p className="text-accent text-xl font-medium">₹{potentialWin.toLocaleString('en-IN')}</p>
            </div>
            <Button
              className="bet-button px-10 py-3 rounded-lg bg-accent text-white font-medium text-lg hover:bg-accent-darker"
              onClick={flipCoin}
              disabled={isFlipping || !selectedSide}
            >
              {isFlipping ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Flipping...
                </span>
              ) : (
                'Flip Coin'
              )}
            </Button>
          </div>
        </div>
        
        <div className="md:w-1/3 flex flex-col items-center justify-center py-8 md:py-0">
          <div className="coin relative" ref={coinRef}>
            <div 
              className={`coin-side heads flex items-center justify-center absolute w-24 h-24 rounded-full backface-hidden ${
                result === 'tails' ? 'rotate-y-180' : ''
              }`}
              style={{
                background: 'linear-gradient(45deg, #f9a825, #fbc02d)',
                backfaceVisibility: 'hidden',
                transform: result === 'tails' ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              <i className="ri-coin-line text-5xl text-white"></i>
            </div>
            <div 
              className={`coin-side tails flex items-center justify-center absolute w-24 h-24 rounded-full backface-hidden ${
                result === 'heads' ? 'rotate-y-180' : ''
              }`}
              style={{
                background: 'linear-gradient(45deg, #9575cd, #7e57c2)',
                backfaceVisibility: 'hidden',
                transform: result === 'heads' ? 'rotateY(180deg)' : 'rotateY(180deg)'
              }}
            >
              <i className="ri-coin-line text-5xl text-white"></i>
            </div>
          </div>
          
          <AnimatePresence>
            {hasWon !== null && !isFlipping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  hasWon ? 'bg-success bg-opacity-20 text-success' : 'bg-danger bg-opacity-20 text-danger'
                }`}
              >
                {hasWon ? 'You won!' : 'You lost'}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!result && !isFlipping && (
            <p className="mt-6 text-center text-textSecondary">Click "Flip Coin" to start</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-primary-lighter">
        <h3 className="text-lg font-medium mb-3">Recent Results</h3>
        {isLoadingResults ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {recentResults.map((result: CoinTossResult) => (
              <div
                key={result.id}
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: result.result === 'heads'
                    ? 'linear-gradient(45deg, #f9a825, #fbc02d)'
                    : 'linear-gradient(45deg, #9575cd, #7e57c2)'
                }}
              >
                <span className="text-white font-medium">
                  {result.result === 'heads' ? 'H' : 'T'}
                </span>
              </div>
            ))}
            
            {recentResults.length === 0 && (
              <p className="text-textSecondary text-sm py-2">No recent results</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinTossGame;
