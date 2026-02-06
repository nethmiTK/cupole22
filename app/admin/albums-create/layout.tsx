'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AlbumsCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Categories', href: '/admin/albums-create/categories' },
    { name: 'Templates', href: '/admin/albums-create/templates' },
    { name: 'Create Template', href: '/admin/albums-create/create' },
    { name: 'All Albums', href: '/admin/albums-create/albums' },
    { name: 'Layout Builder', href: '/admin/albums-create/layout-builder' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex gap-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
