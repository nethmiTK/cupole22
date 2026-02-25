'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, Camera, Heart, CheckCircle, Clock, BarChart3, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchStats(token);
    }
  }, []);

  const fetchStats = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const mainSummary = [
    {
      title: 'Album Platform',
      count: stats?.albumVendors || 0,
      subText: 'Verified Partners',
      icon: <Camera className="w-8 h-8" />,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      active: stats?.albums || 0,
      activeLabel: 'Total Albums Live'
    },
    {
      title: 'Proposal Portal',
      count: stats?.proposalVendors || 0,
      subText: 'Active Proposers',
      icon: <Heart className="w-8 h-8" />,
      color: 'bg-rose-400',
      lightColor: 'bg-rose-50/50',
      textColor: 'text-rose-500',
      active: stats?.proposals || 0,
      activeLabel: 'Total Ads Published'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-10 pb-10">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> Secure Administrator Hub
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Platform <span className="text-rose-600">Overview</span></h1>
            <p className="text-gray-500 font-medium">Monitoring Album & Marriage Proposal ecosystems.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-bold text-gray-700">Live Services Active</span>
            </div>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mainSummary.map((item, index) => (
            <div key={index} className="group relative bg-white rounded-[2.5rem] p-1 shadow-xl shadow-rose-100/20 border border-rose-50 transition-all hover:translate-y-[-4px]">
              <div className="bg-gradient-to-br from-white to-rose-50/30 rounded-[2.2rem] p-8">
                <div className="flex justify-between items-start mb-10">
                  <div className={`p-5 rounded-3xl ${item.lightColor} ${item.textColor} shadow-inner`}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{item.title}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{item.count}</h2>
                      <span className="text-xs font-bold text-rose-400">VENDORS</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <p className="text-sm font-bold text-gray-600">{item.activeLabel}</p>
                    </div>
                    <p className="text-xl font-black text-gray-900">{item.active}</p>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} shadow-lg shadow-rose-200 transition-all duration-1000`}
                      style={{ width: `${Math.min(100, (item.active / 500) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Platform Capacity</span>
                    <span className="text-rose-500">Target: 500+</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Performance Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Detailed Stat Cards */}
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { label: 'Pending Approvals', value: stats?.pendingVendors || 0, icon: <Clock />, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Verified Partners', value: stats?.vendors || 0, icon: <BarChart3 />, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Customer Reach', value: stats?.customers || 0, icon: <Users />, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Total Services', value: stats?.services || 0, icon: <Activity />, color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'Sale Products', value: stats?.products || 0, icon: <CheckCircle />, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Revenue Health', value: 'Prime', icon: <ArrowUpRight />, color: 'text-rose-600', bg: 'bg-rose-100/50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Activity Pulse */}
          <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-rose-50 pb-4">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Live Pulse</h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { user: 'Vendor Registration', time: '2 mins ago', type: 'Album', status: 'Pending' },
                  { user: 'New Proposal Ad', time: '14 mins ago', type: 'Proposal', status: 'Active' },
                  { user: 'Subscription Sync', time: '1 hour ago', type: 'System', status: 'Success' },
                  { user: 'Database Backup', time: '4 hours ago', type: 'Core', status: 'Completed' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 group-hover:bg-rose-500 group-hover:text-white transition-all text-rose-500 font-bold text-xs shadow-sm">
                      {log.type.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 leading-none">{log.user}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">{log.time} • {log.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 mt-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors">
                View Audit Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
