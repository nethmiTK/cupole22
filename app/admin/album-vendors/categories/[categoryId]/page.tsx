'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

// Sample data
const categoryData = {
  id: '1',
  name: 'Wedding',
  description: 'Traditional and modern wedding album templates',
  icon: '💒',
  status: 'active' as const,
  templatesCount: 15,
  albumsCreated: 234,
  vendorsUsed: 28,
  mostUsedTemplate: 'Royal Wedding 20 Pages',
  createdAt: '2024-01-15',
};

interface Template {
  id: string;
  name: string;
  pagesCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  albumsCreated: number;
}

interface Album {
  id: string;
  albumName: string;
  vendorName: string;
  customerName: string;
  status: 'completed' | 'in-progress' | 'draft';
  createdAt: string;
  templateName: string;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  albumsCount: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

const templatesData: Template[] = [
  { id: '1', name: 'Royal Wedding 20 Pages', pagesCount: 20, status: 'active', createdAt: '2024-02-15', albumsCreated: 89 },
  { id: '2', name: 'Classic Elegance 30', pagesCount: 30, status: 'active', createdAt: '2024-03-10', albumsCreated: 67 },
  { id: '3', name: 'Modern Minimalist', pagesCount: 20, status: 'active', createdAt: '2024-04-05', albumsCreated: 45 },
  { id: '4', name: 'Vintage Romance', pagesCount: 40, status: 'inactive', createdAt: '2024-05-20', albumsCreated: 23 },
  { id: '5', name: 'Beach Wedding Special', pagesCount: 30, status: 'active', createdAt: '2024-06-12', albumsCreated: 10 },
];

const albumsData: Album[] = [
  { id: '1', albumName: 'Kasun & Nimali Wedding', vendorName: 'Dream Studio', customerName: 'Kasun Perera', status: 'completed', createdAt: '2026-02-05', templateName: 'Royal Wedding 20 Pages' },
  { id: '2', albumName: 'Saman & Dilini Album', vendorName: 'Creative Clicks', customerName: 'Saman Silva', status: 'in-progress', createdAt: '2026-02-04', templateName: 'Classic Elegance 30' },
  { id: '3', albumName: 'Ruwan Wedding Album', vendorName: 'Photo Masters', customerName: 'Ruwan Fernando', status: 'completed', createdAt: '2026-02-03', templateName: 'Modern Minimalist' },
  { id: '4', albumName: 'Priya & Amal Wedding', vendorName: 'Dream Studio', customerName: 'Priya Kumar', status: 'draft', createdAt: '2026-02-02', templateName: 'Royal Wedding 20 Pages' },
  { id: '5', albumName: 'Nadeesha & Chamara', vendorName: 'Elite Photos', customerName: 'Nadeesha Jayawardena', status: 'completed', createdAt: '2026-02-01', templateName: 'Beach Wedding Special' },
];

const vendorsData: Vendor[] = [
  { id: '1', name: 'Dream Studio', email: 'info@dreamstudio.lk', albumsCount: 45, lastActivity: '2026-02-07', status: 'active' },
  { id: '2', name: 'Creative Clicks', email: 'hello@creativeclicks.com', albumsCount: 32, lastActivity: '2026-02-06', status: 'active' },
  { id: '3', name: 'Photo Masters', email: 'contact@photomasters.lk', albumsCount: 28, lastActivity: '2026-02-05', status: 'active' },
  { id: '4', name: 'Elite Photos', email: 'elite@photos.com', albumsCount: 21, lastActivity: '2026-02-04', status: 'inactive' },
  { id: '5', name: 'Memories Forever', email: 'memories@forever.lk', albumsCount: 15, lastActivity: '2026-02-03', status: 'active' },
];

export default function CategoryViewPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId;

  const [activeTab, setActiveTab] = useState<'templates' | 'albums' | 'vendors'>('templates');
  const [categoryStatus, setCategoryStatus] = useState(categoryData.status);

  const toggleStatus = () => {
    setCategoryStatus(categoryStatus === 'active' ? 'inactive' : 'active');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button 
            onClick={() => router.push('/admin/album-vendors/categories')}
            className="hover:text-rose-600 transition-colors"
          >
            Categories
          </button>
          <span>→</span>
          <span className="text-rose-600 font-medium">{categoryData.name}</span>
        </div>

        {/* Category Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-4xl">
                {categoryData.icon}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{categoryData.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    categoryStatus === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {categoryStatus === 'active' ? '✓ Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-500 mt-1">{categoryData.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleStatus}
                className={`px-4 py-2.5 font-medium rounded-xl transition-all flex items-center gap-2 ${
                  categoryStatus === 'active'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                {categoryStatus === 'active' ? '🧊 Disable' : '✅ Enable'}
              </button>
              <button className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-xl transition-all flex items-center gap-2">
                ✏️ Edit
              </button>
              <button
                onClick={() => router.push('/admin/album-vendors/categories')}
                className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium rounded-xl transition-all"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Usage Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{categoryData.templatesCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Albums Created</p>
                <p className="text-2xl font-bold text-rose-600">{categoryData.albumsCreated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Vendors Used</p>
                <p className="text-2xl font-bold text-blue-600">{categoryData.vendorsUsed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                ⭐
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Most Used</p>
                <p className="text-sm font-bold text-gray-900 truncate">{categoryData.mostUsedTemplate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                activeTab === 'templates'
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 Templates ({templatesData.length})
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                activeTab === 'albums'
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📖 Albums ({albumsData.length})
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                activeTab === 'vendors'
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              👥 Vendors ({vendorsData.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Template Name</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Pages</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Albums</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Created</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {templatesData.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{template.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                            {template.pagesCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            template.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {template.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-rose-600">{template.albumsCreated}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg">✏️</button>
                          <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg">👁️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Albums Tab */}
            {activeTab === 'albums' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Album Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Vendor</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Customer</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Created</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {albumsData.map((album) => (
                      <tr key={album.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{album.albumName}</p>
                          <p className="text-xs text-gray-500">{album.templateName}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{album.vendorName}</td>
                        <td className="px-4 py-3 text-gray-600">{album.customerName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            album.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : album.status === 'in-progress'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {album.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                          {new Date(album.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm font-medium">
                            Open Editor
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Vendor Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Albums</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Last Activity</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendorsData.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{vendor.name}</td>
                        <td className="px-4 py-3 text-gray-600">{vendor.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">
                            {vendor.albumsCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            vendor.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                          {new Date(vendor.lastActivity).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg">👁️</button>
                          <button className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg">📧</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
