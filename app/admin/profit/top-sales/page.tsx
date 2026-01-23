'use client';

import AdminLayout from '../../components/AdminLayout';

export default function TopSalesPage() {
  const topVendors = [
    { rank: 1, name: 'Studio Creative', type: 'Album', revenue: 375000, orders: 25, badge: '🥇' },
    { rank: 2, name: 'Romantic Events', type: 'Proposal', revenue: 300000, orders: 20, badge: '🥈' },
    { rank: 3, name: 'Wedding Essentials', type: 'Product', revenue: 450000, orders: 150, badge: '🥉' },
    { rank: 4, name: 'Photo Memories', type: 'Album', revenue: 270000, orders: 18, badge: '' },
    { rank: 5, name: 'Wedding Photography', type: 'Service', revenue: 250000, orders: 45, badge: '' },
    { rank: 6, name: 'Dream Proposals', type: 'Proposal', revenue: 225000, orders: 15, badge: '' },
    { rank: 7, name: 'Bridal Collection', type: 'Product', revenue: 360000, orders: 120, badge: '' },
    { rank: 8, name: 'Wedding Decoration', type: 'Service', revenue: 180000, orders: 32, badge: '' },
    { rank: 9, name: 'Love Stories', type: 'Proposal', revenue: 180000, orders: 12, badge: '' },
    { rank: 10, name: 'Gift Gallery', type: 'Product', revenue: 300000, orders: 100, badge: '' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Service': return 'bg-blue-100 text-blue-700';
      case 'Album': return 'bg-purple-100 text-purple-700';
      case 'Proposal': return 'bg-amber-100 text-amber-700';
      case 'Product': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏆 Top Sales</h1>
            <p className="text-gray-500 mt-1">Best performing vendors</p>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500">
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topVendors.slice(0, 3).map((vendor, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 text-center ${
                i === 0
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white md:order-2 md:-mt-4'
                  : i === 1
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 md:order-1'
                  : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white md:order-3'
              }`}
            >
              <span className="text-5xl">{vendor.badge}</span>
              <h3 className="text-xl font-bold mt-4">{vendor.name}</h3>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-2 ${
                i === 0 ? 'bg-white/20' : i === 1 ? 'bg-white/50' : 'bg-white/20'
              }`}>
                {vendor.type}
              </span>
              <p className="text-3xl font-bold mt-4">Rs. {vendor.revenue.toLocaleString()}</p>
              <p className="text-sm opacity-80 mt-1">{vendor.orders} orders</p>
            </div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Full Leaderboard</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topVendors.map((vendor) => (
                <tr key={vendor.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                      vendor.rank <= 3 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {vendor.badge || vendor.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{vendor.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(vendor.type)}`}>
                      {vendor.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{vendor.orders}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">Rs. {vendor.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
