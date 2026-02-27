'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';


interface MenuItem {
  name: string;
  href?: string;
  children?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    name: 'Proposal Vendor',
    href: '/admin/proposal-vendors',
  },
  {
    name: 'Album Vendor',
    href: '/admin/album-vendors',
  },
  {
    name: 'Contacts',
    href: '/admin/contacts',
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
      <aside className={`w-64 h-screen fixed top-0 left-0 bg-gradient-to-b from-white via-gray-50 to-white text-gray-900 flex flex-col shadow-2xl border-r border-gray-100 z-50 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 lg:p-7 border-b border-gray-100 flex flex-col items-center">
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-rose-700 mb-1">CoupleCanvas</h1>
          <p className="text-rose-400 text-sm lg:text-base font-medium">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const parentActive = isParentActive(item.children) || openMenus.includes(item.name);
              return (
                <li key={item.name}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={`flex items-center px-4 lg:px-5 py-3 rounded-xl transition-all duration-200 border border-transparent text-sm lg:text-lg ${isActive(item.href)
                        ? 'bg-rose-600 text-white font-bold border-rose-700 shadow-md'
                        : 'hover:bg-rose-100 hover:text-rose-700 text-gray-700'
                        }`}
                    >
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-200 border border-transparent ${parentActive
                          ? 'bg-rose-600 text-white font-bold border-rose-700 shadow-md'
                          : 'hover:bg-rose-100 hover:text-rose-700 text-gray-700'
                          }`}
                      >
                        <span className="font-semibold text-lg">{item.name}</span>
                        <span
                          className={`transition-transform duration-300 text-base ml-2 ${openMenus.includes(item.name) ? 'rotate-180' : ''
                            }`}
                        >
                          ▼
                        </span>
                      </button>
                      <div
                        className={`transition-all duration-300 overflow-hidden ${openMenus.includes(item.name) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        {item.children && (
                          <ul className="mt-2 space-y-1 pl-2">
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`block px-4 py-2 rounded-lg text-base transition-all duration-200 border border-transparent ${isActive(child.href)
                                    ? 'bg-rose-100 text-rose-700 font-semibold border-rose-200 shadow'
                                    : 'hover:bg-rose-50 hover:text-rose-700 text-gray-700'
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

        {/* Logout */}
        <div className="p-4 lg:p-5 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 lg:px-5 py-3 bg-gradient-to-r from-rose-100 to-rose-200 hover:from-rose-200 hover:to-rose-300 rounded-xl transition-all duration-200 text-rose-700 hover:text-rose-900 font-bold shadow text-sm lg:text-base"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
