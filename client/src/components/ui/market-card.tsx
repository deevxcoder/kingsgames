import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import marketBgImage from "../../assets/market-card-bg.svg";

interface MarketCardProps {
  id: number;
  name: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  lastResult: string | null;
  isSelected: boolean;
  onClick: () => void;
}

export function MarketCard({
  id,
  name,
  openTime,
  closeTime,
  isOpen,
  lastResult,
  isSelected,
  onClick
}: MarketCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 overflow-hidden",
        "relative border-gray-500/30 hover:border-[#3EA6FF]/50",
        "transform hover:-translate-y-1",
        isSelected ? "ring-2 ring-[#3EA6FF]" : ""
      )}
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <img src={marketBgImage} alt="" className="w-full h-full object-cover" />
      </div>
      
      <CardContent className="relative p-4 z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">{name}</h3>
          <Badge 
            className={cn(
              "ml-2 px-2 py-1",
              isOpen 
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            )}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Opening:</span>
            <span className="font-medium">{openTime}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Closing:</span>
            <span className="font-medium">{closeTime}</span>
          </div>
          
          <div className="pt-2 border-t border-gray-700/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Last Result:</span>
              {lastResult ? (
                <span className="font-mono font-bold text-lg text-[#3EA6FF]">{lastResult}</span>
              ) : (
                <span className="text-gray-400 text-sm italic">Awaiting draw</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}