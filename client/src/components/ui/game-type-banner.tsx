import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameTypeBannerProps {
  type: string;
  description: string;
  icon: string;
  odds: string;
  isSelected: boolean;
  onClick: () => void;
}

export function GameTypeBanner({
  type,
  description,
  icon,
  odds,
  isSelected,
  onClick
}: GameTypeBannerProps) {
  const displayName = type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 overflow-hidden",
        "relative border-gray-500/30 hover:border-[#3EA6FF]/50 flex items-center",
        isSelected 
          ? "ring-2 ring-[#3EA6FF] bg-[#1A2C3D]" 
          : "bg-[#1A2C3D]/70 hover:bg-[#1A2C3D]"
      )}
      onClick={onClick}
    >
      <div className="p-4 flex-shrink-0 flex items-center justify-center">
        <span className="text-3xl">{icon}</span>
      </div>
      
      <div className="py-4 pr-4 flex-grow">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-lg">{displayName}</h3>
          <div className="bg-[#0F1923] px-3 py-1 rounded-full text-xs">
            <span className="font-medium text-[#3EA6FF]">{odds}x</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </Card>
  );
}