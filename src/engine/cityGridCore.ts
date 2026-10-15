/**
 * AFTERWORLD — Spatial City Grid Simulation Core
 * Handles 32x32 terrain generation, road graph continuity, utility propagation,
 * autonomous zoned construction, migration waves, and milestone progression.
 */

import { 
  GridCell, 
  CityZonedBuilding, 
  DEVELOPMENT_MILESTONES, 
  DevelopmentMilestone,
  BUILDABLE_CATALOG 
} from '../types/cityGrid';

export const GRID_SIZE = 32;
export const CELL_WORLD_SIZE = 4; // Each grid cell is 4x4 meters in Three.js space

/**
 * Maps grid cell coordinates (0..31) to centered 3D world coordinates.
 */
export function gridToWorld(x: number, z: number): [number, number, number] {
  const worldX = (x - GRID_SIZE / 2 + 0.5) * CELL_WORLD_SIZE;
  const worldZ = (z - GRID_SIZE / 2 + 0.5) * CELL_WORLD_SIZE;
  return [worldX, 0, worldZ];
}

/**
 * Maps 3D world coordinates back to discrete grid cell indices (clamped 0..31).
 */
export function worldToGrid(worldX: number, worldZ: number): [number, number] {
  const gx = Math.floor(worldX / CELL_WORLD_SIZE + GRID_SIZE / 2);
  const gz = Math.floor(worldZ / CELL_WORLD_SIZE + GRID_SIZE / 2);
  return [
    Math.max(0, Math.min(GRID_SIZE - 1, gx)),
    Math.max(0, Math.min(GRID_SIZE - 1, gz))
  ];
}

/**
 * Creates initial pristine 32x32 terrain grid with natural topography and one regional access highway spur.
 */
export function createInitialGrid(): GridCell[] {
  const cells: GridCell[] = [];

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let terrain: GridCell['terrain'] = 'GRASS';
      let height = 0;

      // Natural river and ocean inlet in the south-east
      const distToSE = Math.hypot(x - 28, z - 28);
      const riverCurv = Math.sin(x * 0.2) * 2 + 25;

      if (distToSE < 9 || z > riverCurv) {
        terrain = 'WATER';
        height = -0.4;
      } else if (distToSE < 11 || z > riverCurv - 1.5) {
        terrain = 'COAST';
        height = 0.05;
      } else if (x < 6 && z < 6) {
        terrain = 'FOREST';
        height = 0.1;
      } else if (x > 25 && z < 7) {
        terrain = 'ROCK';
        height = 0.35;
      }

      // Initial Highway Connection: spur road entering from West border (x: 0..4, z: 16)
      const isInitialSpur = z === 16 && x <= 4 && terrain !== 'WATER';

      cells.push({
        x,
        z,
        terrain,
        height,
        hasRoad: isInitialSpur,
        roadType: isInitialSpur ? 'STRAIGHT_X' : 'NONE',
        zone: 'NONE',
        hasPower: isInitialSpur,
        hasWater: isInitialSpur,
        landValue: terrain === 'COAST' ? 65 : 45,
        pollution: 0
      });
    }
  }

  return cells;
}

/**
 * Updates road continuity and junction types (Straight, Corner, T-Junction, Crossroad).
 */
export function updateRoadTypes(cells: GridCell[]): void {
  const getCell = (x: number, z: number) => {
    if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return null;
    return cells[z * GRID_SIZE + x];
  };

  for (const cell of cells) {
    if (!cell.hasRoad) {
      cell.roadType = 'NONE';
      continue;
    }

    const n = getCell(cell.x, cell.z - 1)?.hasRoad ?? false;
    const s = getCell(cell.x, cell.z + 1)?.hasRoad ?? false;
    const w = getCell(cell.x - 1, cell.z)?.hasRoad ?? false;
    const e = getCell(cell.x + 1, cell.z)?.hasRoad ?? false;

    const count = (n ? 1 : 0) + (s ? 1 : 0) + (w ? 1 : 0) + (e ? 1 : 0);

    if (count >= 4) {
      cell.roadType = 'CROSS';
    } else if (count === 3) {
      cell.roadType = 'T_JUNCTION';
    } else if (count === 2) {
      if (n && s) cell.roadType = 'STRAIGHT_Z';
      else if (w && e) cell.roadType = 'STRAIGHT_X';
      else if (n && e) cell.roadType = 'CORNER_NE';
      else if (n && w) cell.roadType = 'CORNER_NW';
      else if (s && e) cell.roadType = 'CORNER_SE';
      else if (s && w) cell.roadType = 'CORNER_SW';
      else cell.roadType = 'STRAIGHT_X';
    } else {
      cell.roadType = n || s ? 'STRAIGHT_Z' : 'STRAIGHT_X';
    }
  }
}

