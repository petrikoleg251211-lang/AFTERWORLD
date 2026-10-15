# AFTERWORLD — Zero-State Frontier City Builder & Political Simulation

Transform AFTERWORLD into a deep, playable from-scratch city-building and societal simulation where you begin with raw virgin terrain, a founding charter, and initial treasury, personally laying the first roads, utilities, and civic foundations, while zoning districts attract waves of diverse migrants who dynamically construct homes, industries, and form emergent political factions.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural and design decisions have been locked based on your confirmed preferences:
>
> - **Confirmed Founding Condition**: Raw virgin terrain with a Founding Constitutional Charter and an initial development treasury ($120M seed capital).
> - **Confirmed Construction Model**: Direct civic building placement (Founding Hall, Power Plant, Water Works, Roads, Public Clinics, Police Stations) paired with Zoned Private Construction (Residential, Commercial, Industrial zones where private developers dynamically construct and upgrade buildings based on utility access, land value, and tax policies).
> - **Confirmed Demographic Emergence**: Migrant waves arrive at entry road/harbor waypoints in response to housing availability, utility reliability, and open jobs; incoming citizens bring ideological traits that organically establish trade unions, commercial lobbies, and parliamentary factions as the city expands.

---

## 1. Overview & Core Concept

### What It Does
Rather than inheriting a pre-assembled city, the player takes the role of the Founding Governor / Prime Minister of a newly charted territory. You begin on an untouched 3D landscape with a single connection to the regional transport network. You survey the topography, layout the first arterial avenues, erect municipal power and water infrastructure, and designate residential and industrial quarters.

As basic survival necessities are met, migrant convoys arrive. Private citizens pool capital to construct tenement blocks, workshop cooperatives, and corner groceries. As the population grows past developmental thresholds (Settlement → Borough → Industrial City → National Republic), social tensions ignite over wages, pollution, working hours, and taxes. The player must balance hands-on urban planning with parliamentary statecraft, resolving strikes, navigating factional votes of confidence, and drafting landmark legislation.

### The Core Gameplay Loop
1. **Survey & Plan**: Inspect the raw 3D terrain grid, identifying coastal docks, fertile plains, and mineral deposits.
2. **Lay Infrastructure & Civic Cores**: Lay roads with smart grid snapping; place power generators, water towers, and the Founding Assembly Hall.
3. **Zone for Growth**: Paint Residential, Commercial, and Industrial zones.
4. **Attract Migrant Waves**: Monitor the Immigration Pressure Gauge. When housing and jobs are viable, incoming convoys bring citizens with diverse skills, wealth brackets, and political views.
5. **Watch Autonomous Construction**: Witness 3D scaffolding, cranes, and building construction animations as private enterprises build out your zoned plots.
6. **Emergent Politics & Governance**: As population exceeds milestones (100 → 500 → 2,500 citizens), citizens organize into political clubs (Labor Coalition, Free Market Syndicate, Green Pioneers, Constitutional Order), demanding seats in the Assembly and enacting legislative reforms.
7. **Crisis & Urban Evolution**: Handle blackouts, industrial fires, rent crises, wildcat strikes, and election cycles in real time.

---

## 2. User Experience & Visual Design

### 3D Construction & Viewport Experience
- **Tactical 3D Camera**: Smooth isometric orbit with right-click drag, keyboard WASD panning, scroll wheel street-to-regional zoom, and `R` key rotation for building orientation.
- **Interactive Holographic Placement Preview**:
  - Dynamic grid cursor highlighting terrain cells ($1\times1, 2\times2, 3\times3$).
  - Green holographic wireframe for valid placement; crimson red with contextual tooltip if blocked, overlapping, or disconnected from roads.
  - Visual coverage rings showing utility reach (power radius, water pressure, clinic emergency response distance).
- **Phased Construction Visuals**:
  - Stage 0: Marked foundation survey stakes and yellow cautionary tape.
  - Stage 1: Active scaffolding with tower cranes and particulate dust effects.
  - Stage 2: Completed architectural structure with window lights, procedural smoke (for factories), and ambient sound cues.
- **Dynamic Terrain & Natural Environment**:
  - Rolling green-slate topography with water bodies, riverfront embankment, and connecting regional highway spur.
  - Physically-based lighting (warm key directional sun with PCF soft shadows, cool hemisphere fill, and subtle atmospheric distance fog).

