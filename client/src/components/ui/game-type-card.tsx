import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameTypeCardProps {
  type: string;
  isSelected: boolean;
  odds: string;
  onClick: () => void;
}

export function GameTypeCard({ type, isSelected, odds, onClick }: GameTypeCardProps) {
  // Game type icon and description mapping
  const gameTypeInfo: Record<string, { icon: string; description: string }> = {
    jodi: {
      icon: "🎯",
      description: "Select a number from 00-99"
    },
    "odd-even": {
      icon: "⚖️",
      description: "Bet on odd or even result"
    },
    hurf: {
      icon: "🎲",
      description: "Match positions of digits"
    },
    cross: {
      icon: "🔄",
      description: "Bet on digit permutations"
    }
  };

  const info = gameTypeInfo[type] || {
    icon: "❓",
    description: "Game description"
  };

  const displayName = type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg h-full",
        "relative border-gray-500/30 hover:border-[#3EA6FF]/50 overflow-hidden",
        "transform hover:-translate-y-1",
        isSelected 
          ? "ring-2 ring-[#3EA6FF] bg-[#1A2C3D]" 
          : "bg-[#1A2C3D]/70 hover:bg-[#1A2C3D]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <span className="text-4xl mb-3">{info.icon}</span>
          <h3 className="font-bold text-lg mb-1">{displayName}</h3>
          <p className="text-sm text-gray-400 mb-3">{info.description}</p>
          <div className="bg-[#0F1923] px-4 py-1 rounded-full text-sm">
            Odds: <span className="font-medium text-[#3EA6FF]">{odds}x</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}