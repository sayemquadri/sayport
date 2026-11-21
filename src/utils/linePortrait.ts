export interface PortraitImageBuffer {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

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
  speed: number;
  isAccent: boolean;
  points: Float32Array;
  satellites: OrbitalSatelliteSpec[];
}

export interface LineDotPortraitData {
  /** LineSegments XYZ positions traced directly from the artwork strokes */
  linePositions: Float32Array;
  /** RGB colors per vertex */
  lineColors: Float32Array;
  /** Normalized progress along each traced polyline (0 -> 1) */
  lineProgress: Float32Array;
  /** Random seed per polyline for staggered light pulses */
  lineSeeds: Float32Array;
  /** Base line opacity per vertex */
  lineAlphas: Float32Array;
  /** Number of line segments */
  segmentCount: number;

  /** Extracted circular intersection/contour nodes + quiet background stars */
  pointPositions: Float32Array;
  pointColors: Float32Array;
  pointSizes: Float32Array;
  pointPhases: Float32Array;
  pointSpeeds: Float32Array;
  pointAlphas: Float32Array;
  /** 1 = portrait node dot, 3 = subtle background star */
  pointKinds: Float32Array;
  pointCount: number;

  /** Elliptical orbital trajectories surrounding the portrait */
  orbitalTracks: OrbitalTrackData[];
}

export interface DotNode {
  u: number;
  v: number;
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface Polyline2D {
  points: Array<{ u: number; v: number }>;
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
 * Maps normalized image coordinates (u, v) of the square line-and-dot artwork
 * onto balanced 3D cranial/facial relief depth (Z) for subtle mouse parallax.
 */
export function estimateLinePortraitDepth(u: number, v: number): number {
  const cx = 0.49;
  const cy = 0.50;
  const dx = (u - cx) / 0.25;
  const dy = (v - cy) / 0.30;
  const radialSq = dx * dx + dy * dy;

  // Base cranial depth
  let z = radialSq < 1.25 ? Math.sqrt(Math.max(0, 1.25 - radialSq)) * 0.22 - 0.05 : -0.10;

  // Forehead & messy bangs volume hanging over brow
  const hairFrontDx = (u - 0.49) / 0.24;
  const hairFrontDy = (v - 0.36) / 0.17;
  z += 0.06 * Math.exp(-(hairFrontDx * hairFrontDx + hairFrontDy * hairFrontDy));

  // Nose bridge & tip projection
  const noseDx = (u - 0.485) / 0.045;
  const noseDy = (v - 0.58) / 0.055;
  z += 0.095 * Math.exp(-(noseDx * noseDx + noseDy * noseDy));

  // Brow & eyes plane
  const browDx = (u - 0.49) / 0.16;
  const browDy = (v - 0.49) / 0.035;
  z += 0.045 * Math.exp(-(browDx * browDx + browDy * browDy));

  // Lips & chin forward curve
  const mouthDx = (u - 0.49) / 0.085;
  const mouthDy = (v - 0.675) / 0.045;
  z += 0.055 * Math.exp(-(mouthDx * mouthDx + mouthDy * mouthDy));

  // Neck & upper jacket shoulders recede softly behind face
  if (v > 0.71) {
    z -= smoothstep(0.71, 0.98, v) * 0.12;
  }

  return z;
}

/**
 * Binarizes a dark-ink-on-light-background raster image into an ink mask (1 = ink, 0 = paper).
 */
export function extractInkMask(
  buffer: PortraitImageBuffer,
  inkThreshold = 0.3,
): Uint8Array {
  const { width, height, data } = buffer;
  const mask = new Uint8Array(width * height);
  if (width < 4 || height < 4 || data.length < width * height * 4) return mask;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const alpha = data[idx + 3] / 255;
    if (alpha < 0.2) continue;
    const lum = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
    const darkness = 1 - lum;
    if (darkness * alpha >= inkThreshold) {
      mask[i] = 1;
    }
  }

  return mask;
}

/**
 * Detects circular node dots from the binary ink mask by measuring local disk density
 * and rejecting thin strokes or elongated thick eyebrows.
 */
export function detectDotNodes(
  mask: Uint8Array,
  width: number,
  height: number,
): DotNode[] {
  const diskOffsets: Array<[number, number]> = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy <= 5) {
        diskOffsets.push([dx, dy]);
      }
    }
  }
  const minFill = Math.floor(diskOffsets.length * 0.72); // >= 15 of 21 pixels

  const denseCore = new Uint8Array(width * height);
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      if (!mask[y * width + x]) continue;
      let count = 0;
      for (let k = 0; k < diskOffsets.length; k++) {
        const nx = x + diskOffsets[k][0];
        const ny = y + diskOffsets[k][1];
        count += mask[ny * width + nx];
      }
      if (count >= minFill) {
        denseCore[y * width + x] = 1;
      }
    }
  }

  const visited = new Uint8Array(width * height);
  const rawNodes: DotNode[] = [];
  const aspect = width / height;
  const scaleX = 1.62 * aspect;
  const scaleY = 1.62;

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const startIdx = y * width + x;
      if (!denseCore[startIdx] || visited[startIdx]) continue;

      const queue: number[] = [startIdx];
      visited[startIdx] = 1;
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;

      for (let q = 0; q < queue.length; q++) {
        const cur = queue[q];
        const cx = cur % width;
        const cy = Math.floor(cur / width);
        sumX += cx;
        sumY += cy;
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 1 || nx >= width - 1 || ny < 1 || ny >= height - 1) continue;
            const ni = ny * width + nx;
            if (denseCore[ni] && !visited[ni]) {
              visited[ni] = 1;
              queue.push(ni);
            }
          }
        }
      }

      const spanW = maxX - minX + 1;
      const spanH = maxY - minY + 1;
      const elongation = Math.max(spanW, spanH) / Math.max(1, Math.min(spanW, spanH));

      // Keep circular dots while excluding elongated dark eyebrows or wide fills
      if (count < 2 || count > 90 || elongation > 2.25) continue;

      const u = (sumX / count) / (width - 1);
      const v = (sumY / count) / (height - 1);
      const radius = Math.sqrt(count / Math.PI);

      rawNodes.push({
        u,
        v,
        x: (u - 0.5) * scaleX,
        y: (0.51 - v) * scaleY,
        z: estimateLinePortraitDepth(u, v) + 0.005,
        radius,
      });
    }
  }

  // Merge any accidentally split fragments closer than 0.018 in normalized UV space
  const merged: DotNode[] = [];
  for (let i = 0; i < rawNodes.length; i++) {
    const candidate = rawNodes[i];
    let duplicate = false;
    for (let j = 0; j < merged.length; j++) {
      const m = merged[j];
      if (Math.hypot(candidate.u - m.u, candidate.v - m.v) < 0.016) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) merged.push(candidate);
  }

  return merged;
}

