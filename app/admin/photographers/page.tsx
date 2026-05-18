'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Facebook, Globe, Instagram, Linkedin, Music2, PencilLine, Trash2, Twitter, Upload, X, Youtube } from 'lucide-react';
import { getStoredUser, getStoredToken } from '@/lib/auth';

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
  bio?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  x?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
};

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
  role: 'photographer' as const,
  subscriptionPlan: 'photographer-1-year' as 'photographer-1-year' | 'client-1-year',
  isActive: true,
};

const inputClassName = 'w-full rounded-xl border border-[#F3E5E6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d9c8c9] focus:ring-4 focus:ring-[#f3e5e630]';

const popupSectionTitleStyle = {
  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  color: 'rgb(177, 14, 107)',
  fontSize: '10px',
  lineHeight: '15px',
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
  { value: 'photographer-1-year', title: 'Photographer', description: '1 year plan / Rs 5000' },
  { value: 'client-1-year', title: 'Client', description: '1 year plan / Rs 5000' },
] as const;

export default function UserManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | string | null>(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [isDropActive, setIsDropActive] = useState(false);
  const [creatorName, setCreatorName] = useState('Current admin session');
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

  const normalizeUser = (user: any): UserRow => ({
    id: user.id || user._id,
    name: user.name || user.fullName || '',
    email: user.email || '',
    role: (user.role || 'client').charAt(0).toUpperCase() + (user.role || 'client').slice(1),
    contact: user.contact || user.phone || user.phoneNumber || '',
    subscription: user.subscription || user.subscriptionPlan || '',
    status: user.status === 'active' || user.isActive ? 'Active' : 'Offline',
    avatar: user.avatar || user.profilePic || '',
    bio: user.bio || '',
    instagram: user.instagram || user.socials?.instagram || '',
    facebook: user.facebook || user.socials?.facebook || '',
    tiktok: user.tiktok || user.socials?.tiktok || '',
    x: user.x || user.socials?.x || '',
    youtube: user.youtube || user.socials?.youtube || '',
    linkedin: user.linkedin || user.socials?.linkedin || '',
    website: user.website || user.socials?.website || '',
  });

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isFormOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isFormOpen]);

  // Load creator name
  useEffect(() => {
    const storedUser = getStoredUser() as any;
    const displayName = storedUser?.name || storedUser?.fullName || storedUser?.email;
    if (displayName) setCreatorName(displayName);
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const token = getStoredToken();
      if (!token) return;

      try {
        const res = await fetch(`${apiBase}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load users');
        }

        setUsers((Array.isArray(data.users) ? data.users : []).map(normalizeUser));
      } catch (error) {
        console.error('❌ Load Users Error:', error);
      }
    };

    loadUsers();
  }, [apiBase]);

  const updateField = (field: keyof typeof initialFormState, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      bio: user.bio || '',
      role: user.role.toLowerCase() as any,
      subscriptionPlan: user.subscription.toLowerCase().includes('photographer') 
        ? 'photographer-1-year' 
        : 'client-1-year',
      profileImage: user.avatar,
      instagram: user.instagram || '',
      facebook: user.facebook || '',
      tiktok: user.tiktok || '',
      x: user.x || '',
      youtube: user.youtube || '',
      linkedin: user.linkedin || '',
      website: user.website || '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUserId(null);
    setProfilePreview('');
    setIsDropActive(false);
  };

  const handleProfileFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePreview(reader.result);
        updateField('profileImage', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  // ==================== SUBMIT TO BACKEND ====================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const token = getStoredToken();

  console.log("🔑 Token:", token ? "Exists" : "Missing");
  console.log("🌐 API URL:", `${apiBase}/admin/users`);

  if (!token) {
    alert("No token found. Please login again.");
    setLoading(false);
    return;
  }

  const payload = {
    fullName: formData.fullName,
    email: formData.email,
    password: formData.password,
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
  };

  console.log("📦 Payload being sent:", payload);

  try {
    const res = await fetch(`${apiBase}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 Response Status:", res.status);

    const responseData = await res.json();
    console.log("📥 Response Body:", responseData);

    if (!res.ok) {
      throw new Error(responseData.message || `Error ${res.status}`);
    }

    // Success
    const savedUser = normalizeUser(responseData.user || responseData);

    setUsers((prev) => {
      const existingIndex = prev.findIndex((user) => user.id === savedUser.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = savedUser;
        return next;
      }

      return [savedUser, ...prev];
    });

    alert("✅ User created successfully!");
    closeForm();

  } catch (error: any) {
    console.error("❌ Save Error:", error);
    alert(error.message || "Failed to save user");
  } finally {
    setLoading(false);
  }
};

  const handleDeleteUser = (userId: number | string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const visibleUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return [user.name, user.email, user.role, user.contact, user.subscription, user.status]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#FFF8F7] px-4 py-6 text-[#111111] md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p style={popupSectionTitleStyle}>Invite Flow</p>
            <h1 className="mt-2 text-5xl" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', fontWeight: 400 }}>
              User Management
            </h1>
            <p className="mt-1 max-w-2xl text-[#6f5b5c]" style={bodyTextStyle}>
              Manage your studio team, photographers, and client access levels.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BC116E] px-6 py-3 shadow-lg transition hover:scale-105 active:scale-95"
            style={actionButtonTextStyle}
          >
            <span className="text-xl leading-none">+</span> Add User
          </button>
        </header>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Users" value="1,284" meta="+12%" />
          <StatCard title="Active Now" value="412" meta="Live" />
          <StatCard title="Photographers" value="86" meta="/ 100 slots" />
          <div className="rounded-3xl bg-[#F3E5E6] p-5 shadow-lg">
            <p style={statHeadingStyle}>Pro Plan Usage</p>
            <div className="mt-2 text-3xl font-light" style={statValueStyle}>92% Capacity</div>
            <div className="mt-4 h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div className="h-full w-[92%] bg-black rounded-full" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-[#F3E5E6] bg-white shadow-xl">
          <div className="flex flex-col gap-4 border-b border-[#F3E5E6] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f5b5c]">⌕</span>
              <input
                type="text"
                placeholder="Filter by name, role or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-[#F3E5E6] bg-[#FFF8F7] py-3 pl-11 pr-4 text-sm focus:border-[#d9c8c9] focus:ring-4 focus:ring-[#f3e5e630]"
              />
            </div>

            <button onClick={openCreateForm} className="rounded-xl bg-[#BC116E] px-5 py-3 transition hover:bg-[#9e0e5d]" style={actionButtonTextStyle}>
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left" style={{ minWidth: '860px' }}>
              <thead className="bg-[#FFF8F7]">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-[#6f5b5c]">Full Name</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-[#6f5b5c]">Role</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-[#6f5b5c]">Contact</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-[#6f5b5c]">Subscription</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-widest text-[#6f5b5c]">Status</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-widest text-[#6f5b5c]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E5E6]">
                {visibleUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FFF8F7] transition">
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-[#6f5b5c]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5"><RoleBadge role={user.role} /></td>
                    <td className="px-5 py-5 text-sm text-[#6f5b5c]">{user.contact}</td>
                    <td className="px-5 py-5"><p className="font-semibold">{user.subscription}</p></td>
                    <td className="px-5 py-5 text-center"><StatusBadge status={user.status} /></td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditForm(user)} className="h-9 w-9 flex items-center justify-center rounded-full border border-[#F3E5E6] hover:bg-[#FFF8F7] text-[#BC116E]">
                          <PencilLine size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="h-9 w-9 flex items-center justify-center rounded-full border border-[#F3E5E6] hover:bg-[#FFF8F7] text-[#BC116E]">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationComponent />
        </div>
      </div>

      {/* ====================== CREATE / EDIT FORM ====================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-[#F3E5E6] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#F3E5E6] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#BC116E]">User Form</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {editingUserId === null ? 'Create New User' : 'Edit User'}
                </h2>
              </div>
              <button onClick={closeForm} className="h-10 w-10 flex items-center justify-center bg-[#BC116E] text-white rounded-full hover:bg-[#9e0e5d]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Left Column - Profile & Social */}
                <div className="space-y-8">
                  <SectionCard title="Profile Info" titleStyle={popupSectionTitleStyle}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Full Name">
                        <input value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} className={inputClassName} required />
                      </Field>
                      <Field label="Email Address">
                        <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputClassName} required />
                      </Field>
                      <Field label="Password">
                        <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} className={inputClassName} />
                      </Field>
                      <Field label="Phone Number">
                        <input type="tel" value={formData.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} className={inputClassName} />
                      </Field>
                      <Field label="Role">
                        <select value={formData.role} onChange={(e) => updateField('role', e.target.value)} className={inputClassName} required>
                          <option value="admin">Admin</option>
                          <option value="photographer">Photographer</option>
                          <option value="client">Client</option>
                        </select>
                      </Field>
                      <Field label="Bio" className="md:col-span-2">
                        <textarea value={formData.bio} onChange={(e) => updateField('bio', e.target.value)} className={`${inputClassName} min-h-32`} rows={4} />
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="Social Links" titleStyle={popupSectionTitleStyle}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={<SocialLabel icon={<Instagram size={16} />} text="Instagram" />}>
                        <input value={formData.instagram} onChange={(e) => updateField('instagram', e.target.value)} className={inputClassName} placeholder="username" />
                      </Field>
                      <Field label={<SocialLabel icon={<Facebook size={16} />} text="Facebook" />}>
                        <input value={formData.facebook} onChange={(e) => updateField('facebook', e.target.value)} className={inputClassName} placeholder="profile url" />
                      </Field>
                      <Field label={<SocialLabel icon={<Music2 size={16} />} text="TikTok" />}>
                        <input value={formData.tiktok} onChange={(e) => updateField('tiktok', e.target.value)} className={inputClassName} placeholder="handle or url" />
                      </Field>
                      <Field label={<SocialLabel icon={<Twitter size={16} />} text="X / Twitter" />}>
                        <input value={formData.x} onChange={(e) => updateField('x', e.target.value)} className={inputClassName} placeholder="handle or url" />
                      </Field>
                      <Field label={<SocialLabel icon={<Youtube size={16} />} text="YouTube" />}>
                        <input value={formData.youtube} onChange={(e) => updateField('youtube', e.target.value)} className={inputClassName} placeholder="channel url" />
                      </Field>
                      <Field label={<SocialLabel icon={<Linkedin size={16} />} text="LinkedIn" />}>
                        <input value={formData.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} className={inputClassName} placeholder="profile url" />
                      </Field>
                      <Field label={<SocialLabel icon={<Globe size={16} />} text="Website" />} className="md:col-span-2">
                        <input value={formData.website} onChange={(e) => updateField('website', e.target.value)} className={inputClassName} />
                      </Field>
                    </div>
                  </SectionCard>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <SectionCard title="Subscription Plan" titleStyle={popupSectionTitleStyle}>
                    <div className="space-y-3">
                      {subscriptionPlans.map((plan) => (
                        <PlanCard key={plan.value} {...plan} active={formData.subscriptionPlan === plan.value} onClick={() => updateField('subscriptionPlan', plan.value)} />
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Account Status" titleStyle={popupSectionTitleStyle}>
                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#F3E5E6] p-4 hover:bg-[#FFF8F7]">
                      <div>
                        <p className="font-semibold">Active Account</p>
                        <p className="text-sm text-[#6f5b5c]">Allow user to sign in</p>
                      </div>
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => updateField('isActive', e.target.checked)} className="h-5 w-5 text-[#BC116E]" />
                    </label>
                  </SectionCard>

                  <SectionCard title="Profile Picture" titleStyle={popupSectionTitleStyle}>
                    <div onDragOver={(e) => { e.preventDefault(); setIsDropActive(true); }} onDragLeave={() => setIsDropActive(false)} onDrop={(e) => { e.preventDefault(); setIsDropActive(false); handleProfileFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()} className={`min-h-52 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed cursor-pointer transition ${isDropActive ? 'border-[#BC116E] bg-[#FFF3FA]' : 'border-[#F3E5E6] bg-[#FFF8F7]'}`}>
                      {profilePreview ? (
                        <img src={profilePreview} alt="Preview" className="h-28 w-28 rounded-full object-cover ring-4 ring-white" />
                      ) : (
                        <div className="h-24 w-24 rounded-full border border-[#F3E5E6] bg-white flex items-center justify-center text-[#BC116E]">
                          <Upload size={32} />
                        </div>
                      )}
                      <p className="mt-4 font-semibold">Drop or click to upload</p>
                      <p className="text-sm text-[#6f5b5c]">JPG, PNG, GIF (Max 5MB)</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleProfileFile(e.target.files?.[0] ?? null)} />
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-[#F3E5E6]">
                <button type="button" onClick={closeForm} className="px-6 py-3 rounded-xl hover:bg-[#FFF8F7] font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl bg-[#BC116E] text-white font-semibold hover:scale-105 active:scale-95 transition disabled:opacity-70" style={actionButtonTextStyle}>
                  {loading ? 'Saving...' : editingUserId === null ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

 function StatCard({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <div className="rounded-3xl border border-[#F3E5E6] bg-white p-5 shadow">
      <p style={statHeadingStyle}>{title}</p>
      <div className="mt-3 flex items-end gap-2">
        <span style={statValueStyle}>{value}</span>
        <span className="pb-1 text-sm text-[#6f5b5c]">{meta}</span>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRow['role'] }) {
  return <span className="inline-flex rounded-full border border-[#F3E5E6] bg-[#FFF8F7] px-3 py-1 text-xs font-semibold">{role}</span>;
}

function StatusBadge({ status }: { status: UserRow['status'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F3E5E6] bg-[#FFF8F7] px-3 py-1 text-xs font-semibold">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />{status}
    </span>
  );
}

function SectionCard({ title, children, titleStyle }: { title: string; children: React.ReactNode; titleStyle?: React.CSSProperties }) {
  return (
    <div className="rounded-[22px] border border-[#F3E5E6] bg-[#fffdfd] p-6">
      <h3 className="text-lg font-semibold" style={titleStyle}>{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-black">{label}</span>
      {children}
    </label>
  );
}

function SocialLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-[#BC116E]">{icon}</span>
      {text}
    </span>
  );
}

function PlanCard({ title, description, active, onClick }: { title: string; description: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-2xl border p-4 text-left transition-all ${active ? 'border-[#BC116E] bg-white shadow-sm' : 'border-[#F3E5E6] hover:border-[#e7c6d4]'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-[#6f5b5c]">{description}</p>
        </div>
        <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#BC116E] bg-[#BC116E]' : 'border-gray-300'}`}>
          {active && <div className="h-2.5 w-2.5 bg-white rounded-full" />}
        </div>
      </div>
    </button>
  );
}