/**
 * AFTERWORLD — Timeline Lab & Branching Scenario Manager
 * Controls history scrubbing, checkpoint restoration, and alternative scenario forking.
 */

import React from 'react';
import { ScenarioBranch, Checkpoint, SimulationSnapshot } from '../types/simulation';
import { 
  GitBranch, 
  Bookmark, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  Play, 
  Sliders,
  ArrowRight,
  Plus
} from 'lucide-react';
import { getMonthLabel } from '../engine/simulationCore';

interface TimelineLabProps {
  currentScenario: ScenarioBranch;
  allScenarios: ScenarioBranch[];
  currentStep: number;
  onScrubStep: (step: number) => void;
  onRestoreCheckpoint: (checkpoint: Checkpoint) => void;
  onSelectScenario: (scenarioId: string) => void;
  onOpenForkModal: (fromStep?: number) => void;
  onOpenCheckpointModal: () => void;
}

export const TimelineLab: React.FC<TimelineLabProps> = ({
  currentScenario,
  allScenarios,
  currentStep,
  onScrubStep,
  onRestoreCheckpoint,
  onSelectScenario,
  onOpenForkModal,
  onOpenCheckpointModal
}) => {
  const maxStep = Math.max(0, currentScenario.history.length - 1);
  const currentSnapshot = currentScenario.history[currentStep] || currentScenario.history[0];

  return (
    <div className="space-y-6">
      {/* 1. Interactive Timeline Scrubber Card */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Deterministic History Scrubber</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Scrub backwards or forwards across recorded state snapshots.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-cyan-300 font-semibold tabular-nums">
              Step {currentStep} / {maxStep} · {getMonthLabel(currentStep)}
            </span>
            <button
              onClick={onOpenCheckpointModal}
              className="px-2.5 py-1 text-xs font-mono font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Checkpoint</span>
            </button>
          </div>
        </div>

        {/* Range Slider Scrubber */}
        <div className="space-y-2 py-2">
          <input
            type="range"
            min="0"
            max={maxStep}
            value={currentStep}
            onChange={(e) => onScrubStep(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>T+0 (Genesis)</span>
            <span>T+{Math.floor(maxStep / 2)}</span>
            <span>T+{maxStep} (Latest)</span>
          </div>
        </div>

        {/* Emergence / Alert flags at current scrubbed step */}
        {currentSnapshot?.emergenceAlerts && currentSnapshot.emergenceAlerts.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs font-mono text-amber-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">
                Emergent Event Recorded at Step {currentStep}:
              </strong>
              <span>{currentSnapshot.emergenceAlerts[0].description}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Branch Tree & Scenario Hierarchy */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>Alternative Scenario Branches ({allScenarios.length})</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Fork history at any step to experiment with divergent policies.
            </p>
          </div>

          <button
            onClick={() => onOpenForkModal(currentStep)}
            className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fork at Step {currentStep}</span>
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allScenarios.map((sc) => {
            const isActive = sc.id === currentScenario.id;
            const parent = allScenarios.find(s => s.id === sc.parentScenarioId);

            return (
              <div
                key={sc.id}
                className={`p-3.5 rounded-lg border transition-all text-xs font-mono ${
                  isActive
                    ? 'bg-slate-900/90 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sc.color }}
                    />
                    <strong className="text-slate-100 text-sm">{sc.name}</strong>
                  </div>

                  {isActive ? (
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[10px] font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectScenario(sc.id)}
                      className="px-2 py-1 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded text-[11px] transition-colors"
                    >
                      Switch Branch
                    </button>
                  )}
                </div>

                <p className="text-slate-400 text-[11px] mb-3 leading-relaxed">
                  {sc.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
                  <span>
                    {parent ? `Forked from [${parent.name}] at T+${sc.forkStep}` : 'Genesis Origin'}
                  </span>
                  <span>{sc.history.length} steps simulated</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Saved Checkpoints & Milestones */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Saved Checkpoints ({currentScenario.checkpoints.length})</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Immutable milestones saved in this branch for instant restoration or branching.
            </p>
          </div>
        </div>

        {currentScenario.checkpoints.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No checkpoints recorded yet for this scenario. Advance to any step and click "Save Checkpoint".
          </div>
        ) : (
          <div className="space-y-2">
            {currentScenario.checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-100 block">{cp.name}</span>
                    <span className="text-[11px] text-slate-400">
                      Step {cp.step} ({getMonthLabel(cp.step)}) · {cp.note || 'No notes added'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRestoreCheckpoint(cp)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs transition-colors flex items-center gap-1"
                    title="Restore world to this exact state"
                  >
                    <RotateCcw className="w-3 h-3 text-cyan-400" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => onOpenForkModal(cp.step)}
                    className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/70 rounded text-xs transition-colors flex items-center gap-1"
                    title="Branch an alternative scenario from here"
                  >
                    <GitBranch className="w-3 h-3" />
                    <span>Branch Here</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
