/**
 * AFTERWORLD — Procedural Architectural Buildings (Composite 3–12 Part Models)
 * Assembles neoclassical Parliament, twin-furnace industrial foundries,
 * brick tenements, high-rise banking towers, hospitals, and monumental plazas.
 */

import * as THREE from 'three';
import { BuildingEntity } from '../types/politicalSimulation';
import { CityMaterials } from './cityMaterials';

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
  // 6. DEFAULT CIVIC / DOCKS / HOSPITALS
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
