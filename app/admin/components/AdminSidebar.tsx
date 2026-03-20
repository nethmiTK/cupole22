'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  Image, 
  MessageSquare, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';


interface MenuItem {
  name: string;
  href?: string;
  icon: any;
  children?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Proposal Vendor',
    href: '/admin/proposal-vendors',
    icon: Users,
  },
  {
    name: 'Album Vendor',
    href: '/admin/album-vendors',
    icon: Image,
  },
  {
    name: 'Contacts',
    href: '/admin/contacts',
    icon: MessageSquare,
  },
];


interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Auto-open menu based on current path
  useEffect(() => {
    const activeMenus: string[] = [];
    menuItems.forEach((item) => {
      if (item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href))) {
        activeMenus.push(item.name);
      }
    });
    setOpenMenus((prev) => [...new Set([...prev, ...activeMenus])]);
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 h-screen fixed top-0 left-0 bg-white text-gray-900 flex flex-col shadow-2xl border-r border-rose-100 z-50 overflow-hidden transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="p-8 border-b border-rose-50 flex flex-col items-center bg-rose-50/30">
          <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 mb-4 transform hover:scale-105 transition-transform duration-300">
             <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-800 flex items-center gap-1">
            Memo <span className="text-rose-600">Album</span>
          </h1>
          <p className="text-rose-400 text-xs font-bold uppercase tracking-widest mt-1">Management Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 overflow-y-auto px-6 custom-scrollbar">
          <div className="mb-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            General Menu
          </div>
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const parentActive = isParentActive(item.children) || openMenus.includes(item.name);
              const active = isActive(item.href || '');

              return (
                <li key={item.name}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 border ${active
                        ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white border-rose-400 shadow-lg shadow-rose-200 ring-4 ring-rose-50/50'
                        : 'bg-white border-transparent text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                        }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="font-bold text-sm tracking-wide">{item.name}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 border ${parentActive
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-white border-transparent text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <Icon className={`w-5 h-5 ${parentActive ? 'text-rose-600' : ''}`} />
                          <span className="font-bold text-sm tracking-wide">{item.name}</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-300 ${openMenus.includes(item.name) ? 'rotate-90' : ''
                            }`}
                        />
                      </button>
                      <div
                        className={`transition-all duration-300 overflow-hidden ${openMenus.includes(item.name) ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                      >
                        {item.children && (
                          <ul className="space-y-1 ml-9 border-l-2 border-rose-100 pl-4 py-2">
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`block px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive(child.href)
                                    ? 'text-rose-600 font-bold bg-rose-50 ring-1 ring-rose-100'
                                    : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50/50'
                                    }`}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-6 border-t border-rose-50 bg-rose-50/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border-2 border-rose-100 hover:bg-rose-600 hover:border-rose-600 hover:text-white rounded-2xl transition-all duration-300 text-rose-600 font-black text-sm shadow-sm hover:shadow-xl hover:shadow-rose-100 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>SIGN OUT</span>
          </button>
          
          <div className="mt-4 flex justify-center items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
