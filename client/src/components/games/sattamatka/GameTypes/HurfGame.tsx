import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface HurfGameProps {
  marketId: number;
  gameTypeId: number;
  odds: number;
}

const HurfGame: React.FC<HurfGameProps> = ({ marketId, gameTypeId, odds }) => {
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();
  const [leftDigit, setLeftDigit] = useState<string | null>(null);
  const [rightDigit, setRightDigit] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSelectLeftDigit = (digit: string) => {
    setLeftDigit(digit === leftDigit ? null : digit);
  };
  
  const handleSelectRightDigit = (digit: string) => {
    setRightDigit(digit === rightDigit ? null : digit);
  };
  
  const handleClearSelection = () => {
    setLeftDigit(null);
    setRightDigit(null);
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
    if (leftDigit && rightDigit) {
      // For double match, use higher odds
      return betAmount * 80;
    } else if (leftDigit || rightDigit) {
      // For single match
      return betAmount * odds;
    }
    return 0;
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
    
    if (!leftDigit && !rightDigit) {
      toast({
        title: 'Make a selection',
        description: 'Please select at least one digit for left or right position',
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
    
    // Create selection string from selected digits
    let selection = '';
    if (leftDigit) {
      selection += `L:${leftDigit}`;
    }
    if (rightDigit) {
      selection += selection ? `,R:${rightDigit}` : `R:${rightDigit}`;
    }
    
    try {
      const response = await apiRequest('POST', '/api/bets', {
        marketId,
        gameTypeId,
        amount: betAmount,
        selection,
        potentialWin: calculatePotentialWin()
      });
      
      const data = await response.json();
      
      toast({
        title: 'Bet placed successfully',
        description: 'Your Hurf bet has been placed. Good luck!',
        variant: 'default',
      });
      
      refreshBalance();
      setLeftDigit(null);
      setRightDigit(null);
      
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
  
  // Generate digits 0-9
  const digits = Array.from({ length: 10 }, (_, i) => String(i));
  
  return (
    <div id="hurf-game" className="mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Hurf - Select digit position</h3>
        <p className="text-textSecondary text-sm">
          Win x{odds} for single match, x80 for double match
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Digit Selection */}
        <div>
          <h4 className="font-medium mb-2">Left Digit</h4>
          <div className="grid grid-cols-5 gap-2">
            {digits.map((digit) => (
              <button
                key={`left-${digit}`}
                className={`py-3 rounded-md ${
                  leftDigit === digit
                    ? 'bg-accent text-white'
                    : 'bg-primary hover:bg-primary-darker'
                } border border-primary-lighter font-mono text-center transition-all duration-200`}
                onClick={() => handleSelectLeftDigit(digit)}
              >
                {digit}
              </button>
            ))}
          </div>
        </div>
        
        {/* Right Digit Selection */}
        <div>
          <h4 className="font-medium mb-2">Right Digit</h4>
          <div className="grid grid-cols-5 gap-2">
            {digits.map((digit) => (
              <button
                key={`right-${digit}`}
                className={`py-3 rounded-md ${
                  rightDigit === digit
                    ? 'bg-accent text-white'
                    : 'bg-primary hover:bg-primary-darker'
                } border border-primary-lighter font-mono text-center transition-all duration-200`}
                onClick={() => handleSelectRightDigit(digit)}
              >
                {digit}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bet Placement */}
      <div className="bg-primary p-4 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <p className="text-textSecondary mb-1">Selected Digits</p>
            {(leftDigit || rightDigit) ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  {leftDigit && (
                    <span className="bg-accent-darker px-3 py-1 rounded font-mono">
                      L: {leftDigit}
                    </span>
                  )}
                  {rightDigit && (
                    <span className="bg-accent-darker px-3 py-1 rounded font-mono">
                      R: {rightDigit}
                    </span>
                  )}
                </div>
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
            {leftDigit && rightDigit && (
              <p className="text-xs text-success">Double match (x80 payout)</p>
            )}
          </div>
          <Button
            className="bet-button px-8 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-darker"
            onClick={handlePlaceBet}
            disabled={isSubmitting || (!leftDigit && !rightDigit)}
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

export default HurfGame;
