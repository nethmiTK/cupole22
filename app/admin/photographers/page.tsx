'use client';

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import CustomTable from '../components/CustomTable';
import Pagination from '../components/Pagination';

interface Photographer {
  name: string;
  email: string;
  paymentAmount: string;
  paymentStatus: string;
  expireDate: string;
  visibility: string;
}

function Page() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<Photographer>({
    name: '',
    email: '',
    paymentAmount: '',
    paymentStatus: 'Pending',
    expireDate: '',
    visibility: 'Public',
  });

  // columns for table
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'paymentAmount', label: 'Payment' },
    { key: 'paymentStatus', label: 'Status' },
    { key: 'expireDate', label: 'Expire Date' },
    { key: 'visibility', label: 'Visibility' },
  ];

  const handleAdd = () => {
    if (!form.name || !form.email) return;

    setPhotographers([...photographers, form]);

    setForm({
      name: '',
      email: '',
      paymentAmount: '',
      paymentStatus: 'Pending',
      expireDate: '',
      visibility: 'Public',
    });

    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3D2A32]">
              Photographers
            </h1>
            <p className="text-sm text-gray-400">
              Manage all photographers
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="px-5 py-2 rounded-xl text-white font-semibold"
            style={{
              background:
                'linear-gradient(180deg, #C41474 0%, #B50F69 100%)',
            }}
          >
            + Add Photographer
          </button>
        </div>

        {/* TABLE */}
        <CustomTable
          columns={columns}
          data={photographers}
        />

        {/* PAGINATION */}
        <Pagination
          currentPage={page}
          totalPages={3}
          onPageChange={setPage}
        />
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 space-y-4">

            <h2 className="text-xl font-bold text-[#B11469]">
              Add Photographer
            </h2>

            {/* NAME */}
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border p-3 rounded-xl"
            />

            {/* EMAIL */}
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border p-3 rounded-xl"
            />

            {/* PAYMENT */}
            <input
              placeholder="Payment Amount"
              value={form.paymentAmount}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentAmount: e.target.value,
                })
              }
              className="w-full border p-3 rounded-xl"
            />

            {/* PAYMENT STATUS */}
            <select
              value={form.paymentStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentStatus: e.target.value,
                })
              }
              className="w-full border p-3 rounded-xl"
            >
              <option>Paid</option>
              <option>Pending</option>
            </select>

            {/* EXPIRE DATE */}
            <input
              type="date"
              value={form.expireDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  expireDate: e.target.value,
                })
              }
              className="w-full border p-3 rounded-xl"
            />

            {/* VISIBILITY */}
            <select
              value={form.visibility}
              onChange={(e) =>
                setForm({
                  ...form,
                  visibility: e.target.value,
                })
              }
              className="w-full border p-3 rounded-xl"
            >
              <option>Public</option>
              <option>Private</option>
              <option>Hidden</option>
            </select>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-xl border"
              >
                Cancel
              </button>

              <button
                onClick={handleAdd}
                className="px-5 py-2 rounded-xl text-white"
                style={{
                  background:
                    'linear-gradient(180deg, #C41474 0%, #B50F69 100%)',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Page;