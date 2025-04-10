import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/utils";

export default function BetHistory() {
  const { user } = useAuth();
  
  // Fetch bet history
  const { data: bets = [], isLoading: isLoadingBets } = useQuery({
    queryKey: ['/api/bets'],
    enabled: !!user,
  });
  
  // Fetch transactions history (deposits and withdrawals)
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });
  
  // Sample transactions data for UI demonstration
  const sampleTransactions = [
    { id: 1, type: 'deposit', amount: 1000, status: 'completed', createdAt: new Date().toISOString() },
    { id: 2, type: 'withdrawal', amount: 500, status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, type: 'deposit', amount: 2000, status: 'completed', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];
  
  // Combine all transaction types for "All" tab
  const allTransactions = [
    ...bets.map(bet => ({
      id: `bet-${bet.id}`,
      type: 'bet',
      gameType: bet.gameType?.name || bet.gameType,
      amount: bet.amount,
      selection: bet.selection,
      status: bet.status,
      result: bet.result,
      createdAt: bet.createdAt
    })),
    ...sampleTransactions.map(tx => ({
      id: `tx-${tx.id}`,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const getTransactionStatusColor = (status) => {
    switch (status) {
      case 'won':
        return 'bg-[#00C853]/20 text-[#00C853]';
      case 'lost':
        return 'bg-[#FF3B58]/20 text-[#FF3B58]';
      case 'completed':
        return 'bg-[#00C853]/20 text-[#00C853]';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };
  
  const formatStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="bets">Bets</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        
        {/* All Transactions Tab */}
        <TabsContent value="all">
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-500/30">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Details</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingBets || isLoadingTransactions ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center">Loading transactions...</td>
                      </tr>
                    ) : allTransactions.length > 0 ? (
                      allTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 capitalize">
                            {transaction.type === 'bet' ? 'Bet' : transaction.type}
                          </td>
                          <td className="py-3 px-4">
                            {transaction.type === 'bet' ? (
                              <div>
                                <div>{transaction.gameType || 'Game'}</div>
                                <div className="text-xs text-gray-400">
                                  {transaction.selection && `Selection: ${transaction.selection}`}
                                </div>
                              </div>
                            ) : (
                              transaction.type === 'deposit' ? 'Wallet deposit' : 'Wallet withdrawal'
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {transaction.type === 'withdrawal' ? `-${formatCurrency(transaction.amount)}` : formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTransactionStatusColor(transaction.status)}`}>
                              {formatStatusText(transaction.status)}
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
        </TabsContent>
        
        {/* Bets Tab */}
        <TabsContent value="bets">
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-500/30">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Game</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Selection</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Result</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingBets ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center">Loading bet history...</td>
                      </tr>
                    ) : bets.length > 0 ? (
                      bets.map((bet) => (
                        <tr key={bet.id} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">
                            {new Date(bet.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {typeof bet.gameType === 'string' 
                              ? (bet.gameType === "coin-toss" ? "Coin Toss" : bet.gameType.charAt(0).toUpperCase() + bet.gameType.slice(1))
                              : bet.gameType?.name}
                          </td>
                          <td className="py-3 px-4 font-mono">{bet.selection}</td>
                          <td className="py-3 px-4 font-mono">{formatCurrency(bet.amount)}</td>
                          <td className="py-3 px-4 font-mono">{bet.result || "Pending"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTransactionStatusColor(bet.status)}`}>
                              {formatStatusText(bet.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center">No bet history available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Deposits Tab */}
        <TabsContent value="deposits">
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-500/30">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTransactions ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center">Loading deposit history...</td>
                      </tr>
                    ) : sampleTransactions.filter(tx => tx.type === 'deposit').length > 0 ? (
                      sampleTransactions.filter(tx => tx.type === 'deposit').map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-mono">{formatCurrency(tx.amount)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTransactionStatusColor(tx.status)}`}>
                              {formatStatusText(tx.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center">No deposit history available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-500/30">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTransactions ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center">Loading withdrawal history...</td>
                      </tr>
                    ) : sampleTransactions.filter(tx => tx.type === 'withdrawal').length > 0 ? (
                      sampleTransactions.filter(tx => tx.type === 'withdrawal').map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-mono">{formatCurrency(tx.amount)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTransactionStatusColor(tx.status)}`}>
                              {formatStatusText(tx.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center">No withdrawal history available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
