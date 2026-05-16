'use client';

import { useEffect, useState } from 'react';

type UserRow = {
  name: string;
  email: string;
  role: 'Admin' | 'Photographer' | 'Client';
  contact: string;
  subscription: string;
  status: 'Active' | 'Offline';
  avatar: string;
};

const sampleUsers: UserRow[] = [
  {
    name: 'Julian Casablancas',
    email: 'julian.c@lensflow.studio',
    role: 'Admin',
    contact: '+1 (555) 012-3456',
    subscription: 'Enterprise Tier',
    status: 'Active',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  },
  {
    name: 'Maya Sterling',
    email: 'maya.photo@lensflow.studio',
    role: 'Photographer',
    contact: '+44 7700 900077',
    subscription: 'Pro Monthly',
    status: 'Active',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  },
  {
    name: 'Liam Henderson',
    email: 'liam.h@client-domain.com',
    role: 'Client',
    contact: '+1 (555) 998-2211',
    subscription: 'Standard',
    status: 'Offline',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
  },
];

const initialFormState = {
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  bio: '',
  instagram: '',
  facebook: '',
  role: 'photographer',
  subscriptionPlan: 'Pro Artist',
  visibility: 'Public',
  isActive: true,
};

const inputClassName = 'w-full rounded-xl border border-[#F3E5E6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d9c8c9] focus:ring-4 focus:ring-[#f3e5e630]';

