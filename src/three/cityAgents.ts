/**
 * AFTERWORLD — Animated Vehicles, Pedestrians & Protest Crowds
 * Instanced crowd agents, traffic loops, and picketing animations.
 */

import * as THREE from 'three';
import { CityMaterials } from './cityMaterials';

export interface AnimatedAgentSystem {
  cars: { mesh: THREE.Group; speed: number; axis: 'x' | 'z'; min: number; max: number }[];
  pedestrians: THREE.InstancedMesh;
  protestCrowd: THREE.InstancedMesh;
  update: (delta: number, isProtesting: boolean) => void;
  dispose: () => void;
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
    },
    dispose() {
      pedGeo.dispose();
      pedestrians.dispose();
      protestCrowd.dispose();
      cars.forEach(car => {
        car.mesh.traverse(obj => {
          if (obj instanceof THREE.Mesh && obj.geometry) {
            obj.geometry.dispose();
          }
        });
      });
    }
  };
}