/**
 * Applies Zhang-Suen topological thinning to reduce strokes to 1-pixel curves
 * while preserving line connectivity, junctions, and endpoints.
 */
export function thinInkMask(mask: Uint8Array, width: number, height: number): Uint8Array {
  const cur = new Uint8Array(mask);
  const toDelete: number[] = [];

  for (let iter = 0; iter < 14; iter++) {
    let changed = false;

    for (let step = 0; step < 2; step++) {
      toDelete.length = 0;

      for (let y = 1; y < height - 1; y++) {
        const row = y * width;
        for (let x = 1; x < width - 1; x++) {
          const i = row + x;
          if (!cur[i]) continue;

          const p2 = cur[(y - 1) * width + x];
          const p3 = cur[(y - 1) * width + (x + 1)];
          const p4 = cur[row + (x + 1)];
          const p5 = cur[(y + 1) * width + (x + 1)];
          const p6 = cur[(y + 1) * width + x];
          const p7 = cur[(y + 1) * width + (x - 1)];
          const p8 = cur[row + (x - 1)];
          const p9 = cur[(y - 1) * width + (x - 1)];

          const neighbors = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (neighbors < 2 || neighbors > 6) continue;

          let transitions = 0;
          if (!p2 && p3) transitions++;
          if (!p3 && p4) transitions++;
          if (!p4 && p5) transitions++;
          if (!p5 && p6) transitions++;
          if (!p6 && p7) transitions++;
          if (!p7 && p8) transitions++;
          if (!p8 && p9) transitions++;
          if (!p9 && p2) transitions++;
          if (transitions !== 1) continue;

          if (step === 0) {
            if (p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0) continue;
          } else {
            if (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) continue;
          }

          toDelete.push(i);
        }
      }

      if (toDelete.length > 0) {
        changed = true;
        for (let k = 0; k < toDelete.length; k++) {
          cur[toDelete[k]] = 0;
        }
      }
    }

    if (!changed) break;
  }

  return cur;
}

