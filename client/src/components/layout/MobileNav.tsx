import React from 'react';
import { Link, useLocation } from 'wouter';

const MobileNav: React.FC = () => {
  const [location] = useLocation();
  
  const getLinkStyles = (path: string) => {
    const isActive = location === path;
    return isActive
      ? "flex flex-col items-center py-3 text-accent"
      : "flex flex-col items-center py-3 text-textSecondary";
  };
  
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-primary-darker p-4 flex justify-between items-center border-b border-primary-lighter">
        <div className="flex items-center">
          <svg 
            className="w-8 h-8 mr-2 text-accent" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill="currentColor" 
              stroke="currentColor" 
              strokeWidth="1"
            />
          </svg>
          <h1 className="text-xl font-heading font-bold text-accent">BetWise</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative text-textPrimary">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-primary-darker border-t border-primary-lighter z-10">
        <div className="flex justify-around items-center">
          <Link href="/">
            <a className={getLinkStyles('/')}>
              <i className="ri-home-5-line text-xl"></i>
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          
          <Link href="/coin-toss">
            <a className={getLinkStyles('/coin-toss')}>
              <i className="ri-coin-line text-xl"></i>
              <span className="text-xs mt-1">Coin Toss</span>
            </a>
          </Link>
          
          <Link href="/sattamatka">
            <a className={getLinkStyles('/sattamatka')}>
              <i className="ri-numbers-line text-xl"></i>
              <span className="text-xs mt-1">Sattamatka</span>
            </a>
          </Link>
          
          <Link href="/wallet">
            <a className={getLinkStyles('/wallet')}>
              <i className="ri-wallet-3-line text-xl"></i>
              <span className="text-xs mt-1">Wallet</span>
            </a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
