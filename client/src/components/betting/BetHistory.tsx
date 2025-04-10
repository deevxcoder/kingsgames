import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

type Bet = {
  id: number;
  userId: number;
  marketId: number;
  gameTypeId: number;
  amount: number;
  selection: string;
  potentialWin: number;
  result: string | null;
  status: string;
  createdAt: string;
  market: {
    id: number;
    name: string;
  };
  gameType: {
    id: number;
    name: string;
  };
};

const BetHistory: React.FC = () => {
  const { user } = useAuth();
  
  const { data: bets = [], isLoading } = useQuery({
    queryKey: ['/api/bets'],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded bg-warning bg-opacity-20 text-warning text-sm">Pending</span>;
      case 'won':
        return <span className="px-2 py-1 rounded bg-success bg-opacity-20 text-success text-sm">Won</span>;
      case 'lost':
        return <span className="px-2 py-1 rounded bg-danger bg-opacity-20 text-danger text-sm">Lost</span>;
      default:
        return <span className="px-2 py-1 rounded bg-primary-lighter text-sm">{status}</span>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="mt-6 pt-6 border-t border-primary-lighter">
        <h3 className="text-lg font-medium mb-3">Your Recent Bets</h3>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }
  
  if (bets.length === 0) {
    return (
      <div className="mt-6 pt-6 border-t border-primary-lighter">
        <h3 className="text-lg font-medium mb-3">Your Recent Bets</h3>
        <div className="p-6 bg-primary rounded-lg text-center">
          <p className="text-textSecondary">You haven't placed any bets yet.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-6 pt-6 border-t border-primary-lighter">
      <h3 className="text-lg font-medium mb-3">Your Recent Bets</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-textSecondary">
              <th className="pb-3 font-medium">Game</th>
              <th className="pb-3 font-medium">Bet</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Potential Win</th>
              <th className="pb-3 font-medium">When</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-lighter">
            {bets.map((bet: Bet) => (
              <tr key={bet.id}>
                <td className="py-3">{bet.market.name} - {bet.gameType.name}</td>
                <td className="py-3">
                  {bet.gameType.name === 'Jodi' ? (
                    <span className="bg-primary px-2 py-1 rounded font-mono">{bet.selection}</span>
                  ) : bet.gameType.name === 'Odd-Even' ? (
                    bet.selection
                  ) : bet.gameType.name === 'Hurf' ? (
                    bet.selection.split(',').map((part, i) => (
                      <span key={i} className="bg-primary px-2 py-1 rounded font-mono mr-1">
                        {part}
                      </span>
                    ))
                  ) : (
                    <span className="bg-primary px-2 py-1 rounded font-mono">{bet.selection}</span>
                  )}
                </td>
                <td className="py-3">{formatAmount(bet.amount)}</td>
                <td className="py-3">{formatAmount(bet.potentialWin)}</td>
                <td className="py-3 text-textSecondary text-sm">{formatDateTime(bet.createdAt)}</td>
                <td className="py-3">{getStatusBadge(bet.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BetHistory;
