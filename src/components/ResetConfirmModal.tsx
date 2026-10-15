/**
 * AFTERWORLD — Reset Simulation Confirmation Modal
 * Replaces disruptive window.confirm with an in-app institutional dialog.
 */

import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
      <div className="bg-[#0A0E17] border border-rose-900/80 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-300">
        <div className="flex items-center justify-between border-b border-rose-950/60 pb-3">
          <div className="flex items-center gap-2.5 text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Reset Republic Simulation
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed text-xs">
          Are you sure you want to revert the Republic of Veridia back to <strong className="text-slate-100">Day 1 Genesis defaults</strong>? 
          All legislative bills, economic balances, unresolved crises, and local storage saves will be reset.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-lg active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
