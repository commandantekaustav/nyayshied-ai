import React from 'react';
import { Camera, FileCheck, ArrowRight, ArrowLeft, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import { ActiveScreen } from '../types/claim';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  canProceed: boolean;
  isLoading: boolean;
  isApproved: boolean;
  onPrimaryAction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onNavigate,
  canProceed,
  isLoading,
  isApproved,
  onPrimaryAction,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 p-3 max-w-[430px] mx-auto">
      <div className="flex items-center space-x-2">
        {activeScreen > 1 && (
          <button
            onClick={() => onNavigate((activeScreen - 1) as ActiveScreen)}
            disabled={isLoading}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Primary Thumb-Zone Action Button */}
        <button
          onClick={onPrimaryAction}
          disabled={!canProceed || isLoading}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
            !canProceed || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : activeScreen === 4 && isApproved
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 shadow-emerald-500/20'
              : activeScreen === 2
              ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-amber-500/20'
              : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-emerald-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Processing Spatial Triage...</span>
            </>
          ) : activeScreen === 1 ? (
            <>
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Audit Claim & Gouging</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          ) : activeScreen === 2 ? (
            <>
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>Review Statutory Notice</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          ) : activeScreen === 3 ? (
            <>
              <FileCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Proceed to Human Approval</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          ) : !isApproved ? (
            <>
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Approve & Dispatch Notice</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>48h SLA Active • Track Case</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
