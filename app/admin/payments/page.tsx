'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { CreditCard, CheckCircle, Clock, Filter } from 'lucide-react';
import { apiFetch } from '../../../lib/api';

interface Payment {
  _id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  paidAt?: string;
  customer?: { name: string; email: string };
  album?: { title: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await apiFetch(`/admin/payments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">
            All customer payments — {totalRecords} total
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    'Customer',
                    'Album',
                    'Amount',
                    'Method',
                    'Status',
                    'Date',
                    'Paid At',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={7}
                        className="px-6 py-4 h-16 bg-gray-50/50"
                      />
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {p.customer?.name || '—'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.customer?.email || '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.album?.title || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        LKR {p.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                        {p.method || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {p.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {p.status.charAt(0).toUpperCase() +
                            p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, totalRecords)} of {totalRecords}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}