function simplifyPolylineRdp(
  pts: Array<{ x: number; y: number }>,
  epsilon: number,
): Array<{ x: number; y: number }> {
  if (pts.length <= 2) return pts;

  const first = pts[0];
  const last = pts[pts.length - 1];
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const lenSq = dx * dx + dy * dy;

  let maxDistSq = -1;
  let splitIdx = 0;

  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    let d2: number;
    if (lenSq === 0) {
      d2 = (p.x - first.x) ** 2 + (p.y - first.y) ** 2;
    } else {
      const t = clamp01(((p.x - first.x) * dx + (p.y - first.y) * dy) / lenSq);
      const projX = first.x + t * dx;
      const projY = first.y + t * dy;
      d2 = (p.x - projX) ** 2 + (p.y - projY) ** 2;
    }
    if (d2 > maxDistSq) {
      maxDistSq = d2;
      splitIdx = i;
    }
  }

  if (maxDistSq > epsilon * epsilon) {
    const left = simplifyPolylineRdp(pts.slice(0, splitIdx + 1), epsilon);
    const right = simplifyPolylineRdp(pts.slice(splitIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

const NEIGHBOR_8: ReadonlyArray<[number, number]> = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

/**
 * Traces continuous 8-connected vector-style polylines from the 1px thinned skeleton
 * and simplifies them via Ramer-Douglas-Peucker to eliminate pixel staircasing.
 */
export function traceSkeletonPolylines(
  skeleton: Uint8Array,
  width: number,
  height: number,
): Polyline2D[] {
  const degree = new Uint8Array(width * height);
  const activePixels: number[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (!skeleton[i]) continue;
      let deg = 0;
      for (let k = 0; k < NEIGHBOR_8.length; k++) {
        const nx = x + NEIGHBOR_8[k][0];
        const ny = y + NEIGHBOR_8[k][1];
        if (skeleton[ny * width + nx]) deg++;
      }
      degree[i] = deg;
      if (deg > 0) activePixels.push(i);
    }
  }

  const visitedEdges = new Set<string>();
  const edgeKey = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);

  const walkChain = (start: number, firstNext: number): Array<{ x: number; y: number }> => {
    const chain: Array<{ x: number; y: number }> = [
      { x: start % width, y: Math.floor(start / width) },
    ];
    let prev = start;
    let cur = firstNext;
    visitedEdges.add(edgeKey(prev, cur));

    for (let guard = 0; guard < 2000; guard++) {
      const cx = cur % width;
      const cy = Math.floor(cur / width);
      chain.push({ x: cx, y: cy });

      // Stop at junctions or endpoints after recording them
      if (cur !== start && degree[cur] !== 2) break;

      const prevDx = cx - (prev % width);
      const prevDy = cy - Math.floor(prev / width);

      let bestNext = -1;
      let bestAlignment = -99;

      for (let k = 0; k < NEIGHBOR_8.length; k++) {
        const dx = NEIGHBOR_8[k][0];
        const dy = NEIGHBOR_8[k][1];
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 1 || nx >= width - 1 || ny < 1 || ny >= height - 1) continue;
        const ni = ny * width + nx;
        if (!skeleton[ni]) continue;
        if (visitedEdges.has(edgeKey(cur, ni))) continue;

        // Prefer forward direction and cardinal transitions over sharp reversals
        const len = Math.hypot(dx, dy);
        const align = (dx * prevDx + dy * prevDy) / len;
        if (align > bestAlignment) {
          bestAlignment = align;
          bestNext = ni;
        }
      }

      if (bestNext === -1) break;
      visitedEdges.add(edgeKey(cur, bestNext));
      prev = cur;
      cur = bestNext;
      if (cur === start) {
        chain.push({ x: cur % width, y: Math.floor(cur / width) });
        break;
      }
    }

    return chain;
  };

  const polylines: Polyline2D[] = [];

  // Pass 1: Trace from endpoints and junctions (degree !== 2)
  for (let p = 0; p < activePixels.length; p++) {
    const idx = activePixels[p];
    if (degree[idx] === 2) continue;

    const x = idx % width;
    const y = Math.floor(idx / width);
    for (let k = 0; k < NEIGHBOR_8.length; k++) {
      const nx = x + NEIGHBOR_8[k][0];
      const ny = y + NEIGHBOR_8[k][1];
      const ni = ny * width + nx;
      if (!skeleton[ni]) continue;
      if (visitedEdges.has(edgeKey(idx, ni))) continue;

      const raw = walkChain(idx, ni);
      if (raw.length >= 2) {
        const simplified = simplifyPolylineRdp(raw, 0.58);
        polylines.push({
          points: simplified.map((pt) => ({
            u: pt.x / (width - 1),
            v: pt.y / (height - 1),
          })),
        });
      }
    }
  }

  // Pass 2: Trace closed loops (all remaining unvisited edges where degree === 2)
  for (let p = 0; p < activePixels.length; p++) {
    const idx = activePixels[p];
    const x = idx % width;
    const y = Math.floor(idx / width);
    for (let k = 0; k < NEIGHBOR_8.length; k++) {
      const nx = x + NEIGHBOR_8[k][0];
      const ny = y + NEIGHBOR_8[k][1];
      const ni = ny * width + nx;
      if (!skeleton[ni]) continue;
      if (visitedEdges.has(edgeKey(idx, ni))) continue;

      const raw = walkChain(idx, ni);
      if (raw.length >= 4) {
        const simplified = simplifyPolylineRdp(raw, 0.72);
        polylines.push({
          points: simplified.map((pt) => ({
            u: pt.x / (width - 1),
            v: pt.y / (height - 1),
          })),
        });
      }
    }
  }

  return polylines;
}

