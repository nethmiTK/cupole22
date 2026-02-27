'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, Camera, Heart, CheckCircle, Clock, BarChart3, ArrowUpRight, ShieldCheck, Activity, Mail, MessageSquare } from 'lucide-react';

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      } else {
        const text = await res.text();
        console.error('Stats fetch returned non-OK', res.status, text);
        throw new Error(`Stats fetch failed with status ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const mainSummary = [
    {
      type: 'album',
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
      type: 'proposal',
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

        {/* Tier 1: Platform Summary */}
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
                      <p className="text-sm font-bold text-gray-600">Revenue Contribution</p>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      LKR {stats?.revenueBreakdown?.[item.type === 'album' ? 'album' : 'proposal']?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} shadow-lg shadow-rose-200 transition-all duration-1000`}
                      style={{ width: `${Math.min(100, (stats?.revenueBreakdown?.[item.type === 'album' ? 'album' : 'proposal'] || 0) / (stats?.totalRevenue || 1) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>{item.activeLabel}: {item.active}</span>
                    <span className="text-rose-500">Platform Share: {Math.round((stats?.revenueBreakdown?.[item.type === 'album' ? 'album' : 'proposal'] || 0) / (stats?.totalRevenue || 1) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tier 2: Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Platform Profit', value: stats?.totalRevenue ? `LKR ${stats.totalRevenue.toLocaleString()}` : 'LKR 0', icon: <Activity />, color: 'from-emerald-500 to-teal-600', sub: 'Total Accumulated Revenue' },
            { label: 'Pending Vendors', value: (stats?.albumVendorsPending || 0) + (stats?.proposalVendorsPending || 0), icon: <Clock />, color: 'from-amber-400 to-orange-500', sub: 'Awaiting Verification' },
            { label: 'Active Partners', value: (stats?.albumVendorsActive || 0) + (stats?.proposalVendorsActive || 0), icon: <ShieldCheck />, color: 'from-blue-500 to-indigo-600', sub: 'Live on Platform' },
            { label: 'Enquiries', value: stats?.contacts || 0, icon: <Mail className="w-6 h-6" />, color: 'from-purple-500 to-violet-600', sub: `${stats?.newContacts || 0} New Messages` },
            { label: 'Global Traffic', value: (stats?.albums || 0) + (stats?.proposals || 0), icon: <ArrowUpRight />, color: 'from-rose-500 to-pink-600', sub: 'Total Ads & Albums' },
          ].map((stat, i) => (
            <div key={i} className="group relative bg-white p-6 rounded-[2rem] border border-rose-50 shadow-xl shadow-rose-100/10 overflow-hidden transition-all hover:translate-y-[-4px]">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] blur-2xl -mr-8 -mt-8`}></div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tier 3: Real-time Data */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Revenue Growth Summary */}
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 border border-rose-100 shadow-xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Revenue Performance</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Monthly sales performance</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Total Profit</p>
                <p className="text-xl font-black text-emerald-700">LKR {stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="space-y-6">
              {stats?.monthlyRevenue?.map((mon: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Month {mon._id.month}, {mon._id.year}</span>
                    <span className="text-sm font-black text-rose-600">LKR {mon.total?.toLocaleString() || 0}</span>
                  </div>
                  <div className="h-4 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100/50">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-full shadow-lg shadow-rose-200 transition-all duration-1000"
                      style={{ width: `${Math.min(100, ((mon.total || 0) / (stats?.totalRevenue || 1)) * 100 * 3)}%` }} // Scaled for visibility
                    ></div>
                  </div>
                </div>
              ))}
              {(!stats?.monthlyRevenue || stats.monthlyRevenue.length === 0) && (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                  <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No Monthly Profit Data Yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed - Sales */}
          <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-xl p-8 relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-rose-50 pb-4 mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Sales</h3>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {stats?.recentSubscriptions && stats.recentSubscriptions.length > 0 ? (
                stats.recentSubscriptions.map((sub: any, i: number) => {
                  const picUrl = sub.vendorProfilePic ? (sub.vendorProfilePic.startsWith('http') ? sub.vendorProfilePic : `http://localhost:4000${sub.vendorProfilePic.startsWith('/') ? '' : '/'}${sub.vendorProfilePic}`) : null;

                  return (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 hover:bg-rose-50/30 p-2 rounded-2xl transition-all">
                      {picUrl ? (
                        <img
                          src={picUrl}
                          alt={sub.vendorName}
                          className="w-10 h-10 rounded-2xl object-cover border border-rose-100 shadow-sm"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 text-rose-500 font-extrabold text-xs shadow-sm capitalize">
                          {sub.vendorName?.charAt(0) || sub.vendorType?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800 leading-none">{sub.vendorName || sub.planName}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">
                          {sub.vendorName ? sub.planName + ' • ' : ''}
                          LKR {sub.amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <Activity className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No Recent Sales</p>
                </div>
              )}
            </div>

            <button
              onClick={() => window.location.href = '/admin/album-vendors'}
              className="w-full py-4 mt-6 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              All Subscriptions
            </button>
          </div>

          {/* Activity Feed - Contacts */}
          <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-xl p-8 relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-rose-50 pb-4 mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Enquiries</h3>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {stats?.recentContacts && stats.recentContacts.length > 0 ? (
                stats.recentContacts.map((contact: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 hover:bg-rose-50/30 p-2 rounded-2xl transition-all"
                    onClick={() => window.location.href = '/admin/contacts'}>
                    <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 text-rose-500 font-extrabold text-xs shadow-sm capitalize">
                      {contact.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 leading-none truncate">{contact.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold truncate">
                        {contact.subject || 'Enquiry'} • {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {contact.status === 'new' && (
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Mail className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No Recent Enquiries</p>
                </div>
              )}
            </div>

            <button
              onClick={() => window.location.href = '/admin/contacts'}
              className="w-full py-4 mt-6 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
            >
              Manage Enquiries
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
