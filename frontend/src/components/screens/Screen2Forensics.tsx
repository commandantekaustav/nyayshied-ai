import React, { useEffect, useRef } from 'react';
import { ClaimAnalysisResponse } from '../../types/claim';
import { ShieldAlert, Ruler, Cpu, CheckCircle2, FileSearch, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Screen2ForensicsProps {
  claimData: ClaimAnalysisResponse;
  imageSrc: string;
}

export const Screen2Forensics: React.FC<Screen2ForensicsProps> = ({ claimData, imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pricing = claimData.pricing;
  const triage = claimData.triage;
  const aiAuth = triage.ai_authenticity;
  const userVerif = triage.user_annotation_verification;
  const clauseAnalysis = triage.warranty_clause_analysis;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Draw original photo
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Dark overlay to make bounding boxes pop
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const boxes = triage.bounding_boxes || [];
      const centerPoints: { x: number; y: number; isCovered: boolean }[] = [];

      boxes.forEach((box) => {
        // [ymin, xmin, ymax, xmax] 0-1000 scale
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        const x = (xmin / 1000) * width;
        const y = (ymin / 1000) * height;
        const boxW = ((xmax - xmin) / 1000) * width;
        const boxH = ((ymax - ymin) / 1000) * height;

        const isCovered = box.defect_classification === 'MANUFACTURING_DEFECT';
        centerPoints.push({ x: x + boxW / 2, y: y + boxH / 2, isCovered });

        // User annotated vs system discovered
        const isUserAnnotated = !!box.is_user_annotated;
        const color = isCovered ? '#10b981' : isUserAnnotated ? '#c084fc' : '#f59e0b';
        const bgFill = isCovered ? 'rgba(16, 185, 129, 0.18)' : isUserAnnotated ? 'rgba(192, 132, 252, 0.18)' : 'rgba(245, 158, 11, 0.18)';

        // Draw translucent highlight box
        ctx.fillStyle = bgFill;
        ctx.fillRect(x, y, boxW, boxH);

        // Draw glowing border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, boxW, boxH);

        // Draw corner brackets
        const cornerSize = 10;
        ctx.lineWidth = 3.5;
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
        const labelText = `${isUserAnnotated ? '★ ' : ''}${box.part_type} (${box.oem_part_code || 'OEM'})`;
        ctx.font = 'bold 11px Inter, sans-serif';
        const textWidth = ctx.measureText(labelText).width;
        const pillH = 20;
        const pillW = textWidth + 16;
        const pillY = y > 25 ? y - 22 : y + boxH + 4;

        ctx.fillStyle = isCovered ? '#064e3b' : isUserAnnotated ? '#581c87' : '#78350f';
        ctx.fillRect(x, pillY, pillW, pillH);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, pillY, pillW, pillH);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 8, pillY + 14);
      });

      // Draw Euclidean separation line ONLY if 2 or more distinct boxes exist and separation is positive
      if (centerPoints.length >= 2 && triage.euclidean_separation_mm > 0) {
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
        const distText = `↔ ${triage.euclidean_separation_mm.toFixed(1)} mm`;

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
  }, [imageSrc, triage]);

  return (
    <div className="space-y-4 pb-28">
      {/* AI Synthetic / Fake Image Detection Card */}
      {aiAuth && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-lg ${
          aiAuth.is_authentic 
            ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/80 border-red-500 text-red-300'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              aiAuth.is_authentic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {aiAuth.is_authentic ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {aiAuth.is_authentic ? 'Physical Capture Verified' : 'AI Synthetic Image Warning'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-black/40 border border-current">
                  AI Prob: {(aiAuth.ai_generated_probability * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {aiAuth.forensic_authenticity_notes}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-black/50 border border-slate-700">
            {aiAuth.authenticity_verdict === 'AUTHENTIC_PHYSICAL_DEVICE' ? '0% FAKE' : 'SUSPECT'}
          </span>
        </div>
      )}

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
            <span className="text-[10px] text-emerald-400/80 font-mono">Part #{triage.primary_fault_part_code}</span>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-[11px] text-red-300 flex items-center justify-between">
          <span>Unjustified Overcharge:</span>
          <span className="font-mono font-extrabold text-white text-xs">
            +₹{pricing.excess_unjustified_inr.toLocaleString('en-IN')} ({((pricing.price_gouging_multiplier - 1) * 100).toFixed(0)}% markup)
          </span>
        </div>
      </div>

      {/* Forensic Spatial Canvas Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Spatial Defect Triage ({triage.device_model})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
            {triage.inference_latency_ms ? `${triage.inference_latency_ms.toFixed(0)} ms` : 'Gemini 3.5-Flash'}
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

        {/* Color Coded Legend */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-200">Covered Defect: {triage.primary_fault_part_code}</span>
                <p className="text-[10px] text-slate-400">{triage.primary_fault_part_name} (₹{pricing.fair_oem_cost_inr})</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 font-mono">IN-WARRANTY</span>
          </div>

          {triage.cosmetic_part_code && (
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-200">Unrelated Cosmetic Wear: {triage.cosmetic_part_code}</span>
                  <p className="text-[10px] text-slate-400">Isolated Surface Mark (Non-Causal)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-400 font-mono">NON-DROP</span>
            </div>
          )}

          {/* Separation or Single Defect Isolation Proof */}
          {triage.euclidean_separation_mm > 0 ? (
            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-start space-x-2 text-xs">
              <Ruler className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-300">
                  Spatial Separation: {triage.euclidean_separation_mm.toFixed(1)} mm
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Physical distance between secondary cosmetic marks and the primary mechanical defect is {triage.euclidean_separation_mm.toFixed(1)} mm. 
                  Spatial physics disproves external impact drop causation.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">
                  Single Isolated Defect Verified (0 Secondary Impact Trauma)
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Chassis scan confirmed zero secondary impact marks, drop dings, or trauma on the device. An isolated structural failure conclusively verifies an inherent manufacturing defect under CPA 2019 Sec 2(11).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Annotation Verification Card */}
      {userVerif && (
        <div className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSearch className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Target Reticle Audit</h3>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
              {userVerif.damage_verified ? '✓ Defect Verified' : 'No Damage in Reticle'}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Component Identified:</span>
              <span className="font-bold text-slate-200">{userVerif.component_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Failure Mechanism:</span>
              <span className="font-bold text-purple-300">{userVerif.defect_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Statutory Classification:</span>
              <span className="font-mono text-emerald-400 font-bold">{userVerif.classification}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 bg-purple-950/20 border border-purple-900/40 p-2.5 rounded-xl leading-relaxed">
            {userVerif.forensic_report}
          </p>
        </div>
      )}

      {/* Warranty Clause & Free Repair Entitlement Card */}
      {clauseAnalysis && (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Warranty & Free Repair Audit</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              {clauseAnalysis.eligible_for_free_repair ? '✓ 100% Free Repair Eligible' : 'Excluded'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
            <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold block mb-1">
              Applicable Policy Clause:
            </span>
            <p className="text-slate-200 font-medium text-[11px]">
              {clauseAnalysis.applicable_free_repair_clause}
            </p>
          </div>

          {clauseAnalysis.damages_not_covered && clauseAnalysis.damages_not_covered.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block mb-1">
                Excluded Superficial Damages (Policy Clear):
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-400 text-[11px]">
                {clauseAnalysis.damages_not_covered.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{clauseAnalysis.legal_remedy_summary}</span>
          </div>
        </div>
      )}
    </div>
  );
};