function buildOrbitalTracks(rng: () => number): OrbitalTrackData[] {
  const configs = [
    {
      radiusX: 1.04,
      radiusY: 0.94,
      tiltX: 1.14,
      tiltY: 0.3,
      tiltZ: -0.22,
      speed: 0.036,
      isAccent: true,
      satCount: 2,
    },
    {
      radiusX: 1.16,
      radiusY: 1.06,
      tiltX: 1.28,
      tiltY: -0.44,
      tiltZ: 0.28,
      speed: -0.025,
      isAccent: false,
      satCount: 2,
    },
  ];

  const segmentsPerRing = 160;

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
      const baseAngle = ((s + 0.3 + ringIdx * 0.45) / cfg.satCount) * Math.PI * 2;
      satellites.push({
        phase: (baseAngle + (rng() - 0.5) * 0.35) % (Math.PI * 2),
        speed: cfg.speed * (1.45 + s * 0.35),
        size: cfg.isAccent && s === 0 ? 4.2 : 3.2,
        isAccent: cfg.isAccent || s === 0,
      });
    }

    return {
      radiusX: cfg.radiusX,
      radiusY: cfg.radiusY,
      tiltX: cfg.tiltX,
      tiltY: cfg.tiltY,
      tiltZ: cfg.tiltZ,
      speed: cfg.speed,
      isAccent: cfg.isAccent,
      points: pts,
      satellites,
    };
  });
}

/**
 * Reconstructs a clean 3D celestial line-and-dot network portrait directly from
 * the black-on-white vector-style line drawing buffer.
 */
