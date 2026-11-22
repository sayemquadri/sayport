import {
  buildFaceIdentityModel,
  type FaceIdentityModel,
  type FaceMeshPart,
  type FacialPartTag,
} from './faceMeshBuilder';

export interface OrbitalSatelliteSpec {
  phase: number;
  speed: number;
  size: number;
  isAccent: boolean;
}

export interface OrbitalTrackData {
  radiusX: number;
  radiusY: number;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  zOffset: number;
  speed: number;
  isAccent: boolean;
  points: Float32Array;
  satellites: OrbitalSatelliteSpec[];
}

export interface CelestialIdentityData {
  /** Underlying 3D facial model metrics verified before sampling */
  faceMetrics: FaceIdentityModel['metrics'];

  /** Surface-sampled portrait stars + distant background stars */
  pointPositions: Float32Array;
  pointColors: Float32Array;
  pointSizes: Float32Array;
  pointPhases: Float32Array;
  pointSpeeds: Float32Array;
  pointAlphas: Float32Array;
  /** 0 = surface skin/collar star, 1 = high-definition feature star, 2 = hair crest star, 3 = distant star */
  pointKinds: Float32Array;
  pointCount: number;
  surfacePointCount: number;

  /** Delicate hair-ridge & collar contour threads (no spiderweb across face) */
  linePositions: Float32Array;
  lineColors: Float32Array;
  lineProgress: Float32Array;
  lineSeeds: Float32Array;
  lineAlphas: Float32Array;
  segmentCount: number;

  /** Starlink-inspired multi-layer elliptical orbital trajectories & satellite nodes */
  orbitalTracks: OrbitalTrackData[];
}

export interface CelestialBuildOptions {
  seed?: number;
  surfaceParticleCount?: number;
  distantStarCount?: number;
}

export function createSeededRng(seed = 20261121): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Selects adaptive particle density so capable desktops render 46,000 surface particles
 * (inside the 30,000–60,000 target), laptops/tablets render 32,000, and mobile renders 20,000.
 */
export function getAdaptiveParticleBudget(viewportWidth: number): {
  surfaceParticleCount: number;
  distantStarCount: number;
} {
  if (viewportWidth >= 1024) {
    return { surfaceParticleCount: 46000, distantStarCount: 240 };
  }
  if (viewportWidth >= 640) {
    return { surfaceParticleCount: 32000, distantStarCount: 180 };
  }
  return { surfaceParticleCount: 20000, distantStarCount: 130 };
}

interface SampledSurfacePoint {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  albedo: number;
  accent: number;
  tag: FacialPartTag;
}

/**
 * Samples `count` points strictly on the triangle surfaces of a 3D FaceMeshPart
 * weighted by triangle surface area * anatomical importance weight.
 */
