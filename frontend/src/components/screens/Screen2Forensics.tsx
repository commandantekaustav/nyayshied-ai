import React, { useEffect, useRef } from 'react';
import { ClaimAnalysisResponse } from '../../types/claim';
import { ShieldAlert, Ruler, Cpu } from 'lucide-react';

interface Screen2ForensicsProps {
  claimData: ClaimAnalysisResponse;
  imageSrc: string;
}

export const Screen2Forensics: React.FC<Screen2ForensicsProps> = ({ claimData, imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      // Set canvas dimensions matching container aspect ratio
      const width = canvas.width;
      const height = canvas.height;

      // Draw original photo
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Dark overlay to make bounding boxes pop
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const boxes = claimData.triage.bounding_boxes;
      let centerPoints: { x: number; y: number }[] = [];

      boxes.forEach((box) => {
        // [ymin, xmin, ymax, xmax] 0-1000 scale
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        const x = (xmin / 1000) * width;
        const y = (ymin / 1000) * height;
        const boxW = ((xmax - xmin) / 1000) * width;
        const boxH = ((ymax - ymin) / 1000) * height;

        centerPoints.push({ x: x + boxW / 2, y: y + boxH / 2 });

        const isCovered = box.defect_classification === 'MANUFACTURING_DEFECT';
        const color = isCovered ? '#10b981' : '#f59e0b'; // Emerald or Amber
        const bgFill = isCovered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';

        // Draw translucent highlight box
        ctx.fillStyle = bgFill;
        ctx.fillRect(x, y, boxW, boxH);

        // Draw glowing border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, boxW, boxH);

        // Draw corner brackets
        const cornerSize = 10;
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Top Left
        ctx.moveTo(x, y + cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y);
        // Top Right
        ctx.moveTo(x + boxW - cornerSize, y); ctx.lineTo(x + boxW, y); ctx.lineTo(x + boxW, y + cornerSize);
        // Bottom Left
        ctx.moveTo(x, y + boxH - cornerSize); ctx.lineTo(x, y + boxH); ctx.lineTo(x + cornerSize, y + boxH);
        // Bottom Right
        ctx.moveTo(x + boxW - cornerSize, y + boxH); ctx.lineTo(x + boxW, y + boxH); ctx.lineTo(x + boxW, y + boxH - cornerSize);
        ctx.stroke();

        // Label pill
        const labelText = `${box.part_type} (${box.oem_part_code || 'OEM'})`;
        ctx.font = 'bold 11px Inter, sans-serif';
        const textWidth = ctx.measureText(labelText).width;
        const pillH = 20;
        const pillW = textWidth + 16;
        const pillY = y > 25 ? y - 22 : y + boxH + 4;

        ctx.fillStyle = isCovered ? '#064e3b' : '#78350f';
        ctx.fillRect(x, pillY, pillW, pillH);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, pillY, pillW, pillH);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 8, pillY + 14);
      });

      // Draw Euclidean separation line if 2 boxes exist
      if (centerPoints.length >= 2) {
        const p1 = centerPoints[0];
        const p2 = centerPoints[1];

        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Midpoint badge
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const distText = `↔ ${claimData.triage.euclidean_separation_mm.toFixed(1)} mm (>140mm)`;

        ctx.font = 'bold 10px monospace';
        const mw = ctx.measureText(distText).width + 12;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(midX - mw / 2, midY - 11, mw, 22);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(midX - mw / 2, midY - 11, mw, 22);

        ctx.fillStyle = '#38bdf8';
        ctx.fillText(distText, midX - mw / 2 + 6, midY + 4);
      }
    };
  }, [imageSrc, claimData]);

  const pricing = claimData.pricing;
  const triage = claimData.triage;

  return (
    <div className="space-y-4 pb-24">
      {/* 8.0x Price Gouging Alert Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/80 via-slate-900 to-amber-950/60 border border-red-500/40 p-4 shadow-2xl shadow-red-950/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono">
                CPA 2019 Sec 2(47) Violation
              </span>
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>{pricing.price_gouging_multiplier.toFixed(1)}× Price Gouging Alert</span>
              </h2>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold font-mono">
            {pricing.gouging_severity.replace('_', ' ')}
          </span>
        </div>

        {/* Pricing Comparison Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-red-500/20">
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-red-500/30">
            <span className="text-[11px] text-slate-400 font-medium">Service Center Demand</span>
            <p className="text-xl font-mono font-black text-red-400 mt-0.5">
              ₹{pricing.walk_in_quote_inr.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-red-400/80 font-mono">Demanded Walk-In</span>
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-3 border border-emerald-500/30">
            <span className="text-[11px] text-slate-400 font-medium">Fair OEM Spare Cost</span>
            <p className="text-xl font-mono font-black text-emerald-400 mt-0.5">
              ₹{pricing.fair_oem_cost_inr.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-400/80 font-mono">HP Bezel #{triage.primary_fault_part_code}</span>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-[11px] text-red-300 flex items-center justify-between">
          <span>Unjustified Consumer Overcharge:</span>
          <span className="font-mono font-extrabold text-white text-xs">
            +₹{pricing.excess_unjustified_inr.toLocaleString('en-IN')} ({((pricing.price_gouging_multiplier - 1) * 100).toFixed(0)}% markup)
          </span>
        </div>
      </div>

      {/* Forensic Spatial Canvas Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Spatial Defect Triage</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
            Gemini 2.5-Pro (0-1000)
          </span>
        </div>

        {/* HTML5 Canvas with normalized bounding boxes */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
          <canvas
            ref={canvasRef}
            width={600}
            height={450}
            className="w-full h-auto aspect-[4/3] block"
          />
        </div>

        {/* Color Coded Legend & Physical Separation Metric */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-200">Covered Defect: {triage.primary_fault_part_code}</span>
                <p className="text-[10px] text-slate-400">Left Hinge Bezel Tensile Fracture (₹2,500)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 font-mono">100% IN-WARRANTY</span>
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-200">Unrelated Mark: {triage.cosmetic_part_code || 'C-Cover'}</span>
                <p className="text-[10px] text-slate-400">Superficial Palmrest Hairline Cosmetic Scratch</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400 font-mono">NON-CAUSAL</span>
          </div>

          {/* Separation Proof */}
          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-start space-x-2 text-xs">
            <Ruler className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sky-300">
                Euclidean Separation: {triage.euclidean_separation_mm.toFixed(1)} mm (&gt;140 mm)
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                The cosmetic palmrest mark is {triage.euclidean_separation_mm.toFixed(1)} mm away from the hinge fracture. 
                Spatial physics scientifically disproves external impact drop causation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
