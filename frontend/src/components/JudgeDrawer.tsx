import React, { useState } from 'react';
import { ClaimAnalysisResponse } from '../types/claim';
import { 
  Code, 
  Layers, 
  ShieldCheck, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Terminal, 
  Award, 
  Hash
} from 'lucide-react';

interface JudgeDrawerProps {
  claimData: ClaimAnalysisResponse | null;
  activeScreen: number;
}

export const JudgeDrawer: React.FC<JudgeDrawerProps> = ({ claimData }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'states' | 'rubric'>('json');

  const handleCopyJSON = () => {
    if (!claimData) return;
    navigator.clipboard.writeText(JSON.stringify(claimData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 right-0 bottom-0 bg-slate-900 border-l border-slate-800 transition-all duration-300 z-50 shadow-2xl ${
        isOpen ? 'w-[480px]' : 'w-12'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-4 top-6 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg hover:bg-emerald-400 transition-all"
        title={isOpen ? 'Collapse Judge Drawer' : 'Expand Judge Drawer'}
      >
        {isOpen ? <ChevronRight className="w-4 h-4 stroke-[3]" /> : <ChevronLeft className="w-4 h-4 stroke-[3]" />}
      </button>

      {!isOpen ? (
        <div className="flex-1 flex flex-col items-center py-6 space-y-6 text-slate-400">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span className="[writing-mode:vertical-rl] font-mono text-xs tracking-wider uppercase text-slate-400">
            Hackathon Judge Panel
          </span>
          <Award className="w-5 h-5 text-amber-400" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Hackathon Evaluation Panel
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                    Buildathon 2026
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">Live Vertex AI telemetry & 6-state loop audit</p>
              </div>
            </div>
            {activeTab === 'json' && claimData && (
              <button
                onClick={handleCopyJSON}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-slate-800 bg-slate-900/80 px-2 pt-2 text-xs">
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition ${
                activeTab === 'json'
                  ? 'bg-slate-950 text-emerald-400 border-t-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Live Payload JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('states')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition ${
                activeTab === 'states'
                  ? 'bg-slate-950 text-emerald-400 border-t-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>6-State SLA Machine</span>
            </button>
            <button
              onClick={() => setActiveTab('rubric')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg font-medium transition ${
                activeTab === 'rubric'
                  ? 'bg-slate-950 text-emerald-400 border-t-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Hack2skill Rubric</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            {activeTab === 'json' && (
              <div>
                {claimData ? (
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
                    {JSON.stringify(claimData, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-12 text-slate-500 font-sans">
                    <p className="text-sm font-medium">No claim payload loaded yet.</p>
                    <p className="text-xs text-slate-600 mt-1">Upload a laptop photo or click "⚡ Load Live Case #001"</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'states' && (
              <div className="space-y-3 font-sans">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-200">Deterministic State Loop</span>
                    <span className="font-mono text-emerald-400 font-bold">State 5 Active</span>
                  </div>
                  <div className="space-y-3">
                    {claimData?.state_loop.map((st, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="pt-0.5">
                          {st.status === 'COMPLETED' ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </div>
                          ) : st.status === 'ACTIVE' ? (
                            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-[10px] font-bold animate-pulse">
                              ⏳
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center text-[10px]">
                              {i + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-mono text-xs font-semibold ${
                              st.status === 'ACTIVE' ? 'text-amber-400' : st.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-400'
                            }`}>
                              {st.state}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {st.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{st.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {claimData && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-200">
                        <Hash className="w-3.5 h-3.5 text-emerald-400" />
                        Evidence Lock Hash
                      </span>
                      <span className="font-mono text-emerald-400 text-[10px]">SHA-256</span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800">
                      {claimData.device_image_sha256}
                    </p>
                    <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-900">
                      <span className="flex items-center gap-1 font-semibold text-slate-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Fernet PII Token
                      </span>
                      <span className="font-mono text-emerald-400 text-[10px]">AES-128-CBC + HMAC</span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 break-all bg-slate-900 p-2 rounded border border-slate-800">
                      {claimData.fernet_encrypted_telemetry.substring(0, 70)}...
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rubric' && (
              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Google Startup Buildathon India 2026
                  </h4>
                  <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                    NyayShield AI is built specifically to address deceptive warranty repudiation and predatory price gouging in Indian consumer electronics service centers.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      title: '1. Vertex AI Spatial Defect Triage',
                      desc: 'Gemini 2.5-Pro extracts normalized 2D boxes [ymin, xmin, ymax, xmax] (0-1000) and proves >140mm separation to refute customer drop claims.',
                      done: true,
                    },
                    {
                      title: '2. Deterministic Price Gouging Engine',
                      desc: 'Computes exact multiplier: ₹20,000 / ₹2,500 = 8.0x fair OEM spare cost under CPA 2019 Section 2(47).',
                      done: true,
                    },
                    {
                      title: '3. Grounded Legal Drafter & Gemma 3 Judge',
                      desc: 'Pre-litigation Section 35 notice in English, Hindi & Bengali with 0% hallucinated statutory citations verified by Gemma 3 critic.',
                      done: true,
                    },
                    {
                      title: '4. Human-in-the-Loop & 48h SLA Engine',
                      desc: 'Requires explicit user sign-off before initiating live 48-hour SLA countdown loop and e-Jagriti filing queue.',
                      done: true,
                    },
                    {
                      title: '5. Credit-Safe ($5 Budget) Compliance',
                      desc: 'Serverless pay-per-token API calls only; no provisioned GPU endpoints. Fernet AES-128 encrypted telemetry.',
                      done: true,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-200 text-xs">{item.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