function samplePointsFromMeshPart(
  part: FaceMeshPart,
  count: number,
  rng: () => number,
): SampledSurfacePoint[] {
  const { positions, normals, weights, albedos, accents, tags, indices } = part;
  const triCount = indices.length / 3;
  if (triCount === 0 || count <= 0) return [];

  const cdf = new Float32Array(triCount);
  let totalWeight = 0;

  for (let t = 0; t < triCount; t++) {
    const ia = indices[t * 3];
    const ib = indices[t * 3 + 1];
    const ic = indices[t * 3 + 2];

    const ax = positions[ia * 3];
    const ay = positions[ia * 3 + 1];
    const az = positions[ia * 3 + 2];

    const abx = positions[ib * 3] - ax;
    const aby = positions[ib * 3 + 1] - ay;
    const abz = positions[ib * 3 + 2] - az;

    const acx = positions[ic * 3] - ax;
    const acy = positions[ic * 3 + 1] - ay;
    const acz = positions[ic * 3 + 2] - az;

    const cx = aby * acz - abz * acy;
    const cy = abz * acx - abx * acz;
    const cz = abx * acy - aby * acx;
    const area = 0.5 * Math.hypot(cx, cy, cz);

    const avgWeight = (weights[ia] + weights[ib] + weights[ic]) / 3;
    const triW = area * Math.max(0, avgWeight);
    totalWeight += triW;
    cdf[t] = totalWeight;
  }

  if (totalWeight <= 0) return [];

  for (let t = 0; t < triCount; t++) {
    cdf[t] /= totalWeight;
  }

  const sampled: SampledSurfacePoint[] = new Array(count);

  for (let s = 0; s < count; s++) {
    const target = rng();
    let lo = 0;
    let hi = triCount - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < target) lo = mid + 1;
      else hi = mid;
    }

    const ia = indices[lo * 3];
    const ib = indices[lo * 3 + 1];
    const ic = indices[lo * 3 + 2];

    // Uniform barycentric coordinates on the 3D triangle
    const r1 = Math.sqrt(rng());
    const r2 = rng();
    const w0 = 1 - r1;
    const w1 = r1 * (1 - r2);
    const w2 = r1 * r2;

    const x = w0 * positions[ia * 3] + w1 * positions[ib * 3] + w2 * positions[ic * 3];
    const y = w0 * positions[ia * 3 + 1] + w1 * positions[ib * 3 + 1] + w2 * positions[ic * 3 + 1];
    const z = w0 * positions[ia * 3 + 2] + w1 * positions[ib * 3 + 2] + w2 * positions[ic * 3 + 2];

    let nx = w0 * normals[ia * 3] + w1 * normals[ib * 3] + w2 * normals[ic * 3];
    let ny = w0 * normals[ia * 3 + 1] + w1 * normals[ib * 3 + 1] + w2 * normals[ic * 3 + 1];
    let nz = w0 * normals[ia * 3 + 2] + w1 * normals[ib * 3 + 2] + w2 * normals[ic * 3 + 2];
    const nLen = Math.hypot(nx, ny, nz) || 1;
    nx /= nLen;
    ny /= nLen;
    nz /= nLen;

    const albedo = w0 * albedos[ia] + w1 * albedos[ib] + w2 * albedos[ic];
    const accent = w0 * accents[ia] + w1 * accents[ib] + w2 * accents[ic];
    const tag = w0 >= w1 && w0 >= w2 ? tags[ia] : w1 >= w2 ? tags[ib] : tags[ic];

    sampled[s] = { x, y, z, nx, ny, nz, albedo, accent, tag };
  }

  return sampled;
}

/**
 * Builds delicate geodesic threads strictly along outer hair lock crests and jacket collar edges
 * (never crossing the central face, eyes, nose, or lips).
 */
