/**
 * AFTERWORLD — Interactive 3D WebGL City Viewport
 * Real-time controllable tactical isometric camera, raycasting selection, and animated simulation.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BuildingEntity, District, SimulationState } from '../types/politicalSimulation';
import { 
  CityMaterials, 
  createCityMaterials, 
  buildProceduralBuilding, 
  buildCityInfrastructure, 
  createAgentSystems, 
  AnimatedAgentSystem 
} from './cityBuilder';

// Pre-allocated math objects to eliminate garbage collection inside loops
const _raycaster = new THREE.Raycaster();
const _pointerVec = new THREE.Vector2();

interface ThreeCityViewportProps {
  simulationState: SimulationState;
  selectedBuildingId: string | null;
  onSelectBuilding: (buildingId: string | null) => void;
  cameraTargetCoord: [number, number, number] | null;
  onCameraArrived?: () => void;
}

export const ThreeCityViewport: React.FC<ThreeCityViewportProps> = ({
  simulationState,
  selectedBuildingId,
  onSelectBuilding,
  cameraTargetCoord,
  onCameraArrived
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const agentSystemRef = useRef<AnimatedAgentSystem | null>(null);
  const materialsRef = useRef<CityMaterials | null>(null);
  const selectionMarkerRef = useRef<THREE.Mesh | null>(null);

  // Camera Orbit & Pan State
  const cameraFocusTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));
  const cameraSpherical = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 72,
    theta: Math.PI / 4,
    phi: Math.PI / 3.4
  });
  const isDragging = useRef<boolean>(false);
  const dragButton = useRef<number>(0);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Smoke particles
  const smokeParticlesRef = useRef<THREE.Points | null>(null);

  // Live simulation state reference to avoid stale closures in animate loop
  const simStateRef = useRef<SimulationState>(simulationState);
  useEffect(() => {
    simStateRef.current = simulationState;

    // Dynamically update building visuals (e.g. strike barricade on foundry)
    const foundryMesh = buildingMeshesRef.current.get('foundry_alpha');
    if (foundryMesh) {
      const barricade = foundryMesh.getObjectByName('strike_barricade');
      if (barricade) {
        barricade.visible = simulationState.buildings.foundry_alpha?.operatingStatus === 'ON_STRIKE';
      }
    }
  }, [simulationState]);

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Horizon Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070A10);
    scene.fog = new THREE.FogExp2(0x070A10, 0.007);
    sceneRef.current = scene;

    // 2. Perspective Camera (Tactical Isometric Default)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300);
    cameraRef.current = camera;

    // 3. Renderer with PBR Settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 5. Lighting Rig (Warm Key + Cool Hemisphere Fill)
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

    // 5. Build City Infrastructure & Materials
    const materials = createCityMaterials();
    materialsRef.current = materials;
    buildCityInfrastructure(scene, materials);

    // 6. Build All Procedural Buildings
    const meshesMap = new Map<string, THREE.Group>();
    for (const b of Object.values(simulationState.buildings)) {
      const bGroup = buildProceduralBuilding(b, materials);
      scene.add(bGroup);
      meshesMap.set(b.id, bGroup);
    }
    buildingMeshesRef.current = meshesMap;

    // 7. Initialize Dynamic Pedestrian & Traffic Systems
    const agentSys = createAgentSystems(scene, materials);
    agentSystemRef.current = agentSys;

    // 8. Industrial Smoke Particles
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
    const smoke = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smoke);
    smokeParticlesRef.current = smoke;

    // 9. Selected Building Highlight Ring
    const ringGeo = new THREE.RingGeometry(5, 5.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, side: THREE.DoubleSide });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.set(0, 0.15, 0);
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionMarkerRef.current = selectionRing;

    // -------------------------------------------------------------
    // ANIMATION & RENDER TICK
    // -------------------------------------------------------------
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth camera position calculation from spherical coords
      const { radius, theta, phi } = cameraSpherical.current;
      const target = cameraFocusTarget.current;

      const cx = target.x + radius * Math.sin(phi) * Math.sin(theta);
      const cy = target.y + radius * Math.cos(phi);
      const cz = target.z + radius * Math.sin(phi) * Math.cos(theta);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, cx, 8, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cy, 8, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cz, 8, delta);
      camera.lookAt(target);

      // Read current simulation state from ref to avoid stale closures
      const currentSim = simStateRef.current;
      const isStriking = currentSim.buildings.foundry_alpha?.operatingStatus === 'ON_STRIKE';
      const hasProtest = (currentSim.districts.civic?.unrestLevel ?? 0) > 40 || isStriking;

      // Update Agents & Traffic
      agentSys.update(delta, hasProtest);

      // Animate Smoke Particles
      if (smokeParticlesRef.current) {
        const positions = smokeParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          positions[i * 3 + 1] += (isStriking ? 0.8 : 3.5) * delta;
          positions[i * 3 + 0] += Math.sin(clock.getElapsedTime() + i) * 0.4 * delta;
          if (positions[i * 3 + 1] > 26) {
            positions[i * 3 + 1] = 11;
            positions[i * 3 + 0] = -35 + (Math.random() - 0.5) * 1.5;
          }
        }
        smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // WebGL Context Loss Handlers
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Pausing rendering.');
      cancelAnimationFrame(animationFrameId);
    };

    const handleContextRestored = () => {
      console.info('WebGL context restored. Re-animating.');
      animate();
    };

    const dom = renderer.domElement;
    dom.addEventListener('webglcontextlost', handleContextLost, false);
    dom.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('webglcontextlost', handleContextLost);
      dom.removeEventListener('webglcontextrestored', handleContextRestored);
      window.removeEventListener('resize', handleResize);

      // Dispose all meshes, geometries, and materials in scene to avoid GPU leaks
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.InstancedMesh) {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
        }
      });

      if (materialsRef.current) {
        Object.values(materialsRef.current).forEach((mat) => {
          mat.dispose();
        });
      }

      envTexture.dispose();
      smokeGeo.dispose();
      smokeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();

      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  // -------------------------------------------------------------
  // UPDATE CAMERA TARGET WHEN FLYING TO DISTRICT / EVENT
  // -------------------------------------------------------------
  useEffect(() => {
    if (cameraTargetCoord) {
      cameraFocusTarget.current.set(
        cameraTargetCoord[0],
        cameraTargetCoord[1],
        cameraTargetCoord[2]
      );
      cameraSpherical.current.radius = 48; // Zoom in close to inspected district
      if (onCameraArrived) onCameraArrived();
    }
  }, [cameraTargetCoord, onCameraArrived]);

  // -------------------------------------------------------------
  // UPDATE SELECTION HALO POSITION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectionMarkerRef.current) return;
    if (selectedBuildingId && simulationState.buildings[selectedBuildingId]) {
      const b = simulationState.buildings[selectedBuildingId];
      selectionMarkerRef.current.position.set(b.position[0], 0.15, b.position[2]);
      selectionMarkerRef.current.visible = true;
    } else {
      selectionMarkerRef.current.visible = false;
    }
  }, [selectedBuildingId, simulationState.buildings]);

  // -------------------------------------------------------------
  // CONTROLS: POINTER EVENTS (Orbit, Pan, Zoom & Raycasting)
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragButton.current = e.button;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (dragButton.current === 0) {
      // Left-Click Orbit Rotate
      cameraSpherical.current.theta -= dx * 0.008;
      cameraSpherical.current.phi = THREE.MathUtils.clamp(
        cameraSpherical.current.phi - dy * 0.008,
        0.25,
        Math.PI / 2.1
      );
    } else if (dragButton.current === 2 || dragButton.current === 1) {
      // Right-Click Pan Focus Target
      const panSpeed = cameraSpherical.current.radius * 0.0012;
      const forward = new THREE.Vector3();
      if (cameraRef.current) {
        cameraRef.current.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        cameraFocusTarget.current.addScaledVector(right, -dx * panSpeed);
        cameraFocusTarget.current.addScaledVector(forward, dy * panSpeed);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // If click didn't move far, treat as raycast click!
    const distMoved = Math.hypot(
      e.clientX - lastMousePos.current.x,
      e.clientY - lastMousePos.current.y
    );
    isDragging.current = false;

    if (distMoved < 5 && e.button === 0 && cameraRef.current && sceneRef.current) {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _pointerVec.set(x, y);
      _raycaster.setFromCamera(_pointerVec, cameraRef.current);

      const intersects = _raycaster.intersectObjects(sceneRef.current.children, true);
      let foundId: string | null = null;

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr) {
          if (curr.userData && curr.userData.buildingId) {
            foundId = curr.userData.buildingId;
            break;
          }
          curr = curr.parent;
        }
        if (foundId) break;
      }

      onSelectBuilding(foundId);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraSpherical.current.radius = THREE.MathUtils.clamp(
      cameraSpherical.current.radius + e.deltaY * 0.06,
      20,
      130
    );
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      {/* Discreet 3D Control Hints Overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-400">
        <span className="text-cyan-400 font-bold">3D CONTROLS: </span>
        Left-Drag Orbit · Right-Drag Pan · Scroll Zoom · Click Building to Inspect
      </div>
    </div>
  );
};