/**
 * Propagate Electrical Power and Municipal Water across the spatial grid.
 */
export function propagateUtilities(
  cells: GridCell[],
  buildings: Record<string, CityZonedBuilding>
): void {
  // 1. Reset utility states
  for (const c of cells) {
    c.hasPower = false;
    c.hasWater = false;
  }

  // 2. Identify active power & water sources
  const powerSources: { x: number; z: number; radius: number }[] = [];
  const waterSources: { x: number; z: number; radius: number }[] = [];

  for (const b of Object.values(buildings)) {
    if (b.isConstructing || b.health <= 10) continue;

    const catalogItem = BUILDABLE_CATALOG.find(i => i.buildingTypeId === b.subType);
    if (!catalogItem) continue;

    if (catalogItem.powerOutput && catalogItem.powerRadius) {
      powerSources.push({ x: b.gridX, z: b.gridZ, radius: catalogItem.powerRadius });
    }
    if (catalogItem.waterOutput && catalogItem.waterRadius) {
      waterSources.push({ x: b.gridX, z: b.gridZ, radius: catalogItem.waterRadius });
    }
  }

  // 3. Radius coverage & road conduit propagation
  for (const c of cells) {
    // Check power
    for (const src of powerSources) {
      const dist = Math.hypot(c.x - src.x, c.z - src.z);
      if (dist <= src.radius) {
        c.hasPower = true;
        break;
      }
    }
    // Check water
    for (const src of waterSources) {
      const dist = Math.hypot(c.x - src.x, c.z - src.z);
      if (dist <= src.radius) {
        c.hasWater = true;
        break;
      }
    }
  }

  // 4. Update building connectivity status
  for (const b of Object.values(buildings)) {
    const rootCell = cells[b.gridZ * GRID_SIZE + b.gridX];
    if (rootCell) {
      b.powerConnected = rootCell.hasPower;
      b.waterConnected = rootCell.hasWater;
      b.roadConnected = hasAdjacentRoad(cells, b.gridX, b.gridZ, b.width, b.depth);
    }
  }
}

/**
 * Checks if a building footprint has at least one adjacent road cell.
 */
export function hasAdjacentRoad(
  cells: GridCell[],
  gx: number,
  gz: number,
  w: number = 1,
  d: number = 1
): boolean {
  for (let z = gz - 1; z <= gz + d; z++) {
    for (let x = gx - 1; x <= gx + w; x++) {
      // Only perimeter cells
      if (x >= gx && x < gx + w && z >= gz && z < gz + d) continue;
      if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) continue;
      if (cells[z * GRID_SIZE + x].hasRoad) return true;
    }
  }
  return false;
}

/**
 * Simulates autonomous private sector construction on zoned land.
 */
