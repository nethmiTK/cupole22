'use client';

import { useEffect, useState } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

interface ProposalVendorQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  fallbackVendorId?: string;
  vendorName: string;
  vendorProfilePic?: string | null;
  vendorType?: 'proposal' | 'album';
}

export default function ProposalVendorQuickViewModal({
  isOpen,
  onClose,
  vendorId,
  fallbackVendorId,
  vendorName,
  vendorProfilePic,
  vendorType = 'proposal',
}: ProposalVendorQuickViewModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !vendorId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const idsToTry = [vendorId, fallbackVendorId].filter(Boolean) as string[];

        let loaded = null;
        for (const id of idsToTry) {
          const res = await fetch(`${API_BASE}/admin/vendor-detail/${id}?type=${vendorType}`);
          if (!res.ok) continue;
          const result = await res.json();
          if (result?.profile || result?.subscription) {
            loaded = result;
            break;
          }
        }

        setData(loaded);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, vendorId, fallbackVendorId, vendorType]);

  if (!isOpen) return null;

  const profile = data?.profile || {};
  const subscription = data?.subscription || {};

  const getExpiryDate = (createdAt?: string, duration?: number) => {
    if (!createdAt || !duration) return 'N/A';
    const date = new Date(createdAt);
    date.setDate(date.getDate() + duration);
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-rose-100 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-rose-100 bg-rose-50/70">
          <div className="flex items-center gap-3">
            {vendorProfilePic ? (
              <img
                src={vendorProfilePic}
                alt={vendorName}
                className="w-12 h-12 rounded-full object-cover border border-rose-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-gray-900">{vendorName}</h2>
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-rose-500">{vendorType} Vendor Details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-rose-100 hover:bg-white text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="py-14 text-center">
              <div className="w-10 h-10 mx-auto border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 mt-3">Loading vendor details...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Personal Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Name</span>
                    <span className="font-semibold text-gray-900 text-right">{profile?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp</span>
                    <span className="font-semibold text-gray-900 text-right">{profile?.whatsappNo || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                    <span className="font-semibold text-gray-900 text-right">{profile?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</span>
                    <span className="font-semibold text-gray-900 text-right">{profile?.address || profile?.city || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Status</span>
                    <span className="font-semibold text-gray-900 uppercase">{profile?.status || 'pending'}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Subscription Plan</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-rose-200 pb-2">
                    <span className="text-rose-600 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Plan Name</span>
                    <span className="font-semibold text-gray-900 text-right">{subscription?.planName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-rose-200 pb-2">
                    <span className="text-rose-600">Amount</span>
                    <span className="font-semibold text-gray-900 text-right">LKR {Number(subscription?.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-rose-200 pb-2">
                    <span className="text-rose-600">Duration</span>
                    <span className="font-semibold text-gray-900 text-right">{subscription?.planDetails?.duration || 0} days</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-rose-200 pb-2">
                    <span className="text-rose-600">Plan Status</span>
                    <span className="font-semibold text-gray-900 uppercase text-right">{subscription?.status || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-rose-200 pb-2">
                    <span className="text-rose-600 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {subscription?.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-rose-600">Expiry Date</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {getExpiryDate(subscription?.createdAt, subscription?.planDetails?.duration)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
