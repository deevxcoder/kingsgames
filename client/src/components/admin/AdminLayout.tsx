import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col">
      <div className="border-b border-gray-500/30 bg-[#1A2C3D] py-3 px-6 mb-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 mb-6 lg:mb-0 lg:mr-6">
          <div className="bg-[#1A2C3D] border border-gray-500/30 rounded-lg p-4">
            <nav className="flex flex-col space-y-1">
              <NavItem 
                href="/admin/dashboard" 
                label="Dashboard" 
                icon={<DashboardIcon />} 
                isActive={location === "/admin/dashboard"} 
              />
              <NavItem 
                href="/admin/markets" 
                label="Markets" 
                icon={<MarketIcon />} 
                isActive={location === "/admin/markets"} 
              />
              <NavItem 
                href="/admin/team-matches" 
                label="Team Matches" 
                icon={<TeamIcon />} 
                isActive={location === "/admin/team-matches"} 
              />
              <NavItem 
                href="/admin/users" 
                label="Users" 
                icon={<UserIcon />} 
                isActive={location === "/admin/users"} 
              />
              <NavItem 
                href="/admin/transactions" 
                label="Transactions" 
                icon={<TransactionIcon />} 
                isActive={location === "/admin/transactions"} 
              />
              <NavItem 
                href="/admin/bets" 
                label="Bets" 
                icon={<BetIcon />} 
                isActive={location === "/admin/bets"} 
              />
              <NavItem 
                href="/admin/reports" 
                label="Reports" 
                icon={<ReportIcon />} 
                isActive={location === "/admin/reports"} 
              />
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
}

function NavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center space-x-2 py-2 px-3 rounded-md transition-colors",
        isActive 
          ? "bg-[#3EA6FF]/10 text-[#3EA6FF]" 
          : "hover:bg-[#0A1018] text-gray-200"
      )}>
        <span className="w-5 h-5">{icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
}

// Icons for navigation
function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TransactionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
      <line x1="9.69" y1="8" x2="21.17" y2="8" />
      <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
      <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
      <line x1="14.31" y1="16" x2="2.83" y2="16" />
      <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}