import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "../lib/queryClient";
import { formatCurrency, formatDate, formatTime } from "../lib/utils";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";
import { Badge } from "@/components/ui/badge";
import { TeamMatch } from "@shared/schema";
import Layout from "@/components/Layout";
import { Trophy, Clock, Calendar, ArrowRightCircle, CheckCircle, XCircle } from "lucide-react";

export default function TeamMatches() {
  const { user } = useAuth();
  const { refreshBalance } = useWallet();
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<TeamMatch | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedTeam, setSelectedTeam] = useState<"teamA" | "teamB" | null>(null);
  
  // Fetch all team matches
  const { data: matches = [] } = useQuery({
    queryKey: ["/api/team-matches"],
    enabled: !!user
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
      setSelectedMatch(null);
      
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
    if (!selectedMatch || !selectedTeam || betAmount <= 0) {
      toast({
        title: "Invalid bet",
        description: "Please select a team and enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    placeBet({
      matchId: selectedMatch.id,
      betAmount,
      selection: selectedTeam,
    });
  };

  const handleTeamSelect = (match: TeamMatch, team: "teamA" | "teamB") => {
    setSelectedMatch(match);
    setSelectedTeam(team);
  };

  // Function to determine match status display
  const getMatchStatusDisplay = (match: TeamMatch) => {
    if (match.result) {
      const winningTeam = match.result === "teamA" ? match.teamA : match.teamB;
      return (
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{winningTeam} won</span>
        </div>
      );
    } else if (!match.isOpen) {
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-red-500" />
          <span>Closed</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-green-500" />
          <span>Open</span>
        </div>
      );
    }
  };

  // Filter matches into upcoming and past
  const upcomingMatches = matches.filter((match: TeamMatch) => !match.result);
  const completedMatches = matches.filter((match: TeamMatch) => !!match.result);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Team Matches</h1>
          <p className="text-muted-foreground">Place bets on your favorite teams</p>
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
            <TabsTrigger value="completed">Completed Matches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No upcoming matches available</p>
                </div>
              ) : (
                upcomingMatches.map((match: TeamMatch) => (
                  <Card key={match.id} className={`overflow-hidden ${selectedMatch?.id === match.id ? "ring-2 ring-primary" : ""}`}>
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                      {match.image && (
                        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${match.image})` }} />
                      )}
                      <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm">
                        {match.category || "Cricket"}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-center mb-2">
                        <CardTitle>{match.teamA} vs {match.teamB}</CardTitle>
                        {getMatchStatusDisplay(match)}
                      </div>
                      <CardDescription>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(match.matchDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Betting open: {match.openTime} - {match.closeTime}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center flex-1 p-3 rounded-lg cursor-pointer transition-colors
                             hover:bg-accent/50 dark:hover:bg-accent/30
                             ${selectedTeam === 'teamA' && selectedMatch?.id === match.id ? 'bg-accent' : ''}"
                             onClick={() => match.isOpen && handleTeamSelect(match, "teamA")}>
                          <div className="font-semibold mb-1">{match.teamA}</div>
                          <div className="text-sm text-muted-foreground">Odds: {match.oddsTeamA}x</div>
                        </div>
                        
                        <ArrowRightCircle className="mx-2 text-muted-foreground" />
                        
                        <div className="text-center flex-1 p-3 rounded-lg cursor-pointer transition-colors
                             hover:bg-accent/50 dark:hover:bg-accent/30
                             ${selectedTeam === 'teamB' && selectedMatch?.id === match.id ? 'bg-accent' : ''}"
                             onClick={() => match.isOpen && handleTeamSelect(match, "teamB")}>
                          <div className="font-semibold mb-1">{match.teamB}</div>
                          <div className="text-sm text-muted-foreground">Odds: {match.oddsTeamB}x</div>
                        </div>
                      </div>
                    </CardContent>
                    
                    {selectedMatch?.id === match.id && (
                      <CardFooter className="flex-col gap-4">
                        <div className="w-full">
                          <Label htmlFor={`bet-amount-${match.id}`}>Bet Amount</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id={`bet-amount-${match.id}`}
                              type="number"
                              min="1"
                              value={betAmount}
                              onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                              disabled={isPending}
                            />
                            <Button 
                              onClick={handleBetSubmit} 
                              disabled={isPending || !selectedTeam}
                            >
                              Place Bet
                            </Button>
                          </div>
                        </div>
                        
                        {selectedTeam && (
                          <div className="text-sm">
                            <p>
                              Potential win: {formatCurrency(betAmount * parseFloat(
                                selectedTeam === "teamA" ? match.oddsTeamA : match.oddsTeamB
                              ))}
                            </p>
                          </div>
                        )}
                      </CardFooter>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMatches.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No completed matches available</p>
                </div>
              ) : (
                completedMatches.map((match: TeamMatch) => (
                  <Card key={match.id} className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-700 to-purple-800 relative">
                      {match.image && (
                        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${match.image})` }} />
                      )}
                      <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm">
                        {match.category || "Cricket"}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-center mb-2">
                        <CardTitle>{match.teamA} vs {match.teamB}</CardTitle>
                        {getMatchStatusDisplay(match)}
                      </div>
                      <CardDescription>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(match.matchDate)}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className={`text-center flex-1 p-3 rounded-lg ${match.result === "teamA" ? "bg-green-500/10" : ""}`}>
                          <div className="font-semibold mb-1 flex items-center justify-center gap-1">
                            {match.teamA}
                            {match.result === "teamA" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="text-sm text-muted-foreground">Odds: {match.oddsTeamA}x</div>
                        </div>
                        
                        <div className="mx-2 text-muted-foreground">vs</div>
                        
                        <div className={`text-center flex-1 p-3 rounded-lg ${match.result === "teamB" ? "bg-green-500/10" : ""}`}>
                          <div className="font-semibold mb-1 flex items-center justify-center gap-1">
                            {match.teamB}
                            {match.result === "teamB" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="text-sm text-muted-foreground">Odds: {match.oddsTeamB}x</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}