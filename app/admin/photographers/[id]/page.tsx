'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  CheckCircle,
  XCircle,
  Key,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../../../../lib/api';
import { toast } from 'react-toastify';

export default function PhotographerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/photographers/${id}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus =
      data.photographer.status === 'active' ? 'disabled' : 'active';
    setActionLoading(true);
    try {
      const res = await apiFetch(`/admin/photographers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(
          `Photographer ${newStatus === 'active' ? 'enabled' : 'disabled'}`
        );
        fetchDetail();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const deletePhotographer = async () => {
    if (
      !confirm(
        'Delete this photographer and all their albums? This cannot be undone.'
      )
    )
      return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/admin/photographers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Photographer deleted');
        router.push('/admin/photographers');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-400">
          Photographer not found.
        </div>
      </AdminLayout>
    );
  }

  const { photographer, albums, stats } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={() => router.push('/admin/photographers')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Photographers
        </button>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-rose-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900">
                  {photographer.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    photographer.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : photographer.status === 'disabled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {photographer.status === 'active' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {photographer.status.charAt(0).toUpperCase() +
                    photographer.status.slice(1)}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {photographer.email}
                </span>
                {photographer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {photographer.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  {stats.totalAlbums} albums
                </span>
              </div>
              {photographer.bio && (
                <p className="text-sm text-gray-600 italic">
                  {photographer.bio}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Key className="w-4 h-4" />
                Reset Password
              </button>
              <button
                onClick={toggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                  photographer.status === 'active'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {photographer.status === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={deletePhotographer}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Albums', value: stats.totalAlbums },
            {
              label: 'Customers Given Access',
              value: stats.totalCustomersGivenAccess,
            },
            {
              label: 'Member Since',
              value: new Date(photographer.createdAt).toLocaleDateString(),
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Albums */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Albums</h3>
          </div>
          {albums.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Camera className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              No albums created yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {albums.map((album: any) => (
                <div
                  key={album._id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {album.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {album.coupleAccess?.length ?? 0} customers ·{' '}
                      {album.created_at
                        ? new Date(album.created_at).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      album.shareEnabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {album.shareEnabled ? 'Shared' : 'Private'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showResetModal && (
        <ResetPasswordModal
          photographerId={id}
          onClose={() => setShowResetModal(false)}
        />
      )}

      {showEditModal && (
        <EditPhotographerModal
          photographer={photographer}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => {
            setShowEditModal(false);
            fetchDetail();
          }}
        />
      )}
    </AdminLayout>
  );
}

function ResetPasswordModal({
  photographerId,
  onClose,
}: {
  photographerId: string;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(
        `/admin/photographers/${photographerId}/reset-password`,
        {
          method: 'POST',
          body: JSON.stringify({ newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed');
        return;
      }
      toast.success('Password reset successfully');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-rose-100">
        <h2 className="text-xl font-black text-gray-900 mb-6">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPhotographerModal({
  photographer,
  onClose,
  onUpdated,
}: {
  photographer: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    name: photographer.name || '',
    email: photographer.email || '',
    phone: photographer.phone || '',
    bio: photographer.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/photographers/${photographer._id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update');
        return;
      }
      toast.success('Photographer updated');
      onUpdated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-rose-100">
        <h2 className="text-xl font-black text-gray-900 mb-6">
          Edit Photographer
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', required: true },
            {
              label: 'Email',
              key: 'email',
              type: 'email',
              required: true,
            },
            {
              label: 'Phone',
              key: 'phone',
              type: 'text',
              required: false,
            },
            { label: 'Bio', key: 'bio', type: 'text', required: false },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                required={field.required}
                value={form[field.key as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          ))}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}