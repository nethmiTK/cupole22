'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export default function PaginationComponent() {
  const [currentPage, setCurrentPage] = useState(2);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalItems = 50;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full flex items-center justify-between border-t pt-4 mt-10 px-4">
      
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <p className="text-gray-700 text-sm">
          {startItem} - {endItem} of {totalItems}
        </p>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={30}>30 per page</option>
        </select>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        
        {/* First */}
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Prev */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Current Page */}
        <div className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg font-semibold shadow">
          {currentPage}
        </div>

        {/* Next */}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>

        {/* Last */}
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}