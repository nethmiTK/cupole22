'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, CreditCard, Mail, Phone, MapPin, ExternalLink, Calendar, Package, User } from 'lucide-react';

interface VendorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
    vendorType: 'album' | 'proposal';
}

export default function VendorDetailModal({
    isOpen,
    onClose,
    vendorId,
    vendorName,
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/vendor-detail/${vendorId}?type=${vendorType}`);
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

    const isCurrentActive = (vendorType === 'proposal' ? data?.profile?.adStatus : data?.profile?.status) === 'active';

    const handleUpdateSubscription = async (status: 'active' | 'rejected') => {
        if (!data?.subscription?._id) return;
        try {
            setActionLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/vendor/subscription/${data.subscription._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                // If approving subscription, also activate the profile automatically
                if (status === 'active' && !isCurrentActive) {
                    await handleToggleActiveStatus();
                }
                alert(`Subscription ${status} successfully! ${status === 'active' ? 'Account also activated.' : ''}`);
                fetchDetails();
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
            const currentStatus = vendorType === 'proposal' ? data.profile.adStatus : data.profile.status;
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            let url = '';
            let body: any = {};

            if (vendorType === 'proposal') {
                url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/marriage-proposals/update`;
                body = { proposalId: data.profile._id, adStatus: newStatus };
            } else {
                url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/album-vendors/${data.profile._id}/status`;
                body = { status: newStatus };
            }

            const res = await fetch(url, {
                method: vendorType === 'proposal' ? 'PUT' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(`${vendorType === 'proposal' ? 'Ad' : 'Vendor'} ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
                fetchDetails();
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-900/40 backdrop-blur-md transition-opacity">
            <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(225,29,72,0.25)] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-rose-100/50">
                {/* Header */}
                <div className="flex items-center justify-between px-10 py-7 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-white">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-rose-200 rotate-2">
                            {vendorName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{vendorName}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${(vendorType === 'proposal' ? data?.profile?.adStatus : data?.profile?.status) === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.2em]">{vendorType} Vendor • {(vendorType === 'proposal' ? data?.profile?.adStatus : data?.profile?.status) === 'active' ? 'LIVE' : 'PAUSED'}</p>
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
                                                        <span className="text-sm text-gray-400 font-medium">Ad Code</span>
                                                        <span className="text-sm font-mono font-bold text-rose-600">{profile?.adCode}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                                        <span className="text-sm text-gray-400 font-medium">Full Name</span>
                                                        <span className="text-sm font-bold text-gray-800">{profile?.privateInfo?.firstName} {profile?.privateInfo?.lastName}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-3">
                                                        <span className="text-sm text-gray-400 font-medium">Contact</span>
                                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2"><Phone className="w-3 h-3" /> {profile?.privateInfo?.whatsappContact}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-400 font-medium">Location</span>
                                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2"><MapPin className="w-3 h-3" /> {profile?.publicInfo?.residentTown}</span>
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

                                {/* Column 2: Payment Receipt */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                        <h3 className="text-lg font-bold text-gray-900">Payment Verification</h3>
                                    </div>
                                    {subscription?.paymentSlip ? (
                                        <div className="group relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gray-200 aspect-[3/4]">
                                            <img
                                                src={(() => {
                                                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
                                                    const slipPath = subscription.paymentSlip.startsWith('/') ? subscription.paymentSlip : `/${subscription.paymentSlip}`;
                                                    return subscription.paymentSlip.startsWith('http') ? subscription.paymentSlip : `${baseUrl}${slipPath}`;
                                                })()}
                                                alt="Payment Slip"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                                <p className="text-white text-xs font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">Official Receipt Copy</p>
                                                <a
                                                    href={(() => {
                                                        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
                                                        const slipPath = subscription.paymentSlip.startsWith('/') ? subscription.paymentSlip : `/${subscription.paymentSlip}`;
                                                        return subscription.paymentSlip.startsWith('http') ? subscription.paymentSlip : `${baseUrl}${slipPath}`;
                                                    })()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-rose-50 transition-colors transform hover:scale-110 active:scale-95"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 rounded-3xl h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-300">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <CreditCard className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h4 className="text-gray-900 font-bold mb-2">No Receipt Found</h4>
                                            <p className="text-sm text-gray-500 px-4">The vendor has not uploaded a payment slip for this subscription plan yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Actions - THEMED ROSE/WHITE/GOLD (NO BLACK) */}
                            <section className="bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] p-10 border-2 border-rose-100 shadow-xl relative overflow-hidden group">
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -mr-32 -mb-32"></div>
                                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl shadow-lg border border-rose-50 mb-2">
                                            <CheckCircle size={32} className="text-rose-500" />
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Admin Control Panel</h3>
                                        <p className="text-gray-500 font-medium max-w-lg">Manage subscription lifecycle and public visibility for this partner.</p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-6 w-full max-w-2xl">
                                        {subscription?.status !== 'active' ? (
                                            <div className="flex flex-col items-center gap-4 w-full">
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleUpdateSubscription('active')}
                                                    className="w-full md:w-auto px-16 py-6 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_50px_-10px_rgba(225,29,72,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 group animate-pulse hover:animate-none"
                                                >
                                                    <CheckCircle size={28} className="group-hover:scale-110 transition-transform" />
                                                    VERIFY PAYMENT & GO LIVE
                                                </button>
                                                {subscription?.status === 'pending' && (
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={() => handleUpdateSubscription('rejected')}
                                                        className="text-red-400 hover:text-red-600 font-bold text-sm uppercase tracking-widest transition-colors"
                                                    >
                                                        Reject Payment Slip
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 w-full">
                                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">MANAGE VISIBILITY</p>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={handleToggleActiveStatus}
                                                    className={`w-full md:w-auto px-16 py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isCurrentActive
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-2 border-amber-200'
                                                            : 'bg-green-600 hover:bg-green-700 text-white shadow-[0_20px_50px_-10px_rgba(22,163,74,0.4)]'
                                                        }`}
                                                >
                                                    {isCurrentActive ? <XCircle size={28} /> : <CheckCircle size={28} />}
                                                    {isCurrentActive ? 'PAUSE ACCOUNT' : 'RESUME ACCOUNT / GO LIVE'}
                                                </button>
                                            </div>
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
