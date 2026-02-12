'use client';

import AdminLayout from '../../components/AdminLayout';

export default function AllServicesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">All Services</h1>
        <p className="text-gray-500">View and manage all services</p>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-gray-600">Service list will be displayed here...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