function buildOuterSilhouetteThreads(
  model: FaceIdentityModel,
  rng: () => number,
): Array<{
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  p0: number;
  p1: number;
  seed: number;
  accent: boolean;
  alpha: number;
}> {
  const threads: Array<{
    ax: number;
    ay: number;
    az: number;
    bx: number;
    by: number;
    bz: number;
    p0: number;
    p1: number;
    seed: number;
    accent: boolean;
    alpha: number;
  }> = [];

  const hairPart = model.parts.find((p) => p.name === 'hairLocks');
  if (hairPart) {
    // Base hair cap has (64 + 1) * (32 + 1) = 2145 vertices followed by 22 sculpted locks (23 rows x 7 cols)
    const capVerts = 65 * 33;
    const cols = 7;
    const rows = 23;
    const vertsPerLock = cols * rows;
    const totalVerts = hairPart.positions.length / 3;
    const lockCount = Math.max(0, Math.floor((totalVerts - capVerts) / vertsPerLock));

    for (let l = 0; l < lockCount; l++) {
      // Trace subtle celestial threads along selected outer hair lock ridges
      if (l % 2 !== 0) continue;
      const base = capVerts + l * vertsPerLock;
      const lockSeed = rng();
      const accent = l < 6 || l % 4 === 0;

      for (let r = 0; r < rows - 1; r++) {
        const va = base + r * cols + 3;
        const vb = base + (r + 1) * cols + 3;

        const ax = hairPart.positions[va * 3];
        const ay = hairPart.positions[va * 3 + 1];
        const az = hairPart.positions[va * 3 + 2] + 0.004;

        const bx = hairPart.positions[vb * 3];
        const by = hairPart.positions[vb * 3 + 1];
        const bz = hairPart.positions[vb * 3 + 2] + 0.004;

        const t0 = r / (rows - 1);
        const t1 = (r + 1) / (rows - 1);
        const fade = smoothstep(0.05, 0.25, t0) * smoothstep(1.0, 0.72, t1);

        threads.push({
          ax,
          ay,
          az,
          bx,
          by,
          bz,
          p0: t0,
          p1: t1,
          seed: lockSeed,
          accent,
          alpha: 0.11 * fade,
        });
      }
    }
  }

  // Subtle shoulder / lapel structural meridian lines on the collar mesh
  const collarPart = model.parts.find((p) => p.name === 'collarAndShoulders');
  if (collarPart) {
    const cols = 69;
    const rows = 35;
    const targetCols = [22, 30, 38, 46]; // Symmetrical lapel & collar ridges

    for (const c of targetCols) {
      const colSeed = rng();
      for (let r = 4; r < rows - 6; r++) {
        const va = r * cols + c;
        const vb = (r + 1) * cols + c;
        const t0 = r / (rows - 1);
        const t1 = (r + 1) / (rows - 1);
        const fade = smoothstep(0.08, 0.28, t0) * smoothstep(0.9, 0.55, t1);

        threads.push({
          ax: collarPart.positions[va * 3],
          ay: collarPart.positions[va * 3 + 1],
          az: collarPart.positions[va * 3 + 2] + 0.003,
          bx: collarPart.positions[vb * 3],
          by: collarPart.positions[vb * 3 + 1],
          bz: collarPart.positions[vb * 3 + 2] + 0.003,
          p0: t0,
          p1: t1,
          seed: colSeed,
          accent: c === 30 || c === 38,
          alpha: 0.10 * fade,
        });
      }
    }
  }

  return threads;
}

/**
 * Generates multi-layered Starlink-inspired elliptical orbital trajectories with depth separation
 * and luminous orbiting satellites.
 */
function buildStarlinkOrbitalTracks(rng: () => number): OrbitalTrackData[] {
  const configs = [
    {
      radiusX: 1.05,
      radiusY: 0.94,
      tiltX: 1.18,
      tiltY: 0.34,
      tiltZ: -0.24,
      zOffset: 0.08,
      speed: 0.032,
      isAccent: true,
      satCount: 3,
    },
    {
      radiusX: 1.18,
      radiusY: 1.06,
      tiltX: 1.29,
      tiltY: -0.46,
      tiltZ: 0.30,
      zOffset: -0.06,
      speed: -0.022,
      isAccent: false,
      satCount: 3,
    },
    {
      radiusX: 0.96,
      radiusY: 0.88,
      tiltX: 0.88,
      tiltY: 0.58,
      tiltZ: 0.14,
      zOffset: -0.14,
      speed: 0.019,
      isAccent: true,
      satCount: 2,
    },
    {
      radiusX: 1.28,
      radiusY: 1.14,
      tiltX: 1.38,
      tiltY: -0.22,
      tiltZ: -0.42,
      zOffset: 0.14,
      speed: -0.015,
      isAccent: false,
      satCount: 2,
    },
  ];

  const segmentsPerRing = 180;

  return configs.map((cfg, ringIdx) => {
    const pts = new Float32Array(segmentsPerRing * 3);
    for (let i = 0; i < segmentsPerRing; i++) {
      const a = (i / segmentsPerRing) * Math.PI * 2;
      pts[i * 3] = Math.cos(a) * cfg.radiusX;
      pts[i * 3 + 1] = Math.sin(a) * cfg.radiusY;
      pts[i * 3 + 2] = 0;
    }

    const satellites: OrbitalSatelliteSpec[] = [];
    for (let s = 0; s < cfg.satCount; s++) {
      const baseAngle = ((s + 0.25 + ringIdx * 0.37) / cfg.satCount) * Math.PI * 2;
      satellites.push({
        phase: (baseAngle + (rng() - 0.5) * 0.25) % (Math.PI * 2),
        speed: cfg.speed * (1.35 + s * 0.3),
        size: cfg.isAccent && s === 0 ? 4.4 : 3.2 + (s % 2) * 0.6,
        isAccent: cfg.isAccent || s === 0,
      });
    }

    return {
      radiusX: cfg.radiusX,
      radiusY: cfg.radiusY,
      tiltX: cfg.tiltX,
      tiltY: cfg.tiltY,
      tiltZ: cfg.tiltZ,
      zOffset: cfg.zOffset,
      speed: cfg.speed,
      isAccent: cfg.isAccent,
      points: pts,
      satellites,
    };
  });
}

