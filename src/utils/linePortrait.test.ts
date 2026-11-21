import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLineDotPortrait,
  detectDotNodes,
  estimateLinePortraitDepth,
  extractInkMask,
  projectPerspectivePoint,
  rotateEulerXYZ,
  thinInkMask,
  traceSkeletonPolylines,
  type PortraitImageBuffer,
} from './linePortrait.ts';

function createSyntheticLineDotImage(size = 120): PortraitImageBuffer {
  const data = new Uint8ClampedArray(size * size * 4);
  data.fill(255); // Pure white paper background

  const drawPixel = (x: number, y: number) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || xi >= size || yi < 0 || yi >= size) return;
    const idx = (yi * size + xi) * 4;
    data[idx] = 10;
    data[idx + 1] = 14;
    data[idx + 2] = 24;
    data[idx + 3] = 255;
  };

  const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      drawPixel(x, y);
      drawPixel(x + 0.5, y);
    }
  };

  const drawDot = (cx: number, cy: number, r = 2.8) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          drawPixel(cx + dx, cy + dy);
        }
      }
    }
  };

  // Hair & face outline strokes
  drawLine(35, 30, 60, 18);
  drawLine(60, 18, 85, 32);
  drawLine(32, 68, 50, 86);
  drawLine(50, 86, 68, 86);
  drawLine(68, 86, 86, 68);
  drawLine(40, 56, 54, 56); // Brow-like horizontal stroke

  // Elongated thick horizontal bar (simulates eyebrow — must NOT trigger circular dot detector)
  for (let y = 55; y <= 57; y++) {
    for (let x = 62; x <= 84; x++) {
      drawPixel(x, y);
    }
  }

  // Circular intersection nodes
  drawDot(60, 18, 2.8);
  drawDot(35, 30, 2.8);
  drawDot(50, 86, 2.8);
  drawDot(68, 86, 2.8);

  return { width: size, height: size, data };
}

describe('linePortrait utilities', () => {
  it('separates circular intersection dots from thin strokes and elongated eyebrow bars', () => {
    const buffer = createSyntheticLineDotImage(120);
    const mask = extractInkMask(buffer, 0.32);
    const nodes = detectDotNodes(mask, buffer.width, buffer.height);

    assert.equal(nodes.length, 4, 'Expected exactly the 4 circular dot nodes');
  });

  it('thins ink strokes to a connected 1px skeleton and traces simplified polylines', () => {
    const buffer = createSyntheticLineDotImage(120);
    const mask = extractInkMask(buffer, 0.32);
    const skeleton = thinInkMask(mask, buffer.width, buffer.height);
    const polylines = traceSkeletonPolylines(skeleton, buffer.width, buffer.height);

    assert.ok(polylines.length >= 3, 'Expected simplified traced polylines');
    for (const poly of polylines) {
      assert.ok(poly.points.length >= 2);
    }
  });

  it('orders 3D line portrait depth forward at nose/brows relative to collar', () => {
    const noseZ = estimateLinePortraitDepth(0.485, 0.58);
    const collarZ = estimateLinePortraitDepth(0.5, 0.92);
    assert.ok(noseZ > collarZ);
  });

  it('builds deterministic WebGL line/point buffers and orbital tracks', () => {
    const buffer = createSyntheticLineDotImage(120);
    const a = buildLineDotPortrait(buffer, 99);
    const b = buildLineDotPortrait(buffer, 99);

    assert.ok(a.segmentCount > 4);
    assert.equal(a.pointCount, 4 + 64);
    assert.equal(a.orbitalTracks.length, 2);
    assert.deepEqual(a.linePositions, b.linePositions);
    assert.deepEqual(a.pointPositions, b.pointPositions);

    for (let i = 0; i < a.linePositions.length; i++) {
      assert.ok(Number.isFinite(a.linePositions[i]));
    }
  });

  it('projects 3D Euler points accurately for static fallback rendering', () => {
    const [rx, ry, rz] = rotateEulerXYZ(1, 0, 0, 0, Math.PI / 2, 0);
    assert.ok(Math.abs(rx) < 1e-6);
    assert.ok(Math.abs(ry) < 1e-6);
    assert.ok(Math.abs(rz + 1) < 1e-6);

    const near = projectPerspectivePoint(0.4, 0.0, 0.3, 3.4, 34, 465);
    const far = projectPerspectivePoint(0.4, 0.0, -0.3, 3.4, 34, 465);
    assert.ok(near.x > far.x);
  });
});
