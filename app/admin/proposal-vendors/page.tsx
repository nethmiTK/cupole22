'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Filter, CheckCircle, XCircle, Clock, Trash2, User, Phone, MapPin, Eye } from 'lucide-react';
import VendorDetailModal from '../components/VendorDetailModal';

interface Proposal {
  _id: string;
  adCode: string;
  vendorId?: string;
  privateInfo: {
    firstName: string;
    lastName: string;
    whatsappContact: string;
    address: string;
  };
  publicInfo: {
    gender: string;
    profession: string;
    residentTown: string;
    birthYear: number;
  };
  approvalStatus: string;
  adStatus: string;
  createdAt: string;
}

export default function ProposalVendorsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [statusFilter]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/marriage-proposals/admin/all`);
      if (statusFilter !== 'all') url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, updates: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/marriage-proposals/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: id, ...updates })
      });
      if (res.ok) {
        fetchProposals();
      }
    } catch (err) {
      console.error('Failed to update proposal:', err);
    }
  };

  const deleteProposal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/marriage-proposals/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: id })
      });
      if (res.ok) {
        fetchProposals();
      }
    } catch (err) {
      console.error('Failed to delete proposal:', err);
    }
  };

  const filteredProposals = proposals.filter(p =>
    p.adCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.privateInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.privateInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.privateInfo?.whatsappContact?.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marriage Proposals</h1>
          <p className="text-gray-500 mt-1">Manage all wedding proposals and ads on the platform</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Ad Code, Name, or WhatsApp..."
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
              <option value="all">All Ad Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Proposal</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requester (Private)</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Public Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No proposals found.
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((proposal) => (
                    <tr key={proposal._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded inline-block">
                          {proposal.adCode}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 italic">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium text-gray-900">{proposal.privateInfo.firstName} {proposal.privateInfo.lastName}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <Phone className="w-3 h-3" /> {proposal.privateInfo.whatsappContact}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-gray-800">
                          <User className="w-4 h-4 text-gray-400" /> {proposal.publicInfo.gender} ({new Date().getFullYear() - proposal.publicInfo.birthYear})
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{proposal.publicInfo.profession}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" /> {proposal.publicInfo.residentTown}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${proposal.adStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            Ad: {proposal.adStatus}
                          </div>
                          <br />
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${proposal.approvalStatus === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                            Appr: {proposal.approvalStatus}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProposal(proposal);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                            title="View Full Details & Subscription"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {proposal.adStatus !== 'active' ? (
                            <button
                              onClick={() => updateStatus(proposal._id, { adStatus: 'active' })}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                              title="Activate Ad"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStatus(proposal._id, { adStatus: 'inactive' })}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100"
                              title="Pause Ad"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteProposal(proposal._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedProposal && (
          <VendorDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            vendorId={selectedProposal.vendorId || selectedProposal._id}
            vendorName={`${selectedProposal.privateInfo.firstName} ${selectedProposal.privateInfo.lastName}`}
            vendorType="proposal"
          />
        )}
      </div>
    </AdminLayout>
  );
}

