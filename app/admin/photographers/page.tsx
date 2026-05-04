'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  User,
  Camera,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { toast } from 'react-toastify';

interface Photographer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  status: string;
  createdAt: string;
  albumCount?: number;
}

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPhotographers();
  }, [page, search, statusFilter]);

  const fetchPhotographers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await apiFetch(`/admin/photographers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPhotographers(data.photographers || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (p: Photographer) => {
    const newStatus = p.status === 'active' ? 'disabled' : 'active';
    setActionLoadingId(p._id);
    try {
      const res = await apiFetch(`/admin/photographers/${p._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(
          `Photographer ${newStatus === 'active' ? 'enabled' : 'disabled'}`
        );
        fetchPhotographers();
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const deletePhotographer = async (id: string) => {
    if (
      !confirm(
        'Delete this photographer and all their albums? This cannot be undone.'
      )
    )
      return;

    setActionLoadingId(id);
    try {
      const res = await apiFetch(`/admin/photographers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Photographer deleted');
        fetchPhotographers();
      } else {
        toast.error('Failed to delete');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Photographers
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage photographer accounts — {totalRecords} total
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-200"
          >
            <Plus className="w-4 h-4" />
            Add Photographer
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                {['Photographer', 'Email', 'Phone', 'Albums', 'Joined', 'Status', 'Actions'].map(
                  (h) => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y">
              {photographers.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  {/* Photographer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.bio || 'No bio'}</div>
                      </div>
                    </div>
                  </td>

                  {/* EMAIL FIXED */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <a
                      href={`mailto:${p.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.email}
                    </a>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {p.phone || '—'}
                  </td>

                  <td className="px-6 py-4 font-bold">{p.albumCount ?? 0}</td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : '—'}
                  </td>

                  <td className="px-6 py-4">{p.status}</td>

                  {/* ACTIONS FIXED */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => toggleStatus(p)}>
                        {p.status === 'active' ? <XCircle /> : <CheckCircle />}
                      </button>

                      <a
                        href={`/admin/photographers/${p._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </a>

                      <button onClick={() => deletePhotographer(p._id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
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