/**
 * AFTERWORLD — Simulation Domain Types
 * Typed representations for entities, flows, rules, causal records,
 * scenario branching, checkpoints, and emergent pattern detection.
 */

export type ResourceType = 'FOOD' | 'ENERGY' | 'MINERALS' | 'WATER';

export interface RegionMetrics {
  population: number;         // in thousands (e.g. 1200 = 1.2M)
  foodStock: number;          // in kilotons (kt)
  foodProductionYield: number;// multiplier (1.0 = normal harvest, 0.4 = drought)
  energyGeneration: number;   // GWh / month
  energyDemand: number;       // GWh / month
  energyStorage: number;      // GWh stored reserve
  minerals: number;           // kt raw resources
  waterReserve: number;       // index 0..100
  environmentalStress: number;// index 0..100 (high = ecological damage)
  socialStability: number;    // index 0..100% (below 40% triggers unrest)
  jobsAvailable: number;      // in thousands
  migrationNet: number;       // k / month net inflow/outflow
}

export interface RegionEntity {
  id: string;
  name: string;
  role: string;               // e.g. "Commercial & Metropole Hub", "Agricultural Breadbasket"
  color: string;              // Hex color for map visualization
  coords: { x: number; y: number }; // Relative coordinates 0..100% on schematic map
  stats: RegionMetrics;
  historicalTrajectory?: { [K in keyof RegionMetrics]?: number[] };
}

export interface TransitLink {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  resource: ResourceType;
  capacity: number;           // max throughput per month
  actualThroughput: number;   // current transferred amount
  transmissionLoss: number;   // percentage 0..0.3 (loss due to distance/grid friction)
  status: 'OPTIMAL' | 'CONGESTED' | 'DISRUPTED';
}

export type RuleCategory = 
  | 'DEMOGRAPHICS'
  | 'AGRICULTURE'
  | 'ENERGY_GRID'
  | 'INDUSTRY'
  | 'ECOLOGY'
  | 'TRADE_LOGISTICS';

export interface SimulationRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  enabled: boolean;
  priority: number;
  parameters: Record<string, number>;
}

export interface CausalInputSnapshot {
  [variableName: string]: number;
}

export interface CausalRecord {
  id: string;
  step: number;
  entityId: string;
  targetVariable: keyof RegionMetrics;
  previousValue: number;
  nextValue: number;
  delta: number;
  ruleId: string;
  ruleName: string;
  inputs: CausalInputSnapshot;
  explanation: string;
  upstreamEntityIds?: string[];
}

export interface WorldState {
  step: number;
  monthName: string;
  regions: Record<string, RegionEntity>;
  links: TransitLink[];
  globalCarbon: number;       // Global aggregate carbon index
  globalAverageStability: number;
  seed: number;
}

export interface SimulationSnapshot {
  step: number;
  timestamp: number;
  state: WorldState;
  causalRecords: CausalRecord[];
  emergenceAlerts?: EmergencePattern[];
}

export interface Checkpoint {
  id: string;
  step: number;
  name: string;
  note: string;
  createdAt: number;
  snapshot: SimulationSnapshot;
}

export interface ScenarioBranch {
  id: string;
  name: string;
  description: string;
  color: string;
  parentScenarioId: string | null;
  forkStep: number;
  createdAt: number;
  checkpoints: Checkpoint[];
  parameterOverrides: Record<string, number>; // e.g. { "Agro.foodProductionYield": 0.35 }
  history: SimulationSnapshot[];
}

export type EmergenceType = 
  | 'THRESHOLD_CROSSING'
  | 'RUNAWAY_OSCILLATION'
  | 'SYSTEMIC_CASCADE'
  | 'RESOURCE_DEPLETION'
  | 'STABLE_EQUILIBRIUM';

export interface EmergencePattern {
  id: string;
  type: EmergenceType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  detectedAtStep: number;
  entityId?: string;
  metric: string;
  evidence: {
    step: number;
    value: number;
  }[];
  mitigationRecommendation?: string;
}
