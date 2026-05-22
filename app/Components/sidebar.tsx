'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image,
  Users,
  CreditCard,
  UserCog,
  CircleUserRound,
  LogOut,
} from 'lucide-react';
import { clearAuthSession } from '@/lib/auth';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface PhotographerSidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function PhotographerSidebar({ isMobileOpen, onClose }: PhotographerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const mainMenuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    // { label: 'Albums', href: '/admin/albums', icon: <Image size={20} /> },
    // { label: 'Customers', href: '/admin/customers', icon: <Users size={20} /> },
    { label: 'Payments', href: '/admin/payments', icon: <CreditCard size={20} /> },
    { label: 'User Management', href: '/admin/photographers', icon: <UserCog size={20} /> },
  ];

  const isActive = (href: string) => pathname === href;
  const isProfileActive = isActive('/admin/profile');

  const handleLogout = () => {
    clearAuthSession();
    router.replace('/login');
    onClose();
  };

  const SidebarContent = () => (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(229, 204, 212, 0.2)' }}>
          <h1
            className="text-lg font-serif font-semibold italic mb-1"
            style={{ color: '#B10E6B' }}
          >
            MemoAlbum
          </h1>
        <p
          className="text-[11px] tracking-[0.28em] font-semibold uppercase"
          style={{ color: '#9B9095' }}
        >
          The Digital Curator
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 min-h-0 px-3 py-4 pr-2 space-y-1 overflow-y-auto sidebar-scrollbar">
        {mainMenuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                active
                  ? 'font-semibold text-[#B10E6B]'
                  : 'text-[#6B7387] hover:text-[#B10E6B]'
              }`}
            >
              {active && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-[#B10E6B]"></div>}
              <div className={`flex-shrink-0 w-5 h-5 ${active ? 'text-[#B10E6B]' : 'text-[#6B7387]'}`}>{item.icon}</div>
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 space-y-2 border-t" style={{ borderColor: 'rgba(229, 204, 212, 0.2)' }}>
        <Link
          href="/admin/profile"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
            isProfileActive ? 'font-semibold text-[#B10E6B]' : 'text-[#6B7387] hover:text-[#B10E6B]'
          }`}
        >
          {isProfileActive && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-[#B10E6B]"></div>}
          <CircleUserRound size={20} className={isProfileActive ? 'text-[#B10E6B]' : 'text-[#6B7387]'} />
          <span className="text-sm font-medium tracking-wide">Profile</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-[#6B7387] hover:text-[#B10E6B] text-left"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex md:w-64 h-screen min-h-0 flex-col overflow-hidden flex-shrink-0"
        style={{ backgroundColor: '#F3E5E6' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 transform transition-transform duration-200 flex flex-col overflow-hidden flex-shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#F3E5E6' }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

