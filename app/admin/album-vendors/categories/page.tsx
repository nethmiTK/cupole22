'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

// Sample categories data
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
  templatesCount: number;
  albumsCreated: number;
  vendorsUsed: number;
  lastUsed: string;
  createdAt: string;
}

const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Wedding',
    description: 'Traditional and modern wedding album templates',
    icon: '💒',
    status: 'active',
    templatesCount: 15,
    albumsCreated: 234,
    vendorsUsed: 28,
    lastUsed: '2026-02-07',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Engagement',
    description: 'Pre-wedding and engagement ceremony albums',
    icon: '💍',
    status: 'active',
    templatesCount: 8,
    albumsCreated: 156,
    vendorsUsed: 22,
    lastUsed: '2026-02-06',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Pre-shoot',
    description: 'Outdoor and studio pre-shoot templates',
    icon: '📸',
    status: 'active',
    templatesCount: 12,
    albumsCreated: 189,
    vendorsUsed: 31,
    lastUsed: '2026-02-05',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Reception',
    description: 'Wedding reception and homecoming albums',
    icon: '🎉',
    status: 'inactive',
    templatesCount: 5,
    albumsCreated: 67,
    vendorsUsed: 12,
    lastUsed: '2026-01-15',
    createdAt: '2024-04-05',
  },
  {
    id: '5',
    name: 'Poruwa Ceremony',
    description: 'Traditional Poruwa ceremony templates',
    icon: '🪷',
    status: 'active',
    templatesCount: 6,
    albumsCreated: 98,
    vendorsUsed: 18,
    lastUsed: '2026-02-04',
    createdAt: '2024-05-12',
  },
  {
    id: '6',
    name: 'Going Away',
    description: 'Bride going away ceremony albums',
    icon: '👰',
    status: 'active',
    templatesCount: 4,
    albumsCreated: 45,
    vendorsUsed: 9,
    lastUsed: '2026-02-01',
    createdAt: '2024-06-20',
  },
];

export default function AlbumCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'mostUsed' | 'leastUsed' | 'newest' | 'name'>('mostUsed');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📁');
  const [newCategoryStatus, setNewCategoryStatus] = useState<'active' | 'inactive'>('active');

  // Stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const totalTemplates = categories.reduce((sum, c) => sum + c.templatesCount, 0);
  const totalAlbums = categories.reduce((sum, c) => sum + c.albumsCreated, 0);

  // Filter and sort
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'mostUsed':
          return b.albumsCreated - a.albumsCreated;
        case 'leastUsed':
          return a.albumsCreated - b.albumsCreated;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert('Please enter category name');
      return;
    }
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: newCategoryName,
      description: newCategoryDescription,
      icon: newCategoryIcon,
      status: newCategoryStatus,
      templatesCount: 0,
      albumsCreated: 0,
      vendorsUsed: 0,
      lastUsed: '-',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('📁');
    setNewCategoryStatus('active');
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id 
        ? { ...cat, status: cat.status === 'active' ? 'inactive' : 'active' }
        : cat
    ));
  };

  const deleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const iconOptions = ['📁', '💒', '💍', '📸', '🎉', '🪷', '👰', '💐', '🎊', '❤️', '💝', '🌸'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Categories</h1>
            <p className="text-gray-500 mt-1">Manage wedding template categories and track usage</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all border border-gray-200 flex items-center gap-2">
              📥 Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              ➕ Add Category
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                📂
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Categories</p>
                <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Templates</p>
                <p className="text-2xl font-bold text-amber-600">{totalTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Albums</p>
                <p className="text-2xl font-bold text-rose-600">{totalAlbums}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-400 min-w-40"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-400 min-w-40"
            >
              <option value="mostUsed">Most Used</option>
              <option value="leastUsed">Least Used</option>
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Templates</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Albums Created</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Vendors Used</th>
                  <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Last Used</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    {/* Category */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{category.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{category.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        category.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.status === 'active' ? '✓ Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Templates */}
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                        {category.templatesCount}
                      </span>
                    </td>

                    {/* Albums Created */}
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">
                        {category.albumsCreated}
                      </span>
                    </td>

                    {/* Vendors Used */}
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        {category.vendorsUsed}
                      </span>
                    </td>

                    {/* Last Used */}
                    <td className="px-4 py-4 text-center text-sm text-gray-600">
                      {category.lastUsed === '-' ? '-' : new Date(category.lastUsed).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/album-vendors/categories/${category.id}`)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                          title="View"
                        >
                          👁️
                        </button>
                        <button
                          className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => toggleCategoryStatus(category.id)}
                          className={`p-2 rounded-lg transition-all ${
                            category.status === 'active'
                              ? 'hover:bg-gray-100 text-gray-600'
                              : 'hover:bg-green-100 text-green-600'
                          }`}
                          title={category.status === 'active' ? 'Disable' : 'Enable'}
                        >
                          {category.status === 'active' ? '🧊' : '✅'}
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <span className="text-4xl block mb-2">🔍</span>
                      <p className="text-gray-500">No categories found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                ➕ Add New Category
              </h3>
              
              <div className="space-y-4">
                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewCategoryIcon(icon)}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          newCategoryIcon === icon
                            ? 'bg-rose-100 border-2 border-rose-500'
                            : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="ex: Wedding, Engagement..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 resize-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCategoryStatus('active')}
                      className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                        newCategoryStatus === 'active'
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                      }`}
                    >
                      ✓ Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCategoryStatus('inactive')}
                      className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                        newCategoryStatus === 'inactive'
                          ? 'bg-gray-200 text-gray-700 border-2 border-gray-400'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                    setNewCategoryIcon('📁');
                    setNewCategoryStatus('active');
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  ✓ Save Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
