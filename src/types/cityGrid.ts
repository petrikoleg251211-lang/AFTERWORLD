/**
 * AFTERWORLD — Spatial Grid & Construction System Types
 * 32x32 cellular city-building grid, modular utilities, zoning, and growth mechanics.
 */

export type TerrainType = 'GRASS' | 'WATER' | 'COAST' | 'FOREST' | 'ROCK';

export type ZoneType = 'NONE' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'PARK';

export type RoadType = 'NONE' | 'STRAIGHT_X' | 'STRAIGHT_Z' | 'CROSS' | 'CORNER_NE' | 'CORNER_NW' | 'CORNER_SE' | 'CORNER_SW' | 'T_JUNCTION' | 'DEAD_END';

export interface GridCell {
  x: number;             // 0..31
  z: number;             // 0..31
  terrain: TerrainType;
  height: number;
  hasRoad: boolean;
  roadType: RoadType;
  zone: ZoneType;
  buildingId?: string;
  hasPower: boolean;
  hasWater: boolean;
  landValue: number;     // 0..100
  pollution: number;     // 0..100
}

export type BuildableCategory = 'ROAD' | 'UTILITY' | 'ZONE' | 'CIVIC' | 'DEMOLISH';

export interface BuildableItem {
  id: string;
  name: string;
  category: BuildableCategory;
  zoneType?: ZoneType;
  buildingTypeId?: string;
  cost: number;           // $M
  monthlyMaintenance: number; // $M
  width: number;          // in grid cells
  depth: number;          // in grid cells
  description: string;
  icon: string;
  powerOutput?: number;   // kW or MW
  waterOutput?: number;   // kL
  powerRadius?: number;   // cell radius
  waterRadius?: number;   // cell radius
  jobsProvided?: number;
  residentialCapacity?: number;
  healthBonus?: number;
  securityBonus?: number;
  unlockedAtMilestone: number; // 0..3
}

export interface CityZonedBuilding {
  id: string;
  name: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'CIVIC' | 'UTILITY';
  subType: string;        // e.g. 'cabin', 'tenement', 'store', 'workshop', 'town_hall'
  gridX: number;
  gridZ: number;
  width: number;
  depth: number;
  level: number;          // 1..3
  constructionProgress: number; // 0..100%
  isConstructing: boolean;
  occupancy: number;
  maxCapacity: number;
  jobs: number;
  health: number;         // 0..100
  powerConnected: boolean;
  waterConnected: boolean;
  roadConnected: boolean;
  taxYield: number;       // $M per month
}

export interface FoundingCharter {
  id: 'pioneer_industrial' | 'cooperative_commune' | 'free_trade_haven';
  name: string;
  tagline: string;
  description: string;
  startingTreasury: number; // $M
  initialIdeology: string;
  unlockedBonuses: string[];
}

export interface DevelopmentMilestone {
  level: number;
  name: string;
  requiredPopulation: number;
  description: string;
  unlockedBuildings: string[];
  governanceModel: 'DIRECT_DECREE' | 'MUNICIPAL_COUNCIL' | 'PARLIAMENTARY_ASSEMBLY' | 'SOVEREIGN_REPUBLIC';
}

export const DEVELOPMENT_MILESTONES: DevelopmentMilestone[] = [
  {
    level: 0,
    name: 'Pioneer Outpost',
    requiredPopulation: 0,
    description: 'A modest encampment on raw virgin land. Direct executive decrees govern early survival.',
    unlockedBuildings: ['road_paved', 'generator_wind', 'water_well', 'town_hall', 'zone_res', 'zone_com', 'zone_ind'],
    governanceModel: 'DIRECT_DECREE'
  },
  {
    level: 1,
    name: 'Frontier Borough',
    requiredPopulation: 50,
    description: 'Citizens organize mutual-aid committees. Medical clinic and constabulary maintain order.',
    unlockedBuildings: ['clinic', 'police_post', 'civic_park', 'water_tower'],
    governanceModel: 'MUNICIPAL_COUNCIL'
  },
  {
    level: 2,
    name: 'Industrial Township',
    requiredPopulation: 250,
    description: 'Heavy enterprise and trade unions emerge. Coal generation and parliamentary factions mobilize.',
    unlockedBuildings: ['power_coal', 'fire_station', 'high_density_zone'],
    governanceModel: 'PARLIAMENTARY_ASSEMBLY'
  },
  {
    level: 3,
    name: 'Sovereign Republic',
    requiredPopulation: 1000,
    description: 'A thriving constitutional metropolis. Full national parliament, ministerial cabinets, and landmark legislation.',
    unlockedBuildings: ['parliament_complex', 'national_bank', 'harbor_docks'],
    governanceModel: 'SOVEREIGN_REPUBLIC'
  }
];

