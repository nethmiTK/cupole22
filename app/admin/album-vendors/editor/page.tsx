'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Preset {
  _id?: string;
  id: string;
  name: string;
  label: string;
  type: string;
  slots: number;
  thumbnail: string;
  pageCount: number;
  layoutJson?: { elements: CanvasElement[] };
  bgColor?: string;
  status?: string;
}

type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'heart' | 'star' | 'line' | 'diamond' | 'hexagon' | 'pentagon' | 'octagon' | 'arch' | 'cloud' | 'blob';
type FrameType = 'circle-frame' | 'square-frame' | 'heart-frame' | 'star-frame' | 'arch-frame' | 'hexagon-frame' | 'polaroid' | 'vintage' | 'rounded-frame' | 'diamond-frame';
type GridType = '2x1' | '1x2' | '2x2' | '3x1' | '1x3' | '3x3' | '2x3' | '3x2' | 'mosaic-1' | 'mosaic-2';
type TextStyleType = 'heading' | 'subheading' | 'body' | 'caption' | 'quote' | 'script' | 'bold-title' | 'elegant' | 'modern' | 'vintage-text';

interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'shape' | 'frame' | 'grid';
  shapeType?: ShapeType;
  frameType?: FrameType;
  gridType?: GridType;
  textStyle?: TextStyleType;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  shadowColor?: string;
  shadowBlur?: number;
  opacity?: number;
  imageUrl?: string;
  gridSlots?: { x: number; y: number; width: number; height: number; imageUrl?: string }[];
}

// Shape Options - Extended
const shapeOptions: { type: ShapeType; icon: string; label: string }[] = [
  { type: 'rectangle', icon: '⬛', label: 'Rectangle' },
  { type: 'circle', icon: '⭕', label: 'Circle' },
  { type: 'triangle', icon: '🔺', label: 'Triangle' },
  { type: 'heart', icon: '❤️', label: 'Heart' },
  { type: 'star', icon: '⭐', label: 'Star' },
  { type: 'diamond', icon: '💎', label: 'Diamond' },
  { type: 'hexagon', icon: '⬡', label: 'Hexagon' },
  { type: 'pentagon', icon: '⬠', label: 'Pentagon' },
  { type: 'octagon', icon: '🛑', label: 'Octagon' },
  { type: 'arch', icon: '🌈', label: 'Arch' },
  { type: 'cloud', icon: '☁️', label: 'Cloud' },
  { type: 'blob', icon: '💧', label: 'Blob' },
  { type: 'line', icon: '➖', label: 'Line' },
];

// Frame Options - Images can be placed inside
const frameOptions: { type: FrameType; icon: string; label: string }[] = [
  { type: 'circle-frame', icon: '🔵', label: 'Circle' },
  { type: 'square-frame', icon: '🟦', label: 'Square' },
  { type: 'rounded-frame', icon: '🔲', label: 'Rounded' },
  { type: 'heart-frame', icon: '💗', label: 'Heart' },
  { type: 'star-frame', icon: '🌟', label: 'Star' },
  { type: 'arch-frame', icon: '🚪', label: 'Arch' },
  { type: 'hexagon-frame', icon: '⬡', label: 'Hexagon' },
  { type: 'diamond-frame', icon: '🔷', label: 'Diamond' },
  { type: 'polaroid', icon: '📸', label: 'Polaroid' },
  { type: 'vintage', icon: '🖼️', label: 'Vintage' },
];

// Grid Layout Options
const gridOptions: { type: GridType; icon: string; label: string; cols: number; rows: number }[] = [
  { type: '2x1', icon: '⬜⬜', label: '2 Horizontal', cols: 2, rows: 1 },
  { type: '1x2', icon: '⬜\n⬜', label: '2 Vertical', cols: 1, rows: 2 },
  { type: '2x2', icon: '⊞', label: '4 Grid', cols: 2, rows: 2 },
  { type: '3x1', icon: '▢▢▢', label: '3 Horizontal', cols: 3, rows: 1 },
  { type: '1x3', icon: '▢\n▢\n▢', label: '3 Vertical', cols: 1, rows: 3 },
  { type: '3x3', icon: '▦', label: '9 Grid', cols: 3, rows: 3 },
  { type: '2x3', icon: '⊟⊟', label: '6 Grid (2x3)', cols: 2, rows: 3 },
  { type: '3x2', icon: '⊟⊟⊟', label: '6 Grid (3x2)', cols: 3, rows: 2 },
  { type: 'mosaic-1', icon: '🔲', label: 'Mosaic A', cols: 3, rows: 2 },
  { type: 'mosaic-2', icon: '🔳', label: 'Mosaic B', cols: 2, rows: 3 },
];

// Text Style Presets
const textStylePresets: { type: TextStyleType; label: string; fontFamily: string; fontSize: number; fontWeight: string; fontStyle: string; letterSpacing: number; color: string }[] = [
  { type: 'heading', label: 'Heading', fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 'bold', fontStyle: 'normal', letterSpacing: 0, color: '#1F2937' },
  { type: 'subheading', label: 'Subheading', fontFamily: 'Inter', fontSize: 24, fontWeight: '600', fontStyle: 'normal', letterSpacing: 0.5, color: '#374151' },
  { type: 'body', label: 'Body Text', fontFamily: 'Inter', fontSize: 16, fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 0, color: '#4B5563' },
  { type: 'caption', label: 'Caption', fontFamily: 'Inter', fontSize: 12, fontWeight: 'normal', fontStyle: 'italic', letterSpacing: 0.5, color: '#6B7280' },
  { type: 'quote', label: 'Quote', fontFamily: 'Georgia', fontSize: 20, fontWeight: 'normal', fontStyle: 'italic', letterSpacing: 0, color: '#374151' },
  { type: 'script', label: 'Script', fontFamily: 'Dancing Script', fontSize: 28, fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 1, color: '#BE185D' },
  { type: 'bold-title', label: 'Bold Title', fontFamily: 'Inter', fontSize: 32, fontWeight: '900', fontStyle: 'normal', letterSpacing: 2, color: '#111827' },
  { type: 'elegant', label: 'Elegant', fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 'normal', fontStyle: 'italic', letterSpacing: 1, color: '#92400E' },
  { type: 'modern', label: 'Modern', fontFamily: 'Inter', fontSize: 22, fontWeight: '300', fontStyle: 'normal', letterSpacing: 3, color: '#1F2937' },
  { type: 'vintage-text', label: 'Vintage', fontFamily: 'Georgia', fontSize: 24, fontWeight: 'bold', fontStyle: 'normal', letterSpacing: 0, color: '#78350F' },
];

