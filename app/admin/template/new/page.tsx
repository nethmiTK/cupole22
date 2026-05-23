'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Circle, Move, Plus, Save, Square, Triangle, Trash2, Type } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

type SlotShape = 'square' | 'circle' | 'triangle' | 'text';

type EditorSlot = {
  id: string;
  label: string;
  shape: SlotShape;
  x: number;
  y: number;
  width: number;
  height: number;
};

type EditorPage = {
  id: number;
  slots: EditorSlot[];
};

type InteractionState = {
  mode: 'drag' | 'resize';
  slotId: string;
  startX: number;
  startY: number;
  startSlot: EditorSlot;
  canvasWidth: number;
  canvasHeight: number;
} | null;

const createId = () => `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createSlot = (shape: SlotShape, index: number): EditorSlot => ({
  id: createId(),
  label: `${shape.toUpperCase()} ${index + 1}`,
  shape,
  x: 10 + (index % 4) * 12,
  y: 10 + (index % 3) * 15,
  width: shape === 'text' ? 44 : 20,
  height: shape === 'text' ? 14 : 18,
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toTemplateKind = (shape: SlotShape) => {
  if (shape === 'text') return 'text';
  if (shape === 'circle' || shape === 'triangle') return 'color';
  return 'frame';
};

const fromTemplateShape = (slot: any): SlotShape => {
  if (slot?.shape === 'circle' || slot?.shape === 'triangle' || slot?.shape === 'text' || slot?.shape === 'square') {
    return slot.shape;
  }

  if (slot?.kind === 'text') return 'text';
  if (slot?.kind === 'color') return 'circle';
  return 'square';
};

function ShapePreview({ slot }: { slot: EditorSlot }) {
  if (slot.shape === 'circle') {
    return <div className="h-full w-full rounded-full border-2 border-[#9b0044] bg-[#fff0f6]" />;
  }

  if (slot.shape === 'triangle') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '26px solid transparent',
            borderRight: '26px solid transparent',
            borderBottom: '46px solid #f7d7e6',
          }}
        />
      </div>
    );
  }

  if (slot.shape === 'text') {
    return <div className="flex h-full w-full items-center justify-center text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b0044]">Text</div>;
  }

  return <div className="h-full w-full rounded-lg border-2 border-[#9b0044] bg-[#fff0f6]" />;
}

export default function NewTemplatePage() {
  const search = useSearchParams();
  const router = useRouter();
  const editingTemplateId = search?.get('templateId') || null;
  const [name, setName] = useState('Untitled Template');
  const [description, setDescription] = useState('');
  const [pages, setPages] = useState<EditorPage[]>([{ id: 1, slots: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [interaction, setInteraction] = useState<InteractionState>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const currentPage = pages[currentPageIndex] || pages[0];

  const selectedSlot = useMemo(
    () => currentPage?.slots.find((slot) => slot.id === selectedSlotId) || null,
    [currentPage, selectedSlotId]
  );

  const updateSlot = (slotId: string, patch: Partial<EditorSlot>) => {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== currentPageIndex) return page;
        return {
          ...page,
          slots: page.slots.map((slot) => (slot.id === slotId ? { ...slot, ...patch } : slot)),
        };
      })
    );
  };

  useEffect(() => {
    const loadForEdit = async () => {
      if (!editingTemplateId) return;
      try {
        const data = await apiFetch(`/admin/templates/${editingTemplateId}`);
        const found = data?.template;
        if (!found) return;

        setName(found.name || 'Untitled Template');
        setDescription(found.description || '');

        const mappedPages: EditorPage[] = (found.pages || []).map((p: any, pi: number) => ({
          id: p.pageNumber || pi + 1,
          slots: (p.slots || []).map((s: any, si: number) => ({
            id: s.id || createId(),
            label: s.label || `Slot ${si + 1}`,
            shape: fromTemplateShape(s),
            x: typeof s.x === 'number' ? s.x : 8 + (si % 3) * 12,
            y: typeof s.y === 'number' ? s.y : 8 + Math.floor(si / 3) * 12,
            width: typeof s.width === 'number' ? s.width : Math.min(80, (s.width || 1) * 10),
            height: typeof s.height === 'number' ? s.height : Math.min(80, (s.height || 1) * 10),
          })),
        }));

        setPages(mappedPages.length > 0 ? mappedPages : [{ id: 1, slots: [] }]);
        setCurrentPageIndex(0);
        setSelectedSlotId(null);
      } catch (e) {
        toast.error('Failed to load template for editing');
      }
    };

    loadForEdit();
  }, [editingTemplateId]);

  useEffect(() => {
    if (!interaction) return;

    const onMove = (event: MouseEvent) => {
      const deltaXPercent = ((event.clientX - interaction.startX) / interaction.canvasWidth) * 100;
      const deltaYPercent = ((event.clientY - interaction.startY) / interaction.canvasHeight) * 100;

      if (interaction.mode === 'drag') {
        const nextX = clamp(interaction.startSlot.x + deltaXPercent, 0, 100 - interaction.startSlot.width);
        const nextY = clamp(interaction.startSlot.y + deltaYPercent, 0, 100 - interaction.startSlot.height);
        updateSlot(interaction.slotId, { x: nextX, y: nextY });
        return;
      }

      const nextWidth = clamp(interaction.startSlot.width + deltaXPercent, 8, 100 - interaction.startSlot.x);
      const nextHeight = clamp(interaction.startSlot.height + deltaYPercent, 8, 100 - interaction.startSlot.y);
      updateSlot(interaction.slotId, { width: nextWidth, height: nextHeight });
    };

    const onUp = () => {
      setInteraction(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [interaction]);

  const beginInteraction = (mode: 'drag' | 'resize', event: React.MouseEvent, slot: EditorSlot) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedSlotId(slot.id);
    setInteraction({
      mode,
      slotId: slot.id,
      startX: event.clientX,
      startY: event.clientY,
      startSlot: { ...slot },
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    });
  };

  const addPage = () => {
    setPages((current) => {
      const next = [...current, { id: current.length + 1, slots: [] }];
      return next;
    });
    setCurrentPageIndex(pages.length);
    setSelectedSlotId(null);
  };

  const addSlot = (shape: SlotShape) => {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== currentPageIndex) return page;
        const nextSlot = createSlot(shape, page.slots.length);
        setSelectedSlotId(nextSlot.id);
        return { ...page, slots: [...page.slots, nextSlot] };
      })
    );
  };

  const removeSlot = (slotId: string) => {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== currentPageIndex) return page;
        return { ...page, slots: page.slots.filter((slot) => slot.id !== slotId) };
      })
    );

    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
    }
  };

  const saveTemplate = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const pagePayload = pages.map((page) => ({
        pageNumber: page.id,
        pageLabel: `Page ${page.id}`,
        presetKey: 'custom-builder',
        accent: '#9b0044',
        slots: page.slots.map((slot) => ({
          id: slot.id,
          label: slot.label,
          kind: toTemplateKind(slot.shape),
          shape: slot.shape,
          x: Math.round(slot.x),
          y: Math.round(slot.y),
          width: Math.max(1, Math.round(slot.width / 10)),
          height: Math.max(1, Math.round(slot.height / 10)),
          emphasis: 'default',
        })),
      }));

      const payload = {
        name: name.trim() || 'Untitled Template',
        description,
        presetKey: 'custom-builder',
        accent: '#9b0044',
        slots: pagePayload[0]?.slots || [],
        pages: pagePayload,
        isActive: true,
      };

      await apiFetch(editingTemplateId ? `/admin/templates/${editingTemplateId}` : '/admin/templates', {
        method: editingTemplateId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      setMessage('Template saved');
      toast.success('Template saved');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save template';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF6F6] text-[#1a1c1d]">
      <header className="border-b border-[#e1bec4] bg-[#FEF6F6]">
        <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/template"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e1bec4] text-[#7a6268] transition-colors hover:border-[#9b0044] hover:text-[#9b0044]"
              aria-label="Back to templates"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="font-['Libre_Caslon_Text'] text-[30px] leading-none text-[#9b0044]">Create Template</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.26em] text-[#7a6268]">Drag, Resize, Customize</p>
            </div>
          </div>

          <button
            type="button"
            onClick={saveTemplate}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-[0.8rem] bg-[#9b0044] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(155,0,68,0.18)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving' : 'Save Template'}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-400 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="space-y-4 rounded-2xl border border-[#e1bec4] bg-[#FEF6F6] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#594045]">Template Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-[#FEF6F6] px-3 py-2.5 text-[14px] outline-none transition focus:border-[#9b0044] focus:shadow-[0_0_0_3px_rgba(155,0,68,0.12)]"
              placeholder="Template name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#594045]">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-[#FEF6F6] px-3 py-2.5 text-[14px] outline-none transition focus:border-[#9b0044] focus:shadow-[0_0_0_3px_rgba(155,0,68,0.12)]"
              placeholder="Short note"
            />
          </div>

          <div className="space-y-2 border-t border-[#f0dde3] pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#594045]">Pages</label>
              <button
                type="button"
                onClick={addPage}
                className="inline-flex items-center gap-1 rounded-full border border-[#e1bec4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a6268] transition-colors hover:border-[#9b0044] hover:text-[#9b0044]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    setCurrentPageIndex(index);
                    setSelectedSlotId(null);
                  }}
                  className={`h-16 w-12 shrink-0 rounded-[0.6rem] border text-[11px] font-bold uppercase tracking-[0.16em] ${index === currentPageIndex ? 'border-[#9b0044] bg-[#9b0044] text-white' : 'border-[#e1bec4] bg-[#FEF6F6] text-[#7a6268]'}`}
                >
                  P{page.id}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-[#f0dde3] pt-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#594045]">Add Shape Slot</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => addSlot('square')} className="flex items-center gap-2 rounded-[0.7rem] border border-[#e1bec4] px-3 py-3 text-[12px] font-semibold text-[#594045] hover:border-[#9b0044] hover:text-[#9b0044]"><Square className="h-4 w-4" />Square</button>
              <button type="button" onClick={() => addSlot('circle')} className="flex items-center gap-2 rounded-[0.7rem] border border-[#e1bec4] px-3 py-3 text-[12px] font-semibold text-[#594045] hover:border-[#9b0044] hover:text-[#9b0044]"><Circle className="h-4 w-4" />Circle</button>
              <button type="button" onClick={() => addSlot('triangle')} className="flex items-center gap-2 rounded-[0.7rem] border border-[#e1bec4] px-3 py-3 text-[12px] font-semibold text-[#594045] hover:border-[#9b0044] hover:text-[#9b0044]"><Triangle className="h-4 w-4" />Triangle</button>
              <button type="button" onClick={() => addSlot('text')} className="flex items-center gap-2 rounded-[0.7rem] border border-[#e1bec4] px-3 py-3 text-[12px] font-semibold text-[#594045] hover:border-[#9b0044] hover:text-[#9b0044]"><Type className="h-4 w-4" />Text</button>
            </div>
          </div>

          {selectedSlot ? (
            <div className="space-y-2 border-t border-[#f0dde3] pt-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#594045]">Selected Slot</label>
                <button
                  type="button"
                  onClick={() => removeSlot(selectedSlot.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#e1bec4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a6268] transition-colors hover:border-[#9b0044] hover:text-[#9b0044]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <input
                value={selectedSlot.label}
                onChange={(event) => updateSlot(selectedSlot.id, { label: event.target.value })}
                className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-[#FEF6F6] px-3 py-2 text-[13px] outline-none transition focus:border-[#9b0044]"
              />

              <label className="space-y-1 text-[12px] text-[#594045]">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Shape</span>
                <select
                  value={selectedSlot.shape}
                  onChange={(event) => updateSlot(selectedSlot.id, { shape: event.target.value as SlotShape })}
                  className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-[#FEF6F6] px-3 py-2 text-[13px] outline-none transition focus:border-[#9b0044]"
                >
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="triangle">Triangle</option>
                  <option value="text">Text</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2 text-[12px] text-[#594045]">
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">X</span>
                  <input type="number" value={Math.round(selectedSlot.x)} onChange={(event) => updateSlot(selectedSlot.id, { x: clamp(Number(event.target.value) || 0, 0, 100 - selectedSlot.width) })} className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-white px-2 py-1.5" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Y</span>
                  <input type="number" value={Math.round(selectedSlot.y)} onChange={(event) => updateSlot(selectedSlot.id, { y: clamp(Number(event.target.value) || 0, 0, 100 - selectedSlot.height) })} className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-white px-2 py-1.5" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">W</span>
                  <input type="number" value={Math.round(selectedSlot.width)} onChange={(event) => updateSlot(selectedSlot.id, { width: clamp(Number(event.target.value) || 8, 8, 100 - selectedSlot.x) })} className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-white px-2 py-1.5" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">H</span>
                  <input type="number" value={Math.round(selectedSlot.height)} onChange={(event) => updateSlot(selectedSlot.id, { height: clamp(Number(event.target.value) || 8, 8, 100 - selectedSlot.y) })} className="w-full rounded-[0.7rem] border border-[#d1d1d6] bg-white px-2 py-1.5" />
                </label>
              </div>
            </div>
          ) : (
            <div className="rounded-[0.8rem] border border-dashed border-[#e1bec4] bg-[#fff8fb] px-3 py-4 text-[12px] text-[#7a6268]">
              Select a slot then drag to move. Use bottom-right handle to resize.
            </div>
          )}

          {message ? <div className="rounded-[0.8rem] border border-[#e1bec4] bg-[#fff8fb] px-3 py-3 text-[12px] text-[#594045]">{message}</div> : null}
        </aside>

        <section className="rounded-2xl border border-[#e1bec4] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a6268]">Page {currentPage?.id}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a6268]">{currentPage?.slots.length || 0} slots</p>
          </div>

          <div className="mx-auto aspect-3/2 w-full max-w-245 rounded-2xl border border-[#ead4dc] bg-[#fcf9fa] p-3">
            <div ref={canvasRef} className="relative h-full w-full rounded-[0.8rem] border border-[#e1bec4] bg-white">
              {currentPage?.slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`absolute overflow-hidden rounded-[0.6rem] border-2 p-1 ${selectedSlotId === slot.id ? 'border-[#9b0044] shadow-[0_0_0_3px_rgba(155,0,68,0.16)]' : 'border-[#e6cfd7]'}`}
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.width}%`,
                    height: `${slot.height}%`,
                  }}
                  onMouseDown={(event) => beginInteraction('drag', event, slot)}
                >
                  <div className="absolute left-1 top-1 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9b0044]">
                    {slot.label}
                  </div>
                  <div className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[#9b0044]">
                    <Move className="h-3 w-3" />
                  </div>

                  <ShapePreview slot={slot} />

                  <button
                    type="button"
                    onMouseDown={(event) => beginInteraction('resize', event, slot)}
                    className="absolute bottom-1 right-1 z-10 h-4 w-4 cursor-se-resize rounded-[0.3rem] bg-[#9b0044]"
                    aria-label="Resize slot"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
