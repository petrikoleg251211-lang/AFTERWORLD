/**
 * AFTERWORLD — Political Game Over & Resolution Modal
 */

import React from 'react';
import { AlertTriangle, RotateCcw, Award } from 'lucide-react';
import { SimulationState } from '../types/politicalSimulation';

interface GameOverModalProps {
  state: SimulationState;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onRestart }) => {
  if (!state.isGameOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0B0F19] border border-rose-800/80 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3 text-rose-400 border-b border-rose-900/40 pb-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
              Administration Terminated
            </h2>
            <span className="text-[11px] text-rose-300">Political & Constitutional Collapse</span>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl">
          {state.gameOverReason}
        </p>

        {/* Administration Post-Mortem */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Days in Office</span>
            <span className="text-base font-bold text-slate-100 tabular-nums">
              {state.day + (state.month - 1) * 30 + (state.year - 1) * 360} Days
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Final Public Approval</span>
            <span className={`text-base font-bold tabular-nums ${state.overallApproval < 20 ? 'text-rose-400' : 'text-slate-100'}`}>
              {state.overallApproval}%
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Final Treasury Reserves</span>
            <span className={`text-base font-bold tabular-nums ${state.treasury < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ${state.treasury.toFixed(1)}M
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Crises Faced</span>
            <span className="text-base font-bold text-cyan-300 tabular-nums">
              {state.crises.length} Events ({state.crises.filter(c => c.resolved).length} Resolved)
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Form New Government & Restart Simulation</span>
        </button>
      </div>
    </div>
  );
};
