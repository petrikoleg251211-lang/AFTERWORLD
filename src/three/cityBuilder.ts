/**
 * AFTERWORLD — Procedural 3D City Architecture & Procedural Models
 * Assembles composite 3–12 part architectural groups, roads, vehicles, and crowds.
 */

import * as THREE from 'three';
import { BuildingEntity, District } from '../types/politicalSimulation';

// Cache procedural materials for high performance and zero memory leaks
export interface CityMaterials {
  ground: THREE.MeshStandardMaterial;
  road: THREE.MeshStandardMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  stoneParliament: THREE.MeshStandardMaterial;
  domeGold: THREE.MeshStandardMaterial;
  brickTenement: THREE.MeshStandardMaterial;
  concreteMinistry: THREE.MeshStandardMaterial;
  ironFoundry: THREE.MeshStandardMaterial;
  glassSkyscraper: THREE.MeshStandardMaterial;
  roofDark: THREE.MeshStandardMaterial;
  protestBanner: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  pedestrian: THREE.MeshStandardMaterial;
  protester: THREE.MeshStandardMaterial;
  carBody: THREE.MeshStandardMaterial;
  carWindow: THREE.MeshStandardMaterial;
}

export function createCityMaterials(): CityMaterials {
  return {
    ground: new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.95,
      metalness: 0.05
    }),
    road: new THREE.MeshStandardMaterial({
      color: 0x1E2430,
      roughness: 0.85,
      metalness: 0.1
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.1
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0C4A6E,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88
    }),
    stoneParliament: new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.7,
      metalness: 0.1
    }),
    domeGold: new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.25,
      metalness: 0.85
    }),
    brickTenement: new THREE.MeshStandardMaterial({
      color: 0x88382C,
      roughness: 0.85,
      metalness: 0.05
    }),
    concreteMinistry: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.75,
      metalness: 0.15
    }),
    ironFoundry: new THREE.MeshStandardMaterial({
      color: 0x272B33,
      roughness: 0.7,
      metalness: 0.6
    }),
    glassSkyscraper: new THREE.MeshStandardMaterial({
      color: 0x0284C7,
      roughness: 0.15,
      metalness: 0.75
    }),
    roofDark: new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.9,
      metalness: 0.1
    }),
    protestBanner: new THREE.MeshStandardMaterial({
      color: 0xEF4444,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x15803D,
      roughness: 0.9,
      metalness: 0.0
    }),
    pedestrian: new THREE.MeshStandardMaterial({
      color: 0x94A3B8,
      roughness: 0.6,
      metalness: 0.1
    }),
    protester: new THREE.MeshStandardMaterial({
      color: 0xF87171,
      roughness: 0.6,
      metalness: 0.1
    }),
    carBody: new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.3,
      metalness: 0.5
    }),
    carWindow: new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.1,
      metalness: 0.9
    })
  };
}

/**
 * Procedural Building Mesh Generator (Composite 3–12 part THREE.Group)
 */
