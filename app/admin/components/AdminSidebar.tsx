'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';


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
];


export default function AdminSidebar() {
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
    <aside className="w-64 h-screen fixed top-0 left-0 bg-gradient-to-b from-white via-gray-50 to-white text-gray-900 flex flex-col shadow-2xl border-r border-gray-100 z-50 overflow-y-auto">
      {/* Logo */}
      <div className="p-7 border-b border-gray-100 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-rose-700 mb-1">CoupleCanvas</h1>
        <p className="text-rose-400 text-base font-medium">Admin Panel</p>
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
                    className={`flex items-center px-5 py-3 rounded-xl transition-all duration-200 border border-transparent ${isActive(item.href)
                      ? 'bg-rose-600 text-white font-bold border-rose-700 shadow-md'
                      : 'hover:bg-rose-100 hover:text-rose-700 text-gray-700'
                      }`}
                  >
                    <span className="font-semibold text-lg">{item.name}</span>
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
      <div className="p-5 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-100 to-rose-200 hover:from-rose-200 hover:to-rose-300 rounded-xl transition-all duration-200 text-rose-700 hover:text-rose-900 font-bold shadow"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
