'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────
interface Vendor {
  _id: string;
  vendor_id: string;
  name: string;
  profilePic?: string | null;
  whatsappNo?: string;
  slipPhoto?: string | null;
  status: string;
  createdAt?: string;
}

interface Template {
  _id: string;
  name: string;
  category: string;
  description?: string;
  status: boolean;
  isDraft?: boolean;
  pagesCount: number;
  albumSize: string;
  coverType: string;
  coverImage?: string;
  usageCount?: number;
  selectedPresets?: string[];
  createdAt?: string;
}

interface LayoutPreset {
  _id: string;
  id?: string;
  name: string;
  label: string;
  type: string;
  slots: number;
  thumbnail: string;
  pageCount: number;
  status?: string;
}

interface Album {
  _id: string;
  title: string;
  description?: string;
  vendor_id: string;
  template_id: string;
  images?: string[];
  selectedPresets?: string[];
  vendor?: Vendor;
  template?: Template;
  created_at: string;
  updated_at: string;
}

// ─── Component ────────────────────────────────────────────────
export default function AlbumCreatePage() {
  // Vendors
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Layout Presets
  const [presets, setPresets] = useState<LayoutPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);

  // Albums table
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [albumSearch, setAlbumSearch] = useState('');

  // Create form
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Images
  const [albumImages, setAlbumImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Mobile tab
  const [activeTab, setActiveTab] = useState<'form' | 'presets' | 'table'>('form');

  // ─── View Modal ─────────────────────────────────────────────
  const [viewAlbum, setViewAlbum] = useState<Album | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // ─── Edit Modal ─────────────────────────────────────────────
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<File[]>([]);
  const [editNewPreviews, setEditNewPreviews] = useState<string[]>([]);
  const [editPresets, setEditPresets] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // ─── Delete ─────────────────────────────────────────────────
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch album vendors ─────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    try {
      setLoadingVendors(true);
      const res = await fetch(`${API_BASE}/album-vendors`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  // ── Fetch templates ─────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      const res = await fetch(`${API_BASE}/admin/album/templates?${params}`);
      const data = await res.json();
      if (data.success) {
        const active = (data.templates || []).filter(
          (t: Template) => t.status && !t.isDraft
        );
        setTemplates(active);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  }, [categoryFilter]);

  // ── Fetch presets ───────────────────────────────────────────
  const fetchPresets = useCallback(async () => {
    try {
      setLoadingPresets(true);
      const res = await fetch(`${API_BASE}/admin/album/presets`);
      const data = await res.json();
      if (data.success) {
        setPresets(
          (data.presets || []).map((p: LayoutPreset) => ({
            ...p,
            id: p._id || p.id,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch presets:', err);
    } finally {
      setLoadingPresets(false);
    }
  }, []);

  // ── Fetch albums ────────────────────────────────────────────
  const fetchAlbums = useCallback(async () => {
    try {
      setLoadingAlbums(true);
      const params = new URLSearchParams();
      if (selectedVendorId) params.append('vendor_id', selectedVendorId);
      const res = await fetch(`${API_BASE}/albums?${params}`);
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (err) {
      console.error('Failed to fetch albums:', err);
    } finally {
      setLoadingAlbums(false);
    }
  }, [selectedVendorId]);

  useEffect(() => {
    fetchVendors();
    fetchTemplates();
    fetchPresets();
  }, [fetchVendors, fetchTemplates, fetchPresets]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Auto-load template presets
  useEffect(() => {
    if (selectedTemplateId) {
      const tmpl = templates.find((t) => t._id === selectedTemplateId);
      if (tmpl?.selectedPresets?.length) {
        setSelectedPresets(tmpl.selectedPresets);
      }
    }
  }, [selectedTemplateId, templates]);

  // ── Image handling ──────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAlbumImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setAlbumImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Toggle preset ───────────────────────────────────────────
  const togglePreset = (presetId: string) => {
    const maxPresets = selectedTemplate?.pagesCount || 50;
    if (selectedPresets.includes(presetId)) {
      setSelectedPresets(selectedPresets.filter((id) => id !== presetId));
    } else if (selectedPresets.length < maxPresets) {
      setSelectedPresets([...selectedPresets, presetId]);
    }
  };

  // ── Create album ────────────────────────────────────────────
  const handleCreate = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (!selectedVendorId) return setErrorMsg('Please select a vendor');
    if (!selectedTemplateId) return setErrorMsg('Please select a template');
    if (!albumTitle.trim()) return setErrorMsg('Please enter album title');

    try {
      setCreating(true);

      let uploadedImageUrls: string[] = [];
      if (albumImages.length > 0) {
        const formData = new FormData();
        albumImages.forEach((file) => formData.append('images', file));
        try {
          const uploadRes = await fetch(`${API_BASE}/upload/multiple`, {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedImageUrls =
              uploadData.urls ||
              uploadData.files?.map((f: { url: string }) => f.url) ||
              [];
          }
        } catch {
          console.warn('Image upload failed, continuing without images');
        }
      }

      const res = await fetch(`${API_BASE}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: selectedVendorId,
          template_id: selectedTemplateId,
          title: albumTitle.trim(),
          description: albumDescription.trim(),
          images: uploadedImageUrls,
          selectedPresets,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Album created successfully!');
        setAlbumTitle('');
        setAlbumDescription('');
        setSelectedTemplateId('');
        setSelectedPresets([]);
        setAlbumImages([]);
        setImagePreviews([]);
        fetchAlbums();
      } else {
        setErrorMsg(data.error || 'Failed to create album');
      }
    } catch (err) {
      console.error('Error creating album:', err);
      setErrorMsg('Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  // ── View album ──────────────────────────────────────────────
  const openViewModal = async (albumId: string) => {
    try {
      setViewLoading(true);
      const res = await fetch(`${API_BASE}/albums/${albumId}`);
      const data = await res.json();
      if (res.ok) {
        setViewAlbum(data.album);
      }
    } catch (err) {
      console.error('Failed to fetch album:', err);
    } finally {
      setViewLoading(false);
    }
  };

  // ── Edit album ──────────────────────────────────────────────
  const openEditModal = async (albumId: string) => {
    try {
      const res = await fetch(`${API_BASE}/albums/${albumId}`);
      const data = await res.json();
      if (res.ok) {
        const a = data.album;
        setEditAlbum(a);
        setEditTitle(a.title || '');
        setEditDescription(a.description || '');
        setEditImages(a.images || []);
        setEditPresets(a.selectedPresets || []);
        setEditNewImages([]);
        setEditNewPreviews([]);
      }
    } catch (err) {
      console.error('Failed to fetch album for edit:', err);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setEditNewImages((prev) => [...prev, ...files]);
    const newP = files.map((f) => URL.createObjectURL(f));
    setEditNewPreviews((prev) => [...prev, ...newP]);
  };

  const removeEditExistingImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditNewImage = (index: number) => {
    setEditNewImages((prev) => prev.filter((_, i) => i !== index));
    setEditNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleEditPreset = (presetId: string) => {
    if (editPresets.includes(presetId)) {
      setEditPresets(editPresets.filter((id) => id !== presetId));
    } else {
      setEditPresets([...editPresets, presetId]);
    }
  };

  const handleEditSave = async () => {
    if (!editAlbum) return;
    try {
      setEditSaving(true);

      // Upload new images if any
      let newUrls: string[] = [];
      if (editNewImages.length > 0) {
        const formData = new FormData();
        editNewImages.forEach((file) => formData.append('images', file));
        try {
          const uploadRes = await fetch(`${API_BASE}/upload/multiple`, {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            newUrls =
              uploadData.urls ||
              uploadData.files?.map((f: { url: string }) => f.url) ||
              [];
          }
        } catch {
          console.warn('Image upload failed');
        }
      }

      const allImages = [...editImages, ...newUrls];

      const res = await fetch(`${API_BASE}/albums/${editAlbum._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          images: allImages,
          selectedPresets: editPresets,
        }),
      });

      if (res.ok) {
        setEditAlbum(null);
        fetchAlbums();
        setSuccessMsg('Album updated successfully!');
      } else {
        setErrorMsg('Failed to update album');
      }
    } catch (err) {
      console.error('Error updating album:', err);
      setErrorMsg('Something went wrong');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete album ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE}/albums/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchAlbums();
        setSuccessMsg('Album deleted successfully!');
      } else {
        setErrorMsg('Failed to delete album');
      }
    } catch (err) {
      console.error('Error deleting album:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ── Filters ─────────────────────────────────────────────────
  const filteredVendors = vendors.filter((v) => {
    const q = vendorSearch.toLowerCase();
    const matchesSearch =
      (v.name || '').toLowerCase().includes(q) ||
      (v.whatsappNo || '').toLowerCase().includes(q);
    const matchesStatus =
      vendorStatusFilter === 'all' || v.status === vendorStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates = templates.filter((t) => {
    const q = templateSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  const filteredAlbums = albums.filter((a) => {
    const q = albumSearch.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.vendor?.name || '').toLowerCase().includes(q)
    );
  });

  const selectedVendor = vendors.find((v) => v._id === selectedVendorId);
  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPresetLabel = (presetId: string) => {
    const p = presets.find((pr) => (pr.id || pr._id) === presetId);
    return p?.label || presetId;
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* ── Header ───────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>Album Vendors</span>
            <span>→</span>
            <span className="text-rose-600 font-medium">Create Album</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Album for Vendor</h1>
          <p className="text-gray-500 mt-1">
            Select vendor, pick template, add images & presets, then create
          </p>
        </div>

        {/* ── Messages ─────────────────── */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
            <span className="text-green-600 text-lg">✅</span>
            <span className="text-green-700 font-medium">{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-500 hover:text-green-700">✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
            <span className="text-red-600 text-lg">⚠️</span>
            <span className="text-red-700 font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* ── Mobile Tabs ──────────────── */}
        <div className="lg:hidden flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          {(['form', 'presets', 'table'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab === 'form' ? '📝 Form' : tab === 'presets' ? '🎨 Presets' : '📋 Albums'}
            </button>
          ))}
        </div>

        {/* ════════════════════ GRID ═══════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ════════ LEFT COL (5) — Form ══════════════════════ */}
          <div className={`lg:col-span-5 space-y-6 ${activeTab !== 'form' ? 'hidden lg:block' : ''}`}>

            {/* ── Step 1: Select Vendor ───── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm font-bold">1</span>
                Select Album Vendor
                <span className="ml-auto px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-semibold">{filteredVendors.length}</span>
              </h2>

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    placeholder="Search vendor name, WhatsApp…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={vendorStatusFilter}
                  onChange={(e) => setVendorStatusFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {loadingVendors ? (
                  <div className="text-center py-6 text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2" />
                    Loading vendors…
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <span className="text-3xl block mb-2">📭</span>No album vendors found
                  </div>
                ) : (
                  filteredVendors.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVendorId(v._id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedVendorId === v._id
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {v.profilePic ? (
                          <img src={v.profilePic} alt={v.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            selectedVendorId === v._id ? 'bg-rose-200' : 'bg-purple-100'
                          }`}>📸</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 truncate">{v.name || 'Unnamed'}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(v.status)}`}>
                              {v.status || 'unknown'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{v.whatsappNo || '—'}</p>
                        </div>
                        {selectedVendorId === v._id && <span className="text-rose-600 font-bold text-lg">✓</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── Step 2: Select Template ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm font-bold">2</span>
                Select Template
              </h2>

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white text-sm"
                >
                  <option value="all">All</option>
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement</option>
                  <option value="pre-shoot">Pre-shoot</option>
                </select>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {loadingTemplates ? (
                  <div className="text-center py-6 text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2" />
                    Loading templates…
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <span className="text-3xl block mb-2">📄</span>No active templates found
                  </div>
                ) : (
                  filteredTemplates.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => setSelectedTemplateId(t._id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedTemplateId === t._id
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {t.coverImage ? (
                          <img src={t.coverImage} alt={t.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-xl">🎨</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{t.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">{t.category}</span>
                            <span>{t.pagesCount} pages</span>
                            <span>{t.albumSize}</span>
                          </div>
                        </div>
                        {selectedTemplateId === t._id && <span className="text-rose-600 font-bold text-lg">✓</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── Step 3: Album Details + Images ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm font-bold">3</span>
                Album Details & Images
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Album Title *</label>
                  <input
                    type="text"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="e.g., Our Fairy Tale Wedding"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    placeholder="Short description…"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">📷 Album Images</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-all">
                    {imagePreviews.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {imagePreviews.map((preview, i) => (
                            <div key={i} className="relative group">
                              <img src={preview} alt={`Image ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                              <button
                                onClick={() => removeImage(i)}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >✕</button>
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded">{i + 1}</span>
                            </div>
                          ))}
                          <label className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-rose-300">
                            <span className="text-xl text-gray-400">+</span>
                            <span className="text-[10px] text-gray-400">Add more</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 text-center">{imagePreviews.length} image(s) selected</p>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                        <span className="text-3xl">📸</span>
                        <span className="text-sm text-gray-500">Click to upload album images</span>
                        <span className="text-xs text-gray-400">Multiple images supported</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vendor</span>
                    <span className="font-medium text-gray-800">{selectedVendor ? selectedVendor.name || '—' : '— not selected —'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Template</span>
                    <span className="font-medium text-gray-800">{selectedTemplate ? selectedTemplate.name : '— not selected —'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Images</span>
                    <span className="font-medium text-gray-800">{albumImages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Presets</span>
                    <span className="font-medium text-gray-800">{selectedPresets.length}{selectedTemplate ? ` / ${selectedTemplate.pagesCount}` : ''}</span>
                  </div>
                  {selectedTemplate && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span className="font-medium">{selectedTemplate.albumSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cover</span>
                        <span className="font-medium capitalize">{selectedTemplate.coverType}</span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating || !selectedVendorId || !selectedTemplateId || !albumTitle.trim()}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? '⏳ Creating…' : '🚀 Create Album'}
                </button>
              </div>
            </div>
          </div>

          {/* ════════ CENTER COL (3) — Presets ═════════════════ */}
          <div className={`lg:col-span-3 ${activeTab !== 'presets' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-800">🎨 Layout Presets</h2>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {selectedPresets.length}{selectedTemplate ? `/${selectedTemplate.pagesCount}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Select presets for each page</p>
                  {selectedPresets.length > 0 && (
                    <button onClick={() => setSelectedPresets([])} className="text-xs text-rose-600 hover:text-rose-700 font-medium">Clear All</button>
                  )}
                </div>
              </div>
              <div className="p-3 max-h-[550px] overflow-y-auto">
                {loadingPresets ? (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-3xl block mb-2 animate-spin">⏳</span>
                    <p className="text-sm">Loading presets…</p>
                  </div>
                ) : presets.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-3xl block mb-2">📭</span>
                    <p className="text-sm">No presets found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => {
                      const pid = preset.id || preset._id;
                      const isSelected = selectedPresets.includes(pid);
                      const maxReached =
                        !isSelected && selectedTemplate && selectedPresets.length >= selectedTemplate.pagesCount;
                      return (
                        <div
                          key={pid}
                          onClick={() => !maxReached && togglePreset(pid)}
                          className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50 shadow-md'
                              : maxReached
                                ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                                : 'border-gray-100 hover:border-rose-200 hover:bg-rose-50/30'
                          }`}
                        >
                          <div className="w-full h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg mb-1.5">
                            {preset.thumbnail || '🆕'}
                          </div>
                          <p className="font-semibold text-gray-800 text-xs truncate">{preset.label}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-500">{preset.slots} slot{preset.slots > 1 ? 's' : ''}</span>
                            <span className={`text-[10px] font-medium ${isSelected ? 'text-rose-600' : 'text-gray-400'}`}>
                              {isSelected ? '✓' : preset.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {selectedPresets.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-green-50">
                  <p className="text-xs font-medium text-green-700 text-center">✓ {selectedPresets.length} preset(s) selected</p>
                </div>
              )}
            </div>
          </div>

          {/* ════════ RIGHT COL (4) — Albums Table ════════════ */}
          <div className={`lg:col-span-4 space-y-6 ${activeTab !== 'table' ? 'hidden lg:block' : ''}`}>

            {/* Albums Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  📋 Albums
                  {selectedVendor && (
                    <span className="text-sm font-normal text-gray-500">— {selectedVendor.name || ''}</span>
                  )}
                  <span className="ml-1 px-2 py-0.5 text-xs bg-rose-100 text-rose-600 rounded-full font-semibold">{filteredAlbums.length}</span>
                </h2>
                <div className="relative w-full sm:w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={albumSearch}
                    onChange={(e) => setAlbumSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-left">
                      <th className="px-3 py-2.5 rounded-tl-xl font-semibold text-xs">#</th>
                      <th className="px-3 py-2.5 font-semibold text-xs">Title</th>
                      <th className="px-3 py-2.5 font-semibold text-xs">Vendor</th>
                      <th className="px-3 py-2.5 font-semibold text-xs">Created</th>
                      <th className="px-3 py-2.5 rounded-tr-xl font-semibold text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingAlbums ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2" />Loading…
                        </td>
                      </tr>
                    ) : filteredAlbums.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400">
                          <span className="text-4xl block mb-2">📷</span>
                          {selectedVendorId ? 'No albums for this vendor' : 'No albums found'}
                        </td>
                      </tr>
                    ) : (
                      filteredAlbums.map((album, idx) => (
                        <tr key={album._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2.5 text-gray-500 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-800 text-xs max-w-[120px] truncate">{album.title || '—'}</td>
                          <td className="px-3 py-2.5 text-gray-600 text-xs max-w-[100px] truncate">{album.vendor?.name || '—'}</td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                            {album.created_at ? new Date(album.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openViewModal(album._id)}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                title="View"
                              >👁️</button>
                              <button
                                onClick={() => openEditModal(album._id)}
                                className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                                title="Edit"
                              >✏️</button>
                              <button
                                onClick={() => setDeleteId(album._id)}
                                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                title="Delete"
                              >🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">🎨 Template Preview</h2>
                <div className="flex gap-3">
                  {selectedTemplate.coverImage ? (
                    <img src={selectedTemplate.coverImage} alt={selectedTemplate.name} className="w-24 h-24 object-cover rounded-xl" />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-amber-100 rounded-xl flex items-center justify-center text-3xl">🎨</div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <h3 className="text-base font-bold text-gray-900">{selectedTemplate.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-medium capitalize">{selectedTemplate.category}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">{selectedTemplate.pagesCount}p</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium">{selectedTemplate.albumSize}</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium capitalize">{selectedTemplate.coverType}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Total Albums</p>
                <p className="text-xl font-bold">{albums.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Album Vendors</p>
                <p className="text-xl font-bold">{vendors.length}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Templates</p>
                <p className="text-xl font-bold">{templates.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Presets Selected</p>
                <p className="text-xl font-bold">{selectedPresets.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ VIEW MODAL ━━━━━━━━━━━━━━━━━━━━━ */}
      {(viewAlbum || viewLoading) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !viewLoading && setViewAlbum(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {viewLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" />
              </div>
            ) : viewAlbum ? (
              <>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10 rounded-t-2xl">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    👁️ Album Details
                  </h2>
                  <button onClick={() => setViewAlbum(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">✕</button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Title & Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{viewAlbum.title}</h3>
                    {viewAlbum.description && (
                      <p className="text-gray-600 mt-1">{viewAlbum.description}</p>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-50 rounded-xl p-3">
                      <p className="text-[10px] text-rose-500 font-medium uppercase">Vendor</p>
                      <div className="flex items-center gap-2 mt-1">
                        {viewAlbum.vendor?.profilePic ? (
                          <img src={viewAlbum.vendor.profilePic} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center text-sm">📸</div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{viewAlbum.vendor?.name || '—'}</p>
                          <p className="text-[10px] text-gray-500">{viewAlbum.vendor?.whatsappNo || ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-[10px] text-amber-500 font-medium uppercase">Template</p>
                      <p className="font-semibold text-sm text-gray-800 mt-1">{viewAlbum.template?.name || '—'}</p>
                      {viewAlbum.template && (
                        <div className="flex gap-1 mt-1">
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px]">{viewAlbum.template.category}</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">{viewAlbum.template.pagesCount}p</span>
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">{viewAlbum.template.albumSize}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-[10px] text-blue-500 font-medium uppercase">Created</p>
                      <p className="font-semibold text-sm text-gray-800 mt-1">
                        {viewAlbum.created_at ? new Date(viewAlbum.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-[10px] text-green-500 font-medium uppercase">Last Updated</p>
                      <p className="font-semibold text-sm text-gray-800 mt-1">
                        {viewAlbum.updated_at ? new Date(viewAlbum.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Images */}
                  {viewAlbum.images && viewAlbum.images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        📷 Images <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] rounded-full">{viewAlbum.images.length}</span>
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {viewAlbum.images.map((img, i) => (
                          <img key={i} src={img} alt={`Album image ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Presets */}
                  {viewAlbum.selectedPresets && viewAlbum.selectedPresets.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        🎨 Layout Presets <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] rounded-full">{viewAlbum.selectedPresets.length}</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {viewAlbum.selectedPresets.map((pid, i) => (
                          <span key={i} className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-medium">
                            {getPresetLabel(pid)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end gap-2 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setViewAlbum(null);
                      openEditModal(viewAlbum._id);
                    }}
                    className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 text-sm font-medium"
                  >
                    ✏️ Edit Album
                  </button>
                  <button
                    onClick={() => setViewAlbum(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ EDIT MODAL ━━━━━━━━━━━━━━━━━━━━━ */}
      {editAlbum && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditAlbum(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">✏️ Edit Album</h2>
              <button onClick={() => setEditAlbum(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">✕</button>
            </div>

            <div className="p-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Album Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              {/* Existing Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  📷 Current Images
                  <span className="ml-1 px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] rounded-full">{editImages.length}</span>
                </label>
                {editImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {editImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt={`Image ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => removeEditExistingImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No images</p>
                )}
              </div>

              {/* New Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">➕ Add New Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-all">
                  {editNewPreviews.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {editNewPreviews.map((preview, i) => (
                          <div key={i} className="relative group">
                            <img src={preview} alt={`New ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                            <button
                              onClick={() => removeEditNewImage(i)}
                              className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >✕</button>
                          </div>
                        ))}
                        <label className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-rose-300">
                          <span className="text-xl text-gray-400">+</span>
                          <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 text-center">{editNewPreviews.length} new image(s)</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 py-3">
                      <span className="text-2xl">📸</span>
                      <span className="text-sm text-gray-500">Click to upload new images</span>
                      <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Edit Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  🎨 Layout Presets
                  <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] rounded-full">{editPresets.length}</span>
                </label>
                {presets.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {presets.map((preset) => {
                      const pid = preset.id || preset._id;
                      const isSelected = editPresets.includes(pid);
                      return (
                        <div
                          key={pid}
                          onClick={() => toggleEditPreset(pid)}
                          className={`p-2 rounded-lg border-2 cursor-pointer transition-all text-center ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-gray-100 hover:border-rose-200'
                          }`}
                        >
                          <div className="text-lg mb-0.5">{preset.thumbnail || '🆕'}</div>
                          <p className="text-[10px] font-medium text-gray-700 truncate">{preset.label}</p>
                          {isSelected && <span className="text-[10px] text-rose-600 font-bold">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No presets available</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end gap-2 rounded-b-2xl">
              <button onClick={() => setEditAlbum(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editTitle.trim()}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {editSaving ? '⏳ Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ DELETE CONFIRM ━━━━━━━━━━━━━━━━━━ */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <span className="text-5xl block mb-3">🗑️</span>
              <h3 className="text-lg font-bold text-gray-900">Delete Album?</h3>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm disabled:opacity-50"
              >
                {deleting ? '⏳ Deleting…' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
