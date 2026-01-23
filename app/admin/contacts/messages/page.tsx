'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.contacts || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-700';
      case 'read': return 'bg-blue-100 text-blue-700';
      case 'replied': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-gray-500 mt-1">Manage customer inquiries and messages</p>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500">
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-4xl mb-4 block">📭</span>
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?._id === msg._id ? 'bg-rose-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                          <span className="text-rose-600 font-semibold">
                            {msg.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{msg.name}</p>
                          <p className="text-sm text-gray-500">{msg.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(msg.status)}`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600 text-sm line-clamp-2">{msg.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-rose-600 font-bold text-2xl">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{selectedMessage.name}</h3>
                    <p className="text-gray-500">{selectedMessage.email}</p>
                  </div>
                </div>
                <hr />
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Message</h4>
                  <p className="text-gray-600">{selectedMessage.message}</p>
                </div>
                <div className="pt-4 space-y-3">
                  <textarea
                    placeholder="Type your reply..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none"
                    rows={4}
                  ></textarea>
                  <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg font-medium transition-colors">
                    Send Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">💬</span>
                  <p>Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
