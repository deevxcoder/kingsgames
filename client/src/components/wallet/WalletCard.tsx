import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WalletCard: React.FC = () => {
  const { balance, refreshBalance } = useWallet();
  const { toast } = useToast();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };
  
  const handleDepositSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/wallet/deposit', { amount: Number(amount) });
      const result = await response.json();
      
      toast({
        title: "Deposit successful",
        description: `${formatBalance(Number(amount))} has been added to your wallet`,
        variant: "default"
      });
      
      setAmount('');
      setDepositOpen(false);
      refreshBalance();
      
    } catch (error) {
      toast({
        title: "Deposit failed",
        description: error.message || "Failed to make deposit",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleWithdrawSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    if (Number(amount) > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/wallet/withdraw', { amount: Number(amount) });
      const result = await response.json();
      
      toast({
        title: "Withdrawal successful",
        description: `${formatBalance(Number(amount))} has been withdrawn from your wallet`,
        variant: "default"
      });
      
      setAmount('');
      setWithdrawOpen(false);
      refreshBalance();
      
    } catch (error) {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <>
      <div className="p-4 m-4 rounded-lg bg-primary-lighter">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-textSecondary">Balance</span>
          <button 
            className="text-accent hover:text-accent-lighter text-sm"
            onClick={() => setDepositOpen(true)}
          >
            <i className="ri-add-circle-line mr-1"></i> Add
          </button>
        </div>
        <div className="text-xl font-semibold">{formatBalance(balance)}</div>
        <div className="flex mt-3 space-x-2">
          <button 
            className="bet-button flex-1 py-1.5 text-sm rounded bg-accent text-white font-medium hover:bg-accent-darker"
            onClick={() => setDepositOpen(true)}
          >
            Deposit
          </button>
          <button 
            className="bet-button flex-1 py-1.5 text-sm rounded border border-accent text-accent font-medium hover:bg-primary-darker"
            onClick={() => setWithdrawOpen(true)}
          >
            Withdraw
          </button>
        </div>
      </div>
      
      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="bg-primary-lighter border-primary-lighter text-white">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount to Deposit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary">$</span>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="100"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDepositOpen(false)}
              className="bg-transparent text-white border-primary-lighter"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDepositSubmit}
              disabled={processing}
              className="bg-accent hover:bg-accent-darker text-white border-none"
            >
              {processing ? "Processing..." : "Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="bg-primary-lighter border-primary-lighter text-white">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="withdraw-amount" className="text-sm font-medium">
                Amount to Withdraw
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary">$</span>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="1"
                  step="1"
                  max={balance}
                  placeholder="50"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-textSecondary">Available: {formatBalance(balance)}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setWithdrawOpen(false)}
              className="bg-transparent text-white border-primary-lighter"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleWithdrawSubmit}
              disabled={processing}
              className="bg-accent hover:bg-accent-darker text-white border-none"
            >
              {processing ? "Processing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletCard;
