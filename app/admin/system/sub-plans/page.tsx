'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface SubPlan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  vendorType: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export default function SubPlansPage() {
  const [plans, setPlans] = useState<SubPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '30',
    features: '',
    vendorType: 'service',
    description: '',
    status: 'active'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/sub_plan`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        setError('');
      } else {
        setError('Failed to fetch plans');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.duration) {
      setError('Name, price, and duration are required');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_URL}/api/sub_plan/${editingId}`
        : `${API_URL}/api/sub_plan`;

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        duration: Number(formData.duration),
        features: formData.features.split('\n').filter(f => f.trim()),
        vendorType: formData.vendorType,
        description: formData.description,
        status: formData.status
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(editingId ? 'Plan updated successfully' : 'Plan created successfully');
        setShowModal(false);
        setEditingId(null);
        setFormData({
          name: '',
          price: '',
          duration: '30',
          features: '',
          vendorType: 'service',
          description: '',
          status: 'active'
        });
        fetchPlans();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save plan');
      }
    } catch (err) {
      console.error('Error saving plan:', err);
      setError('Failed to save plan');
    }
  };

  const handleEdit = (plan: SubPlan) => {
    setEditingId(plan._id);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      features: (plan.features || []).join('\n'),
      vendorType: plan.vendorType,
      description: plan.description || '',
      status: plan.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const res = await fetch(`${API_URL}/api/sub_plan/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Plan deleted successfully');
        fetchPlans();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete plan');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete plan');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      duration: '30',
      features: '',
      vendorType: 'service',
      description: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const getPlanColor = (name: string) => {
    if (name.toLowerCase().includes('basic')) return 'from-gray-500 to-gray-600';
    if (name.toLowerCase().includes('standard')) return 'from-blue-500 to-blue-600';
    if (name.toLowerCase().includes('premium') || name.toLowerCase().includes('pro')) return 'from-amber-500 to-amber-600';
    return 'from-rose-500 to-rose-600';
  };

  const filteredPlans = selectedTab === 'all' 
    ? plans 
    : plans.filter(p => p.vendorType === selectedTab);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-500 mt-1">Manage vendor subscription plans and pricing</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Add Plan
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

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { id: 'all', label: 'All Plans' },
            { id: 'service', label: 'Service Plans' },
            { id: 'album', label: 'Album Plans' },
            { id: 'proposal', label: 'Proposal Plans' },
            { id: 'product', label: 'Product Plans' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-rose-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-gray-500">Loading plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <span className="text-4xl mb-4 block">📋</span>
              <p>No plans found in this category. Create one to get started.</p>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className={`bg-gradient-to-r ${getPlanColor(plan.name)} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      plan.status === 'active' 
                        ? 'bg-green-500/30' 
                        : 'bg-gray-500/30'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Rs. {plan.price.toLocaleString()}</span>
                    <span className="text-white/80 ml-2">/{plan.duration} days</span>
                  </div>
                </div>
                <div className="p-6">
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mb-3 font-semibold">FEATURES:</p>
                  <ul className="space-y-2 mb-6">
                    {(plan.features || []).slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features && plan.features.length > 5 && (
                      <li className="text-sm text-gray-500">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Plan Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Subscription Plan' : 'Add Subscription Plan'}
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
                  <label className="block text-gray-700 font-semibold mb-2">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="e.g., Basic, Standard, Premium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Price (Rs.) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Duration (Days) *</label>
                    <input
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Vendor Type *</label>
                  <select
                    value={formData.vendorType}
                    onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="service">Service Vendor</option>
                    <option value="album">Album Vendor</option>
                    <option value="proposal">Proposal Vendor</option>
                    <option value="product">Product Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={2}
                    placeholder="Brief description of the plan"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Features (one per line) *</label>
                  <textarea
                    required
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
                    rows={5}
                    placeholder="5 Listings&#10;Basic Support&#10;Standard Visibility"
                  ></textarea>
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
                    {editingId ? 'Update' : 'Create'} Plan
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
