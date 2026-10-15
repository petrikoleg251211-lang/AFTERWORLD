/**
 * AFTERWORLD — Full 3D Living Political & Societal Simulation
 * Real-time 3D City Viewport (Three.js WebGL) coupled with deterministic political, economic,
 * and societal simulation systems.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SimulationState, BuildingEntity } from './types/politicalSimulation';
import { 
  createInitialPoliticalState, 
  advancePoliticalSimulation, 
  resolveCrisisDecision, 
  toggleLawBill,
  updateTaxRate,
  updateSpending
} from './engine/politicalCore';
import { ThreeCityViewport } from './three/ThreeCityViewport';
import { TopTelemetryBar } from './components/TopTelemetryBar';
import { BottomDock } from './components/BottomDock';
import { GameOverModal } from './components/GameOverModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { RegionalLabModal } from './components/RegionalLabModal';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const SAVE_KEY = 'afterworld_3d_state_v2';

export default function App() {
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 3500);
  };

  // Reset confirmation dialog state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Regional macro systems lab modal state
  const [isRegionalLabOpen, setIsRegionalLabOpen] = useState<boolean>(false);

  // -------------------------------------------------------------
  // SIMULATION STATE & LOCAL PERSISTENCE
  // -------------------------------------------------------------
  const [simulationState, setSimulationState] = useState<SimulationState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version === 2 && parsed.districts && parsed.buildings && typeof parsed.treasury === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved 3D state, loading genesis default:', e);
    }
    return createInitialPoliticalState();
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [cameraTargetCoord, setCameraTargetCoord] = useState<[number, number, number] | null>(null);

  // Auto-save on simulation state update
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(simulationState));
    } catch (e) {
      console.warn('Storage quota exceeded:', e);
    }
  }, [simulationState]);

  // -------------------------------------------------------------
  // SIMULATION TICK ADVANCE
  // -------------------------------------------------------------
  const handleStepForward = useCallback(() => {
    setSimulationState(prev => advancePoliticalSimulation(prev));
  }, []);

  // Tick interval when running
  useEffect(() => {
    if (!isRunning || simulationState.isGameOver) return;

    const intervalTime = Math.max(180, Math.floor(1000 / simSpeed));
    const timer = setInterval(() => {
      handleStepForward();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isRunning, simSpeed, simulationState.isGameOver, handleStepForward]);

  // Spacebar Play/Pause shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(r => !r);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // -------------------------------------------------------------
  // INTERACTIVE GOVERNANCE HANDLERS
  // -------------------------------------------------------------
  const handleToggleLaw = (billId: string) => {
    setSimulationState(prev => {
      const next = toggleLawBill(prev, billId);
      const bill = next.laws.find(l => l.id === billId);
      if (bill) {
        showToast(bill.enacted ? `Passed: "${bill.name}"` : `Repealed: "${bill.name}"`, bill.enacted ? 'success' : 'info');
      }
      return next;
    });
  };

  const handleResolveCrisis = (crisisId: string, optionId: string) => {
    setSimulationState(prev => {
      const next = resolveCrisisDecision(prev, crisisId, optionId);
      showToast('Executive crisis decree enacted', 'success');
      return next;
    });
  };

  const handleUpdateTaxRate = (taxKey: 'corporate' | 'income' | 'vat', value: number) => {
    setSimulationState(prev => updateTaxRate(prev, taxKey, value));
    showToast(`${taxKey.toUpperCase()} tax adjusted to ${value}%`, 'info');
  };

  const handleUpdateSpending = (spendKey: 'welfare' | 'policing' | 'healthcare' | 'subsidies', value: number) => {
    setSimulationState(prev => updateSpending(prev, spendKey, value));
    showToast(`${spendKey.toUpperCase()} monthly spending adjusted to $${value}M`, 'info');
  };

  const handleFlyToCoord = (coord: [number, number, number]) => {
    setCameraTargetCoord(coord);
  };

  const handleSaveGame = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(simulationState));
      showToast('Game state saved to browser storage', 'success');
    } catch {
      showToast('Failed to save: browser storage full', 'error');
    }
  };

  const handleLoadGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSimulationState(parsed);
        showToast('Saved state restored from browser storage', 'success');
      } catch {
        showToast('Failed to load saved state from storage', 'error');
      }
    } else {
      showToast('No saved state found in browser storage', 'info');
    }
  };

  const handleOpenResetDialog = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    const fresh = createInitialPoliticalState();
    setSimulationState(fresh);
    setIsRunning(false);
    setSelectedBuildingId(null);
    localStorage.removeItem(SAVE_KEY);
    setIsResetConfirmOpen(false);
    showToast('Republic simulation reset to Day 1 genesis defaults', 'info');
  };

  const selectedBuilding: BuildingEntity | null = 
    selectedBuildingId && simulationState.buildings[selectedBuildingId]
      ? simulationState.buildings[selectedBuildingId]
      : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070A10] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Top Telemetry & Simulation Bar */}
      <TopTelemetryBar
        state={simulationState}
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(r => !r)}
        onStepForward={handleStepForward}
        simSpeed={simSpeed}
        onChangeSpeed={setSimSpeed}
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
        onResetGame={handleOpenResetDialog}
        mode={isRegionalLabOpen ? 'REGIONAL' : 'METROPOLIS'}
        onToggleMode={() => setIsRegionalLabOpen(o => !o)}
      />

      {/* 2. Real-Time 3D WebGL City Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <ThreeCityViewport
          simulationState={simulationState}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={setSelectedBuildingId}
          cameraTargetCoord={cameraTargetCoord}
          onCameraArrived={() => setCameraTargetCoord(null)}
        />
      </main>

      {/* 3. Collapsible Bottom Management Dock (Zero Occlusion) */}
      <BottomDock
        state={simulationState}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={setSelectedBuildingId}
        onFlyToCoord={handleFlyToCoord}
        onToggleLaw={handleToggleLaw}
        onResolveCrisis={handleResolveCrisis}
        onUpdateTaxRate={handleUpdateTaxRate}
        onUpdateSpending={handleUpdateSpending}
      />

      {/* 4. Game Over / State Collapse Modal */}
      <GameOverModal
        state={simulationState}
        onRestart={handleConfirmReset}
      />

      {/* 5. In-App Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* 6. Macro Regional Systems Supply Lab Modal */}
      <RegionalLabModal
        isOpen={isRegionalLabOpen}
        onClose={() => setIsRegionalLabOpen(false)}
      />

      {/* 7. Floating Toast Notification HUD */}
      {toast && (
        <div className="fixed top-14 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-mono backdrop-blur-md transition-all animate-fade-in bg-[#0B0F19]/95 border-slate-700 text-slate-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-slate-300 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
