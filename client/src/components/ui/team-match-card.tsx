import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

// Default placeholder images
import matchBgImage from "../../assets/market-card-bg.svg";
import matchCoverImage from "../../assets/market-card-cover.svg";

interface TeamMatchCardProps {
  id: number;
  teamA: string;
  teamB: string;
  matchDate: string | Date;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  result: string | null;
  oddsTeamA: string | number;
  oddsTeamB: string | number;
  category?: string;
  image?: string | null;
  isSelected?: boolean;
  onClick?: () => void;
  linkToDetails?: boolean;
}

export function TeamMatchCard({
  id,
  teamA,
  teamB,
  matchDate,
  openTime,
  closeTime,
  isOpen,
  result,
  oddsTeamA,
  oddsTeamB,
  category,
  image,
  isSelected = false,
  onClick,
  linkToDetails = false
}: TeamMatchCardProps) {
  // Determine match status display
  const getMatchStatusDisplay = () => {
    if (result) {
      const winningTeam = result === "teamA" ? teamA : teamB;
      return (
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{winningTeam} won</span>
        </div>
      );
    } else if (!isOpen) {
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

  const cardContent = (
    <>
      {/* Cover Image */}
      <div className="w-full h-[120px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600">
          {image && (
            <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${image})` }} />
          )}
        </div>
        <div className="absolute bottom-0 right-0 p-2">
          <Badge 
            className={cn(
              "ml-2 px-3 py-1 text-xs",
              isOpen 
                ? "bg-green-500/80 text-white hover:bg-green-500" 
                : "bg-red-500/80 text-white hover:bg-red-500"
            )}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/50 backdrop-blur-sm">
            {category || "Cricket"}
          </Badge>
        </div>
      </div>
      
      {/* Match background */}
      <div className="absolute top-[120px] left-0 right-0 bottom-0">
        <img src={matchBgImage} alt="" className="w-full h-full object-cover" />
      </div>
      
      <CardContent className="relative p-4 z-10 pt-4">
        <h3 className="text-lg font-bold mb-4">{teamA} vs {teamB}</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Match Date:</span>
            <span className="font-medium">{formatDate(matchDate)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Betting:</span>
            <span className="font-medium">{openTime} - {closeTime}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Status:</span>
            <span>{getMatchStatusDisplay()}</span>
          </div>
          
          <div className="pt-2 border-t border-gray-700/30">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <span className="text-xs text-gray-400">Team A</span>
                <div className="font-medium">{teamA}</div>
                <div className="text-sm text-[#3EA6FF]">Odds: {parseFloat(String(oddsTeamA)).toFixed(2)}x</div>
              </div>
              
              <div className="mx-2 text-gray-400">vs</div>
              
              <div className="text-center flex-1">
                <span className="text-xs text-gray-400">Team B</span>
                <div className="font-medium">{teamB}</div>
                <div className="text-sm text-[#3EA6FF]">Odds: {parseFloat(String(oddsTeamB)).toFixed(2)}x</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );

  const cardClasses = cn(
    "transition-all duration-200 overflow-hidden",
    "relative border-gray-500/30 hover:border-[#3EA6FF]/50",
    "transform hover:-translate-y-1 h-full",
    isSelected ? "ring-2 ring-[#3EA6FF]" : ""
  );

  if (linkToDetails) {
    return (
      <Link href={`/team-match/${id}`}>
        <a className="block h-full">
          <Card className={cn(cardClasses, "cursor-pointer")}>
            {cardContent}
          </Card>
        </a>
      </Link>
    );
  }

  return (
    <Card 
      className={cn(cardClasses, onClick ? "cursor-pointer" : "")}
      onClick={onClick}
    >
      {cardContent}
    </Card>
  );
}