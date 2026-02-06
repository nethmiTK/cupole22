'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export default function AdminAccountPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/all`);
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
        setError('');
      } else {
        setError('Failed to fetch admins');
      }
    } catch (err) {
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  // Delete admin handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Admin deleted successfully');
        fetchAdmins();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete admin');
      }
    } catch (err) {
      setError('Failed to delete admin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess('Admin added successfully');
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'admin' });
        fetchAdmins();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to add admin');
      }
    } catch (err) {
      setError('Failed to add admin');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Accounts</h1>
            <p className="text-gray-500 mt-1">Manage administrator accounts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Add Admin
          </button>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Admin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                        <span className="text-rose-600 font-semibold">{admin.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-800">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(admin.role || 'admin')}`}>
                      {(admin.role || 'admin').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                      <button onClick={() => handleDelete(admin._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Admin Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Admin Account</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg"
                  >
                    Add Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
