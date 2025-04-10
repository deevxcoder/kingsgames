import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${numAmount.toLocaleString('en-IN')}`;
}

export function formatDate(date: string | Date): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(time: string | Date): string {
  if (!time) return "N/A";
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function generateGameLabel(gameType: string): string {
  if (gameType === "coin-toss") return "Coin Toss";
  
  // Capitalize first letter of other game types
  return gameType.charAt(0).toUpperCase() + gameType.slice(1);
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status.toLowerCase()) {
    case "won":
      return { bg: "bg-[#00C853]/20", text: "text-[#00C853]" };
    case "lost":
      return { bg: "bg-[#FF3B58]/20", text: "text-[#FF3B58]" };
    case "open":
      return { bg: "bg-[#00C853]/20", text: "text-[#00C853]" };
    case "closed":
      return { bg: "bg-[#FF3B58]/20", text: "text-[#FF3B58]" };
    case "pending":
      return { bg: "bg-yellow-500/20", text: "text-yellow-500" };
    default:
      return { bg: "bg-gray-500/20", text: "text-gray-300" };
  }
}
