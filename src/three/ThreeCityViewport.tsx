/**
 * AFTERWORLD — Interactive 3D WebGL City Viewport & Construction Engine
 * Tactical isometric camera, 32x32 cellular terrain grid, holographic placement cursor,
 * procedural architectural rendering, and animated agent loops.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SimulationState, BuildingEntity } from '../types/politicalSimulation';
import { BuildableItem, CityZonedBuilding, GridCell } from '../types/cityGrid';
import { 
  CityMaterials, 
  createCityMaterials, 
  buildProceduralBuilding, 
  buildProceduralGridTerrain,
  GridTerrainVisuals,
  createCityBuildingMesh,
  createAgentSystems, 
  AnimatedAgentSystem 
} from './cityBuilder';
import { CELL_WORLD_SIZE, GRID_SIZE, gridToWorld, worldToGrid } from '../engine/cityGridCore';

// Reusable math objects to eliminate garbage collection inside rendering loops
const _raycaster = new THREE.Raycaster();
const _pointerVec = new THREE.Vector2();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersectPoint = new THREE.Vector3();

interface ThreeCityViewportProps {
  simulationState: SimulationState;
  activeBuildTool: BuildableItem | null;
  onPlaceItem: (gridX: number, gridZ: number, item: BuildableItem) => void;
  onCancelBuildTool?: () => void;
  selectedBuildingId: string | null;
  onSelectBuilding: (buildingId: string | null) => void;
  cameraTargetCoord: [number, number, number] | null;
  onCameraArrived?: () => void;
}

export const ThreeCityViewport: React.FC<ThreeCityViewportProps> = ({
  simulationState,
  activeBuildTool,
  onPlaceItem,
  onCancelBuildTool,
  selectedBuildingId,
  onSelectBuilding,
  cameraTargetCoord,
  onCameraArrived
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialsRef = useRef<CityMaterials | null>(null);
  const terrainVisualsRef = useRef<GridTerrainVisuals | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const agentSystemRef = useRef<AnimatedAgentSystem | null>(null);
  const selectionMarkerRef = useRef<THREE.Mesh | null>(null);

  // Holographic placement cursor mesh ref
  const placementCursorRef = useRef<THREE.Group | null>(null);
  const [hoveredGridCell, setHoveredGridCell] = useState<{ x: number; z: number; valid: boolean; reason?: string } | null>(null);

  // Camera Orbit & Pan State
  const cameraFocusTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const cameraSpherical = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 68,
    theta: Math.PI / 4,
    phi: Math.PI / 3.4
  });
  const isDragging = useRef<boolean>(false);
  const dragButton = useRef<number>(0);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Industrial Smoke Particles
  const smokeParticlesRef = useRef<THREE.Points | null>(null);

  // Ref to always have latest state and active tool inside event listeners
  const simStateRef = useRef<SimulationState>(simulationState);
  const activeToolRef = useRef<BuildableItem | null>(activeBuildTool);

  useEffect(() => {
    simStateRef.current = simulationState;
  }, [simulationState]);

  useEffect(() => {
    activeToolRef.current = activeBuildTool;
    if (placementCursorRef.current) {
      placementCursorRef.current.visible = activeBuildTool !== null;
    }
  }, [activeBuildTool]);

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070A10);
    scene.fog = new THREE.FogExp2(0x070A10, 0.007);
    sceneRef.current = scene;

    // 2. Perspective Camera (Tactical Isometric)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 320);
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

    // 4. Room Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 5. Lighting Rig (Warm Key Directional + Cool Ambient Fill)
    const hemiLight = new THREE.HemisphereLight(0xBAE6FD, 0x1E293B, 0.95);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFF7ED, 1.85);
    dirLight.position.set(45, 65, 35);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 160;
    const d = 65;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    // 6. Materials & Dynamic 32x32 Procedural Grid Terrain
    const materials = createCityMaterials();
    materialsRef.current = materials;

    const initialCells = simulationState.gridCells || [];
    const terrainVisuals = buildProceduralGridTerrain(scene, initialCells, materials);
    terrainVisualsRef.current = terrainVisuals;

    // 7. Dynamic Holographic Placement Cursor
    const cursorGroup = new THREE.Group();
    cursorGroup.name = 'placement_cursor';
    cursorGroup.visible = false;

    // Green/Red cursor wireframe box
    const cursorGeo = new THREE.BoxGeometry(CELL_WORLD_SIZE, 0.4, CELL_WORLD_SIZE);
    const cursorMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const cursorBox = new THREE.Mesh(cursorGeo, cursorMat);
    cursorBox.name = 'cursor_box';
    cursorBox.position.y = 0.2;
    cursorGroup.add(cursorBox);

    // Inner highlight fill
    const fillGeo = new THREE.PlaneGeometry(CELL_WORLD_SIZE * 0.96, CELL_WORLD_SIZE * 0.96);
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const cursorFill = new THREE.Mesh(fillGeo, fillMat);
    cursorFill.name = 'cursor_fill';
    cursorFill.rotation.x = -Math.PI / 2;
    cursorFill.position.y = 0.05;
    cursorGroup.add(cursorFill);

    scene.add(cursorGroup);
    placementCursorRef.current = cursorGroup;

    // 8. Selection Ring for Clicked Building
    const ringGeo = new THREE.RingGeometry(2.5, 2.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, side: THREE.DoubleSide });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.set(0, 0.15, 0);
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionMarkerRef.current = selectionRing;

    // 9. Dynamic Agents & Traffic
    const agentSys = createAgentSystems(scene, materials);
    agentSystemRef.current = agentSys;

    // 10. Industrial Smoke Particles
    const smokeCount = 50;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3 + 0] = -15 + (Math.random() - 0.5) * 3;
      smokePos[i * 3 + 1] = 5 + Math.random() * 10;
      smokePos[i * 3 + 2] = -10 + (Math.random() - 0.5) * 3;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x64748B,
      size: 1.6,
      transparent: true,
      opacity: 0.4
    });
    const smoke = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smoke);
    smokeParticlesRef.current = smoke;

    // -------------------------------------------------------------
    // RENDER LOOP & ANIMATIONS
    // -------------------------------------------------------------
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth camera interpolation
      const { radius, theta, phi } = cameraSpherical.current;
      const target = cameraFocusTarget.current;

      const cx = target.x + radius * Math.sin(phi) * Math.sin(theta);
      const cy = target.y + radius * Math.cos(phi);
      const cz = target.z + radius * Math.sin(phi) * Math.cos(theta);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, cx, 8, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cy, 8, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cz, 8, delta);
      camera.lookAt(target);

      // Rotate kinetic wind turbine blades
      scene.traverse((obj) => {
        if (obj.name === 'turbine_rotor') {
          obj.rotation.z += 2.8 * delta;
        }
      });

      // Update pedestrian and vehicle agents
      const currentSim = simStateRef.current;
      const hasProtest = (currentSim.districts.civic?.unrestLevel ?? 0) > 40;
      agentSys.update(delta, hasProtest);

      // Animate smoke particles
      if (smokeParticlesRef.current) {
        const positions = smokeParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          positions[i * 3 + 1] += 2.2 * delta;
          positions[i * 3 + 0] += Math.sin(clock.getElapsedTime() + i) * 0.3 * delta;
          if (positions[i * 3 + 1] > 18) {
            positions[i * 3 + 1] = 4;
            positions[i * 3 + 0] = -15 + (Math.random() - 0.5) * 2;
          }
        }
        smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Context Loss & Resize Listeners
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
    };
    const handleContextRestored = () => {
      animate();
    };

    const dom = renderer.domElement;
    dom.addEventListener('webglcontextlost', handleContextLost, false);
    dom.addEventListener('webglcontextrestored', handleContextRestored, false);

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

      // Clean up all meshes
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.InstancedMesh) {
          if (obj.geometry) obj.geometry.dispose();
        }
      });

      if (materialsRef.current) {
        Object.values(materialsRef.current).forEach(mat => mat.dispose());
      }
      if (terrainVisualsRef.current) {
        terrainVisualsRef.current.dispose();
      }

      envTexture.dispose();
      cursorGeo.dispose();
      cursorMat.dispose();
      fillGeo.dispose();
      fillMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      smokeGeo.dispose();
      smokeMat.dispose();

      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  // -------------------------------------------------------------
  // SYNC 3D BUILDINGS & ROADS WITH SIMULATION STATE
  // -------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current || !materialsRef.current) return;
    const scene = sceneRef.current;
    const materials = materialsRef.current;
    const meshesMap = buildingMeshesRef.current;

    // Update Roads and Zones on the Terrain Visuals
    if (terrainVisualsRef.current && simulationState.gridCells) {
      terrainVisualsRef.current.updateRoads(simulationState.gridCells);
      terrainVisualsRef.current.updateZones(simulationState.gridCells);
    }

    // 1. Zoned & Placed Buildings
    const currentZonedIds = new Set(Object.keys(simulationState.zonedBuildings || {}));
    
    // Remove deleted buildings
    for (const [id, mesh] of meshesMap.entries()) {
      if (!currentZonedIds.has(id) && !simulationState.buildings[id]) {
        scene.remove(mesh);
        mesh.traverse(c => {
          if (c instanceof THREE.Mesh && c.geometry) c.geometry.dispose();
        });
        meshesMap.delete(id);
      }
    }

    // Add or update zoned buildings
    if (simulationState.zonedBuildings) {
      for (const b of Object.values(simulationState.zonedBuildings)) {
        const existing = meshesMap.get(b.id);
        if (!existing) {
          const mesh = createCityBuildingMesh(b, materials);
          scene.add(mesh);
          meshesMap.set(b.id, mesh);
        } else {
          // Check if construction completed
          const hadScaffolding = existing.getObjectByName('scaffolding') !== undefined;
          if (hadScaffolding && !b.isConstructing) {
            scene.remove(existing);
            existing.traverse(c => {
              if (c instanceof THREE.Mesh && c.geometry) c.geometry.dispose();
            });
            const mesh = createCityBuildingMesh(b, materials);
            scene.add(mesh);
            meshesMap.set(b.id, mesh);
          }
        }
      }
    }

    // Legacy scenario buildings (if loaded)
    for (const b of Object.values(simulationState.buildings)) {
      if (!meshesMap.has(b.id)) {
        const mesh = buildProceduralBuilding(b, materials);
        scene.add(mesh);
        meshesMap.set(b.id, mesh);
      }
    }
  }, [simulationState.zonedBuildings, simulationState.gridCells, simulationState.buildings]);

  // -------------------------------------------------------------
  // UPDATE CAMERA TARGET WHEN FLYING TO COORDINATES
  // -------------------------------------------------------------
  useEffect(() => {
    if (cameraTargetCoord) {
      cameraFocusTarget.current.set(
        cameraTargetCoord[0],
        cameraTargetCoord[1],
        cameraTargetCoord[2]
      );
      cameraSpherical.current.radius = 42;
      if (onCameraArrived) onCameraArrived();
    }
  }, [cameraTargetCoord, onCameraArrived]);

  // -------------------------------------------------------------
  // UPDATE SELECTION RING POSITION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectionMarkerRef.current) return;
    const ring = selectionMarkerRef.current;

    if (selectedBuildingId) {
      const zonedB = simulationState.zonedBuildings?.[selectedBuildingId];
      if (zonedB) {
        const [wx, , wz] = gridToWorld(zonedB.gridX, zonedB.gridZ);
        ring.position.set(wx, 0.15, wz);
        ring.visible = true;
        return;
      }
      const legacyB = simulationState.buildings[selectedBuildingId];
      if (legacyB) {
        ring.position.set(legacyB.position[0], 0.15, legacyB.position[2]);
        ring.visible = true;
        return;
      }
    }
    ring.visible = false;
  }, [selectedBuildingId, simulationState.zonedBuildings, simulationState.buildings]);

  // -------------------------------------------------------------
  // CONTROLS: POINTER MOVE (RAYCASTING & PLACEMENT CURSOR)
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragButton.current = e.button;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = mountRef.current?.getBoundingClientRect();
    if (!rect || !cameraRef.current) return;

    // Raycast ground plane to update holographic cursor
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _pointerVec.set(x, y);
    _raycaster.setFromCamera(_pointerVec, cameraRef.current);

    if (_raycaster.ray.intersectPlane(_groundPlane, _intersectPoint)) {
      const [gx, gz] = worldToGrid(_intersectPoint.x, _intersectPoint.z);
      const activeTool = activeToolRef.current;

      if (activeTool && placementCursorRef.current) {
        const [wx, , wz] = gridToWorld(gx, gz);
        const w = activeTool.width || 1;
        const d = activeTool.depth || 1;
        const offsetX = ((w - 1) * CELL_WORLD_SIZE) / 2;
        const offsetZ = ((d - 1) * CELL_WORLD_SIZE) / 2;

        placementCursorRef.current.position.set(wx + offsetX, 0, wz + offsetZ);

        // Resize cursor geometry if needed
        const cursorBox = placementCursorRef.current.getObjectByName('cursor_box') as THREE.Mesh;
        const cursorFill = placementCursorRef.current.getObjectByName('cursor_fill') as THREE.Mesh;

        if (cursorBox && cursorFill) {
          cursorBox.scale.set(w, 1, d);
          cursorFill.scale.set(w, 1, d);

          // Validate placement
          const currentCells = simStateRef.current.gridCells || [];
          const targetCell = currentCells[gz * GRID_SIZE + gx];

          let isValid = true;
          let reason = '';

          if (!targetCell) {
            isValid = false;
            reason = 'Outside boundary';
          } else if (activeTool.category === 'DEMOLISH') {
            isValid = targetCell.hasRoad || targetCell.zone !== 'NONE' || Boolean(targetCell.buildingId);
            reason = isValid ? 'Demolish target' : 'Nothing to clear';
          } else if (activeTool.category === 'ROAD') {
            isValid = targetCell.terrain !== 'WATER' && !targetCell.buildingId && !targetCell.hasRoad;
            reason = isValid ? 'Ready to pave' : (targetCell.terrain === 'WATER' ? 'Water obstacle' : 'Occupied');
          } else if (activeTool.category === 'ZONE') {
            isValid = targetCell.terrain !== 'WATER' && !targetCell.hasRoad && !targetCell.buildingId;
            reason = isValid ? 'Ready to zone' : 'Occupied / Water';
          } else {
            // Civic or Utility
            if (simStateRef.current.treasury < activeTool.cost) {
              isValid = false;
              reason = 'Insufficient funds';
            } else if (targetCell.terrain === 'WATER') {
              isValid = false;
              reason = 'Cannot build on water';
            } else if (targetCell.hasRoad || targetCell.buildingId) {
              isValid = false;
              reason = 'Footprint occupied';
            } else {
              isValid = true;
              reason = 'Valid site';
            }
          }

          const colorHex = isValid ? 0x10B981 : 0xEF4444;
          (cursorBox.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
          (cursorFill.material as THREE.MeshBasicMaterial).color.setHex(colorHex);

          setHoveredGridCell({ x: gx, z: gz, valid: isValid, reason });
        }
      }
    }

    // Camera Panning / Orbiting
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
    const distMoved = Math.hypot(
      e.clientX - lastMousePos.current.x,
      e.clientY - lastMousePos.current.y
    );
    isDragging.current = false;

    // Right-click cancels build mode
    if (e.button === 2 && activeToolRef.current && onCancelBuildTool) {
      onCancelBuildTool();
      return;
    }

    // Left-click with active build tool -> place item!
    if (distMoved < 5 && e.button === 0) {
      const activeTool = activeToolRef.current;
      if (activeTool && hoveredGridCell && hoveredGridCell.valid) {
        onPlaceItem(hoveredGridCell.x, hoveredGridCell.z, activeTool);
        return;
      }

      // If no active build tool, treat click as building inspector raycast!
      if (!activeTool && cameraRef.current && sceneRef.current) {
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
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraSpherical.current.radius = THREE.MathUtils.clamp(
      cameraSpherical.current.radius + e.deltaY * 0.06,
      18,
      140
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
      className={`relative w-full h-full select-none overflow-hidden ${
        activeBuildTool ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* 3D Viewport Helper HUD */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1.5">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-400 flex items-center gap-2 shadow-lg">
          <span className="text-cyan-400 font-bold">TACTICAL 3D: </span>
          <span>Left-Drag Orbit · Right-Drag Pan · Scroll Zoom</span>
          {activeBuildTool && (
            <span className="text-amber-400 font-bold ml-2">· Right-Click to Cancel</span>
          )}
        </div>

        {/* Active Tool Holographic Status Badge */}
        {activeBuildTool && hoveredGridCell && (
          <div
            className={`border px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-md shadow-xl flex items-center gap-2 ${
              hoveredGridCell.valid
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/80 text-rose-200'
            }`}
          >
            <span className="text-base">{activeBuildTool.icon}</span>
            <span className="font-semibold">{activeBuildTool.name}:</span>
            <span>Grid [{hoveredGridCell.x}, {hoveredGridCell.z}]</span>
            <span className="opacity-60">·</span>
            <span className="font-bold">{hoveredGridCell.reason}</span>
            {activeBuildTool.cost > 0 && (
              <span className="opacity-80">(-${activeBuildTool.cost}M)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
