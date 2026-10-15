/**
 * AFTERWORLD — Atmospheric Lighting, Smog Particles & Studio Rig
 * Balanced 3-point lighting, procedural studio reflection environment, and industrial smoke physics.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface CityAtmosphere {
  dirLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  smokeParticles: THREE.Points;
  updateSmoke: (delta: number, isStriking: boolean, elapsedTime: number) => void;
  dispose: () => void;
}

export function setupCityAtmosphere(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): CityAtmosphere {
  // 1. Horizon Fog
  scene.background = new THREE.Color(0x070A10);
  scene.fog = new THREE.FogExp2(0x070A10, 0.007);

  // 2. Procedural Studio Reflection (RoomEnvironment)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  pmremGenerator.dispose();

  // 3. Lighting Rig (Warm Key + Cool Hemisphere Fill)
  const hemiLight = new THREE.HemisphereLight(0xBAE6FD, 0x1E293B, 0.9);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xFFF7ED, 1.9);
  dirLight.position.set(45, 65, 35);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 160;
  const d = 55;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0004;
  scene.add(dirLight);

  // 4. Industrial Smog Particles (Twin Foundry Stacks at -35, 12, -12)
  const smokeCount = 70;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePos = new Float32Array(smokeCount * 3);
  for (let i = 0; i < smokeCount; i++) {
    smokePos[i * 3 + 0] = -35 + (Math.random() - 0.5) * 2;
    smokePos[i * 3 + 1] = 12 + Math.random() * 14;
    smokePos[i * 3 + 2] = -12 + (Math.random() - 0.5) * 2;
  }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0x64748B,
    size: 1.8,
    transparent: true,
    opacity: 0.45
  });
  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  scene.add(smokeParticles);

  return {
    dirLight,
    hemiLight,
    smokeParticles,
    updateSmoke(delta: number, isStriking: boolean, elapsedTime: number) {
      const positions = smokeParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < smokeCount; i++) {
        positions[i * 3 + 1] += (isStriking ? 0.8 : 3.5) * delta;
        positions[i * 3 + 0] += Math.sin(elapsedTime + i) * 0.4 * delta;
        if (positions[i * 3 + 1] > 26) {
          positions[i * 3 + 1] = 11;
          positions[i * 3 + 0] = -35 + (Math.random() - 0.5) * 1.5;
        }
      }
      smokeParticles.geometry.attributes.position.needsUpdate = true;
    },
    dispose() {
      envTexture.dispose();
      smokeGeo.dispose();
      smokeMat.dispose();
    }
  };
}