export function buildProceduralBuilding(
  b: BuildingEntity,
  materials: CityMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = b.id;
  group.userData = { buildingId: b.id };

  const [px, py, pz] = b.position;
  const [sx, sy, sz] = b.dimensions;

  // 1. PARLIAMENT HOUSE (Neoclassical portico, columns, grand dome)
  if (b.type === 'PARLIAMENT') {
    // Podium / Base
    const baseGeo = new THREE.BoxGeometry(sx, 1.2, sz);
    const base = new THREE.Mesh(baseGeo, materials.stoneParliament);
    base.position.y = 0.6;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Main Hall Block
    const hallGeo = new THREE.BoxGeometry(sx * 0.85, sy * 0.7, sz * 0.75);
    const hall = new THREE.Mesh(hallGeo, materials.stoneParliament);
    hall.position.y = 1.2 + (sy * 0.7) / 2;
    hall.castShadow = true;
    hall.receiveShadow = true;
    group.add(hall);

    // Neoclassical Columns
    const colCount = 6;
    for (let i = 0; i < colCount; i++) {
      const colX = -sx * 0.35 + (i / (colCount - 1)) * (sx * 0.7);
      const colGeo = new THREE.CylinderGeometry(0.3, 0.35, sy * 0.65, 8);
      const col = new THREE.Mesh(colGeo, materials.stoneParliament);
      col.position.set(colX, 1.2 + (sy * 0.65) / 2, sz * 0.42);
      col.castShadow = true;
      group.add(col);
    }

    // Pediment Triangle
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-sx * 0.4, 0);
    pedimentShape.lineTo(0, 2.5);
    pedimentShape.lineTo(sx * 0.4, 0);
    pedimentShape.closePath();
    const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, { depth: 1.5, bevelEnabled: false });
    const pediment = new THREE.Mesh(pedimentGeo, materials.stoneParliament);
    pediment.rotation.x = Math.PI / 2;
    pediment.position.set(0, 1.2 + sy * 0.65, sz * 0.45);
    group.add(pediment);

    // Central Rotunda & Gold Dome
    const drumGeo = new THREE.CylinderGeometry(sx * 0.22, sx * 0.22, 2.5, 16);
    const drum = new THREE.Mesh(drumGeo, materials.stoneParliament);
    drum.position.y = 1.2 + sy * 0.7 + 1.25;
    group.add(drum);

    const domeGeo = new THREE.SphereGeometry(sx * 0.23, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, materials.domeGold);
    dome.position.y = 1.2 + sy * 0.7 + 2.5;
    dome.castShadow = true;
    group.add(dome);
  }
  // 2. INDUSTRIAL FOUNDRY (Blast furnaces, twin smokestacks, corrugated shed)
  else if (b.type === 'FOUNDRY') {
    // Factory Base Shed
    const shedGeo = new THREE.BoxGeometry(sx, sy * 0.65, sz);
    const shed = new THREE.Mesh(shedGeo, materials.ironFoundry);
    shed.position.y = (sy * 0.65) / 2;
    shed.castShadow = true;
    shed.receiveShadow = true;
    group.add(shed);

    // Sloped Roof
    const roofGeo = new THREE.ConeGeometry(sx * 0.55, 2.2, 4);
    const roof = new THREE.Mesh(roofGeo, materials.roofDark);
    roof.position.y = sy * 0.65 + 1.1;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Twin High Industrial Smokestacks
    for (const offset of [-sx * 0.28, sx * 0.28]) {
      const stackGeo = new THREE.CylinderGeometry(0.7, 1.1, sy * 0.8, 12);
      const stack = new THREE.Mesh(stackGeo, materials.ironFoundry);
      stack.position.set(offset, sy * 0.65 + (sy * 0.8) / 2, -sz * 0.2);
      stack.castShadow = true;
      group.add(stack);

      // Top Ring
      const ringGeo = new THREE.TorusGeometry(0.8, 0.15, 6, 12);
      const ring = new THREE.Mesh(ringGeo, materials.domeGold);
      ring.position.set(offset, sy * 0.65 + sy * 0.8, -sz * 0.2);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    }

    // Strike picket barricade
    const barricadeGeo = new THREE.BoxGeometry(sx * 0.8, 1.2, 0.4);
    const barricade = new THREE.Mesh(barricadeGeo, materials.protestBanner);
    barricade.position.set(0, 0.6, sz * 0.55);
    barricade.name = 'strike_barricade';
    barricade.visible = b.operatingStatus === 'ON_STRIKE';
    group.add(barricade);
  }
  // 3. RESIDENTIAL TENEMENTS (Multi-level brick facade with roof terraces)
  else if (b.type === 'TENEMENT') {
    // Main Brick Tenement
    const tenementGeo = new THREE.BoxGeometry(sx, sy, sz);
    const tenement = new THREE.Mesh(tenementGeo, materials.brickTenement);
    tenement.position.y = sy / 2;
    tenement.castShadow = true;
    tenement.receiveShadow = true;
    group.add(tenement);

    // Roof Parapet Wall
    const parapetGeo = new THREE.BoxGeometry(sx * 1.02, 0.8, sz * 1.02);
    const parapet = new THREE.Mesh(parapetGeo, materials.roofDark);
    parapet.position.y = sy + 0.4;
    group.add(parapet);

    // Entrance Portico
    const porticoGeo = new THREE.BoxGeometry(3, 2.5, 1.5);
    const portico = new THREE.Mesh(porticoGeo, materials.stoneParliament);
    portico.position.set(0, 1.25, sz / 2 + 0.7);
    group.add(portico);
  }
  // 4. COMMERCIAL BANK / SKYSCRAPER
  else if (b.type === 'BANK') {
    // Glass High-Rise Tower
    const towerGeo = new THREE.BoxGeometry(sx, sy, sz);
    const tower = new THREE.Mesh(towerGeo, materials.glassSkyscraper);
    tower.position.y = sy / 2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Spire Antenna
    const spireGeo = new THREE.CylinderGeometry(0.1, 0.3, 5, 8);
    const spire = new THREE.Mesh(spireGeo, materials.domeGold);
    spire.position.y = sy + 2.5;
    group.add(spire);
  }
  // 5. PUBLIC PLAZA
  else if (b.type === 'PLAZA') {
    const plazaTile = new THREE.BoxGeometry(sx, 0.3, sz);
    const plaza = new THREE.Mesh(plazaTile, materials.sidewalk);
    plaza.position.y = 0.15;
    plaza.receiveShadow = true;
    group.add(plaza);

    // Central Monument Obelisk
    const obeliskGeo = new THREE.CylinderGeometry(0.3, 0.8, 6, 4);
    const obelisk = new THREE.Mesh(obeliskGeo, materials.stoneParliament);
    obelisk.position.y = 3;
    obelisk.castShadow = true;
    group.add(obelisk);
  }
  // 6. DEFAULT CIVIC / DOCKS
  else {
    const boxGeo = new THREE.BoxGeometry(sx, sy, sz);
    const box = new THREE.Mesh(
      boxGeo,
      b.type === 'DOCKS' ? materials.ironFoundry : materials.concreteMinistry
    );
    box.position.y = sy / 2;
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);
  }

  group.position.set(px, py, pz);
  return group;
}