export const FOUNDING_CHARTERS: FoundingCharter[] = [
  {
    id: 'pioneer_industrial',
    name: 'Industrial Frontier Charter',
    tagline: 'Forged in Steel & Solidarity',
    description: 'Accelerate heavy metallurgy and manufacturing. Starts with robust tool supply and +$130M initial state capital.',
    startingTreasury: 130,
    initialIdeology: 'Social-Labor Syndicate',
    unlockedBonuses: [
      '+15% Industrial job generation rate',
      'Coal generator available at Milestone 1',
      'High labor solidarity and early union council'
    ]
  },
  {
    id: 'cooperative_commune',
    name: 'Agrarian Cooperative Charter',
    tagline: 'Equal Land & Mutual Aid',
    description: 'Focus on public welfare, green commons, and egalitarian distribution. Low starting unrest and high citizen loyalty.',
    startingTreasury: 115,
    initialIdeology: 'Democratic Cooperative',
    unlockedBonuses: [
      '+25% Public health & satisfaction',
      'Parks cost 50% less and grant double land value',
      'Reduced strike propensity across all strata'
    ]
  },
  {
    id: 'free_trade_haven',
    name: 'Free Trade Maritime Charter',
    tagline: 'Enterprise, Commerce & Capital',
    description: 'A venture-funded trade enclave offering minimal taxation to attract overseas private investment and merchant convoys.',
    startingTreasury: 140,
    initialIdeology: 'Free Market Liberalism',
    unlockedBonuses: [
      '+30% Private capital building construction speed',
      '+20% Commercial sales tax yield',
      'Attracts wealthy merchant migrant waves'
    ]
  }
];

