'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Category {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
}

export default function SystemCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', type: 'service' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add category logic here
    setShowModal(false);
    setFormData({ name: '', description: '', type: 'service' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Categories</h1>
            <p className="text-gray-500 mt-1">Manage service and product categories</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Add Category
          </button>
        </div>

        {/* Category Type Tabs */}
        <div className="flex gap-4">
          {['All', 'Service', 'Album', 'Proposal', 'Product'].map((type) => (
            <button
              key={type}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-white border border-gray-200 hover:border-rose-500 hover:text-rose-600"
            >
              {type}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <span className="text-4xl mb-4 block">📁</span>
              <p>No categories found</p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📂</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {category.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">✏️</button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 text-sm">{category.description}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Category</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="service">Service</option>
                    <option value="album">Album</option>
                    <option value="proposal">Proposal</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    rows={3}
                    placeholder="Enter description"
                  ></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    Add Category
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
