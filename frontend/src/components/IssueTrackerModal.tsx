import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Users, 
  GitBranch, 
  Copy, 
  Check, 
  Filter, 
  ShieldAlert, 
  Bug, 
  Laptop
} from 'lucide-react';

interface IssueItem {
  id: string;
  title: string;
  category: 'Spatial Vision' | 'Anti-Phantom' | 'Model Identification' | 'UI Canvas';
  tester: string;
  frequency: number;
  priority: 'P0' | 'P1';
  resolved: boolean;
  rootCause: string;
  technicalFix: string;
  resolvedAt: string;
}

const INITIAL_ISSUES: IssueItem[] = [
  {
    id: 'ISS-01',
    title: 'Removal of Hardcoded >140mm & 168.4mm Threshold Criteria',
    category: 'Spatial Vision',
    tester: 'Ishika',
    frequency: 3,
    priority: 'P0',
    resolved: true,
    rootCause: 'Prompt schemas, fallback engine, and canvas rendered static >140mm & 168.4mm distance regardless of image geometry.',
    technicalFix: 'Purged fixed 140mm references. Replaced with dynamic center-to-center Euclidean math when 2+ defects exist, and 0.0mm clean chassis verification for single defect.',
    resolvedAt: '2026-11-21 01:32 IST',
  },
  {
    id: 'ISS-02',
    title: 'Phantom Bounding Box on Random/Background Space',
    category: 'Anti-Phantom',
    tester: 'Ishika',
    frequency: 2,
    priority: 'P0',
    resolved: true,
    rootCause: 'Few-shot vision prompt injected sample tuple [780, 720, 850, 840], inducing Gemini to invent a secondary box on empty desk/table surfaces.',
    technicalFix: 'Deployed Karpathy-style anti-phantom protocol: schema enforces unannotated_damages: [] when no secondary wear is on chassis. Box count drops to 1.',
    resolvedAt: '2026-11-21 01:30 IST',
  },
  {
    id: 'ISS-03',
    title: 'Dynamic Distance Engine (Zero-Phantom Mode)',
    category: 'UI Canvas',
    tester: 'Ishika',
    frequency: 2,
    priority: 'P1',
    resolved: true,
    rootCause: 'Canvas drew dashed Euclidean line and distance pill between single user box and phantom box.',
    technicalFix: 'Canvas now only renders separation line if len(boxes) >= 2 && separation > 0. For single defect, renders "✓ Single Isolated Defect (0 Secondary Trauma)".',
    resolvedAt: '2026-11-21 01:32 IST',
  },
  {
    id: 'ISS-04',
    title: 'HP Pavilion Image Displaying As HP Victus',
    category: 'Model Identification',
    tester: 'Ishika',
    frequency: 3,
    priority: 'P0',
    resolved: true,
    rootCause: 'Frontend App.tsx initialized modelName="Victus 15-fa1310tx", backend Form defaulted to Victus, and fallbacks forced HP Victus part #N13327-001.',
    technicalFix: 'Neutralized model defaults to empty strings. User-entered or image-detected series (HP Pavilion) now persists dynamically with matching OEM catalog codes.',
    resolvedAt: '2026-11-21 01:31 IST',
  },
  {
    id: 'ISS-05',
    title: 'Gemini Multimodal Device Auto-Identification',
    category: 'Model Identification',
    tester: 'Ishika',
    frequency: 2,
    priority: 'P1',
    resolved: true,
    rootCause: 'Multimodal vision prompt did not explicitly guide the model to inspect chassis badging, lid logos, and keyboard fonts.',
    technicalFix: 'Integrated skill-device-visual-identifier into Gemini 3.5 prompt to automatically recognize Pavilion, Victus, Inspiron, and ThinkPad directly from pixels.',
    resolvedAt: '2026-11-21 01:30 IST',
  },
];

interface IssueTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IssueTrackerModal: React.FC<IssueTrackerModalProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'P0' | 'P1' | 'RESOLVED'>('ALL');
  const [copied, setCopied] = useState(false);
  const [issues] = useState<IssueItem[]>(INITIAL_ISSUES);

  if (!isOpen) return null;

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'P0') return issue.priority === 'P0';
    if (filter === 'P1') return issue.priority === 'P1';
    if (filter === 'RESOLVED') return issue.resolved;
    return true;
  });

  const resolvedCount = issues.filter((i) => i.resolved).length;
  const p0Count = issues.filter((i) => i.priority === 'P0').length;

  const handleCopyMarkdown = () => {
    const text = `# NyayShield AI - Alpha Issue Tracker & Team Sync
Last Updated: 2026-11-21 02:25 IST
Status: ${resolvedCount}/${issues.length} Resolved (100%)

## Team Branches & Roles
- Kaustav: Lead Fullstack & AI Architecture (branch: main)
- Ishika: Alpha QA & Manual Hardware Verification (branch: Ishika-Module)
- Anwesha: Feature Developer (branch: b1)

## Issue Matrix
${issues.map(i => `- [${i.resolved ? 'x' : ' '}] **${i.id}** (${i.priority}) ${i.title} [Freq: ${i.frequency}x] - ${i.technicalFix}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold">
              <Bug className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Alpha Tester Issue Tracker
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  All Fixed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live synchronization between Kaustav (main), Ishika (feedbacks), and Anwesha (b1)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdown}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Copy markdown table for WhatsApp / Slack"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Sync Table' : 'Copy Team Sync'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Team Collaboration Bar */}
        <div className="px-4 py-3 bg-slate-900/30 border-b border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-200">Kaustav (Lead)</span>
              <p className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                <GitBranch className="w-2.5 h-2.5" /> branch: main (Live API)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <Laptop className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-200">Ishika (Alpha QA)</span>
              <p className="text-[10px] text-purple-400/90 font-mono flex items-center gap-1">
                <GitBranch className="w-2.5 h-2.5" /> branch: Ishika-Module
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <GitBranch className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-200">Anwesha (Developer)</span>
              <p className="text-[10px] text-sky-400/90 font-mono">
                Active Branch: b1
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills & Metric Ribbon */}
        <div className="px-4 py-2.5 border-b border-slate-800/60 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(['ALL', 'P0', 'P1', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filter === tab
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab === 'ALL' ? `All (${issues.length})` : tab === 'P0' ? `P0 Blockers (${p0Count})` : tab === 'P1' ? 'P1 High (2)' : `Resolved (${resolvedCount})`}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {resolvedCount}/{issues.length} Resolved (100%)
            </span>
          </div>
        </div>

        {/* Issues List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-2.5"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5">
                    {issue.resolved ? (
                      <span className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs">
                        ○
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
                        {issue.id}
                      </span>
                      <span className="font-semibold text-slate-100 text-sm">
                        {issue.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Reported by <span className="text-purple-300 font-medium">{issue.tester}</span> • Frequency:{' '}
                      <span className="text-amber-400 font-bold">{issue.frequency}× mentions</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold uppercase border ${
                      issue.priority === 'P0'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {issue.priority} {issue.priority === 'P0' ? 'Blocker' : 'High'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    RESOLVED
                  </span>
                </div>
              </div>

              {/* Root Cause & Technical Fix Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-3 h-3" /> Root Cause Identified:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {issue.rootCause}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3 h-3" /> Progress / Implemented Fix:
                  </span>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    {issue.technicalFix}
                  </p>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                <span>Category: {issue.category}</span>
                <span>Verified: {issue.resolvedAt}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Struck-through in alpha_tester_feedbacks/ishika-feedback.md</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/20 transition"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
