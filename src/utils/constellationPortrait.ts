export interface PortraitSourceBuffer {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface ConstellationBuildOptions {
  seed?: number;
  maxPortraitPoints?: number;
  maxAnchorNodes?: number;
  distantStarCount?: number;
  satelliteCount?: number;
}

export interface OrbitalRingData {
  radiusX: number;
  radiusY: number;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  speed: number;
  isAccent: boolean;
  points: Float32Array;
}

export interface ConstellationData {
  /** XYZ coordinates for all particles (portrait + satellites + distant stars) */
  pointPositions: Float32Array;
  /** RGB colors (0..1) per particle */
  pointColors: Float32Array;
  /** Base point size per particle */
  pointSizes: Float32Array;
  /** Random flicker phase (0..2PI) per particle */
  pointPhases: Float32Array;
  /** Flicker speed multiplier per particle */
  pointSpeeds: Float32Array;
  /** 0 = portrait star, 1 = landmark/contour anchor star, 2 = satellite node, 3 = distant star */
  pointKinds: Float32Array;
  /** Total particle count */
  pointCount: number;

  /** Pairs of XYZ vertices for LineSegments (constellation mesh + satellite tethers) */
  linePositions: Float32Array;
  /** Pairs of RGB colors (0..1) */
  lineColors: Float32Array;
  /** 0 at start vertex, 1 at end vertex for travelling pulse shader */
  lineProgress: Float32Array;
  /** Random per-segment seed (0..1) for staggered travelling light pulses */
  lineSeeds: Float32Array;
  /** Base alpha per vertex */
  lineAlphas: Float32Array;
  /** Total number of line segments */
  segmentCount: number;

  /** Elliptical orbital rings around the portrait */
  orbitalRings: OrbitalRingData[];
}

interface CandidatePixel {
  u: number;
  v: number;
  x: number;
  y: number;
  z: number;
  lum: number;
  edge: number;
  fg: number;
  featureWeight: number;
  brightness: number;
  region: 'face' | 'landmark' | 'hair' | 'collar';
}

export function createSeededRng(seed = 1337): () => number {
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
 * Computes anatomical 3D relief depth (Z) calibrated to the frontal portrait's
 * facial proportions so mouse parallax reveals authentic cranial/nose/jaw depth.
 */
export function estimateFacialDepth(
  u: number,
  v: number,
  luminance: number,
  edge: number,
): number {
  const cx = 0.505;
  const cy = 0.48;
  const dx = (u - cx) / 0.255;
  const dy = (v - cy) / 0.295;
  const radialSq = dx * dx + dy * dy;

  // Base cranial volume
  let z = radialSq < 1.35 ? Math.sqrt(Math.max(0, 1.35 - radialSq)) * 0.24 - 0.06 : -0.14;

  // Forehead dome
  const foreheadDx = (u - 0.505) / 0.16;
  const foreheadDy = (v - 0.31) / 0.095;
  z += 0.055 * Math.exp(-(foreheadDx * foreheadDx + foreheadDy * foreheadDy));

  // Brow ridge projection
  const browDx = (u - 0.505) / 0.175;
  const browDy = (v - 0.39) / 0.032;
  z += 0.05 * Math.exp(-(browDx * browDx + browDy * browDy));

  // Subtle recessed eye sockets
  const leftEyeDx = (u - 0.415) / 0.05;
  const rightEyeDx = (u - 0.595) / 0.05;
  const eyeDy = (v - 0.44) / 0.032;
  z -= 0.042 * Math.exp(-(leftEyeDx * leftEyeDx + eyeDy * eyeDy));
  z -= 0.042 * Math.exp(-(rightEyeDx * rightEyeDx + eyeDy * eyeDy));

  // Nose bridge & nasal tip prominence
  const noseDx = (u - 0.508) / 0.038;
  const noseBridgeDy = (v - 0.475) / 0.075;
  const noseTipDy = (v - 0.535) / 0.036;
  z += 0.105 * Math.exp(-(noseDx * noseDx + noseBridgeDy * noseBridgeDy));
  z += 0.095 * Math.exp(-(noseDx * noseDx * 1.15 + noseTipDy * noseTipDy));

  // Cheekbones
  const leftCheekDx = (u - 0.39) / 0.068;
  const rightCheekDx = (u - 0.625) / 0.068;
  const cheekDy = (v - 0.535) / 0.058;
  z += 0.048 * Math.exp(-(leftCheekDx * leftCheekDx + cheekDy * cheekDy));
  z += 0.048 * Math.exp(-(rightCheekDx * rightCheekDx + cheekDy * cheekDy));

  // Lips & chin prominence
  const mouthDx = (u - 0.508) / 0.072;
  const mouthDy = (v - 0.625) / 0.032;
  z += 0.048 * Math.exp(-(mouthDx * mouthDx + mouthDy * mouthDy));

  const chinDx = (u - 0.508) / 0.088;
  const chinDy = (v - 0.72) / 0.052;
  z += 0.058 * Math.exp(-(chinDx * chinDx + chinDy * chinDy));

  // Curly hair volume around crown and temples; recedes at outer curls
  const hairEnvelope = Math.exp(-(((u - 0.5) / 0.38) ** 2 + ((v - 0.34) / 0.3) ** 2));
  if (radialSq > 0.75 && v < 0.72) {
    z += 0.07 * hairEnvelope - 0.04 * smoothstep(0.85, 1.5, radialSq);
  }

  // Collar / neck recession near the bottom edge
  if (v > 0.74) {
    z -= smoothstep(0.74, 0.98, v) * 0.13;
  }

  z += (luminance - 0.38) * 0.055 + edge * 0.035;

  return z;
}

/**
 * Estimates median backdrop RGB from the upper corners & margins of the studio portrait.
 */
function sampleBackgroundColor(buffer: PortraitSourceBuffer): [number, number, number] {
  const { width, height, data } = buffer;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  const sampleMaxY = Math.max(2, Math.floor(height * 0.2));
  const leftEdge = Math.max(2, Math.floor(width * 0.12));
  const rightEdge = Math.min(width - 2, Math.floor(width * 0.88));

  for (let y = 1; y < sampleMaxY; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (x > leftEdge && x < rightEdge) continue;
      const idx = (y * width + x) * 4;
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
      count++;
    }
  }

  if (count === 0) return [64, 58, 38];
  return [sumR / count, sumG / count, sumB / count];
}

/**
 * Computes luminance + Sobel edge magnitude and isolates subject chiaroscuro
 * highlights & hair curl/contour ridges so eyes, brows, nose, beard, and curls stay crisp.
 */
export function extractPortraitCandidates(buffer: PortraitSourceBuffer): CandidatePixel[] {
  const { width, height, data } = buffer;
  if (width < 4 || height < 4 || data.length < width * height * 4) {
    return [];
  }

  const total = width * height;
  const lumArr = new Float32Array(total);
  const bgColor = sampleBackgroundColor(buffer);

  for (let i = 0; i < total; i++) {
    const idx = i * 4;
    lumArr[i] = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
  }

  const aspect = width / height;
  const scaleX = 1.78 * aspect;
  const scaleY = 1.78;
  const candidates: CandidatePixel[] = [];

  for (let y = 2; y < height - 2; y++) {
    const v = y / (height - 1);
    for (let x = 2; x < width - 2; x++) {
      const u = x / (width - 1);
      const i = y * width + x;
      const idx = i * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = lumArr[i];

      // 3x3 Sobel gradient magnitude on luminance
      const tl = lumArr[(y - 1) * width + (x - 1)];
      const t = lumArr[(y - 1) * width + x];
      const tr = lumArr[(y - 1) * width + (x + 1)];
      const l = lumArr[y * width + (x - 1)];
      const ri = lumArr[y * width + (x + 1)];
      const bl = lumArr[(y + 1) * width + (x - 1)];
      const bt = lumArr[(y + 1) * width + x];
      const br = lumArr[(y + 1) * width + (x + 1)];

      const gx = -tl - 2 * l - bl + tr + 2 * ri + br;
      const gy = -tl - 2 * t - tr + bl + 2 * bt + br;
      const edge = clamp01(Math.sqrt(gx * gx + gy * gy) * 1.65);

      // Local contrast relative to 3x3 neighborhood (captures eye catchlights & curl ridges)
      const localAvg = (tl + t + tr + l + lum + ri + bl + bt + br) / 9;
      const localPeak = Math.max(0, lum - localAvg);

      // Color distance from studio backdrop
      const dr = (r - bgColor[0]) / 255;
      const dg = (g - bgColor[1]) / 255;
      const db = (b - bgColor[2]) / 255;
      const bgDist = Math.sqrt(dr * dr + dg * dg + db * db);

      // Head + shoulders geometric mask so corner backdrop grain is strictly discarded
      const headDist = Math.sqrt(((u - 0.505) / 0.43) ** 2 + ((v - 0.43) / 0.4) ** 2);
      const shoulderMask = v > 0.72 ? smoothstep(0.56, 0.2, Math.abs(u - 0.5)) : 0;
      const subjectMask = Math.max(smoothstep(1.1, 0.72, headDist), shoulderMask * smoothstep(0.98, 0.72, v));

      const borderFade =
        smoothstep(0.025, 0.1, u) *
        smoothstep(0.975, 0.9, u) *
        smoothstep(0.025, 0.1, v) *
        smoothstep(0.985, 0.84, v);

      const fgColorGate = smoothstep(0.075, 0.22, bgDist);
      const fg = clamp01(fgColorGate * subjectMask * borderFade);
      if (fg < 0.08 && edge < 0.18) continue;
      if (subjectMask * borderFade < 0.05) continue;

      const inEyeZone =
        Math.hypot((u - 0.41) / 0.09, (v - 0.425) / 0.065) < 1.0 ||
        Math.hypot((u - 0.6) / 0.09, (v - 0.425) / 0.065) < 1.0;
      const inNoseMouthZone = Math.hypot((u - 0.508) / 0.11, (v - 0.55) / 0.13) < 1.0;
      const inInnerFace = Math.hypot((u - 0.505) / 0.215, (v - 0.5) / 0.255) < 1.0;

      let region: CandidatePixel['region'] = 'hair';
      if (v > 0.76) {
        region = 'collar';
      } else if (inEyeZone || inNoseMouthZone) {
        region = 'landmark';
      } else if (inInnerFace) {
        region = 'face';
      }

      // Preserve chiaroscuro contrast!
      // Inside face & landmarks: bright skin planes + strong gradient rims (eyelids, brows, lips, jawline)
      // get dense luminous stars while dark iris/brow/mustache/nostril cores remain dark negative space.
      const skinHighlight = Math.pow(smoothstep(0.16, 0.88, lum), 1.25);
      let featureWeight = 0;
      let brightness = lum;

      if (region === 'landmark') {
        // Sharp rims (eye catchlight, eyelid crease, nostrils, lip ridge) + illuminated skin
        featureWeight = skinHighlight * 1.65 + edge * 1.45 + localPeak * 3.8;
        brightness = clamp01(0.45 + lum * 0.6 + edge * 0.35 + localPeak * 1.4);
      } else if (region === 'face') {
        // Smooth skin tonal stippling + jawline/cheek contours
        featureWeight = skinHighlight * 1.8 + edge * 0.95 + localPeak * 2.2;
        brightness = clamp01(0.38 + lum * 0.65 + edge * 0.22);
      } else if (region === 'hair') {
        // Curly hair: trace curl sheen & outer silhouette ridges, keep curl shadows dark!
        const hairSheen = smoothstep(0.08, 0.36, lum);
        featureWeight = edge * 1.5 + hairSheen * 0.75 + localPeak * 2.5;
        brightness = clamp01(0.32 + edge * 0.52 + hairSheen * 0.45);
      } else {
        // Collar lapels and neck illumination
        featureWeight = (skinHighlight * 1.15 + edge * 1.05) * smoothstep(0.985, 0.75, v);
        brightness = clamp01(0.28 + lum * 0.55 + edge * 0.3);
      }

      featureWeight *= fg;
      if (featureWeight < 0.085) continue;

      const worldX = (u - 0.5) * scaleX;
      const worldY = (0.48 - v) * scaleY;
      const worldZ = estimateFacialDepth(u, v, lum, edge);

      candidates.push({
        u,
        v,
        x: worldX,
        y: worldY,
        z: worldZ,
        lum,
        edge,
        fg,
        featureWeight,
        brightness,
        region,
      });
    }
  }

  return candidates;
}

function buildOrbitalRings(rng: () => number): OrbitalRingData[] {
  const configs = [
    {
      radiusX: 0.98,
      radiusY: 0.92,
      tiltX: 1.08,
      tiltY: 0.34,
      tiltZ: -0.22,
      speed: 0.045,
      isAccent: true,
    },
    {
      radiusX: 1.12,
      radiusY: 1.04,
      tiltX: 1.24,
      tiltY: -0.44,
      tiltZ: 0.32,
      speed: -0.032,
      isAccent: false,
    },
    {
      radiusX: 0.88,
      radiusY: 0.85,
      tiltX: 0.82,
      tiltY: 0.62,
      tiltZ: 0.16,
      speed: 0.024,
      isAccent: false,
    },
  ];

  const segmentsPerRing = 128;

  return configs.map((cfg) => {
    const pts = new Float32Array(segmentsPerRing * 3);
    const phaseOffset = rng() * Math.PI * 2;
    for (let i = 0; i < segmentsPerRing; i++) {
      const a = (i / segmentsPerRing) * Math.PI * 2 + phaseOffset;
      pts[i * 3] = Math.cos(a) * cfg.radiusX;
      pts[i * 3 + 1] = Math.sin(a) * cfg.radiusY;
      pts[i * 3 + 2] = 0;
    }
    return {
      ...cfg,
      points: pts,
    };
  });
}

/**
 * Generates the complete 3D celestial point-cloud, constellation mesh lines,
 * orbital satellites, tilted rings, and distant background stars from a portrait image.
 */
export function buildPortraitConstellation(
  buffer: PortraitSourceBuffer,
  options: ConstellationBuildOptions = {},
): ConstellationData {
  const rng = createSeededRng(options.seed ?? 20260624);
  const maxPortraitPoints = options.maxPortraitPoints ?? 4400;
  const maxAnchorNodes = options.maxAnchorNodes ?? 320;
  const distantStarCount = options.distantStarCount ?? 130;
  const satelliteCount = options.satelliteCount ?? 14;

  const candidates = extractPortraitCandidates(buffer);

  const selectedPortrait: CandidatePixel[] = [];
  if (candidates.length > 0) {
    const sorted = [...candidates].sort((a, b) => b.featureWeight - a.featureWeight);
    const landmarkQuota = Math.min(Math.floor(maxPortraitPoints * 0.22), sorted.length);
    const chosenSet = new Set<CandidatePixel>();

    // Spatially spaced top structural & facial contour landmarks
    const minSpacingSq = 0.011 * 0.011;
    for (let i = 0; i < sorted.length && selectedPortrait.length < landmarkQuota; i++) {
      const c = sorted[i];
      let tooClose = false;
      for (let j = Math.max(0, selectedPortrait.length - 70); j < selectedPortrait.length; j++) {
        const p = selectedPortrait[j];
        const d2 = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
        if (d2 < minSpacingSq) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        selectedPortrait.push(c);
        chosenSet.add(c);
      }
    }

    // Weighted chiaroscuro importance sampling over remaining portrait pixels
    let totalWeight = 0;
    const weights = new Float32Array(candidates.length);
    for (let i = 0; i < candidates.length; i++) {
      const w = chosenSet.has(candidates[i]) ? 0 : Math.pow(candidates[i].featureWeight, 1.32);
      weights[i] = w;
      totalWeight += w;
    }

    const remainingTarget = maxPortraitPoints - selectedPortrait.length;
    if (totalWeight > 0 && remainingTarget > 0) {
      const cdf = new Float32Array(candidates.length);
      let acc = 0;
      for (let i = 0; i < candidates.length; i++) {
        acc += weights[i] / totalWeight;
        cdf[i] = acc;
      }

      for (let k = 0; k < remainingTarget; k++) {
        const target = rng();
        let lo = 0;
        let hi = cdf.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cdf[mid] < target) lo = mid + 1;
          else hi = mid;
        }
        selectedPortrait.push(candidates[lo]);
      }
    }
  }

  // Select constellation mesh anchors predominantly along contours, hair waves, jaw/collar,
  // and key brow/cheek points—avoiding dense line webs directly across eyes/lips
  const anchors: CandidatePixel[] = [];
  const sortedForAnchors = [...selectedPortrait].sort((a, b) => {
    const contourBoostA = a.region === 'hair' || a.region === 'collar' ? 0.25 : 0.1;
    const contourBoostB = b.region === 'hair' || b.region === 'collar' ? 0.25 : 0.1;
    return b.edge + b.featureWeight * 0.35 + contourBoostB - (a.edge + a.featureWeight * 0.35 + contourBoostA);
  });

  const anchorMinDistSq = 0.048 * 0.048;
  for (let i = 0; i < sortedForAnchors.length && anchors.length < maxAnchorNodes; i++) {
    const c = sortedForAnchors[i];
    if (c.edge < 0.075 && c.region === 'face') continue;

    // Give inner facial features slightly wider spacing so lines whisper geometry instead of cluttering eyes
    const regionScale = c.region === 'landmark' ? 1.25 : c.region === 'face' ? 1.05 : 0.92;
    const minDistSq = anchorMinDistSq * regionScale * regionScale;
    let close = false;
    for (let j = 0; j < anchors.length; j++) {
      const a = anchors[j];
      const dx = c.x - a.x;
      const dy = c.y - a.y;
      if (dx * dx + dy * dy < minDistSq) {
        close = true;
        break;
      }
    }
    if (!close) {
      anchors.push(c);
    }
  }

  // Satellite nodes orbiting outside the portrait
  const satellites: Array<{ x: number; y: number; z: number; isAccent: boolean; size: number }> = [];
  for (let i = 0; i < satelliteCount; i++) {
    const angle = (i / satelliteCount) * Math.PI * 2 + (rng() - 0.5) * 0.28;
    const rx = 0.78 + rng() * 0.34;
    const ry = 0.85 + rng() * 0.28;
    const z = (rng() - 0.5) * 0.52;
    satellites.push({
      x: Math.cos(angle) * rx,
      y: Math.sin(angle) * ry,
      z,
      isAccent: i % 3 === 0,
      size: i % 4 === 0 ? 4.6 : 3.2 + rng() * 1.1,
    });
  }

  const totalPoints = selectedPortrait.length + satellites.length + distantStarCount;
  const pointPositions = new Float32Array(totalPoints * 3);
  const pointColors = new Float32Array(totalPoints * 3);
  const pointSizes = new Float32Array(totalPoints);
  const pointPhases = new Float32Array(totalPoints);
  const pointSpeeds = new Float32Array(totalPoints);
  const pointKinds = new Float32Array(totalPoints);

  const anchorSet = new Set(anchors);

  for (let i = 0; i < selectedPortrait.length; i++) {
    const p = selectedPortrait[i];
    const isAnchor = anchorSet.has(p);
    const jitterScale = p.region === 'landmark' ? 0.0028 : 0.0055;
    const px = p.x + (rng() - 0.5) * jitterScale;
    const py = p.y + (rng() - 0.5) * jitterScale;
    const pz = p.z + (rng() - 0.5) * 0.009;

    pointPositions[i * 3] = px;
    pointPositions[i * 3 + 1] = py;
    pointPositions[i * 3 + 2] = pz;

    const useCoolBlue =
      (isAnchor && rng() < 0.14) || (p.region === 'hair' && p.edge > 0.22 && rng() < 0.1);
    let r: number;
    let g: number;
    let b: number;

    if (useCoolBlue) {
      r = 0.45;
      g = 0.65;
      b = 1.0;
    } else if (p.region === 'hair') {
      const sheen = clamp01(0.45 + p.edge * 0.55 + p.lum * 0.45);
      r = 0.72 * sheen;
      g = 0.75 * sheen;
      b = 0.84 * sheen;
    } else if (p.region === 'collar') {
      const tone = 0.42 + p.brightness * 0.45;
      r = tone;
      g = tone * 1.02;
      b = tone * 1.07;
    } else {
      const lumTone = clamp01(0.55 + p.brightness * 0.45);
      r = 0.95 * lumTone;
      g = 0.95 * lumTone;
      b = 0.98 * lumTone;
    }

    pointColors[i * 3] = clamp01(r);
    pointColors[i * 3 + 1] = clamp01(g);
    pointColors[i * 3 + 2] = clamp01(b);

    const baseSize =
      p.region === 'landmark'
        ? 2.25 + p.brightness * 1.35 + (isAnchor ? 0.65 : 0)
        : p.region === 'face'
          ? 2.0 + p.lum * 1.45 + (isAnchor ? 0.55 : 0)
          : p.region === 'hair'
            ? 1.85 + p.edge * 1.15 + (isAnchor ? 0.55 : 0)
            : 1.75 + p.brightness * 0.8;

    pointSizes[i] = baseSize;
    pointPhases[i] = rng() * Math.PI * 2;
    pointSpeeds[i] = 0.6 + rng() * 1.25;
    pointKinds[i] = isAnchor ? 1 : 0;
  }

  // Satellites
  const satOffset = selectedPortrait.length;
  for (let s = 0; s < satellites.length; s++) {
    const idx = satOffset + s;
    const sat = satellites[s];
    pointPositions[idx * 3] = sat.x;
    pointPositions[idx * 3 + 1] = sat.y;
    pointPositions[idx * 3 + 2] = sat.z;

    if (sat.isAccent) {
      pointColors[idx * 3] = 0.46;
      pointColors[idx * 3 + 1] = 0.66;
      pointColors[idx * 3 + 2] = 1.0;
    } else {
      pointColors[idx * 3] = 0.9;
      pointColors[idx * 3 + 1] = 0.91;
      pointColors[idx * 3 + 2] = 0.96;
    }

    pointSizes[idx] = sat.size;
    pointPhases[idx] = rng() * Math.PI * 2;
    pointSpeeds[idx] = 0.85 + rng() * 0.9;
    pointKinds[idx] = 2;
  }

  // Distant field stars
  const starOffset = satOffset + satellites.length;
  for (let st = 0; st < distantStarCount; st++) {
    const idx = starOffset + st;
    const angle = rng() * Math.PI * 2;
    const radius = 0.42 + Math.pow(rng(), 0.72) * 1.15;
    pointPositions[idx * 3] = Math.cos(angle) * radius;
    pointPositions[idx * 3 + 1] = Math.sin(angle) * radius * 1.08;
    pointPositions[idx * 3 + 2] = -0.35 - rng() * 0.95;

    const accent = rng() < 0.15;
    const lum = 0.48 + rng() * 0.48;
    pointColors[idx * 3] = accent ? 0.45 : lum * 0.92;
    pointColors[idx * 3 + 1] = accent ? 0.64 : lum * 0.93;
    pointColors[idx * 3 + 2] = accent ? 0.96 : lum;

    pointSizes[idx] = 1.25 + rng() * 1.5;
    pointPhases[idx] = rng() * Math.PI * 2;
    pointSpeeds[idx] = 0.4 + rng() * 1.1;
    pointKinds[idx] = 3;
  }

  // Delicate constellation connecting lines
  interface SegmentSpec {
    ax: number;
    ay: number;
    az: number;
    bx: number;
    by: number;
    bz: number;
    accent: boolean;
    alpha: number;
  }

  const segments: SegmentSpec[] = [];
  const edgeKeys = new Set<string>();
  const maxNeighborDist = 0.175;

  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const neighbors: Array<{ idx: number; dist: number }> = [];

    for (let j = 0; j < anchors.length; j++) {
      if (i === j) continue;
      const b = anchors[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz * 0.4);
      if (dist > 0.03 && dist < maxNeighborDist) {
        neighbors.push({ idx: j, dist });
      }
    }

    neighbors.sort((m, n) => m.dist - n.dist);
    const maxDegree = a.region === 'landmark' ? 2 : 3;
    const take = Math.min(maxDegree, neighbors.length);

    for (let k = 0; k < take; k++) {
      const j = neighbors[k].idx;
      const lo = i < j ? i : j;
      const hi = i < j ? j : i;
      const key = `${lo}:${hi}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);

      const b = anchors[j];
      const distFactor = 1 - smoothstep(0.035, maxNeighborDist, neighbors[k].dist);
      const isInterior = a.region === 'landmark' || b.region === 'landmark';
      const isAccent = rng() < 0.12;

      segments.push({
        ax: a.x,
        ay: a.y,
        az: a.z,
        bx: b.x,
        by: b.y,
        bz: b.z,
        accent: isAccent,
        alpha: (isInterior ? 0.085 : 0.14) + distFactor * 0.09,
      });
    }
  }

  // Connect orbital satellites only to outer hair/shoulder anchors (never crossing the central face)
  const outerAnchors = anchors.filter((a) => a.region === 'hair' || a.region === 'collar');
  if (outerAnchors.length > 0 && satellites.length > 0) {
    for (let s = 0; s < satellites.length; s++) {
      const sat = satellites[s];
      let nearestAnchor = outerAnchors[0];
      let bestDist = Infinity;

      for (let i = 0; i < outerAnchors.length; i++) {
        const a = outerAnchors[i];
        const d = Math.hypot(a.x - sat.x, a.y - sat.y);
        if (d < bestDist) {
          bestDist = d;
          nearestAnchor = a;
        }
      }

      if (bestDist < 0.62) {
        segments.push({
          ax: nearestAnchor.x,
          ay: nearestAnchor.y,
          az: nearestAnchor.z,
          bx: sat.x,
          by: sat.y,
          bz: sat.z,
          accent: sat.isAccent,
          alpha: 0.13,
        });
      }

      const nextSat = satellites[(s + 1) % satellites.length];
      if (s % 2 === 0 && Math.hypot(sat.x - nextSat.x, sat.y - nextSat.y) < 0.8) {
        segments.push({
          ax: sat.x,
          ay: sat.y,
          az: sat.z,
          bx: nextSat.x,
          by: nextSat.y,
          bz: nextSat.z,
          accent: sat.isAccent || nextSat.isAccent,
          alpha: 0.15,
        });
      }
    }
  }

  const segmentCount = segments.length;
  const linePositions = new Float32Array(segmentCount * 6);
  const lineColors = new Float32Array(segmentCount * 6);
  const lineProgress = new Float32Array(segmentCount * 2);
  const lineSeeds = new Float32Array(segmentCount * 2);
  const lineAlphas = new Float32Array(segmentCount * 2);

  for (let i = 0; i < segmentCount; i++) {
    const seg = segments[i];
    const v0 = i * 6;
    const a0 = i * 2;
    const segSeed = rng();

    linePositions[v0] = seg.ax;
    linePositions[v0 + 1] = seg.ay;
    linePositions[v0 + 2] = seg.az;
    linePositions[v0 + 3] = seg.bx;
    linePositions[v0 + 4] = seg.by;
    linePositions[v0 + 5] = seg.bz;

    const cr = seg.accent ? 0.38 : 0.78;
    const cg = seg.accent ? 0.58 : 0.80;
    const cb = seg.accent ? 0.96 : 0.87;

    lineColors[v0] = cr;
    lineColors[v0 + 1] = cg;
    lineColors[v0 + 2] = cb;
    lineColors[v0 + 3] = cr;
    lineColors[v0 + 4] = cg;
    lineColors[v0 + 5] = cb;

    lineProgress[a0] = 0;
    lineProgress[a0 + 1] = 1;
    lineSeeds[a0] = segSeed;
    lineSeeds[a0 + 1] = segSeed;
    lineAlphas[a0] = seg.alpha;
    lineAlphas[a0 + 1] = seg.alpha;
  }

  return {
    pointPositions,
    pointColors,
    pointSizes,
    pointPhases,
    pointSpeeds,
    pointKinds,
    pointCount: totalPoints,
    linePositions,
    lineColors,
    lineProgress,
    lineSeeds,
    lineAlphas,
    segmentCount,
    orbitalRings: buildOrbitalRings(rng),
  };
}

export interface ProjectedPoint2D {
  x: number;
  y: number;
  scale: number;
}

/**
 * Applies XYZ Euler rotation matching Three.js default 'XYZ' rotation order.
 */
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

  // Rotate X
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  // Rotate Y
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;
  // Rotate Z
  const x3 = x2 * cz - y1 * sz;
  const y3 = x2 * sz + y1 * cz;

  return [x3, y3, z2];
}

/**
 * Projects a 3D point onto a square 2D viewport matching Three.js PerspectiveCamera.
 */
export function projectPerspectivePoint(
  x: number,
  y: number,
  z: number,
  cameraZ: number,
  fovDeg: number,
  viewportSize: number,
  cameraY = 0.02,
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

