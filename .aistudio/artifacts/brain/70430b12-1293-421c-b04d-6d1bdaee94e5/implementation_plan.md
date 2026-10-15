# AFTERWORLD — 3D Living Political & Societal Simulation

Transform AFTERWORLD from an abstract regional model into a genuine, navigable 3D political simulation where the player governs a republic facing social upheaval, industrial transformation, and parliamentary crisis in a real-time, living 3D urban environment.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural and design decisions have been aligned based on your confirmed specifications:
>
> - **Confirmed 3D Viewport**: Tactical isometric camera perspective with free orbital rotation, street-level zoom, and smooth panning over a multi-district procedural city.
> - **Confirmed Starting Context**: Industrial transition republic (*The Republic of Veridia*) facing major manufacturing layoffs, energy grid friction, food price inflation, and union strikes.
> - **Confirmed Political Model**: Parliamentary cabinet system featuring party coalitions, factional approval, legislative reform bills, and direct negotiations with striking worker assemblies.

---

## 1. Overview & Core Concept

### What It Does
AFTERWORLD delivers a real-time 3D political simulation. The player commands the state as Head of Government, viewing their capital city in a fully navigable 3D environment rendered with Three.js. Real-time procedural pedestrians, traffic, factories, residential tenements, and government ministries reflect the economic health and political sentiment of the republic. When policies trigger inflation, unemployment, or civil unrest, citizens physically assemble in public squares, march on Parliament, or picket factory gates, demanding cabinet response.

