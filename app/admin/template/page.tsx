'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, LayoutTemplate, Plus, Search } from 'lucide-react';
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
  usedByAlbums?: number;
};

function TemplateSkeletonCard() {
  return (
    <article className="rounded-3xl border border-[#e1bec4] bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="h-6 w-32 animate-pulse rounded-full bg-[#f4d9df]" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-[#f4d9df]" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#f6e4e8]" />
        <div className="h-4 w-3/5 animate-pulse rounded-full bg-[#f6e4e8]" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="h-10 animate-pulse rounded-xl bg-[#fff4f7]" />
        <div className="h-10 animate-pulse rounded-xl bg-[#fff4f7]" />
        <div className="h-10 animate-pulse rounded-xl bg-[#fff4f7]" />
      </div>

      <div className="mt-4 h-3 w-1/2 animate-pulse rounded-full bg-[#f6e4e8]" />

      <div className="mt-4 flex items-center gap-2">
        <div className="h-9 flex-1 animate-pulse rounded-xl bg-[#f6e4e8]" />
        <div className="h-9 flex-1 animate-pulse rounded-xl bg-[#f6e4e8]" />
        <div className="h-9 w-20 animate-pulse rounded-xl bg-[#f6e4e8]" />
      </div>
    </article>
  );
}

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
  const [loadNonce, setLoadNonce] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const accentFallback = '#9b0044';

  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.presetKey?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch('/admin/templates');
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load templates';
        setMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [loadNonce]);

  useEffect(() => {
    const refreshTemplates = () => setLoadNonce((value) => value + 1);

    window.addEventListener('focus', refreshTemplates);
    window.addEventListener('pageshow', refreshTemplates);
    document.addEventListener('visibilitychange', refreshTemplates);

    return () => {
      window.removeEventListener('focus', refreshTemplates);
      window.removeEventListener('pageshow', refreshTemplates);
      document.removeEventListener('visibilitychange', refreshTemplates);
    };
  }, []);

  const handleDelete = async (id: string, usedByAlbums?: number) => {
    if (usedByAlbums && usedByAlbums > 0) {
      setMessage(`Cannot delete this template. It is currently used by ${usedByAlbums} album book${usedByAlbums > 1 ? 's' : ''}.`);
      return;
    }
    
    if (!confirm('Delete this template? This cannot be undone.')) return;
    try {
      const response = await apiFetch(`/admin/templates/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (!response.ok) {
        setMessage(result.message || 'Failed to delete template');
        return;
      }
      
      setTemplates((t) => t.filter((x) => x._id !== id));
      setMessage('Template deleted successfully');
    } catch (err) {
      setMessage('Failed to delete template');
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF4F5] text-[#1a1c1d]">
      <header className="border-b border-[#e1bec4]/70 bg-[#FEF4F5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-400 flex-col gap-4 px-4 py-6 md:flex-row md:items-end md:justify-between md:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#B10E6B]">Template save</p>
            <h1 className="font-['Libre_Caslon_Text'] text-[32px] leading-none text-[#B10E6B] md:text-[40px]">Template Library</h1>
            <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#6b5d60]">
              Create templates with frames, shape slots, and accent colors. The same accent is saved to the database and shown in the book preview.
            </p>
          </div>

          <Link
            href="/admin/template/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B10E6B] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(177,14,107,0.18)] transition-opacity hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-400 px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B10E6B]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, description, or preset..."
              className="w-full rounded-xl border border-[#e1bec4] bg-white py-3 pl-11 pr-4 text-[13px] text-[#1a1c1d] placeholder:text-[#8c7f83] shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all focus:border-[#B10E6B] focus:shadow-[0_0_0_3px_rgba(177,14,107,0.12)] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a6268]">
            <span className="rounded-full bg-[#fff8fb] px-3 py-2 border border-[#f0dde3]">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'Template' : 'Templates'}
            </span>
          </div>
        </div>

        {message ? (
          <div className="mb-5 rounded-2xl border border-[#e1bec4] bg-[#fff8fb] px-4 py-3 text-[13px] text-[#594045] shadow-[0_8px_22px_rgba(0,0,0,0.03)]">
            {message}
          </div>
        ) : null}

        {isLoading && templates.length === 0 ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-[#e1bec4] bg-white px-5 py-8 shadow-[0_16px_45px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="h-3 w-32 animate-pulse rounded-full bg-[#f5dce4]" />
                  <div className="mt-3 h-8 w-64 animate-pulse rounded-full bg-[#f6e4e8]" />
                  <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-[#f8edf0]" />
                </div>
                <div className="h-11 w-40 animate-pulse rounded-xl bg-[#f6e4e8]" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <TemplateSkeletonCard />
              <TemplateSkeletonCard />
              <TemplateSkeletonCard />
              <TemplateSkeletonCard />
              <TemplateSkeletonCard />
              <TemplateSkeletonCard />
            </div>
          </div>
        ) : filteredTemplates.length === 0 && searchQuery ? (
          <div className="rounded-3xl border border-dashed border-[#e1bec4] bg-white px-5 py-12 text-center shadow-[0_16px_45px_rgba(0,0,0,0.04)]">
            <Search className="mx-auto h-10 w-10 text-[#B10E6B]/60" />
            <p className="mt-3 font-['Libre_Caslon_Text'] text-[24px] text-[#1a1c1d]">No templates found</p>
            <p className="mt-2 text-[13px] text-[#7a6268]">Try adjusting your search query or create a new template.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#B10E6B] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B10E6B] transition-colors hover:bg-[#fff0f4]"
            >
              Clear Search
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#e1bec4] bg-white px-5 py-12 text-center shadow-[0_16px_45px_rgba(0,0,0,0.04)]">
            <LayoutTemplate className="mx-auto h-10 w-10 text-[#B10E6B]/60" />
            <p className="mt-3 font-['Libre_Caslon_Text'] text-[24px] text-[#1a1c1d]">No templates yet</p>
            <p className="mt-2 text-[13px] text-[#7a6268]">Create your first template with pages and shape slots.</p>
            <Link
              href="/admin/template/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#B10E6B] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B10E6B] transition-colors hover:bg-[#fff0f4]"
            >
              Create Template
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <article key={template._id} className={`rounded-3xl border border-[#e1bec4] bg-white p-4 shadow-[0_12px_35px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-['Libre_Caslon_Text'] text-[24px] leading-none text-[#1a1c1d]">{template.name}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: template.accent || accentFallback }}
                      aria-hidden="true"
                    />
                    <span className="rounded-full bg-[#f5dce4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#B10E6B]">
                      {template.presetKey || 'custom'}
                    </span>
                  </div>
                </div>

                <p className="mt-3 min-h-10.5 text-[13px] leading-6 text-[#6b5d60]">
                  {template.description || 'No description'}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6268]">
                  <div className="rounded-xl border border-[#efe1e5] bg-[#fff8fb] px-3 py-2">
                    {template.pages?.length || 0} Pages
                  </div>
                  <div className="rounded-xl border border-[#efe1e5] bg-[#fff8fb] px-3 py-2">
                    {template.slots?.length || 0} Slots
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#efe1e5] bg-[#fff8fb] px-3 py-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: template.accent || accentFallback }} />
                    Accent
                  </div>
                </div>

                {template.usedByAlbums !== undefined && template.usedByAlbums > 0 ? (
                  <div className="mt-3 rounded-xl border border-[#e1bec4] bg-[#fff8fb] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B10E6B]">
                    Used by {template.usedByAlbums} Album Book{template.usedByAlbums > 1 ? 's' : ''}
                  </div>
                ) : null}

                <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#8c7f83]">Updated {formatDate(template.updatedAt)}</p>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/admin/template/${template._id}/book`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#B10E6B] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B10E6B] transition-colors hover:bg-[#fff0f4]"
                  >
                    <BookOpen className="h-4 w-4" />
                    Book View
                  </Link>
                  <Link
                    href={`/admin/template/new?templateId=${template._id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B10E6B] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-95"
                  >
                    Open Builder
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(template._id, template.usedByAlbums)}
                    disabled={template.usedByAlbums !== undefined && template.usedByAlbums > 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e7bfc9] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B10E6B] hover:bg-[#fff0f4] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {isLoading && templates.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-[#e1bec4] bg-[#fff8fb] px-4 py-3 text-[13px] text-[#594045] shadow-[0_8px_22px_rgba(0,0,0,0.03)]">
            Refreshing templates...
          </div>
        ) : null}
      </main>
    </div>
  );
}
