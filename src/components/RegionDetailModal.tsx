/**
 * AFTERWORLD — Region Detailed Diagnostics & Parameter Intervention Modal
 */

import React from 'react';
import { RegionEntity, TransitLink } from '../types/simulation';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Wheat, 
  ShieldAlert, 
  Users, 
  Droplets, 
  Factory, 
  Sliders,
  GitCommit,
  ArrowRight
} from 'lucide-react';

interface RegionDetailModalProps {
  region: RegionEntity | null;
  allLinks: TransitLink[];
  allRegions: Record<string, RegionEntity>;
  onClose: () => void;
  onUpdateParam: (regionId: string, param: string, value: number) => void;
  onInspectCausal: (regionId: string, metricKey: string) => void;
}

export const RegionDetailModal: React.FC<RegionDetailModalProps> = ({
  region,
  allLinks,
  allRegions,
  onClose,
  onUpdateParam,
  onInspectCausal
}) => {
  if (!region) return null;

  const { stats } = region;
  const connectedLinks = allLinks.filter(
    l => l.sourceRegionId === region.id || l.targetRegionId === region.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0F19] border border-slate-700/80 w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: region.color }}
            />
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {region.name}
                <span className="text-xs font-mono font-normal text-slate-400">
                  [{region.id.toUpperCase()}]
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">{region.role}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          {/* Primary Status Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Population</span>
              <span className="text-base font-bold text-slate-100 tabular-nums">
                {stats.population.toLocaleString()}k
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {stats.migrationNet >= 0 ? `+${stats.migrationNet}k` : `${stats.migrationNet}k`} /mo
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Social Stability</span>
              <span className={`text-base font-bold tabular-nums ${
                stats.socialStability < 40 ? 'text-rose-400' : stats.socialStability < 70 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {stats.socialStability.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {stats.socialStability < 40 ? 'Civil Unrest' : 'Governable'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Food Stock</span>
              <span className={`text-base font-bold tabular-nums ${stats.foodStock < 25 ? 'text-rose-400' : 'text-slate-100'}`}>
                {stats.foodStock.toFixed(1)} <span className="text-xs font-normal text-slate-500">kt</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Need ~{(stats.population * 0.24).toFixed(0)} kt/mo
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Grid Reserve</span>
              <span className="text-base font-bold text-cyan-300 tabular-nums">
                {stats.energyStorage.toFixed(0)} <span className="text-xs font-normal text-slate-500">GWh</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Gen {stats.energyGeneration} / Dem {stats.energyDemand}
              </span>
            </div>
          </div>

          {/* Interactive Parameter Shocks / Policy Interventions */}
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Live Policy Interventions & Shock Knobs
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Changes apply immediately
              </span>
            </div>

            {/* Parameter 1: Food Harvest Yield Multiplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Harvest Yield Multiplier (Drought vs Bumper)</span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {stats.foodProductionYield.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={stats.foodProductionYield}
                onChange={(e) => onUpdateParam(region.id, 'foodProductionYield', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.10x (Severe Drought)</span>
                <span>1.00x (Normal)</span>
                <span>2.00x (Surplus)</span>
              </div>
            </div>

            {/* Parameter 2: Water Table / Aquifer */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Water Aquifer & Reservoir Reserve</span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {stats.waterReserve.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={stats.waterReserve}
                onChange={(e) => onUpdateParam(region.id, 'waterReserve', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Parameter 3: Local Energy Generation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Local Power Plant Output</span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {stats.energyGeneration.toFixed(0)} GWh
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="25"
                value={stats.energyGeneration}
                onChange={(e) => onUpdateParam(region.id, 'energyGeneration', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Connected Conduits & Pipelines */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Interregional Transit Conduits ({connectedLinks.length})
            </h3>
            <div className="space-y-2">
              {connectedLinks.map((link) => {
                const isOutbound = link.sourceRegionId === region.id;
                const otherRegion = allRegions[isOutbound ? link.targetRegionId : link.sourceRegionId];

                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-2.5 rounded text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        link.resource === 'FOOD' ? 'bg-emerald-400' : link.resource === 'ENERGY' ? 'bg-cyan-400' : 'bg-amber-400'
                      }`} />
                      <span className="text-slate-300">
                        {isOutbound ? 'Export' : 'Import'} {link.resource} {isOutbound ? 'to' : 'from'} <strong className="text-slate-100">{otherRegion?.name}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 tabular-nums">
                        {link.actualThroughput} / {link.capacity} cap
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        link.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {link.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Causal Inspection Shortcuts */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Trace why this region's state changed:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onInspectCausal(region.id, 'foodStock')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trace Food</span>
              </button>

              <button
                onClick={() => onInspectCausal(region.id, 'socialStability')}
                className="px-3 py-1.5 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-700/60 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Trace Stability</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
