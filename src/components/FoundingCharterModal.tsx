/**
 * AFTERWORLD — Founding Constitutional Charter Modal
 * Allows initiating a brand new zero-state settlement on pristine terrain
 * with chosen ideological principles, seed funds, and development bonuses.
 */

import React, { useState } from 'react';
import { X, Award, Shield, DollarSign, Trees, Factory, Landmark, Sparkles } from 'lucide-react';
import { FOUNDING_CHARTERS, FoundingCharter } from '../types/cityGrid';

interface FoundingCharterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharter: (charterId: string) => void;
  currentCharterId?: string;
}

export const FoundingCharterModal: React.FC<FoundingCharterModalProps> = ({
  isOpen,
  onClose,
  onSelectCharter,
  currentCharterId = 'pioneer_industrial'
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentCharterId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B101B] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Founding Constitutional Charter</h2>
              <p className="text-xs text-slate-400 font-mono">
                Pristine Territory Settlement · Seed Capital & Institutional Principles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Charter Options */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Begin with virgin terrain, unpaved wilderness, and a sovereign constitutional mandate. You will personally lay the first arterial roads, water wells, and electrical grids, while designated zones invite diverse migrant convoys to build homes and enterprises.
          </p>

          <div className="space-y-3">
            {FOUNDING_CHARTERS.map(charter => {
              const isSelected = selectedId === charter.id;
              return (
                <div
                  key={charter.id}
                  onClick={() => setSelectedId(charter.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500/80 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-100">{charter.name}</strong>
                        <span className="text-[11px] font-mono text-amber-400/90 font-medium">
                          {charter.tagline}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {charter.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-4 font-mono">
                      <span className="text-xs text-slate-500 block">Seed Treasury</span>
                      <span className="text-base font-bold text-emerald-400 tabular-nums">
                        ${charter.startingTreasury}M
                      </span>
                    </div>
                  </div>

                  {/* Bonuses */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap gap-2 text-[11px] font-mono">
                    {charter.unlockedBonuses.map((bonus, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        ✓ {bonus}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSelectCharter(selectedId);
              onClose();
            }}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Found New Settlement on Pristine Terrain</span>
          </button>
        </div>
      </div>
    </div>
  );
};
