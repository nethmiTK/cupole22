'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchStats(token);
    }
  }, []);

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const vendorCards = [
    { title: 'All Vendors', count: stats?.vendors || 0, icon: '🏪', color: 'from-rose-500 to-pink-600', bgColor: 'bg-rose-50' },
    { title: 'Service Vendors', count: stats?.serviceVendors || 0, icon: '🛎️', color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50' },
    { title: 'Album Vendors', count: stats?.albumVendors || 0, icon: '📸', color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50' },
    { title: 'Proposal Vendors', count: stats?.proposalVendors || 0, icon: '💍', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50' },
    { title: 'Product Sale Vendors', count: stats?.productVendors || 0, icon: '🛒', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50' },
  ];

  const statsCards = [
    { title: 'Total Albums', count: stats?.albums || 0, icon: '📷', color: 'text-rose-600', bgIcon: 'bg-rose-100' },
    { title: 'Total Services', count: stats?.services || 0, icon: '🎯', color: 'text-blue-600', bgIcon: 'bg-blue-100' },
    { title: 'Total Products', count: stats?.products || 0, icon: '📦', color: 'text-green-600', bgIcon: 'bg-green-100' },
    { title: 'Total Proposals', count: stats?.proposals || 0, icon: '💐', color: 'text-amber-600', bgIcon: 'bg-amber-100' },
    { title: 'Total Customers', count: stats?.customers || 0, icon: '👥', color: 'text-purple-600', bgIcon: 'bg-purple-100' },
    { title: 'Pending Approvals', count: stats?.pendingVendors || 0, icon: '⏳', color: 'text-orange-600', bgIcon: 'bg-orange-100' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your wedding platform</p>
        </div>

        {/* Vendor Count Bars */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Vendor Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {vendorCards.map((card, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-xl shadow-lg p-6 bg-gradient-to-br ${card.color} text-white transform hover:scale-105 transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block">{card.icon}</span>
                  <p className="text-white/80 text-sm font-medium">{card.title}</p>
                  <p className="text-4xl font-bold mt-1">{card.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                    <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.count}</p>
                  </div>
                  <div className={`${card.bgIcon} p-4 rounded-xl`}>
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 font-medium">↑ 12%</span>
                    <span className="text-gray-400 ml-2">from last month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Vendors */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Vendor Registrations</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-rose-600 font-semibold">V{i}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Vendor Name {i}</p>
                    <p className="text-sm text-gray-500">Service Vendor</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">📦</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Order #{1000 + i}</p>
                    <p className="text-sm text-gray-500">Album Package</p>
                  </div>
                  <span className="font-semibold text-gray-800">Rs. {(i * 15000).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
