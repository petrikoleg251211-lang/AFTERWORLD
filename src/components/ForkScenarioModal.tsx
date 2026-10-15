/**
 * AFTERWORLD — Fork Alternative Scenario Branch Modal
 */

import React, { useState } from 'react';
import { X, GitBranch, Check, Sliders } from 'lucide-react';
import { getMonthLabel } from '../engine/simulationCore';

interface ForkScenarioModalProps {
  forkFromStep: number;
  isOpen: boolean;
  onClose: () => void;
  onFork: (name: string, description: string, color: string, overrides: Record<string, number>) => void;
}

const PRESET_COLORS = ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#F43F5E'];

export const ForkScenarioModal: React.FC<ForkScenarioModalProps> = ({
  forkFromStep,
  isOpen,
  onClose,
  onFork
}) => {
  const [name, setName] = useState<string>(`Branch: Alternative Policy T+${forkFromStep}`);
  const [description, setDescription] = useState<string>('Forked timeline to evaluate policy divergence under altered initial conditions.');
  const [color, setColor] = useState<string>('#F59E0B');
  const [agroYield, setAgroYield] = useState<number>(0.4);
  const [coastalGeneration, setCoastalGeneration] = useState<number>(920);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const overrides: Record<string, number> = {
      'agro.foodProductionYield': agroYield,
      'coastal.energyGeneration': coastalGeneration
    };

    onFork(name.trim(), description.trim(), color, overrides);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0F19] border border-slate-700 w-full max-w-lg rounded-xl p-5 shadow-2xl space-y-4 text-xs font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Fork Alternative Scenario Branch</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800 text-[11px] text-slate-400">
            Branching origin: <strong className="text-cyan-300">Step T+{forkFromStep} ({getMonthLabel(forkFromStep)})</strong>. The parent timeline will remain immutably preserved.
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 uppercase text-[10px]">Branch Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 uppercase text-[10px]">Description & Hypotheses</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-1">
            <label className="text-slate-400 uppercase text-[10px]">Timeline Trajectory Color</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Branch Initial Parameter Overrides */}
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg space-y-3">
            <span className="text-[10px] uppercase text-cyan-400 font-bold block flex items-center gap-1.5">
              <Sliders className="w-3 h-3" />
              Branch Policy Perturbations
            </span>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">Agro Plains Harvest Yield:</span>
                <span className="text-cyan-300 font-bold tabular-nums">{agroYield.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={agroYield}
                onChange={(e) => setAgroYield(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.10x (Severe Deficit)</span>
                <span>1.00x (Baseline)</span>
                <span>1.50x (Surplus)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">Coastal Haven Energy Output:</span>
                <span className="text-cyan-300 font-bold tabular-nums">{coastalGeneration} GWh</span>
              </div>
              <input
                type="range"
                min="200"
                max="1500"
                step="50"
                value={coastalGeneration}
                onChange={(e) => setCoastalGeneration(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
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
              <span>Instantiate Branch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
