/**
 * AFTERWORLD — National Regional Supply Systems Lab Modal
 * Integrates the macro-level multi-region simulation canvas into the 3D governance workflow.
 */

import React, { useState } from 'react';
import { X, Globe, Zap, Wheat, Pickaxe, ArrowRight, Activity } from 'lucide-react';
import { WorldMapCanvas } from './WorldMapCanvas';
import { createDefaultWorld } from '../engine/simulationCore';
import { RegionEntity, TransitLink } from '../types/simulation';

interface RegionalLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegionalLabModal: React.FC<RegionalLabModalProps> = ({ isOpen, onClose }) => {
  const [worldState] = useState(() => createDefaultWorld(42));
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>('capital');
  const [activeTab, setActiveTab] = useState<'MAP' | 'DIAGNOSTICS'>('MAP');

  if (!isOpen) return null;

  const selectedRegion = selectedRegionId ? worldState.regions[selectedRegionId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none font-mono">
      <div className="bg-[#0A0E17] border border-slate-700/80 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-xs text-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                National Regional Systems & Supply Conduits
              </h2>
              <span className="text-[10px] text-slate-400">
                Macro-level trade pipelines, power transmission, and regional dependencies of the Republic
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Regional Systems Lab"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Schematic Interactive Map Canvas */}
          <WorldMapCanvas
            regions={worldState.regions}
            links={worldState.links}
            selectedRegionId={selectedRegionId}
            onSelectRegion={(id) => setSelectedRegionId(id)}
            onOpenQuickTweak={(id) => setSelectedRegionId(id)}
          />

          {/* Regional Diagnostics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            {Object.values(worldState.regions).map((region) => {
              const isSelected = selectedRegionId === region.id;
              return (
                <div
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-100">{region.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: region.color }} />
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {region.role}
                  </p>
                  <div className="space-y-1 text-[11px] pt-1.5 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Population:</span>
                      <span className="font-bold text-slate-200">{(region.stats.population * 1000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stability:</span>
                      <span className={`font-bold ${region.stats.socialStability < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {region.stats.socialStability}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Region Detailed Snapshot */}
          {selectedRegion && (
            <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <strong className="text-slate-100 text-xs">{selectedRegion.name} Supply Telemetry</strong>
                </div>
                <span className="text-[10px] text-slate-500">
                  Coordinates: {selectedRegion.coords.x}% E, {selectedRegion.coords.y}% N
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase">Food Stock</span>
                  <span className="font-bold text-slate-200 text-sm">{selectedRegion.stats.foodStock.toFixed(0)} kt</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase">Energy Gen / Load</span>
                  <span className="font-bold text-amber-300 text-sm">
                    {selectedRegion.stats.energyGeneration} / {selectedRegion.stats.energyDemand} GWh
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase">Water Reserves</span>
                  <span className="font-bold text-cyan-300 text-sm">{selectedRegion.stats.waterReserve}%</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block uppercase">Eco Stress</span>
                  <span className={`font-bold text-sm ${selectedRegion.stats.environmentalStress > 60 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {selectedRegion.stats.environmentalStress}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
