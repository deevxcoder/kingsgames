import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMatchCard } from "@/components/ui/team-match-card";
import { TeamMatch } from "@shared/schema";
import { Trophy, Clock, Calendar } from "lucide-react";

// Define common categories for the dropdown filter
const matchCategories = ["All", "Cricket", "Football", "Basketball"];

export default function TeamMatches() {
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Fetch all team matches
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/team-matches"],
  });

  // Filter matches by category
  const filterMatchesByCategory = (matches: TeamMatch[], category: string) => {
    if (category === "All") return matches;
    return matches.filter(match => match.category?.toLowerCase() === category.toLowerCase());
  };

  // Filter matches into upcoming and past
  const allMatches = matches as TeamMatch[];
  const filteredMatches = filterMatchesByCategory(allMatches, activeCategory);
  const upcomingMatches = filteredMatches.filter(match => !match.result);
  const completedMatches = filteredMatches.filter(match => !!match.result);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Matches</h1>
          <p className="text-muted-foreground">Place bets on your favorite teams</p>
        </div>
        
        {/* Category filter */}
        <div className="w-40">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {matchCategories.map((category: string) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Match Status Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
          <TabsTrigger value="completed">Completed Matches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading matches...</p>
            </div>
          ) : upcomingMatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming matches available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.map((match: TeamMatch) => (
                <TeamMatchCard
                  key={match.id}
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
                  category={match.category || "Cricket"}
                  image={match.image}
                  linkToDetails={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading matches...</p>
            </div>
          ) : completedMatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No completed matches available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMatches.map((match: TeamMatch) => (
                <TeamMatchCard
                  key={match.id}
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
                  category={match.category || "Cricket"}
                  image={match.image}
                  linkToDetails={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}