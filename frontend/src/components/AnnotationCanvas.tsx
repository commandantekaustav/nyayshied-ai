import React, { useRef, useState, useEffect, useCallback } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<[number, number, number, number] | null>(initialBox);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sync initialBox if changed
  useEffect(() => {
    if (initialBox) {
      setCurrentBox(initialBox);
    }
  }, [initialBox]);

  const getRelativeCoords = useCallback((clientX: number, clientY: number) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

    // Normalize to 0 - 1000 scale
    const xNorm = Math.round((x / rect.width) * 1000);
    const yNorm = Math.round((y / rect.height) * 1000);

    return { xNorm, yNorm };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const coords = getRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;

    setIsDrawing(true);
    setStartPoint({ x: coords.xNorm, y: coords.yNorm });
    setCurrentBox(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !startPoint) return;
    e.preventDefault();
    const coords = getRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;

    const ymin = Math.min(startPoint.y, coords.yNorm);
    const xmin = Math.min(startPoint.x, coords.xNorm);
    const ymax = Math.max(startPoint.y, coords.yNorm);
    const xmax = Math.max(startPoint.x, coords.xNorm);

    // Box must have a minimum size
    if (ymax - ymin > 15 && xmax - xmin > 15) {
      const box: [number, number, number, number] = [ymin, xmin, ymax, xmax];
      setCurrentBox(box);
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && currentBox) {
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

  const handleAutoSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Suggest a typical primary hinge defect box
    const presetBox: [number, number, number, number] = [730, 80, 895, 270];
    setCurrentBox(presetBox);
    onAnnotationChange(presetBox);
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-inner select-none">
      {/* Top Banner with Instructions */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-purple-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>Interactive Damage Reticle</span>
        </div>
        <div className="flex items-center gap-2">
          {currentBox && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800 hover:bg-red-900 text-[10px] transition-colors"
            >
              Clear Box
            </button>
          )}
          <button
            type="button"
            onClick={handleAutoSelect}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-[10px] transition-colors"
          >
            Auto Target
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden flex items-center justify-center cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Upload to annotate"
          className="w-full h-auto max-h-[340px] object-contain block"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {/* Drawn Box Overlay */}
        {imageLoaded && currentBox && (
          <div
            className="absolute border-2 border-purple-400 bg-purple-500/20 rounded shadow-[0_0_15px_rgba(168,85,247,0.4)] pointer-events-none transition-all duration-75"
            style={{
              top: `${(currentBox[0] / 1000) * 100}%`,
              left: `${(currentBox[1] / 1000) * 100}%`,
              height: `${((currentBox[2] - currentBox[0]) / 1000) * 100}%`,
              width: `${((currentBox[3] - currentBox[1]) / 1000) * 100}%`,
            }}
          >
            {/* Tag Badge */}
            <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-purple-900/90 border border-purple-500 text-[9px] font-mono text-purple-200 rounded whitespace-nowrap shadow-md">
              Targeted Damage [{currentBox[0]}, {currentBox[1]}, {currentBox[2]}, {currentBox[3]}]
            </div>
            {/* Corner Crosshairs */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-purple-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-purple-200" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-purple-200" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-purple-200" />
          </div>
        )}

        {/* Helper overlay when no box is drawn */}
        {imageLoaded && !currentBox && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[0.5px]">
            <div className="bg-slate-900/90 border border-purple-500/50 rounded-lg px-3 py-1.5 text-center text-xs text-purple-200 shadow-lg">
              👆 Drag a square around the suspected crack/defect
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Model will verify damage inside box + scan remaining areas</span>
        {currentBox ? (
          <span className="text-emerald-400 font-mono text-[10px]">✓ Region Locked</span>
        ) : (
          <span className="text-amber-400 font-mono text-[10px]">No Box Marked (Auto-Scan)</span>
        )}
      </div>
    </div>
  );
};
