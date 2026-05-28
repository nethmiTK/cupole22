'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';
import { AUTH_KEYS, getStoredUser } from '@/lib/auth';

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  profilePic: string;
  role?: string;
  status?: string;
};

const readStoredProfile = () => {
  if (typeof window === 'undefined') return null;

  const localAdminUserRaw = window.localStorage.getItem(AUTH_KEYS.user);
  const legacyUserRaw = window.localStorage.getItem('user');
  const legacyUserDataRaw = window.localStorage.getItem('userData');

  const parse = (value: string | null) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  return parse(localAdminUserRaw) || parse(legacyUserRaw) || parse(legacyUserDataRaw) || getStoredUser();
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const currentUser = useMemo(() => readStoredProfile(), []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.id) {
        setMessage('No admin session found. Please log in again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await apiFetch(`/admin/users/${currentUser.id}`);
        const user = data?.user;

        if (!user) {
          throw new Error('Profile not found');
        }

        const nextProfile: AdminProfile = {
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          profilePic: user.profilePic || '',
          role: user.role || currentUser?.role,
          status: user.status || currentUser?.status,
        };

        setProfile(nextProfile);
        setName(nextProfile.name);
        setPhone(nextProfile.phone);
        setBio(nextProfile.bio);
        setProfilePic(nextProfile.profilePic);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
        setMessage(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser?.id, currentUser?.role, currentUser?.status]);

  const saveProfile = async () => {
    if (!profile?.id) {
      toast.error('Profile is not ready yet');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const data = await apiFetch(`/admin/users/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          phone,
          bio,
          profilePic,
        }),
      });

      const updated = data?.user;
      if (!updated) {
        throw new Error('Profile update failed');
      }

      const normalizedProfile = {
        ...profile,
        name: updated.name || name,
        phone: updated.phone || phone,
        bio: updated.bio || bio,
        profilePic: updated.profilePic || profilePic,
      };

      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(normalizedProfile);
        window.localStorage.setItem(AUTH_KEYS.user, serialized);
        window.localStorage.setItem('adminUser', serialized);
        window.localStorage.setItem('user', serialized);
        window.localStorage.setItem('userData', serialized);
        window.dispatchEvent(new Event('profile-updated'));
      }

      setProfile(normalizedProfile);
      toast.success('Profile updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-0px)] bg-[#FEF6F6] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#f0dfe7] bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7f8a]">Admin Profile</p>
          <h1 className="mt-3 font-['Libre_Caslon_Text'] text-3xl font-bold text-[#4a2e39] md:text-4xl">Profile</h1>
          <p className="mt-4 text-sm text-[#7d6873]">
            Edit the logged-in admin account here. Changes are saved to the backend and pushed into local storage so the navbar avatar updates immediately.
          </p>

          {isLoading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#ebd6de] bg-[#fff8fb] px-4 py-6 text-sm text-[#7d6873]">Loading profile...</div>
          ) : (
            <div className="mt-6 space-y-4">
              <label className="block space-y-2 text-sm text-[#4a2e39]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7d81]">Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-[#e6cfd7] bg-[#fffdfd] px-4 py-3 outline-none transition focus:border-[#9b0044]" />
              </label>

              <label className="block space-y-2 text-sm text-[#4a2e39]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7d81]">Phone</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-2xl border border-[#e6cfd7] bg-[#fffdfd] px-4 py-3 outline-none transition focus:border-[#9b0044]" />
              </label>

              <label className="block space-y-2 text-sm text-[#4a2e39]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7d81]">Bio</span>
                <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={5} className="w-full rounded-2xl border border-[#e6cfd7] bg-[#fffdfd] px-4 py-3 outline-none transition focus:border-[#9b0044]" />
              </label>

              <label className="block space-y-2 text-sm text-[#4a2e39]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7d81]">Profile Image URL</span>
                <input value={profilePic} onChange={(event) => setProfilePic(event.target.value)} className="w-full rounded-2xl border border-[#e6cfd7] bg-[#fffdfd] px-4 py-3 outline-none transition focus:border-[#9b0044]" />
              </label>

              <button
                type="button"
                onClick={saveProfile}
                disabled={isSaving || isLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-[#9b0044] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>

              {message ? <div className="rounded-2xl border border-[#ebd6de] bg-[#fff8fb] px-4 py-3 text-sm text-[#7d6873]">{message}</div> : null}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-[#f0dfe7] bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7f8a]">Preview</p>
          <div className="mt-4 overflow-hidden rounded-3xl border border-[#ead5dc] bg-[#fff8fb] p-5">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border border-[#e6cfd7] bg-white">
                <img src={profilePic || profile?.profilePic || 'https://via.placeholder.com/160'} alt="Profile preview" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-['Libre_Caslon_Text'] text-2xl text-[#4a2e39]">{name || profile?.name || 'Admin User'}</p>
                <p className="mt-1 text-sm text-[#7d6873]">{profile?.email || currentUser?.email || 'admin@example.com'}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9b7f8a]">{profile?.role || currentUser?.role || 'admin'}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#f0dfe7] bg-white px-4 py-4 text-sm text-[#6f5b65]">
              <p>{bio || 'Add a short bio so the admin profile page has real data and the navbar avatar can refresh from the backend.'}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#9b7f8a]">{phone || 'No phone number yet'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}