export const BUILDABLE_CATALOG: BuildableItem[] = [
  // --- ROADS & TRANSIT ---
  {
    id: 'road_paved',
    name: 'Paved Avenue',
    category: 'ROAD',
    cost: 0.05,
    monthlyMaintenance: 0.002,
    width: 1,
    depth: 1,
    description: 'Two-lane asphalt road with utility conduits. Transmits power and water along its path.',
    icon: '🚜',
    unlockedAtMilestone: 0
  },
  // --- UTILITIES ---
  {
    id: 'generator_wind',
    name: 'Pioneer Wind Turbine',
    category: 'UTILITY',
    buildingTypeId: 'generator_wind',
    cost: 1.2,
    monthlyMaintenance: 0.02,
    width: 1,
    depth: 1,
    description: 'Eco-friendly kinetic generator. Clean energy output with zero industrial pollution.',
    icon: '⚡',
    powerOutput: 45,
    powerRadius: 6,
    unlockedAtMilestone: 0
  },
  {
    id: 'power_coal',
    name: 'Smokestack Coal Plant',
    category: 'UTILITY',
    buildingTypeId: 'power_coal',
    cost: 4.5,
    monthlyMaintenance: 0.15,
    width: 2,
    depth: 2,
    description: 'High-output thermal generator. Powers vast industrial grids but generates heavy soot.',
    icon: '🏭',
    powerOutput: 220,
    powerRadius: 12,
    unlockedAtMilestone: 2
  },
  {
    id: 'water_well',
    name: 'Municipal Artesian Well',
    category: 'UTILITY',
    buildingTypeId: 'water_well',
    cost: 0.8,
    monthlyMaintenance: 0.015,
    width: 1,
    depth: 1,
    description: 'Deep groundwater extraction pump providing clean drinking water to adjacent sectors.',
    icon: '💧',
    waterOutput: 40,
    waterRadius: 5,
    unlockedAtMilestone: 0
  },
  {
    id: 'water_tower',
    name: 'Pressurized Water Tower',
    category: 'UTILITY',
    buildingTypeId: 'water_tower',
    cost: 1.8,
    monthlyMaintenance: 0.035,
    width: 1,
    depth: 1,
    description: 'Elevated reservoir providing stable water pressure across extensive road networks.',
    icon: '🗼',
    waterOutput: 180,
    waterRadius: 10,
    unlockedAtMilestone: 1
  },
  // --- ZONING ---
  {
    id: 'zone_res',
    name: 'Residential Zone',
    category: 'ZONE',
    zoneType: 'RESIDENTIAL',
    cost: 0.01,
    monthlyMaintenance: 0,
    width: 1,
    depth: 1,
    description: 'Parcels for citizen homes. Settlers will build pioneer cabins, expanding to townhouses.',
    icon: '🏡',
    unlockedAtMilestone: 0
  },
  {
    id: 'zone_com',
    name: 'Commercial Zone',
    category: 'ZONE',
    zoneType: 'COMMERCIAL',
    cost: 0.01,
    monthlyMaintenance: 0,
    width: 1,
    depth: 1,
    description: 'Designates retail, food markets, and service enterprises that trade with citizens.',
    icon: '🏪',
    unlockedAtMilestone: 0
  },
  {
    id: 'zone_ind',
    name: 'Industrial Zone',
    category: 'ZONE',
    zoneType: 'INDUSTRIAL',
    cost: 0.01,
    monthlyMaintenance: 0,
    width: 1,
    depth: 1,
    description: 'Heavy workshops, manufacturing, and smelting foundries providing abundant labor jobs.',
    icon: '🛠️',
    unlockedAtMilestone: 0
  },
  {
    id: 'zone_dezone',
    name: 'Clear Zoning',
    category: 'ZONE',
    zoneType: 'NONE',
    cost: 0.0,
    monthlyMaintenance: 0,
    width: 1,
    depth: 1,
    description: 'Revokes zoning designation on selected parcel without bulldozing existing structures.',
    icon: '🧹',
    unlockedAtMilestone: 0
  },
  // --- CIVIC & EMERGENCY ---
  {
    id: 'town_hall',
    name: 'Pioneer Town Hall',
    category: 'CIVIC',
    buildingTypeId: 'town_hall',
    cost: 3.5,
    monthlyMaintenance: 0.06,
    width: 2,
    depth: 2,
    description: 'Administrative seat of the settlement. Coordinates municipal logistics and unlocks civic laws.',
    icon: '🏛️',
    jobsProvided: 20,
    unlockedAtMilestone: 0
  },
  {
    id: 'clinic',
    name: 'Frontier Medical Clinic',
    category: 'CIVIC',
    buildingTypeId: 'clinic',
    cost: 1.5,
    monthlyMaintenance: 0.05,
    width: 1,
    depth: 1,
    description: 'Provides essential emergency healthcare, reducing mortality and boosting worker morale.',
    icon: '🏥',
    jobsProvided: 15,
    healthBonus: 35,
    unlockedAtMilestone: 1
  },
  {
    id: 'police_post',
    name: 'Frontier Constabulary',
    category: 'CIVIC',
    buildingTypeId: 'police_post',
    cost: 1.2,
    monthlyMaintenance: 0.04,
    width: 1,
    depth: 1,
    description: 'Maintains civil order, protects commercial districts, and lowers strike escalation risks.',
    icon: '👮',
    jobsProvided: 12,
    securityBonus: 30,
    unlockedAtMilestone: 1
  },
  {
    id: 'civic_park',
    name: 'Public Commons Park',
    category: 'CIVIC',
    buildingTypeId: 'civic_park',
    cost: 0.35,
    monthlyMaintenance: 0.005,
    width: 1,
    depth: 1,
    description: 'Green oasis with trees and walking paths. Drastically improves surrounding land values.',
    icon: '🌳',
    unlockedAtMilestone: 1
  },
  {
    id: 'fire_station',
    name: 'Municipal Fire Brigade',
    category: 'CIVIC',
    buildingTypeId: 'fire_station',
    cost: 2.0,
    monthlyMaintenance: 0.06,
    width: 2,
    depth: 1,
    description: 'Protects industrial and dense residential sectors from catastrophic factory fires.',
    icon: '🚒',
    jobsProvided: 18,
    unlockedAtMilestone: 2
  },
  // --- DEMOLISH ---
  {
    id: 'demolish_tool',
    name: 'Bulldozer & Demolish',
    category: 'DEMOLISH',
    cost: 0.02,
    monthlyMaintenance: 0,
    width: 1,
    depth: 1,
    description: 'Clear roads, utility poles, or buildings. Returns partial scrap salvage to treasury.',
    icon: '💥',
    unlockedAtMilestone: 0
  }
];
