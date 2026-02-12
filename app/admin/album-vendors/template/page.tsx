'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Template {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description?: string;
  status: boolean;
  isDraft?: boolean;
  pagesCount: number;
  albumSize: string;
  coverType: string;
  dpi?: number;
  bleed?: number;
  coverImage?: string;
  galleryImages?: string[];
  font?: string;
  primaryColor?: string;
  secondaryColor?: string;
  selectedPresets?: string[];
  usageCount?: number;
  createdAt?: string;
}

interface LayoutPreset {
  _id?: string;
  id?: string;
  name: string;
  label: string;
  type: string;
  slots: number;
  thumbnail: string;
  pageCount: number;
}

export default function CreateTemplatePage() {
  const router = useRouter();
  
  // Existing templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [saving, setSaving] = useState(false);

  // Layout presets from API
  const [presets, setPresets] = useState<LayoutPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  
  // Filter state
  const [pagesFilter, setPagesFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Form state
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('wedding');
  const [status, setStatus] = useState(true);
  const [description, setDescription] = useState('');
  
  // Album specs
  const [pagesCount, setPagesCount] = useState(20);
  const [albumSize, setAlbumSize] = useState('12x12');
  const [coverType, setCoverType] = useState('hard');
  const [dpi, setDpi] = useState(300);
  const [bleed, setBleed] = useState(3);
  
  // Preview media
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  // Theme
  const [font, setFont] = useState('Inter');
  const [primaryColor, setPrimaryColor] = useState('#E11D48');
  const [secondaryColor, setSecondaryColor] = useState('#FB7185');

  // Selected presets for this template
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  
  // Active section for mobile
  const [activeSection, setActiveSection] = useState<'form' | 'presets' | 'preview'>('form');

  // Fetch templates from API
  const fetchTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (pagesFilter !== 'all') params.append('pages', String(pagesFilter));
      
      const res = await fetch(`${API_BASE}/admin/album/templates?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTemplates(data.templates.map((t: Template) => ({
          ...t,
          id: t._id || t.id
        })));
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }, [categoryFilter, pagesFilter]);

  // Fetch presets from API
  const fetchPresets = useCallback(async () => {
    try {
      setLoadingPresets(true);
      const res = await fetch(`${API_BASE}/admin/album/presets`);
      const data = await res.json();
      
      if (data.success) {
        setPresets(data.presets.map((p: LayoutPreset) => ({
          ...p,
          id: p._id || p.id
        })));
      }
    } catch (error) {
      console.error('Failed to fetch presets:', error);
    } finally {
      setLoadingPresets(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchPresets();
  }, [fetchTemplates, fetchPresets]);

  // Unique page counts from templates
  const uniquePagesCounts = [...new Set(templates.map(t => t.pagesCount))].sort((a, b) => a - b);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesPages = pagesFilter === 'all' || template.pagesCount === pagesFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesPages && matchesCategory;
  });

  // Toggle preset selection
  const togglePreset = (presetId: string) => {
    if (selectedPresets.includes(presetId)) {
      setSelectedPresets(selectedPresets.filter(id => id !== presetId));
    } else if (selectedPresets.length < pagesCount) {
      setSelectedPresets([...selectedPresets, presetId]);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Save template
  const handleSave = async (isDraft = false) => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      setSaving(true);
      
      const templateData = {
        name: templateName,
        category,
        description,
        status: isDraft ? false : status,
        isDraft,
        pagesCount,
        albumSize,
        coverType,
        dpi,
        bleed,
        coverImage: coverPreview,
        font,
        primaryColor,
        secondaryColor,
        selectedPresets
      };

      const res = await fetch(`${API_BASE}/admin/album/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      const data = await res.json();

      if (data.success) {
        alert(isDraft ? 'Template saved as draft!' : 'Template created successfully!');
        if (!isDraft) {
          router.push('/admin/album-vendors/all');
        } else {
          fetchTemplates();
        }
      } else {
        alert(data.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  // Delete template
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/album/templates/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Duplicate template
  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/album/templates/${id}/duplicate`, {
        method: 'POST'
      });
      
      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>Album Templates</span>
                <span>→</span>
                <span className="text-rose-600 font-medium">Create New</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create Album Template</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all disabled:opacity-50"
              >
                💾 Save Draft
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {saving ? '⏳ Saving...' : '🚀 Publish Template'}
              </button>
              <button
                onClick={() => router.push('/admin/album-vendors/editor')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all"
              >
                🎨 Layout Editor
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Section Tabs */}
        <div className="lg:hidden flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          {['form', 'presets', 'preview'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section as 'form' | 'presets' | 'preview')}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeSection === section 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {section === 'form' ? '📝 Details' : section === 'presets' ? '🎨 Presets' : '👁️ Preview'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Form Section */}
          <div className={`lg:col-span-5 space-y-6 ${activeSection !== 'form' ? 'hidden lg:block' : ''}`}>
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm">1</span>
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Name *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Royal Wedding Gold"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="wedding">Wedding</option>
                      <option value="engagement">Engagement</option>
                      <option value="pre-shoot">Pre-shoot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStatus(true)}
                        className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          status ? 'bg-green-100 text-green-700 border-2 border-green-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setStatus(false)}
                        className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          !status ? 'bg-red-100 text-red-700 border-2 border-red-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Album Specs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm">2</span>
                Album Specifications
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pages Count *</label>
                  <div className="flex flex-wrap gap-2">
                    {[20, 30, 40, 50].map((count) => (
                      <button
                        key={count}
                        onClick={() => { setPagesCount(count); setSelectedPresets([]); }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          pagesCount === count 
                            ? 'bg-rose-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                    <input
                      type="number"
                      value={pagesCount}
                      onChange={(e) => { setPagesCount(Number(e.target.value)); setSelectedPresets([]); }}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-rose-500"
                      min={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Album Size</label>
                    <select
                      value={albumSize}
                      onChange={(e) => setAlbumSize(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="12x12">12 x 12 inches</option>
                      <option value="10x12">10 x 12 inches</option>
                      <option value="A4">A4</option>
                      <option value="8x10">8 x 10 inches</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Type</label>
                    <select
                      value={coverType}
                      onChange={(e) => setCoverType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="hard">Hard Cover</option>
                      <option value="soft">Soft Cover</option>
                      <option value="leather">Leather Cover</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">DPI</label>
                    <input
                      type="number"
                      value={dpi}
                      onChange={(e) => setDpi(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bleed (mm)</label>
                    <input
                      type="number"
                      value={bleed}
                      onChange={(e) => setBleed(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Theme */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm">3</span>
                Theme Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Font Family</label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Preview Image</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-all">
                    {coverPreview ? (
                      <div className="relative">
                        <img src={coverPreview} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                        <button
                          onClick={() => { setCoverImage(null); setCoverPreview(''); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                        <span className="text-3xl">📷</span>
                        <span className="text-sm text-gray-500">Click to upload</span>
                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Presets Selection */}
          <div className={`lg:col-span-4 ${activeSection !== 'presets' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-amber-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-800">🎨 Layout Presets</h2>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {selectedPresets.length}/{pagesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Select presets for each page</p>
                  <button
                    onClick={() => setSelectedPresets([])}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto">
                {loadingPresets ? (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-3xl block mb-2 animate-spin">⏳</span>
                    <p>Loading presets...</p>
                  </div>
                ) : presets.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-3xl block mb-2">📭</span>
                    <p>No presets found</p>
                    <button
                      onClick={() => router.push('/admin/album-vendors/editor')}
                      className="mt-3 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-sm font-medium"
                    >
                      Create First Preset
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {presets.map((preset) => {
                      const isSelected = selectedPresets.includes(preset.id || preset._id || '');
                      const isDisabled = !isSelected && selectedPresets.length >= pagesCount;
                      
                      return (
                        <div
                          key={preset.id || preset._id}
                          onClick={() => !isDisabled && togglePreset(preset.id || preset._id || '')}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50 shadow-md'
                              : isDisabled
                                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'border-gray-100 hover:border-rose-200 hover:bg-rose-50/30'
                          }`}
                        >
                          <div className="w-full h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xl mb-2">
                            {preset.thumbnail}
                          </div>
                          <p className="font-semibold text-gray-800 text-sm truncate">{preset.label}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">{preset.slots} slots</span>
                            <span className={`text-xs font-medium ${isSelected ? 'text-rose-600' : 'text-gray-400'}`}>
                              {isSelected ? '✓ Selected' : preset.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedPresets.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-green-50">
                  <p className="text-sm font-medium text-green-700 text-center">
                    ✓ {selectedPresets.length} preset(s) selected for {pagesCount} pages
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Existing Templates & Preview */}
          <div className={`lg:col-span-3 space-y-6 ${activeSection !== 'preview' ? 'hidden lg:block' : ''}`}>
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Template Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl">
                  <span className="text-sm text-gray-600">Pages</span>
                  <span className="font-bold text-rose-700">{pagesCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                  <span className="text-sm text-gray-600">Presets Used</span>
                  <span className="font-bold text-amber-700">{selectedPresets.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-gray-600">Album Size</span>
                  <span className="font-bold text-blue-700">{albumSize}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Colors:</span>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: primaryColor }}></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: secondaryColor }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Templates */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-800">📂 Existing Templates</h2>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                    {filteredTemplates.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="wedding">Wedding</option>
                    <option value="engagement">Engagement</option>
                    <option value="pre-shoot">Pre-shoot</option>
                  </select>
                  <select
                    value={pagesFilter === 'all' ? 'all' : String(pagesFilter)}
                    onChange={(e) => setPagesFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Pages</option>
                    {uniquePagesCounts.map(count => (
                      <option key={count} value={count}>{count} Pages</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 max-h-80 overflow-y-auto space-y-3">
                {loadingTemplates ? (
                  <div className="text-center py-8 text-gray-400">
                    <span className="text-2xl block mb-2 animate-spin">⏳</span>
                    <p className="text-sm">Loading...</p>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <span className="text-2xl block mb-2">📭</span>
                    <p className="text-sm">No templates found</p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <div
                      key={template.id || template._id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-rose-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm truncate flex-1">{template.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ml-2 ${
                          template.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {template.status ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize">
                          {template.category} • {template.pagesCount}p
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDuplicate(template.id || template._id || '')}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => handleDelete(template.id || template._id || '')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
