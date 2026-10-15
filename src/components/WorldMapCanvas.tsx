/**
 * AFTERWORLD — Interactive Schematic World Map Canvas
 * Visualizes regional stocks, bottlenecks, and animated transit flow vectors.
 */

import React, { useState } from 'react';
import { RegionEntity, TransitLink, ResourceType } from '../types/simulation';
import { 
  Zap, 
  Wheat, 
  Pickaxe, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface WorldMapCanvasProps {
  regions: Record<string, RegionEntity>;
  links: TransitLink[];
  selectedRegionId: string | null;
  onSelectRegion: (id: string) => void;
  onOpenQuickTweak: (id: string) => void;
}

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({
  regions,
  links,
  selectedRegionId,
  onSelectRegion,
  onOpenQuickTweak
}) => {
  const [activeLayer, setActiveLayer] = useState<'ALL' | ResourceType>('ALL');

  const filteredLinks = links.filter(link => {
    if (activeLayer === 'ALL') return true;
    return link.resource === activeLayer;
  });

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] bg-[#070A10] rounded-xl border border-slate-800/80 overflow-hidden flex flex-col">
      {/* Top Map Layer Selector Strip */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-lg text-xs font-mono">
        <span className="text-slate-500 px-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">FLOW LAYER:</span>
        </span>
        {(['ALL', 'FOOD', 'ENERGY', 'MINERALS'] as const).map(layer => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeLayer === layer
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {layer}
          </button>
        ))}
      </div>

      {/* Map Legend */}
      <div className="absolute top-3 right-3 z-20 hidden sm:flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/90 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Food</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Energy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Minerals</span>
        </div>
      </div>

      {/* SVG Canvas for Map & Transit Links */}
      <svg className="w-full h-full" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="world-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="1" />
          </pattern>

          {/* Gradients */}
          <linearGradient id="foodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>

          <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="mineralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#world-grid)" />

        {/* Transit Link Conduits */}
        {filteredLinks.map((link) => {
          const source = regions[link.sourceRegionId];
          const target = regions[link.targetRegionId];
          if (!source || !target) return null;

          const sx = (source.coords.x / 100) * 1000;
          const sy = (source.coords.y / 100) * 650;
          const tx = (target.coords.x / 100) * 1000;
          const ty = (target.coords.y / 100) * 650;

          // Quadratic curve midpoint offset for visual aesthetic
          const mx = (sx + tx) / 2 + (sy - ty) * 0.12;
          const my = (sy + ty) / 2 + (tx - sx) * 0.12;

          let linkColor = '#38BDF8';
          if (link.resource === 'FOOD') linkColor = '#4ADE80';
          if (link.resource === 'MINERALS') linkColor = '#FB923C';

          const isDisrupted = link.status === 'DISRUPTED';
          const isCongested = link.status === 'CONGESTED';

          return (
            <g key={link.id} className="transition-opacity duration-300">
              {/* Conduit base pipeline */}
              <path
                d={`M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`}
                fill="none"
                stroke={isDisrupted ? '#EF4444' : isCongested ? '#F59E0B' : 'rgba(30, 41, 59, 0.8)'}
                strokeWidth={isDisrupted ? 2 : 4}
                strokeLinecap="round"
              />

              {/* Active flowing pulse */}
              {!isDisrupted && (
                <path
                  d={`M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`}
                  fill="none"
                  stroke={linkColor}
                  strokeWidth="2.5"
                  strokeDasharray="6 8"
                  className="animate-flow-dash"
                  filter="url(#glow)"
                  opacity="0.85"
                />
              )}

              {/* Midpoint flow badge */}
              <g transform={`translate(${mx}, ${my})`}>
                <circle r="14" fill="#0F172A" stroke={linkColor} strokeWidth="1.5" />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#E2E8F0"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {link.actualThroughput}
                </text>
              </g>
            </g>
          );
        })}

        {/* Regional Entities */}
        {Object.values(regions).map((region) => {
          const cx = (region.coords.x / 100) * 1000;
          const cy = (region.coords.y / 100) * 650;
          const isSelected = selectedRegionId === region.id;
          const stability = region.stats.socialStability;

          const isCritical = stability < 40 || region.stats.foodStock <= 15;
          const isStressed = stability < 65 || region.stats.environmentalStress > 60;

          return (
            <g
              key={region.id}
              transform={`translate(${cx}, ${cy})`}
              className="cursor-pointer group"
              onClick={() => onSelectRegion(region.id)}
            >
              {/* Outer Pulse Ring */}
              <circle
                r={isSelected ? 42 : 36}
                fill={isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.8)'}
                stroke={isCritical ? '#EF4444' : isSelected ? '#38BDF8' : region.color}
                strokeWidth={isSelected ? 3 : 2}
                strokeDasharray={isCritical ? '4 3' : 'none'}
                className="transition-all duration-200"
              />

              {/* Inner core circle */}
              <circle
                r="24"
                fill="#0F172A"
                stroke={isCritical ? '#EF4444' : region.color}
                strokeWidth="1.5"
              />

              {/* Status Glyph */}
              {isCritical ? (
                <text textAnchor="middle" dy="5" fill="#EF4444" fontSize="14" fontWeight="bold">!</text>
              ) : isStressed ? (
                <text textAnchor="middle" dy="4" fill="#F59E0B" fontSize="11" fontWeight="bold">▲</text>
              ) : (
                <text textAnchor="middle" dy="4" fill={region.color} fontSize="11" fontWeight="bold">●</text>
              )}

              {/* Region Label Lockup */}
              <g transform="translate(0, 48)">
                {/* Background pill card for readability */}
                <rect
                  x="-75"
                  y="-12"
                  width="150"
                  height="44"
                  rx="6"
                  fill="#0B0F19"
                  stroke={isSelected ? '#38BDF8' : '#1E293B'}
                  strokeWidth="1"
                  opacity="0.95"
                />

                {/* Region Title */}
                <text
                  textAnchor="middle"
                  y="2"
                  fill="#F8FAFC"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {region.name}
                </text>

                {/* Micro Telemetry Bar */}
                <text
                  textAnchor="middle"
                  y="18"
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  Pop: {region.stats.population.toLocaleString()}k · Stab: {region.stats.socialStability.toFixed(0)}%
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Selection Quick Bar at Bottom */}
      {selectedRegionId && regions[selectedRegionId] && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-lg flex items-center justify-between gap-3 text-xs font-mono shadow-xl">
          <div className="flex items-center gap-3 truncate">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: regions[selectedRegionId].color }}
            />
            <div className="truncate">
              <span className="font-bold text-slate-100 text-sm block truncate">
                {regions[selectedRegionId].name}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {regions[selectedRegionId].role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenQuickTweak(selectedRegionId)}
              className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-500/30 font-medium transition-colors"
            >
              Adjust Parameters
            </button>
            <button
              onClick={() => onSelectRegion(selectedRegionId)}
              className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 rounded hover:bg-slate-700 font-medium transition-colors"
            >
              Full Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
