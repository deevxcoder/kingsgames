import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Wallet() {
  const { balance, refreshBalance } = useWallet();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState(100);
  
  // Fetch transaction history (would be implemented in a real app)
  const { data: bets, isLoading } = useQuery({
    queryKey: ['/api/bets'],
  });
  
  const handleDeposit = () => {
    toast({
      title: "Deposit Feature",
      description: "In a real app, this would connect to a payment processor. For now, this is just a demo.",
      variant: "default",
    });
  };
  
  const handleWithdraw = () => {
    toast({
      title: "Withdraw Feature",
      description: "In a real app, this would connect to a payment processor. For now, this is just a demo.",
      variant: "default",
    });
  };
  
  const depositOptions = [100, 500, 1000, 5000];
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Wallet</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#1A2C3D] border-gray-500/30 col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-mono font-bold mb-4">₹{parseFloat(balance).toLocaleString('en-IN')}</div>
              <Button
                className="w-full bg-[#3EA6FF] hover:bg-[#4DB8FF] mb-2"
                onClick={refreshBalance}
              >
                Refresh Balance
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1A2C3D] border-gray-500/30 col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Deposit Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {depositOptions.map((amount) => (
                  <button
                    key={amount}
                    className={`py-2 border-2 rounded-lg text-center ${
                      depositAmount === amount 
                        ? "border-[#3EA6FF] bg-[#3EA6FF]/10" 
                        : "border-gray-500 hover:border-[#3EA6FF]"
                    }`}
                    onClick={() => setDepositAmount(amount)}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
              
              <label className="block text-sm text-gray-300 mb-2">
                Or Enter Custom Amount
              </label>
              <div className="relative mb-4">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                  className="w-full py-2 px-3 bg-[#0F1923] border border-gray-500 rounded-lg focus:outline-none focus:border-[#3EA6FF]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="w-full bg-[#3EA6FF] hover:bg-[#4DB8FF]"
                  onClick={handleDeposit}
                >
                  Deposit
                </Button>
                <Button
                  className="w-full bg-[#0F1923] hover:bg-[#1A2C3D] border border-gray-500"
                  onClick={handleWithdraw}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      <Card className="bg-[#1A2C3D] border-gray-500/30">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-500/30">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Game</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">Loading transaction history...</td>
                  </tr>
                ) : bets && bets.length > 0 ? (
                  bets.map((bet) => (
                    <tr key={bet.id} className="border-b border-gray-500/20">
                      <td className="py-3 px-4">
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {bet.gameType === "coin-toss" ? "Coin Toss" : bet.gameType.charAt(0).toUpperCase() + bet.gameType.slice(1)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {bet.status === "won" ? (
                          <>
                            <span className="text-[#00C853]">+₹{parseFloat(bet.winAmount).toLocaleString('en-IN')}</span>
                          </>
                        ) : (
                          <span className="text-[#FF3B58]">-₹{parseFloat(bet.betAmount).toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">Bet</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          bet.status === "won" 
                            ? "bg-[#00C853]/20 text-[#00C853]" 
                            : bet.status === "lost"
                              ? "bg-[#FF3B58]/20 text-[#FF3B58]"
                              : "bg-yellow-500/20 text-yellow-500"
                        }`}>
                          {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">No transaction history available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
