'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Plus, Save, X,
  ZoomIn, ZoomOut, Undo2, Redo2, Maximize2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

/* ─── Types ──────────────────────────────────────────── */
type SlotShape = 'square' | 'circle' | 'triangle' | 'text';

type EditorSlot = {
  id: string; label: string; shape: SlotShape;
  x: number; y: number; width: number; height: number;
};

type EditorPage = {
  id: number; label: string; pageColor: string; slots: EditorSlot[];
};

type EditorSpecialPage = { pageColor: string; slots: EditorSlot[] };

type TemplateSlotInput = {
  id?: string; label?: string; shape?: string; kind?: string;
  x?: unknown; y?: unknown; width?: unknown; height?: unknown;
};

type TemplatePageInput = {
  pageNumber?: number; pageLabel?: string; pageColor?: string; slots?: TemplateSlotInput[];
};

type TemplateInput = {
  name?: string; description?: string; accent?: string; pageColor?: string;
  pages?: TemplatePageInput[];
  coverDesign?: { pageColor?: string; slots?: TemplateSlotInput[] };
  endPageDesign?: { pageColor?: string; slots?: TemplateSlotInput[] };
};

type InteractionState = {
  mode: 'drag' | 'resize'; slotId: string;
  startX: number; startY: number;
  startSlot: EditorSlot; canvasWidth: number; canvasHeight: number;
} | null;

/* ─── Presets ────────────────────────────────────────── */
const STORAGE_PREFIX  = 'template-builder-draft:';
const ACCENT_PRESETS  = ['#7b0033', '#e05252', '#4caf7d', '#4a90d9', '#f0c040', '#ffffff'];
const BG_PRESETS      = ['#ffffff', '#f5f5f5', '#e8f0de', '#1a1a1a'];

/* ─── Helpers ────────────────────────────────────────── */
const createId = () => `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createSlot = (shape: SlotShape, index: number): EditorSlot => ({
  id: createId(),
  label: `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${index + 1}`,
  shape,
  x: 5  + (index % 3) * 32,
  y: 8  + Math.floor(index / 3) * 32,
  width:  shape === 'text' ? 40 : 28,
  height: shape === 'text' ? 12 : 36,
});

const createSpecialPage = (color = '#ffffff'): EditorSpecialPage => ({ pageColor: color, slots: [] });
const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));

const toTemplateKind = (shape: SlotShape) => {
  if (shape === 'text') return 'text';
  if (shape === 'circle' || shape === 'triangle') return 'color';
  return 'frame';
};

const fromTemplateShape = (slot?: Pick<TemplateSlotInput, 'shape' | 'kind'>): SlotShape => {
  if (slot?.shape === 'circle' || slot?.shape === 'triangle' || slot?.shape === 'text' || slot?.shape === 'square') return slot.shape;
  if (slot?.kind === 'text') return 'text';
  if (slot?.kind === 'color') return 'circle';
  return 'square';
};

const normPos  = (v: unknown, fb: number) => { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : fb; };
const normSize = (v: unknown, fb: number) => { const n = Number(v); if (!Number.isFinite(n)) return fb; return n <= 10 ? Math.max(4, n * 10) : Math.max(4, Math.min(100, n)); };

/* ─── Color Swatch ───────────────────────────────────── */
function ColorSwatch({ color, active, onSelect, onCustom }: {
  color?: string; active?: boolean; onSelect?: () => void; onCustom?: () => void;
}) {
  if (!color) {
    return (
      <button type="button" onClick={onCustom}
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-[#c8b0b8] text-[#9b0044] hover:border-[#9b0044]">
        <Plus className="h-3.5 w-3.5" />
      </button>
    );
  }
  return (
    <button type="button" onClick={onSelect}
      className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${active ? 'border-[#9b0044] scale-110 shadow-md ring-2 ring-[#9b0044]/30' : 'border-transparent'}`}
      style={{ backgroundColor: color }}
    />
  );
}

