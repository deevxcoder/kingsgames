import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { balance } = useWallet();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="md:hidden bg-[#1A2C3D] border-b border-gray-500/30 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="text-2xl font-bold text-[#3EA6FF] cursor-pointer">BetX</div>
          </Link>
          <div className="flex items-center space-x-2">
            <Link href="/wallet">
              <div className="flex items-center justify-center rounded-full w-10 h-10 bg-[#0A1018] cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
              </div>
            </Link>
            <button 
              className="flex items-center justify-center rounded-full w-10 h-10 bg-[#0A1018]"
              onClick={toggleMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 12h16M4 6h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile dropdown menu (hidden by default) */}
        {isMenuOpen && (
          <div className="mt-4 py-2 rounded-lg bg-[#0A1018]">
            <MobileNavLink href="/" current={location} onClick={() => setIsMenuOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/coin-toss" current={location} onClick={() => setIsMenuOpen(false)}>
              Coin Toss
            </MobileNavLink>
            <MobileNavLink href="/sattamatka" current={location} onClick={() => setIsMenuOpen(false)}>
              Sattamatka
            </MobileNavLink>
            <MobileNavLink href="/wallet" current={location} onClick={() => setIsMenuOpen(false)}>
              Wallet
            </MobileNavLink>
            <MobileNavLink href="/bet-history" current={location} onClick={() => setIsMenuOpen(false)}>
              Bet History
            </MobileNavLink>
            
            {user?.isAdmin && (
              <>
                <div className="text-xs text-gray-300 uppercase mt-3 mb-1 px-3">Admin Panel</div>
                <MobileNavLink href="/admin/dashboard" current={location} onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink href="/admin/markets" current={location} onClick={() => setIsMenuOpen(false)}>
                  Manage Markets
                </MobileNavLink>
                <MobileNavLink href="/admin/users" current={location} onClick={() => setIsMenuOpen(false)}>
                  Manage Users
                </MobileNavLink>
                <MobileNavLink href="/admin/transactions" current={location} onClick={() => setIsMenuOpen(false)}>
                  Transactions
                </MobileNavLink>
              </>
            )}
            
            {user ? (
              <div className="p-3 border-t border-gray-500/30 mt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-300">Logged in as</div>
                    <div className="font-medium">{user.username}</div>
                  </div>
                  <button 
                    className="px-3 py-1 rounded bg-[#0F1923] text-sm"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-300">Balance</div>
                      <div className="font-mono font-bold">₹{parseFloat(balance).toLocaleString('en-IN')}</div>
                    </div>
                    <button className="px-3 py-1 rounded bg-[#3EA6FF] text-sm">
                      Deposit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border-t border-gray-500/30 mt-2">
                <div className="text-sm text-gray-300 mb-1">Welcome to BetX</div>
                <div className="text-sm mb-3">Please login or register to start betting</div>
                <Link href="/login">
                  <div 
                    className="w-full bg-[#3EA6FF] hover:bg-[#4DB8FF] py-2 px-3 rounded text-center cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login / Register
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A2C3D] border-t border-gray-500/30 flex justify-around py-3 px-2 z-10">
        <BottomNavLink href="/" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className="text-xs mt-1">Home</span>
        </BottomNavLink>
        
        <BottomNavLink href="/coin-toss" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span className="text-xs mt-1">Coin Toss</span>
        </BottomNavLink>
        
        <BottomNavLink href="/sattamatka" current={location}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="8.5" r="1.5"></circle>
            <circle cx="15.5" cy="15.5" r="1.5"></circle>
            <circle cx="8.5" cy="15.5" r="1.5"></circle>
          </svg>
          <span className="text-xs mt-1">Sattamatka</span>
        </BottomNavLink>
        
        {user ? (
          <BottomNavLink href="/wallet" current={location}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
            </svg>
            <span className="text-xs mt-1">Wallet</span>
          </BottomNavLink>
        ) : (
          <BottomNavLink href="/login" current={location}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span className="text-xs mt-1">Login</span>
          </BottomNavLink>
        )}
      </nav>
    </>
  );
}

interface MobileNavLinkProps {
  href: string;
  current: string;
  onClick: () => void;
  children: React.ReactNode;
}

function MobileNavLink({ href, current, onClick, children }: MobileNavLinkProps) {
  const isActive = current === href;
  
  return (
    <Link href={href}>
      <div 
        className={cn(
          "block py-2 px-3 hover:bg-[#0F1923] cursor-pointer",
          isActive ? "text-[#3EA6FF]" : ""
        )}
        onClick={onClick}
      >
        {children}
      </div>
    </Link>
  );
}

interface BottomNavLinkProps {
  href: string;
  current: string;
  children: React.ReactNode;
}

function BottomNavLink({ href, current, children }: BottomNavLinkProps) {
  const isActive = current === href;
  
  return (
    <Link href={href}>
      <div 
        className={cn(
          "flex flex-col items-center cursor-pointer",
          isActive ? "text-[#3EA6FF]" : "text-gray-300"
        )}
      >
        {children}
      </div>
    </Link>
  );
}
