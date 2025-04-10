import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMatchCard } from "@/components/ui/team-match-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { TeamMatch } from "@shared/schema";

// Helper function to convert null to undefined for type compatibility
const nullToUndefined = <T,>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

export default function TeamMatchDetails() {
  const { id: matchId } = useParams();
  const { user } = useAuth();
  const { refreshBalance } = useWallet();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedTeam, setSelectedTeam] = useState<"teamA" | "teamB" | null>(null);
  
  // Fetch team match
  const { data: match, isLoading } = useQuery<TeamMatch>({
    queryKey: [`/api/team-matches/${matchId}`],
    enabled: !!matchId
  });
  
  // Mutation for placing a bet
  const { mutate: placeBet, isPending } = useMutation({
    mutationFn: async (data: { matchId: number; betAmount: number; selection: "teamA" | "teamB" }) => {
      const response = await fetch("/api/games/team-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to place bet");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      refreshBalance();
      toast({
        title: "Bet placed successfully!",
        description: `You bet ${formatCurrency(data.bet.betAmount)} on ${data.bet.selectedTeam}`,
      });
      
      // Reset selection
      setSelectedTeam(null);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place bet",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleBetSubmit = () => {
    if (!match || !selectedTeam || betAmount <= 0) {
      toast({
        title: "Invalid bet",
        description: "Please select a team and enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    placeBet({
      matchId: match.id,
      betAmount,
      selection: selectedTeam,
    });
  };
  
  const handleTeamSelect = (team: "teamA" | "teamB") => {
    setSelectedTeam(team);
  };
  
  if (isLoading || !match) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p>Loading match details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => window.location.href = '/team-matches'} 
          className="bg-[#1A2C3D] hover:bg-[#24384D] text-white p-2 rounded mr-4 cursor-pointer"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold">Match Details</h2>
      </div>
      
      {/* Match Information */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TeamMatchCard
              id={match.id}
              teamA={match.teamA}
              teamB={match.teamB}
              matchDate={match.matchDate}
              openTime={match.openTime}
              closeTime={match.closeTime}
              isOpen={match.isOpen}
              result={match.result}
              oddsTeamA={match.oddsTeamA}
              oddsTeamB={match.oddsTeamB}
              category={nullToUndefined(match.category)}
              image={nullToUndefined(match.image)}
            />
          </div>
          
          <div className="bg-[#1A2C3D] p-4 rounded-lg border border-gray-500/30">
            <h3 className="font-bold mb-4">Match Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Match:</span>
                <span>{match.teamA} vs {match.teamB}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Category:</span>
                <span>{match.category || "Cricket"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Date:</span>
                <span>{formatDate(match.matchDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={match.isOpen ? "text-[#00C853]" : "text-[#FF3B58]"}>
                  {match.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Betting closes at:</span>
                <span>{match.closeTime}</span>
              </div>
              {match.result && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Result:</span>
                  <span className="font-medium">
                    {match.result === "teamA" ? match.teamA : match.teamB} won
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Betting Section */}
      {match.isOpen && !match.result && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Place Your Bet</h3>
          
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardContent className="p-6">
              <p className="text-sm text-gray-300 mb-6">
                Select a team to bet on and enter your bet amount. Winning bets are paid according to the odds shown.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Team Selection */}
                <Card className={`cursor-pointer transition-all ${selectedTeam === "teamA" ? "ring-2 ring-[#3EA6FF]" : ""}`}
                  onClick={() => handleTeamSelect("teamA")}>
                  <CardHeader>
                    <CardTitle>{match.teamA}</CardTitle>
                    <CardDescription>Odds: {parseFloat(match.oddsTeamA).toFixed(2)}x</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 rounded-lg bg-[#0A1018]">
                      <div className="text-lg font-bold mb-2">Win up to</div>
                      <div className="text-xl text-[#3EA6FF] font-mono">
                        {formatCurrency(betAmount * parseFloat(match.oddsTeamA))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">with {formatCurrency(betAmount)} bet</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer transition-all ${selectedTeam === "teamB" ? "ring-2 ring-[#3EA6FF]" : ""}`}
                  onClick={() => handleTeamSelect("teamB")}>
                  <CardHeader>
                    <CardTitle>{match.teamB}</CardTitle>
                    <CardDescription>Odds: {parseFloat(match.oddsTeamB).toFixed(2)}x</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 rounded-lg bg-[#0A1018]">
                      <div className="text-lg font-bold mb-2">Win up to</div>
                      <div className="text-xl text-[#3EA6FF] font-mono">
                        {formatCurrency(betAmount * parseFloat(match.oddsTeamB))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">with {formatCurrency(betAmount)} bet</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Bet Amount and Submit */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="bet-amount">Bet Amount</Label>
                  <Input
                    id="bet-amount"
                    type="number"
                    min="1"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                    disabled={isPending}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={handleBetSubmit} 
                  disabled={isPending || !selectedTeam}
                  className="w-full md:w-auto"
                >
                  {isPending ? "Processing..." : "Place Bet"}
                </Button>
              </div>
              
              {selectedTeam && (
                <div className="mt-4 p-4 bg-[#0F1923] rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Selected team:</span>
                    <span className="font-medium">{selectedTeam === "teamA" ? match.teamA : match.teamB}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Potential win:</span>
                    <span className="font-medium text-[#3EA6FF]">
                      {formatCurrency(betAmount * parseFloat(
                        selectedTeam === "teamA" ? match.oddsTeamA : match.oddsTeamB
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Betting Rules */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Betting Rules</h3>
        <Card className="bg-[#1A2C3D] border-gray-500/30">
          <CardContent className="p-6">
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              <li>Betting closes at {match.closeTime}</li>
              <li>Results will be declared after match concludes</li>
              <li>Minimum bet amount is ₹1</li>
              <li>Winnings are automatically credited to wallet</li>
              <li>In case of a draw or match cancellation, all bets are refunded</li>
              <li>Once placed, bets cannot be cancelled or modified</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}