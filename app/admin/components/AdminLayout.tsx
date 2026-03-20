'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import { Menu, Bell, User, Search } from 'lucide-react';

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

    try {
      setAdmin(JSON.parse(adminData));
    } catch (e) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-rose-600 font-medium">Preparing Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F9]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Dynamic Content Area */}
      <div className="lg:ml-72 flex-1 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Modern Compact Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-rose-100/50 px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-50/50 border border-rose-100 rounded-2xl w-64 lg:w-96 group focus-within:ring-2 ring-rose-200 transition-all">
                <Search className="w-4 h-4 text-rose-300 group-focus-within:text-rose-500" />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder:text-rose-200 w-full"
                />
              </div>
            </div>
             
            <div className="flex items-center gap-3 lg:gap-5">
              <button className="relative p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
              </button>

              <div className="h-8 w-[1px] bg-rose-100 mx-1 hidden sm:block" />

              <div className="flex items-center gap-3 pl-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-black text-gray-800 leading-none">{admin?.name || 'Administrator'}</p>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter mt-1">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-tr from-rose-100 to-rose-200 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm group cursor-pointer hover:shadow-md transition-all">
                  <User className="w-5 h-5 text-rose-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with improved padding and max-width */}
        <main className="flex-1 p-4 lg:p-8 xl:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