/**
 * Creates Ground Grid & Road Network
 */
export function buildCityInfrastructure(scene: THREE.Scene, materials: CityMaterials): void {
  // 1. Terrain Ground Base
  const terrainGeo = new THREE.PlaneGeometry(160, 140);
  const terrain = new THREE.Mesh(terrainGeo, materials.ground);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.05;
  terrain.receiveShadow = true;
  scene.add(terrain);

  // 2. Marina Ocean Bay (South-East quadrant)
  const oceanGeo = new THREE.PlaneGeometry(60, 50);
  const ocean = new THREE.Mesh(oceanGeo, materials.water);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(45, 0.05, -35);
  ocean.receiveShadow = true;
  scene.add(ocean);

  // 3. Intersecting City Road Avenues
  const mainAvenueGeo = new THREE.PlaneGeometry(14, 130);
  const mainAvenue = new THREE.Mesh(mainAvenueGeo, materials.road);
  mainAvenue.rotation.x = -Math.PI / 2;
  mainAvenue.position.set(0, 0.02, 0);
  mainAvenue.receiveShadow = true;
  scene.add(mainAvenue);

  const crossAvenueGeo = new THREE.PlaneGeometry(150, 12);
  const crossAvenue = new THREE.Mesh(crossAvenueGeo, materials.road);
  crossAvenue.rotation.x = -Math.PI / 2;
  crossAvenue.position.set(0, 0.03, 0);
  crossAvenue.receiveShadow = true;
  scene.add(crossAvenue);

  // Secondary industrial road loop
  const indusRoadGeo = new THREE.PlaneGeometry(10, 80);
  const indusRoad = new THREE.Mesh(indusRoadGeo, materials.road);
  indusRoad.rotation.x = -Math.PI / 2;
  indusRoad.position.set(-35, 0.02, 0);
  scene.add(indusRoad);

  // Secondary residential road
  const resRoadGeo = new THREE.PlaneGeometry(10, 70);
  const resRoad = new THREE.Mesh(resRoadGeo, materials.road);
  resRoad.rotation.x = -Math.PI / 2;
  resRoad.position.set(30, 0.02, 25);
  scene.add(resRoad);
}

/**
 * Animated Traffic & Crowd Systems
 */
export interface AnimatedAgentSystem {
  cars: { mesh: THREE.Group; speed: number; axis: 'x' | 'z'; min: number; max: number }[];
  pedestrians: THREE.InstancedMesh;
  protestCrowd: THREE.InstancedMesh;
  update: (delta: number, isProtesting: boolean) => void;
}