/**
 * Constructs the 3D FaceIdentityModel first, then transforms its triangle surfaces
 * into a 30,000–60,000-star celestial constellation and Starlink orbital network.
 */
export function buildCelestialIdentity(
  options: CelestialBuildOptions = {},
): CelestialIdentityData {
  const rng = createSeededRng(options.seed ?? 20261121);
  const surfaceParticleCount = options.surfaceParticleCount ?? 46000;
  const distantStarCount = options.distantStarCount ?? 240;

  // Phase 2: Construct the underlying continuous 3D facial geometry first
  const faceModel = buildFaceIdentityModel();

  // Phase 3: Sample stars strictly from the surface triangles of the 3D model
  const faceBudget = Math.round(surfaceParticleCount * 0.47);
  const eyeBudgetEach = Math.round(surfaceParticleCount * 0.025);
  const hairBudget = Math.round(surfaceParticleCount * 0.35);
  const collarBudget = Math.max(
    1,
    surfaceParticleCount - faceBudget - eyeBudgetEach * 2 - hairBudget,
  );

  const partBudgets: Record<FaceMeshPart['name'], number> = {
    craniumAndFace: faceBudget,
    leftEye: eyeBudgetEach,
    rightEye: eyeBudgetEach,
    hairLocks: hairBudget,
    collarAndShoulders: collarBudget,
  };

  const sampledSurface: SampledSurfacePoint[] = [];
  for (const part of faceModel.parts) {
    const pts = samplePointsFromMeshPart(part, partBudgets[part.name], rng);
    for (let i = 0; i < pts.length; i++) {
      sampledSurface.push(pts[i]);
    }
  }

  const totalPoints = sampledSurface.length + distantStarCount;
  const pointPositions = new Float32Array(totalPoints * 3);
  const pointColors = new Float32Array(totalPoints * 3);
  const pointSizes = new Float32Array(totalPoints);
  const pointPhases = new Float32Array(totalPoints);
  const pointSpeeds = new Float32Array(totalPoints);
  const pointAlphas = new Float32Array(totalPoints);
  const pointKinds = new Float32Array(totalPoints);

  // Studio key & cool rim lighting vectors for smooth, recognizable 3D facial chiaroscuro
  const keyX = -0.26;
  const keyY = 0.38;
  const keyZ = 0.88;
  const fillX = 0.54;
  const fillY = 0.24;
  const fillZ = 0.80;

  for (let i = 0; i < sampledSurface.length; i++) {
    const p = sampledSurface[i];
    // Centered portrait scale inside the circular hero frame
    pointPositions[i * 3] = p.x * 1.18;
    pointPositions[i * 3 + 1] = (p.y + 0.055) * 1.18;
    pointPositions[i * 3 + 2] = p.z * 1.18;

    const ndotlKey = Math.max(0, p.nx * keyX + p.ny * keyY + p.nz * keyZ);
    const ndotlFill = Math.max(0, p.nx * fillX + p.ny * fillY + p.nz * fillZ);
    const rim = Math.pow(1 - Math.max(0, p.nz), 1.85) * smoothstep(-0.22, 0.48, p.nz);
    const rimStrength = p.tag === 'hair' ? 0.26 : 0.14;

    const shading = 0.30 + ndotlKey * 0.56 + ndotlFill * 0.18 + rim * rimStrength;
    const lum = clamp01(p.albedo * shading);

    const useCoolBlue =
      (p.accent > 0.14 && rng() < 0.22) ||
      (rim > 0.34 && rng() < 0.16) ||
      (p.tag === 'hair' && rng() < 0.13);

    let r: number;
    let g: number;
    let b: number;

    if (useCoolBlue) {
      r = 0.46 + lum * 0.24;
      g = 0.68 + lum * 0.20;
      b = 0.98;
    } else if (p.tag === 'hair') {
      const silver = clamp01(0.42 + lum * 0.62);
      r = 0.78 * silver;
      g = 0.84 * silver;
      b = 0.96 * silver;
    } else if (p.tag === 'collar') {
      const tone = clamp01(0.32 + lum * 0.54);
      r = 0.76 * tone;
      g = 0.80 * tone;
      b = 0.90 * tone;
    } else {
      const white = clamp01(0.48 + lum * 0.55);
      r = 0.95 * white;
      g = 0.96 * white;
      b = 1.0 * white;
    }

    pointColors[i * 3] = clamp01(r);
    pointColors[i * 3 + 1] = clamp01(g);
    pointColors[i * 3 + 2] = clamp01(b);

    const isFeature =
      p.tag === 'eyelid' ||
      p.tag === 'eyeball' ||
      p.tag === 'brow' ||
      p.tag === 'nose' ||
      p.tag === 'lips';

    let baseSize = 0.96 + rng() * 0.48 + lum * 0.42;
    let baseAlpha = 0.44 + lum * 0.44;
    let kind = 0;

    if (p.tag === 'eyelid' || p.tag === 'eyeball') {
      baseSize = 1.08 + lum * 0.78 + (rng() < 0.08 ? 0.38 : 0);
      baseAlpha = 0.56 + lum * 0.38;
      kind = 1;
    } else if (isFeature) {
      baseSize = 1.05 + lum * 0.68 + (rng() < 0.06 ? 0.32 : 0);
      baseAlpha = 0.52 + lum * 0.40;
      kind = 1;
    } else if (p.tag === 'hair') {
      baseSize = 1.0 + rng() * 0.45 + lum * 0.65;
      baseAlpha = 0.46 + lum * 0.46;
      kind = 2;
    } else if (p.tag === 'collar') {
      baseSize = 0.92 + rng() * 0.5;
      baseAlpha = 0.32 + lum * 0.36;
      kind = 0;
    }

    pointSizes[i] = baseSize;
    pointPhases[i] = rng() * Math.PI * 2;
    pointSpeeds[i] = 0.55 + rng() * 1.15;
    pointAlphas[i] = clamp01(baseAlpha);
    pointKinds[i] = kind;
  }

  // Distant deep-space starfield around the portrait
  const starOffset = sampledSurface.length;
  for (let st = 0; st < distantStarCount; st++) {
    const idx = starOffset + st;
    const angle = rng() * Math.PI * 2;
    const radius = 0.78 + Math.pow(rng(), 0.72) * 1.18;
    pointPositions[idx * 3] = Math.cos(angle) * radius;
    pointPositions[idx * 3 + 1] = Math.sin(angle) * radius * 1.05;
    pointPositions[idx * 3 + 2] = -0.55 - rng() * 1.15;

    const isBlue = rng() < 0.22;
    const lum = 0.42 + rng() * 0.44;
    pointColors[idx * 3] = isBlue ? 0.48 : lum * 0.90;
    pointColors[idx * 3 + 1] = isBlue ? 0.68 : lum * 0.92;
    pointColors[idx * 3 + 2] = isBlue ? 0.98 : lum;

    pointSizes[idx] = 1.05 + rng() * 1.45;
    pointPhases[idx] = rng() * Math.PI * 2;
    pointSpeeds[idx] = 0.35 + rng() * 0.95;
    pointAlphas[idx] = 0.22 + rng() * 0.34;
    pointKinds[idx] = 3;
  }

  // Phase 4: Delicate outer hair & collar threads (zero spiderweb over face)
  const rawThreads = buildOuterSilhouetteThreads(faceModel, rng);
  const segmentCount = rawThreads.length;
  const linePositions = new Float32Array(segmentCount * 6);
  const lineColors = new Float32Array(segmentCount * 6);
  const lineProgress = new Float32Array(segmentCount * 2);
  const lineSeeds = new Float32Array(segmentCount * 2);
  const lineAlphas = new Float32Array(segmentCount * 2);

  for (let i = 0; i < segmentCount; i++) {
    const seg = rawThreads[i];
    const v0 = i * 6;
    const a0 = i * 2;

    linePositions[v0] = seg.ax * 1.18;
    linePositions[v0 + 1] = (seg.ay + 0.055) * 1.18;
    linePositions[v0 + 2] = seg.az * 1.18;
    linePositions[v0 + 3] = seg.bx * 1.18;
    linePositions[v0 + 4] = (seg.by + 0.055) * 1.18;
    linePositions[v0 + 5] = seg.bz * 1.18;

    const cr = seg.accent ? 0.42 : 0.72;
    const cg = seg.accent ? 0.64 : 0.76;
    const cb = seg.accent ? 0.98 : 0.88;

    lineColors[v0] = cr;
    lineColors[v0 + 1] = cg;
    lineColors[v0 + 2] = cb;
    lineColors[v0 + 3] = cr;
    lineColors[v0 + 4] = cg;
    lineColors[v0 + 5] = cb;

    lineProgress[a0] = seg.p0;
    lineProgress[a0 + 1] = seg.p1;
    lineSeeds[a0] = seg.seed;
    lineSeeds[a0 + 1] = seg.seed;
    lineAlphas[a0] = seg.alpha;
    lineAlphas[a0 + 1] = seg.alpha;
  }

  return {
    faceMetrics: faceModel.metrics,
    pointPositions,
    pointColors,
    pointSizes,
    pointPhases,
    pointSpeeds,
    pointAlphas,
    pointKinds,
    pointCount: totalPoints,
    surfacePointCount: sampledSurface.length,
    linePositions,
    lineColors,
    lineProgress,
    lineSeeds,
    lineAlphas,
    segmentCount,
    orbitalTracks: buildStarlinkOrbitalTracks(rng),
  };
}

export interface ProjectedPoint2D {
  x: number;
  y: number;
  scale: number;
}

export function rotateEulerXYZ(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
): [number, number, number] {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);

  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;
  const x3 = x2 * cz - y1 * sz;
  const y3 = x2 * sz + y1 * cz;

  return [x3, y3, z2];
}

export function projectPerspectivePoint(
  x: number,
  y: number,
  z: number,
  cameraZ: number,
  fovDeg: number,
  viewportSize: number,
  cameraY = 0.0,
): ProjectedPoint2D {
  const halfFovRad = ((fovDeg * Math.PI) / 180) * 0.5;
  const focal = 1 / Math.tan(halfFovRad);
  const depth = Math.max(0.25, cameraZ - z);
  const ndcX = (x * focal) / depth;
  const ndcY = ((y - cameraY) * focal) / depth;
  const half = viewportSize * 0.5;

  return {
    x: half + ndcX * half,
    y: half - ndcY * half,
    scale: focal / depth,
  };
}