export function simulateZonedGrowth(
  cells: GridCell[],
  buildings: Record<string, CityZonedBuilding>,
  demand: { res: number; com: number; ind: number },
  day: number
): { 
  newBuildings: CityZonedBuilding[]; 
  completedBuildings: string[];
  demandUpdate: { res: number; com: number; ind: number };
} {
  const newBuildings: CityZonedBuilding[] = [];
  const completedBuildings: string[] = [];
  const updatedDemand = { ...demand };

  // 1. Advance existing active constructions
  for (const b of Object.values(buildings)) {
    if (b.isConstructing) {
      b.constructionProgress = Math.min(100, b.constructionProgress + 34);
      if (b.constructionProgress >= 100) {
        b.isConstructing = false;
        completedBuildings.push(b.id);
      }
    }
  }

  // 2. Identify candidate zoned parcels ready for private investment
  // Must have road access, power, water, and no building yet
  const candidates = cells.filter(c => 
    c.zone !== 'NONE' &&
    !c.hasRoad &&
    !c.buildingId &&
    c.terrain !== 'WATER' &&
    hasAdjacentRoad(cells, c.x, c.z, 1, 1) &&
    c.hasPower &&
    c.hasWater
  );

  // Shuffle candidate list slightly to avoid uniform directional growth
  candidates.sort(() => Math.random() - 0.5);

  for (const cell of candidates) {
    if (cell.zone === 'RESIDENTIAL' && updatedDemand.res > 20) {
      const bId = `res_${cell.x}_${cell.z}_${day}`;
      const newB: CityZonedBuilding = {
        id: bId,
        name: `Pioneer Homestead #${cell.x}${cell.z}`,
        type: 'RESIDENTIAL',
        subType: 'pioneer_cabin',
        gridX: cell.x,
        gridZ: cell.z,
        width: 1,
        depth: 1,
        level: 1,
        constructionProgress: 0,
        isConstructing: true,
        occupancy: 0,
        maxCapacity: 8,
        jobs: 0,
        health: 100,
        powerConnected: true,
        waterConnected: true,
        roadConnected: true,
        taxYield: 0.008
      };
      buildings[bId] = newB;
      cell.buildingId = bId;
      newBuildings.push(newB);
      updatedDemand.res -= 12;
    } else if (cell.zone === 'COMMERCIAL' && updatedDemand.com > 20) {
      const bId = `com_${cell.x}_${cell.z}_${day}`;
      const newB: CityZonedBuilding = {
        id: bId,
        name: `Frontier Trading Post #${cell.x}${cell.z}`,
        type: 'COMMERCIAL',
        subType: 'general_store',
        gridX: cell.x,
        gridZ: cell.z,
        width: 1,
        depth: 1,
        level: 1,
        constructionProgress: 0,
        isConstructing: true,
        occupancy: 0,
        maxCapacity: 0,
        jobs: 6,
        health: 100,
        powerConnected: true,
        waterConnected: true,
        roadConnected: true,
        taxYield: 0.015
      };
      buildings[bId] = newB;
      cell.buildingId = bId;
      newBuildings.push(newB);
      updatedDemand.com -= 12;
    } else if (cell.zone === 'INDUSTRIAL' && updatedDemand.ind > 20) {
      const bId = `ind_${cell.x}_${cell.z}_${day}`;
      const newB: CityZonedBuilding = {
        id: bId,
        name: `Artisan Workshop #${cell.x}${cell.z}`,
        type: 'INDUSTRIAL',
        subType: 'craft_workshop',
        gridX: cell.x,
        gridZ: cell.z,
        width: 1,
        depth: 1,
        level: 1,
        constructionProgress: 0,
        isConstructing: true,
        occupancy: 0,
        maxCapacity: 0,
        jobs: 12,
        health: 100,
        powerConnected: true,
        waterConnected: true,
        roadConnected: true,
        taxYield: 0.022
      };
      buildings[bId] = newB;
      cell.buildingId = bId;
      newBuildings.push(newB);
      updatedDemand.ind -= 12;
    }
  }

  return { newBuildings, completedBuildings, demandUpdate: updatedDemand };
}

/**
 * Calculates current developmental milestone based on settled population.
 */
export function getCurrentMilestone(population: number): DevelopmentMilestone {
  for (let i = DEVELOPMENT_MILESTONES.length - 1; i >= 0; i--) {
    if (population >= DEVELOPMENT_MILESTONES[i].requiredPopulation) {
      return DEVELOPMENT_MILESTONES[i];
    }
  }
  return DEVELOPMENT_MILESTONES[0];
}

export interface PlacementResult {
  success: boolean;
  reason?: string;
  nextState?: any; // SimulationState
}

/**
 * Executes player building, zoning, road construction, or demolition on the 32x32 spatial grid.
 */
