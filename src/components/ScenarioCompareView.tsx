/**
 * AFTERWORLD — Comparative Scenario Analysis Lab
 * Plots side-by-side trajectories of two scenarios, computes differential vectors (Δ),
 * and isolates divergence tipping points.
 */

import React, { useState } from 'react';
import { ScenarioBranch, RegionMetrics, RegionEntity } from '../types/simulation';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Workflow
} from 'lucide-react';
import { getMonthLabel } from '../engine/simulationCore';

interface ScenarioCompareViewProps {
  allScenarios: ScenarioBranch[];
  regions: Record<string, RegionEntity>;
  onInspectCausal: (regionId: string, metricKey: string) => void;
}

export const ScenarioCompareView: React.FC<ScenarioCompareViewProps> = ({
  allScenarios,
  regions,
  onInspectCausal
}) => {
  const [scenarioAId, setScenarioAId] = useState<string>(allScenarios[0]?.id || '');
  const [scenarioBId, setScenarioBId] = useState<string>(allScenarios[1]?.id || allScenarios[0]?.id || '');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('capital');
  const [selectedMetric, setSelectedMetric] = useState<keyof RegionMetrics>('socialStability');

  const scenarioA = allScenarios.find(s => s.id === scenarioAId) || allScenarios[0];
  const scenarioB = allScenarios.find(s => s.id === scenarioBId) || allScenarios[1] || allScenarios[0];

  const historyA = scenarioA?.history || [];
  const historyB = scenarioB?.history || [];
  const sharedStepsCount = Math.min(historyA.length, historyB.length);

  // Compute trajectories and divergence
  const comparisonData: {
    step: number;
    month: string;
    valA: number;
    valB: number;
    delta: number;
    percentDiff: number;
  }[] = [];

  let maxDivergenceStep = -1;
  let maxAbsDelta = 0;

  for (let s = 0; s < sharedStepsCount; s++) {
    const stateA = historyA[s].state;
    const stateB = historyB[s].state;

    const valA = stateA.regions[selectedRegionId]?.stats[selectedMetric] ?? 0;
    const valB = stateB.regions[selectedRegionId]?.stats[selectedMetric] ?? 0;
    const delta = Number((valB - valA).toFixed(1));
    const percentDiff = valA !== 0 ? Number(((delta / valA) * 100).toFixed(1)) : 0;

    if (Math.abs(delta) > maxAbsDelta) {
      maxAbsDelta = Math.abs(delta);
      maxDivergenceStep = s;
    }

    comparisonData.push({
      step: s,
      month: getMonthLabel(s),
      valA,
      valB,
      delta,
      percentDiff
    });
  }

  // Calculate SVG chart bounds
  const allValues = comparisonData.flatMap(d => [d.valA, d.valB]);
  const minVal = Math.floor(Math.min(...(allValues.length ? allValues : [0])));
  const maxVal = Math.ceil(Math.max(...(allValues.length ? allValues : [100])));
  const rangeVal = Math.max(1, maxVal - minVal);

  const getSvgY = (val: number) => {
    return 180 - ((val - minVal) / rangeVal) * 140;
  };

  const getSvgX = (stepIndex: number) => {
    if (sharedStepsCount <= 1) return 40;
    return 40 + (stepIndex / (sharedStepsCount - 1)) * 520;
  };

  const pathA = comparisonData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(i)} ${getSvgY(d.valA)}`)
    .join(' ');

  const pathB = comparisonData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(i)} ${getSvgY(d.valB)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      {/* 1. Comparison Configuration Bar */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>Comparative Scenario Workbench</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Compare differential outcomes across two branched timelines over shared time horizons.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Region Selector */}
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:outline-none"
            >
              {Object.values(regions).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as keyof RegionMetrics)}
              className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="socialStability">Social Stability (%)</option>
              <option value="foodStock">Food Reserves (kt)</option>
              <option value="energyStorage">Grid Storage (GWh)</option>
              <option value="population">Population (k)</option>
              <option value="environmentalStress">Environmental Stress (/100)</option>
              <option value="waterReserve">Water Aquifer (%)</option>
            </select>
          </div>
        </div>

        {/* Scenario Selection Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-900/60 border border-cyan-900/40 p-3 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-cyan-400 uppercase block font-bold">Scenario A (Baseline)</span>
                <select
                  value={scenarioAId}
                  onChange={(e) => setScenarioAId(e.target.value)}
                  className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {allScenarios.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="text-slate-400 tabular-nums">{historyA.length} steps</span>
          </div>

          <div className="bg-slate-900/60 border border-amber-900/40 p-3 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-amber-400 uppercase block font-bold">Scenario B (Alternative)</span>
                <select
                  value={scenarioBId}
                  onChange={(e) => setScenarioBId(e.target.value)}
                  className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {allScenarios.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className="text-slate-400 tabular-nums">{historyB.length} steps</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Comparative Trajectory Chart */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Comparative Trajectory: {regions[selectedRegionId]?.name} · {selectedMetric}
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span> Scenario A
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> Scenario B
              </span>
            </div>
          </div>

          {maxDivergenceStep >= 0 && (
            <span className="text-xs font-mono px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded">
              Peak Δ at Step {maxDivergenceStep}: {maxAbsDelta.toFixed(1)}
            </span>
          )}
        </div>

        {/* SVG Comparative Chart */}
        <div className="w-full h-56 bg-slate-950/70 border border-slate-800/80 rounded-lg p-2 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="40" y1="40" x2="580" y2="40" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="110" x2="580" y2="110" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="180" x2="580" y2="180" stroke="#334155" strokeWidth="1" />

            {/* Y Axis labels */}
            <text x="32" y="44" fill="#64748B" fontSize="9" textAnchor="end" fontFamily="monospace">
              {maxVal}
            </text>
            <text x="32" y="114" fill="#64748B" fontSize="9" textAnchor="end" fontFamily="monospace">
              {Math.round((maxVal + minVal) / 2)}
            </text>
            <text x="32" y="184" fill="#64748B" fontSize="9" textAnchor="end" fontFamily="monospace">
              {minVal}
            </text>

            {/* Path A (Cyan) */}
            <path
              d={pathA}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Path B (Amber) */}
            <path
              d={pathB}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Divergence Point Marker */}
            {maxDivergenceStep >= 0 && (
              <g transform={`translate(${getSvgX(maxDivergenceStep)}, ${getSvgY(comparisonData[maxDivergenceStep].valB)})`}>
                <circle r="6" fill="#EF4444" opacity="0.4" />
                <circle r="3" fill="#EF4444" />
              </g>
            )}
          </svg>
        </div>

        {/* 3. Divergence Points & Causal Inspector CTA */}
        <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="text-slate-400">
            {scenarioA.id === scenarioB.id ? (
              <span>Select two different scenario branches above to calculate divergence.</span>
            ) : (
              <span>
                Compared over <strong>{sharedStepsCount}</strong> shared months. Max delta observed was{' '}
                <strong className="text-amber-400">{maxAbsDelta.toFixed(1)} units</strong> at Step {maxDivergenceStep}.
              </span>
            )}
          </div>

          <button
            onClick={() => onInspectCausal(selectedRegionId, selectedMetric)}
            className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 rounded flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Trace Causal Reasons for Divergence</span>
          </button>
        </div>
      </div>
    </div>
  );
};
