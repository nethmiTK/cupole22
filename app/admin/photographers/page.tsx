'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Facebook, Globe, Instagram, Linkedin, Music2, PencilLine, Trash2, Twitter, Upload, X, Youtube } from 'lucide-react';
import { clearAuthSession, getStoredUser, getStoredToken } from '@/lib/auth';

const PaginationComponent = dynamic(() => import('@/app/Components/Pagination'), { ssr: false });

type UserRow = {
  id: number | string;
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
    id: 1,
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
    id: 2,
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
    id: 3,
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
  tiktok: '',
  x: '',
  youtube: '',
  linkedin: '',
  website: '',
  profileImage: '',
  role: 'photographer',
  subscriptionPlan: 'photographer-1-year',
  isActive: true,
};

const inputClassName = 'w-full rounded-xl border border-[#F3E5E6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d9c8c9] focus:ring-4 focus:ring-[#f3e5e630]';
const pageLabelStyle = {
  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  color: 'rgb(177, 14, 107)',
  fontSize: '10px',
  lineHeight: '15px',
  margin: 0,
  letterSpacing: '0',
  textTransform: 'none',
} as const;

const bodyTextStyle = {
  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 400,
  color: 'rgb(37, 24, 29)',
  fontSize: '16px',
  lineHeight: '24px',
} as const;

const actionButtonTextStyle = {
  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 600,
  color: 'rgb(255, 255, 255)',
  fontSize: '15px',
  lineHeight: '23px',
} as const;

const statHeadingStyle = {
  fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  fontStyle: 'normal',
  fontWeight: 400,
  color: 'rgb(177, 14, 107)',
  fontSize: '16px',
  lineHeight: '24px',
  margin: 0,
} as const;

const statValueStyle = {
  fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  fontStyle: 'normal',
  fontWeight: 400,
  color: 'rgb(0, 0, 0)',
  fontSize: '24px',
  lineHeight: '32px',
} as const;

const subscriptionPlans = [
  {
    value: 'photographer-1-year',
    title: 'Photographer',
    description: '1 year plan / Rs 5000',
  },
  {
    value: 'client-1-year',
    title: 'Client',
    description: '1 year plan / Rs 5000',
  },
] as const;

