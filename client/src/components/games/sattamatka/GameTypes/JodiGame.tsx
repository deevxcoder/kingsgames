import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface JodiGameProps {
  marketId: number;
  gameTypeId: number;
  odds: number;
}

const JodiGame: React.FC<JodiGameProps> = ({ marketId, gameTypeId, odds }) => {
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSelectNumber = (num: string) => {
    setSelectedNumber(num);
  };
  
  const handleClearSelection = () => {
    setSelectedNumber(null);
  };
  
  const handleChangeBetAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };
  
  const handleDecreaseBet = () => {
    if (betAmount > 1) {
      setBetAmount(betAmount - 1);
    }
  };
  
  const handleIncreaseBet = () => {
    setBetAmount(betAmount + 1);
  };
  
  const calculatePotentialWin = () => {
    return betAmount * odds;
  };
  
  const handlePlaceBet = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to place bets',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedNumber) {
      toast({
        title: 'Select a number',
        description: 'Please select a number from 00 to 99',
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
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/bets', {
        marketId,
        gameTypeId,
        amount: betAmount,
        selection: selectedNumber,
        potentialWin: calculatePotentialWin()
      });
      
      const data = await response.json();
      
      toast({
        title: 'Bet placed successfully',
        description: `You've placed a bet on ${selectedNumber}. Good luck!`,
        variant: 'default',
      });
      
      refreshBalance();
      setSelectedNumber(null);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to place bet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate all 100 numbers from 00 to 99
  const allNumbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));
  
  return (
    <div id="jodi-game" className="mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Jodi - Select a two-digit number</h3>
        <p className="text-textSecondary text-sm">Win x{odds} if your number matches the result</p>
      </div>
      
      {/* Number Grid */}
      <div className="number-grid grid grid-cols-10 gap-2 mb-6">
        {allNumbers.map((num) => (
          <button
            key={num}
            className={`py-3 rounded-md ${
              selectedNumber === num
                ? 'bg-accent text-white'
                : 'bg-primary hover:bg-primary-darker'
            } border border-primary-lighter font-mono text-center transition-all duration-200`}
            onClick={() => handleSelectNumber(num)}
          >
            {num}
          </button>
        ))}
      </div>
      
      {/* Bet Placement */}
      <div className="bg-primary p-4 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <p className="text-textSecondary mb-1">Selected Number</p>
            {selectedNumber ? (
              <div className="flex items-center space-x-2">
                <span className="bg-accent-darker px-3 py-1 rounded font-mono text-lg">
                  {selectedNumber}
                </span>
                <button
                  className="text-textSecondary hover:text-danger"
                  onClick={handleClearSelection}
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            ) : (
              <span className="text-textSecondary">None selected</span>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-textSecondary mb-1">Bet Amount</p>
            <div className="flex items-center space-x-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded bg-primary-lighter text-white"
                onClick={handleDecreaseBet}
                disabled={betAmount <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={betAmount}
                min="1"
                onChange={handleChangeBetAmount}
                className="w-20 bg-primary-lighter border border-primary-lighter rounded py-1 px-2 text-center text-white focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                className="w-8 h-8 flex items-center justify-center rounded bg-primary-lighter text-white"
                onClick={handleIncreaseBet}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-textSecondary">Potential Win</p>
            <p className="text-accent text-xl font-medium">
              ${calculatePotentialWin().toFixed(2)}
            </p>
          </div>
          <Button
            className="bet-button px-8 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-darker"
            onClick={handlePlaceBet}
            disabled={isSubmitting || !selectedNumber}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing...
              </span>
            ) : (
              'Place Bet'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JodiGame;
