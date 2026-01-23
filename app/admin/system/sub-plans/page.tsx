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
  status: 'active' | 'inactive';
}

export default function SubPlansPage() {
  const [plans, setPlans] = useState<SubPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '30',
    features: '',
    vendorType: 'service'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    // Simulated data for now
    setPlans([
      { _id: '1', name: 'Basic', price: 5000, duration: 30, features: ['5 Listings', 'Basic Support', 'Standard Visibility'], vendorType: 'service', status: 'active' },
      { _id: '2', name: 'Standard', price: 10000, duration: 30, features: ['15 Listings', 'Priority Support', 'Enhanced Visibility', 'Analytics'], vendorType: 'service', status: 'active' },
      { _id: '3', name: 'Premium', price: 25000, duration: 30, features: ['Unlimited Listings', '24/7 Support', 'Top Visibility', 'Advanced Analytics', 'Featured Badge'], vendorType: 'service', status: 'active' },
      { _id: '4', name: 'Basic Album', price: 3000, duration: 30, features: ['3 Albums', 'Basic Templates'], vendorType: 'album', status: 'active' },
      { _id: '5', name: 'Pro Album', price: 8000, duration: 30, features: ['10 Albums', 'Premium Templates', 'Custom Design'], vendorType: 'album', status: 'active' },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-500 mt-1">Manage vendor subscription plans</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Add Plan
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          {[
            { id: 'all', label: 'All Plans' },
            { id: 'service', label: 'Service Vendors' },
            { id: 'album', label: 'Album Vendors' },
            { id: 'proposal', label: 'Proposal Vendors' },
            { id: 'product', label: 'Product Vendors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
          {filteredPlans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`bg-gradient-to-r ${getPlanColor(plan.name)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {plan.vendorType}
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Rs. {plan.price.toLocaleString()}</span>
                  <span className="text-white/80">/{plan.duration} days</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Plan Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Subscription Plan</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g., Basic, Standard, Premium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Vendor Type</label>
                  <select
                    value={formData.vendorType}
                    onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="service">Service Vendor</option>
                    <option value="album">Album Vendor</option>
                    <option value="proposal">Proposal Vendor</option>
                    <option value="product">Product Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Features (one per line)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    rows={4}
                    placeholder="Enter features, one per line"
                  ></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-lg"
                  >
                    Add Plan
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
