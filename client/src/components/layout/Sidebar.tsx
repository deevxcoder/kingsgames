import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import WalletCard from '../wallet/WalletCard';

type SidebarLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isActive }) => {
  const activeClass = isActive
    ? "text-accent border-l-2 border-accent bg-primary-lighter bg-opacity-50"
    : "text-textSecondary hover:text-textPrimary hover:bg-primary-lighter transition-colors";
  
  return (
    <Link href={to}>
      <a className={`flex items-center px-6 py-3 ${activeClass}`}>
        {icon}
        <span>{label}</span>
      </a>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary-darker border-r border-primary-lighter">
      <div className="p-6 flex items-center">
        <svg 
          className="w-10 h-10 mr-3 text-accent" 
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
        <h1 className="text-2xl font-heading font-bold text-accent">BetWise</h1>
      </div>
      
      <nav className="mt-6 flex-1">
        <div className="px-4 py-2 text-sm font-medium text-textSecondary uppercase">Main Menu</div>
        
        <SidebarLink 
          to="/" 
          icon={<i className="ri-home-5-line mr-3 text-xl"></i>} 
          label="Home" 
          isActive={location === '/'} 
        />
        
        {user && (
          <SidebarLink 
            to="/wallet" 
            icon={<i className="ri-wallet-3-line mr-3 text-xl"></i>} 
            label="Wallet" 
            isActive={location === '/wallet'} 
          />
        )}
        
        {user && (
          <SidebarLink 
            to="/profile" 
            icon={<i className="ri-user-settings-line mr-3 text-xl"></i>} 
            label="Profile" 
            isActive={location === '/profile'} 
          />
        )}
        
        {user && user.isAdmin && (
          <SidebarLink 
            to="/admin" 
            icon={<i className="ri-admin-line mr-3 text-xl"></i>} 
            label="Admin Panel" 
            isActive={location.startsWith('/admin')} 
          />
        )}
        
        <div className="px-4 py-2 mt-6 text-sm font-medium text-textSecondary uppercase">Games</div>
        
        <SidebarLink 
          to="/coin-toss" 
          icon={<i className="ri-coin-line mr-3 text-xl"></i>} 
          label="Coin Toss" 
          isActive={location === '/coin-toss'} 
        />
        
        <SidebarLink 
          to="/sattamatka" 
          icon={<i className="ri-numbers-line mr-3 text-xl"></i>} 
          label="Sattamatka" 
          isActive={location === '/sattamatka'} 
        />
      </nav>
      
      {user && <WalletCard />}
    </aside>
  );
};

export default Sidebar;
