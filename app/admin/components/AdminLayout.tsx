'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (!token || !adminData) {
      router.push('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-rose-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-rose-50 shadow-sm border-b border-rose-100 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
             
            <div className="flex items-center gap-2 lg:gap-4">
              <button className="relative p-2 text-rose-600 hover:text-rose-800 transition-colors">
                <span className="text-lg lg:text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-rose-600 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
