import React, { useEffect, useRef } from 'react';
import { ClaimAnalysisResponse, BoundingBox } from '../../types/claim';
import { ShieldAlert, Ruler, Cpu, CheckCircle2, FileSearch, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Screen2ForensicsProps {
  claimData: ClaimAnalysisResponse;
  imageSrc: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function getClassificationStyle(classification: BoundingBox['defect_classification']) {
  if (classification === 'MANUFACTURING_DEFECT') {
    return {
      color: '#10b981',
      fill: 'rgba(16, 185, 129, 0.14)',
      pillBg: '#064e3b',
      badgeText: 'IN-WARRANTY',
      textClass: 'text-emerald-400',
      dotClass: 'bg-emerald-500',
    };
  }
  if (classification === 'IMPACT_DAMAGE') {
    return {
      color: '#ef4444',
      fill: 'rgba(239, 68, 68, 0.15)',
      pillBg: '#7f1d1d',
      badgeText: 'ACCIDENTAL / IMPACT',
      textClass: 'text-red-400',
      dotClass: 'bg-red-500',
    };
  }
  return {
    color: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.14)',
    pillBg: '#78350f',
    badgeText: 'COSMETIC / NON-CAUSAL',
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-500',
  };
}

export const Screen2Forensics: React.FC<Screen2ForensicsProps> = ({ claimData, imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pricing = claimData.pricing;
  const triage = claimData.triage;
  const aiAuth = triage.ai_authenticity;
  const userVerif = triage.user_annotation_verification;
  const clauseAnalysis = triage.warranty_clause_analysis;
  const isInvalidDevice = triage.is_device === false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Preserve natural aspect ratio (zero 4:3 stretching!)
      const width = img.naturalWidth || 1000;
      const height = img.naturalHeight || 750;
      canvas.width = width;
      canvas.height = height;

      const scale = Math.max(1, width / 600);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Subtle dark dim so bounding boxes pop clearly
      ctx.fillStyle = 'rgba(2, 6, 23, 0.18)';
      ctx.fillRect(0, 0, width, height);

      const boxes = triage.bounding_boxes || [];
      const centerPoints: { x: number; y: number }[] = [];

      boxes.forEach((box, idx) => {
        // [ymin, xmin, ymax, xmax] 0-1000 scale
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        const x = (xmin / 1000) * width;
        const y = (ymin / 1000) * height;
        const boxW = Math.max(24 * scale, ((xmax - xmin) / 1000) * width);
        const boxH = Math.max(24 * scale, ((ymax - ymin) / 1000) * height);

        const style = getClassificationStyle(box.defect_classification);
        centerPoints.push({ x: x + boxW / 2, y: y + boxH / 2 });

        // Draw translucent rounded highlight box (ported from _ref_detection)
        ctx.save();
        ctx.strokeStyle = style.color;
        ctx.lineWidth = 2.5 * scale;
        ctx.fillStyle = style.fill;
        drawRoundedRect(ctx, x, y, boxW, boxH, 7 * scale, true, true);
        ctx.restore();

        // Corner brackets
        const cornerSize = 9 * scale;
        ctx.strokeStyle = style.color;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(x, y + cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y);
        ctx.moveTo(x + boxW - cornerSize, y); ctx.lineTo(x + boxW, y); ctx.lineTo(x + boxW, y + cornerSize);
        ctx.moveTo(x, y + boxH - cornerSize); ctx.lineTo(x, y + boxH); ctx.lineTo(x + cornerSize, y + boxH);
        ctx.moveTo(x + boxW - cornerSize, y + boxH); ctx.lineTo(x + boxW, y + boxH); ctx.lineTo(x + boxW, y + boxH - cornerSize);
        ctx.stroke();

        // Numbered tag circle (1), (2), ... at top-left corner (ported from _ref_detection)
        const tagRadius = 11 * scale;
        const tagCx = Math.max(tagRadius + 2 * scale, x);
        const tagCy = Math.max(tagRadius + 2 * scale, y);
        ctx.beginPath();
        ctx.arc(tagCx, tagCy, tagRadius, 0, Math.PI * 2);
        ctx.fillStyle = style.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8 * scale;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(11 * scale)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), tagCx, tagCy);

        // Label pill above or below box
        const isUserAnnotated = !!box.is_user_annotated;
        const labelText = `${isUserAnnotated ? '★ ' : ''}${box.part_type} (${box.oem_part_code || 'OEM'})`;
        ctx.font = `bold ${Math.round(10.5 * scale)}px Inter, sans-serif`;
        const textWidth = ctx.measureText(labelText).width;
        const pillH = 20 * scale;
        const pillW = Math.min(width - 16 * scale, textWidth + 16 * scale);
        const pillX = Math.max(8 * scale, Math.min(width - pillW - 8 * scale, x + tagRadius + 6 * scale));
        const pillY = y > 26 * scale ? y - pillH - 4 * scale : Math.min(height - pillH - 4 * scale, y + boxH + 4 * scale);

        ctx.fillStyle = style.pillBg;
        ctx.strokeStyle = style.color;
        ctx.lineWidth = 1.2 * scale;
        drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 10 * scale, true, true);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, pillX + 8 * scale, pillY + pillH / 2, pillW - 14 * scale);
      });

      // Draw Euclidean separation line ONLY if 2 or more distinct boxes exist and separation > 0
      if (centerPoints.length >= 2 && triage.euclidean_separation_mm > 0) {
        const p1 = centerPoints[0];
        const p2 = centerPoints[1];

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6 * scale, 6 * scale]);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2 * scale;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();

        // Midpoint badge
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const distText = `↔ ${triage.euclidean_separation_mm.toFixed(1)} mm`;

        ctx.font = `bold ${Math.round(10 * scale)}px monospace`;
        const mw = ctx.measureText(distText).width + 14 * scale;
        const mh = 22 * scale;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5 * scale;
        drawRoundedRect(ctx, midX - mw / 2, midY - mh / 2, mw, mh, 6 * scale, true, true);

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(distText, midX, midY);
      }
    };

    img.src = imageSrc;
  }, [imageSrc, triage]);

  const primaryBoxStyle = getClassificationStyle(
    triage.bounding_boxes?.[0]?.defect_classification ||
      triage.user_annotation_verification?.classification ||
      'MANUFACTURING_DEFECT'
  );

  return (
    <div className="space-y-4 pb-28">
      {/* Invalid Device Warning Banner */}
      {isInvalidDevice && (
        <div className="p-3.5 rounded-2xl border bg-red-950/70 border-red-500/60 text-red-200 flex items-start space-x-2.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">
              Invalid Scan — No Consumer Device Detected
            </span>
            <p className="text-[11px] text-red-200/80 mt-0.5 leading-relaxed">
              The uploaded photo does not appear to show a laptop, smartphone, or electronics hardware device. Please capture a clearer photo of the damaged hardware.
            </p>
          </div>
        </div>
      )}

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

      {/* Price Gouging Alert Card */}
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
            +₹{pricing.excess_unjustified_inr.toLocaleString('en-IN')} ({Math.max(0, (pricing.price_gouging_multiplier - 1) * 100).toFixed(0)}% markup)
          </span>
        </div>
      </div>

      {/* Forensic Spatial Canvas Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-bold text-slate-100 truncate">
              Spatial Defect Triage ({triage.device_model})
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {triage.is_fallback ? (
              <span className="text-[9px] font-mono text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold">
                ✓ Benchmark Engine
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                {triage.inference_latency_ms ? `${triage.inference_latency_ms.toFixed(0)} ms` : 'Gemini 3.8-Flash'}
              </span>
            )}
          </div>
        </div>

        {/* Aspect-Ratio-Preserving HTML5 Canvas with Normalized Bounding Boxes */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full w-auto h-auto max-h-[420px] object-contain block mx-auto"
          />
        </div>

        {/* Dynamic Color-Coded Legend for Detected Boxes */}
        <div className="space-y-2">
          {(triage.bounding_boxes || []).length > 0 ? (
            triage.bounding_boxes.map((box, idx) => {
              const bStyle = getClassificationStyle(box.defect_classification);
              return (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <span className={`w-3 h-3 rounded-md shrink-0 ${bStyle.dotClass}`} />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block truncate">
                        ({idx + 1}) {box.part_type}: {box.oem_part_code || triage.primary_fault_part_code}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate">
                        {box.label}
                        {idx === 0 ? ` (Est. OEM ₹${pricing.fair_oem_cost_inr.toLocaleString('en-IN')})` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold font-mono shrink-0 ${bStyle.textClass}`}>
                    {bStyle.badgeText}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-md shrink-0 ${primaryBoxStyle.dotClass}`} />
                <div>
                  <span className="font-bold text-slate-200">{triage.primary_fault_part_name}</span>
                  <p className="text-[10px] text-slate-400">{triage.defect_summary}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold font-mono ${primaryBoxStyle.textClass}`}>
                {primaryBoxStyle.badgeText}
              </span>
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
                  Physical distance between localized regions is {triage.euclidean_separation_mm.toFixed(1)} mm.{' '}
                  {triage.causation_analysis}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">
                  {triage.warranty_covered
                    ? 'Single Isolated Defect Verified (0 Secondary Impact Trauma)'
                    : 'Forensic Causation Assessment Complete'}
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {triage.causation_analysis}
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
              <h3 className="text-sm font-bold text-white">Target Defect Audit</h3>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
              {userVerif.damage_verified ? '✓ Defect Verified' : 'No Damage Verified'}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-slate-400 shrink-0">Component Identified:</span>
              <span className="font-bold text-slate-200 text-right">{userVerif.component_name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400 shrink-0">Failure Mechanism:</span>
              <span className="font-bold text-purple-300 text-right">{userVerif.defect_type}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400 shrink-0">Statutory Classification:</span>
              <span className={`font-mono font-bold ${primaryBoxStyle.textClass}`}>
                {userVerif.classification}
              </span>
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
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
              clauseAnalysis.eligible_for_free_repair
                ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'
                : 'text-red-300 bg-red-500/20 border-red-500/30'
            }`}>
              {clauseAnalysis.eligible_for_free_repair ? '✓ 100% Free Repair Eligible' : 'Not Covered Under Mfg. Warranty'}
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
                Excluded / Non-Warranty Damages:
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
