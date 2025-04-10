import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import marketBgImage from "../../assets/market-card-bg.svg";
import marketCoverImage from "../../assets/market-card-cover.svg";
import { Link } from "wouter";

interface MarketCardProps {
  id: number;
  name: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  lastResult: string | null;
  isSelected?: boolean;
  onClick?: () => void;
  linkToDetails?: boolean;
}

export function MarketCard({
  id,
  name,
  openTime,
  closeTime,
  isOpen,
  lastResult,
  isSelected = false,
  onClick,
  linkToDetails = false
}: MarketCardProps) {
  const cardContent = (
    <>
      {/* Cover Image */}
      <div className="w-full h-[120px] relative overflow-hidden">
        <img src={marketCoverImage} alt="" className="w-full h-full object-cover" />
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
      </div>
      
      {/* Market background */}
      <div className="absolute top-[120px] left-0 right-0 bottom-0">
        <img src={marketBgImage} alt="" className="w-full h-full object-cover" />
      </div>
      
      <CardContent className="relative p-4 z-10 pt-4">
        <h3 className="text-lg font-bold mb-4">{name}</h3>
        
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
      <Link href={`/market/${id}`}>
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