import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { balance } = useWallet();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#1A2C3D] border-r border-gray-500/30 p-4">
      <div className="flex items-center mb-8">
        <span className="text-2xl font-bold text-[#3EA6FF]">BetX</span>
      </div>
      
      <nav className="flex flex-col space-y-2">
        <div className="text-xs text-gray-300 uppercase mb-2">Games</div>
        <NavLink href="/" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </NavLink>
        
        <NavLink href="/coin-toss" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Coin Toss</span>
        </NavLink>
        
        <NavLink href="/sattamatka" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="15.5" r="1.5"></circle>
            <circle cx="8.5" cy="15.5" r="1.5"></circle>
          </svg>
          <span>Sattamatka</span>
        </NavLink>

        <NavLink href="/team-matches" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Team Matches</span>
        </NavLink>
        
        <div className="text-xs text-gray-300 uppercase mt-6 mb-2">Account</div>
        
        <NavLink href="/wallet" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
          </svg>
          <span>Wallet</span>
        </NavLink>
        
        <NavLink href="/bet-history" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <span>Bet History</span>
        </NavLink>
        
        {user?.isAdmin && (
          <>
            <div className="text-xs text-gray-300 uppercase mt-6 mb-2">Admin</div>
            <NavLink href="/admin/dashboard" current={location}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Dashboard</span>
            </NavLink>
            
            <NavLink href="/admin/markets" current={location}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Manage Markets</span>
            </NavLink>
            
            <NavLink href="/admin/users" current={location}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Manage Users</span>
            </NavLink>
            
            <NavLink href="/admin/transactions" current={location}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Transactions</span>
            </NavLink>
          </>
        )}
      </nav>
      
      <div className="mt-auto p-3 rounded-lg bg-[#0A1018]">
        <div className="text-sm text-gray-300 mb-1">Wallet Balance</div>
        <div className="text-lg font-mono font-bold">₹{parseFloat(balance).toLocaleString('en-IN')}</div>
        <button 
          className="mt-2 w-full bg-[#3EA6FF] hover:bg-[#4DB8FF] py-1.5 px-3 rounded text-sm"
          onClick={() => {}}
        >
          Deposit
        </button>
        
        {user && (
          <div className="mt-4 pt-4 border-t border-gray-500/30">
            <div className="text-sm text-gray-300 mb-1">Logged in as</div>
            <div className="text-sm font-medium mb-2">{user.username}</div>
            <button 
              className="w-full bg-[#0F1923] hover:bg-[#0F1923]/80 py-1.5 px-3 rounded text-sm border border-gray-500/30"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

interface NavLinkProps {
  href: string;
  current: string;
  children: React.ReactNode;
}

function NavLink({ href, current, children }: NavLinkProps) {
  const isActive = current === href;
  
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center space-x-2 py-2 px-3 rounded-lg cursor-pointer",
          isActive 
            ? "bg-[#3EA6FF]/10 text-[#3EA6FF]" 
            : "hover:bg-[#0A1018]"
        )}
      >
        {children}
      </div>
    </Link>
  );
}
