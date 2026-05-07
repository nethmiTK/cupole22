'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  Camera,
  Users,
  Image,
  CreditCard,
  Clock,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

interface Stats {
  photographers: {
    total: number;
    active: number;
    disabled: number;
    pending: number;
  };
  customers: { total: number };
  albums: { total: number };
  payments: { completed: number; pending: number };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/admin/stats');

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      } else {
        setError('Failed to load stats');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: 'Total Photographers',
      value: stats?.photographers.total ?? 0,
      sub: `${stats?.photographers.active ?? 0} active`,
      icon: Camera,
      color: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-200',
    },
    {
      label: 'Pending Approval',
      value: stats?.photographers.pending ?? 0,
      sub: 'Waiting for review',
      icon: Clock,
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-200',
    },
    {
      label: 'Disabled Accounts',
      value: stats?.photographers.disabled ?? 0,
      sub: 'Suspended photographers',
      icon: XCircle,
      color: 'from-gray-500 to-gray-600',
      shadow: 'shadow-gray-200',
    },
    {
      label: 'Total Customers',
      value: stats?.customers.total ?? 0,
      sub: 'Registered users',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-200',
    },
    {
      label: 'Total Albums',
      value: stats?.albums.total ?? 0,
      sub: 'Created by photographers',
      icon: Image,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200',
    },
    {
      label: 'Completed Payments',
      value: stats?.payments.completed ?? 0,
      sub: `${stats?.payments.pending ?? 0} pending`,
      icon: CreditCard,
      color: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-200',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Platform <span className="text-rose-600">Overview</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time statistics for CoupleCanvas
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-gray-600">Live</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 hover:-translate-y-1 transition-transform"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${card.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg ${card.shadow}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {card.label}
                </p>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-100 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-4xl font-black text-gray-900 mt-1">
                    {card.value}
                  </p>
                )}
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {card.sub}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Add Photographer',
                href: '/admin/photographers',
                color: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
              },
              {
                label: 'View Albums',
                href: '/admin/albums',
                color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
              },
              {
                label: 'View Payments',
                href: '/admin/payments',
                color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
              },
              {
                label: 'View Customers',
                href: '/admin/customers',
                color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
              },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`px-4 py-3 rounded-xl text-sm font-bold text-center transition-colors ${action.color}`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}