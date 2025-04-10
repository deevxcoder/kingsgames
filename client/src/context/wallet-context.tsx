import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  balance: string;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  balance: "0",
  refreshBalance: async () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<string>("0");
  const { toast } = useToast();

  // Update wallet balance when user changes
  useEffect(() => {
    if (user) {
      setBalance(user.walletBalance);
    } else {
      setBalance("0");
    }
  }, [user]);

  const refreshBalance = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/wallet', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      } else {
        throw new Error("Failed to fetch wallet balance");
      }
    } catch (err) {
      console.error('Wallet refresh error:', err);
      toast({
        title: "Error",
        description: "Failed to refresh wallet balance",
        variant: "destructive",
      });
    }
  };

  const value = {
    balance,
    refreshBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
