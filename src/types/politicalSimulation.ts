/**
 * AFTERWORLD — 3D Political & Societal Simulation Data Types
 */

export interface District {
  id: 'civic' | 'industrial' | 'residential' | 'harbor';
  name: string;
  description: string;
  color: string;
  cameraFocus: [number, number, number];
  unrestLevel: number;        // 0..100%
  economicOutput: number;     // $M / month
  pollution: number;          // 0..100%
}

export type BuildingType = 
  | 'PARLIAMENT'
  | 'MINISTRY'
  | 'FOUNDRY'
  | 'WAREHOUSE'
  | 'TENEMENT'
  | 'HOSPITAL'
  | 'BANK'
  | 'DOCKS'
  | 'PLAZA';

export interface BuildingEntity {
  id: string;
  name: string;
  type: BuildingType;
  districtId: 'civic' | 'industrial' | 'residential' | 'harbor';
  position: [number, number, number]; // [x, y, z]
  dimensions: [number, number, number];
  jobs: number;
  occupancy: number;
  operatingStatus: 'NORMAL' | 'OVERLOADED' | 'ON_STRIKE' | 'DAMAGED' | 'SHUTDOWN';
  monthlyOutput: number;      // $M
  workerDissatisfaction: number; // 0..100%
  description: string;
}

export interface PopulationStrata {
  id: string;
  name: string;
  headcount: number;          // in thousands
  unemploymentRate: number;   // %
  monthlyIncome: number;      // average wage in credits
  approval: number;           // 0..100%
  strikePropensity: number;   // 0..100%
  keyDemand: string;
  preferredPartyId: string;
}

export interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  ideology: string;
  color: string;
  seats: number;              // out of 200
  inCoalition: boolean;
  loyalty: number;            // 0..100%
  stances: {
    welfare: number;          // -1 (free market) to +1 (welfare state)
    businessTaxes: number;
    securityPolice: number;
    ecologicalTransition: number;
  };
}

export interface CabinetMinistry {
  id: string;
  title: string;
  ministerName: string;
  partyId: string;
  competence: number;         // 0..100%
  loyalty: number;            // 0..100%
}

export interface LawBill {
  id: string;
  name: string;
  category: 'LABOR' | 'FISCAL' | 'SECURITY' | 'ECOLOGY';
  description: string;
  enacted: boolean;
  proposed: boolean;
  supportEstimate: number;    // out of 200 seats
  costPerMonth: number;       // $M
  revenueEffect: number;      // $M
  laborApprovalDelta: number;
  businessApprovalDelta: number;
  inflationDelta: number;
}

export interface CrisisDecisionOption {
  id: string;
  label: string;
  description: string;
  cost: number;               // $M treasury cost
  effects: {
    approvalDelta?: number;
    strikeResolves?: boolean;
    coalitionLoyaltyDelta?: number;
    inflationDelta?: number;
    laborSatisfactionDelta?: number;
    businessSatisfactionDelta?: number;
    unrestDelta?: number;
  };
  narrativeOutcome: string;
}

export interface ActiveCrisis {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  districtId: 'civic' | 'industrial' | 'residential' | 'harbor';
  buildingId?: string;
  description: string;
  crowdSize: number;          // approximate crowd in public space
  options: CrisisDecisionOption[];
  resolved: boolean;
  resolutionNote?: string;
  occurredAtDay: number;
}

export interface SimulationState {
  day: number;
  month: number;
  year: number;
  treasury: number;           // $M
  gdp: number;                // $M annual run rate
  inflationRate: number;      // %
  taxRates: {
    corporate: number;        // %
    income: number;           // %
    vat: number;              // %
  };
  spending: {
    welfare: number;          // $M/mo
    policing: number;         // $M/mo
    healthcare: number;       // $M/mo
    subsidies: number;        // $M/mo
  };
  overallApproval: number;    // %
  districts: Record<string, District>;
  buildings: Record<string, BuildingEntity>;
  strata: Record<string, PopulationStrata>;
  parties: Record<string, PoliticalParty>;
  cabinet: Record<string, CabinetMinistry>;
  laws: LawBill[];
  crises: ActiveCrisis[];
  historyLog: { day: number; message: string; type: 'POLICY' | 'CRISIS' | 'ECONOMIC' }[];
  isGameOver: boolean;
  gameOverReason?: string;
}
