/**
 * AFTERWORLD — Causal Lineage & Root Cause Graph Explorer
 * Traces exact rule attribution, upstream dependency linkages, and explains why variables changed.
 */

import React, { useState } from 'react';
import { RegionEntity, RegionMetrics, SimulationSnapshot } from '../types/simulation';
import { traceVariableLineage, CausalLineage } from '../engine/causalAnalyzer';
import { 
  GitCommit, 
  ArrowRight, 
  ShieldAlert, 
  Info, 
  Workflow, 
  Layers, 
  Sliders, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { getMonthLabel } from '../engine/simulationCore';

interface CausalGraphViewProps {
  history: SimulationSnapshot[];
  regions: Record<string, RegionEntity>;
  initialRegionId?: string;
  initialVariable?: keyof RegionMetrics;
}

const TRACEABLE_VARIABLES: { key: keyof RegionMetrics; label: string; unit: string }[] = [
  { key: 'socialStability', label: 'Social Stability', unit: '%' },
  { key: 'foodStock', label: 'Food Reserves', unit: 'kt' },
  { key: 'energyStorage', label: 'Grid Battery Storage', unit: 'GWh' },
  { key: 'environmentalStress', label: 'Ecological Stress', unit: '/100' },
  { key: 'population', label: 'Demographics / Population', unit: 'k' },
  { key: 'waterReserve', label: 'Aquifer Water Level', unit: '%' }
];

export const CausalGraphView: React.FC<CausalGraphViewProps> = ({
  history,
  regions,
  initialRegionId = 'capital',
  initialVariable = 'foodStock'
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>(initialRegionId);
  const [selectedVar, setSelectedVar] = useState<keyof RegionMetrics>(initialVariable);
  const [inspectedStep, setInspectedStep] = useState<number | null>(null);

  const lineage: CausalLineage = traceVariableLineage(history, selectedRegionId, selectedVar);
  const selectedRegion = regions[selectedRegionId];

  // Specific step record if selected
  const activeStepRecord = inspectedStep !== null
    ? lineage.historyTimeline.find(t => t.step === inspectedStep)
    : lineage.historyTimeline[lineage.historyTimeline.length - 1];

  return (
    <div className="space-y-6">
      {/* 1. Selector Bar */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-cyan-400" />
              <span>Causal Tracing Engine</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Inspect mathematically logged causes behind every variable trajectory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Region Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono">
              <span className="text-slate-500">REGION:</span>
              <select
                value={selectedRegionId}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value);
                  setInspectedStep(null);
                }}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer"
              >
                {Object.values(regions).map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Variable Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono">
              <span className="text-slate-500">VARIABLE:</span>
              <select
                value={selectedVar}
                onChange={(e) => {
                  setSelectedVar(e.target.value as keyof RegionMetrics);
                  setInspectedStep(null);
                }}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
              >
                {TRACEABLE_VARIABLES.map(v => (
                  <option key={v.key} value={v.key} className="bg-slate-900 text-slate-100">
                    {v.label} ({v.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Causal Lineage DAG & Root Cause Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Causal Chain DAG */}
        <div className="lg:col-span-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Causal Chain of Influence</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {lineage.historyTimeline.length} events logged
            </span>
          </div>

          {/* Root Causes Box */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-lg space-y-2 text-xs font-mono">
            <span className="text-cyan-400 font-bold block">
              Identified Primary Drivers for {selectedRegion?.name} · {selectedVar}:
            </span>
            <ul className="space-y-1 text-slate-300">
              {lineage.primaryRootCauses.map((cause, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-cyan-400">→</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive DAG Step Flow */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {lineage.historyTimeline.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500">
                No history recorded yet. Run simulation to observe causal events.
              </div>
            ) : (
              lineage.historyTimeline.slice().reverse().map((record) => {
                const isSelected = activeStepRecord?.step === record.step;

                return (
                  <div
                    key={record.step}
                    onClick={() => setInspectedStep(record.step)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-xs font-mono ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">
                          Step {record.step}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">
                          {getMonthLabel(record.step)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">
                          Rule: <strong className="text-slate-200">{record.ruleName}</strong>
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold tabular-nums ${
                          record.delta > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : record.delta < 0
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {record.delta > 0 ? `+${record.delta}` : record.delta}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {record.explanation}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Deep Dive Formula & Upstream Input Variables */}
        <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step Diagnostic Details</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Step {activeStepRecord?.step ?? 0} ({getMonthLabel(activeStepRecord?.step ?? 0)})
            </span>
          </div>

          {activeStepRecord ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[10px] uppercase block">
                  Executed Rule Formula
                </span>
                <span className="text-sm font-bold text-slate-100 block">
                  {activeStepRecord.ruleName}
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeStepRecord.explanation}
                </p>
              </div>

              {/* Exact Formula Inputs Snapshot */}
              <div className="space-y-2">
                <span className="text-slate-400 text-[10px] uppercase block">
                  Recorded Mathematical Inputs
                </span>
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
                  {Object.entries(activeStepRecord.inputs).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-cyan-300 font-bold tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value Transition */}
              <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-500 block">PREVIOUS</span>
                  <span className="text-sm font-bold text-slate-300 tabular-nums">
                    {(activeStepRecord.value - activeStepRecord.delta).toFixed(1)}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="text-[10px] text-slate-500 block">RESULT</span>
                  <span className="text-sm font-bold text-cyan-300 tabular-nums">
                    {activeStepRecord.value.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs font-mono text-slate-500">
              Select an event from the lineage to inspect its mathematical input snapshot.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