export function placeItemOnGrid(
  prevState: any,
  targetX: number,
  targetZ: number,
  item: any
): PlacementResult {
  const next = JSON.parse(JSON.stringify(prevState));
  if (!next.gridCells) next.gridCells = createInitialGrid();
  if (!next.zonedBuildings) next.zonedBuildings = {};

  const cells: GridCell[] = next.gridCells;
  const getCell = (x: number, z: number) => cells[z * GRID_SIZE + x];
  const rootCell = getCell(targetX, targetZ);

  if (!rootCell) {
    return { success: false, reason: 'Invalid grid coordinate' };
  }

  // 1. DEMOLISH
  if (item.category === 'DEMOLISH') {
    if (rootCell.buildingId && next.zonedBuildings[rootCell.buildingId]) {
      const b: CityZonedBuilding = next.zonedBuildings[rootCell.buildingId];
      // Clear cells
      for (let z = b.gridZ; z < b.gridZ + b.depth; z++) {
        for (let x = b.gridX; x < b.gridX + b.width; x++) {
          const c = getCell(x, z);
          if (c) c.buildingId = undefined;
        }
      }
      delete next.zonedBuildings[b.id];
      propagateUtilities(cells, next.zonedBuildings);
      next.treasury = Number((next.treasury + 0.1).toFixed(2));
      next.historyLog.push({
        day: next.day,
        message: `DEMOLITION: Removed ${b.name}. Reclaimed site footprint.`,
        type: 'POLICY'
      });
      return { success: true, nextState: next };
    }
    if (rootCell.hasRoad) {
      rootCell.hasRoad = false;
      updateRoadTypes(cells);
      propagateUtilities(cells, next.zonedBuildings);
      return { success: true, nextState: next };
    }
    if (rootCell.zone !== 'NONE') {
      rootCell.zone = 'NONE';
      return { success: true, nextState: next };
    }
    return { success: false, reason: 'Nothing to demolish on this parcel' };
  }

  // 2. Check funds
  if (next.treasury < item.cost) {
    return { success: false, reason: `Insufficient treasury: Requires $${item.cost}M` };
  }

  // 3. ROADS
  if (item.category === 'ROAD') {
    if (rootCell.terrain === 'WATER') {
      return { success: false, reason: 'Cannot lay roads directly over deep water' };
    }
    if (rootCell.buildingId) {
      return { success: false, reason: 'Parcel already occupied by a structure' };
    }
    if (rootCell.hasRoad) {
      return { success: false, reason: 'Road already exists here' };
    }

    rootCell.hasRoad = true;
    rootCell.zone = 'NONE';
    updateRoadTypes(cells);
    propagateUtilities(cells, next.zonedBuildings);
    next.treasury = Number((next.treasury - item.cost).toFixed(2));
    return { success: true, nextState: next };
  }

  // 4. ZONING
  if (item.category === 'ZONE') {
    if (rootCell.terrain === 'WATER') {
      return { success: false, reason: 'Cannot zone water basins' };
    }
    if (rootCell.hasRoad) {
      return { success: false, reason: 'Cannot zone directly over transit roadways' };
    }
    if (rootCell.buildingId) {
      return { success: false, reason: 'Parcel already contains an active building' };
    }

    rootCell.zone = item.zoneType || 'NONE';
    next.treasury = Number((next.treasury - item.cost).toFixed(2));
    return { success: true, nextState: next };
  }

  // 5. CIVIC & UTILITIES
  if (item.category === 'CIVIC' || item.category === 'UTILITY') {
    const w = item.width || 1;
    const d = item.depth || 1;

    for (let z = targetZ; z < targetZ + d; z++) {
      for (let x = targetX; x < targetX + w; x++) {
        const c = getCell(x, z);
        if (!c) return { success: false, reason: 'Building extends beyond grid boundary' };
        if (c.terrain === 'WATER') return { success: false, reason: 'Footprint crosses water' };
        if (c.hasRoad) return { success: false, reason: 'Footprint collides with existing roadway' };
        if (c.buildingId) return { success: false, reason: 'Footprint collides with existing building' };
      }
    }

    const bId = `${item.buildingTypeId}_${targetX}_${targetZ}_${Date.now()}`;
    const newBuilding: CityZonedBuilding = {
      id: bId,
      name: `${item.name}`,
      type: item.category,
      subType: item.buildingTypeId || 'civic_structure',
      gridX: targetX,
      gridZ: targetZ,
      width: w,
      depth: d,
      level: 1,
      constructionProgress: 100,
      isConstructing: false,
      occupancy: 0,
      maxCapacity: item.residentialCapacity || 0,
      jobs: item.jobsProvided || 0,
      health: 100,
      powerConnected: true,
      waterConnected: true,
      roadConnected: hasAdjacentRoad(cells, targetX, targetZ, w, d),
      taxYield: 0
    };

    for (let z = targetZ; z < targetZ + d; z++) {
      for (let x = targetX; x < targetX + w; x++) {
        const c = getCell(x, z);
        if (c) {
          c.buildingId = bId;
          c.zone = 'NONE';
        }
      }
    }

    next.zonedBuildings[bId] = newBuilding;
    propagateUtilities(cells, next.zonedBuildings);
    next.treasury = Number((next.treasury - item.cost).toFixed(2));

    next.historyLog.push({
      day: next.day,
      message: `COMMISSIONED: ${item.name} constructed for $${item.cost}M.`,
      type: 'POLICY'
    });

    return { success: true, nextState: next };
  }

  return { success: false, reason: 'Unknown buildable action' };
}
