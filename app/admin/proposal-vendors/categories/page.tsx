'use client';

import AdminLayout from '../../components/AdminLayout';

export default function ProposalCategoriesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Proposal Categories</h1>
        <p className="text-gray-500">Manage proposal categories</p>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-gray-600">Category list will be displayed here...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
