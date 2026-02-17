'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────
interface Vendor {
  _id: string;
  vendor_id: string;
  name: string;
  profilePic?: string | null;
  whatsappNo?: string;
  slipPhoto?: string | null;
  status: string;
  createdAt?: string;
}

interface Template {
  _id: string;
  name: string;
  category: string;
  description?: string;
  status: boolean;
  isDraft?: boolean;
  pagesCount: number;
  albumSize: string;
  coverType: string;
  coverImage?: string;
  usageCount?: number;
  selectedPresets?: string[];
  createdAt?: string;
}

interface LayoutElement {
  type: 'image' | 'text';
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface LayoutPreset {
  _id: string;
  id?: string;
  name: string;
  label: string;
  type: string;
  slots: number;
  thumbnail: string;
  pageCount: number;
  layoutJson: { elements: LayoutElement[] };
  bgColor?: string;
  status?: string;
}

interface CoverPage {
  title: string;
  subtitle: string;
  date: string;
  bgColor: string;
  bgImage?: string;
  textColor: string;
  fontStyle: string;
  overlayOpacity: number;
}

interface AlbumPage {
  presetId: string;
  images: (string | null)[];
}

interface Album {
  _id: string;
  title: string;
  description?: string;
  vendor_id: string;
  template_id: string;
  images?: string[];
  selectedPresets?: string[];
  pages?: AlbumPage[];
  coverPage?: CoverPage | null;
  vendor?: Vendor;
  template?: Template;
  created_at: string;
  updated_at: string;
}

// ─── Constants ────────────────────────────────────────────────
const CANVAS_W = 600;
const CANVAS_H = 400;
const COVER_FONTS = [
  { value: 'serif', label: 'Serif (Classic)' },
  { value: 'sans-serif', label: 'Sans-Serif (Modern)' },
  { value: 'cursive', label: 'Cursive (Elegant)' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Playfair Display', serif", label: 'Playfair' },
];
const COVER_COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#2c3e50', '#1b1b2f', '#2d132c', '#3c1642', '#1a1a1a', '#f5f0e1'];
const TEXT_COLORS = ['#ffffff', '#f8f0e3', '#d4af37', '#c9a96e', '#e8d5b7', '#ffd700', '#f5f5dc', '#dcdcdc'];

// ─── Component ────────────────────────────────────────────────
export default function AlbumCreatePage() {
  // ── State ─────────────────────────────────────────────────
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [presets, setPresets] = useState<LayoutPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [albumSearch, setAlbumSearch] = useState('');

  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [albumImages, setAlbumImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'form' | 'presets' | 'table'>('form');

  // Cover page design
  const [coverPage, setCoverPage] = useState<CoverPage>({
    title: '', subtitle: '', date: '', bgColor: '#1a1a2e',
    textColor: '#ffffff', fontStyle: 'serif', overlayOpacity: 0.4,
  });

  // ─── View Modal (fullscreen album viewer) ───────────────
  const [viewAlbum, setViewAlbum] = useState<Album | null>(null);
  const [viewPresets, setViewPresets] = useState<LayoutPreset[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewCurrentPage, setViewCurrentPage] = useState(0); // 0 = cover
  const pdfRef = useRef<HTMLDivElement>(null);

  // Edit/Delete
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<File[]>([]);
  const [editNewPreviews, setEditNewPreviews] = useState<string[]>([]);
  const [editPresets, setEditPresets] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetchers ──────────────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    try {
      setLoadingVendors(true);
      const res = await fetch(`${API_BASE}/album-vendors`);
      if (res.ok) { const d = await res.json(); setVendors(d.vendors || []); }
    } catch (err) { console.error(err); } finally { setLoadingVendors(false); }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      const res = await fetch(`${API_BASE}/admin/album/templates?${params}`);
      const d = await res.json();
      if (d.success) setTemplates((d.templates || []).filter((t: Template) => t.status && !t.isDraft));
    } catch (err) { console.error(err); } finally { setLoadingTemplates(false); }
  }, [categoryFilter]);

