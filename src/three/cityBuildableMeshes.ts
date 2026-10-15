/**
 * AFTERWORLD — Procedural 3D Buildable & Zoned Building Meshes
 * High-fidelity PBR procedural models for wind turbines, water towers, town hall,
 * clinics, cabins, workshops, roads, and active construction scaffolding.
 */

import * as THREE from 'three';
import { CityZonedBuilding, GridCell } from '../types/cityGrid';
import { CityMaterials } from './cityMaterials';
import { CELL_WORLD_SIZE, gridToWorld } from '../engine/cityGridCore';

/**
 * Creates dynamic 3D road tile with asphalt surface, curbs, and road markings.
 */
export function createRoadTileMesh(cell: GridCell, materials: CityMaterials): THREE.Group {
  const group = new THREE.Group();
  group.name = `road_${cell.x}_${cell.z}`;
  group.userData = { isRoad: true, gridX: cell.x, gridZ: cell.z };

  const [wx, wy, wz] = gridToWorld(cell.x, cell.z);
  group.position.set(wx, wy + 0.02, wz);

  // Main asphalt road slab
  const roadGeo = new THREE.PlaneGeometry(CELL_WORLD_SIZE - 0.1, CELL_WORLD_SIZE - 0.1);
  const roadMesh = new THREE.Mesh(roadGeo, materials.road);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // Yellow center line or crossing dashes
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xFBBF24 });
  if (cell.roadType === 'CROSS' || cell.roadType === 'T_JUNCTION') {
    const crossBox = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), lineMat);
    crossBox.rotation.x = -Math.PI / 2;
    crossBox.position.y = 0.01;
    group.add(crossBox);
  } else if (cell.roadType === 'STRAIGHT_Z') {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.2, CELL_WORLD_SIZE * 0.7), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.01;
    group.add(line);
  } else {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(CELL_WORLD_SIZE * 0.7, 0.2), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.01;
    group.add(line);
  }

  // Sidewalk curb rim
  const curbMat = materials.sidewalk;
  const curbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, CELL_WORLD_SIZE), curbMat);
  curbLeft.position.set(-CELL_WORLD_SIZE / 2 + 0.15, 0.05, 0);
  curbLeft.receiveShadow = true;
  group.add(curbLeft);

  const curbRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, CELL_WORLD_SIZE), curbMat);
  curbRight.position.set(CELL_WORLD_SIZE / 2 - 0.15, 0.05, 0);
  curbRight.receiveShadow = true;
  group.add(curbRight);

  return group;
}

/**
 * Creates 3D procedural mesh for a placed or zoned building.
 */
