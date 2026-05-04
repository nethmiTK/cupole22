"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Search, User, Trash2, Eye, Mail } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { toast } from "react-toastify";

interface Customer {
  _id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);

      const res = await apiFetch(`/admin/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    setActionLoadingId(id);
    try {
      const res = await apiFetch(`/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Customer deleted");
        fetchCustomers();
      } else {
        toast.error("Failed to delete");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Customers</h1>
          <p className="text-gray-400 text-sm mt-1">
            All registered customers — {totalRecords} total
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Customer", "Email", "Joined", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={5}
                        className="px-6 py-4 h-16 bg-gray-50/50"
                      />
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <User className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          {c.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/customers/${c._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => deleteCustomer(c._id)}
                            disabled={actionLoadingId === c._id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
