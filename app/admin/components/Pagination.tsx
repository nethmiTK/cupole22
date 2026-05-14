'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      
      {/* LEFT */}
      <p className="text-sm text-[#9B9095]">
        Page {currentPage} of {totalPages}
      </p>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        
        {/* PREV */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            currentPage === 1
              ? 'border-[#E7D3DA] text-[#C7B7BE] cursor-not-allowed'
              : 'border-[#E7D3DA] text-[#B11469] hover:bg-[#FFF2F7]'
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        {/* PAGE NUMBERS */}
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                currentPage === page
                  ? 'text-white shadow-md'
                  : 'text-[#7A6871] hover:bg-[#FFF2F7]'
              }`}
              style={
                currentPage === page
                  ? {
                      background:
                        'linear-gradient(180deg, #C41474 0%, #B50F69 100%)',
                    }
                  : {}
              }
            >
              {page}
            </button>
          );
        })}

        {/* NEXT */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            currentPage === totalPages
              ? 'border-[#E7D3DA] text-[#C7B7BE] cursor-not-allowed'
              : 'border-[#E7D3DA] text-[#B11469] hover:bg-[#FFF2F7]'
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}