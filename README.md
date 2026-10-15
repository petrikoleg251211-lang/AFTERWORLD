# AFTERWORLD — 3D Living Political & Societal Simulation

AFTERWORLD is a real-time 3D political, economic, and societal simulation where you govern a sovereign republic while directly observing its cities, districts, buildings, streets, traffic, population, and emerging crises in an interactive Three.js WebGL viewport.

---

## 🏛️ Simulation Core Pillars

1. **Deterministic Macroeconomic Engine (`politicalCore.ts`)**:
   - Gross Domestic Product (GDP), inflation dynamics, and national treasury liquidity.
   - Tripartite tax policy: Corporate tax, Personal Income tax, and VAT consumption tax.
   - Discretionary budget allocation: Social welfare & unemployment relief, civil policing & order, public healthcare & hospitals, industrial subsidies.
   - Enacted parliamentary laws automatically impact daily treasury flows and social sentiment.

2. **Parliamentary Dynamics & Class Factions**:
   - 200-seat sovereign parliament with multi-party coalitions (Social Democrats, Free Market Coalition, Sovereign National Front, Green Ecology Alliance).
   - Societal classes: Industrial laborers, public servants/middle class, commercial business owners, and youth/students.
   - Coalition stability tracking: Falling labor sentiment triggers political walkouts and government collapses.

3. **Emergent Crises & Causal Auditing**:
   - Wildcat foundry strikes, bread price inflation riots, and maritime chemical spills.
   - Non-linear event escalation and branching choices with immediate economic and social consequences.
   - Transparent causal records (`causalRecords`) tracking exact root causes and parameter deltas.

4. **Real-Time 3D City Viewport (`/src/three/`)**:
   - Modular Three.js architecture (`cityBuildings.ts`, `cityEnvironment.ts`, `cityMaterials.ts`, `cityTextures.ts`, `cityAgents.ts`, `atmosphere.ts`).
   - Procedural studio environment map (`RoomEnvironment` + `PMREMGenerator`) with PBR materials.
   - Procedural canvas road textures with lane markings, brick textures, and illuminated office window grids.
   - Instanced crowds, vehicular traffic loops, and picketing animations.
   - Pre-allocated zero-GC raycaster for building diagnostics.

5. **Macro Regional Supply Lab (`RegionalLabModal.tsx`)**:
   - Inter-regional commodity flows, electricity transmission grids, and raw mineral supply chains across the Republic's 4 macro-regions (Capital Metro, Agro Plains, Mineral Highlands, Maritime Port).

---

## 🛠️ Technology Stack

- **Frontend & UI**: React 19 SPA, Vite 8, TypeScript 7, Tailwind CSS v4.
- **3D Graphics**: Three.js r186 (PBR standard materials, ACES Filmic tone mapping, PCF soft shadow maps).
- **Icons**: Lucide React.
- **Persistence**: HTML5 `localStorage` state serialization and checkpoint restores.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript typecheck
npm run lint

# Build production bundle
npm run build
```
