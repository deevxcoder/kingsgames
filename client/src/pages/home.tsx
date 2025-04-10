import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch recent results
  const { data: markets, isLoading: isLoadingMarkets } = useQuery({
    queryKey: ['/api/markets'],
    enabled: !!user,
  });
  
  // Fetch team matches
  const { data: teamMatches = [], isLoading: isLoadingTeamMatches } = useQuery({
    queryKey: ['/api/team-matches'],
    enabled: !!user,
  });
  
  // Sample promotional banners data
  const promotionalBanners = [
    {
      id: 1,
      title: "Welcome Bonus",
      description: "Get 100% bonus on your first deposit up to ₹1,000",
      bgColor: "from-blue-600 to-blue-900",
      buttonText: "Claim Now",
      buttonLink: "/wallet"
    },
    {
      id: 2,
      title: "Refer & Earn",
      description: "Invite friends and earn ₹100 for each successful referral",
      bgColor: "from-purple-600 to-purple-900",
      buttonText: "Invite Friends",
      buttonLink: "/referral"
    },
    {
      id: 3,
      title: "Daily Bonus",
      description: "Login daily to claim your free bonus rewards",
      bgColor: "from-green-600 to-green-900",
      buttonText: "Claim Bonus",
      buttonLink: "/rewards"
    }
  ];
  
  return (
    <div>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl mb-6">
        <div className="w-full h-36 md:h-52 bg-gradient-to-r from-[#1A2C3D] to-[#0A1018] flex items-center justify-center">
          <svg
            className="absolute opacity-10"
            viewBox="0 0 100 100"
            width="140"
            height="140"
          >
            <circle cx="50" cy="50" r="40" stroke="#3EA6FF" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="20" stroke="#FF7C48" strokeWidth="8" fill="none" />
          </svg>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome to BetX</h1>
          <p className="text-sm md:text-base text-gray-300">Play, Win, Repeat. Your ultimate gaming experience.</p>
        </div>
      </div>
      
      {/* Game Selection Section */}
      <h2 className="text-xl font-bold mb-4">Popular Games</h2>
      
      {/* Promotional Banners Carousel */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Promotions</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {promotionalBanners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className={`w-full p-6 rounded-xl bg-gradient-to-r ${banner.bgColor}`}>
                  <div className="md:w-2/3">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{banner.title}</h3>
                    <p className="text-sm md:text-base mb-4 text-white/90">{banner.description}</p>
                    <Link href={banner.buttonLink}>
                      <Button variant="secondary" className="bg-white text-black hover:bg-white/90">
                        {banner.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <CarouselPrevious className="static mr-2 translate-y-0" />
            <CarouselNext className="static ml-2 translate-y-0" />
          </div>
        </Carousel>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Coin Toss Game Card */}
        <motion.div 
          className="game-card bg-[#1A2C3D] rounded-xl overflow-hidden shadow-lg border border-gray-500/30 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate("/coin-toss")}
        >
          <div className="relative">
            <div className="w-full h-36 bg-gradient-to-br from-[#1A2C3D] to-[#112233]" />
            <div className="absolute top-2 right-2 bg-[#FF7C48] text-white text-xs py-1 px-2 rounded-full">
              LIVE
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-1">Coin Toss</h3>
            <p className="text-gray-300 text-sm mb-3">Simple heads or tails. Double your money instantly!</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-[#0F1923] py-1 px-2 rounded-full">50% Win Chance</span>
              <button className="bg-[#3EA6FF] text-white py-1.5 px-3 rounded-lg text-sm">Play Now</button>
            </div>
          </div>
        </motion.div>

        {/* Sattamatka Game Card */}
        <motion.div 
          className="game-card bg-[#1A2C3D] rounded-xl overflow-hidden shadow-lg border border-gray-500/30 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate("/sattamatka")}
        >
          <div className="relative">
            <div className="w-full h-36 bg-gradient-to-br from-[#1A2C3D] to-[#112233]" />
            <div className="absolute top-2 right-2 bg-[#3EA6FF] text-white text-xs py-1 px-2 rounded-full">
              POPULAR
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-1">Sattamatka</h3>
            <p className="text-gray-300 text-sm mb-3">Multiple game types with higher odds and bigger payouts!</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-[#0F1923] py-1 px-2 rounded-full">4 Game Types</span>
              <button className="bg-[#3EA6FF] text-white py-1.5 px-3 rounded-lg text-sm">Play Now</button>
            </div>
          </div>
        </motion.div>
        
        {/* Team Matches Game Card */}
        <motion.div 
          className="game-card bg-[#1A2C3D] rounded-xl overflow-hidden shadow-lg border border-gray-500/30 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate("/team-matches")}
        >
          <div className="relative">
            <div className="w-full h-36 bg-gradient-to-br from-[#1A2C3D] to-[#112233]" />
            <div className="absolute top-2 right-2 bg-[#4CAF50] text-white text-xs py-1 px-2 rounded-full">
              NEW
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-1">Team Matches</h3>
            <p className="text-gray-300 text-sm mb-3">Bet on your favorite sports teams and win big!</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-[#0F1923] py-1 px-2 rounded-full">Cricket, Football & More</span>
              <button className="bg-[#3EA6FF] text-white py-1.5 px-3 rounded-lg text-sm">Play Now</button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Recent Results Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Results</h2>
        <Card className="bg-[#1A2C3D] border-gray-500/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-500/30">
                    <th className="text-left py-2 px-4 text-gray-300 font-medium">Market</th>
                    <th className="text-left py-2 px-4 text-gray-300 font-medium">Date</th>
                    <th className="text-left py-2 px-4 text-gray-300 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingMarkets ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center">Loading recent results...</td>
                    </tr>
                  ) : markets && markets.length > 0 ? (
                    markets.filter(market => market.lastResult).map((market) => (
                      <tr key={market.id} className="border-b border-gray-500/20">
                        <td className="py-3 px-4">{market.name}</td>
                        <td className="py-3 px-4">
                          {market.lastResultTime
                            ? new Date(market.lastResultTime).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{market.lastResult || "Pending"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center">No recent results available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
