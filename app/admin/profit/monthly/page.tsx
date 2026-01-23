'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function MonthlyReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 150000, orders: 45, vendors: 12 },
    { month: 'Feb', revenue: 180000, orders: 52, vendors: 15 },
    { month: 'Mar', revenue: 220000, orders: 68, vendors: 18 },
    { month: 'Apr', revenue: 195000, orders: 58, vendors: 14 },
    { month: 'May', revenue: 250000, orders: 75, vendors: 22 },
    { month: 'Jun', revenue: 280000, orders: 82, vendors: 25 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Monthly Report</h1>
            <p className="text-gray-500 mt-1">Revenue and performance overview</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            >
              {months.map((month, i) => (
                <option key={month} value={i}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
              Export PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">Rs. 1,275,000</p>
            <p className="text-white/70 text-sm mt-2">↑ 15% from last month</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm">Total Orders</p>
            <p className="text-3xl font-bold mt-2">380</p>
            <p className="text-white/70 text-sm mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm">New Vendors</p>
            <p className="text-3xl font-bold mt-2">106</p>
            <p className="text-white/70 text-sm mt-2">↑ 8% from last month</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm">Platform Commission</p>
            <p className="text-3xl font-bold mt-2">Rs. 127,500</p>
            <p className="text-white/70 text-sm mt-2">10% of revenue</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue Trend</h3>
          <div className="flex items-end justify-between h-64 gap-4">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Rs. {(data.revenue / 1000).toFixed(0)}K
                </span>
                <div
                  className="w-full bg-gradient-to-t from-rose-500 to-pink-400 rounded-t-lg transition-all duration-500 hover:from-rose-600 hover:to-pink-500"
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                ></div>
                <span className="text-sm text-gray-500">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Category</h3>
            <div className="space-y-4">
              {[
                { name: 'Services', amount: 450000, percent: 35, color: 'bg-blue-500' },
                { name: 'Albums', amount: 380000, percent: 30, color: 'bg-purple-500' },
                { name: 'Proposals', amount: 255000, percent: 20, color: 'bg-amber-500' },
                { name: 'Products', amount: 190000, percent: 15, color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-600 font-medium">Rs. {item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`${item.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performers</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full ${i === 1 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'} font-bold`}>
                    {i}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Vendor Name {i}</p>
                    <p className="text-sm text-gray-500">Service Vendor</p>
                  </div>
                  <span className="font-semibold text-gray-800">Rs. {(50000 / i).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