### Minimalist Tactical UI Architecture (Zero AI Slop)
- **Top Telemetry Ribbon (Single Row, Tabular Precision)**:
  - Territory Name & Founding Charter Title (`Republic of Veridia · Pioneer Charter`).
  - Simulation Clock: Date (`Day 1, Month 1, Year 1`) with speed controls ($1\times, 2\times, 5\times$, Pause).
  - Economic Metrics: Treasury balance ($M), Daily Cashflow ($/day), Population Count, and General Public Approval (%).
  - Quick Save, Load, and Reset Charter actions.
- **Modular Bottom Construction & Governance Dock**:
  - **Build Toolbar**: Categorized drawer for Roads, Power, Water, Civic & Emergency, and Zoned Lands (Residential, Commercial, Industrial, Agricultural).
  - **Zone Painter**: Intuitive grid drag-selection tool with clear color coding (Green for Residential, Blue for Commercial, Amber for Industrial, Yellow for Farmland).
  - **Demographics & Migration HUD**: Incoming migrant queue, current housing vacancy, job deficit/surplus, and stratum breakdown (Pioneer Laborers, Artisans, Entrepreneurs, Specialists).
  - **Parliament & Politics Panel**: Faction seat counts, ideological balance, active union petitions, and legislative bills (e.g., Fair Wages Ordinance, Public Health Mandate, Green Energy Subsidy).
  - **Entity Inspector**: Clicking any placed road, power plant, or zoned building opens a concise operational card showing power/water connectivity, occupancy, tax contribution, and worker morale.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Construction Model (Direct Civic Placement + Autonomous Zoned Growth)
- **Chosen Approach**: The player directly places vital public infrastructure (roads, power plants, water towers, municipal clinics, town hall), while residential, commercial, and industrial structures develop autonomously on zoned parcels according to economic demand and utility coverage.
- **Why**: Combines the tactile satisfaction of direct city engineering (SimCity / Cities: Skylines style) with the deep social-political realism of emergent private enterprise and citizen agency.
- **Alternatives Considered**: 100% manual placement of every single house feels tedious and strips citizens of autonomy; 100% abstract zoning without direct road networks lacks 3D spatial gameplay.

### Decision 2: Procedural Discrete Grid with Continuous 3D Agent Motion
- **Chosen Approach**: A $32\times32$ cellular tile system for roads, utilities, and building footprints, combined with continuous smooth particle agents for pedestrian crowds and vehicular traffic.
- **Why**: Discrete coordinate snapping ensures flawless road network graph traversal, flood-fill utility propagation (water pipes and electrical wires following road corridors), while continuous 3D agents ensure dynamic, lifelike visual feedback.

### Decision 3: Emergent Political System Tied to City Milestones
- **Chosen Approach**: The political system starts simple (Founding Council under executive decree) and organically expands into a full multi-party parliament as the population crosses demographic milestones (e.g., 250 citizens unlock the Labor Union; 1,000 citizens unlock rival parliamentary parties and elections).
- **Why**: Prevents overwhelming the player with complex parliamentary votes when they are simply trying to lay their first power line, creating a rewarding progression from humble settlement to a bustling constitutional republic.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AFTERWORLD 3D APPLICATION                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │     Top Telemetry Ribbon: Treasury · Cashflow · Pop · Date · SPD │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                THREE.JS INTERACTIVE 3D VIEWPORT                  │  │
│  │                                                                  │  │
│  │  - Procedural 3D Terrain & Dynamic 32x32 Spatial Grid            │  │
│  │  - Holographic Placement Cursor (Validation, Snap, Radius)       │  │
│  │  - Direct Civic Buildings & Autonomous Zoned Structures          │  │
│  │  - Dynamic Scaffolding & Construction Progression Effects        │  │
│  │  - Migrant Convoys, Traffic Vehicles & Citizen Crowds            │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             BOTTOM TOOLBAR & MODULAR MANAGEMENT DOCK             │  │
│  │  [Roads] [Power] [Water] [Zoning] [Civic] │ [Politics] [Budget]  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SIMULATION & CAUSAL CITY CORE                      │
│                                                                        │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │  Spatial Grid Engine  │ ◄─────► │  Utility Propagation Network   │  │
│  │  - 32x32 Cell Tiles   │         │  - Power Grid Continuity       │  │
│  │  - Road Graph Paths   │         │  - Water Pressure Conduits     │  │
│  │  - Zoning Designation │         │  - Pollution & Land Value Map  │  │
│  └───────────┬───────────┘         └────────────────┬───────────────┘  │
│              │                                      │                  │
│              ▼                                      ▼                  │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │  Migrant & Demo Core  │ ◄─────► │  Autonomous Growth Engine      │  │
│  │  - Immigration Waves  │         │  - Private Capital Investment  │  │
│  │  - Housing Allocation │         │  - Zone Density Upgrades       │  │
│  │  - Labor Market & Pay │         │  - Structural Abandonment      │  │
│  └───────────┬───────────┘         └────────────────┬───────────────┘  │
│              │                                      │                  │
│              ▼                                      ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │         EMERGENT POLITICAL & CONSTITUTIONAL ASSEMBLY             │  │
│  │  - Population Milestones (Pioneer Settlement → Republic)         │  │
│  │  - Ideological Clubs (Labor Union, Merchant Guild, Ecologists)   │  │
│  │  - Faction Confidence, Citizen Petitions & Legislative Reforms   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Data Models