### Target Audience & Gameplay Loop
1. **Observe the 3D City**: Survey civic districts, smokestacks at the ironworks, citizen crowd densities, and traffic flows.
2. **Investigate Specific Buildings & Strata**: Click any structure (e.g. Parliament, Iron Foundry, Workers' Tenements, General Hospital) to inspect operating status, wages, employment, and local dissatisfaction.
3. **Enact Legislation & Economic Policies**: Adjust tax rates, welfare spending, minimum wage, police funding, and import tariffs through parliamentary debate.
4. **Advance Simulation Time**: Watch deterministic simulation cycles propagate through household income, market prices, and political approval.
5. **Manage Escalating Crises**: Address real crisis events (strikes, corruption scandals, coalition confidence votes, price spikes) with meaningful trade-offs.
6. **Face Political Consequences**: Prevent government collapse, avoid early election defeat, and navigate societal transitions without descending into civil conflict.

---

## 2. User Experience & Visual Design

### 3D City Architecture & Districts
- **District 1: Independence Plaza & Civic Core**:
  - Neoclassical Parliament House with rotunda and stone steps.
  - Ministry of the Interior, Supreme Court, and National Bank.
  - Large public assembly plaza where rallies, strikes, and protests physically manifest.
- **District 2: Industrial Foundry Belt**:
  - Heavy steel foundries with smoking stacks, rail freight lines, fuel tanks, and automated container depots.
  - Status dynamically reflects operating rate, worker strikes, or shuttered abandonment.
- **District 3: Workers' Quarter & High-Density Tenements**:
  - Brick residential blocks, corner pharmacies, public clinics, and grocery markets.
  - Street-level citizen density and protest barricades reflect local poverty and dissatisfaction.
- **District 4: Financial Harbor & Commercial Hub**:
  - High-rise banking towers, container cranes, maritime port, and corporate media offices.

### Dynamic 3D Population & Traffic System
- **Pedestrian Crowd Agents**: Instanced procedural 3D citizens walking between residential homes and workplaces, or gathering in the central plaza when striking.
- **Vehicular Traffic**: Procedural cars, freight trucks, and emergency police cruisers traversing road grids and stopping at intersections.
- **Atmospheric Time & Lighting**: Warm directional sunlight with dynamic PCF soft shadows, ambient fill, and subtle city horizon fog.

### Ergonomic UI & Zero Viewport Occlusion
- **Top Telemetry Ribbon**: Date (`Day 14, Month 4, Year 1`), National Treasury ($M), Public Approval (%), Parliamentary Majority (seats), and Play/Pause/Speed controls ($1\times, 2\times, 5\times$).
- **Collapsible Bottom Dock**:
  - *World View*: Quick camera jumps (Parliament, Industrial Belt, Tenements, Harbor) and camera tilt/reset.
  - *Cabinet & Laws*: Proposed legislation (Minimum Wage Bill, Energy Transition Act, Police Powers, Corporate Tax).
  - *Economy & Budget*: National revenue, tax brackets, social safety net spending, inflation, and GDP.
  - *Parliament & Parties*: Faction seat share (Social Democrats, Free Market Liberals, Sovereign Front, Green Party).
  - *Active Crises & Decisions*: Multi-choice crisis cards with immediate/delayed causal impacts.
  - *Inspector Drawer*: Real-time data for the selected building or district.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Three.js WebGL in React vs. External Game Engine
- **Chosen Approach**: Three.js WebGL engine running directly in the existing React/Vite sandbox with procedural geometries and PBR materials.
- **Why**: Keeps the entire application fully playable within the browser workspace with zero install friction or binary platform incompatibilities, while delivering 60 FPS 3D rendering.
- **Alternatives Considered**: Godot/Unity export would break the web runtime constraints and lose seamless integration with the existing React state architecture.

### Decision 2: Procedural 3D Geometry vs. External 3D Models
- **Chosen Approach**: 100% procedural 3D models composed of 3–12 part `THREE.Group` structures (foundries with chimneys, parliament with columns and dome, multi-story tenements with windows and fire escapes) with CanvasTextures and PBR materials.
- **Why**: Guarantees zero 404 network errors, instant loading, complete visual consistency, and direct programmatic control over building states (smoke emissions, deterioration, night windows, protest banners).

### Decision 3: Deterministic Discrete Simulation Clock with Smooth Render Loop
- **Chosen Approach**: Decouple the simulation tick (hourly/daily political updates) from the 60 FPS Three.js rendering frame loop.
- **Why**: Ensures simulation determinism, prevents performance lag from altering economic math, and allows instant speedup ($1\times$ to $5\times$) without physics glitches.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AFTERWORLD 3D APPLICATION                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │     Top Telemetry Ribbon: Treasury · Approval · Majority · Speed │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                THREE.JS INTERACTIVE 3D VIEWPORT                  │  │
│  │                                                                  │  │
│  │  - Procedural 3D City (Parliament, Foundries, Tenements, Docks) │  │
│  │  - Instanced Pedestrians, Traffic Vehicles & Protest Crowds      │  │
│  │  - Raycaster Building Selection & Focus Camera Orbiting          │  │
│  │  - PBR Studio Lighting, Ambient Occlusion & Soft Shadows         │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │      Collapsible Bottom Management Dock (Zero Occlusion)         │  │
│  │  [Cabinet & Laws] [Economy] [Parliament] [Crises] [Inspector]    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      POLITICAL & SOCIETAL ENGINE                       │
│                                                                        │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │  Macro Economy Model  │ ◄─────► │  Societal Strata & Sentiment   │  │
│  │  - Revenue & Budget   │         │  - Industrial Laborers         │  │
│  │  - Inflation & Wages  │         │  - Small Business Owners       │  │
│  │  - Commodity Prices   │         │  - Public Servants & Youth     │  │
│  └───────────┬───────────┘         └────────────────┬───────────────┘  │
│              │                                      │                  │
│              ▼                                      ▼                  │
│  ┌───────────────────────┐         ┌────────────────────────────────┐  │
│  │  Parliamentary System │ ◄─────► │  Dynamic Crisis & Event Loop   │  │
│  │  - 4 Party Factions   │         │  - Multi-Stage Escalation      │  │
│  │  - Coalition Majority │         │  - Strike Assemblies           │  │
│  │  - Legislative Bills  │         │  - Trade-Off Decisions         │  │
│  └───────────┬───────────┘         └────────────────┬───────────────┘  │
│              │                                      │                  │
│              └──────────────────┬───────────────────┘                  │
│                                 ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             DETERMINISTIC SIMULATION CLOCK & SAVES               │  │
│  │    (Daily State Commits · Causal Event Logs · LocalStorage)      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Data Entities
- **BuildingEntity**: `id`, `name`, `district`, `type` (`GOVERNMENT` | `FACTORY` | `RESIDENTIAL` | `COMMERCIAL` | `HOSPITAL` | `PLAZA`), `coords` ($x, y, z$), `jobs`, `occupancy`, `efficiency`, `strikeActive`, `structuralHealth`.
- **PoliticalParty**: `id`, `name`, `ideology`, `seats` (out of 200), `loyaltyToGov` (0..100), `stances` (welfare, taxes, industry, ecology).
- **PopulationClass**: `id`, `name`, `headcount`, `unemploymentRate`, `purchasingPower`, `satisfaction`, `strikePropensity`, `preferredParty`.
- **CrisisEvent**: `id`, `title`, `description`, `districtId`, `buildingId`, `stage` (`RUMOR` | `PETITION` | `STRIKE` | `CLASH`), `options`: list of actionable policy decisions with immediate budget costs and political repercussions.
- **LawPolicy**: `id`, `name`, `category`, `enacted`, `supportInParliament`, `effects` on revenue, satisfaction, and inflation.
