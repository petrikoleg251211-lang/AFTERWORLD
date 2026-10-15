/**
 * AFTERWORLD — Procedural PBR City Materials Library
 * Cached high-performance materials with procedural textures and zero memory leaks.
 */

import * as THREE from 'three';
import { createRoadTexture, createWindowGridTexture, createBrickTexture } from './cityTextures';

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
  dispose: () => void;
}

export function createCityMaterials(): CityMaterials {
  const roadTex = createRoadTexture();
  const windowTex = createWindowGridTexture();
  const brickTex = createBrickTexture();

  const materials = {
    ground: new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.95,
      metalness: 0.05
    }),
    road: new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.8,
      metalness: 0.15
    }),
    sidewalk: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.1
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0C4A6E,
      roughness: 0.15,
      metalness: 0.65,
      transparent: true,
      opacity: 0.88
    }),
    stoneParliament: new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.65,
      metalness: 0.1
    }),
    domeGold: new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.22,
      metalness: 0.88
    }),
    brickTenement: new THREE.MeshStandardMaterial({
      map: brickTex,
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
      metalness: 0.65
    }),
    glassSkyscraper: new THREE.MeshStandardMaterial({
      map: windowTex,
      color: 0x38BDF8,
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
      metalness: 0.55
    }),
    carWindow: new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.1,
      metalness: 0.9
    })
  };

  return {
    ...materials,
    dispose() {
      roadTex.dispose();
      windowTex.dispose();
      brickTex.dispose();
      Object.entries(materials).forEach(([_, mat]) => {
        if (mat instanceof THREE.Material) {
          mat.dispose();
        }
      });
    }
  };
}