#### Spatial Grid Tile (`GridCell`)
```typescript
interface GridCell {
  x: number;
  z: number;
  terrainHeight: number;
  zone: 'NONE' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'AGRICULTURAL';
  hasRoad: boolean;
  buildingId?: string;
  hasPower: boolean;
  hasWater: boolean;
  landValue: number; // 0 to 100
  pollution: number; // 0 to 100
}
```

#### City Building Entity (`CityBuilding`)
```typescript
interface CityBuilding {
  id: string;
  name: string;
  category: 'CIVIC' | 'INFRASTRUCTURE' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  typeId: string; // e.g., 'town_hall', 'coal_plant', 'water_tower', 'clinic', 'tenement_lvl1'
  gridX: number;
  gridZ: number;
  width: number;
  depth: number;
  constructionProgress: number; // 0 to 100 (100 = fully built)
  operational: boolean;
  maintenanceCostMonthly: number;
  capacity: number; // residents, workers, megawatts, or liters
  occupancy: number;
  health: number; // structural health 0..100
}
```

#### Migrant Wave & Population Class (`MigrantWave`, `StrataDemographics`)
```typescript
interface MigrantWave {
  dayArrived: number;
  count: number;
  origin: string;
  primarySkill: 'UNSKILLED_LABOR' | 'COMMERCIAL_ARTISAN' | 'TECHNICAL_SPECIALIST';
  politicalBias: 'LABOR' | 'MARKET' | 'ORDER' | 'ECOLOGIST';
  settled: boolean;
}
```

#### Development Milestones
1. **Pioneer Camp (Pop 0 – 150)**: Manual civic decrees, focus on basic survival (road connection, power, water well, food market).
2. **Settlement Assembly (Pop 150 – 600)**: First municipal council established; workers form early mutual-aid societies; small shops sprout on commercial avenues.
3. **Industrial Township (Pop 600 – 2,500)**: Foundries and light manufacturing attract large migrant waves; formal trade unions demand safety regulations; tax policy determines corporate investment.
4. **Constitutional Republic (Pop 2,500+)**: Full parliamentary democracy with competitive party elections, cabinet ministers, strikes, and national economic crises.

---

## 5. Implementation Sequence & Plan Execution

1. **Spatial Grid & Terrain Foundation**: Implement procedural 3D terrain with 32x32 cell coordinate system, water edge, and regional access road.
2. **Construction Mode & Placement Tools**: Implement placement raycasting, 3D holographic cursor preview (valid green / invalid red), road tool, utility placement (power & water), and civic buildings.
3. **Zoning & Autonomous Development Engine**: Create zone painting tool (Residential, Commercial, Industrial) and cellular growth algorithm that checks road access, power, water, and economic demand to trigger 3D building construction with scaffolding animations.
4. **Demographics & Migrant Wave Engine**: Implement arrival logic where migrant convoys travel along roads to occupy vacant zoned buildings, tracking employment, wages, and happiness.
5. **Emergent Politics & Milestone Progression**: Implement founding charter selection at start, civic milestones unlocking new infrastructure and parties, and seamless integration with the existing parliamentary cabinet, budget, and crisis engines.
6. **UI Polish & Verification**: Build intuitive dock controls with Zero-Pill design, tooltips, responsive camera controls, and comprehensive build/lint verification.