export default function Page() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState(sampleUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [isDropActive, setIsDropActive] = useState(false);
  const [creatorName, setCreatorName] = useState('Current admin session');
  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = isFormOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFormOpen]);

  useEffect(() => {
    const storedUser = getStoredUser() as { name?: string; fullName?: string; username?: string; email?: string } | null;
    const displayName = storedUser?.name || storedUser?.fullName || storedUser?.username || storedUser?.email;
    if (displayName) {
      setCreatorName(displayName);
    }
  }, []);

  const updateField = (field: keyof typeof initialFormState, value: string | boolean) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingUserId(null);
    setFormData(initialFormState);
    setProfilePreview('');
    setIsFormOpen(true);
  };

  const openEditForm = (user: UserRow) => {
    setEditingUserId(user.id);
    setProfilePreview(user.avatar);
    setFormData({
      ...initialFormState,
      fullName: user.name,
      email: user.email,
      phoneNumber: user.contact,
      role: user.role.toLowerCase() as typeof initialFormState.role,
      subscriptionPlan: user.subscription,
      profileImage: user.avatar,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setIsDropActive(false);
  };

  const handleProfileFile = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setProfilePreview(result);
      updateField('profileImage', result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDropActive(false);
    handleProfileFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prepare payload matching backend fields
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      bio: formData.bio,
      role: formData.role,
      subscriptionPlan: formData.subscriptionPlan,
      instagram: formData.instagram,
      facebook: formData.facebook,
      tiktok: formData.tiktok,
      x: formData.x,
      youtube: formData.youtube,
      linkedin: formData.linkedin,
      website: formData.website,
      profileImage: profilePreview || formData.profileImage,
      isActive: formData.isActive,
    } as any;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
    const token = getStoredToken();

    try {
      const res = await fetch(`${apiBase}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create user');
      }

      const data = await res.json();

      // Use the user returned from the DB so we show the saved record
      const created = data.user;
      const nextUser: UserRow = {
        id: created._id ?? Date.now(),
        name: created.name || formData.fullName || 'New User',
        email: created.email || formData.email || 'new.user@example.com',
        role: created.role === 'admin' ? 'Admin' : created.role === 'client' ? 'Client' : 'Photographer',
        contact: created.phone || formData.phoneNumber || '—',
        subscription: created.subscriptionPlan || formData.subscriptionPlan,
        status: created.status === 'active' || formData.isActive ? 'Active' : 'Offline',
        avatar: created.profilePic || profilePreview || formData.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      };

      setUsers((current) => {
        if (editingUserId === null) return [nextUser, ...current];
        return current.map((u) => (u.id === editingUserId ? nextUser : u));
      });

      setIsFormOpen(false);
      setEditingUserId(null);
      setProfilePreview('');
      setIsDropActive(false);
      setFormData(initialFormState);
    } catch (err) {
      console.error('Create user failed', err);
      // Fallback to local-only behavior
      const nextUser: UserRow = {
        id: editingUserId ?? Date.now(),
        name: formData.fullName || 'New User',
        email: formData.email || 'new.user@example.com',
        role: formData.role === 'admin' ? 'Admin' : formData.role === 'client' ? 'Client' : 'Photographer',
        contact: formData.phoneNumber || '—',
        subscription: formData.subscriptionPlan,
        status: formData.isActive ? 'Active' : 'Offline',
        avatar: profilePreview || formData.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      };

      setUsers((current) => {
        if (editingUserId === null) {
          return [nextUser, ...current];
        }

        return current.map((user) => (user.id === editingUserId ? nextUser : user));
      });

      setIsFormOpen(false);
      setEditingUserId(null);
      setProfilePreview('');
      setIsDropActive(false);
      setFormData(initialFormState);
    }
  };

  const handleDeleteUser = (userId: number) => {
    setUsers((current) => current.filter((user) => user.id !== userId));
  };

  const visibleUsers = users.filter((user) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return [user.name, user.email, user.role, user.contact, user.subscription, user.status]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#FFF8F7] px-4 py-6 text-[#111111] md:px-6 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p style={pageLabelStyle}>Invite Flow</p>
            <h1
              className="mt-2 tracking-normal"
              style={{
                fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                fontStyle: 'normal',
                fontWeight: 400,
                color: 'rgb(0, 0, 0)',
                fontSize: '48px',
                lineHeight: '60px',
              }}
            >
              User Management
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#6f5b5c] md:text-base" style={bodyTextStyle}>
              Manage your studio team, photographers, and client access levels.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BC116E] px-5 py-3 shadow-[0_12px_28px_rgba(18,18,18,0.08)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={actionButtonTextStyle}
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
            <p style={statHeadingStyle}>Pro Plan Usage</p>
            <div className="mt-2" style={statValueStyle}>92% Capacity</div>
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
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-xl bg-[#BC116E] px-4 py-3 transition hover:bg-[#9e0e5d]"
              style={actionButtonTextStyle}
            >
              Add User
            </button>
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
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E5E6]">
                {visibleUsers.map((user) => (
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
                    <td className="px-5 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(user)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F3E5E6] bg-white text-[#BC116E] transition hover:bg-[#FFF8F7]"
                          aria-label={`Edit ${user.name}`}
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F3E5E6] bg-white text-[#BC116E] transition hover:bg-[#FFF8F7]"
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationComponent/>
        </div>
 
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-md">
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-[#F3E5E6] bg-white shadow-[0_24px_80px_rgba(18,18,18,0.18)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={bodyTextStyle}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#F3E5E6] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: '#BC116E' }}>
                  Popup form
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-black" style={bodyTextStyle}>
                  {editingUserId === null ? 'Create User' : 'Edit User'}
                </h2>
                <p className="mt-1 text-sm text-[#6f5b5c]" style={bodyTextStyle}>
                  Fill in the account details and create the profile.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#BC116E] transition hover:bg-[#9e0e5d]"
                aria-label="Close popup"
                style={actionButtonTextStyle}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <SectionCard title="Profile Info" titleStyle={popupSectionTitleStyle}>
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
                      <Field label="Bio" className="md:col-span-2">
                        <textarea value={formData.bio} onChange={(event) => updateField('bio', event.target.value)} className={`${inputClassName} min-h-32`} placeholder="Tell us about the user's specialty and experience..." rows={4} />
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="Social Links" titleStyle={popupSectionTitleStyle}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={<SocialLabel icon={<Instagram size={16} />} text="Instagram" />}>
                        <input value={formData.instagram} onChange={(event) => updateField('instagram', event.target.value)} className={inputClassName} placeholder="instagram.com/username" />
                      </Field>
                      <Field label={<SocialLabel icon={<Facebook size={16} />} text="Facebook" />}>
                        <input value={formData.facebook} onChange={(event) => updateField('facebook', event.target.value)} className={inputClassName} placeholder="facebook.com/username" />
                      </Field>
                      <Field label={<SocialLabel icon={<Music2 size={16} />} text="TikTok" />}>
                        <input value={formData.tiktok} onChange={(event) => updateField('tiktok', event.target.value)} className={inputClassName} placeholder="tiktok.com/@username" />
                      </Field>
                      <Field label={<SocialLabel icon={<Twitter size={16} />} text="X (Twitter)" />}>
                        <input value={formData.x} onChange={(event) => updateField('x', event.target.value)} className={inputClassName} placeholder="x.com/username" />
                      </Field>
                      <Field label={<SocialLabel icon={<Youtube size={16} />} text="YouTube" />}>
                        <input value={formData.youtube} onChange={(event) => updateField('youtube', event.target.value)} className={inputClassName} placeholder="youtube.com/@channel" />
                      </Field>
                      <Field label={<SocialLabel icon={<Linkedin size={16} />} text="LinkedIn" />}>
                        <input value={formData.linkedin} onChange={(event) => updateField('linkedin', event.target.value)} className={inputClassName} placeholder="linkedin.com/in/username" />
                      </Field>
                      <Field label={<SocialLabel icon={<Globe size={16} />} text="Website" />} className="md:col-span-2">
                        <input value={formData.website} onChange={(event) => updateField('website', event.target.value)} className={inputClassName} placeholder="yourwebsite.com" />
                      </Field>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-6">
                  <SectionCard title="Subscription Plan" titleStyle={popupSectionTitleStyle}>
                    <div className="space-y-3">
                      {subscriptionPlans.map((plan) => (
                        <PlanCard
                          key={plan.value}
                          active={formData.subscriptionPlan === plan.value}
                          description={plan.description}
                          title={plan.title}
                          onClick={() => updateField('subscriptionPlan', plan.value)}
                        />
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Account Status" titleStyle={popupSectionTitleStyle}>
                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#F3E5E6] px-4 py-4 transition hover:bg-[#FFF8F7]">
                      <div>
                        <p className="text-sm font-semibold text-black">Active account</p>
                        <p className="mt-1 text-sm text-[#6f5b5c]">Allow the user to sign in immediately.</p>
                      </div>
                      <input
                        checked={formData.isActive}
                        onChange={(event) => updateField('isActive', event.target.checked)}
                        className="h-5 w-5 rounded border-[#F3E5E6] text-[#BC116E] focus:ring-[#BC116E]"
                        type="checkbox"
                      />
                    </label>

                    <div className="mt-4 rounded-2xl bg-[#FFF8F7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f5b5c]">Created by</p>
                      <p className="mt-2 text-sm text-black">{creatorName}</p>
                    </div>
                  </SectionCard>

                  <SectionCard title="Profile Picture" titleStyle={popupSectionTitleStyle}>
                    <div
                      onDragLeave={() => setIsDropActive(false)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDropActive(true);
                      }}
                      onDrop={handleDrop}
                      className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-4 text-center transition ${
                        isDropActive ? 'border-[#BC116E] bg-[#FFF3FA]' : 'border-[#F3E5E6] bg-[#FFF8F7]'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profilePreview ? (
                        <img alt="Profile preview" className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-sm" src={profilePreview} />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#F3E5E6] bg-white text-[#BC116E] shadow-sm">
                          <Upload size={28} />
                        </div>
                      )}
                      <p className="mt-4 text-sm font-semibold text-black">Drop profile pic or browse</p>
                      <p className="mt-1 text-sm text-[#6f5b5c]">JPG, PNG, or GIF up to 5MB</p>
                      <input
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        type="file"
                        onChange={(event) => handleProfileFile(event.target.files?.[0] ?? null)}
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#F3E5E6] pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl px-5 py-3 transition hover:bg-[#FFF8F7]"
                  style={{ ...bodyTextStyle, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#BC116E] px-6 py-3 shadow-[0_12px_28px_rgba(18,18,18,0.08)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  style={actionButtonTextStyle}
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
      <p style={statHeadingStyle}>{title}</p>
      <div className="mt-3 flex items-end gap-2">
        <span style={statValueStyle}>{value}</span>
        <span className="pb-1 text-sm font-semibold text-[#6f5b5c]" style={{ fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif', fontWeight: 400 }}>
          {meta}
        </span>
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

function SectionCard({
  title,
  children,
  titleClassName = 'text-black',
  titleStyle,
}: {
  title: string;
  children: React.ReactNode;
  titleClassName?: string;
  titleStyle?: React.CSSProperties;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[#F3E5E6] bg-[#fffdfd] p-5">
      <h3 className={`text-lg font-semibold ${titleClassName}`} style={titleStyle}>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const popupSectionTitleStyle = {
  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  color: 'rgb(177, 14, 107)',
  fontSize: '10px',
  lineHeight: '15px',
} as const;

function Field({
  label,
  children,
  className = '',
}: {
  label: React.ReactNode;
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

function SocialLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-[#BC116E]">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function PlanCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
        active ? 'border-[#F3E5E6] bg-white' : 'border-[#F3E5E6] bg-white hover:border-[#e7c6d4]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-black">{title}</p>
          <p className="mt-1 text-sm text-[#6f5b5c]">{description}</p>
        </div>
        <div className={`mt-1 h-4 w-4 rounded-full border ${active ? 'border-[#BC116E] bg-[#BC116E]' : 'border-[#d9c8c9] bg-white'}`} />
      </div>
    </button>
  );
}