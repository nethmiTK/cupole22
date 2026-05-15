'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image,
  Users,
  CreditCard,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', icon: <LayoutDashboard size={22} />, label: 'Home' },
  { href: '/admin/albums', icon: <Image size={22} />, label: 'Albums' },
  { href: '/admin/customers', icon: <Users size={22} />, label: 'Customers' },
  { href: '/admin/payments', icon: <CreditCard size={22} />, label: 'Payments' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Fragment key={item.href}>
              <Link href={item.href}>
                <div className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#b10e6b]' : 'text-gray-400'}`}>
                  {item.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </div>
              </Link>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
