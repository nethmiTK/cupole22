'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  services: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  plan: string;
  createdAt: string;
}

export default function ServiceVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/vendors?type=service`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredVendors = filter === 'all' ? vendors : vendors.filter(v => v.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛎️ Service Vendors</h1>
            <p className="text-gray-500 mt-1">Manage wedding service providers</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-white/80">Total Service Vendors</p>
            <p className="text-3xl font-bold">{vendors.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-600">{vendors.filter(v => v.status === 'approved').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{vendors.filter(v => v.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">Total Services</p>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-gray-500">Loading...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <span className="text-4xl mb-4 block">🛎️</span>
              <p>No service vendors found</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div key={vendor._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🛎️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{vendor.name}</h3>
                        <p className="text-sm text-gray-500">{vendor.businessName}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📧 {vendor.email}</p>
                    <p>📞 {vendor.phone}</p>
                    <p>📅 Joined: {new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      View Details
                    </button>
                    {vendor.status === 'pending' && (
                      <>
                        <button className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                          ✅
                        </button>
                        <button className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                          ❌
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
