'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, CreditCard, Mail, Phone, MapPin, ExternalLink, Calendar, Package, User } from 'lucide-react';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');

interface VendorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
    vendorId: string;
    vendorName: string;
    vendorProfilePic?: string | null;
    vendorType: 'album' | 'proposal';
}

export default function VendorDetailModal({
    isOpen,
    onClose,
    onRefresh,
    vendorId,
    vendorName,
    vendorProfilePic,
    vendorType
}: VendorDetailModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen && vendorId) {
            fetchDetails();
        }
    }, [isOpen, vendorId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/admin/vendor-detail/${vendorId}?type=${vendorType}`);
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (err) {
            console.error('Failed to fetch details:', err);
        } finally {
            setLoading(false);
        }
    };

    const isCurrentActive = data?.profile?.status === 'active';

    const handleUpdateSubscription = async (status: 'active' | 'rejected') => {
        if (!data?.subscription?._id) return;
        try {
            setActionLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/vendor/subscription/${data.subscription._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                alert(`Subscription ${status} successfully! ${status === 'active' ? 'Vendor account is now ACTIVE.' : ''}`);
                fetchDetails();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            console.error('Failed to update subscription:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActiveStatus = async () => {
        if (!data?.profile?._id) return;
        try {
            setActionLoading(true);
            const currentStatus = data.profile.status;
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            let url = '';
            let body: any = {};

            if (vendorType === 'proposal') {
                url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/admin/proposal-vendors/${data.profile._id}/status`;
                body = { status: newStatus };
            } else {
                url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/album-vendors/${data.profile._id}/status`;
                body = { status: newStatus };
            }

            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(`Vendor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
                fetchDetails();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            console.error('Failed to toggle status:', err);
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    const subscription = data?.subscription;
    const profile = data?.profile;
    const counts = data?.counts;

    // Calculate Expiry Date based on duration
    const getExpiryDate = (createdAt: string, duration?: number) => {
        if (!duration) return 'N/A';
        const date = new Date(createdAt);
        date.setDate(date.getDate() + duration);
        return date.toLocaleDateString(undefined, { dateStyle: 'long' });
    };

    const profileStatus = data?.profile?.status;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-900/40 backdrop-blur-md transition-opacity">
            <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(225,29,72,0.25)] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-rose-100/50">
                {/* Header */}
                <div className="flex items-center justify-between px-10 py-7 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white">
                    <div className="flex items-center gap-5">
                        {vendorProfilePic ? (
                            <img
                                src={vendorProfilePic}
                                alt={vendorName}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-200 shadow-xl"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-rose-200">
                                <User className="w-7 h-7" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{vendorName}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${profileStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.2em]">{vendorType} Vendor • {profileStatus === 'active' ? 'LIVE' : 'PENDING / PAUSED'}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-rose-300 hover:text-rose-600 border border-rose-50 bg-white shadow-sm active:scale-90">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 font-medium">Fetching secure data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Top Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="p-2 bg-white rounded-lg shadow-sm"><Package className="w-5 h-5 text-rose-600" /></span>
                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Inventory</span>
                                    </div>
                                    <p className="text-xs text-rose-600 font-medium">{vendorType === 'album' ? 'Total Albums' : 'Total Ads'}</p>
                                    <p className="text-3xl font-black text-rose-900">{vendorType === 'album' ? counts?.albums : counts?.ads}</p>
                                </div>

                                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="p-2 bg-white rounded-lg shadow-sm"><CreditCard className="w-5 h-5 text-blue-600" /></span>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Status</span>
                                    </div>
                                    <p className="text-xs text-blue-600 font-medium">Subscription status</p>
                                    <p className="text-3xl font-black text-blue-900 uppercase">{subscription?.status || 'None'}</p>
                                </div>

                                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="p-2 bg-white rounded-lg shadow-sm"><Calendar className="w-5 h-5 text-amber-600" /></span>
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">Timeline</span>
                                    </div>
                                    <p className="text-xs text-amber-600 font-medium">Plan duration</p>
                                    <p className="text-3xl font-black text-amber-900">{subscription?.planDetails?.duration || 0} <span className="text-sm font-bold">DAYS</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Column 1: Info */}
                                <div className="space-y-8">
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-6 bg-rose-600 rounded-full"></div>
                                            <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4 shadow-inner">
                                            {vendorType === 'proposal' ? (
                                                <>
                                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                                        <span className="text-sm text-gray-400 font-medium">Business Name</span>
                                                        <span className="text-sm font-bold text-gray-800">{profile?.name || '—'}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                                        <span className="text-sm text-gray-400 font-medium">WhatsApp</span>
                                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2"><Phone className="w-3 h-3" /> {profile?.whatsappNo || '—'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-400 font-medium">Account Status</span>
                                                        <span className={`text-sm font-bold ${profile?.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>{profile?.status?.toUpperCase() || 'PENDING'}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                                        <span className="text-sm text-gray-400 font-medium">Business Name</span>
                                                        <span className="text-sm font-bold text-gray-800">{profile?.name}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                                        <span className="text-sm text-gray-400 font-medium">Email Address</span>
                                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2"><Mail className="w-3 h-3" /> {profile?.email}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                                        <span className="text-sm text-gray-400 font-medium">WhatsApp</span>
                                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2"><Phone className="w-3 h-3" /> {profile?.whatsappNo}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-400 font-medium">City</span>
                                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2"><MapPin className="w-3 h-3" /> {profile?.city}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </section>

                                    {/* Vendor Login Credentials */}
                                    {data?.vendorCredentials && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                                <h3 className="text-lg font-bold text-gray-900">Vendor Login Credentials</h3>
                                            </div>
                                            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 space-y-4 shadow-inner">
                                                <div className="flex justify-between border-b border-indigo-200 pb-3">
                                                    <span className="text-sm text-indigo-400 font-medium">Email</span>
                                                    <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                        <Mail className="w-3 h-3" /> {data.vendorCredentials.email || '—'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-indigo-200 pb-3">
                                                    <span className="text-sm text-indigo-400 font-medium">Username</span>
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {data.vendorCredentials.username || '—'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-indigo-400 font-medium">Password</span>
                                                    <span className="text-sm font-mono font-bold text-gray-800 bg-white px-3 py-1 rounded-lg border border-indigo-200 select-all">
                                                        {data.vendorCredentials.plainPassword || '(not available — registered before this feature)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-2 h-7 bg-rose-500 rounded-full shadow-lg shadow-rose-200"></div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Requested Plan Details</h3>
                                        </div>
                                        <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-[2rem] shadow-xl p-8 text-white relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl -mr-20 -mt-20 group-hover:bg-white/15 transition-colors"></div>
                                            <div className="relative z-10">
                                                <div className="pb-6 border-b border-white/20 mb-6 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-1">Selected Package</p>
                                                        <p className="text-3xl font-black tracking-tight">{subscription?.planName || 'NO PLAN SELECTED'}</p>
                                                    </div>
                                                    <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/30 font-black text-sm flex flex-col items-center">
                                                        <span className="text-[8px] opacity-60">DURATION</span>
                                                        {subscription?.planDetails?.duration || 0} DAYS
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                                        <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1">Submission Date</p>
                                                        <p className="text-sm font-bold">{subscription ? new Date(subscription.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}</p>
                                                    </div>
                                                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-right">
                                                        <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1">Estimated Expiry</p>
                                                        <p className="text-sm font-black text-white">{subscription ? getExpiryDate(subscription.createdAt, subscription.planDetails?.duration) : 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-8 bg-white text-rose-600 p-6 rounded-3xl shadow-2xl flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Amount to be Verified</p>
                                                        <p className="text-3xl font-black">LKR {subscription?.amount?.toLocaleString() || 0}.00</p>
                                                    </div>
                                                    {subscription?.status === 'pending' && (
                                                        <button
                                                            disabled={actionLoading}
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateSubscription('active'); }}
                                                            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-rose-200 transition-all hover:scale-105 active:scale-95 animate-pulse hover:animate-none"
                                                        >
                                                            ACTIVATE PLAN NOW
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Column 2: Payment Receipt / Registration Slip */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                        <h3 className="text-lg font-bold text-gray-900">Payment Verification</h3>
                                    </div>
                                    {(() => {
                                        // Use subscription paymentSlip first, fallback to profile slipPhoto (registration slip)
                                        const slipSource = subscription?.paymentSlip || profile?.slipPhoto;
                                        if (slipSource) {
                                            const slipUrl = (() => {
                                                if (slipSource.startsWith('http')) return slipSource;
                                                const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
                                                const slipPath = slipSource.startsWith('/') ? slipSource : `/${slipSource}`;
                                                return `${baseUrl}${slipPath}`;
                                            })();
                                            return (
                                                <div className="group relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gray-200 aspect-[3/4]">
                                                    <img
                                                        src={slipUrl}
                                                        alt="Payment Slip"
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                                        <p className="text-white text-xs font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                                            {subscription?.paymentSlip ? 'Official Receipt Copy' : 'Registration Slip'}
                                                        </p>
                                                        <a
                                                            href={slipUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-rose-50 transition-colors transform hover:scale-110 active:scale-95"
                                                        >
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="bg-gray-100 rounded-3xl h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-300">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                                    <CreditCard className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h4 className="text-gray-900 font-bold mb-2">No Receipt Found</h4>
                                                <p className="text-sm text-gray-500 px-4">The vendor has not uploaded a payment slip or registration slip yet.</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Recent Enquiries for this Vendor */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                    <h3 className="text-lg font-bold text-gray-900">Recent Enquiries</h3>
                                </div>
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[400px]">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                                        <span>Message Content</span>
                                        <span>Actions</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {data?.messages && data.messages.length > 0 ? (
                                            data.messages.map((msg: any, i: number) => (
                                                <div key={i} className="p-4 border-b border-gray-50 hover:bg-rose-50/20 transition-all flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-rose-500 text-xs shadow-inner">
                                                        {msg.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{msg.name}</p>
                                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                                {new Date(msg.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-bold mb-2 truncate uppercase tracking-widest">Subject: {msg.subject || 'General Enquiry'}</p>
                                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">"{msg.message}"</p>
                                                    </div>
                                                    <button
                                                        onClick={() => window.location.href = '/admin/contacts'}
                                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Go to full conversation"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center">
                                                <Mail className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No enquiries yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Admin Actions — Clean & Compact */}
                            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                    <div className="w-1.5 h-5 bg-rose-500 rounded-full"></div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Admin Actions</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {/* Subscription status display */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="text-xs text-gray-500 font-medium">Subscription</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${subscription?.status === 'active' ? 'bg-green-100 text-green-700' :
                                            subscription?.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                            {subscription?.status ? subscription.status.toUpperCase() : 'NONE'}
                                        </span>
                                    </div>

                                    {/* Profile status display */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="text-xs text-gray-500 font-medium">Profile Visibility</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCurrentActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {isCurrentActive ? 'LIVE' : 'HIDDEN'}
                                        </span>
                                    </div>

                                    <div className="pt-2 space-y-2">
                                        {/* Verify & Activate */}
                                        {subscription?.status === 'pending' && (
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateSubscription('active')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-rose-200"
                                            >
                                                <CheckCircle size={16} />
                                                Verify Payment & Activate
                                            </button>
                                        )}

                                        {/* Reject */}
                                        {subscription?.status === 'pending' && (
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateSubscription('rejected')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 border border-red-100"
                                            >
                                                <XCircle size={16} />
                                                Reject Payment Slip
                                            </button>
                                        )}

                                        {/* Toggle active if subscription is active */}
                                        {subscription?.status === 'active' && (
                                            <button
                                                disabled={actionLoading}
                                                onClick={handleToggleActiveStatus}
                                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 ${isCurrentActive
                                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100'
                                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200'
                                                    }`}
                                            >
                                                {isCurrentActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                {isCurrentActive ? 'Pause Account' : 'Resume & Go Live'}
                                            </button>
                                        )}

                                        {/* No subscription — allow direct activation */}
                                        {!subscription && (
                                            <>
                                                <div className="text-center py-2 text-xs text-gray-400">
                                                    No subscription found.
                                                </div>
                                                {!isCurrentActive && (
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={handleToggleActiveStatus}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-green-200"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Activate Vendor
                                                    </button>
                                                )}
                                                {isCurrentActive && (
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={handleToggleActiveStatus}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        <XCircle size={16} />
                                                        Pause Account
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Footer - NO BLACK */}
                <div className="px-10 py-6 border-t border-rose-100 bg-rose-50/30 flex justify-between items-center">
                    <p className="text-xs text-rose-300 font-bold uppercase tracking-widest">Confidential Admin Panel • CoupleCanvas Private</p>
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-gray-300 transition-all active:scale-95"
                    >
                        CLOSE DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
}
