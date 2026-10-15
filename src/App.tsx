/**
 * AFTERWORLD — Full 3D Living Political & Societal Simulation
 * Real-time 3D City Viewport (Three.js WebGL) coupled with deterministic political, economic,
 * and societal simulation systems. Starts from scratch with a pristine frontier charter.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SimulationState, BuildingEntity } from './types/politicalSimulation';
import { BuildableItem, CityZonedBuilding, BUILDABLE_CATALOG } from './types/cityGrid';
import { 
  createInitialPoliticalState, 
  createPioneerZeroState,
  advancePoliticalSimulation, 
  resolveCrisisDecision, 
  toggleLawBill,
  updateTaxRate,
  updateSpending
} from './engine/politicalCore';
import { placeItemOnGrid } from './engine/cityGridCore';
import { ThreeCityViewport } from './three/ThreeCityViewport';
import { TopTelemetryBar } from './components/TopTelemetryBar';
import { BottomDock } from './components/BottomDock';
import { GameOverModal } from './components/GameOverModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { RegionalLabModal } from './components/RegionalLabModal';
import { FoundingCharterModal } from './components/FoundingCharterModal';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const SAVE_KEY = 'afterworld_3d_state_v3';

export default function App() {
  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 3500);
  };

  // Modal States
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isRegionalLabOpen, setIsRegionalLabOpen] = useState<boolean>(false);
  const [isCharterModalOpen, setIsCharterModalOpen] = useState<boolean>(false);

  // Active Construction & Building State
  const [activeBuildTool, setActiveBuildTool] = useState<BuildableItem | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [cameraTargetCoord, setCameraTargetCoord] = useState<[number, number, number] | null>(null);

  // -------------------------------------------------------------
  // SIMULATION STATE & LOCAL PERSISTENCE
  // -------------------------------------------------------------
  const [simulationState, setSimulationState] = useState<SimulationState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version === 2 && parsed.districts && typeof parsed.treasury === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved 3D state, loading genesis default:', e);
    }
    // Starts from scratch: pristine terrain, zero pre-placed buildings, founding charter
    return createPioneerZeroState('pioneer_industrial');
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);

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

  // Spacebar Play/Pause and Escape key shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(r => !r);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setActiveBuildTool(null);
        setSelectedBuildingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // -------------------------------------------------------------
  // INTERACTIVE CONSTRUCTION & PLACEMENT HANDLERS
  // -------------------------------------------------------------
  const handlePlaceItem = (gridX: number, gridZ: number, item: BuildableItem) => {
    const result = placeItemOnGrid(simulationState, gridX, gridZ, item);
    if (result.success && result.nextState) {
      setSimulationState(result.nextState);
      showToast(`${item.name} constructed at [${gridX}, ${gridZ}]`, 'success');
    } else {
      showToast(result.reason || 'Placement blocked', 'error');
    }
  };

  const handleDemolishZonedBuilding = (buildingId: string) => {
    const b = simulationState.zonedBuildings?.[buildingId];
    if (!b) return;

    const demolishTool = BUILDABLE_CATALOG.find(i => i.category === 'DEMOLISH')!;
    const result = placeItemOnGrid(simulationState, b.gridX, b.gridZ, demolishTool);
    if (result.success && result.nextState) {
      setSimulationState(result.nextState);
      setSelectedBuildingId(null);
      showToast(`Demolished ${b.name}. Reclaimed site footprint.`, 'info');
    }
  };

  const handleSelectCharter = (charterId: string) => {
    const fresh = createPioneerZeroState(charterId);
    setSimulationState(fresh);
    setIsRunning(false);
    setSelectedBuildingId(null);
    setActiveBuildTool(null);
    localStorage.removeItem(SAVE_KEY);
    showToast(`Charter enacted! Lay your first roads and utilities.`, 'success');
  };

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
    const fresh = createPioneerZeroState('pioneer_industrial');
    setSimulationState(fresh);
    setIsRunning(false);
    setSelectedBuildingId(null);
    setActiveBuildTool(null);
    localStorage.removeItem(SAVE_KEY);
    setIsResetConfirmOpen(false);
    showToast('Simulation reset to Day 1 unbuilt virgin frontier', 'info');
  };

  // Inspect selected building
  const selectedBuilding: BuildingEntity | null = 
    selectedBuildingId && simulationState.buildings?.[selectedBuildingId]
      ? simulationState.buildings[selectedBuildingId]
      : null;

  const selectedZonedBuilding: CityZonedBuilding | null =
    selectedBuildingId && simulationState.zonedBuildings?.[selectedBuildingId]
      ? simulationState.zonedBuildings[selectedBuildingId]
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

      {/* 2. Real-Time 3D WebGL City Viewport & Construction Surface */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <ThreeCityViewport
          simulationState={simulationState}
          activeBuildTool={activeBuildTool}
          onPlaceItem={handlePlaceItem}
          onCancelBuildTool={() => setActiveBuildTool(null)}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={setSelectedBuildingId}
          cameraTargetCoord={cameraTargetCoord}
          onCameraArrived={() => setCameraTargetCoord(null)}
        />
      </main>

      {/* 3. Collapsible Bottom Management & Construction Dock */}
      <BottomDock
        state={simulationState}
        activeBuildTool={activeBuildTool}
        onSelectBuildTool={setActiveBuildTool}
        selectedBuilding={selectedBuilding}
        selectedZonedBuilding={selectedZonedBuilding}
        onSelectBuilding={setSelectedBuildingId}
        onFlyToCoord={handleFlyToCoord}
        onToggleLaw={handleToggleLaw}
        onResolveCrisis={handleResolveCrisis}
        onUpdateTaxRate={handleUpdateTaxRate}
        onUpdateSpending={handleUpdateSpending}
        onOpenCharterModal={() => setIsCharterModalOpen(true)}
        onDemolishZonedBuilding={handleDemolishZonedBuilding}
      />

      {/* 4. Founding Constitutional Charter Modal */}
      <FoundingCharterModal
        isOpen={isCharterModalOpen}
        onClose={() => setIsCharterModalOpen(false)}
        onSelectCharter={handleSelectCharter}
        currentCharterId={simulationState.charterId}
      />

      {/* 5. Game Over Modal */}
      <GameOverModal
        state={simulationState}
        onRestart={handleConfirmReset}
      />

      {/* 6. In-App Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* 7. Macro Regional Systems Supply Lab Modal */}
      <RegionalLabModal
        isOpen={isRegionalLabOpen}
        onClose={() => setIsRegionalLabOpen(false)}
      />

      {/* 8. Floating Toast Notification HUD */}
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
