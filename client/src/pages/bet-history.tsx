import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";

export default function BetHistory() {
  const { user } = useAuth();
  
  // Fetch bet history
  const { data: bets, isLoading, error } = useQuery({
    queryKey: ['/api/bets'],
    enabled: !!user,
  });
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Bet History</h2>
      
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center">Loading bet history...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[#FF3B58]">Error loading bet history. Please try again.</td>
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
                      <td className="py-3 px-4 font-mono">{bet.selection}</td>
                      <td className="py-3 px-4 font-mono">${parseFloat(bet.betAmount).toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">{bet.result || "Pending"}</td>
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
                    <td colSpan={6} className="py-4 text-center">No bet history available</td>
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
