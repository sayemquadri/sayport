import test from 'node:test';
import assert from 'node:assert/strict';
import { ORBITAL_DESTINATIONS } from '../data/portfolio';
import {
  buildOrbitalEllipsePath,
  computeCompactRingPoint,
  computeOrbitalPosition,
  resolveActiveOrbitalDestination,
} from './orbitalNav';

test('ORBITAL_DESTINATIONS defines the 5 SAY destinations with WORK featured', () => {
  assert.equal(ORBITAL_DESTINATIONS.length, 5);
  assert.deepEqual(
    ORBITAL_DESTINATIONS.map((d) => d.id),
    ['work', 'creative', 'experiments', 'about', 'contact'],
  );
  assert.equal(ORBITAL_DESTINATIONS[0].featured, true);
  const speeds = new Set(ORBITAL_DESTINATIONS.map((d) => d.speedRadPerSec));
  assert.equal(speeds.size, 5);
});

test('computeOrbitalPosition moves along tilted ellipse smoothly with time and parallax', () => {
  const work = ORBITAL_DESTINATIONS[0];
  const t0 = computeOrbitalPosition(work, 0, 0, 0);
  const t1 = computeOrbitalPosition(work, 4, 0, 0);
  const t1Parallax = computeOrbitalPosition(work, 4, 0.5, -0.5);

  assert.notEqual(t0.xFactor, t1.xFactor);
  assert.ok(Math.hypot(t0.xFactor, t0.yFactor) > 0.8);
  assert.notEqual(t1Parallax.xFactor, t1.xFactor);
  assert.notEqual(t1Parallax.yFactor, t1.yFactor);
});

test('buildOrbitalEllipsePath emits closed SVG path and computeCompactRingPoint spaces evenly', () => {
  const path = buildOrbitalEllipsePath(ORBITAL_DESTINATIONS[0]);
  assert.ok(path.startsWith('M'));
  assert.ok(path.endsWith('Z'));

  const p0 = computeCompactRingPoint(0, 5, 40, -90);
  const p2 = computeCompactRingPoint(2, 5, 40, -90);
  assert.ok(Math.abs(p0.x) < 1e-6);
  assert.ok(Math.abs(p0.y + 40) < 1e-6);
  assert.ok(p2.y > 0);
});

test('resolveActiveOrbitalDestination maps home to null and prioritizes hover state', () => {
  assert.equal(resolveActiveOrbitalDestination(ORBITAL_DESTINATIONS, 'home'), null);
  assert.equal(
    resolveActiveOrbitalDestination(ORBITAL_DESTINATIONS, 'creative')?.id,
    'creative',
  );
  assert.equal(
    resolveActiveOrbitalDestination(ORBITAL_DESTINATIONS, 'creative', 'about')?.id,
    'about',
  );
  assert.equal(
    resolveActiveOrbitalDestination(ORBITAL_DESTINATIONS, 'unknown'),
    null,
  );
});
