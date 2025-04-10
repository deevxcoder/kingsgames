import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CoinProps {
  result?: "heads" | "tails" | null;
  isFlipping: boolean;
  onFlipEnd?: () => void;
}

export function Coin({ result, isFlipping, onFlipEnd }: CoinProps) {
  const [animationClass, setAnimationClass] = useState<string>("");
  
  useEffect(() => {
    if (isFlipping) {
      const newClass = result === "heads" ? "flip-heads" : "flip-tails";
      setAnimationClass(newClass);
      
      const timer = setTimeout(() => {
        onFlipEnd?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setAnimationClass("");
    }
  }, [isFlipping, result, onFlipEnd]);

  return (
    <div 
      className={cn(
        "relative w-40 h-40 transform-style-3d transition-transform duration-1000 ease-in-out",
        animationClass
      )}
      style={{ 
        transformStyle: "preserve-3d", 
        transform: animationClass ? undefined : (result === "tails" ? "rotateY(180deg)" : "")
      }}
    >
      <div 
        className="coin-heads absolute w-full h-full rounded-full flex items-center justify-center text-primary text-2xl font-bold z-10"
        style={{ 
          background: "linear-gradient(45deg, #FFD700, #FFA500)",
          backfaceVisibility: "hidden"
        }}
      >
        H
      </div>
      <div 
        className="coin-tails absolute w-full h-full rounded-full flex items-center justify-center text-primary text-2xl font-bold"
        style={{ 
          background: "linear-gradient(45deg, #C0C0C0, #A9A9A9)",
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)"
        }}
      >
        T
      </div>
      
      <style jsx>{`
        @keyframes flipHeads {
          0% { transform: rotateY(0); }
          100% { transform: rotateY(720deg); }
        }
        
        @keyframes flipTails {
          0% { transform: rotateY(0); }
          100% { transform: rotateY(900deg); }
        }
        
        .flip-heads {
          animation: flipHeads 2s forwards;
        }
        
        .flip-tails {
          animation: flipTails 2s forwards;
        }
      `}</style>
    </div>
  );
}
