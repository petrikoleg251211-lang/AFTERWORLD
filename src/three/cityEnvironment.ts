/**
 * AFTERWORLD — Procedural City Infrastructure & Environment
 * Builds ground terrain, water basins, and dynamic 32x32 spatial grid tiles.
 */

import * as THREE from 'three';
import { CityMaterials } from './cityMaterials';
import { GridCell } from '../types/cityGrid';
import { CELL_WORLD_SIZE, GRID_SIZE, gridToWorld } from '../engine/cityGridCore';
import { createRoadTileMesh } from './cityBuildableMeshes';

export interface GridTerrainVisuals {
  groundGroup: THREE.Group;
  roadsGroup: THREE.Group;
  zonesGroup: THREE.Group;
  updateRoads: (cells: GridCell[]) => void;
  updateZones: (cells: GridCell[]) => void;
  dispose: () => void;
}

export function buildProceduralGridTerrain(
  scene: THREE.Scene,
  cells: GridCell[],
  materials: CityMaterials
): GridTerrainVisuals {
  const groundGroup = new THREE.Group();
  groundGroup.name = 'grid_terrain_base';

  const roadsGroup = new THREE.Group();
  roadsGroup.name = 'grid_roads';

  const zonesGroup = new THREE.Group();
  zonesGroup.name = 'grid_zones';

  // 1. Overall Base Bed Plane (136x136 meters)
  const mapExtent = GRID_SIZE * CELL_WORLD_SIZE;
  const baseBedGeo = new THREE.PlaneGeometry(mapExtent + 24, mapExtent + 24);
  const baseBed = new THREE.Mesh(baseBedGeo, materials.ground);
  baseBed.rotation.x = -Math.PI / 2;
  baseBed.position.y = -0.1;
  baseBed.receiveShadow = true;
  groundGroup.add(baseBed);

  // 2. High-performance Instanced Mesh for Terrain Cells
  const cellGeo = new THREE.PlaneGeometry(CELL_WORLD_SIZE - 0.08, CELL_WORLD_SIZE - 0.08);
  const cellMat = new THREE.MeshStandardMaterial({
    roughness: 0.9,
    metalness: 0.05
  });

  const instancedTerrain = new THREE.InstancedMesh(cellGeo, cellMat, cells.length);
  instancedTerrain.name = 'instanced_terrain_cells';
  instancedTerrain.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  cells.forEach((cell, idx) => {
    const [wx, , wz] = gridToWorld(cell.x, cell.z);
    dummy.position.set(wx, cell.height, wz);
    dummy.rotation.x = -Math.PI / 2;
    dummy.updateMatrix();
    instancedTerrain.setMatrixAt(idx, dummy.matrix);

    // Terrain coloring
    if (cell.terrain === 'WATER') {
      color.setHex(0x0C4A6E);
    } else if (cell.terrain === 'COAST') {
      color.setHex(0x78716C);
    } else if (cell.terrain === 'FOREST') {
      color.setHex(0x143422);
    } else if (cell.terrain === 'ROCK') {
      color.setHex(0x334155);
    } else {
      // Grass plain with slight subtle coordinate noise
      const tint = ((cell.x + cell.z) % 2 === 0) ? 0x1A281E : 0x16221A;
      color.setHex(tint);
    }
    instancedTerrain.setColorAt(idx, color);
  });

  instancedTerrain.instanceMatrix.needsUpdate = true;
  if (instancedTerrain.instanceColor) instancedTerrain.instanceColor.needsUpdate = true;
  groundGroup.add(instancedTerrain);

  // 3. Subtle Grid Lines Overlay for Tactical Urban Planning
  const gridHelper = new THREE.GridHelper(mapExtent, GRID_SIZE, 0x334155, 0x1E293B);
  gridHelper.position.y = 0.01;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.28;
  groundGroup.add(gridHelper);

  scene.add(groundGroup);
  scene.add(roadsGroup);
  scene.add(zonesGroup);

  // Function to rebuild roads when player places or demolishes roads
  const updateRoads = (updatedCells: GridCell[]) => {
    // Clear old road meshes
    while (roadsGroup.children.length > 0) {
      const child = roadsGroup.children[0];
      roadsGroup.remove(child);
      if (child instanceof THREE.Mesh && child.geometry) child.geometry.dispose();
    }

    // Add updated road meshes
    for (const c of updatedCells) {
      if (c.hasRoad) {
        const roadMesh = createRoadTileMesh(c, materials);
        roadsGroup.add(roadMesh);
      }
    }
  };

  // Function to rebuild zone visual overlays
  const updateZones = (updatedCells: GridCell[]) => {
    while (zonesGroup.children.length > 0) {
      const child = zonesGroup.children[0];
      zonesGroup.remove(child);
      if (child instanceof THREE.Mesh && child.geometry) child.geometry.dispose();
    }

    const zoneMatRes = new THREE.MeshBasicMaterial({ color: 0x22C55E, transparent: true, opacity: 0.25 });
    const zoneMatCom = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.25 });
    const zoneMatInd = new THREE.MeshBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.25 });

    const quadGeo = new THREE.PlaneGeometry(CELL_WORLD_SIZE * 0.9, CELL_WORLD_SIZE * 0.9);

    for (const c of updatedCells) {
      if (c.zone !== 'NONE' && !c.hasRoad && !c.buildingId) {
        const mat = c.zone === 'RESIDENTIAL' ? zoneMatRes : (c.zone === 'COMMERCIAL' ? zoneMatCom : zoneMatInd);
        const zoneMesh = new THREE.Mesh(quadGeo, mat);
        zoneMesh.rotation.x = -Math.PI / 2;
        const [wx, , wz] = gridToWorld(c.x, c.z);
        zoneMesh.position.set(wx, 0.03, wz);
        zonesGroup.add(zoneMesh);
      }
    }
  };

  // Initial population of roads and zones
  updateRoads(cells);
  updateZones(cells);

  return {
    groundGroup,
    roadsGroup,
    zonesGroup,
    updateRoads,
    updateZones,
    dispose: () => {
      scene.remove(groundGroup);
      scene.remove(roadsGroup);
      scene.remove(zonesGroup);
      baseBedGeo.dispose();
      cellGeo.dispose();
      cellMat.dispose();
      gridHelper.dispose();
    }
  };
}

/**
 * Legacy compatibility export if needed.
 */
export function buildCityInfrastructure(scene: THREE.Scene, materials: CityMaterials): void {
  const terrainGeo = new THREE.PlaneGeometry(160, 140);
  const terrain = new THREE.Mesh(terrainGeo, materials.ground);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.05;
  terrain.receiveShadow = true;
  scene.add(terrain);
}
