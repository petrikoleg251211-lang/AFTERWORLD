/**
 * AFTERWORLD — Top Navigation & Telemetry Bar
 * Follows the 3-Zone Top Bar Contract: Brand Wordmark — Nav/State — Primary Controls.
 */

import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Smartphone, 
  Monitor, 
  GitBranch, 
  Bookmark, 
  Share2,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';
import { ScenarioBranch } from '../types/simulation';

interface HeaderTelemetryProps {
  currentScenario: ScenarioBranch;
  allScenarios: ScenarioBranch[];
  onSelectScenario: (id: string) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentStep: number;
  monthLabel: string;
  isMobileSimulator: boolean;
  onToggleSimulator: () => void;
  onOpenCheckpointModal: () => void;
  onOpenForkModal: () => void;
  onOpenInterchangeModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const HeaderTelemetry: React.FC<HeaderTelemetryProps> = ({
  currentScenario,
  allScenarios,
  onSelectScenario,
  isRunning,
  onTogglePlay,
  onStepForward,
  onReset,
  simSpeed,
  onChangeSpeed,
  currentStep,
  monthLabel,
  isMobileSimulator,
  onToggleSimulator,
  onOpenCheckpointModal,
  onOpenForkModal,
  onOpenInterchangeModal,
  isDarkMode,
  onToggleDarkMode
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0A0E17]/95 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 text-slate-200">
      {/* Zone 1: Wordmark & System State */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-widest text-slate-100 uppercase font-mono">
            AFTERWORLD
          </span>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline" aria-hidden="true">/</span>
          <span className="text-xs text-cyan-400 font-mono tracking-tight hidden sm:inline">
            LAB_v1.0
          </span>
        </div>

        {/* Scenario Switcher Dropdown */}
        <div className="relative flex items-center">
          <select
            value={currentScenario.id}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[170px] sm:max-w-[220px] truncate"
            title="Switch Active Scenario Branch"
          >
            {allScenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Simulation Controls & Telemetry Scrub */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Playback Controls */}
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
            title="Advance 1 Month"
            aria-label="Step forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            title="Reset to Step 0"
            aria-label="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
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

        {/* Telemetry Timestamp */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 border border-slate-800/80 bg-slate-950/60 px-2.5 py-1 rounded">
          <span className="text-cyan-400 font-semibold tabular-nums">T+{currentStep}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">{monthLabel}</span>
        </div>
      </div>

      {/* Zone 3: Workbench Actions & Viewport Switch */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Checkpoint button */}
        <button
          onClick={onOpenCheckpointModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
          title="Save Checkpoint Snapshot"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Save Checkpoint</span>
        </button>

        {/* Fork Branch button */}
        <button
          onClick={onOpenForkModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
          title="Fork Alternative Scenario Branch"
        >
          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
          <span>Branch</span>
        </button>

        {/* Import/Export Data */}
        <button
          onClick={onOpenInterchangeModal}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded transition-colors"
          title="Export / Import Scenario & Presets"
          aria-label="Data Interchange"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Mobile Simulator / Desktop Workbench Toggle */}
        <button
          onClick={onToggleSimulator}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded border transition-colors ${
            isMobileSimulator
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title={isMobileSimulator ? 'Switch to Full Desktop Workbench' : 'Switch to Mobile Simulator'}
        >
          {isMobileSimulator ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Mobile Lab</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Desktop Console</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