export default function AlbumEditorPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShapeModal, setShowShapeModal] = useState(false);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [showGridModal, setShowGridModal] = useState(false);
  const [showTextStyleModal, setShowTextStyleModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetLabel, setPresetLabel] = useState('');
  const [presetType, setPresetType] = useState('grid');
  const [presetPageCount, setPresetPageCount] = useState(20);

  const [bgColor, setBgColor] = useState('#FFFFFF');
  
  // Panel visibility for mobile
  const [activePanel, setActivePanel] = useState<'presets' | 'canvas' | 'tools'>('canvas');
  
  // Tool category tabs
  const [activeToolTab, setActiveToolTab] = useState<'elements' | 'text' | 'uploads'>('elements');

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch presets from API
  const fetchPresets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`${API_BASE}/admin/album/presets?${params}`);
      const data = await res.json();
      
      if (data.success) {
        // Map _id to id for frontend compatibility
        const mappedPresets = data.presets.map((p: Preset) => ({
          ...p,
          id: p._id || p.id
        }));
        setPresets(mappedPresets);
      }
    } catch (error) {
      console.error('Failed to fetch presets:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, searchQuery]);

  // Load presets on mount and when filters change
  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  // Load preset layout when selected
  useEffect(() => {
    if (selectedPreset?.layoutJson?.elements) {
      setCanvasElements(selectedPreset.layoutJson.elements);
      if (selectedPreset.bgColor) {
        setBgColor(selectedPreset.bgColor);
      }
    }
  }, [selectedPreset]);

  const filteredPresets = presets.filter((preset) => {
    const matchesSearch = preset.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || preset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const addImageSlot = () => {
    const newElement: CanvasElement = {
      id: `img_${Date.now()}`,
      type: 'image',
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      radius: 8,
      rotation: 0,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
  };

  const addText = () => {
    const newElement: CanvasElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 180,
      height: 40,
      radius: 0,
      rotation: 0,
      text: 'Your Text',
      fontFamily: 'Inter',
      fontSize: 20,
      color: '#1F2937',
      bold: false,
      italic: false,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
  };

  const addShape = (shapeType: ShapeType) => {
    const newElement: CanvasElement = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 120,
      y: 120,
      width: shapeType === 'line' ? 150 : 80,
      height: shapeType === 'line' ? 4 : 80,
      radius: shapeType === 'circle' ? 50 : 8,
      rotation: 0,
      bgColor: '#F43F5E',
      opacity: 100,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
    setShowShapeModal(false);
  };

  // Add Frame (can hold images)
  const addFrame = (frameType: FrameType) => {
    const newElement: CanvasElement = {
      id: `frame_${Date.now()}`,
      type: 'frame',
      frameType,
      x: 80,
      y: 80,
      width: frameType === 'polaroid' ? 120 : 100,
      height: frameType === 'polaroid' ? 150 : 100,
      radius: frameType === 'rounded-frame' ? 16 : 0,
      rotation: 0,
      borderColor: frameType === 'vintage' ? '#8B7355' : '#E5E7EB',
      borderWidth: frameType === 'polaroid' ? 8 : 3,
      bgColor: '#FFFFFF',
      imageUrl: '',
      opacity: 100,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
    setShowFrameModal(false);
  };

  // Add Grid Layout
  const addGrid = (gridType: GridType) => {
    const gridConfig = gridOptions.find(g => g.type === gridType);
    if (!gridConfig) return;
    
    const gridWidth = 200;
    const gridHeight = gridType.includes('1x') ? 300 : gridType.includes('x1') ? 100 : 200;
    const gap = 4;
    
    const slots: { x: number; y: number; width: number; height: number; imageUrl?: string }[] = [];
    
    if (gridType === 'mosaic-1') {
      // Large left, two small right
      slots.push({ x: 0, y: 0, width: gridWidth * 0.6 - gap/2, height: gridHeight, imageUrl: '' });
      slots.push({ x: gridWidth * 0.6 + gap/2, y: 0, width: gridWidth * 0.4 - gap/2, height: gridHeight/2 - gap/2, imageUrl: '' });
      slots.push({ x: gridWidth * 0.6 + gap/2, y: gridHeight/2 + gap/2, width: gridWidth * 0.4 - gap/2, height: gridHeight/2 - gap/2, imageUrl: '' });
    } else if (gridType === 'mosaic-2') {
      // Two small top, large bottom
      slots.push({ x: 0, y: 0, width: gridWidth/2 - gap/2, height: gridHeight * 0.4 - gap/2, imageUrl: '' });
      slots.push({ x: gridWidth/2 + gap/2, y: 0, width: gridWidth/2 - gap/2, height: gridHeight * 0.4 - gap/2, imageUrl: '' });
      slots.push({ x: 0, y: gridHeight * 0.4 + gap/2, width: gridWidth, height: gridHeight * 0.6 - gap/2, imageUrl: '' });
    } else {
      const cols = gridConfig.cols;
      const rows = gridConfig.rows;
      const cellWidth = (gridWidth - gap * (cols - 1)) / cols;
      const cellHeight = (gridHeight - gap * (rows - 1)) / rows;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          slots.push({
            x: col * (cellWidth + gap),
            y: row * (cellHeight + gap),
            width: cellWidth,
            height: cellHeight,
            imageUrl: '',
          });
        }
      }
    }
    
    const newElement: CanvasElement = {
      id: `grid_${Date.now()}`,
      type: 'grid',
      gridType,
      x: 60,
      y: 60,
      width: gridWidth,
      height: gridHeight,
      radius: 8,
      rotation: 0,
      bgColor: '#F3F4F6',
      gridSlots: slots,
      opacity: 100,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
    setShowGridModal(false);
  };

  // Add Text with Style
  const addTextWithStyle = (styleType: TextStyleType) => {
    const style = textStylePresets.find(s => s.type === styleType);
    if (!style) return;
    
    const newElement: CanvasElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      textStyle: styleType,
      x: 80,
      y: 100,
      width: 220,
      height: style.fontSize + 20,
      radius: 0,
      rotation: 0,
      text: style.label === 'Quote' ? '"Your beautiful quote here"' : 'Your Text Here',
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      color: style.color,
      bold: style.fontWeight === 'bold' || style.fontWeight === '900',
      italic: style.fontStyle === 'italic',
      underline: false,
      textAlign: 'center',
      letterSpacing: style.letterSpacing,
      lineHeight: 1.4,
      opacity: 100,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
    setShowTextStyleModal(false);
  };

  // Handle image upload for frames
  const handleFrameImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedElement || selectedElement.type !== 'frame') return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      updateElementProperty('imageUrl', imageUrl);
    };
    reader.readAsDataURL(file);
  };

  // Duplicate element
  const duplicateElement = () => {
    if (!selectedElement) return;
    const newElement = {
      ...selectedElement,
      id: `${selectedElement.type}_${Date.now()}`,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
  };

  // Bring to front / Send to back
  const bringToFront = () => {
    if (!selectedElement) return;
    setCanvasElements([
      ...canvasElements.filter(el => el.id !== selectedElement.id),
      selectedElement
    ]);
  };

  const sendToBack = () => {
    if (!selectedElement) return;
    setCanvasElements([
      selectedElement,
      ...canvasElements.filter(el => el.id !== selectedElement.id)
    ]);
  };

  const updateElementProperty = (property: keyof CanvasElement, value: any) => {
    if (!selectedElement) return;
    const updated = { ...selectedElement, [property]: value };
    setSelectedElement(updated);
    setCanvasElements(canvasElements.map((el) => (el.id === updated.id ? updated : el)));
  };

  const deleteElement = (id: string) => {
    setCanvasElements(canvasElements.filter((el) => el.id !== id));
    if (selectedElement?.id === id) setSelectedElement(null);
  };

  const handleSavePreset = async () => {
    if (!presetName || !presetLabel) {
      alert('Please fill in preset name and label');
      return;
    }
    
    try {
      setSaving(true);
      
      // Count total image slots: regular images + frames + grid slots
      const imageSlots = canvasElements.filter((el) => el.type === 'image').length;
      const frameSlots = canvasElements.filter((el) => el.type === 'frame').length;
      const gridSlots = canvasElements.reduce((acc, el) => 
        el.type === 'grid' ? acc + (el.gridSlots?.length || 0) : acc, 0
      );
      const totalSlots = imageSlots + frameSlots + gridSlots;
      
      const presetData = {
        name: presetName,
        label: presetLabel,
        type: presetType,
        slots: totalSlots,
        thumbnail: '🆕',
        pageCount: presetPageCount,
        layoutJson: { elements: canvasElements },
        bgColor: bgColor,
      };

      const res = await fetch(`${API_BASE}/admin/album/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presetData),
      });

      const data = await res.json();
      
      if (data.success) {
        await fetchPresets();
        setShowSaveModal(false);
        setPresetName('');
        setPresetLabel('');
        setCanvasElements([]);
        alert('Preset saved successfully!');
      } else {
        alert(data.error || 'Failed to save preset');
      }
    } catch (error) {
      console.error('Error saving preset:', error);
      alert('Failed to save preset');
    } finally {
      setSaving(false);
    }
  };

  const duplicatePreset = async (preset: Preset) => {
    try {
      const res = await fetch(`${API_BASE}/admin/album/presets/${preset.id}/duplicate`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (data.success) {
        await fetchPresets();
      } else {
        alert(data.error || 'Failed to duplicate preset');
      }
    } catch (error) {
      console.error('Error duplicating preset:', error);
      alert('Failed to duplicate preset');
    }
  };

  const deletePreset = async (id: string) => {
    if (!confirm('Delete this preset?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/album/presets/${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        await fetchPresets();
        if (selectedPreset?.id === id) {
          setSelectedPreset(null);
          setCanvasElements([]);
        }
      } else {
        alert(data.error || 'Failed to delete preset');
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      alert('Failed to delete preset');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl p-5 border border-amber-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎨 Layout Presets</h1>
              <p className="text-gray-600 text-sm mt-1">Create reusable wedding album page layouts</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                ➕ New Preset
              </button>
              <button className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all">
                📥 Import
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium rounded-xl border border-rose-200 transition-all"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Panel Switcher */}
        <div className="lg:hidden flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          <button
            onClick={() => setActivePanel('presets')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${activePanel === 'presets' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            📚 Presets
          </button>
          <button
            onClick={() => setActivePanel('canvas')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${activePanel === 'canvas' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            🎨 Canvas
          </button>
          <button
            onClick={() => setActivePanel('tools')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${activePanel === 'tools' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            🛠️ Tools
          </button>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT - Preset Library */}
          <div className={`lg:col-span-3 ${activePanel !== 'presets' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-amber-100">
                <h2 className="font-bold text-gray-800 mb-3">📚 Preset Library</h2>
                <input
                  type="text"
                  placeholder="🔍 Search presets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent mb-2"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="full">Full Bleed</option>
                  <option value="split">Split</option>
                  <option value="grid">Grid</option>
                  <option value="collage">Collage</option>
                  <option value="story">Story</option>
                </select>
              </div>

              <div className="max-h-96 lg:max-h-[500px] overflow-y-auto p-3 space-y-3">
                {loading ? (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-4xl block mb-3 animate-spin">⏳</span>
                    <p className="font-medium">Loading presets...</p>
                  </div>
                ) : filteredPresets.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-4xl block mb-3">📭</span>
                    <p className="font-medium">No presets found</p>
                    <p className="text-sm mt-1">Create your first preset!</p>
                  </div>
                ) : (
                  filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPreset?.id === preset.id
                        ? 'border-amber-400 bg-amber-50 shadow-md'
                        : 'border-gray-100 hover:border-amber-200 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="w-full h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl mb-3">
                      {preset.thumbnail}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-800">{preset.label}</span>
                      <span className="px-2 py-1 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                        {preset.slots} slots
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPreset(preset); }}
                        className="flex-1 px-2 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicatePreset(preset); }}
                        className="flex-1 px-2 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                        className="flex-1 px-2 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* CENTER - Canvas Editor */}
          <div className={`lg:col-span-6 ${activePanel !== 'canvas' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Canvas Toolbar */}
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span className="text-sm font-medium text-gray-600">Grid</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span className="text-sm font-medium text-gray-600">Snap</span>
                  </label>
                  <div className="hidden sm:flex gap-1 border-l border-gray-200 pl-3">
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg text-sm" title="Align Left">⬅</button>
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg text-sm" title="Center">⬛</button>
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg text-sm" title="Align Right">➡</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-200">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center font-bold text-gray-600"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold text-gray-700 w-12 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(150, zoom + 25))}
                    className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="p-6 bg-gradient-to-br from-gray-200 to-gray-300 min-h-[400px] lg:min-h-[500px] flex items-center justify-center overflow-auto">
                <div
                  ref={canvasRef}
                  className="relative rounded-lg shadow-2xl transition-all duration-300"
                  style={{
                    width: `${350 * (zoom / 100)}px`,
                    height: `${350 * (zoom / 100)}px`,
                    backgroundColor: bgColor,
                    backgroundImage: showGrid
                      ? 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)'
                      : 'none',
                    backgroundSize: '25px 25px',
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging || !selectedElement || !canvasRef.current) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    let newX = (e.clientX - rect.left - dragOffset.x) / (zoom / 100);
                    let newY = (e.clientY - rect.top - dragOffset.y) / (zoom / 100);
                    if (snapToGrid) {
                      newX = Math.round(newX / 25) * 25;
                      newY = Math.round(newY / 25) * 25;
                    }
                    newX = Math.max(0, Math.min(newX, 350 - selectedElement.width));
                    newY = Math.max(0, Math.min(newY, 350 - selectedElement.height));
                    const updated = { ...selectedElement, x: newX, y: newY };
                    setSelectedElement(updated);
                    setCanvasElements(canvasElements.map((el) => (el.id === updated.id ? updated : el)));
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  {canvasElements.map((element) => (
                    <div
                      key={element.id}
                      onClick={() => setSelectedElement(element)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelectedElement(element);
                        setIsDragging(true);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDragOffset({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }}
                      className={`absolute cursor-move transition-all hover:opacity-90 ${
                        selectedElement?.id === element.id ? 'ring-3 ring-amber-400 ring-offset-2' : ''
                      }`}
                      style={{
                        left: `${element.x * (zoom / 100)}px`,
                        top: `${element.y * (zoom / 100)}px`,
                        width: `${element.width * (zoom / 100)}px`,
                        height: `${element.height * (zoom / 100)}px`,
                        borderRadius: element.type === 'shape' && element.shapeType === 'circle' ? '50%' : `${element.radius}px`,
                        transform: `rotate(${element.rotation}deg)`,
                      }}
                    >
                      {element.type === 'image' && (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-lg">
                          <span className="text-gray-400 text-xl">📷</span>
                        </div>
                      )}
                      {element.type === 'text' && (
                        <div
                          className="w-full h-full flex items-center rounded px-2"
                          style={{
                            fontFamily: element.fontFamily,
                            fontSize: `${(element.fontSize || 16) * (zoom / 100)}px`,
                            color: element.color,
                            fontWeight: element.bold ? 'bold' : 'normal',
                            fontStyle: element.italic ? 'italic' : 'normal',
                            textDecoration: element.underline ? 'underline' : 'none',
                            textAlign: element.textAlign || 'center',
                            justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
                            letterSpacing: `${element.letterSpacing || 0}px`,
                            lineHeight: element.lineHeight || 1.4,
                            opacity: (element.opacity || 100) / 100,
                            backgroundColor: 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {element.text}
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'rectangle' && (
                        <div className="w-full h-full border-2 border-rose-400" style={{ backgroundColor: element.bgColor || '#F43F5E', borderRadius: `${element.radius}px` }} />
                      )}
                      {element.type === 'shape' && element.shapeType === 'circle' && (
                        <div className="w-full h-full rounded-full border-2 border-rose-400" style={{ backgroundColor: element.bgColor || '#F43F5E' }} />
                      )}
                      {element.type === 'shape' && element.shapeType === 'triangle' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="50,5 95,95 5,95" fill={element.bgColor || '#F43F5E'} stroke="#F43F5E" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'heart' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path d="M50,88 C20,60 5,40 5,25 C5,10 20,5 35,15 C42,20 47,25 50,30 C53,25 58,20 65,15 C80,5 95,10 95,25 C95,40 80,60 50,88 Z" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'star' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'diamond' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="50,5 95,50 50,95 5,50" fill={element.bgColor || '#F43F5E'} stroke="#F43F5E" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'line' && (
                        <div className="w-full h-full" style={{ backgroundColor: element.bgColor || '#F43F5E' }} />
                      )}
                      {/* New Shapes */}
                      {element.type === 'shape' && element.shapeType === 'hexagon' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="50,3 93,25 93,75 50,97 7,75 7,25" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'pentagon' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="50,5 95,38 80,90 20,90 5,38" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'octagon' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'arch' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path d="M5,100 L5,50 A45,45 0 1,1 95,50 L95,100 Z" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'cloud' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 60" className="w-full h-full">
                            <path d="M20,50 A18,18 0 1,1 35,25 A20,20 0 1,1 70,25 A18,18 0 1,1 80,50 Z" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      {element.type === 'shape' && element.shapeType === 'blob' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <path d="M50,10 Q80,20 85,50 Q90,80 50,90 Q20,85 15,50 Q10,20 50,10 Z" fill={element.bgColor || '#F43F5E'} />
                          </svg>
                        </div>
                      )}
                      
                      {/* Frame Elements */}
                      {element.type === 'frame' && (
                        <div 
                          className="w-full h-full relative overflow-hidden"
                          style={{
                            borderRadius: element.frameType === 'circle-frame' ? '50%' : 
                                          element.frameType === 'rounded-frame' ? '16px' : 
                                          element.frameType === 'polaroid' ? '4px' : '0px',
                            border: `${element.borderWidth || 3}px solid ${element.borderColor || '#E5E7EB'}`,
                            backgroundColor: element.bgColor || '#FFFFFF',
                            padding: element.frameType === 'polaroid' ? '8px 8px 32px 8px' : '0',
                          }}
                        >
                          {element.frameType === 'heart-frame' && (
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                              <defs>
                                <clipPath id={`heart-clip-${element.id}`}>
                                  <path d="M50,88 C20,60 5,40 5,25 C5,10 20,5 35,15 C42,20 47,25 50,30 C53,25 58,20 65,15 C80,5 95,10 95,25 C95,40 80,60 50,88 Z" />
                                </clipPath>
                              </defs>
                              <rect width="100" height="100" fill={element.bgColor || '#FDF2F8'} clipPath={`url(#heart-clip-${element.id})`} />
                              {element.imageUrl && (
                                <image href={element.imageUrl} width="100" height="100" clipPath={`url(#heart-clip-${element.id})`} preserveAspectRatio="xMidYMid slice" />
                              )}
                              <path d="M50,88 C20,60 5,40 5,25 C5,10 20,5 35,15 C42,20 47,25 50,30 C53,25 58,20 65,15 C80,5 95,10 95,25 C95,40 80,60 50,88 Z" fill="none" stroke={element.borderColor || '#F472B6'} strokeWidth="3" />
                            </svg>
                          )}
                          {element.frameType === 'star-frame' && (
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                              <defs>
                                <clipPath id={`star-clip-${element.id}`}>
                                  <polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" />
                                </clipPath>
                              </defs>
                              <rect width="100" height="100" fill={element.bgColor || '#FEF3C7'} clipPath={`url(#star-clip-${element.id})`} />
                              {element.imageUrl && (
                                <image href={element.imageUrl} width="100" height="100" clipPath={`url(#star-clip-${element.id})`} preserveAspectRatio="xMidYMid slice" />
                              )}
                              <polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" fill="none" stroke={element.borderColor || '#F59E0B'} strokeWidth="2" />
                            </svg>
                          )}
                          {element.frameType === 'hexagon-frame' && (
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                              <defs>
                                <clipPath id={`hex-clip-${element.id}`}>
                                  <polygon points="50,3 93,25 93,75 50,97 7,75 7,25" />
                                </clipPath>
                              </defs>
                              <rect width="100" height="100" fill={element.bgColor || '#E0E7FF'} clipPath={`url(#hex-clip-${element.id})`} />
                              {element.imageUrl && (
                                <image href={element.imageUrl} width="100" height="100" clipPath={`url(#hex-clip-${element.id})`} preserveAspectRatio="xMidYMid slice" />
                              )}
                              <polygon points="50,3 93,25 93,75 50,97 7,75 7,25" fill="none" stroke={element.borderColor || '#6366F1'} strokeWidth="2" />
                            </svg>
                          )}
                          {element.frameType === 'diamond-frame' && (
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                              <defs>
                                <clipPath id={`diamond-clip-${element.id}`}>
                                  <polygon points="50,5 95,50 50,95 5,50" />
                                </clipPath>
                              </defs>
                              <rect width="100" height="100" fill={element.bgColor || '#FDF2F8'} clipPath={`url(#diamond-clip-${element.id})`} />
                              {element.imageUrl && (
                                <image href={element.imageUrl} width="100" height="100" clipPath={`url(#diamond-clip-${element.id})`} preserveAspectRatio="xMidYMid slice" />
                              )}
                              <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke={element.borderColor || '#EC4899'} strokeWidth="2" />
                            </svg>
                          )}
                          {element.frameType === 'arch-frame' && (
                            <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
                              <defs>
                                <clipPath id={`arch-clip-${element.id}`}>
                                  <path d="M5,120 L5,50 A45,45 0 1,1 95,50 L95,120 Z" />
                                </clipPath>
                              </defs>
                              <rect width="100" height="120" fill={element.bgColor || '#ECFDF5'} clipPath={`url(#arch-clip-${element.id})`} />
                              {element.imageUrl && (
                                <image href={element.imageUrl} width="100" height="120" clipPath={`url(#arch-clip-${element.id})`} preserveAspectRatio="xMidYMid slice" />
                              )}
                              <path d="M5,120 L5,50 A45,45 0 1,1 95,50 L95,120 Z" fill="none" stroke={element.borderColor || '#10B981'} strokeWidth="2" />
                            </svg>
                          )}
                          {(element.frameType === 'circle-frame' || element.frameType === 'square-frame' || element.frameType === 'rounded-frame' || element.frameType === 'polaroid' || element.frameType === 'vintage') && (
                            <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
                              {element.imageUrl ? (
                                <img src={element.imageUrl} alt="Frame" className="w-full h-full object-cover" style={{ borderRadius: 'inherit' }} />
                              ) : (
                                <span className="text-gray-300 text-2xl">📷</span>
                              )}
                            </div>
                          )}
                          {element.frameType === 'polaroid' && (
                            <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-gray-400 font-medium">
                              Photo Caption
                            </div>
                          )}
                          {element.frameType === 'vintage' && (
                            <div className="absolute inset-0 pointer-events-none border-8 border-double border-amber-700/30" style={{ borderRadius: 'inherit' }} />
                          )}
                        </div>
                      )}

                      {/* Grid Elements */}
                      {element.type === 'grid' && (
                        <div 
                          className="w-full h-full relative"
                          style={{ backgroundColor: element.bgColor || '#F3F4F6', borderRadius: `${element.radius}px` }}
                        >
                          {element.gridSlots?.map((slot, index) => (
                            <div
                              key={index}
                              className="absolute bg-white border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-amber-400 transition-all"
                              style={{
                                left: `${(slot.x / element.width) * 100}%`,
                                top: `${(slot.y / element.height) * 100}%`,
                                width: `${(slot.width / element.width) * 100}%`,
                                height: `${(slot.height / element.height) * 100}%`,
                                borderRadius: '4px',
                              }}
                            >
                              {slot.imageUrl ? (
                                <img src={slot.imageUrl} alt={`Slot ${index}`} className="w-full h-full object-cover rounded" />
                              ) : (
                                <span className="text-gray-300 text-lg">📷</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {canvasElements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <span className="text-5xl block mb-3">🎨</span>
                        <p className="font-medium">Add elements using Tools</p>
                        <p className="text-sm mt-1">Click buttons on the right panel</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Tools & Properties */}
          <div className={`lg:col-span-3 ${activePanel !== 'tools' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tool Category Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveToolTab('elements')}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${activeToolTab === 'elements' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  🎨 Elements
                </button>
                <button
                  onClick={() => setActiveToolTab('text')}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${activeToolTab === 'text' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  📝 Text
                </button>
                <button
                  onClick={() => setActiveToolTab('uploads')}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${activeToolTab === 'uploads' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  📤 Uploads
                </button>
              </div>

              {/* Elements Tab */}
              {activeToolTab === 'elements' && (
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">🖼️ Frames (with images)</h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {frameOptions.slice(0, 8).map((frame) => (
                      <button
                        key={frame.type}
                        onClick={() => addFrame(frame.type)}
                        className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg transition-all hover:shadow-md"
                        title={frame.label}
                      >
                        <span className="text-lg">{frame.icon}</span>
                        <span className="text-[10px] text-gray-600">{frame.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowFrameModal(true)}
                    className="w-full py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg mb-4"
                  >
                    View All Frames →
                  </button>

                  <h3 className="font-bold text-gray-800 mb-3 text-sm">📊 Grid Layouts</h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {gridOptions.slice(0, 8).map((grid) => (
                      <button
                        key={grid.type}
                        onClick={() => addGrid(grid.type)}
                        className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 rounded-lg transition-all hover:shadow-md"
                        title={grid.label}
                      >
                        <span className="text-lg">{grid.icon}</span>
                        <span className="text-[10px] text-gray-600">{grid.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowGridModal(true)}
                    className="w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg mb-4"
                  >
                    View All Grids →
                  </button>

                  <h3 className="font-bold text-gray-800 mb-3 text-sm">🔷 Shapes</h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {shapeOptions.slice(0, 8).map((shape) => (
                      <button
                        key={shape.type}
                        onClick={() => addShape(shape.type)}
                        className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-rose-50 to-orange-50 hover:from-rose-100 hover:to-orange-100 border border-rose-200 rounded-lg transition-all hover:shadow-md"
                        title={shape.label}
                      >
                        <span className="text-lg">{shape.icon}</span>
                        <span className="text-[10px] text-gray-600">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowShapeModal(true)}
                    className="w-full py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg mb-4"
                  >
                    View All Shapes →
                  </button>

                  <h3 className="font-bold text-gray-800 mb-3 text-sm">🎨 Background</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <div className="flex flex-wrap gap-1">
                      {['#FFFFFF', '#FDF2F8', '#FEF3C7', '#DCFCE7', '#E0E7FF', '#F3F4F6'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBgColor(color)}
                          className="w-7 h-7 rounded-md border-2 border-gray-200 hover:border-amber-400 transition-all"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Text Tab */}
              {activeToolTab === 'text' && (
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">✨ Text Styles</h3>
                  <div className="space-y-2 mb-4">
                    {textStylePresets.map((style) => (
                      <button
                        key={style.type}
                        onClick={() => addTextWithStyle(style.type)}
                        className="w-full p-3 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-xl transition-all text-left group"
                      >
                        <span 
                          style={{ 
                            fontFamily: style.fontFamily, 
                            fontSize: `${Math.min(style.fontSize, 20)}px`,
                            fontWeight: style.fontWeight,
                            fontStyle: style.fontStyle,
                            letterSpacing: `${style.letterSpacing}px`,
                            color: style.color
                          }}
                        >
                          {style.label}
                        </span>
                        <span className="text-xs text-gray-400 block mt-1 group-hover:text-amber-600">
                          {style.fontFamily} • {style.fontSize}px
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={addText}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-md"
                  >
                    ➕ Add Custom Text
                  </button>
                </div>
              )}

              {/* Uploads Tab */}
              {activeToolTab === 'uploads' && (
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">📷 Image Slots</h3>
                  <button
                    onClick={addImageSlot}
                    className="w-full py-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-amber-50 hover:to-amber-100 border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-xl transition-all flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-semibold text-gray-600">Add Image Slot</span>
                    <span className="text-xs text-gray-400">Users will upload their photos here</span>
                  </button>

                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">💡 Tip: Use Frames for shaped image placeholders, or Grids for multiple images in a layout.</p>
                  </div>

                  {selectedElement?.type === 'frame' && (
                    <div className="mt-4">
                      <h3 className="font-bold text-gray-800 mb-3 text-sm">🖼️ Frame Image Preview</h3>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFrameImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-xl transition-all"
                      >
                        📤 Upload Preview Image
                      </button>
                      {selectedElement.imageUrl && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <img src={selectedElement.imageUrl} alt="Preview" className="w-full h-20 object-cover rounded" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Properties */}
              <div className="p-4 max-h-80 lg:max-h-[350px] overflow-y-auto border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800">⚙️ Properties</h2>
                  {selectedElement && (
                    <div className="flex gap-1">
                      <button onClick={duplicateElement} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs" title="Duplicate">📋</button>
                      <button onClick={bringToFront} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs" title="Bring to Front">⬆️</button>
                      <button onClick={sendToBack} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs" title="Send to Back">⬇️</button>
                    </div>
                  )}
                </div>
                
                {selectedElement ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-xs font-bold text-amber-700 uppercase">
                        {selectedElement.type} Element
                      </span>
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">X Position</label>
                        <input
                          type="number"
                          value={selectedElement.x}
                          onChange={(e) => updateElementProperty('x', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Y Position</label>
                        <input
                          type="number"
                          value={selectedElement.y}
                          onChange={(e) => updateElementProperty('y', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Size */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Width</label>
                        <input
                          type="number"
                          value={selectedElement.width}
                          onChange={(e) => updateElementProperty('width', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Height</label>
                        <input
                          type="number"
                          value={selectedElement.height}
                          onChange={(e) => updateElementProperty('height', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Style */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Radius</label>
                        <input
                          type="number"
                          value={selectedElement.radius}
                          onChange={(e) => updateElementProperty('radius', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Rotation</label>
                        <input
                          type="number"
                          value={selectedElement.rotation}
                          onChange={(e) => updateElementProperty('rotation', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Text Properties */}
                    {selectedElement.type === 'text' && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Text</label>
                          <input
                            type="text"
                            value={selectedElement.text || ''}
                            onChange={(e) => updateElementProperty('text', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Font</label>
                          <select
                            value={selectedElement.fontFamily || 'Inter'}
                            onChange={(e) => updateElementProperty('fontFamily', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-400"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Dancing Script">Dancing Script</option>
                            <option value="Georgia">Georgia</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Size</label>
                            <input
                              type="number"
                              value={selectedElement.fontSize || 16}
                              onChange={(e) => updateElementProperty('fontSize', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Color</label>
                            <input
                              type="color"
                              value={selectedElement.color || '#000000'}
                              onChange={(e) => updateElementProperty('color', e.target.value)}
                              className="w-full h-10 rounded-lg cursor-pointer border border-gray-200"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateElementProperty('bold', !selectedElement.bold)}
                            className={`flex-1 py-2 rounded-lg font-bold transition-all ${selectedElement.bold ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            B
                          </button>
                          <button
                            onClick={() => updateElementProperty('italic', !selectedElement.italic)}
                            className={`flex-1 py-2 rounded-lg italic transition-all ${selectedElement.italic ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            I
                          </button>
                          <button
                            onClick={() => updateElementProperty('underline', !selectedElement.underline)}
                            className={`flex-1 py-2 rounded-lg underline transition-all ${selectedElement.underline ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            U
                          </button>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Text Align</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateElementProperty('textAlign', 'left')}
                              className={`flex-1 py-2 rounded-lg transition-all ${selectedElement.textAlign === 'left' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              ⬅
                            </button>
                            <button
                              onClick={() => updateElementProperty('textAlign', 'center')}
                              className={`flex-1 py-2 rounded-lg transition-all ${selectedElement.textAlign === 'center' || !selectedElement.textAlign ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              ⬛
                            </button>
                            <button
                              onClick={() => updateElementProperty('textAlign', 'right')}
                              className={`flex-1 py-2 rounded-lg transition-all ${selectedElement.textAlign === 'right' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              ➡
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Letter Spacing</label>
                            <input
                              type="number"
                              value={selectedElement.letterSpacing || 0}
                              onChange={(e) => updateElementProperty('letterSpacing', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Line Height</label>
                            <input
                              type="number"
                              step="0.1"
                              value={selectedElement.lineHeight || 1.4}
                              onChange={(e) => updateElementProperty('lineHeight', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Shape Properties */}
                    {selectedElement.type === 'shape' && (
                      <>
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                          <span className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1">
                            {shapeOptions.find(s => s.type === selectedElement.shapeType)?.icon || '🔷'}{' '}
                            {selectedElement.shapeType || 'Shape'}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Shape Color</label>
                          <input
                            type="color"
                            value={selectedElement.bgColor || '#F43F5E'}
                            onChange={(e) => updateElementProperty('bgColor', e.target.value)}
                            className="w-full h-10 rounded-lg cursor-pointer border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Opacity</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedElement.opacity || 100}
                            onChange={(e) => updateElementProperty('opacity', Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{selectedElement.opacity || 100}%</span>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Change Shape</label>
                          <div className="grid grid-cols-4 gap-1">
                            {shapeOptions.map((shape) => (
                              <button
                                key={shape.type}
                                onClick={() => updateElementProperty('shapeType', shape.type)}
                                className={`p-2 rounded-lg text-lg transition-all ${
                                  selectedElement.shapeType === shape.type
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                title={shape.label}
                              >
                                {shape.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Frame Properties */}
                    {selectedElement.type === 'frame' && (
                      <>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <span className="text-xs font-bold text-purple-700 uppercase flex items-center gap-1">
                            {frameOptions.find(f => f.type === selectedElement.frameType)?.icon || '🖼️'}{' '}
                            {selectedElement.frameType || 'Frame'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Border Color</label>
                            <input
                              type="color"
                              value={selectedElement.borderColor || '#E5E7EB'}
                              onChange={(e) => updateElementProperty('borderColor', e.target.value)}
                              className="w-full h-10 rounded-lg cursor-pointer border border-gray-200"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Border Width</label>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={selectedElement.borderWidth || 3}
                              onChange={(e) => updateElementProperty('borderWidth', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Background Color</label>
                          <input
                            type="color"
                            value={selectedElement.bgColor || '#FFFFFF'}
                            onChange={(e) => updateElementProperty('bgColor', e.target.value)}
                            className="w-full h-10 rounded-lg cursor-pointer border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Change Frame</label>
                          <div className="grid grid-cols-5 gap-1">
                            {frameOptions.map((frame) => (
                              <button
                                key={frame.type}
                                onClick={() => updateElementProperty('frameType', frame.type)}
                                className={`p-2 rounded-lg text-lg transition-all ${
                                  selectedElement.frameType === frame.type
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                title={frame.label}
                              >
                                {frame.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-semibold transition-all"
                        >
                          📤 {selectedElement.imageUrl ? 'Change' : 'Add'} Preview Image
                        </button>
                      </>
                    )}

                    {/* Grid Properties */}
                    {selectedElement.type === 'grid' && (
                      <>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <span className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                            📊 {selectedElement.gridType || 'Grid'} Layout
                          </span>
                          <span className="text-xs text-blue-500 block mt-1">
                            {selectedElement.gridSlots?.length || 0} image slots
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Background Color</label>
                          <input
                            type="color"
                            value={selectedElement.bgColor || '#F3F4F6'}
                            onChange={(e) => updateElementProperty('bgColor', e.target.value)}
                            className="w-full h-10 rounded-lg cursor-pointer border border-gray-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Change Grid</label>
                          <div className="grid grid-cols-5 gap-1">
                            {gridOptions.map((grid) => (
                              <button
                                key={grid.type}
                                onClick={() => {
                                  // Recalculate grid slots for new type
                                  const newGridConfig = gridOptions.find(g => g.type === grid.type);
                                  if (newGridConfig) {
                                    const gridWidth = selectedElement.width;
                                    const gridHeight = selectedElement.height;
                                    const gap = 4;
                                    const slots: { x: number; y: number; width: number; height: number; imageUrl?: string }[] = [];
                                    
                                    const cols = newGridConfig.cols;
                                    const rows = newGridConfig.rows;
                                    const cellWidth = (gridWidth - gap * (cols - 1)) / cols;
                                    const cellHeight = (gridHeight - gap * (rows - 1)) / rows;
                                    
                                    for (let row = 0; row < rows; row++) {
                                      for (let col = 0; col < cols; col++) {
                                        slots.push({
                                          x: col * (cellWidth + gap),
                                          y: row * (cellHeight + gap),
                                          width: cellWidth,
                                          height: cellHeight,
                                          imageUrl: '',
                                        });
                                      }
                                    }
                                    
                                    const updated = { ...selectedElement, gridType: grid.type, gridSlots: slots };
                                    setSelectedElement(updated);
                                    setCanvasElements(canvasElements.map((el) => (el.id === updated.id ? updated : el)));
                                  }
                                }}
                                className={`p-2 rounded-lg text-sm transition-all ${
                                  selectedElement.gridType === grid.type
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                title={grid.label}
                              >
                                {grid.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => deleteElement(selectedElement.id)}
                      className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-all"
                    >
                      🗑️ Delete Element
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <span className="text-4xl block mb-3">👆</span>
                    <p className="font-medium">Select an element</p>
                    <p className="text-sm">Click on canvas to edit</p>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                  💾 Save as Preset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-5">💾 Save Preset</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preset Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="ex: grid_4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={presetLabel}
                    onChange={(e) => setPresetLabel(e.target.value)}
                    placeholder="ex: 4 Photo Grid"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={presetType}
                    onChange={(e) => setPresetType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="full">Full Bleed</option>
                    <option value="split">Split</option>
                    <option value="grid">Grid</option>
                    <option value="collage">Collage</option>
                    <option value="story">Story</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page Count <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[20, 30, 40, 50].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setPresetPageCount(count)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          presetPageCount === count
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm font-medium text-amber-800">
                    📷 Image Slots: {canvasElements.filter((el) => el.type === 'image').length}
                  </p>
                  <p className="text-sm font-medium text-amber-800 mt-1">
                    �️ Frames: {canvasElements.filter((el) => el.type === 'frame').length}
                  </p>
                  <p className="text-sm font-medium text-amber-800 mt-1">
                    📊 Grids: {canvasElements.filter((el) => el.type === 'grid').length} ({canvasElements.reduce((acc, el) => el.type === 'grid' ? acc + (el.gridSlots?.length || 0) : acc, 0)} slots)
                  </p>
                  <p className="text-sm font-medium text-amber-800 mt-1">
                    🔷 Shapes: {canvasElements.filter((el) => el.type === 'shape').length}
                  </p>
                  <p className="text-sm font-medium text-amber-800 mt-1">
                    📝 Text: {canvasElements.filter((el) => el.type === 'text').length}
                  </p>
                  <hr className="my-2 border-amber-200" />
                  <p className="text-sm font-bold text-amber-900">
                    �📄 For: {presetPageCount} page albums
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={saving}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  disabled={saving}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {saving ? '⏳ Saving...' : '✓ Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shape Picker Modal */}
        {showShapeModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-5">🔷 Choose a Shape</h3>
              
              <div className="grid grid-cols-3 gap-3">
                {shapeOptions.map((shape) => (
                  <button
                    key={shape.type}
                    onClick={() => addShape(shape.type)}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-amber-50 hover:to-rose-50 border-2 border-gray-200 hover:border-amber-400 rounded-xl transition-all hover:shadow-md"
                  >
                    <span className="text-3xl">{shape.icon}</span>
                    <span className="text-xs font-semibold text-gray-600">{shape.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowShapeModal(false)}
                className="w-full mt-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Frame Picker Modal */}
        {showFrameModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-5">🖼️ Choose a Frame</h3>
              <p className="text-sm text-gray-500 mb-4">Frames can hold images inside them - perfect for creative photo layouts!</p>
              
              <div className="grid grid-cols-3 gap-3">
                {frameOptions.map((frame) => (
                  <button
                    key={frame.type}
                    onClick={() => addFrame(frame.type)}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all hover:shadow-md"
                  >
                    <span className="text-3xl">{frame.icon}</span>
                    <span className="text-xs font-semibold text-gray-600">{frame.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFrameModal(false)}
                className="w-full mt-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Grid Layout Picker Modal */}
        {showGridModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-5">📊 Choose a Grid Layout</h3>
              <p className="text-sm text-gray-500 mb-4">Grids create multiple image slots in one element for collage-style layouts.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {gridOptions.map((grid) => (
                  <button
                    key={grid.type}
                    onClick={() => addGrid(grid.type)}
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all hover:shadow-md"
                  >
                    <div className="text-xl font-mono">{grid.icon}</div>
                    <span className="text-xs font-semibold text-gray-600">{grid.label}</span>
                    <span className="text-[10px] text-gray-400">{grid.cols}x{grid.rows}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowGridModal(false)}
                className="w-full mt-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Text Style Picker Modal */}
        {showTextStyleModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-5">✨ Choose a Text Style</h3>
              
              <div className="space-y-3">
                {textStylePresets.map((style) => (
                  <button
                    key={style.type}
                    onClick={() => addTextWithStyle(style.type)}
                    className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-amber-50 hover:to-amber-100 border-2 border-gray-200 hover:border-amber-400 rounded-xl transition-all hover:shadow-md text-left"
                  >
                    <span 
                      style={{ 
                        fontFamily: style.fontFamily, 
                        fontSize: `${Math.min(style.fontSize, 24)}px`,
                        fontWeight: style.fontWeight,
                        fontStyle: style.fontStyle,
                        letterSpacing: `${style.letterSpacing}px`,
                        color: style.color
                      }}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">
                      {style.fontFamily} • {style.fontSize}px • {style.fontWeight}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowTextStyleModal(false)}
                className="w-full mt-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
