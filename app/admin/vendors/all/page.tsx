'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  plan: string;
  createdAt: string;
}

export default function AllVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/vendors`, {
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
      case 'suspended': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return '🛎️';
      case 'album': return '📸';
      case 'proposal': return '💍';
      case 'product': return '🛒';
      default: return '🏪';
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                         v.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Vendors</h1>
            <p className="text-gray-500 mt-1">Manage all registered vendors</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 w-64"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Vendors', count: vendors.length, color: 'rose' },
            { label: 'Approved', count: vendors.filter(v => v.status === 'approved').length, color: 'green' },
            { label: 'Pending', count: vendors.filter(v => v.status === 'pending').length, color: 'amber' },
            { label: 'Suspended', count: vendors.filter(v => v.status === 'suspended').length, color: 'gray' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl mb-4 block">🏪</span>
              <p>No vendors found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">{getTypeIcon(vendor.type)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{vendor.name}</p>
                          <p className="text-sm text-gray-500">{vendor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                        {vendor.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{vendor.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{vendor.plan || 'Free'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">👁️</button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">✅</button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">❌</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
