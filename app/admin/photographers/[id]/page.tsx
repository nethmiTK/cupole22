'use client';

import { useEffect, useState, useCallback } from 'react';
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

  // Close modals when pressing Escape
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResetModal(false);
      setShowEditModal(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/photographers/${id}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        toast.error('Failed to load photographer details');
      }
    } catch (err) {
      toast.error('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = data.photographer.status === 'active' ? 'disabled' : 'active';
    setActionLoading(true);
    try {
      const res = await apiFetch(`/admin/photographers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Photographer ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
        fetchDetail();
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const deletePhotographer = async () => {
    if (!confirm('Delete this photographer and all their albums? This cannot be undone.')) return;

    setActionLoading(true);
    try {
      const res = await apiFetch(`/admin/photographers/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Photographer and all related data deleted');
        router.push('/admin/photographers');
      } else {
        toast.error('Failed to delete photographer');
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

  if (!data?.photographer) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-400">Photographer not found.</div>
      </AdminLayout>
    );
  }

  const { photographer, albums, stats } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push('/admin/photographers')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Photographers
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-rose-500" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900">{photographer.name}</h1>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  photographer.status === 'active' ? 'bg-green-100 text-green-700' :
                  photographer.status === 'disabled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {photographer.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {photographer.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {photographer.email}</span>
                {photographer.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {photographer.phone}</span>}
                <span className="flex items-center gap-1"><Camera className="w-4 h-4" /> {stats.totalAlbums} albums</span>
              </div>

              {photographer.bio && <p className="text-sm text-gray-600 italic">{photographer.bio}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowEditModal(true)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50">
                Edit
              </button>
              <button onClick={() => setShowResetModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50">
                <Key className="w-4 h-4" /> Reset Password
              </button>
              <button onClick={toggleStatus} disabled={actionLoading} className={`px-4 py-2 rounded-xl text-sm font-bold ${photographer.status === 'active' ? 'bg-amber-50 text-amber-700' : 'bg-green-600 text-white'}`}>
                {photographer.status === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button onClick={deletePhotographer} disabled={actionLoading} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Albums Section (kept same as before) */}
        {/* ... your existing stats and albums code ... */}

      </div>

      {/* Modals */}
      {showResetModal && <ResetPasswordModal photographerId={id} onClose={() => setShowResetModal(false)} />}
      {showEditModal && (
        <EditPhotographerModal
          photographer={photographer}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => {
            setShowEditModal(false);
            fetchDetail();        // Refresh current detail after edit
          }}
        />
      )}
    </AdminLayout>
  );
}

/* ==================== Reset Password Modal ==================== */
function ResetPasswordModal({ photographerId, onClose }: { photographerId: string; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/admin/photographers/${photographerId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        toast.success('Password reset successfully');
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        <h2 className="text-xl font-black mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4"
            minLength={6}
            required
          />
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-rose-600 text-white rounded-xl disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==================== Edit Modal ==================== */
function EditPhotographerModal({ photographer, onClose, onUpdated }: any) {
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
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch(`/admin/photographers/${photographer._id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Photographer updated successfully');
        onUpdated();
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-xl font-black mb-6">Edit Photographer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl" required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border rounded-xl" required />
          </div>
          <div>
            <label>Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border rounded-xl" />
          </div>
          <div>
            <label>Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-3 border rounded-xl" />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-rose-600 text-white rounded-xl disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}