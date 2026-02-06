'use client';

import { useState } from 'react';

export default function AlbumsPage() {
  const [albums] = useState([]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">All Albums</h1>
      <p className="text-gray-600 mb-6">View and manage all vendor albums created from templates.</p>
      
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {albums.length === 0 ? (
          <p className="p-6 text-gray-500">No albums found yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Album Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Albums will be listed here */}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}