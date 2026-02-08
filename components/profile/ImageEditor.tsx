import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop, Sun, Contrast, Droplets, RotateCcw, Check, X,
  Square, RectangleHorizontal, Maximize2
} from 'lucide-react';

interface ImageEditorProps {
  imageSrc: string;
  onApply: (editedBase64: string) => void;
  onCancel: () => void;
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
}

type AspectPreset = '1:1' | '4:3' | '16:9' | 'free';

const ASPECT_PRESETS: { label: string; value: AspectPreset; icon: React.ReactNode; ratio: number | null }[] = [
  { label: 'Free', value: 'free', icon: <Maximize2 size={14} />, ratio: null },
  { label: '1:1', value: '1:1', icon: <Square size={14} />, ratio: 1 },
  { label: '4:3', value: '4:3', icon: <RectangleHorizontal size={14} />, ratio: 4 / 3 },
  { label: '16:9', value: '16:9', icon: <RectangleHorizontal size={14} />, ratio: 16 / 9 },
];

const DEFAULT_FILTERS: Filters = { brightness: 100, contrast: 100, saturation: 100 };

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onApply, onCancel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<CropBox>({ x: 0, y: 0, width: 0, height: 0 });
  const [aspect, setAspect] = useState<AspectPreset>('1:1');
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust'>('crop');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'move' | 'resize-br'>('move');

  const initCrop = useCallback((w: number, h: number, aspectPreset: AspectPreset) => {
    const presetObj = ASPECT_PRESETS.find(p => p.value === aspectPreset);
    const ratio = presetObj?.ratio;

    if (!ratio) {
      const margin = Math.min(w, h) * 0.1;
      setCrop({ x: margin, y: margin, width: w - margin * 2, height: h - margin * 2 });
      return;
    }

    let cropW: number, cropH: number;
    if (w / h > ratio) {
      cropH = h * 0.8;
      cropW = cropH * ratio;
    } else {
      cropW = w * 0.8;
      cropH = cropW / ratio;
    }
    setCrop({
      x: (w - cropW) / 2,
      y: (h - cropH) / 2,
      width: cropW,
      height: cropH,
    });
  }, []);

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const container = containerRef.current;
    if (!container) return;

    const maxW = container.clientWidth;
    const maxH = 400;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const displayW = img.naturalWidth * scale;
    const displayH = img.naturalHeight * scale;

    setImgSize({ width: displayW, height: displayH });
    initCrop(displayW, displayH, aspect);
  }, [aspect, initCrop]);

  useEffect(() => {
    if (imgSize.width > 0) {
      initCrop(imgSize.width, imgSize.height, aspect);
    }
  }, [aspect, imgSize, initCrop]);

  const clampCrop = useCallback((box: CropBox): CropBox => {
    const minSize = 30;
    let { x, y, width, height } = box;
    width = Math.max(width, minSize);
    height = Math.max(height, minSize);
    x = Math.max(0, Math.min(x, imgSize.width - width));
    y = Math.max(0, Math.min(y, imgSize.height - height));
    return { x, y, width, height };
  }, [imgSize]);

  const handlePointerDown = useCallback((e: React.PointerEvent, type: 'move' | 'resize-br') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    setCrop(prev => {
      if (dragType === 'move') {
        return clampCrop({ ...prev, x: prev.x + dx, y: prev.y + dy });
      }

      const presetObj = ASPECT_PRESETS.find(p => p.value === aspect);
      const ratio = presetObj?.ratio;

      let newW = prev.width + dx;
      let newH = prev.height + dy;

      if (ratio) {
        const avgDelta = (dx + dy) / 2;
        if (Math.abs(dx) > Math.abs(dy)) {
          newW = prev.width + dx;
          newH = newW / ratio;
        } else {
          newH = prev.height + dy;
          newW = newH * ratio;
        }
      }

      return clampCrop({ ...prev, width: newW, height: newH });
    });
  }, [isDragging, dragStart, dragType, aspect, clampCrop]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS });

  const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;

  const handleApply = () => {
    const img = imgRef.current;
    if (!img) return;

    const scaleX = img.naturalWidth / imgSize.width;
    const scaleY = img.naturalHeight / imgSize.height;

    const srcX = crop.x * scaleX;
    const srcY = crop.y * scaleY;
    const srcW = crop.width * scaleX;
    const srcH = crop.height * scaleY;

    const canvas = document.createElement('canvas');
    const maxOut = 400;
    const outScale = Math.min(maxOut / srcW, maxOut / srcH, 1);
    canvas.width = srcW * outScale;
    canvas.height = srcH * outScale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = filterString;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    onApply(base64);
  };

  const filterSliders: { key: keyof Filters; label: string; icon: React.ReactNode; min: number; max: number }[] = [
    { key: 'brightness', label: 'Brightness', icon: <Sun size={14} />, min: 50, max: 150 },
    { key: 'contrast', label: 'Contrast', icon: <Contrast size={14} />, min: 50, max: 150 },
    { key: 'saturation', label: 'Saturation', icon: <Droplets size={14} />, min: 0, max: 200 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-background rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-lg">Edit Photo</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4">
          {(['crop', 'adjust'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab === 'crop' ? <Crop size={14} /> : <Sun size={14} />}
              {tab === 'crop' ? 'Crop' : 'Adjust'}
            </button>
          ))}
        </div>

        <div ref={containerRef} className="px-6 py-4">
          <div
            className="relative mx-auto overflow-hidden rounded-xl bg-black/20"
            style={{ width: imgSize.width || '100%', height: imgSize.height || 300 }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Edit preview"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
              className="block select-none"
              style={{
                width: imgSize.width || '100%',
                height: imgSize.height || 'auto',
                filter: filterString,
              }}
              draggable={false}
            />

            {activeTab === 'crop' && imgSize.width > 0 && (
              <>
                <div
                  className="absolute inset-0 bg-black/50 pointer-events-none"
                  style={{
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%,
                      0% ${(crop.y / imgSize.height) * 100}%,
                      ${(crop.x / imgSize.width) * 100}% ${(crop.y / imgSize.height) * 100}%,
                      ${(crop.x / imgSize.width) * 100}% ${((crop.y + crop.height) / imgSize.height) * 100}%,
                      ${((crop.x + crop.width) / imgSize.width) * 100}% ${((crop.y + crop.height) / imgSize.height) * 100}%,
                      ${((crop.x + crop.width) / imgSize.width) * 100}% ${(crop.y / imgSize.height) * 100}%,
                      0% ${(crop.y / imgSize.height) * 100}%
                    )`,
                  }}
                />
                <div
                  className="absolute border-2 border-white/90 cursor-move"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.width,
                    height: crop.height,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                >
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>

                  {[
                    'top-0 left-0',
                    'top-0 right-0',
                    'bottom-0 left-0',
                    'bottom-0 right-0',
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className={`absolute ${pos} w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white rounded-sm shadow-md pointer-events-none`}
                      style={{
                        transform: `translate(${pos.includes('right') ? '50%' : '-50%'}, ${pos.includes('bottom') ? '50%' : '-50%'})`,
                      }}
                    />
                  ))}

                  <div
                    className="absolute -bottom-2 -right-2 w-6 h-6 cursor-se-resize z-10"
                    onPointerDown={(e) => handlePointerDown(e, 'resize-br')}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-4 space-y-3">
          {activeTab === 'crop' && (
            <div className="flex items-center gap-2">
              {ASPECT_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setAspect(preset.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    aspect === preset.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {preset.icon}
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'adjust' && (
            <div className="space-y-4">
              {filterSliders.map(slider => (
                <div key={slider.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      {slider.icon} {slider.label}
                    </label>
                    <span className="text-xs font-mono text-muted-foreground">{filters[slider.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    value={filters[slider.key]}
                    onChange={e => setFilters(prev => ({ ...prev, [slider.key]: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              ))}
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw size={12} /> Reset Adjustments
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t bg-muted/30">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <Check size={16} /> Apply
          </button>
        </div>
      </div>
    </div>
  );
};
