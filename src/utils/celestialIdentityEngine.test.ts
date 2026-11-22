import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCelestialIdentity,
  getAdaptiveParticleBudget,
  projectPerspectivePoint,
  rotateEulerXYZ,
} from './celestialIdentityEngine';

describe('celestialIdentityEngine', () => {
  it('allocates adaptive particle budgets inside 30k–60k on desktop and scales for smaller viewports', () => {
    const desktop = getAdaptiveParticleBudget(1440);
    const tablet = getAdaptiveParticleBudget(820);
    const mobile = getAdaptiveParticleBudget(390);

    assert.ok(desktop.surfaceParticleCount >= 30000 && desktop.surfaceParticleCount <= 60000);
    assert.ok(tablet.surfaceParticleCount < desktop.surfaceParticleCount);
    assert.ok(mobile.surfaceParticleCount < tablet.surfaceParticleCount);
  });

  it('samples stars deterministically from the 3D face mesh surface and builds multi-layer orbital tracks', () => {
    const a = buildCelestialIdentity({
      seed: 1234,
      surfaceParticleCount: 4000,
      distantStarCount: 120,
    });
    const b = buildCelestialIdentity({
      seed: 1234,
      surfaceParticleCount: 4000,
      distantStarCount: 120,
    });

    assert.equal(a.surfacePointCount, 4000);
    assert.equal(a.pointCount, 4120);
    assert.equal(a.orbitalTracks.length, 4);
    assert.ok(a.segmentCount > 40, 'Expected delicate outer hair & collar constellation threads');
    assert.deepEqual(a.pointPositions, b.pointPositions);
    assert.deepEqual(a.linePositions, b.linePositions);

    // Verify orbital depth separation across layers
    const zOffsets = new Set(a.orbitalTracks.map((t) => t.zOffset));
    assert.equal(zOffsets.size, 4, 'Orbital layers should have distinct depth separation');

    // All coordinates must be finite and surface stars bounded to head/bust volume
    for (let i = 0; i < a.surfacePointCount; i++) {
      const x = a.pointPositions[i * 3];
      const y = a.pointPositions[i * 3 + 1];
      const z = a.pointPositions[i * 3 + 2];
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
      assert.ok(Math.abs(x) < 0.85 && Math.abs(y) < 1.15 && Math.abs(z) < 0.6);
    }
  });

  it('rotates and perspective-projects 3D points consistently for static fallback rendering', () => {
    const [rx, ry, rz] = rotateEulerXYZ(1, 0, 0, 0, Math.PI / 2, 0);
    assert.ok(Math.abs(rx) < 1e-6);
    assert.ok(Math.abs(ry) < 1e-6);
    assert.ok(Math.abs(rz + 1) < 1e-6);

    const near = projectPerspectivePoint(0.4, 0.0, 0.35, 3.35, 34, 465);
    const far = projectPerspectivePoint(0.4, 0.0, -0.35, 3.35, 34, 465);
    assert.ok(near.x > far.x);
    assert.ok(near.scale > far.scale);
  });
});
