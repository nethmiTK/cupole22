'use client';

import AdminLayout from '../../components/AdminLayout';

export default function ProductProfitPage() {
  const products = [
    { vendor: 'Wedding Essentials', products: 150, revenue: 450000, commission: 45000 },
    { vendor: 'Bridal Collection', products: 120, revenue: 360000, commission: 36000 },
    { vendor: 'Gift Gallery', products: 100, revenue: 300000, commission: 30000 },
    { vendor: 'Wedding Decor Shop', products: 80, revenue: 240000, commission: 24000 },
    { vendor: 'Accessories Hub', products: 60, revenue: 180000, commission: 18000 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛒 Product Sale Report</h1>
            <p className="text-gray-500 mt-1">Revenue from product sales</p>
          </div>
          <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
            Export Report
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm">Total Product Revenue</p>
            <p className="text-3xl font-bold mt-2">Rs. 1,530,000</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Products Sold</p>
            <p className="text-2xl font-bold text-green-600">510</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Commission Earned</p>
            <p className="text-2xl font-bold text-green-600">Rs. 153,000</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Active Vendors</p>
            <p className="text-2xl font-bold text-green-600">18</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Products Sold</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Commission</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span>🛒</span>
                      </div>
                      <span className="font-medium text-gray-800">{item.vendor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.products}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">Rs. {item.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">Rs. {item.commission.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-green-600">↑ {(Math.random() * 20 + 5).toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
