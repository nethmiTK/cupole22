'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Filter, Mail, Phone, Calendar, User, Trash2, CheckCircle, Eye, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ContactsPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchMessages();
    }, [statusFilter]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const url = new URL(`${API_URL}/contact`);
            if (statusFilter !== 'all') url.searchParams.append('status', statusFilter);

            const res = await fetch(url.toString());
            if (res.ok) {
                const data = await res.json();
                setMessages(data.contacts || []);
            }
        } catch (error) {
            console.error('Failed to fetch contact messages', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact_id: id, status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                fetchMessages();
                if (selectedMessage?._id === id) {
                    setSelectedMessage({ ...selectedMessage, status: newStatus });
                }
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this enquiry?')) return;

        try {
            const res = await fetch(`${API_URL}/contact/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Enquiry deleted successfully');
                setSelectedMessage(null);
                fetchMessages();
            } else {
                toast.error('Failed to delete enquiry');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Error deleting enquiry');
        }
    };

    const filteredMessages = messages.filter(msg =>
        (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

    const getWhatsAppLink = (phone: string, name: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = encodeURIComponent(`Hello ${name}, I'm following up on your enquiry with Memo Album.`);
        return `https://wa.me/${cleanPhone}?text=${message}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-rose-500 text-white shadow-rose-200';
            case 'read': return 'bg-blue-500 text-white shadow-blue-200';
            case 'replied': return 'bg-emerald-500 text-white shadow-emerald-200';
            case 'archived': return 'bg-gray-500 text-white shadow-gray-200';
            default: return 'bg-gray-400 text-white';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Contact <span className="text-rose-600">Management</span>
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">View and respond to all customer enquiries from one place.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-rose-100 flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                            </div>
                            <span className="text-xs font-bold text-gray-700">
                                {messages.filter(m => m.status === 'new').length} New Enquiries
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters & Actions Bar */}
                <div className="bg-white p-4 rounded-[2rem] border border-rose-50 shadow-sm flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name, email, subject..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:bg-white transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative min-w-[160px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                className="w-full pl-9 pr-8 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:bg-white transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="new">🆕 New</option>
                                <option value="read">📖 Read</option>
                                <option value="replied">✅ Replied</option>
                                <option value="archived">📁 Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-[2rem] border border-rose-50 shadow-xl overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Subject & Message</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse border-b border-gray-50">
                                            <td className="px-6 py-4"><div className="h-10 w-10 bg-gray-100 rounded-full mb-2"></div><div className="h-3 w-24 bg-gray-50 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-50 rounded mb-2"></div><div className="h-3 w-64 bg-gray-50 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-50 rounded-full"></div></td>
                                            <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-50 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-50 rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
                                                    <Mail className="w-8 h-8 text-rose-200" />
                                                </div>
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No entries found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((msg) => (
                                        <tr
                                            key={msg._id}
                                            className="group hover:bg-rose-50/30 transition-colors border-b border-gray-50 cursor-pointer"
                                            onClick={() => setSelectedMessage(msg)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                        {(msg.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{msg.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-medium">{msg.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="font-bold text-gray-800 text-sm truncate">{msg.subject || 'No Subject'}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1 italic">{msg.message}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(msg.status)}`}>
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-700">
                                                    {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-rose-100 rounded-lg text-rose-400 hover:text-rose-600 transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredMessages.length > itemsPerPage && (
                        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredMessages.length)} of {filteredMessages.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-rose-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setCurrentPage(i + 1); }}
                                            className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-rose-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-400'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-rose-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide-over Modal for Message Content */}
            <AnimatePresence>
                {selectedMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end"
                        onClick={() => setSelectedMessage(null)}
                    >
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-rose-200">
                                        {(selectedMessage.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedMessage.name}</h2>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{selectedMessage.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-3 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-2xl transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4 px-1">Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Phone size={12} className="text-rose-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Phone</span>
                                            </div>
                                            <p className="font-bold text-gray-800 text-sm">{selectedMessage.phone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Calendar size={12} className="text-rose-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Sent Date</span>
                                            </div>
                                            <p className="font-bold text-gray-800 text-sm">
                                                {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4 px-1">Enquiry</h3>
                                    <div className="bg-white p-6 rounded-[2rem] border-2 border-rose-50 shadow-inner">
                                        <h4 className="text-lg font-black text-gray-900 mb-3">{selectedMessage.subject || 'Wedding Enquiry'}</h4>
                                        <div className="w-8 h-1 bg-rose-200 rounded-full mb-6"></div>
                                        <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap font-medium h-max min-h-[150px]">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4 px-1">Actions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => updateStatus(selectedMessage._id, 'read')}
                                            className="px-5 py-3 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <Eye size={16} /> Mark as Read
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedMessage._id, 'replied')}
                                            className="px-5 py-3 bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Mark as Replied
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedMessage._id, 'archived')}
                                            className="px-5 py-3 bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <Trash2 size={16} /> Archive
                                        </button>
                                        <button
                                            onClick={() => deleteMessage(selectedMessage._id)}
                                            className="px-5 py-3 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <Trash2 size={16} /> Delete Forever
                                        </button>
                                    </div>
                                </section>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-gray-100 bg-gray-50/50 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    
                                    <a
                                        href={getWhatsAppLink(selectedMessage.phone, selectedMessage.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => updateStatus(selectedMessage._id, 'replied')}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] border border-emerald-400/20"
                                    >
                                        <MessageCircle size={18} /> 
                                        <span>WhatsApp</span>
                                    </a>
                                </div>
                                <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest pt-2">
                                    Secured Communication Portal
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #fecdd3;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #fb7185;
                }
            `}</style>
        </AdminLayout>
    );
}
