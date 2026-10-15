/**
 * AFTERWORLD — Emergent Behavior & Non-Linear Patterns Detector
 * Displays systemic cascades, threshold crossings, runaway oscillations, and equilibria.
 */

import React, { useState } from 'react';
import { EmergencePattern, SimulationSnapshot } from '../types/simulation';
import { 
  Sparkles, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sliders,
  ArrowRight
} from 'lucide-react';
import { getMonthLabel } from '../engine/simulationCore';

interface EmergencePanelProps {
  history: SimulationSnapshot[];
  onScrubStep: (step: number) => void;
}

export const EmergencePanel: React.FC<EmergencePanelProps> = ({
  history,
  onScrubStep
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'critical' | 'warning' | 'info'>('ALL');

  // Aggregate all emergence alerts from history
  const allAlerts: EmergencePattern[] = [];
  for (const snapshot of history) {
    if (snapshot.emergenceAlerts) {
      allAlerts.push(...snapshot.emergenceAlerts);
    }
  }

  const filteredAlerts = allAlerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Emergent System Patterns ({allAlerts.length})</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Non-linear phenomena, threshold breaches, and tipping points detected during execution.
            </p>
          </div>

          {/* Severity Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            {(['ALL', 'critical', 'warning', 'info'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterSeverity === sev
                    ? 'bg-slate-700 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No emergent patterns recorded under this filter. Run additional simulation steps or perturb parameters to witness systemic feedback loops.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.slice().reverse().map(alert => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border text-xs font-mono transition-all ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {isCritical ? (
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-sm block text-slate-100">
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Detected at Step {alert.detectedAtStep} ({getMonthLabel(alert.detectedAtStep)}) · {alert.type}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onScrubStep(alert.detectedAtStep)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px] flex items-center gap-1.5 transition-colors shrink-0"
                      title="Jump directly to this simulation step"
                    >
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>Jump to Step</span>
                    </button>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed mb-3">
                    {alert.description}
                  </p>

                  {/* Mitigation Advice if provided */}
                  {alert.mitigationRecommendation && (
                    <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded text-[11px] text-slate-400 flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-200">Recommended Intervention: </strong>
                        {alert.mitigationRecommendation}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
