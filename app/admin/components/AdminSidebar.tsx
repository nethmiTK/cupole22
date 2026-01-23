'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface MenuItem {
  name: string;
  href?: string;
  icon: string;
  children?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: '📊',
  },
  {
    name: 'Contacts Users',
    icon: '👥',
    children: [
      { name: 'Messages', href: '/admin/contacts/messages' },
    ],
  },
  {
    name: 'System Feature',
    icon: '⚙️',
    children: [
      { name: 'System Category', href: '/admin/system/category' },
      { name: 'Subscription Plans', href: '/admin/system/sub-plans' },
      { name: 'Admin Account', href: '/admin/system/admin-account' },
    ],
  },
  {
    name: 'Vendors Manage',
    icon: '🏪',
    children: [
      { name: 'All Vendors', href: '/admin/vendors/all' },
      { name: 'Service Vendors', href: '/admin/vendors/service' },
      { name: 'Album Vendors', href: '/admin/vendors/album' },
      { name: 'Proposal Vendors', href: '/admin/vendors/proposal' },
      { name: 'Product Sale Vendors', href: '/admin/vendors/product' },
    ],
  },
  {
    name: 'Profit Summary',
    icon: '💰',
    children: [
      { name: 'Monthly Report', href: '/admin/profit/monthly' },
      { name: 'Service Profit Report', href: '/admin/profit/service' },
      { name: 'Album Vendor Report', href: '/admin/profit/album' },
      { name: 'Proposal Vendor Report', href: '/admin/profit/proposal' },
      { name: 'Product Sale Report', href: '/admin/profit/product' },
      { name: 'Top Sales', href: '/admin/profit/top-sales' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>(['Dashboard']);

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
    router.push('/admin/login');
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href);

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-rose-900 via-rose-800 to-rose-900 text-white flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-rose-700/50">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">💒</span>
          <span>CoupleCanvas</span>
        </h1>
        <p className="text-rose-200 text-sm mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'hover:bg-white/10 text-rose-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isParentActive(item.children)
                        ? 'bg-white/20 text-white'
                        : 'hover:bg-white/10 text-rose-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span
                      className={`transition-transform duration-200 ${
                        openMenus.includes(item.name) ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {openMenus.includes(item.name) && item.children && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-rose-600/50 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive(child.href)
                                ? 'bg-white/20 text-white font-medium'
                                : 'hover:bg-white/10 text-rose-200'
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-rose-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-rose-100 hover:text-white"
        >
          <span>🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
