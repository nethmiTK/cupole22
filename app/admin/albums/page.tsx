'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Image, Trash2, Users, Camera } from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { toast } from 'react-toastify';

interface Album {
  _id: string;
  title: string;
  description: string;
  price: number;
  shareEnabled: boolean;
  created_at: string;
  accessCount: number;
  photographer?: { _id: string; name: string; email: string };
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchAlbums();
  }, [page, search]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);

      const res = await apiFetch(`/admin/albums?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAlbums(data.albums || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbum = async (id: string) => {
    if (!confirm('Delete this album? This cannot be undone.')) return;
    setActionLoadingId(id);
    try {
      const res = await apiFetch(`/admin/albums/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Album deleted');
        fetchAlbums();
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
        <div>
          <h1 className="text-3xl font-black text-gray-900">Albums</h1>
          <p className="text-gray-400 text-sm mt-1">
            All albums across all photographers — {totalRecords} total
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by album title..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    'Album',
                    'Photographer',
                    'Price',
                    'Customers',
                    'Shared',
                    'Created',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={7}
                        className="px-6 py-4 h-16 bg-gray-50/50"
                      />
                    </tr>
                  ))
                ) : albums.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <Image className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      No albums found.
                    </td>
                  </tr>
                ) : (
                  albums.map((a) => (
                    <tr
                      key={a._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
                            <Image className="w-4 h-4 text-rose-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {a.title}
                            </p>
                            {a.description && (
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                {a.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {a.photographer ? (
                          <div className="flex items-center gap-2">
                            <Camera className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {a.photographer.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        LKR {a.price?.toLocaleString() ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-3 h-3" />
                          {a.accessCount}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            a.shareEnabled
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {a.shareEnabled ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteAlbum(a._id)}
                          disabled={actionLoadingId === a._id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Album"
                        >
                          {actionLoadingId === a._id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, totalRecords)} of {totalRecords}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}