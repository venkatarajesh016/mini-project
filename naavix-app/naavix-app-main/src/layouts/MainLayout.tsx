import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import QueuePanel from '@/components/QueuePanel';
import MobileNav from '@/components/MobileNav';

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar className="hidden md:flex fixed left-0 top-0 bottom-24 z-30" />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mb-40 md:mb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Queue Panel */}
      <QueuePanel />

      {/* Player Bar */}
      <PlayerBar />
    </div>
  );
};

export default MainLayout;
