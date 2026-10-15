/**
 * AFTERWORLD — Save Simulation Checkpoint Modal
 */

import React, { useState } from 'react';
import { X, Bookmark, Check } from 'lucide-react';
import { getMonthLabel } from '../engine/simulationCore';

interface SaveCheckpointModalProps {
  currentStep: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, note: string) => void;
}

export const SaveCheckpointModal: React.FC<SaveCheckpointModalProps> = ({
  currentStep,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState<string>(`Milestone T+${currentStep}`);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0F19] border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4 text-xs font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Save Simulation Checkpoint</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-400 uppercase text-[10px]">Checkpoint Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pre-Drought Calibration"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 uppercase text-[10px]">Notes & Observations</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record systemic observations or policy adjustments..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 text-[11px] text-slate-400">
            Target Step: <strong className="text-cyan-300">T+{currentStep} ({getMonthLabel(currentStep)})</strong>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Checkpoint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
