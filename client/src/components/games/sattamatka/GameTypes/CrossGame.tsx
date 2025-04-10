import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CrossGameProps {
  marketId: number;
  gameTypeId: number;
  odds: number;
}

const CrossGame: React.FC<CrossGameProps> = ({ marketId, gameTypeId, odds }) => {
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();
  const [selectedDigits, setSelectedDigits] = useState<string[]>([]);
  const [permutations, setPermutations] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [effectiveOdds, setEffectiveOdds] = useState(odds);
  const { toast } = useToast();
  
  // Generate digits 0-9
  const digits = Array.from({ length: 10 }, (_, i) => String(i));
  
  // Generate permutations whenever selected digits change
  useEffect(() => {
    if (selectedDigits.length < 2) {
      setPermutations([]);
      return;
    }
    
    const newPermutations: string[] = [];
    
    for (let i = 0; i < selectedDigits.length; i++) {
      for (let j = 0; j < selectedDigits.length; j++) {
        if (i !== j) {
          newPermutations.push(selectedDigits[i] + selectedDigits[j]);
        }
      }
    }
    
    setPermutations(newPermutations);
    
    // Adjust odds based on number of digits selected
    if (selectedDigits.length === 2) {
      setEffectiveOdds(45);
    } else if (selectedDigits.length === 3) {
      setEffectiveOdds(15);
    } else if (selectedDigits.length >= 4) {
      setEffectiveOdds(7.5);
    } else {
      setEffectiveOdds(odds);
    }
  }, [selectedDigits, odds]);
  
  const handleSelectDigit = (digit: string) => {
    setSelectedDigits(prev => {
      if (prev.includes(digit)) {
        return prev.filter(d => d !== digit);
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Maximum reached",
            description: "You can select up to 5 digits maximum",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, digit];
      }
    });
  };
  
  const handleClearSelection = () => {
    setSelectedDigits([]);
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
    return betAmount * effectiveOdds;
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
    
    if (selectedDigits.length < 2) {
      toast({
        title: 'Insufficient selection',
        description: 'Please select at least 2 digits',
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
        selection: selectedDigits.join(','),
        potentialWin: calculatePotentialWin()
      });
      
      const data = await response.json();
      
      toast({
        title: 'Bet placed successfully',
        description: `Your Cross bet with ${permutations.length} permutations has been placed. Good luck!`,
        variant: 'default',
      });
      
      refreshBalance();
      setSelectedDigits([]);
      
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
  
  return (
    <div id="cross-game" className="mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Cross - Select multiple digits</h3>
        <p className="text-textSecondary text-sm">
          Win if any permutation matches the result
          <br />
          2 digits: x45 | 3 digits: x15 | 4+ digits: x7.5
        </p>
      </div>
      
      {/* Digit Selection Grid */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Select Digits (2-5)</h4>
        <div className="grid grid-cols-5 gap-2">
          {digits.map((digit) => (
            <button
              key={digit}
              className={`py-3 rounded-md ${
                selectedDigits.includes(digit)
                  ? 'bg-accent text-white'
                  : 'bg-primary hover:bg-primary-darker'
              } border border-primary-lighter font-mono text-center transition-all duration-200`}
              onClick={() => handleSelectDigit(digit)}
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
      
      {/* Permutations Display */}
      {permutations.length > 0 && (
        <div className="bg-primary-darker p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Possible Permutations</h4>
            <span className="text-sm text-accent">{permutations.length} combinations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {permutations.map((perm, index) => (
              <span 
                key={index} 
                className="bg-primary-lighter px-2 py-1 rounded font-mono text-sm"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Bet Placement */}
      <div className="bg-primary p-4 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <p className="text-textSecondary mb-1">Selected Digits</p>
            {selectedDigits.length > 0 ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1 flex-wrap">
                  {selectedDigits.map((digit, index) => (
                    <span 
                      key={index}
                      className="bg-accent-darker px-2 py-1 rounded font-mono"
                    >
                      {digit}
                    </span>
                  ))}
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
              ₹{calculatePotentialWin().toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-textSecondary">
              Current odds: x{effectiveOdds}
            </p>
          </div>
          <Button
            className="bet-button px-8 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent-darker"
            onClick={handlePlaceBet}
            disabled={isSubmitting || selectedDigits.length < 2}
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

export default CrossGame;
