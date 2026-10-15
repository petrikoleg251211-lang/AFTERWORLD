/**
 * AFTERWORLD — Top Telemetry & National Status Ribbon
 * Follows the 3-Zone Top Bar Contract with precision tabular numerals and simulation controls.
 */

import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Save, 
  Upload, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building2,
  Calendar
} from 'lucide-react';
import { SimulationState } from '../types/politicalSimulation';

interface TopTelemetryBarProps {
  state: SimulationState;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onResetGame: () => void;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  state,
  isRunning,
  onTogglePlay,
  onStepForward,
  simSpeed,
  onChangeSpeed,
  onSaveGame,
  onLoadGame,
  onResetGame
}) => {
  const activeStrikes = Object.values(state.buildings).filter(b => b.operatingStatus === 'ON_STRIKE').length;
  const coalitionSeats = state.parties.sdu.inCoalition ? state.parties.sdu.seats + state.parties.fmc.seats : state.parties.fmc.seats;
  const hasMajority = coalitionSeats >= 101;

  return (
    <header className="border-b border-slate-800 bg-[#0A0E17]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4 text-slate-200 select-none">
      {/* Zone 1: Wordmark & Date */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-widest text-slate-100 uppercase font-mono">
            AFTERWORLD
          </span>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline" aria-hidden="true">/</span>
          <span className="text-xs text-cyan-400 font-mono tracking-tight hidden sm:inline">
            REPUBLIC OF VERIDIA
          </span>
        </div>

        {/* Date Readout */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded text-xs font-mono text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold tabular-nums">
            Day {state.day}, Month {state.month}, Year {state.year}
          </span>
        </div>
      </div>

      {/* Zone 2: National Macro Telemetry */}
      <div className="hidden lg:flex items-center gap-6 shrink-0 text-xs font-mono">
        {/* Treasury */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">TREASURY:</span>
          <span className={`font-bold tabular-nums ${state.treasury < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ${state.treasury.toFixed(1)}M
          </span>
        </div>

        {/* National Approval */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">APPROVAL:</span>
          <span className={`font-bold tabular-nums ${
            state.overallApproval < 40 ? 'text-rose-400' : state.overallApproval < 60 ? 'text-amber-400' : 'text-cyan-300'
          }`}>
            {state.overallApproval}%
          </span>
        </div>

        {/* Inflation */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">INFLATION:</span>
          <span className={`font-bold tabular-nums ${state.inflationRate > 8 ? 'text-rose-400' : 'text-slate-200'}`}>
            {state.inflationRate}%
          </span>
        </div>

        {/* Coalition Majority */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">COALITION:</span>
          <span className={`font-bold tabular-nums ${hasMajority ? 'text-cyan-300' : 'text-rose-400'}`}>
            {coalitionSeats}/200 {hasMajority ? 'Majority' : 'MINORITY!'}
          </span>
        </div>

        {/* Active Strikes */}
        {activeStrikes > 0 && (
          <div className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-800/80 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-bold">{activeStrikes} STRIKE ACTIVE</span>
          </div>
        )}
      </div>

      {/* Zone 3: Playback Controls & Save / Load */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sim Speed / Playbar */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5">
          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded transition-colors ${
              isRunning 
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            }`}
            title={isRunning ? 'Pause simulation (Space)' : 'Run simulation (Space)'}
            aria-label={isRunning ? 'Pause' : 'Play'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={onStepForward}
            disabled={isRunning}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors disabled:opacity-40"
            title="Advance 1 Day"
            aria-label="Step forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="border-l border-slate-800 pl-1.5 pr-1 flex items-center gap-1">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  simSpeed === s
                    ? 'bg-slate-700 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Quick Save / Load */}
        <button
          onClick={onSaveGame}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded transition-colors"
          title="Save State to Browser Storage"
          aria-label="Save Game"
        >
          <Save className="w-4 h-4" />
        </button>

        <button
          onClick={onLoadGame}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded transition-colors"
          title="Restore Last Saved State"
          aria-label="Load Game"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
