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
  toggleLawBill 
} from './engine/politicalCore';
import { ThreeCityViewport } from './three/ThreeCityViewport';
import { TopTelemetryBar } from './components/TopTelemetryBar';
import { BottomDock } from './components/BottomDock';
import { GameOverModal } from './components/GameOverModal';

const SAVE_KEY = 'afterworld_3d_state_v1';

export default function App() {
  // -------------------------------------------------------------
  // SIMULATION STATE & LOCAL PERSISTENCE
  // -------------------------------------------------------------
  const [simulationState, setSimulationState] = useState<SimulationState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.districts && parsed.buildings) {
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
    setSimulationState(prev => toggleLawBill(prev, billId));
  };

  const handleResolveCrisis = (crisisId: string, optionId: string) => {
    setSimulationState(prev => resolveCrisisDecision(prev, crisisId, optionId));
  };

  const handleUpdateTaxRate = (taxKey: 'corporate' | 'income' | 'vat', value: number) => {
    setSimulationState(prev => ({
      ...prev,
      taxRates: {
        ...prev.taxRates,
        [taxKey]: value
      }
    }));
  };

  const handleUpdateSpending = (spendKey: 'welfare' | 'policing' | 'healthcare' | 'subsidies', value: number) => {
    setSimulationState(prev => ({
      ...prev,
      spending: {
        ...prev.spending,
        [spendKey]: value
      }
    }));
  };

  const handleFlyToCoord = (coord: [number, number, number]) => {
    setCameraTargetCoord(coord);
  };

  const handleSaveGame = () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(simulationState));
    alert('Game State Saved Successfully!');
  };

  const handleLoadGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        setSimulationState(JSON.parse(saved));
        alert('Saved Game State Restored.');
      } catch (err) {
        alert('Failed to load saved state.');
      }
    } else {
      alert('No saved state found in local storage.');
    }
  };

  const handleResetGame = () => {
    if (window.confirm('Reset republic simulation to Day 1 genesis defaults?')) {
      const fresh = createInitialPoliticalState();
      setSimulationState(fresh);
      setIsRunning(false);
      localStorage.removeItem(SAVE_KEY);
    }
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
        onResetGame={handleResetGame}
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
        onRestart={handleResetGame}
      />
    </div>
  );
}
