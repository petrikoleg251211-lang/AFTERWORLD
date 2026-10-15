/**
 * AFTERWORLD — Scenario & World Data Interchange (JSON Export/Import & Presets)
 */

import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  FileText, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { ScenarioBranch, WorldState } from '../types/simulation';

interface InterchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScenario: ScenarioBranch;
  allScenarios: ScenarioBranch[];
  onImportScenario: (scenario: ScenarioBranch) => void;
  onResetAll: () => void;
  onLoadPrebuiltWorld: (presetKey: 'BASELINE' | 'DROUGHT_SHOCK' | 'GRID_CRISIS') => void;
}

export const InterchangeModal: React.FC<InterchangeModalProps> = ({
  isOpen,
  onClose,
  currentScenario,
  allScenarios,
  onImportScenario,
  onResetAll,
  onLoadPrebuiltWorld
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Export to JSON
  const handleExport = () => {
    const exportBundle = {
      formatVersion: 'AFTERWORLD_SCENARIO_v1.0',
      exportedAt: new Date().toISOString(),
      scenario: currentScenario
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `afterworld_${currentScenario.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle File Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.scenario || !parsed.scenario.id || !Array.isArray(parsed.scenario.history)) {
          throw new Error('Invalid schema: Missing required scenario history or identifier.');
        }
        onImportScenario(parsed.scenario);
        setImportSuccess(true);
        setTimeout(() => {
          onClose();
        }, 800);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to parse JSON file.';
        setImportError(errorMsg);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0F19] border border-slate-700 w-full max-w-lg rounded-xl p-5 shadow-2xl space-y-5 text-xs font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Scenario Data Interchange & Presets</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Export / Import Section */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase text-slate-400 font-bold block">
            Versioned JSON Exchange
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="p-3 bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-200 hover:text-cyan-300 transition-colors"
            >
              <Download className="w-5 h-5 text-cyan-400" />
              <span className="font-bold">Export Active Scenario</span>
              <span className="text-[10px] text-slate-500">Download .json bundle</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-900 border border-slate-700 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-200 hover:text-cyan-300 transition-colors"
            >
              <Upload className="w-5 h-5 text-cyan-400" />
              <span className="font-bold">Import Scenario</span>
              <span className="text-[10px] text-slate-500">Load external .json file</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {importError && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/80 rounded text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Scenario imported successfully!</span>
            </div>
          )}
        </div>

        {/* 2. Pre-calibrated World Templates */}
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <span className="text-[10px] uppercase text-slate-400 font-bold block">
            Load Pre-Calibrated World Templates
          </span>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onLoadPrebuiltWorld('BASELINE');
                onClose();
              }}
              className="w-full text-left p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded flex items-center justify-between transition-colors"
            >
              <div>
                <strong className="text-slate-100 block">Baseline Regional System</strong>
                <span className="text-[10px] text-slate-400">Calibrated balance across Capital, Agro, Mineral & Coastal regions</span>
              </div>
              <span className="text-cyan-400 text-xs font-bold">Load</span>
            </button>

            <button
              onClick={() => {
                onLoadPrebuiltWorld('DROUGHT_SHOCK');
                onClose();
              }}
              className="w-full text-left p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded flex items-center justify-between transition-colors"
            >
              <div>
                <strong className="text-amber-300 block">Transcontinental Drought Emergency</strong>
                <span className="text-[10px] text-slate-400">Harvest yield 0.30x with cascading urban food deficits</span>
              </div>
              <span className="text-amber-400 text-xs font-bold">Load</span>
            </button>

            <button
              onClick={() => {
                onLoadPrebuiltWorld('GRID_CRISIS');
                onClose();
              }}
              className="w-full text-left p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded flex items-center justify-between transition-colors"
            >
              <div>
                <strong className="text-rose-300 block">Grid Bottleneck & Blackout Cascade</strong>
                <span className="text-[10px] text-slate-400">Coastal transmission severing triggers industrial shutdown</span>
              </div>
              <span className="text-rose-400 text-xs font-bold">Load</span>
            </button>
          </div>
        </div>

        {/* 3. Reset All Laboratory State */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">Clear all session memory and history</span>
          <button
            onClick={() => {
              if (window.confirm('Reset all scenarios and restore default baseline world?')) {
                onResetAll();
                onClose();
              }
            }}
            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/70 rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Laboratory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
