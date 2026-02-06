'use client';

export default function CreateTemplatePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Create New Template</h1>
      <p className="text-gray-600 mb-6">Design a new album template with custom layouts and sizes.</p>
      
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="max-w-2xl">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
            <input type="text" placeholder="Enter template name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select a category</option>
              <option>Wedding</option>
              <option>Birthday</option>
              <option>Engagement</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Pages</label>
            <input type="number" min="1" max="50" defaultValue="20" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">Create Template</button>
        </div>
      </div>
    </div>
  );
}