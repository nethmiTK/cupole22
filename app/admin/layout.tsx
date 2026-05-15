 'use client';

import { useState } from 'react';
import PhotographerSidebar from '../Components/sidebar';
import PhotographerNavbar from '../Components/navbar';
import MobileBottomNav from '../Components/MobileBottomNav';

export default function PhotographerAdmiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ backgroundColor: '#FFF8F7' }}>
      <PhotographerSidebar
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PhotographerNavbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ backgroundColor: '#FFF8F7' }}>
          <div className="py-2">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
