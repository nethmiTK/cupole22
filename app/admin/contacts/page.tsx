'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Filter, Mail, Phone, Calendar, MessageSquare, User, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ContactsPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

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

    const filteredMessages = messages.filter(msg =>
        (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Contact <span className="text-rose-600">Enquiries</span></h1>
                        <p className="text-gray-500 font-medium italic">Managing client communications and requests.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                            <span className="text-sm font-bold text-gray-700">{messages.filter(m => m.status === 'new').length} New Enquiries</span>
                        </div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone or message content..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-rose-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="text-rose-400 w-5 h-5 ml-2" />
                        <select
                            className="flex-1 px-4 py-4 bg-white border border-rose-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-bold text-gray-700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="new">🆕 New</option>
                            <option value="read">📖 Read</option>
                            <option value="replied">✅ Replied</option>
                            <option value="archived">📁 Archived</option>
                        </select>
                    </div>
                </div>

                {/* Messages Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Message List */}
                    <div className="xl:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-rose-50 animate-pulse">
                                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                                    <div className="h-3 bg-gray-50 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-50 rounded w-2/3"></div>
                                </div>
                            ))
                        ) : filteredMessages.length === 0 ? (
                            <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-rose-100 text-center">
                                <Mail className="w-12 h-12 text-rose-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest">No messages found</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <div
                                    key={msg._id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${selectedMessage?._id === msg._id
                                        ? 'bg-rose-600 border-rose-700 shadow-xl shadow-rose-200/50'
                                        : 'bg-white border-rose-50 hover:border-rose-200 hover:shadow-md'
                                        }`}
                                >
                                    {msg.status === 'new' && (
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-200"></div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 mb-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${selectedMessage?._id === msg._id ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500'
                                            }`}>
                                            {(msg.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className={`font-black tracking-tight truncate ${selectedMessage?._id === msg._id ? 'text-white' : 'text-gray-900'}`}>
                                                {msg.name}
                                            </h3>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedMessage?._id === msg._id ? 'text-rose-100' : 'text-gray-400'}`}>
                                                {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'N/A'} • {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <p className={`text-sm line-clamp-2 leading-relaxed ${selectedMessage?._id === msg._id ? 'text-rose-50' : 'text-gray-600'}`}>
                                        {msg.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Message Content View */}
                    <div className="xl:col-span-7">
                        {selectedMessage ? (
                            <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl p-8 sticky top-6 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50" />

                                <div className="relative z-10">
                                    {/* Action Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedMessage.status === 'new' ? 'bg-rose-500 text-white' :
                                                selectedMessage.status === 'read' ? 'bg-blue-500 text-white' :
                                                    selectedMessage.status === 'replied' ? 'bg-emerald-500 text-white' :
                                                        'bg-gray-500 text-white'
                                                }`}>
                                                {selectedMessage.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateStatus(selectedMessage._id, 'read')}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                title="Mark as Read"
                                            >
                                                <Clock className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(selectedMessage._id, 'replied')}
                                                className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                title="Mark as Replied"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">{selectedMessage.subject || 'General Inquiry'}</h2>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                                                <User className="w-4 h-4 text-rose-500" />
                                                <span className="text-sm font-bold text-gray-700">{selectedMessage.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                                                <Mail className="w-4 h-4 text-rose-500" />
                                                <span className="text-sm font-bold text-gray-700">{selectedMessage.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                                                <Phone className="w-4 h-4 text-rose-500" />
                                                <span className="text-sm font-bold text-gray-700">{selectedMessage.phone || 'No phone provided'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-rose-50/30 rounded-[2rem] p-8 border border-rose-100 mb-8 min-h-[200px]">
                                        <div className="flex gap-4 mb-4">
                                            <MessageSquare className="w-6 h-6 text-rose-400 mt-1" />
                                            <div className="flex-1">
                                                <p className="text-gray-700 leading-relaxed text-lg italic whitespace-pre-wrap">
                                                    "{selectedMessage.message}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Received on {new Date(selectedMessage.created_at).toLocaleString()}
                                        </p>
                                        <a
                                            href={`mailto:${selectedMessage.email}`}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Reply via Email
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center p-12">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 text-rose-300">
                                    <Mail className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Select an Enquiry</h3>
                                <p className="text-gray-400 font-medium max-w-xs mx-auto">Click on a message from the list to view its full details and take action.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
