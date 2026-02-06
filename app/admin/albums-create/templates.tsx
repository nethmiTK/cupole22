'use client';

import { useEffect, useState } from 'react';

interface Template {
  _id: string;
  name: string;
  categoryId: string;
  pagesCount: number;
  coverType: string;
  size: string;
  description: string;
  status: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/template-categories`)
      .then(res => res.json())
      .then(data => {
        setTemplates([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">All Templates</h1>
      <p className="text-gray-600 mb-6">Browse and manage all album templates.</p>
      
      {loading ? (
        <p className="text-gray-500">Loading templates...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <p className="p-6 text-gray-500">No templates found. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}