export function createAgentSystems(
  scene: THREE.Scene,
  materials: CityMaterials
): AnimatedAgentSystem {
  // --- A. VEHICULAR TRAFFIC ---
  const cars: AnimatedAgentSystem['cars'] = [];
  const carColors = [0xF59E0B, 0x38BDF8, 0xEF4444, 0xE2E8F0, 0x10B981];

  for (let i = 0; i < 8; i++) {
    const carGroup = new THREE.Group();

    // Body
    const bodyMat = materials.carBody.clone();
    bodyMat.color.setHex(carColors[i % carColors.length]);
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.2), bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    carGroup.add(body);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 1.05), materials.carWindow);
    cabin.position.set(-0.2, 1.0, 0);
    carGroup.add(cabin);

    // Wheels
    for (const wx of [-0.7, 0.7]) {
      for (const wz of [-0.65, 0.65]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8),
          materials.roofDark
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.3, wz);
        carGroup.add(wheel);
      }
    }

    const isNorthSouth = i % 2 === 0;
    if (isNorthSouth) {
      carGroup.position.set(3.5, 0, -50 + i * 15);
      carGroup.rotation.y = Math.PI;
      cars.push({ mesh: carGroup, speed: 12 + Math.random() * 6, axis: 'z', min: -55, max: 55 });
    } else {
      carGroup.position.set(-60 + i * 16, 0, -3.5);
      carGroup.rotation.y = -Math.PI / 2;
      cars.push({ mesh: carGroup, speed: 14 + Math.random() * 5, axis: 'x', min: -65, max: 65 });
    }

    scene.add(carGroup);
  }

  // --- B. INSTANCED PEDESTRIANS ON SIDEWALKS ---
  const pedCount = 60;
  const pedGeo = new THREE.CapsuleGeometry(0.25, 0.7, 4, 8);
  const pedestrians = new THREE.InstancedMesh(pedGeo, materials.pedestrian, pedCount);
  pedestrians.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();
  const pedData: { x: number; z: number; vx: number; vz: number }[] = [];

  for (let i = 0; i < pedCount; i++) {
    const x = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 45;
    dummy.position.set(x, 0.6, z);
    dummy.updateMatrix();
    pedestrians.setMatrixAt(i, dummy.matrix);
    pedData.push({
      x,
      z,
      vx: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 1.5
    });
  }
  pedestrians.castShadow = true;
  scene.add(pedestrians);

  // --- C. PROTEST CROWD IN INDEPENDENCE PLAZA ---
  const crowdCount = 120;
  const protestCrowd = new THREE.InstancedMesh(pedGeo, materials.protester, crowdCount);
  protestCrowd.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  for (let i = 0; i < crowdCount; i++) {
    // Cluster in Independence Plaza around (0, 0, 8)
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 6.5;
    const cx = Math.cos(angle) * dist;
    const cz = 8 + Math.sin(angle) * dist * 0.75;

    dummy.position.set(cx, 0.6, cz);
    dummy.scale.set(1, 0.9 + Math.random() * 0.2, 1);
    dummy.updateMatrix();
    protestCrowd.setMatrixAt(i, dummy.matrix);
  }
  protestCrowd.castShadow = true;
  scene.add(protestCrowd);

  return {
    cars,
    pedestrians,
    protestCrowd,
    update(delta: number, isProtesting: boolean) {
      // 1. Update Cars
      for (const car of cars) {
        if (car.axis === 'z') {
          car.mesh.position.z += car.speed * delta;
          if (car.mesh.position.z > car.max) car.mesh.position.z = car.min;
        } else {
          car.mesh.position.x += car.speed * delta;
          if (car.mesh.position.x > car.max) car.mesh.position.x = car.min;
        }
      }

      // 2. Update Pedestrians
      for (let i = 0; i < pedCount; i++) {
        const p = pedData[i];
        p.x += p.vx * delta;
        p.z += p.vz * delta;
        if (p.x > 35 || p.x < -35) p.vx *= -1;
        if (p.z > 35 || p.z < -35) p.vz *= -1;

        dummy.position.set(p.x, 0.6, p.z);
        dummy.updateMatrix();
        pedestrians.setMatrixAt(i, dummy.matrix);
      }
      pedestrians.instanceMatrix.needsUpdate = true;

      // 3. Update Protest Crowd (visible and animated when strikes/protests are active)
      protestCrowd.visible = isProtesting;
      if (isProtesting) {
        const time = Date.now() * 0.005;
        for (let i = 0; i < crowdCount; i++) {
          protestCrowd.getMatrixAt(i, dummy.matrix);
          dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
          dummy.position.y = 0.6 + Math.abs(Math.sin(time + i)) * 0.15; // Jumps and chants
          dummy.updateMatrix();
          protestCrowd.setMatrixAt(i, dummy.matrix);
        }
        protestCrowd.instanceMatrix.needsUpdate = true;
      }
    }
  };
}
