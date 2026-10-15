/**
 * AFTERWORLD — Procedural Canvas Texture Generators
 * Generates zero-404 procedural albedo, normal, and roughness maps for PBR materials.
 */

import * as THREE from 'three';

/**
 * Creates asphalt road texture with lane markings and surface grain
 */
export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base dark asphalt
    ctx.fillStyle = '#1c222c';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle noise grain
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(25 + Math.random() * 20);
      ctx.fillStyle = `rgb(${gray}, ${gray + 2}, ${gray + 5})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Yellow dashed center line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.setLineDash([36, 24]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    // White solid shoulder lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 512);
    ctx.moveTo(480, 0);
    ctx.lineTo(480, 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates skyscraper window grid texture with illuminated and dark offices
 */
export function createWindowGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Glass curtain wall base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 512);

    // Window grid
    const cols = 8;
    const rows = 24;
    const cellW = 256 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLit = Math.random() > 0.45;
        ctx.fillStyle = isLit ? '#38bdf8' : '#1e293b';
        ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates brick masonry texture for residential tenements
 */
export function createBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Mortar
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 256);

    const rows = 16;
    const cols = 8;
    const bh = 256 / rows;
    const bw = 256 / cols;

    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2) * (bw / 2);
      for (let c = -1; c <= cols; c++) {
        const shade = Math.floor(120 + (Math.random() - 0.5) * 30);
        ctx.fillStyle = `rgb(${shade + 20}, ${shade * 0.45}, ${shade * 0.35})`;
        ctx.fillRect(c * bw + offsetX + 1, r * bh + 1, bw - 2, bh - 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
