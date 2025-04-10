import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  // Fetch stats data
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const statCards = [
    { 
      title: "Total Users", 
      value: stats?.totalUsers || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      bgColor: "bg-blue-500/10"
    },
    { 
      title: "Total Bets", 
      value: stats?.totalBets || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
          <line x1="9.69" y1="8" x2="21.17" y2="8" />
        </svg>
      ),
      bgColor: "bg-green-500/10"
    },
    { 
      title: "Active Markets", 
      value: stats?.activeMarkets || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      bgColor: "bg-purple-500/10"
    },
    { 
      title: "Total Revenue", 
      value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || '0'}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      bgColor: "bg-amber-500/10"
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
            <Card key={index} className={`bg-[#1A2C3D] border-gray-500/30 ${card.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-300">{card.title}</h3>
                  {card.icon}
                </div>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <div className="h-6 w-20 bg-gray-600/30 animate-pulse rounded-md"></div>
                  ) : (
                    card.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bets */}
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Bets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-500/30">
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">User</th>
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">Game</th>
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingStats ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">
                            <div className="h-4 w-20 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-16 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-12 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-14 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                        </tr>
                      ))
                    ) : stats?.recentBets?.length > 0 ? (
                      stats.recentBets.map((bet: any) => (
                        <tr key={bet.id} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">{bet.username}</td>
                          <td className="py-3 px-4">{bet.gameType}</td>
                          <td className="py-3 px-4 font-mono">₹{bet.amount.toLocaleString('en-IN')}</td>
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
                        <td colSpan={4} className="py-4 text-center">No recent bets</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Transactions */}
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-500/30">
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">User</th>
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">Type</th>
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">Amount</th>
                      <th className="text-left py-2 px-4 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingStats ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">
                            <div className="h-4 w-20 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-16 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-12 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-14 bg-gray-600/30 animate-pulse rounded-md"></div>
                          </td>
                        </tr>
                      ))
                    ) : stats?.recentTransactions?.length > 0 ? (
                      stats.recentTransactions.map((tx: any) => (
                        <tr key={tx.id} className="border-b border-gray-500/20">
                          <td className="py-3 px-4">{tx.username}</td>
                          <td className="py-3 px-4">{tx.type}</td>
                          <td className="py-3 px-4 font-mono">₹{tx.amount.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              tx.status === "completed" 
                                ? "bg-[#00C853]/20 text-[#00C853]" 
                                : tx.status === "rejected"
                                  ? "bg-[#FF3B58]/20 text-[#FF3B58]"
                                  : "bg-yellow-500/20 text-yellow-500"
                            }`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center">No recent transactions</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}