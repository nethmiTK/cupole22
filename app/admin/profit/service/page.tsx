'use client';

import AdminLayout from '../../components/AdminLayout';

export default function ServiceProfitPage() {
  const services = [
    { name: 'Wedding Photography', revenue: 250000, bookings: 45, commission: 25000 },
    { name: 'Wedding Decoration', revenue: 180000, bookings: 32, commission: 18000 },
    { name: 'Catering Services', revenue: 150000, bookings: 28, commission: 15000 },
    { name: 'Wedding Planning', revenue: 120000, bookings: 15, commission: 12000 },
    { name: 'DJ & Music', revenue: 80000, bookings: 22, commission: 8000 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛎️ Service Profit Report</h1>
            <p className="text-gray-500 mt-1">Revenue from wedding services</p>
          </div>
          <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
            Export Report
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm">Total Service Revenue</p>
            <p className="text-3xl font-bold mt-2">Rs. 780,000</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600">142</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Commission Earned</p>
            <p className="text-2xl font-bold text-green-600">Rs. 78,000</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Active Vendors</p>
            <p className="text-2xl font-bold text-purple-600">35</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Service Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Bookings</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Commission</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span>🛎️</span>
                      </div>
                      <span className="font-medium text-gray-800">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">Rs. {service.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600">{service.bookings}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">Rs. {service.commission.toLocaleString()}</td>
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
