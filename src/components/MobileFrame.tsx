/**
 * AFTERWORLD — Mobile Device Simulator & Desktop Workbench Frame
 * Supports dual-mode: ergonomic smartphone chassis with bottom tabs or full desktop lab console.
 */

import React from 'react';
import { 
  Globe, 
  Clock, 
  Workflow, 
  GitCompare, 
  Sliders, 
  Wifi, 
  Battery, 
  Signal,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'WORLD' | 'TIMELINE' | 'CAUSAL' | 'COMPARE' | 'STUDIO';

interface MobileFrameProps {
  isMobileSimulator: boolean;
  onToggleSimulator: () => void;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  emergenceCount: number;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  isMobileSimulator,
  onToggleSimulator,
  activeTab,
  onChangeTab,
  emergenceCount,
  children
}) => {
  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'WORLD', label: 'World', icon: <Globe className="w-5 h-5" /> },
    { key: 'TIMELINE', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
    { key: 'CAUSAL', label: 'Causal', icon: <Workflow className="w-5 h-5" /> },
    { key: 'COMPARE', label: 'Compare', icon: <GitCompare className="w-5 h-5" /> },
    { key: 'STUDIO', label: 'Studio', icon: <Sliders className="w-5 h-5" /> }
  ];

  if (!isMobileSimulator) {
    // Desktop Workbench Full-Width Mode
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Desktop Viewport Sub-Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onChangeTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.key === 'TIMELINE' && emergenceCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={onToggleSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded text-xs font-mono text-slate-300 transition-colors"
            title="Switch to Mobile Smartphone Simulator"
          >
            <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mobile Device Simulator</span>
          </button>
        </div>

        {/* Content View */}
        <div className="w-full pb-8">
          {children}
        </div>
      </div>
    );
  }

  // Mobile Device Simulator Mode
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2 min-h-[calc(100vh-60px)]">
      {/* Device Frame */}
      <div className="relative w-full max-w-[420px] h-[830px] max-h-[92vh] bg-[#05070B] border-[10px] border-[#1E293B] rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-slate-700/60">
        
        {/* Device Notch / Dynamic Island & Status Bar */}
        <div className="h-10 px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 select-none bg-slate-950/80">
          <span>12:00</span>

          {/* Speaker / Camera Notch */}
          <div className="w-20 h-4 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Mobile Viewport Screen Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 pb-20">
          {children}
        </div>

        {/* Fixed Mobile Bottom Tab Bar (Ergonomic Thumb Reach Zone) */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#090D16]/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center px-1 z-30 select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChangeTab(tab.key)}
                className={`relative flex flex-col items-center justify-center h-full transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-mono font-medium mt-1">
                  {tab.label}
                </span>

                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-0.5 bg-cyan-400 rounded-full" />
                )}

                {/* Emergence Dot on Timeline */}
                {tab.key === 'TIMELINE' && emergenceCount > 0 && (
                  <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
