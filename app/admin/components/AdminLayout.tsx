'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  clearAuthSession,
  getSafeReturnPath,
  getStoredUser,
  isSessionValid,
} from '@/lib/auth';

import {
  LayoutDashboard,
  Users,
  Camera,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!isSessionValid()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const user = getStoredUser();

    if (user) {
      try {
        setAdminName(user.name || user.fullName || 'Admin');
      } catch {}
    }

    setChecking(false);
  }, [pathname, router]);

  const logout = () => {
    clearAuthSession();

    // send to login and include return path so user can login and return
    router.push(`/login?next=${encodeURIComponent(getSafeReturnPath(pathname))}`);
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: <Users size={20} />,
    },
    {
      label: 'Photographers',
      href: '/admin/photographers',
      icon: <Camera size={20} />,
    },
    {
      label: 'Albums',
      href: '/admin/albums',
      icon: <Image size={20} />,
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7FA]">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-[#B11469] rounded-full animate-spin"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* LOGO */}
      <div className="px-6 py-7 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <img
            src="/images/logobg.png"
            alt="logo"
            className="h-10 w-auto"
          />

          <div>
            <h1 className="text-[20px] font-bold text-[#B11469]">
              MemoAlbum
            </h1>

            <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                active
                  ? 'bg-[#B11469] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-rose-50 hover:text-[#B11469]'
              }`}
            >
              {item.icon}

              <span className="font-medium text-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

       
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FFF9FB]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-rose-100 shadow-sm">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="fixed left-0 top-0 z-50 h-screen w-72 bg-white shadow-2xl lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-rose-100 px-5 lg:px-8 flex items-center justify-between shadow-sm">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl border border-rose-100 flex items-center justify-center"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Welcome Back 👋
              </h2>

              <p className="text-sm text-gray-400">
                Manage your MemoAlbum platform
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <button className="relative w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-[#B11469]">
              <Bell size={20} />

              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></div>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((s) => !s)}
                className="flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-full bg-[#B11469] flex items-center justify-center text-white font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>

                <div className="hidden sm:block">
                  <h4 className="text-sm font-semibold text-gray-700">
                    {adminName}
                  </h4>

                  <p className="text-xs text-gray-400">Super Admin</p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-rose-100 p-2 z-50">
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="bg-white min-h-full rounded-3xl shadow-sm border border-rose-100 p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}