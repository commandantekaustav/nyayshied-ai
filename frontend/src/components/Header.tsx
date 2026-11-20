import React from 'react';
import { ShieldCheck, Scale, Cpu, Zap } from 'lucide-react';

interface HeaderProps {
  onLoadGoldenCase: () => void;
  isLoading: boolean;
  activeScreen: number;
}

export const Header: React.FC<HeaderProps> = ({ onLoadGoldenCase, isLoading, activeScreen }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                NyayShield AI
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <Scale className="w-3 h-3 text-emerald-400 inline" />
              CPA 2019 • Anti-Price-Gouging
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onLoadGoldenCase}
            disabled={isLoading}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition active:scale-95"
            title="Fast-Track Golden Case #001"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>Case #001</span>
          </button>
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[10px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span className="font-mono text-emerald-400 font-semibold">Vertex AI</span>
          </div>
        </div>
      </div>

      {/* Screen step progression indicator */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === activeScreen
                  ? 'w-6 bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : step < activeScreen
                  ? 'w-3 bg-emerald-600'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          Step {activeScreen} of 4: {
            activeScreen === 1 ? 'Scan & Quote' :
            activeScreen === 2 ? 'Spatial Forensics' :
            activeScreen === 3 ? 'Gemma 3 Notice' : '48h SLA Action'
          }
        </span>
      </div>
    </header>
  );
};
