import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Scan, Crosshair } from 'lucide-react';

interface AnnotationCanvasProps {
  imageUrl: string;
  onAnnotationChange: (box: [number, number, number, number] | null) => void;
  initialBox?: [number, number, number, number] | null;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  imageUrl,
  onAnnotationChange,
  initialBox = null,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [scanMode, setScanMode] = useState<'full' | 'specific'>(initialBox ? 'specific' : 'full');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<[number, number, number, number] | null>(initialBox);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sync when initialBox changes (e.g., Golden Case loaded or new image resets to null)
  useEffect(() => {
    setCurrentBox(initialBox);
    if (initialBox) {
      setScanMode('specific');
    }
  }, [initialBox]);

  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  const handleModeSwitch = (mode: 'full' | 'specific') => {
    setScanMode(mode);
    if (mode === 'full') {
      setCurrentBox(null);
      onAnnotationChange(null);
    }
  };

  const getRelativeCoords = useCallback((clientX: number, clientY: number) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

    // Normalize strictly against the rendered bitmap dimensions (0 - 1000 scale)
    const xNorm = Math.round((x / rect.width) * 1000);
    const yNorm = Math.round((y / rect.height) * 1000);

    return { xNorm, yNorm };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scanMode !== 'specific') return;
    e.preventDefault();
    const coords = getRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;

    setIsDrawing(true);
    setStartPoint({ x: coords.xNorm, y: coords.yNorm });
    setCurrentBox(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (scanMode !== 'specific' || !isDrawing || !startPoint) return;
    e.preventDefault();
    const coords = getRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;

    const ymin = Math.min(startPoint.y, coords.yNorm);
    const xmin = Math.min(startPoint.x, coords.xNorm);
    const ymax = Math.max(startPoint.y, coords.yNorm);
    const xmax = Math.max(startPoint.x, coords.xNorm);

    if (ymax - ymin > 15 && xmax - xmin > 15) {
      const box: [number, number, number, number] = [ymin, xmin, ymax, xmax];
      setCurrentBox(box);
    }
  };

  const handlePointerUp = () => {
    if (scanMode === 'specific' && isDrawing && currentBox) {
      onAnnotationChange(currentBox);
    }
    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBox(null);
    onAnnotationChange(null);
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-inner select-none">
      {/* Two-Mode Switcher (Ported from _ref_detection) */}
      <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-950 border-b border-slate-800">
        <button
          type="button"
          onClick={() => handleModeSwitch('full')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
            scanMode === 'full'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Full Device Scan</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeSwitch('specific')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
            scanMode === 'specific'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Mark Specific Damage</span>
        </button>
      </div>

      {/* Sub-header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <span className={`w-2 h-2 rounded-full ${scanMode === 'specific' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span>
            {scanMode === 'full'
              ? 'AI will auto-locate all defects & wear across the device'
              : 'Drag a red square tightly around the defect'}
          </span>
        </div>
        {scanMode === 'specific' && currentBox && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800 hover:bg-red-900 text-[10px] transition-colors shrink-0 ml-2"
          >
            Clear Box
          </button>
        )}
      </div>

      {/* Shrink-Wrapped Stage: eliminates object-contain pillarbox coordinate drift */}
      <div className="w-full flex items-center justify-center bg-slate-950 py-1 px-1">
        <div
          className={`relative inline-block max-w-full touch-none ${
            scanMode === 'specific' ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Upload to annotate"
            className="block max-h-[340px] max-w-full w-auto h-auto select-none"
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />

          {/* Drawn Red Reticle Box Overlay matching _ref_detection's #EF4444 highlight */}
          {imageLoaded && scanMode === 'specific' && currentBox && (
            <div
              className="absolute border-2 border-red-500 bg-red-500/15 rounded shadow-[0_0_15px_rgba(239,68,68,0.45)] pointer-events-none transition-all duration-75"
              style={{
                top: `${(currentBox[0] / 1000) * 100}%`,
                left: `${(currentBox[1] / 1000) * 100}%`,
                height: `${((currentBox[2] - currentBox[0]) / 1000) * 100}%`,
                width: `${((currentBox[3] - currentBox[1]) / 1000) * 100}%`,
              }}
            >
              <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-red-950/90 border border-red-500 text-[9px] font-mono text-red-200 rounded whitespace-nowrap shadow-md">
                Marked Defect [{currentBox[0]}, {currentBox[1]}, {currentBox[2]}, {currentBox[3]}]
              </div>
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-200" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-red-200" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-red-200" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-200" />
            </div>
          )}

          {/* Helper prompt overlay only in Specific mode when no box drawn yet */}
          {imageLoaded && scanMode === 'specific' && !currentBox && !isDrawing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/25 backdrop-blur-[0.5px]">
              <div className="bg-slate-900/90 border border-red-500/50 rounded-lg px-3 py-1.5 text-center text-xs text-red-200 shadow-lg">
                👆 Drag a square around the suspected crack or defect
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Strip */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {scanMode === 'specific'
            ? 'Red mark is flattened onto image + rest of device scanned'
            : 'Full chassis multi-defect detection active'}
        </span>
        {scanMode === 'specific' && currentBox ? (
          <span className="text-red-400 font-mono text-[10px] font-bold">✓ Region Locked</span>
        ) : scanMode === 'specific' ? (
          <span className="text-amber-400 font-mono text-[10px]">Draw Box Above</span>
        ) : (
          <span className="text-emerald-400 font-mono text-[10px] font-bold">Full Auto-Scan</span>
        )}
      </div>
    </div>
  );
};