export function buildLineDotPortrait(
  buffer: PortraitImageBuffer,
  seed = 20261121,
): LineDotPortraitData {
  const rng = createSeededRng(seed);
  const { width, height } = buffer;
  const mask = extractInkMask(buffer, 0.32);

  // 1. Detect circular intersection nodes prior to thinning
  const nodes = detectDotNodes(mask, width, height);

  // 2. Thin strokes to 1px and trace smooth simplified polylines
  const skeleton = thinInkMask(mask, width, height);
  const polylines = traceSkeletonPolylines(skeleton, width, height);

  const aspect = width > 0 && height > 0 ? width / height : 1;
  const scaleX = 1.62 * aspect;
  const scaleY = 1.62;

  interface SegmentEntry {
    ax: number;
    ay: number;
    az: number;
    bx: number;
    by: number;
    bz: number;
    p0: number;
    p1: number;
    seed: number;
    r: number;
    g: number;
    b: number;
    alpha: number;
  }

  const segments: SegmentEntry[] = [];

  for (let pIdx = 0; pIdx < polylines.length; pIdx++) {
    const poly = polylines[pIdx];
    const pts = poly.points;
    if (pts.length < 2) continue;

    // Cumulative arc length along the polyline so travelling light pulses glide smoothly
    const arcLengths = new Float32Array(pts.length);
    let totalLen = 0;
    for (let i = 1; i < pts.length; i++) {
      totalLen += Math.hypot(pts[i].u - pts[i - 1].u, pts[i].v - pts[i - 1].v);
      arcLengths[i] = totalLen;
    }
    if (totalLen <= 0) continue;

    const polySeed = rng();

    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const midU = (a.u + b.u) * 0.5;
      const midV = (a.v + b.v) * 0.5;

      const isFaceCore =
        midU > 0.28 && midU < 0.70 && midV > 0.43 && midV < 0.76;
      const isCollar = midV >= 0.74;
      const isAccentStrand = !isFaceCore && rng() < 0.14;

      let r = 0.86;
      let g = 0.88;
      let bCol = 0.93;
      let alpha = 0.74;

      if (isFaceCore) {
        r = 0.95;
        g = 0.95;
        bCol = 0.98;
        alpha = 0.9;
      } else if (isCollar) {
        r = 0.72;
        g = 0.76;
        bCol = 0.85;
        alpha = 0.6;
      } else if (isAccentStrand) {
        r = 0.46;
        g = 0.66;
        bCol = 0.98;
        alpha = 0.68;
      }

      segments.push({
        ax: (a.u - 0.5) * scaleX,
        ay: (0.51 - a.v) * scaleY,
        az: estimateLinePortraitDepth(a.u, a.v),
        bx: (b.u - 0.5) * scaleX,
        by: (0.51 - b.v) * scaleY,
        bz: estimateLinePortraitDepth(b.u, b.v),
        p0: arcLengths[i] / totalLen,
        p1: arcLengths[i + 1] / totalLen,
        seed: polySeed,
        r,
        g,
        b: bCol,
        alpha,
      });
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

    linePositions[v0] = seg.ax;
    linePositions[v0 + 1] = seg.ay;
    linePositions[v0 + 2] = seg.az;
    linePositions[v0 + 3] = seg.bx;
    linePositions[v0 + 4] = seg.by;
    linePositions[v0 + 5] = seg.bz;

    lineColors[v0] = seg.r;
    lineColors[v0 + 1] = seg.g;
    lineColors[v0 + 2] = seg.b;
    lineColors[v0 + 3] = seg.r;
    lineColors[v0 + 4] = seg.g;
    lineColors[v0 + 5] = seg.b;

    lineProgress[a0] = seg.p0;
    lineProgress[a0 + 1] = seg.p1;
    lineSeeds[a0] = seg.seed;
    lineSeeds[a0 + 1] = seg.seed;
    lineAlphas[a0] = seg.alpha;
    lineAlphas[a0 + 1] = seg.alpha;
  }

  // 3. Build point buffers from detected circular nodes + sparse quiet distant stars
  const distantStarCount = 64;
  const pointCount = nodes.length + distantStarCount;
  const pointPositions = new Float32Array(pointCount * 3);
  const pointColors = new Float32Array(pointCount * 3);
  const pointSizes = new Float32Array(pointCount);
  const pointPhases = new Float32Array(pointCount);
  const pointSpeeds = new Float32Array(pointCount);
  const pointAlphas = new Float32Array(pointCount);
  const pointKinds = new Float32Array(pointCount);

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    pointPositions[i * 3] = n.x;
    pointPositions[i * 3 + 1] = n.y;
    pointPositions[i * 3 + 2] = n.z;

    const isAccent = rng() < 0.24;
    if (isAccent) {
      pointColors[i * 3] = 0.48;
      pointColors[i * 3 + 1] = 0.68;
      pointColors[i * 3 + 2] = 1.0;
    } else {
      pointColors[i * 3] = 0.96;
      pointColors[i * 3 + 1] = 0.96;
      pointColors[i * 3 + 2] = 0.99;
    }

    pointSizes[i] = Math.max(2.9, Math.min(4.8, 2.0 + n.radius * 0.85));
    pointPhases[i] = rng() * Math.PI * 2;
    pointSpeeds[i] = 0.6 + rng() * 1.1;
    pointAlphas[i] = 0.95;
    pointKinds[i] = 1;
  }

  for (let st = 0; st < distantStarCount; st++) {
    const idx = nodes.length + st;
    const angle = rng() * Math.PI * 2;
    const radius = 0.62 + Math.pow(rng(), 0.7) * 1.15;
    pointPositions[idx * 3] = Math.cos(angle) * radius;
    pointPositions[idx * 3 + 1] = Math.sin(angle) * radius;
    pointPositions[idx * 3 + 2] = -0.45 - rng() * 0.85;

    const isBlue = rng() < 0.18;
    const lum = 0.45 + rng() * 0.35;
    pointColors[idx * 3] = isBlue ? 0.52 : lum * 0.9;
    pointColors[idx * 3 + 1] = isBlue ? 0.7 : lum * 0.92;
    pointColors[idx * 3 + 2] = isBlue ? 0.98 : lum;

    pointSizes[idx] = 1.2 + rng() * 1.1;
    pointPhases[idx] = rng() * Math.PI * 2;
    pointSpeeds[idx] = 0.35 + rng() * 0.85;
    pointAlphas[idx] = 0.2 + rng() * 0.18;
    pointKinds[idx] = 3;
  }

  return {
    linePositions,
    lineColors,
    lineProgress,
    lineSeeds,
    lineAlphas,
    segmentCount,
    pointPositions,
    pointColors,
    pointSizes,
    pointPhases,
    pointSpeeds,
    pointAlphas,
    pointKinds,
    pointCount,
    orbitalTracks: buildOrbitalTracks(rng),
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