export default function Page() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    document.body.style.overflow = isFormOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFormOpen]);

  const updateField = (field: keyof typeof initialFormState, value: string | boolean) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const closeForm = () => setIsFormOpen(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsFormOpen(false);
    setFormData(initialFormState);
  };

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#FFF8F7] px-4 py-6 text-[#111111] md:px-6 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">LensFlow</p>
            <h1
              className="mt-2 text-[48px] font-normal tracking-normal text-black"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', lineHeight: '60px' }}
            >
              User Management
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#6f5b5c] md:text-base">
              Manage your studio team, photographers, and client access levels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F3E5E6] px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_28px_rgba(18,18,18,0.08)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="text-lg leading-none">+</span>
            Add User
          </button>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Users" value="1,284" meta="+12%" />
          <StatCard title="Active Now" value="412" meta="Live" />
          <StatCard title="Photographers" value="86" meta="/ 100 slots" />
          <div className="rounded-3xl bg-[#F3E5E6] p-5 text-black shadow-[0_12px_32px_rgba(18,18,18,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/70">Pro Plan Usage</p>
            <div className="mt-2 text-2xl font-semibold">92% Capacity</div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-[92%] rounded-full bg-black" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#F3E5E6] bg-white shadow-[0_10px_30px_rgba(18,18,18,0.05)]">
          <div className="flex flex-col gap-4 border-b border-[#F3E5E6] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6f5b5c]">⌕</span>
              <input
                className="w-full rounded-full border border-[#F3E5E6] bg-[#FFF8F7] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#d9c8c9] focus:ring-4 focus:ring-[#f3e5e630]"
                placeholder="Filter by name, role or email..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button
                type="button"
                className="rounded-xl border border-[#F3E5E6] bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#FFF8F7]"
              >
                Advanced Filters
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="rounded-xl bg-[#F3E5E6] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#e8d7d8]"
              >
                Add User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left" style={{ minWidth: 860 }}>
              <thead className="bg-[#FFF8F7]">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Full Name</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Role</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Contact</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Subscription</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E5E6]">
                {sampleUsers.map((user) => (
                  <tr key={user.email} className="transition hover:bg-[#FFF8F7]">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <img alt={user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" src={user.avatar} />
                        <div>
                          <p className="text-sm font-semibold text-black">{user.name}</p>
                          <p className="text-sm text-[#6f5b5c]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-5 text-sm text-[#6f5b5c]">{user.contact}</td>
                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-black">{user.subscription}</p>
                      <p className="text-sm text-[#6f5b5c]">Renewal details</p>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-5 text-right text-[#6f5b5c]">⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#F3E5E6] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-[#6f5b5c]">
              Showing <span className="font-semibold text-black">1-10</span> of <span className="font-semibold text-black">1,284</span> users
            </p>
            <div className="flex items-center gap-2">
              <PageChip active label="1" />
              <PageChip label="2" />
              <PageChip label="3" />
              <span className="px-1 text-[#6f5b5c]">...</span>
              <PageChip label="128" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-[#F3E5E6] bg-[#FFF8F7] p-5 shadow-[0_10px_30px_rgba(18,18,18,0.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-sm">✦</div>
              <div>
                <h2 className="text-xl font-semibold text-black">Storage Advisory</h2>
                <p className="mt-1 text-sm leading-6 text-[#6f5b5c]">
                  Your studio team has uploaded 4.2TB of content this month. Consider upgrading for more capacity.
                </p>
              </div>
              <button className="rounded-xl border border-[#F3E5E6] bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#FFF8F7] sm:ml-auto">
                View Plans
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#F3E5E6] bg-white p-5 shadow-[0_10px_30px_rgba(18,18,18,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Active Sessions</p>
            <div className="mt-4 flex -space-x-3">
              {sampleUsers.map((user) => (
                <img key={user.email} alt={user.name} className="h-10 w-10 rounded-full border-2 border-white object-cover" src={user.avatar} />
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#F3E5E6] text-xs font-semibold text-black">
                +5
              </div>
            </div>
            <p className="mt-4 text-sm text-black">8 people currently editing projects</p>
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-[#F3E5E6] bg-white shadow-[0_24px_80px_rgba(18,18,18,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#F3E5E6] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Popup form</p>
                <h2 className="mt-2 text-2xl font-semibold text-black">Create User</h2>
                <p className="mt-1 text-sm text-[#6f5b5c]">Fill in the account details and create the profile.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full bg-[#F3E5E6] px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#e8d7d8]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <SectionCard title="Profile Info">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Full Name">
                        <input value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} className={inputClassName} placeholder="e.g. Sarah Jenkins" />
                      </Field>
                      <Field label="Email Address">
                        <input value={formData.email} onChange={(event) => updateField('email', event.target.value)} className={inputClassName} placeholder="sarah@example.com" type="email" />
                      </Field>
                      <Field label="Password">
                        <input value={formData.password} onChange={(event) => updateField('password', event.target.value)} className={inputClassName} placeholder="••••••••" type="password" />
                      </Field>
                      <Field label="Phone Number">
                        <input value={formData.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} className={inputClassName} placeholder="+1 (555) 000-0000" type="tel" />
                      </Field>
                      <Field label="Role">
                        <select value={formData.role} onChange={(event) => updateField('role', event.target.value)} className={inputClassName}>
                          <option value="admin">Admin</option>
                          <option value="photographer">Photographer</option>
                          <option value="client">Client</option>
                        </select>
                      </Field>
                      <Field label="Visibility">
                        <select value={formData.visibility} onChange={(event) => updateField('visibility', event.target.value)} className={inputClassName}>
                          <option>Public</option>
                          <option>Private</option>
                        </select>
                      </Field>
                      <Field label="Subscription Plan" className="md:col-span-2">
                        <input value={formData.subscriptionPlan} onChange={(event) => updateField('subscriptionPlan', event.target.value)} className={inputClassName} placeholder="Pro Artist" />
                      </Field>
                      <Field label="Bio" className="md:col-span-2">
                        <textarea value={formData.bio} onChange={(event) => updateField('bio', event.target.value)} className={`${inputClassName} min-h-32`} placeholder="Tell us about the user's specialty and experience..." rows={4} />
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="Social Links">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Instagram">
                        <input value={formData.instagram} onChange={(event) => updateField('instagram', event.target.value)} className={inputClassName} placeholder="instagram.com/username" />
                      </Field>
                      <Field label="Facebook">
                        <input value={formData.facebook} onChange={(event) => updateField('facebook', event.target.value)} className={inputClassName} placeholder="facebook.com/username" />
                      </Field>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-6">
                  <SectionCard title="Account Status">
                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#F3E5E6] px-4 py-4 transition hover:bg-[#FFF8F7]">
                      <div>
                        <p className="text-sm font-semibold text-black">Active account</p>
                        <p className="mt-1 text-sm text-[#6f5b5c]">Allow the user to sign in immediately.</p>
                      </div>
                      <input
                        checked={formData.isActive}
                        onChange={(event) => updateField('isActive', event.target.checked)}
                        className="h-5 w-5 rounded border-[#F3E5E6] text-black focus:ring-[#d9c8c9]"
                        type="checkbox"
                      />
                    </label>

                    <div className="mt-4 rounded-2xl bg-[#FFF8F7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Created by</p>
                      <p className="mt-2 text-sm text-black">Current admin session</p>
                    </div>
                  </SectionCard>

                  <SectionCard title="Profile Picture">
                    <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#F3E5E6] bg-[#FFF8F7] px-4 text-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#F3E5E6] bg-white text-3xl text-black shadow-sm">
                        +
                      </div>
                      <p className="mt-4 text-sm font-semibold text-black">Drop or upload an image</p>
                      <p className="mt-1 text-sm text-[#6f5b5c]">JPG, PNG, or GIF up to 5MB</p>
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#F3E5E6] pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-[#6f5b5c] transition hover:bg-[#FFF8F7] hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#F3E5E6] px-6 py-3 text-sm font-semibold text-black shadow-[0_12px_28px_rgba(18,18,18,0.08)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StatCard({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <div className="rounded-3xl border border-[#F3E5E6] bg-white p-5 shadow-[0_10px_30px_rgba(18,18,18,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">{title}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-semibold tracking-tight text-black">{value}</span>
        <span className="pb-1 text-sm font-semibold text-[#6f5b5c]">{meta}</span>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRow['role'] }) {
  const classes = {
    Admin: 'border-[#F3E5E6] bg-[#FFF8F7] text-black',
    Photographer: 'border-[#F3E5E6] bg-[#FFF8F7] text-black',
    Client: 'border-[#F3E5E6] bg-[#FFF8F7] text-black',
  } as const;

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[role]}`}>{role}</span>;
}

function StatusBadge({ status }: { status: UserRow['status'] }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#F3E5E6] bg-[#FFF8F7] px-3 py-1 text-xs font-semibold text-black">
      <span className="h-1.5 w-1.5 rounded-full bg-black" />
      {status}
    </span>
  );
}

function PageChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${
        active ? 'bg-[#F3E5E6] text-black' : 'border border-[#F3E5E6] bg-white text-[#6f5b5c] hover:bg-[#FFF8F7]'
      }`}
    >
      {label}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.35rem] border border-[#F3E5E6] bg-[#fffdfd] p-5">
      <h3 className="text-lg font-semibold text-black">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-black">{label}</span>
      {children}
    </label>
  );
}