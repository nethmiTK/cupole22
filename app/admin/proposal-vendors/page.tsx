'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Filter, CheckCircle, XCircle, Eye, Trash2, Phone, User, AlertCircle } from 'lucide-react';
import VendorDetailModal from '../components/VendorDetailModal';

interface ProposalVendor {
  _id: string;
  vendor_id: string;
  name: string;
  profilePic: string;
  whatsappNo: string;
  slipPhoto: string;
  planName?: string;
  planAmount?: number;
  status: string;
  createdAt: string;
}

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getProfilePicUrl(pic: string | null | undefined): string | null {
  if (!pic) return null;
  if (pic.startsWith('http')) return pic;
  return `${BASE_URL}${pic.startsWith('/') ? pic : '/' + pic}`;
}

function isOlderThan7Days(dateStr: string): boolean {
  if (!dateStr) return false;
  const created = new Date(dateStr);
  const diffMs = Date.now() - created.getTime();
  return diffMs > 7 * 24 * 60 * 60 * 1000;
}

export default function ProposalVendorsPage() {
  const [vendors, setVendors] = useState<ProposalVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<ProposalVendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    setPage(1);
    fetchVendors(1);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchVendors(page);
  }, [page]);

  const fetchVendors = async (targetPage = page) => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/admin/proposal-vendors`);
      if (statusFilter !== 'all') url.searchParams.append('status', statusFilter);
      if (searchTerm) url.searchParams.append('search', searchTerm);
      url.searchParams.append('page', targetPage.toString());
      url.searchParams.append('limit', limit.toString());

      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url.toString(), { headers });
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
          setTotalRecords(data.pagination.total);
        }
      } else {
        setVendors([]);
      }
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (vendor: ProposalVendor) => {
    const newStatus = vendor.status === 'active' ? 'pending' : 'active';
    setActionLoadingId(vendor._id);
    try {
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_URL}/admin/proposal-vendors/${vendor._id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      fetchVendors();
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteVendor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor? This cannot be undone.')) return;
    setActionLoadingId(id);
    try {
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/admin/proposal-vendors/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setVendors(prev => prev.filter(v => v._id !== id));
        fetchVendors();
      } else {
        alert('Failed to delete vendor');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // We now use vendors directly as filtering is done on the server
  const displayedVendors = vendors;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposal Vendors</h1>
          <p className="text-gray-500 mt-1">Manage proposal service vendors · Rows older than 7 days are highlighted red</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or WhatsApp..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Slip</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : displayedVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No proposal vendors found.
                    </td>
                  </tr>
                ) : (
                  displayedVendors.map((vendor: ProposalVendor) => {
                    const expired = isOlderThan7Days(vendor.createdAt);
                    const picUrl = getProfilePicUrl(vendor.profilePic);
                    const isActive = vendor.status === 'active';
                    const isLoading = actionLoadingId === vendor._id;

                    return (
                      <tr
                        key={vendor._id}
                        className={`transition-colors ${expired && vendor.status !== 'active'
                          ? 'bg-red-50 border-l-4 border-red-500 hover:bg-red-100'
                          : 'hover:bg-gray-50'
                          }`}
                      >
                        {/* Vendor col with profile pic */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {picUrl ? (
                              <img
                                src={picUrl}
                                alt={vendor.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-rose-100 shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center shadow-sm">
                                <User className="w-5 h-5 text-rose-500" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{vendor.name || '—'}</div>
                              {expired && vendor.status !== 'active' && (
                                <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold uppercase tracking-wide mt-0.5">
                                  <AlertCircle className="w-3 h-3" /> Payment Overdue
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {vendor.whatsappNo || '—'}
                          </div>
                        </td>

                        {/* Joined date */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}
                        </td>

                        {/* Plan */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{vendor.planName || 'No Plan'}</span>
                            {vendor.planAmount && <span className="text-[10px] text-gray-400">LKR {vendor.planAmount.toLocaleString()}</span>}
                          </div>
                        </td>

                        {/* Slip Photo Thumbnail */}
                        <td className="px-6 py-4 text-center">
                          {vendor.slipPhoto ? (
                            <a
                              href={getProfilePicUrl(vendor.slipPhoto) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block relative group"
                            >
                              <div className="relative">
                                <img
                                  src={getProfilePicUrl(vendor.slipPhoto) || ''}
                                  alt="Slip"
                                  className="w-12 h-16 object-cover rounded shadow-sm border border-gray-100 group-hover:scale-110 transition-transform"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://placehold.co/48x64/rose/white?text=ERR';
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-rose-600/20 rounded">
                                  <Eye className="w-4 h-4 text-white drop-shadow-md" />
                                </div>
                              </div>
                            </a>
                          ) : (
                            <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest italic">No Slip</span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive
                            ? 'bg-green-100 text-green-700'
                            : vendor.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                            }`}>
                            {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Unknown'}
                          </span>
                        </td>

                        {/* Action icons: Delete | View */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Quick Activate (for pending with slip) */}
                            {!isActive && vendor.slipPhoto && (
                              <button
                                disabled={isLoading}
                                onClick={() => toggleStatus(vendor)}
                                title="Quick Activate"
                                className="p-2 text-green-600 hover:bg-green-50 bg-green-50/30 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              disabled={isLoading}
                              onClick={() => deleteVendor(vendor._id)}
                              title="Delete Vendor"
                              className="p-2 text-red-500 hover:bg-red-50 bg-red-50/30 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* View */}
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setIsModalOpen(true);
                              }}
                              title="View Details"
                              className="p-2 text-blue-600 hover:bg-blue-50 bg-blue-50/30 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 gap-4 mt-4">
            <div className="text-sm text-gray-500 order-2 md:order-1">
              Showing <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(page * limit, totalRecords)}</span> of <span className="font-semibold text-gray-900">{totalRecords}</span> vendors
            </div>
            <div className="flex items-center gap-2 order-1 md:order-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] md:max-w-none pb-1 md:pb-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 flex-shrink-0 rounded-lg text-sm font-medium transition-colors ${p === page
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                disabled={page === totalPages || loading}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {selectedVendor && (
          <VendorDetailModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedVendor(null);
            }}
            onRefresh={fetchVendors}
            vendorId={selectedVendor.vendor_id || selectedVendor._id}
            vendorName={selectedVendor.name}
            vendorProfilePic={getProfilePicUrl(selectedVendor.profilePic)}
            vendorType="proposal"
          />
        )}
      </div>
    </AdminLayout>
  );
}