export function createCityBuildingMesh(
  b: CityZonedBuilding,
  materials: CityMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = `b_${b.id}`;
  group.userData = { buildingId: b.id, gridX: b.gridX, gridZ: b.gridZ };

  const [wx, , wz] = gridToWorld(b.gridX, b.gridZ);
  // Center if larger than 1x1
  const offsetX = ((b.width - 1) * CELL_WORLD_SIZE) / 2;
  const offsetZ = ((b.depth - 1) * CELL_WORLD_SIZE) / 2;
  group.position.set(wx + offsetX, 0, wz + offsetZ);

  // If currently under construction, wrap in active scaffolding with crane
  if (b.isConstructing) {
    const scaffoldGroup = buildScaffolding(b.width, b.depth);
    group.add(scaffoldGroup);
    return group;
  }

  switch (b.subType) {
    // 1. WIND TURBINE
    case 'generator_wind': {
      // Base
      const baseGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.5, 12);
      const base = new THREE.Mesh(baseGeo, materials.concreteMinistry);
      base.position.y = 0.25;
      base.castShadow = true;
      group.add(base);

      // Tower
      const towerGeo = new THREE.CylinderGeometry(0.25, 0.5, 9, 12);
      const tower = new THREE.Mesh(towerGeo, materials.stoneParliament);
      tower.position.y = 4.75;
      tower.castShadow = true;
      group.add(tower);

      // Nacelle
      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.6), materials.concreteMinistry);
      nacelle.position.set(0, 9.3, 0);
      nacelle.castShadow = true;
      group.add(nacelle);

      // Rotating Rotor Hub & Blades
      const rotorGroup = new THREE.Group();
      rotorGroup.name = 'turbine_rotor';
      rotorGroup.position.set(0, 9.3, 0.9);

      const hub = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 8), materials.roofDark);
      hub.rotation.x = Math.PI / 2;
      rotorGroup.add(hub);

      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.2, 0.05), materials.stoneParliament);
        blade.position.set(Math.sin(angle) * 2.1, Math.cos(angle) * 2.1, 0);
        blade.rotation.z = -angle;
        rotorGroup.add(blade);
      }
      group.add(rotorGroup);
      break;
    }

    // 2. WATER TOWER
    case 'water_tower': {
      // 4 Steel Legs
      const legMat = materials.roofDark;
      for (const lx of [-1.2, 1.2]) {
        for (const lz of [-1.2, 1.2]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 7.5, 6), legMat);
          leg.position.set(lx, 3.75, lz);
          leg.castShadow = true;
          group.add(leg);
        }
      }
      // Reservoir Tank
      const tankGeo = new THREE.CylinderGeometry(2.1, 2.1, 2.8, 16);
      const tank = new THREE.Mesh(tankGeo, materials.glassSkyscraper);
      tank.position.y = 8.5;
      tank.castShadow = true;
      group.add(tank);

      // Conical Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.2, 16), materials.roofDark);
      roof.position.y = 10.5;
      group.add(roof);
      break;
    }

    // 3. MUNICIPAL WATER WELL
    case 'water_well': {
      const stoneMat = materials.concreteMinistry;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.8, 12, 1, true), stoneMat);
      ring.position.y = 0.4;
      group.add(ring);

      const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 0.15), materials.roofDark);
      post1.position.set(-0.8, 0.9, 0);
      group.add(post1);

      const post2 = post1.clone();
      post2.position.set(0.8, 0.9, 0);
      group.add(post2);

      const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), materials.roofDark);
      wellRoof.position.y = 2.0;
      wellRoof.rotation.y = Math.PI / 4;
      group.add(wellRoof);
      break;
    }

    // 4. TOWN HALL (Founding Assembly)
    case 'town_hall': {
      // Podium
      const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 7), materials.concreteMinistry);
      base.position.y = 0.4;
      base.castShadow = true;
      group.add(base);

      // Main Hall
      const hall = new THREE.Mesh(new THREE.BoxGeometry(5.8, 4.2, 5.5), materials.stoneParliament);
      hall.position.y = 2.9;
      hall.castShadow = true;
      group.add(hall);

      // Portico Columns
      for (let i = 0; i < 4; i++) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 3.8, 8), materials.stoneParliament);
        col.position.set(-2 + i * 1.33, 2.7, 2.9);
        col.castShadow = true;
        group.add(col);
      }

      // Triangular Pediment
      const pediment = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.5, 4), materials.stoneParliament);
      pediment.rotation.y = Math.PI / 4;
      pediment.position.set(0, 5.4, 1.5);
      pediment.scale.set(1.4, 1, 0.8);
      group.add(pediment);

      // Clock / Cupola Tower
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 1.6), materials.concreteMinistry);
      tower.position.set(0, 6.2, -0.5);
      group.add(tower);

      // Golden Bell Dome
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), materials.domeGold);
      dome.position.set(0, 7.6, -0.5);
      group.add(dome);
      break;
    }

    // 5. FRONTIER MEDICAL CLINIC
    case 'clinic': {
      const clinicBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.8, 3.4), materials.stoneParliament);
      clinicBody.position.y = 1.4;
      clinicBody.castShadow = true;
      group.add(clinicBody);

      // Red Medical Cross on front
      const crossMat = materials.protestBanner;
      const barV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.05), crossMat);
      barV.position.set(0, 2.0, 1.73);
      group.add(barV);

      const barH = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.05), crossMat);
      barH.position.set(0, 2.0, 1.73);
      group.add(barH);
      break;
    }

    // 6. FRONTIER CONSTABULARY (Police Post)
    case 'police_post': {
      const station = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 3.2), materials.brickTenement);
      station.position.y = 1.5;
      station.castShadow = true;
      group.add(station);

      // Blue beacon
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8), beaconMat);
      beacon.position.set(0, 3.2, 0);
      group.add(beacon);
      break;
    }

    // 7. PUBLIC COMMONS PARK
    case 'civic_park': {
      // Grass patch
      const grass = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 3.8), materials.foliage);
      grass.position.y = 0.07;
      group.add(grass);

      // Procedural trees
      for (const [tx, tz, h] of [[-1, -1, 2.2], [1, 1, 2.6], [-0.8, 1.1, 1.9]]) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.9, 6), materials.roofDark);
        trunk.position.set(tx, 0.45, tz);
        group.add(trunk);

        const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.7, h, 6), materials.foliage);
        leaves.position.set(tx, 0.9 + h / 2, tz);
        leaves.castShadow = true;
        group.add(leaves);
      }
      break;
    }

    // 8. RESIDENTIAL PIONEER CABIN
    case 'pioneer_cabin':
    default: {
      if (b.type === 'COMMERCIAL') {
        // Commercial Storefront
        const shop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 3.2), materials.brickTenement);
        shop.position.y = 1.3;
        shop.castShadow = true;
        group.add(shop);

        // Striped Awning
        const awning = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 0.9), materials.domeGold);
        awning.position.set(0, 1.8, 1.7);
        awning.rotation.x = 0.25;
        group.add(awning);
      } else if (b.type === 'INDUSTRIAL') {
        // Industrial Workshop & Chimney
        const shed = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 3.4), materials.ironFoundry);
        shed.position.y = 1.2;
        shed.castShadow = true;
        group.add(shed);

        // Smokestack
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.8, 8), materials.ironFoundry);
        stack.position.set(1.0, 3.0, -1.0);
        stack.castShadow = true;
        group.add(stack);
      } else {
        // Residential Cabin / Home
        const walls = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.0, 2.8), materials.brickTenement);
        walls.position.y = 1.0;
        walls.castShadow = true;
        group.add(walls);

        // Pitched Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.3, 4), materials.roofDark);
        roof.position.y = 2.65;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Brick Chimney
        const chim = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), materials.concreteMinistry);
        chim.position.set(0.8, 2.8, 0.6);
        group.add(chim);
      }
      break;
    }
  }

  return group;
}

/**
 * Builds yellow/steel construction scaffolding with a miniature crane.
 */
function buildScaffolding(width: number, depth: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'scaffolding';

  const w = width * CELL_WORLD_SIZE * 0.85;
  const d = depth * CELL_WORLD_SIZE * 0.85;
  const h = 3.5;

  // Yellow construction lattice material
  const scaffoldMat = new THREE.MeshStandardMaterial({
    color: 0xEAB308,
    metalness: 0.6,
    roughness: 0.4,
    wireframe: true
  });

  const boxGeo = new THREE.BoxGeometry(w, h, d);
  const scaffold = new THREE.Mesh(boxGeo, scaffoldMat);
  scaffold.position.y = h / 2;
  group.add(scaffold);

  // Construction tower crane
  const craneMat = new THREE.MeshStandardMaterial({ color: 0xF97316, metalness: 0.8, roughness: 0.3 });
  const craneTower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.5, 6), craneMat);
  craneTower.position.set(w * 0.35, 2.75, d * 0.35);
  group.add(craneTower);

  const craneJib = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 0.12), craneMat);
  craneJib.position.set(w * 0.35 - 0.8, 5.5, d * 0.35);
  group.add(craneJib);

  return group;
}