/* ─── Slot Shape Renderer ────────────────────────────── */
function SlotFill({ shape }: { shape: SlotShape }) {
  if (shape === 'circle') return <div className="h-full w-full rounded-full border border-[#c8a8b4] bg-[#f0e4e8]" />;
  if (shape === 'triangle') return (
    <div className="flex h-full w-full items-center justify-center">
      <div style={{ width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: '38px solid #f0e4e8' }} />
    </div>
  );
  if (shape === 'text') return (
    <div className="flex h-full w-full items-center justify-center rounded bg-[#f5eef1]">
      <span className="text-[9px] font-bold tracking-widest text-[#9b0044]/40">TEXT</span>
    </div>
  );
  // square
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-[#c8a8b4] bg-[#f0e4e8]">
      <div className="h-6 w-6 rounded border border-[#c0a0ac] bg-[#e8d0d8]" />
    </div>
  );
}

/* ─── Slot Type Float Button (right panel) ──────────── */
function SlotTypeFloatBtn({ shape, active, onClick }: { shape: SlotShape; active: boolean; onClick: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    square:   <rect x="3" y="3" width="14" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />,
    circle:   <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" />,
    triangle: <polygon points="10,3 18,17 2,17" fill="none" stroke="currentColor" strokeWidth="2" />,
    text:     <text x="10" y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">T</text>,
  };
  const labels: Record<string, string> = { square: 'Sq', circle: 'Ci', triangle: 'Tr', text: 'Tx' };
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Add ${shape} slot`}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all shadow-sm ${
        active
          ? 'border-[#7b0033] bg-[#7b0033] text-white shadow-[0_4px_14px_rgba(123,0,51,0.35)]'
          : 'border-[#dcc8d0] bg-white text-[#7a6268] hover:border-[#9b0044] hover:text-[#9b0044] hover:shadow-md'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20">{icons[shape]}</svg>
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-lg bg-[#3a0018] px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        Add {shape}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
function NewTemplatePage() {
  const search = useSearchParams();
  const editingTemplateId = search?.get('templateId') || null;
  const storageKey = `${STORAGE_PREFIX}${editingTemplateId || 'new'}`;

  const [name, setName]                         = useState('Untitled Template');
  const [description, setDescription]           = useState('');
  const [accent, setAccent]                     = useState('#7b0033');
  const [pageColor, setPageColor]               = useState('#ffffff');
  const [pages, setPages]                       = useState<EditorPage[]>([{ id: 1, label: 'Page 1', pageColor: '#ffffff', slots: [] }]);
  const [coverDesign, setCoverDesign]           = useState<EditorSpecialPage>(createSpecialPage());
  const [endPageDesign, setEndPageDesign]       = useState<EditorSpecialPage>(createSpecialPage());
  const [activeCanvas, setActiveCanvas]         = useState<'cover' | 'content' | 'end'>('content');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedSlotId, setSelectedSlotId]     = useState<string | null>(null);
  const [activeSlotShape, setActiveSlotShape]   = useState<SlotShape>('square');
  const [isSaving, setIsSaving]                 = useState(false);
  const [isLoading, setIsLoading]               = useState(false);
  const [message, setMessage]                   = useState('');
  const [interaction, setInteraction]           = useState<InteractionState>(null);
  const [zoom, setZoom]                         = useState(85);

  const accentRef    = useRef<HTMLInputElement>(null);
  const bgRef        = useRef<HTMLInputElement>(null);
  const pageClrRef   = useRef<HTMLInputElement>(null);
  const canvasRef    = useRef<HTMLDivElement>(null);

  /* derived */
  const currentPage     = pages[currentPageIndex] || pages[0];
  const activeSlots     = activeCanvas === 'cover' ? coverDesign.slots : activeCanvas === 'end' ? endPageDesign.slots : currentPage?.slots || [];
  const activePageColor = activeCanvas === 'cover' ? coverDesign.pageColor : activeCanvas === 'end' ? endPageDesign.pageColor : currentPage?.pageColor || pageColor;
  const selectedSlot    = useMemo(() => activeSlots.find((s) => s.id === selectedSlotId) || null, [activeSlots, selectedSlotId]);

  /* update slot */
  const updateSlot = (slotId: string, patch: Partial<EditorSlot>) => {
    const mapper = (s: EditorSlot) => s.id === slotId ? { ...s, ...patch } : s;
    if (activeCanvas === 'cover')        { setCoverDesign((c) => ({ ...c, slots: c.slots.map(mapper) })); return; }
    if (activeCanvas === 'end')          { setEndPageDesign((c) => ({ ...c, slots: c.slots.map(mapper) })); return; }
    setPages((cur) => cur.map((p, i) => i === currentPageIndex ? { ...p, slots: p.slots.map(mapper) } : p));
  };

  /* add slot */
  const addSlot = (shape: SlotShape) => {
    const maker = (slots: EditorSlot[]) => {
      const next = createSlot(shape, slots.length);
      setSelectedSlotId(next.id);
      return [...slots, next];
    };
    if (activeCanvas === 'cover')  { setCoverDesign((c) => ({ ...c, slots: maker(c.slots) })); return; }
    if (activeCanvas === 'end')    { setEndPageDesign((c) => ({ ...c, slots: maker(c.slots) })); return; }
    setPages((cur) => cur.map((p, i) => i === currentPageIndex ? { ...p, slots: maker(p.slots) } : p));
  };

  /* remove slot */
  const removeSlot = (slotId: string) => {
    const filter = (slots: EditorSlot[]) => slots.filter((s) => s.id !== slotId);
    if (activeCanvas === 'cover')  { setCoverDesign((c) => ({ ...c, slots: filter(c.slots) })); }
    else if (activeCanvas === 'end') { setEndPageDesign((c) => ({ ...c, slots: filter(c.slots) })); }
    else { setPages((cur) => cur.map((p, i) => i === currentPageIndex ? { ...p, slots: filter(p.slots) } : p)); }
    if (selectedSlotId === slotId) setSelectedSlotId(null);
  };

  /* active page color setter */
  const setActivePageColor = (val: string) => {
    if (activeCanvas === 'cover')  { setCoverDesign((c) => ({ ...c, pageColor: val })); return; }
    if (activeCanvas === 'end')    { setEndPageDesign((c) => ({ ...c, pageColor: val })); return; }
    setPages((cur) => cur.map((p, i) => i === currentPageIndex ? { ...p, pageColor: val } : p));
  };

  /* add page */
  const addPage = () => {
    setPages((cur) => [...cur, { id: cur.length + 1, label: `Page ${cur.length + 1}`, pageColor, slots: [] }]);
    setCurrentPageIndex(pages.length);
    setSelectedSlotId(null);
  };

  /* remove page */
  const removePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages((cur) => cur.filter((_, i) => i !== index));
    setCurrentPageIndex((prev) => Math.min(prev, pages.length - 2));
    setSelectedSlotId(null);
  };

  /* drag / resize */
  const beginInteraction = (mode: 'drag' | 'resize', e: React.MouseEvent, slot: EditorSlot) => {
    e.preventDefault(); e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelectedSlotId(slot.id);
    setInteraction({ mode, slotId: slot.id, startX: e.clientX, startY: e.clientY, startSlot: { ...slot }, canvasWidth: rect.width, canvasHeight: rect.height });
  };

  useEffect(() => {
    if (!interaction) return;
    const onMove = (e: MouseEvent) => {
      const dx = ((e.clientX - interaction.startX) / interaction.canvasWidth)  * 100;
      const dy = ((e.clientY - interaction.startY) / interaction.canvasHeight) * 100;
      if (interaction.mode === 'drag') {
        updateSlot(interaction.slotId, {
          x: clamp(interaction.startSlot.x + dx, 0, 100 - interaction.startSlot.width),
          y: clamp(interaction.startSlot.y + dy, 0, 100 - interaction.startSlot.height),
        });
      } else {
        updateSlot(interaction.slotId, {
          width:  clamp(interaction.startSlot.width  + dx, 8, 100 - interaction.startSlot.x),
          height: clamp(interaction.startSlot.height + dy, 8, 100 - interaction.startSlot.y),
        });
      }
    };
    const onUp = () => setInteraction(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [interaction]);

  /* persist */
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ name, description, accent, pageColor, pages, coverDesign, endPageDesign, activeCanvas, currentPageIndex }));
  }, [name, description, accent, pageColor, pages, coverDesign, endPageDesign, activeCanvas, currentPageIndex, isLoading]);

  /* load */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        if (!editingTemplateId) {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
          if (raw) {
            try {
              const d = JSON.parse(raw);
              setName(d.name || 'Untitled Template');
              setDescription(d.description || '');
              setAccent(d.accent || '#7b0033');
              setPageColor(d.pageColor || '#ffffff');
              setPages(Array.isArray(d.pages) && d.pages.length > 0 ? d.pages : [{ id: 1, label: 'Page 1', pageColor: '#ffffff', slots: [] }]);
              setCoverDesign(d.coverDesign || createSpecialPage());
              setEndPageDesign(d.endPageDesign || createSpecialPage());
              setCurrentPageIndex(typeof d.currentPageIndex === 'number' ? d.currentPageIndex : 0);
              setMessage('Draft recovered');
            } catch { window.localStorage.removeItem(storageKey); }
          }
          return;
        }
        const data  = await apiFetch(`/admin/templates/${editingTemplateId}`);
        const found = data?.template;
        if (!found) { setMessage('Template not found'); return; }
        setName(found.name || 'Untitled Template');
        setDescription(found.description || '');
        setAccent(found.accent || '#7b0033');
        setPageColor(found.pageColor || '#ffffff');
        const ns = (slots: TemplateSlotInput[]) => (slots || []).map((s, i) => ({
          id: s.id || createId(), label: s.label || `Slot ${i + 1}`, shape: fromTemplateShape(s),
          x: normPos(s.x, 8 + (i % 3) * 12), y: normPos(s.y, 8 + Math.floor(i / 3) * 12),
          width: normSize(s.width, 28), height: normSize(s.height, 36),
        }));
        const mp = (found.pages || []).map((p: TemplatePageInput, pi: number) => ({
          id: p.pageNumber || pi + 1, label: p.pageLabel || `Page ${pi + 1}`,
          pageColor: p.pageColor || found.pageColor || '#ffffff', slots: ns(p.slots || []),
        }));
        setPages(mp.length > 0 ? mp : [{ id: 1, label: 'Page 1', pageColor: '#ffffff', slots: [] }]);
        setCoverDesign({ pageColor: found.coverDesign?.pageColor || '#ffffff', slots: ns(found.coverDesign?.slots || []) });
        setEndPageDesign({ pageColor: found.endPageDesign?.pageColor || '#ffffff', slots: ns(found.endPageDesign?.slots || []) });
        setCurrentPageIndex(0);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load';
        setMessage(msg); toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [editingTemplateId]);

  /* save */
  const saveTemplate = async () => {
    setIsSaving(true);
    try {
      const ms = (slots: EditorSlot[]) => slots.map((s) => ({
        id: s.id, label: s.label, kind: toTemplateKind(s.shape), shape: s.shape,
        x: Math.round(s.x), y: Math.round(s.y), width: Math.round(s.width), height: Math.round(s.height), emphasis: 'default',
      }));
      const payload = {
        name: name.trim() || 'Untitled Template', description, presetKey: 'custom-builder', accent, pageColor, isActive: true,
        coverDesign:   { pageColor: coverDesign.pageColor,   slots: ms(coverDesign.slots) },
        endPageDesign: { pageColor: endPageDesign.pageColor, slots: ms(endPageDesign.slots) },
        pages: pages.map((p) => ({ pageNumber: p.id, pageLabel: p.label, presetKey: 'custom-builder', accent, pageColor: p.pageColor, slots: ms(p.slots) })),
        slots: ms(pages[0]?.slots || []),
      };
      await apiFetch(editingTemplateId ? `/admin/templates/${editingTemplateId}` : '/admin/templates', {
        method: editingTemplateId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      typeof window !== 'undefined' && window.localStorage.removeItem(storageKey);
      setMessage(''); toast.success('Template saved successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setMessage(msg); toast.error(msg);
    } finally { setIsSaving(false); }
  };

  /* ══════════════════════════════════════════════════ */
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f5ecef] font-sans text-[#1a1c1d]">

      {/* ══ TOP NAV (same as app nav, minimal) ══ */}
      {/* ══ PAGE HEADER ══ */}
      <header className="shrink-0 border-b border-[#e5d0d8] bg-[#f5ecef] px-8 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/template"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dcc8d0] text-[#7a6268] hover:border-[#9b0044] hover:text-[#9b0044]">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-[26px] font-bold leading-tight text-[#7b0033]">
                {editingTemplateId ? 'Edit Template' : 'Create Template'}
              </h1>
              <p className="mt-0.5 text-[13px] text-[#9a7e87]">
                Configure your album layout and visual identity for a seamless curation experience.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/template"
              className="rounded-xl border border-[#d0b8c0] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5a4048] hover:bg-[#fdf5f7]">
              Discard
            </Link>
            <button type="button" onClick={saveTemplate} disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#7b0033] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(123,0,51,0.28)] hover:bg-[#9b0044] disabled:opacity-60">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <aside className="flex w-[220px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-[#e5d0d8] bg-[#f5ecef] p-4">

          {/* Template name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[#dcc8d0] bg-white px-3 py-2 text-[12px] font-semibold text-[#1a1c1d] outline-none focus:border-[#9b0044]"
            placeholder="Template name"
          />

          {/* VISUAL IDENTITY card */}
          <div className="rounded-2xl border border-[#e5d0d8] bg-white p-4 shadow-sm space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5a4048]">Visual Identity</p>

            {/* Accent Color */}
            <div>
              <p className="mb-2 text-[11px] font-semibold text-[#7a6268]">Accent Color</p>
              <div className="flex flex-wrap gap-1.5">
                {ACCENT_PRESETS.map((c) => (
                  <ColorSwatch key={c} color={c} active={accent === c} onSelect={() => setAccent(c)} />
                ))}
                <ColorSwatch onCustom={() => setTimeout(() => accentRef.current?.click(), 30)} />
                <input ref={accentRef} type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="sr-only" />
              </div>
            </div>

            {/* Page Background */}
            <div>
              <p className="mb-2 text-[11px] font-semibold text-[#7a6268]">Page Background</p>
              <div className="flex flex-wrap gap-1.5">
                {BG_PRESETS.map((c) => (
                  <ColorSwatch key={c} color={c} active={pageColor === c} onSelect={() => setPageColor(c)} />
                ))}
                <ColorSwatch onCustom={() => setTimeout(() => bgRef.current?.click(), 30)} />
                <input ref={bgRef} type="color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="sr-only" />
              </div>
            </div>
          </div>

          {/* Slot types moved to right floating panel */}

          {/* Selected slot properties */}
          {selectedSlot && (
            <div className="rounded-2xl border border-[#e5d0d8] bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a4048]">Edit Slot</p>
                <button type="button" onClick={() => removeSlot(selectedSlot.id)}
                  className="rounded-full bg-[#ffe0e8] p-1 text-[#c0003a] hover:bg-[#ffc8d4]">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <input
                value={selectedSlot.label}
                onChange={(e) => updateSlot(selectedSlot.id, { label: e.target.value })}
                className="w-full rounded-xl border border-[#dcc8d0] bg-[#f5ecef] px-2.5 py-1.5 text-[11px] outline-none focus:border-[#9b0044]"
                placeholder="Slot label"
              />
              <div className="grid grid-cols-2 gap-1.5">
                {(['x', 'y', 'width', 'height'] as const).map((f) => (
                  <label key={f} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase text-[#9a7e87]">{f === 'width' ? 'W' : f === 'height' ? 'H' : f.toUpperCase()}</span>
                    <input type="number" value={Math.round(selectedSlot[f])}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        if (f === 'x') updateSlot(selectedSlot.id, { x: clamp(val, 0, 100 - selectedSlot.width) });
                        else if (f === 'y') updateSlot(selectedSlot.id, { y: clamp(val, 0, 100 - selectedSlot.height) });
                        else if (f === 'width') updateSlot(selectedSlot.id, { width: clamp(val, 8, 100 - selectedSlot.x) });
                        else updateSlot(selectedSlot.id, { height: clamp(val, 8, 100 - selectedSlot.y) });
                      }}
                      className="w-full rounded-lg border border-[#dcc8d0] bg-white px-1.5 py-1 text-[11px] outline-none focus:border-[#9b0044]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {message && <p className="rounded-xl border border-[#e5d0d8] bg-white px-3 py-2 text-[10px] text-[#5a4048]">{message}</p>}
          {isLoading && <p className="rounded-xl border border-[#e5d0d8] bg-white px-3 py-2 text-[10px] text-[#9a7e87]">Loading…</p>}
        </aside>

        {/* ── CANVAS AREA ── */}
        <main className="flex flex-1 flex-col overflow-hidden">

          {/* Canvas toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#e5d0d8] bg-[#f5ecef] px-6 py-2.5">
            {/* Left: page view selector */}
            <div className="flex items-center gap-1">
              {(['cover', 'content', 'end'] as const).map((cv) => (
                <button key={cv} type="button"
                  onClick={() => { setActiveCanvas(cv); setSelectedSlotId(null); }}
                  className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${activeCanvas === cv ? 'bg-[#7b0033] text-white' : 'text-[#7a6268] hover:bg-white'}`}>
                  {cv === 'content' ? 'Pages' : cv === 'cover' ? 'Cover' : 'End'}
                </button>
              ))}
            </div>

            {/* Centre: preview label + zoom */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a6268]">
                Preview: {activeCanvas === 'cover' ? 'Cover' : activeCanvas === 'end' ? 'End Page' : `Page ${currentPage?.id}`}
              </span>
              <button type="button" onClick={() => setZoom((z) => Math.max(40, z - 10))}
                className="flex h-6 w-6 items-center justify-center rounded text-[#7a6268] hover:bg-white">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[32px] text-center text-[11px] font-semibold text-[#5a4048]">{zoom}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(150, z + 10))}
                className="flex h-6 w-6 items-center justify-center rounded text-[#7a6268] hover:bg-white">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right: undo redo fullscreen */}
            <div className="flex items-center gap-1">
              <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#7a6268] hover:bg-white"><Undo2 className="h-3.5 w-3.5" /></button>
              <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#7a6268] hover:bg-white"><Redo2 className="h-3.5 w-3.5" /></button>
              <div className="mx-1 h-4 w-px bg-[#e5d0d8]" />
              <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#7a6268] hover:bg-white"><Maximize2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {/* Canvas + floating Add Slot button */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">

            {/* Canvas */}
            <div
              className="relative rounded-2xl border-2 border-dashed border-[#d0b8c4] shadow-[0_8px_32px_rgba(123,0,51,0.08)]"
              style={{ width: `${zoom}%`, maxWidth: 780, aspectRatio: '4/3', backgroundColor: activePageColor }}
              onClick={() => setSelectedSlotId(null)}
            >
              <div ref={canvasRef} className="relative h-full w-full">
                {activeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`absolute rounded-xl transition-shadow ${selectedSlotId === slot.id ? 'shadow-[0_0_0_2px_#9b0044,0_0_0_5px_rgba(155,0,68,0.18)]' : ''}`}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.width}%`, height: `${slot.height}%`, cursor: 'grab' }}
                    onMouseDown={(e) => beginInteraction('drag', e, slot)}
                    onClick={(e) => { e.stopPropagation(); setSelectedSlotId(slot.id); }}
                  >
                    {/* ── RED REMOVE BUTTON (top-right, outside slot) ── */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }}
                      className="absolute -right-2.5 -top-2.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-[#c0003a] text-white shadow-md hover:bg-[#7b0033]"
                      title="Remove slot"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>

                    {/* Shape fill */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <SlotFill shape={slot.shape} />
                    </div>

                    {/* Resize handle */}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.stopPropagation(); beginInteraction('resize', e, slot); }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute -bottom-2 -right-2 z-20 h-3.5 w-3.5 cursor-se-resize rounded-full bg-[#9b0044] ring-2 ring-white shadow"
                    />
                  </div>
                ))}

                {activeSlots.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#c0aab0]">
                    <span className="text-4xl">🖼️</span>
                    <p className="text-[12px]">Pick a slot type on the left to add</p>
                  </div>
                )}
              </div>
            </div>

            {/* Floating action buttons — right side of canvas */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 items-center">
              {/* Slot type buttons */}
              {(['square', 'circle', 'triangle', 'text'] as SlotShape[]).map((shape) => (
                <SlotTypeFloatBtn
                  key={shape}
                  shape={shape}
                  active={activeSlotShape === shape}
                  onClick={() => { setActiveSlotShape(shape); addSlot(shape); }}
                />
              ))}
              {/* Divider */}
              {activeCanvas === 'content' && <div className="h-px w-8 bg-[#e5d0d8]" />}
              {/* Add Page */}
              {activeCanvas === 'content' && (
                <button
                  type="button"
                  onClick={addPage}
                  title="Add page"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#7b0033] bg-white text-[#7b0033] shadow hover:bg-[#fff0f4]"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                    <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                    <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                    <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ══ BOTTOM PAGE STRIP ══ */}
      {activeCanvas === 'content' && (
        <div className="shrink-0 border-t border-[#e5d0d8] bg-[#f5ecef] px-6 py-4">
          <div className="flex items-end gap-4 overflow-x-auto pb-1">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`relative shrink-0 cursor-pointer overflow-visible rounded-2xl border-2 transition-all ${index === currentPageIndex ? 'border-[#7b0033] shadow-[0_4px_16px_rgba(123,0,51,0.22)]' : 'border-[#dcc8d0] opacity-80 hover:border-[#9b0044]/60 hover:opacity-100'}`}
                style={{ width: 110, height: 82 }}
                onClick={() => { setCurrentPageIndex(index); setSelectedSlotId(null); }}
              >
                {/* × remove page */}
                {pages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePage(index); }}
                    className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#dcc8d0] text-[#5a4048] hover:bg-[#c0003a] hover:text-white"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}

                {/* Thumbnail */}
                <div className="relative h-full w-full overflow-hidden rounded-[14px]" style={{ backgroundColor: page.pageColor || '#ffffff' }}>
                  {page.slots.map((s) => (
                    <div key={s.id} className="absolute rounded bg-[#e0c8d0]"
                      style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.width}%`, height: `${s.height}%` }} />
                  ))}
                </div>

                {/* Page label */}
                <div className={`mt-1 text-center text-[9px] font-bold uppercase tracking-wider ${index === currentPageIndex ? 'text-[#7b0033]' : 'text-[#9a7e87]'}`}>
                  Page {page.id}
                </div>
              </div>
            ))}

            {/* Add Page card */}
            <button
              type="button"
              onClick={addPage}
              className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#dcc8d0] bg-white text-[#9a7e87] hover:border-[#9b0044] hover:text-[#9b0044]"
              style={{ width: 110, height: 82 }}
            >
              <Plus className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Add Page</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FEF6F6]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto mb-6 border-4 border-[#9b0044] border-t-transparent rounded-full"></div>
            <p className="text-[#1a1c1d] text-lg">Loading Template Editor...</p>
          </div>
        </div>
      }
    >
      <NewTemplatePage />
    </Suspense>
  );
}