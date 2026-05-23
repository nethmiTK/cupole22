'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, LayoutTemplate, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

type TemplateRecord = {
  _id: string;
  name: string;
  presetKey: string;
  description?: string;
  accent?: string;
  slots?: unknown[];
  pages?: unknown[];
  updatedAt?: string;
};

const formatDate = (value?: string) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export default function TemplateListPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch('/admin/templates');
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load templates';
        setMessage(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    try {
      await apiFetch(`/admin/templates/${id}`, { method: 'DELETE' });
      setTemplates((t) => t.filter((x) => x._id !== id));
      toast.success('Template deleted');
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF6F6] text-[#1a1c1d]">
      <header className="border-b border-[#e1bec4] bg-[#FEF6F6]">
        <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-5 md:px-6 lg:px-8">
          <div>
            <p className="font-['Libre_Caslon_Text'] text-[30px] leading-none text-[#9b0044]">All Templates</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.26em] text-[#7a6268]">Template Library</p>
          </div>

          <Link
            href="/admin/template/new"
            className="inline-flex items-center gap-2 rounded-[0.8rem] bg-[#9b0044] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(155,0,68,0.18)] transition-opacity hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-400 px-4 py-6 md:px-6 lg:px-8">
        {message ? (
          <div className="mb-5 rounded-[0.85rem] border border-[#e1bec4] bg-[#fff8fb] px-4 py-3 text-[13px] text-[#594045]">
            {message}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-[#e1bec4] bg-[#FEF6F6] px-5 py-10 text-center text-[13px] text-[#7a6268]">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e1bec4] bg-[#FEF6F6] px-5 py-12 text-center">
            <LayoutTemplate className="mx-auto h-10 w-10 text-[#9b0044]/60" />
            <p className="mt-3 font-['Libre_Caslon_Text'] text-[24px] text-[#1a1c1d]">No templates yet</p>
            <p className="mt-2 text-[13px] text-[#7a6268]">Create your first template with pages and shape slots.</p>
            <Link
              href="/admin/template/new"
              className="mt-5 inline-flex items-center gap-2 rounded-[0.8rem] border border-[#9b0044] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b0044] transition-colors hover:bg-[#fff0f4]"
            >
              Create Template
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <article key={template._id} className="rounded-2xl border border-[#e1bec4] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-['Libre_Caslon_Text'] text-[24px] leading-none text-[#1a1c1d]">{template.name}</p>
                  <span className="rounded-full bg-[#f5dce4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b0044]">
                    {template.presetKey || 'custom'}
                  </span>
                </div>

                <p className="mt-3 min-h-10.5 text-[13px] leading-6 text-[#6b5d60]">
                  {template.description || 'No description'}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6268]">
                  <div className="rounded-[0.7rem] border border-[#efe1e5] bg-[#fff8fb] px-3 py-2">
                    {template.pages?.length || 0} Pages
                  </div>
                  <div className="rounded-[0.7rem] border border-[#efe1e5] bg-[#fff8fb] px-3 py-2">
                    {template.slots?.length || 0} Slots
                  </div>
                </div>

                <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#8c7f83]">Updated {formatDate(template.updatedAt)}</p>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/admin/template/${template._id}/book`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#9b0044] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b0044] transition-colors hover:bg-[#fff0f4]"
                  >
                    <BookOpen className="h-4 w-4" />
                    Book View
                  </Link>
                  <Link
                    href={`/admin/template/new?templateId=${template._id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#9b0044] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-95"
                  >
                    Open Builder
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(template._id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e7bfc9] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9b0044] hover:bg-[#fff0f4]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
