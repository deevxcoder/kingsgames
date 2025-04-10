import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamMatchCard } from "@/components/ui/team-match-card";
import { TeamMatch } from "@shared/schema";
import Layout from "@/components/Layout";
import { Trophy, Clock, Calendar, Users, Baseline, Dumbbell } from "lucide-react";

// Sports categories with their icons
const sportsCategories = [
  { id: "all", name: "All Sports", icon: <Trophy className="h-4 w-4" /> },
  { id: "cricket", name: "Cricket", icon: <Baseline className="h-4 w-4" /> },
  { id: "football", name: "Football", icon: <Users className="h-4 w-4" /> },
  { id: "basketball", name: "Basketball", icon: <Dumbbell className="h-4 w-4" /> },
];

export default function TeamMatches() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Fetch all team matches
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/team-matches"],
  });

  // Filter matches by category
  const filterMatchesByCategory = (matches: TeamMatch[], category: string) => {
    if (category === "all") return matches;
    return matches.filter(match => match.category?.toLowerCase() === category.toLowerCase());
  };

  // Filter matches into upcoming and past
  const allMatches = matches as TeamMatch[];
  const filteredMatches = filterMatchesByCategory(allMatches, activeCategory);
  const upcomingMatches = filteredMatches.filter(match => !match.result);
  const completedMatches = filteredMatches.filter(match => !!match.result);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Team Matches</h1>
          <p className="text-muted-foreground">Place bets on your favorite teams</p>
        </div>
        
        {/* Sports Category Tabs - Secondary Navigation */}
        <div className="mb-6 bg-[#1A2C3D] rounded-lg p-4 overflow-x-auto">
          <div className="flex gap-4">
            {sportsCategories.map(category => (
              <button
                key={category.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeCategory === category.id 
                    ? "bg-[#3EA6FF] text-white"
                    : "hover:bg-[#0A1018]"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
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
    </Layout>
  );
}