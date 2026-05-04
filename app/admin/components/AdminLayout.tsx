'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    const user = localStorage.getItem('adminUser');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setAdminName(parsed.name || 'Admin');
      } catch {}
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="w-10 h-10 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
          <div />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 font-black text-xs">
                {adminName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {adminName}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}