  const fetchPresets = useCallback(async () => {
    try {
      setLoadingPresets(true);
      const res = await fetch(`${API_BASE}/admin/album/presets`);
      const d = await res.json();
      if (d.success) setPresets((d.presets || []).map((p: LayoutPreset) => ({ ...p, id: p._id || p.id })));
    } catch (err) { console.error(err); } finally { setLoadingPresets(false); }
  }, []);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoadingAlbums(true);
      const params = new URLSearchParams();
      if (selectedVendorId) params.append('vendor_id', selectedVendorId);
      const res = await fetch(`${API_BASE}/albums?${params}`);
      const d = await res.json();
      setAlbums(d.albums || []);
    } catch (err) { console.error(err); } finally { setLoadingAlbums(false); }
  }, [selectedVendorId]);

  useEffect(() => { fetchVendors(); fetchTemplates(); fetchPresets(); }, [fetchVendors, fetchTemplates, fetchPresets]);
  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  useEffect(() => {
    if (selectedTemplateId) {
      const tmpl = templates.find((t) => t._id === selectedTemplateId);
      if (tmpl?.selectedPresets?.length) setSelectedPresets(tmpl.selectedPresets);
    }
  }, [selectedTemplateId, templates]);

  // ── Image handling ────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAlbumImages((p) => [...p, ...files]);
    setImagePreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
  };
  const removeImage = (i: number) => {
    setAlbumImages((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => { URL.revokeObjectURL(p[i]); return p.filter((_, idx) => idx !== i); });
  };

  const togglePreset = (pid: string) => {
    const max = selectedTemplate?.pagesCount || 50;
    if (selectedPresets.includes(pid)) setSelectedPresets(selectedPresets.filter((id) => id !== pid));
    else if (selectedPresets.length < max) setSelectedPresets([...selectedPresets, pid]);
  };

  // ── Find a preset by _id, id, or name ─────────────────────
  const findPreset = (pid: string, presetList: LayoutPreset[]): LayoutPreset | undefined => {
    return presetList.find((p) =>
      p._id === pid || (p.id && p.id === pid) || p.name === pid
    );
  };

  // ── Build pages from presets + images ─────────────────────
  const buildPages = (presetIds: string[], imageUrls: string[], presetList?: LayoutPreset[]): AlbumPage[] => {
    const list = presetList || presets;
    let imgIdx = 0;
    return presetIds.map((pid) => {
      const preset = findPreset(pid, list);
      const slotCount = preset?.slots || 1;
      const images: (string | null)[] = [];
      for (let s = 0; s < slotCount; s++) {
        images.push(imgIdx < imageUrls.length ? imageUrls[imgIdx++] : null);
      }
      return { presetId: preset?._id || pid, images };
    });
  };

  // ── Create album ──────────────────────────────────────────
  const handleCreate = async () => {
    setSuccessMsg(''); setErrorMsg('');
    if (!selectedVendorId) return setErrorMsg('Please select a vendor');
    if (!selectedTemplateId) return setErrorMsg('Please select a template');
    if (!albumTitle.trim()) return setErrorMsg('Please enter album title');

    try {
      setCreating(true);
      let uploadedUrls: string[] = [];
      if (albumImages.length > 0) {
        const fd = new FormData();
        albumImages.forEach((f) => fd.append('images', f));
        try {
          const upRes = await fetch(`${API_BASE}/upload/multiple`, { method: 'POST', body: fd });
          if (upRes.ok) {
            const upData = await upRes.json();
            uploadedUrls = upData.urls || upData.files?.map((f: { url: string }) => f.url) || [];
          }
        } catch { console.warn('Image upload failed'); }
      }

      const pages = buildPages(selectedPresets, uploadedUrls);
      const cover: CoverPage = {
        ...coverPage,
        title: coverPage.title || albumTitle.trim(),
        subtitle: coverPage.subtitle || albumDescription.trim(),
      };

      const res = await fetch(`${API_BASE}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: selectedVendorId,
          template_id: selectedTemplateId,
          title: albumTitle.trim(),
          description: albumDescription.trim(),
          images: uploadedUrls,
          selectedPresets,
          pages,
          coverPage: cover,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setSuccessMsg('Album created successfully!');
        setAlbumTitle(''); setAlbumDescription(''); setSelectedTemplateId('');
        setSelectedPresets([]); setAlbumImages([]); setImagePreviews([]);
        setCoverPage({ title: '', subtitle: '', date: '', bgColor: '#1a1a2e', textColor: '#ffffff', fontStyle: 'serif', overlayOpacity: 0.4 });
        fetchAlbums();
      } else { setErrorMsg(d.error || 'Failed to create album'); }
    } catch (err) { console.error(err); setErrorMsg('Something went wrong'); }
    finally { setCreating(false); }
  };

  // ── View album (fullscreen) ───────────────────────────────
  const openViewModal = async (albumId: string) => {
    try {
      setViewLoading(true);
      const res = await fetch(`${API_BASE}/albums/${albumId}`);
      const d = await res.json();
      if (res.ok) {
        const album = d.album;
        const fetchedPresets: LayoutPreset[] = d.presets || [];

        // Auto-build pages if album has selectedPresets but no pages
        if ((!album.pages || album.pages.length === 0) && album.selectedPresets?.length > 0) {
          const albumImages = album.images || [];
          album.pages = buildPages(album.selectedPresets, albumImages, fetchedPresets);
        }

        // Auto-generate a cover page if none exists
        if (!album.coverPage) {
          album.coverPage = {
            title: album.title || 'Album',
            subtitle: album.description || '',
            date: album.created_at ? new Date(album.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
            bgColor: '#1a1a2e',
            textColor: '#ffffff',
            fontStyle: 'serif',
            overlayOpacity: 0.4,
          };
        }

        setViewAlbum(album);
        setViewPresets(fetchedPresets);
        setViewCurrentPage(0);
      }
    } catch (err) { console.error(err); }
    finally { setViewLoading(false); }
  };

  // ── Edit album ────────────────────────────────────────────
  const openEditModal = async (albumId: string) => {
    try {
      const res = await fetch(`${API_BASE}/albums/${albumId}`);
      const d = await res.json();
      if (res.ok) {
        const a = d.album;
        setEditAlbum(a); setEditTitle(a.title || ''); setEditDescription(a.description || '');
        setEditImages(a.images || []); setEditPresets(a.selectedPresets || []);
        setEditNewImages([]); setEditNewPreviews([]);
      }
    } catch (err) { console.error(err); }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setEditNewImages((p) => [...p, ...files]);
    setEditNewPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleEditSave = async () => {
    if (!editAlbum) return;
    try {
      setEditSaving(true);
      let newUrls: string[] = [];
      if (editNewImages.length > 0) {
        const fd = new FormData();
        editNewImages.forEach((f) => fd.append('images', f));
        try {
          const upRes = await fetch(`${API_BASE}/upload/multiple`, { method: 'POST', body: fd });
          if (upRes.ok) { const upD = await upRes.json(); newUrls = upD.urls || upD.files?.map((f: { url: string }) => f.url) || []; }
        } catch { console.warn('Upload failed'); }
      }
      const allImages = [...editImages, ...newUrls];
      const pages = buildPages(editPresets, allImages);
      const res = await fetch(`${API_BASE}/albums/${editAlbum._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), description: editDescription.trim(), images: allImages, selectedPresets: editPresets, pages }),
      });
      if (res.ok) { setEditAlbum(null); fetchAlbums(); setSuccessMsg('Album updated!'); }
      else setErrorMsg('Failed to update');
    } catch (err) { console.error(err); setErrorMsg('Something went wrong'); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE}/albums/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { setDeleteId(null); fetchAlbums(); setSuccessMsg('Album deleted!'); }
      else setErrorMsg('Failed to delete');
    } catch (err) { console.error(err); } finally { setDeleting(false); }
  };

  // ── PDF Download ──────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !viewAlbum) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pages = pdfRef.current.querySelectorAll('[data-album-page]');
      if (!pages.length) return;

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [600, 400] });

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2, useCORS: true, allowTaint: true, backgroundColor: null,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage([600, 400], 'landscape');
        pdf.addImage(imgData, 'JPEG', 0, 0, 600, 400);
      }
      pdf.save(`${viewAlbum.title || 'album'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF download failed. Make sure html2canvas and jspdf are installed.\nRun: npm install html2canvas jspdf');
    }
  };

  // ── Filters ───────────────────────────────────────────────
  const filteredVendors = vendors.filter((v) => {
    const q = vendorSearch.toLowerCase();
    return ((v.name || '').toLowerCase().includes(q) || (v.whatsappNo || '').toLowerCase().includes(q))
      && (vendorStatusFilter === 'all' || v.status === vendorStatusFilter);
  });
  const filteredTemplates = templates.filter((t) => {
    const q = templateSearch.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });
  const filteredAlbums = albums.filter((a) => {
    const q = albumSearch.toLowerCase();
    return a.title?.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) || (a.vendor?.name || '').toLowerCase().includes(q);
  });

  const selectedVendor = vendors.find((v) => v._id === selectedVendorId);
  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  const getStatusColor = (s?: string) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ── Render a single page with preset layout ───────────────
  const renderAlbumPage = (page: AlbumPage, pageIndex: number, allPresets: LayoutPreset[], forPdf = false) => {
    const preset = findPreset(page.presetId, allPresets);
    const elements = preset?.layoutJson?.elements || [];
    const imageSlots = elements.filter((e) => e.type === 'image');
    const bgColor = preset?.bgColor || '#FFFFFF';

    return (
      <div
        key={pageIndex}
        data-album-page
        className={`relative ${forPdf ? '' : 'shadow-lg rounded-lg overflow-hidden'}`}
        style={{
          width: forPdf ? 600 : '100%',
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          backgroundColor: bgColor,
        }}
      >
        {/* Page number badge */}
        {!forPdf && (
          <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-black/40 text-white text-[10px] rounded-full backdrop-blur-sm">
            Page {pageIndex + 1}
          </div>
        )}

        {/* Preset label */}
        {!forPdf && preset && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-white/70 text-gray-700 text-[9px] rounded-full backdrop-blur-sm font-medium">
            {preset.label} ({preset.slots} slots)
          </div>
        )}

        {/* Render each image slot */}
        {imageSlots.map((slot, si) => {
          const img = page.images?.[si];
          const style = {
            position: 'absolute' as const,
            left: `${(slot.x / CANVAS_W) * 100}%`,
            top: `${(slot.y / CANVAS_H) * 100}%`,
            width: `${(slot.w / CANVAS_W) * 100}%`,
            height: `${(slot.h / CANVAS_H) * 100}%`,
            borderRadius: slot.radius ? `${slot.radius}px` : '0',
            overflow: 'hidden' as const,
          };
          return (
            <div key={si} style={style}>
              {img ? (
                <img src={img} alt={`Page ${pageIndex + 1} Slot ${si + 1}`} className="w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-200">
                  <div className="text-center">
                    <span className="text-gray-300 text-lg block">🖼️</span>
                    <span className="text-gray-300 text-[9px]">Slot {si + 1}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Render text elements */}
        {elements.filter((e) => e.type === 'text').map((el, ti) => (
          <div
            key={`t-${ti}`}
            style={{
              position: 'absolute',
              left: `${(el.x / CANVAS_W) * 100}%`,
              top: `${(el.y / CANVAS_H) * 100}%`,
              fontSize: `${el.fontSize || 16}px`,
              fontFamily: el.fontFamily || 'Inter',
              color: el.color || '#1F2937',
            }}
          >
            {el.text}
          </div>
        ))}
      </div>
    );
  };

  // ── Render cover page ─────────────────────────────────────
  const renderCoverPage = (cover: CoverPage, forPdf = false) => (
    <div
      data-album-page
      className={`relative flex items-center justify-center ${forPdf ? '' : 'shadow-lg rounded-lg overflow-hidden'}`}
      style={{
        width: forPdf ? 600 : '100%',
        aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
        backgroundColor: cover.bgColor,
        backgroundImage: cover.bgImage ? `url(${cover.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      {cover.bgImage && (
        <div className="absolute inset-0" style={{ backgroundColor: cover.bgColor, opacity: cover.overlayOpacity }} />
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-8 space-y-3">
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ color: cover.textColor, fontFamily: cover.fontStyle }}
        >
          {cover.title || 'Album Title'}
        </h1>
        {cover.subtitle && (
          <p className="text-lg opacity-80" style={{ color: cover.textColor, fontFamily: cover.fontStyle }}>
            {cover.subtitle}
          </p>
        )}
        {cover.date && (
          <p className="text-sm opacity-60 tracking-widest uppercase" style={{ color: cover.textColor }}>
            {cover.date}
          </p>
        )}

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="w-12 h-[1px]" style={{ backgroundColor: cover.textColor, opacity: 0.4 }} />
          <span style={{ color: cover.textColor, opacity: 0.5 }} className="text-xs">&#10022;</span>
          <div className="w-12 h-[1px]" style={{ backgroundColor: cover.textColor, opacity: 0.4 }} />
        </div>
      </div>

      {!forPdf && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/20 text-white text-[10px] rounded-full backdrop-blur-sm">Cover</div>
      )}
    </div>
  );

  // ── Total view pages ──────────────────────────────────────
  const viewPagesList = viewAlbum?.pages || [];
  const viewCover = viewAlbum?.coverPage;
  const totalViewPages = (viewCover ? 1 : 0) + viewPagesList.length;

  // ━━━━━━━━━━━━━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* ── Header ────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>Album Vendors</span><span>&rarr;</span>
            <span className="text-rose-600 font-medium">Create Album</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Album for Vendor</h1>
          <p className="text-gray-500 mt-1">Select vendor, pick template, design cover, add images &amp; presets</p>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
            <span className="text-green-600 text-lg">&#9989;</span>
            <span className="text-green-700 font-medium">{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-500 hover:text-green-700">&times;</button>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
            <span className="text-red-600 text-lg">&#9888;&#65039;</span>
            <span className="text-red-700 font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
          </div>
        )}

        {/* Mobile Tabs */}
        <div className="lg:hidden flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          {(['form', 'presets', 'table'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === tab ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {tab === 'form' ? 'Form' : tab === 'presets' ? 'Presets' : 'Albums'}
            </button>
          ))}
        </div>

        {/* ═══════════════ GRID ════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ═══ LEFT COL (5) — Form ═══════════════════════════ */}
          <div className={`lg:col-span-5 space-y-6 ${activeTab !== 'form' ? 'hidden lg:block' : ''}`}>

            {/* Step 1: Select Vendor */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm font-bold">1</span>
                Select Album Vendor
                <span className="ml-auto px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-semibold">{filteredVendors.length}</span>
              </h2>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#128269;</span>
                  <input type="text" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} placeholder="Search vendor..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                </div>
                <select value={vendorStatusFilter} onChange={(e) => setVendorStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white text-sm">
                  <option value="all">All</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {loadingVendors ? <div className="text-center py-6 text-gray-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2" />Loading...</div>
                  : filteredVendors.length === 0 ? <div className="text-center py-6 text-gray-400">No vendors found</div>
                  : filteredVendors.map((v) => (
                    <button key={v._id} onClick={() => setSelectedVendorId(v._id)} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedVendorId === v._id ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        {v.profilePic ? <img src={v.profilePic} alt={v.name} className="w-10 h-10 rounded-full object-cover" /> : <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${selectedVendorId === v._id ? 'bg-rose-200' : 'bg-purple-100'}`}>&#128247;</div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 truncate">{v.name || 'Unnamed'}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(v.status)}`}>{v.status || 'unknown'}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{v.whatsappNo || '\u2014'}</p>
                        </div>
                        {selectedVendorId === v._id && <span className="text-rose-600 font-bold text-lg">&#10003;</span>}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Step 2: Select Template */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm font-bold">2</span>
                Select Template
              </h2>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#128269;</span>
                  <input type="text" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white text-sm">
                  <option value="all">All</option><option value="wedding">Wedding</option><option value="engagement">Engagement</option><option value="pre-shoot">Pre-shoot</option>
                </select>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {loadingTemplates ? <div className="text-center py-6 text-gray-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2" />Loading...</div>
                  : filteredTemplates.length === 0 ? <div className="text-center py-6 text-gray-400">No templates found</div>
                  : filteredTemplates.map((t) => (
                    <button key={t._id} onClick={() => setSelectedTemplateId(t._id)} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedTemplateId === t._id ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        {t.coverImage ? <img src={t.coverImage} alt={t.name} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-xl">&#127912;</div>}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{t.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">{t.category}</span>
                            <span>{t.pagesCount}p</span><span>{t.albumSize}</span>
                          </div>
                        </div>
                        {selectedTemplateId === t._id && <span className="text-rose-600 font-bold text-lg">&#10003;</span>}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Step 3: Cover Page Design */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm font-bold">3</span>
                Cover Page Design
              </h2>
              <div className="space-y-3">
                {/* Live Preview */}
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  {renderCoverPage({
                    ...coverPage,
                    title: coverPage.title || albumTitle || 'Album Title',
                    subtitle: coverPage.subtitle || albumDescription || 'Your beautiful memories',
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cover Title</label>
                    <input type="text" value={coverPage.title} onChange={(e) => setCoverPage({ ...coverPage, title: e.target.value })} placeholder={albumTitle || 'Album Title'} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
                    <input type="text" value={coverPage.subtitle} onChange={(e) => setCoverPage({ ...coverPage, subtitle: e.target.value })} placeholder="A love story..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                    <input type="text" value={coverPage.date} onChange={(e) => setCoverPage({ ...coverPage, date: e.target.value })} placeholder="February 14, 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Font Style</label>
                    <select value={coverPage.fontStyle} onChange={(e) => setCoverPage({ ...coverPage, fontStyle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 bg-white">
                      {COVER_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Color pickers */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Background Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {COVER_COLORS.map((c) => (
                      <button key={c} onClick={() => setCoverPage({ ...coverPage, bgColor: c })} className={`w-7 h-7 rounded-lg border-2 transition-all ${coverPage.bgColor === c ? 'border-rose-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                    <input type="color" value={coverPage.bgColor} onChange={(e) => setCoverPage({ ...coverPage, bgColor: e.target.value })} className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Text Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {TEXT_COLORS.map((c) => (
                      <button key={c} onClick={() => setCoverPage({ ...coverPage, textColor: c })} className={`w-7 h-7 rounded-lg border-2 transition-all ${coverPage.textColor === c ? 'border-rose-500 scale-110' : 'border-gray-300'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Cover Background Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Background Image (optional)</label>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg p-2 text-center hover:border-rose-300 text-xs text-gray-400">
                      Upload cover image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setCoverPage({ ...coverPage, bgImage: URL.createObjectURL(file) });
                      }} />
                    </label>
                    {coverPage.bgImage && (
                      <button onClick={() => setCoverPage({ ...coverPage, bgImage: undefined })} className="px-3 py-2 bg-red-50 text-red-500 rounded-lg text-xs">&times;</button>
                    )}
                  </div>
                  {coverPage.bgImage && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Overlay Opacity</label>
                      <input type="range" min="0" max="1" step="0.05" value={coverPage.overlayOpacity} onChange={(e) => setCoverPage({ ...coverPage, overlayOpacity: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 4: Album Details + Images */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-sm font-bold">4</span>
                Album Details &amp; Images
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Album Title *</label>
                  <input type="text" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} placeholder="e.g., Our Fairy Tale Wedding" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={albumDescription} onChange={(e) => setAlbumDescription(e.target.value)} placeholder="Short description..." rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none" />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Album Images</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-all">
                    {imagePreviews.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {imagePreviews.map((p, i) => (
                            <div key={i} className="relative group">
                              <img src={p} alt="" className="w-full h-16 object-cover rounded-lg" />
                              <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100">&times;</button>
                              <span className="absolute bottom-0.5 left-0.5 px-1 py-0.5 bg-black/50 text-white text-[8px] rounded">{i + 1}</span>
                            </div>
                          ))}
                          <label className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-rose-300">
                            <span className="text-gray-400 text-lg">+</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 text-center">{imagePreviews.length} image(s)</p>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                        <span className="text-3xl">&#128248;</span>
                        <span className="text-sm text-gray-500">Upload album images</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium text-gray-800">{selectedVendor?.name || '\u2014'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Template</span><span className="font-medium text-gray-800">{selectedTemplate?.name || '\u2014'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Images</span><span className="font-medium text-gray-800">{albumImages.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Pages</span><span className="font-medium text-gray-800">{selectedPresets.length}{selectedTemplate ? ` / ${selectedTemplate.pagesCount}` : ''}</span></div>
                </div>

                <button onClick={handleCreate} disabled={creating || !selectedVendorId || !selectedTemplateId || !albumTitle.trim()} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? 'Creating...' : 'Create Album'}
                </button>
              </div>
            </div>
          </div>

          {/* ═══ CENTER COL (3) — Presets ══════════════════════ */}
          <div className={`lg:col-span-3 ${activeTab !== 'presets' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-gray-800">Layout Presets</h2>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{selectedPresets.length}{selectedTemplate ? `/${selectedTemplate.pagesCount}` : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">Each preset = 1 album page</p>
                  {selectedPresets.length > 0 && <button onClick={() => setSelectedPresets([])} className="text-[10px] text-rose-600 font-medium">Clear All</button>}
                </div>
              </div>
              <div className="p-3 max-h-[550px] overflow-y-auto">
                {loadingPresets ? <div className="text-center py-10 text-gray-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2" /></div>
                  : presets.length === 0 ? <div className="text-center py-10 text-gray-400">No presets found</div>
                  : <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => {
                      const pid = preset.id || preset._id;
                      const isSelected = selectedPresets.includes(pid);
                      const maxReached = !isSelected && selectedTemplate && selectedPresets.length >= selectedTemplate.pagesCount;
                      return (
                        <div key={pid} onClick={() => !maxReached && togglePreset(pid)} className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-rose-500 bg-rose-50 shadow-md' : maxReached ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed' : 'border-gray-100 hover:border-rose-200'}`}>
                          {/* Mini preview of the grid layout */}
                          <div className="relative w-full bg-gray-50 rounded-lg mb-1" style={{ aspectRatio: '3/2' }}>
                            {preset.layoutJson?.elements?.filter(e => e.type === 'image').map((el, i) => (
                              <div key={i} className="absolute bg-gray-200 rounded-sm" style={{
                                left: `${(el.x / CANVAS_W) * 100}%`, top: `${(el.y / CANVAS_H) * 100}%`,
                                width: `${(el.w / CANVAS_W) * 100}%`, height: `${(el.h / CANVAS_H) * 100}%`,
                                borderRadius: el.radius ? `${Math.min(el.radius, 4)}px` : '0',
                              }} />
                            ))}
                          </div>
                          <p className="font-semibold text-gray-800 text-[10px] truncate">{preset.label}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] text-gray-500">{preset.slots} slot{preset.slots > 1 ? 's' : ''}</span>
                            <span className={`text-[9px] font-medium ${isSelected ? 'text-rose-600' : 'text-gray-400'}`}>{isSelected ? '&#10003; Added' : preset.type}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>}
              </div>
              {selectedPresets.length > 0 && (
                <div className="p-2 border-t border-gray-100 bg-green-50">
                  <p className="text-[10px] font-medium text-green-700 text-center">{selectedPresets.length} page(s) configured</p>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT COL (4) — Albums Table ═════════════════ */}
          <div className={`lg:col-span-4 space-y-6 ${activeTab !== 'table' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  Albums
                  {selectedVendor && <span className="text-sm font-normal text-gray-500">&mdash; {selectedVendor.name}</span>}
                  <span className="ml-1 px-2 py-0.5 text-xs bg-rose-100 text-rose-600 rounded-full font-semibold">{filteredAlbums.length}</span>
                </h2>
                <div className="relative w-full sm:w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#128269;</span>
                  <input type="text" value={albumSearch} onChange={(e) => setAlbumSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-left">
                      <th className="px-3 py-2.5 rounded-tl-xl font-semibold text-xs">#</th>
                      <th className="px-3 py-2.5 font-semibold text-xs">Title</th>
                      <th className="px-3 py-2.5 font-semibold text-xs">Vendor</th>
                      <th className="px-3 py-2.5 font-semibold text-xs">Pages</th>
                      <th className="px-3 py-2.5 rounded-tr-xl font-semibold text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingAlbums ? (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2" />Loading...</td></tr>
                    ) : filteredAlbums.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-400">{selectedVendorId ? 'No albums for this vendor' : 'No albums found'}</td></tr>
                    ) : filteredAlbums.map((album, idx) => (
                      <tr key={album._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-gray-500 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-800 text-xs max-w-[100px] truncate">{album.title || '\u2014'}</td>
                        <td className="px-3 py-2.5 text-gray-600 text-xs max-w-[80px] truncate">{album.vendor?.name || '\u2014'}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs">{album.pages?.length || 0}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <button onClick={() => openViewModal(album._id)} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="View Album">View</button>
                            <button onClick={() => openEditModal(album._id)} className="px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Edit">Edit</button>
                            <button onClick={() => setDeleteId(album._id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete">Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Total Albums</p><p className="text-xl font-bold">{albums.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Vendors</p><p className="text-xl font-bold">{vendors.length}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Templates</p><p className="text-xl font-bold">{templates.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white">
                <p className="text-white/80 text-[10px]">Presets</p><p className="text-xl font-bold">{presets.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━ FULLSCREEN ALBUM VIEWER ━━━━━━━━━━━━━ */}
      {(viewAlbum || viewLoading) && (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
          {/* Viewer Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setViewAlbum(null)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg">&larr;</button>
              {viewAlbum && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewAlbum.title}</h2>
                  <p className="text-xs text-gray-500">
                    {viewAlbum.vendor?.name || ''} &bull; {viewAlbum.template?.name || ''} &bull; {totalViewPages} pages
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Page navigation */}
              {viewAlbum && totalViewPages > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                  <button onClick={() => setViewCurrentPage(Math.max(0, viewCurrentPage - 1))} disabled={viewCurrentPage === 0} className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center disabled:opacity-30 text-sm">&laquo;</button>
                  <span className="text-xs font-medium text-gray-700 min-w-[60px] text-center">
                    {viewCurrentPage === 0 && viewCover ? 'Cover' : `Page ${viewCover ? viewCurrentPage : viewCurrentPage + 1}`}
                  </span>
                  <button onClick={() => setViewCurrentPage(Math.min(totalViewPages - 1, viewCurrentPage + 1))} disabled={viewCurrentPage >= totalViewPages - 1} className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center disabled:opacity-30 text-sm">&raquo;</button>
                </div>
              )}
              <button onClick={handleDownloadPDF} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700 flex items-center gap-1">
                PDF Download
              </button>
              <button onClick={() => { setViewAlbum(null); if (viewAlbum) openEditModal(viewAlbum._id); }} className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg hover:bg-amber-100">
                Edit
              </button>
              <button onClick={() => setViewAlbum(null)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">&times;</button>
            </div>
          </div>

          {/* Viewer Body */}
          {viewLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading album...</p>
              </div>
            </div>
          ) : viewAlbum ? (
            <div className="flex-1 overflow-y-auto">
              {/* ── All pages stacked for scrolling + PDF ── */}
              <div ref={pdfRef} className="max-w-4xl mx-auto py-8 px-4 space-y-8">

                {/* Cover Page */}
                {viewCover && (
                  <div className={`transition-all duration-300 ${viewCurrentPage === 0 ? 'ring-2 ring-rose-500 ring-offset-4 rounded-xl' : ''}`}>
                    {renderCoverPage(viewCover)}
                  </div>
                )}

                {/* Album Pages with grid layouts */}
                {viewPagesList.map((page, i) => {
                  const actualPageIdx = viewCover ? i + 1 : i;
                  return (
                    <div key={i} className={`transition-all duration-300 ${viewCurrentPage === actualPageIdx ? 'ring-2 ring-rose-500 ring-offset-4 rounded-xl' : ''}`}>
                      {renderAlbumPage(page, i, viewPresets)}
                    </div>
                  );
                })}

                {/* If no pages exist, show flat images */}
                {viewPagesList.length === 0 && viewAlbum.images && viewAlbum.images.length > 0 && (
                  <div className="space-y-6">
                    <div className="text-center text-gray-500 text-sm py-4">
                      <p className="font-medium">This album has {viewAlbum.images.length} images but no page layouts configured.</p>
                      <p className="text-xs text-gray-400 mt-1">Edit the album to assign presets and build page layouts.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {viewAlbum.images.map((img, i) => (
                        <img key={i} src={img} alt={`Image ${i + 1}`} className="w-full aspect-[3/2] object-cover rounded-xl shadow-md" />
                      ))}
                    </div>
                  </div>
                )}

                {/* No content fallback */}
                {viewPagesList.length === 0 && (!viewAlbum.images || viewAlbum.images.length === 0) && !viewCover && (
                  <div className="text-center py-20 text-gray-400">
                    <span className="text-5xl block mb-4">&#128218;</span>
                    <p className="text-lg font-medium">Empty Album</p>
                    <p className="text-sm mt-1">Add images and configure presets to populate this album.</p>
                  </div>
                )}
              </div>

              {/* Page thumbnails strip at bottom */}
              {totalViewPages > 1 && (
                <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-3">
                  <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto pb-1">
                    {viewCover && (
                      <button
                        onClick={() => {
                          setViewCurrentPage(0);
                          pdfRef.current?.querySelector('[data-album-page]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${viewCurrentPage === 0 ? 'border-rose-500 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                      >
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: viewCover.bgColor }}>
                          Cover
                        </div>
                      </button>
                    )}
                    {viewPagesList.map((page, i) => {
                      const idx = viewCover ? i + 1 : i;
                      const preset = viewPresets.find((p) => p._id === page.presetId || (p.id || p._id) === page.presetId);
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setViewCurrentPage(idx);
                            const allPages = pdfRef.current?.querySelectorAll('[data-album-page]');
                            if (allPages && allPages[idx]) allPages[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${viewCurrentPage === idx ? 'border-rose-500 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                        >
                          <div className="w-full h-full relative" style={{ backgroundColor: preset?.bgColor || '#f3f4f6' }}>
                            {page.images?.[0] ? (
                              <img src={page.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">P{i + 1}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ EDIT MODAL ━━━━━━━━━━━━━━━━━━━━━ */}
      {editAlbum && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditAlbum(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Edit Album</h2>
              <button onClick={() => setEditAlbum(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">&times;</button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Album Title *</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Images <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] rounded-full">{editImages.length}</span></label>
                {editImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {editImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-full h-16 object-cover rounded-lg" />
                        <button onClick={() => setEditImages((p) => p.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100">&times;</button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400">No images</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Add New Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 hover:border-rose-300">
                  {editNewPreviews.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {editNewPreviews.map((p, i) => (
                        <div key={i} className="relative group">
                          <img src={p} alt="" className="w-full h-16 object-cover rounded-lg" />
                          <button onClick={() => { setEditNewImages((prev) => prev.filter((_, idx) => idx !== i)); setEditNewPreviews((prev) => { URL.revokeObjectURL(prev[i]); return prev.filter((_, idx) => idx !== i); }); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100">&times;</button>
                        </div>
                      ))}
                      <label className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-rose-300"><span className="text-gray-400">+</span><input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" /></label>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex items-center justify-center gap-2 py-3 text-sm text-gray-500"><span className="text-xl">&#128248;</span>Upload<input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" /></label>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Layout Presets <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] rounded-full">{editPresets.length}</span></label>
                {presets.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                    {presets.map((preset) => {
                      const pid = preset.id || preset._id;
                      const isSel = editPresets.includes(pid);
                      return (
                        <div key={pid} onClick={() => { if (isSel) setEditPresets(editPresets.filter((id) => id !== pid)); else setEditPresets([...editPresets, pid]); }} className={`p-1.5 rounded-lg border-2 cursor-pointer transition-all text-center ${isSel ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-rose-200'}`}>
                          <div className="relative w-full bg-gray-50 rounded mb-0.5" style={{ aspectRatio: '3/2' }}>
                            {preset.layoutJson?.elements?.filter(e => e.type === 'image').map((el, i) => (
                              <div key={i} className="absolute bg-gray-200 rounded-sm" style={{ left: `${(el.x / CANVAS_W) * 100}%`, top: `${(el.y / CANVAS_H) * 100}%`, width: `${(el.w / CANVAS_W) * 100}%`, height: `${(el.h / CANVAS_H) * 100}%` }} />
                            ))}
                          </div>
                          <p className="text-[9px] font-medium text-gray-700 truncate">{preset.label}</p>
                          {isSel && <span className="text-[9px] text-rose-600 font-bold">&#10003;</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-gray-400">No presets</p>}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end gap-2 rounded-b-2xl">
              <button onClick={() => setEditAlbum(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={handleEditSave} disabled={editSaving || !editTitle.trim()} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg disabled:opacity-50 text-sm">
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ DELETE CONFIRM ━━━━━━━━━━━━━━━━━━ */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <span className="text-5xl block mb-3">&#128465;&#65039;</span>
              <h3 className="text-lg font-bold text-gray-900">Delete Album?</h3>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
