import type { OrbitalDestination } from '../data/portfolio';

export interface OrbitalCoordinate {
  /** Normalized offset relative to container center (-1.3 .. 1.3 roughly) */
  xFactor: number;
  yFactor: number;
  /** Depth hint (-1 back to +1 front) for subtle scale/brightness parallax */
  depth: number;
}

/**
 * Computes the 2D tilted elliptical coordinate for an orbiting satellite
 * around the center of the celestial portrait.
 */
export function computeOrbitalPosition(
  dest: Pick<
    OrbitalDestination,
    'rxFactor' | 'ryFactor' | 'tiltDeg' | 'speedRadPerSec' | 'initialAngle'
  >,
  elapsedSeconds: number,
  parallaxX: number = 0,
  parallaxY: number = 0,
): OrbitalCoordinate {
  const angle = dest.initialAngle + elapsedSeconds * dest.speedRadPerSec;
  const ex = Math.cos(angle) * dest.rxFactor;
  const ey = Math.sin(angle) * dest.ryFactor;

  const tiltRad = (dest.tiltDeg * Math.PI) / 180;
  const cosT = Math.cos(tiltRad);
  const sinT = Math.sin(tiltRad);

  const rx = ex * cosT - ey * sinT;
  const ry = ex * sinT + ey * cosT;
  const depth = Math.sin(angle + tiltRad * 0.5);

  return {
    xFactor: rx + parallaxX * (0.04 + (depth + 1) * 0.015),
    yFactor: ry + parallaxY * (0.04 + (depth + 1) * 0.015),
    depth,
  };
}

/**
 * Generates an SVG elliptical path string inside a 0..1000 square viewBox
 * matching a destination's orbital parameters.
 */
export function buildOrbitalEllipsePath(
  dest: Pick<OrbitalDestination, 'rxFactor' | 'ryFactor' | 'tiltDeg'>,
  center: number = 500,
  baseRadius: number = 380,
  steps: number = 96,
): string {
  const tiltRad = (dest.tiltDeg * Math.PI) / 180;
  const cosT = Math.cos(tiltRad);
  const sinT = Math.sin(tiltRad);

  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const ex = Math.cos(theta) * dest.rxFactor * baseRadius;
    const ey = Math.sin(theta) * dest.ryFactor * baseRadius;
    const x = center + (ex * cosT - ey * sinT);
    const y = center + (ex * sinT + ey * cosT);
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `${parts.join(' ')} Z`;
}

/**
 * Computes evenly spaced angle along a compact circular ring for the condensed
 * persistent identity controller.
 */
export function computeCompactRingPoint(
  index: number,
  total: number,
  radiusPx: number,
  startAngleDeg: number = -90,
): { x: number; y: number } {
  if (total <= 0) {
    return { x: 0, y: 0 };
  }
  const angleRad = ((startAngleDeg + (index / total) * 360) * Math.PI) / 180;
  return {
    x: Math.cos(angleRad) * radiusPx,
    y: Math.sin(angleRad) * radiusPx,
  };
}

export function resolveActiveOrbitalDestination(
  destinations: readonly OrbitalDestination[],
  activeSection: string,
  hoveredId: OrbitalDestination['id'] | null = null,
): OrbitalDestination | null {
  const targetId = hoveredId ?? activeSection;
  if (targetId === 'home') {
    return null;
  }
  return destinations.find((d) => d.id === targetId) ?? null;
}
