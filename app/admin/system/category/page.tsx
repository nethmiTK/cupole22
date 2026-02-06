'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}


export default function ServiceCategoryPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  interface ServiceCategoryForm {
    name: string;
    description: string;
    imageUrl?: string;
    icon?: string;
    status: 'active' | 'inactive';
  }

  const [formData, setFormData] = useState<ServiceCategoryForm>({
    name: '',
    description: '',
    imageUrl: '',
    icon: '',
    status: 'active'
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/service-categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setError('');
      } else {
        setError('Failed to fetch service categories');
      }
    } catch (err) {
      console.error('Error fetching service categories:', err);
      setError('Failed to fetch service categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_URL}/api/admin/service-categories/${editingId}`
        : `${API_URL}/api/admin/service-categories`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(editingId ? 'Service category updated successfully' : 'Service category created successfully');
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', description: '', imageUrl: '', icon: '', status: 'active' });
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save service category');
      }
    } catch (err) {
      console.error('Error saving service category:', err);
      setError('Failed to save service category');
    }
  };

  const handleEdit = (category: ServiceCategory) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || '',
      icon: '',
      status: category.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service category?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/service-categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccess('Service category deleted successfully');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete service category');
      }
    } catch (err) {
      console.error('Error deleting service category:', err);
      setError('Failed to delete service category');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', icon: '', imageUrl: '', status: 'active' });
    setShowModal(true);
  };

  // Image upload handler
  async function handleImageUpload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${API_URL}/api/upload/service-category-image`, {
        method: 'POST',
        body: form
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(f => ({ ...f, imageUrl: data.imageUrl || '' }));
        setError('');
      } else {
        setError('Image upload failed');
      }
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
            <p className="text-gray-500 mt-1">Manage service categories only</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Add Category
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Service Categories Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading service categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="text-4xl mb-4 block">📁</span>
              <p>No service categories found. Create your first service category to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl.startsWith('http') ? category.imageUrl : `${API_URL}${category.imageUrl}`}
                            alt=""
                            className="w-12 h-12 object-cover rounded-full border"
                          />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{category.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(category)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Service Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Service Category' : 'Add New Service Category'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="e.g., Wedding Photography"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter service category description"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Image (profile pic)</label>
                  <div
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onDrop={async (e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        await handleImageUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onDragOver={e => e.preventDefault()}
                  >
                    {formData.imageUrl ? (
                      <>
                        <img
                          src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `${API_URL}${formData.imageUrl}`}
                          alt="preview"
                          className="w-24 h-24 object-cover rounded-full border mb-2"
                        />
                        <div className="text-xs text-gray-400 break-all mt-1">{formData.imageUrl}</div>
                      </>
                    ) : (
                      <span className="text-gray-400 mb-2">Drag & drop or choose an image</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="service-category-image-upload"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          await handleImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="service-category-image-upload" className="px-4 py-2 bg-rose-600 text-white rounded cursor-pointer mt-2 text-sm hover:bg-rose-700">
                      {uploading ? 'Uploading...' : 'Choose Image'}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {editingId ? 'Update' : 'Create'} Service Category
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
