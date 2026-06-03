'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, ChevronLeft, ChevronRight, Edit, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

type TemplateSlot = {
  id: string;
  label: string;
  kind: string;
  shape?: 'square' | 'circle' | 'triangle' | 'text';
  x?: number;
  y?: number;
  width: number;
  height: number;
  emphasis: string;
};

type TemplatePage = {
  pageNumber: number;
  pageLabel?: string;
  pageColor?: string;
  slots: TemplateSlot[];
};

type TemplateRecord = {
  _id: string;
  name: string;
  description?: string;
  accent?: string;
  pageColor?: string;
  coverImage?: string;
  coverUrl?: string;
  coverDesign?: {
    pageColor?: string;
    slots?: TemplateSlot[];
  };
  endPageDesign?: {
    pageColor?: string;
    slots?: TemplateSlot[];
  };
  slots?: TemplateSlot[];
  pages?: TemplatePage[];
};

type FlipBookApi = {
  flip?: (page: number) => void;
  flipNext?: () => void;
};

type FlipBookRef = {
  pageFlip?: () => FlipBookApi;
} | null;

const FlipBook = HTMLFlipBook as unknown as ComponentType<Record<string, unknown>>;

function SlotLayer({ slots }: { slots: TemplateSlot[] }) {
  return (
    <>
      {slots.map((slot) => {
        const shape = slot.shape || 'square';
        const left = Number.isFinite(Number(slot.x)) ? Number(slot.x) : 0;
        const top = Number.isFinite(Number(slot.y)) ? Number(slot.y) : 0;
        const width = Math.max(1, Number.isFinite(Number(slot.width)) ? Number(slot.width) : 1);
        const height = Math.max(1, Number.isFinite(Number(slot.height)) ? Number(slot.height) : 1);
        const isCircle = shape === 'circle';
        const isTriangle = shape === 'triangle';

        return (
          <article
            key={slot.id}
            className="absolute overflow-hidden bg-[#f5f5f5] shadow-sm"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              borderRadius: isCircle ? '9999px' : isTriangle ? '0.5rem' : '0.5rem',
              clipPath: isTriangle ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : undefined,
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.5),rgba(0,0,0,0.02))]" />
            <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
              {slot.kind === 'text' ? (
                <p className="text-[12px] font-medium text-[#1a1c1d] leading-tight md:text-[14px]">{slot.label || 'Text Slot'}</p>
              ) : (
                <div className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#999]">{slot.kind}</p>
                  <p className="mt-1 text-[11px] font-medium text-[#666] md:text-[12px]">{slot.label || slot.id}</p>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </>
  );
}

function CoverPage({ template }: { template: TemplateRecord }) {
  const coverTitle = template.name || 'Template Book';
  const coverImage = template.coverImage || template.coverUrl;
  const coverColor = template.coverDesign?.pageColor || template.pageColor || '#ffffff';
  const coverSlots = template.coverDesign?.slots || [];

  return (
    <div className="h-full w-full bg-[#FEF6F6] p-2 md:p-3">
      <div className="flex h-full flex-col overflow-hidden rounded-[1.2rem] border border-[#e9d8dd] bg-white shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between border-b border-[#f0e2e6] px-4 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8d7d81]">Cover</p>
          <Sparkles className="h-4 w-4 text-[#9b0044]" />
        </div>
        <div className="relative flex-1 overflow-hidden" style={{ backgroundColor: coverColor }}>
          {coverImage ? <img src={coverImage} alt={coverTitle} className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.75),rgba(255,255,255,0.22))]" />
          <div className="absolute inset-x-0 top-0 z-10 p-4">
            <h1 className="font-['Libre_Caslon_Text'] text-[26px] leading-[1.05] text-[#1a1c1d] md:text-[34px]">{coverTitle}</h1>
            <p className="mt-2 text-[12px] text-[#6b5d60]">{template.description || 'Custom cover design'}</p>
          </div>
          <div className="absolute inset-0">
            <SlotLayer slots={coverSlots} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookPage({ page, pageLabel, pageColor }: { page: TemplatePage; pageLabel: string; pageColor?: string }) {
  const bgColor = pageColor || page.pageColor || '#ffffff';
  
  return (
    <div className="h-full w-full bg-[#FFF8F7] p-1 md:p-2">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ede5e8] p-3 md:p-4 shadow-[0_14px_35px_rgba(0,0,0,0.06)]" style={{ backgroundColor: bgColor }}>
        <div className="flex items-center justify-between border-b border-[#f2e8ec] pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7d81]">{pageLabel}</p>
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#8d7d81]">{page.slots.length} slots</span>
        </div>

        <div className="relative mt-3 flex-1 overflow-hidden rounded-2xl border border-[#f2e8ec]" style={{ backgroundColor: bgColor }}>
          <SlotLayer slots={page.slots} />
        </div>
      </div>
    </div>
  );
}

function EndPage({ template }: { template: TemplateRecord }) {
  const endColor = template.endPageDesign?.pageColor || template.pageColor || '#ffffff';
  const endSlots = template.endPageDesign?.slots || [];
  return (
    <div className="h-full w-full bg-[#FFF8F7] p-2 md:p-3">
      <div className="flex h-full flex-col overflow-hidden rounded-[1.2rem] border border-[#ede5e8] p-3 md:p-4 shadow-[0_14px_35px_rgba(0,0,0,0.06)]" style={{ backgroundColor: endColor }}>
        <div className="flex items-center justify-between border-b border-[#f2e8ec] pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8d7d81]">End Page</p>
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#8d7d81]">{endSlots.length} slots</span>
        </div>
        <div className="relative mt-3 flex-1 overflow-hidden rounded-2xl border border-[#f2e8ec]" style={{ backgroundColor: endColor }}>
          <SlotLayer slots={endSlots} />
        </div>
      </div>
    </div>
  );
}

export default function TemplateBookViewPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = Array.isArray(params?.templateId) ? params.templateId[0] : params?.templateId;
  const router = useRouter();
  const bookRef = useRef<FlipBookRef>(null);
  const bookHoverRef = useRef(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [bookSize, setBookSize] = useState({ width: 520, height: 740 });
  const [template, setTemplate] = useState<TemplateRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const pages = useMemo(() => {
    if (!template) return [];
    if (Array.isArray(template.pages) && template.pages.length > 0) return template.pages;
    return [{ pageNumber: 1, pageLabel: 'Page 1', slots: template.slots || [] }];
  }, [template]);

  const totalSlots = useMemo(() => {
    if (!template) return 0;
    return (
      (template.pages || []).reduce((sum, page) => sum + (page.slots?.length || 0), 0) +
      (template.slots?.length || 0) +
      (template.coverDesign?.slots?.length || 0) +
      (template.endPageDesign?.slots?.length || 0)
    );
  }, [template]);

  const playFlipSound = () => {
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(640, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.16);

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
    oscillator.onended = () => audioContext.close().catch(() => undefined);
  };

  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) {
        setMessage('Template id not found');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await apiFetch(`/admin/templates/${templateId}`);
        const found = data?.template;

        if (!found) {
          throw new Error('Template not found');
        }

        setTemplate(found);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load template';
        setMessage(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  useEffect(() => {
    if (!template) return;

    const id = window.setTimeout(() => {
      try {
        const instance = bookRef.current?.pageFlip?.();
        if (instance && pages.length > 0) {
          instance.flip?.(1);
        }
      } catch {
        // ignore animation initialization errors
      }
    }, 320);

    return () => window.clearTimeout(id);
  }, [template, pages.length]);

  // Removed auto-flip on page change to prevent unwanted navigation

  useEffect(() => {
    const computeSize = () => {
      const viewportBox = viewportRef.current?.getBoundingClientRect();
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const footerHeight = footerRef.current?.offsetHeight || 0;
      const availableWidth = Math.max(320, Math.floor(viewportBox?.width || window.innerWidth));
      const availableHeight = Math.max(420, Math.floor((viewportBox?.height || window.innerHeight) - headerHeight - footerHeight - 32));

      const targetWidth = availableWidth < 900
        ? Math.max(300, Math.min(440, availableWidth - 24))
        : Math.max(360, Math.min(620, Math.floor((availableWidth - 72) / 2)));
      const targetHeight = Math.max(420, Math.min(availableHeight, Math.floor(targetWidth * 1.42)));

      setBookSize({ width: targetWidth, height: targetHeight });
    };

    computeSize();
    window.addEventListener('resize', computeSize);

    const observer = typeof ResizeObserver !== 'undefined' && viewportRef.current ? new ResizeObserver(computeSize) : null;
    if (observer && viewportRef.current) {
      observer.observe(viewportRef.current);
    }

    return () => {
      window.removeEventListener('resize', computeSize);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-[#FFF1F3] text-[#1a1c1d]">
      <header ref={headerRef} className="border-b border-[#ead5dc] bg-[#FFF1F3]/95 px-4 py-2 backdrop-blur md:px-6 md:py-2">
        <div className="mx-auto flex w-full max-w-400 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/template" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e1bec4] text-[#7a6268] transition-colors hover:border-[#9b0044] hover:text-[#9b0044]" aria-label="Back to templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="font-['Libre_Caslon_Text'] text-[22px] leading-none text-[#9b0044] md:text-[26px]">{template?.name || 'Template Book View'}</p>
              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.24em] text-[#8d7d81]">Fullscreen Flip Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:inline-flex items-center gap-3 rounded-full border border-[#e1bec4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7a6268]">
              <span>Slots: {totalSlots}</span>
            </div>
            <button onClick={() => router.push(`/admin/template/new?templateId=${template?._id}`)} className="inline-flex items-center gap-2 rounded-full border border-[#9b0044] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9b0044] hover:bg-[#fff0f4]">
              <Edit className="h-4 w-4" />
              Edit in Builder
            </button>
            <button
              onClick={async () => {
                if (!template) return;
                if (!confirm('Delete this template? This cannot be undone.')) return;
                try {
                  await apiFetch(`/admin/templates/${template._id}`, { method: 'DELETE' });
                  toast.success('Template deleted');
                  router.push('/admin/template');
                } catch {
                  toast.error('Failed to delete template');
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#e7bfc9] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9b0044] hover:bg-[#fff0f4]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#e1bec4] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7a6268] md:inline-flex">
            <ChevronLeft className="h-3.5 w-3.5" />
            Drag Or Click Page Edge
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </header>

      <main ref={viewportRef} className="flex flex-1 min-h-0 items-center justify-center overflow-hidden p-0">
        {isLoading ? (
          <div className="text-center">
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#7a6268]">Loading Book...</p>
          </div>
        ) : message ? (
          <div className="rounded-2xl border border-[#e1bec4] bg-white px-6 py-6 text-center text-[13px] text-[#594045]">{message}</div>
        ) : pages.length === 0 ? (
          <div className="rounded-2xl border border-[#e1bec4] bg-white px-6 py-6 text-center text-[13px] text-[#594045]">No pages to preview.</div>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-2 py-2 md:px-4"
            onMouseEnter={() => {
              bookHoverRef.current = true;
            }}
            onMouseLeave={() => {
              bookHoverRef.current = false;
            }}
          >
            <div className="mx-auto flex h-full w-full items-center justify-center overflow-hidden rounded-[1.6rem] border border-[#ead5dc] bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,241,243,0.96))] p-2 shadow-[0_26px_70px_rgba(0,0,0,0.09)] md:p-4">
              <FlipBook
                ref={bookRef}
                width={bookSize.width}
                height={bookSize.height}
                size="fixed"
                minWidth={bookSize.width}
                maxWidth={bookSize.width}
                minHeight={bookSize.height}
                maxHeight={bookSize.height}
                showCover
                mobileScrollSupport
                className="mx-auto"
                onFlip={(event: { data: number }) => {
                  setCurrentPage(event.data);
                  playFlipSound();
                }}
              >
                <div>
                  <CoverPage template={template as TemplateRecord} />
                </div>
                {pages.map((page) => (
                  <div key={`${page.pageNumber}-${page.pageLabel || 'page'}`}>
                    <BookPage page={page} pageLabel={page.pageLabel || `Page ${page.pageNumber}`} pageColor={template?.pageColor} />
                  </div>
                ))}
                <div>
                  <EndPage template={template as TemplateRecord} />
                </div>
              </FlipBook>
            </div>
          </div>
        )}
      </main>

      <footer ref={footerRef} className="border-t border-[#ead5dc] bg-[#FFF1F3] px-4 py-2 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#8d7d81] md:px-6">
        Page {Math.min(currentPage + 1, pages.length + 2)} of {pages.length + 2}
      </footer>
    </div>
  );
}
