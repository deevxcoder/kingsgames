import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-primary text-textPrimary">
      <MobileNav />
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar pb-24 md:pb-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
