'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Mock data for testing
      const mockCategories = [
        {
          _id: '1',
          name: 'Wedding',
          description: 'Wedding album templates',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2', 
          name: 'Birthday',
          description: 'Birthday celebration templates',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category._id);
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', status: 'active' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      setSubmitLoading(true);
      
      // Mock successful save
      const newCategory = {
        _id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        status: formData.status as 'active' | 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (editingId) {
        setCategories(prev => prev.map(cat => 
          cat._id === editingId ? { ...newCategory, _id: editingId } : cat
        ));
        alert('Category updated!');
      } else {
        setCategories(prev => [...prev, newCategory]);
        alert('Category created!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setCategories(prev => prev.filter(cat => cat._id !== id));
      alert('Category deleted!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Template Categories</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No categories found. Create one to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-800 font-medium">{category.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{category.description}</td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Wedding, Birthday, Engagement"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the category"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-medium"
                >
                  {submitLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
