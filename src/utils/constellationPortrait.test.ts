import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPortraitConstellation,
  estimateFacialDepth,
  extractPortraitCandidates,
  projectPerspectivePoint,
  rotateEulerXYZ,
  type PortraitSourceBuffer,
} from './constellationPortrait.ts';

function createSyntheticPortraitBuffer(width = 80, height = 100): PortraitSourceBuffer {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      const idx = (y * width + x) * 4;

      // Studio backdrop default (muted olive-brown)
      let r = 64;
      let g = 58;
      let b = 40;

      // Head oval & curly hair region
      const faceDist = Math.hypot((u - 0.5) / 0.21, (v - 0.5) / 0.24);
      const hairDist = Math.hypot((u - 0.5) / 0.31, (v - 0.36) / 0.28);

      if (hairDist < 1.0 && faceDist >= 0.92) {
        // Dark wavy hair with subtle highlight streaks
        const curl = Math.sin(u * 42 + v * 28) > 0.55 ? 45 : 0;
        r = 18 + curl;
        g = 17 + curl;
        b = 16 + curl;
      }

      if (faceDist < 1.0) {
        // Warm illuminated face skin
        const centerGlow = Math.max(0, 1 - faceDist * 0.7);
        r = Math.round(135 + centerGlow * 85);
        g = Math.round(102 + centerGlow * 68);
        b = Math.round(78 + centerGlow * 55);

        // Dark eyes & eyebrows
        const leftEye = Math.hypot((u - 0.42) / 0.04, (v - 0.43) / 0.02);
        const rightEye = Math.hypot((u - 0.58) / 0.04, (v - 0.43) / 0.02);
        const noseHighlight = Math.hypot((u - 0.505) / 0.02, (v - 0.5) / 0.06);
        const lips = Math.hypot((u - 0.505) / 0.06, (v - 0.625) / 0.018);

        if (leftEye < 1.0 || rightEye < 1.0) {
          r = 22;
          g = 18;
          b = 18;
        } else if (noseHighlight < 1.0) {
          r = 242;
          g = 228;
          b = 212;
        } else if (lips < 1.0) {
          r = 85;
          g = 54;
          b = 48;
        }
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  return { width, height, data };
}

describe('constellationPortrait utilities', () => {
  it('excludes uniform studio corners while extracting high-contrast facial candidates', () => {
    const buffer = createSyntheticPortraitBuffer();
    const candidates = extractPortraitCandidates(buffer);

    assert.ok(candidates.length > 200, 'Expected substantial portrait candidates');

    const cornerPixels = candidates.filter((c) => c.u < 0.12 && c.v < 0.2);
    assert.equal(cornerPixels.length, 0, 'Studio backdrop corners should be excluded');

    const landmarkPixels = candidates.filter((c) => c.region === 'landmark');
    assert.ok(landmarkPixels.length > 40, 'Facial landmarks (eyes/nose/mouth) should be detected');
  });

  it('orders 3D facial relief depth so nose bridge protrudes ahead of temples and collar', () => {
    const noseTipZ = estimateFacialDepth(0.508, 0.53, 0.85, 0.35);
    const outerTempleZ = estimateFacialDepth(0.24, 0.44, 0.2, 0.2);
    const lowerCollarZ = estimateFacialDepth(0.5, 0.88, 0.15, 0.25);

    assert.ok(noseTipZ > outerTempleZ, 'Nose tip must project forward of outer temples');
    assert.ok(noseTipZ > lowerCollarZ, 'Nose tip must project forward of lower collar');
  });

  it('builds deterministic finite point cloud, constellation segments, and orbital rings', () => {
    const buffer = createSyntheticPortraitBuffer();
    const a = buildPortraitConstellation(buffer, {
      seed: 42,
      maxPortraitPoints: 600,
      maxAnchorNodes: 140,
      distantStarCount: 40,
      satelliteCount: 10,
    });
    const b = buildPortraitConstellation(buffer, {
      seed: 42,
      maxPortraitPoints: 600,
      maxAnchorNodes: 140,
      distantStarCount: 40,
      satelliteCount: 10,
    });

    assert.equal(a.pointCount, 650);
    assert.ok(a.segmentCount > 100, 'Constellation should contain connecting edges');
    assert.equal(a.orbitalRings.length, 3);
    assert.deepEqual(a.pointPositions, b.pointPositions);
    assert.deepEqual(a.linePositions, b.linePositions);

    for (let i = 0; i < a.pointPositions.length; i++) {
      assert.ok(Number.isFinite(a.pointPositions[i]), 'Point coordinates must be finite');
    }
    for (let i = 0; i < a.linePositions.length; i++) {
      assert.ok(Number.isFinite(a.linePositions[i]), 'Line coordinates must be finite');
    }
  });

  it('rotates and perspective-projects points consistently for static fallback rendering', () => {
    const [rx, ry, rz] = rotateEulerXYZ(1, 0, 0, 0, Math.PI / 2, 0);
    assert.ok(Math.abs(rx) < 1e-6);
    assert.ok(Math.abs(ry) < 1e-6);
    assert.ok(Math.abs(rz + 1) < 1e-6);

    const near = projectPerspectivePoint(0.4, 0.02, 0.4, 3.35, 34, 465);
    const far = projectPerspectivePoint(0.4, 0.02, -0.4, 3.35, 34, 465);
    assert.ok(near.x > far.x, 'Nearer point must project wider from center');
    assert.ok(near.scale > far.scale, 'Nearer point must have larger perspective scale');
  });
});
