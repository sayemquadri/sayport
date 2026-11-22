export type FacialPartTag =
  | 'face'
  | 'brow'
  | 'eyelid'
  | 'eyeball'
  | 'nose'
  | 'lips'
  | 'jaw'
  | 'ear'
  | 'hair'
  | 'collar';

export interface FaceLandmark {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface FaceMeshPart {
  name: 'craniumAndFace' | 'leftEye' | 'rightEye' | 'hairLocks' | 'collarAndShoulders';
  /** Flat XYZ vertex positions */
  positions: Float32Array;
  /** Flat XYZ vertex normals (unit length) */
  normals: Float32Array;
  /** Surface sampling importance per vertex (>= 0) */
  weights: Float32Array;
  /** Surface luminosity/albedo multiplier per vertex (0..1) */
  albedos: Float32Array;
  /** Cool-blue accent blend per vertex (0..1) */
  accents: Float32Array;
  /** Anatomical region tag per vertex */
  tags: FacialPartTag[];
  /** Triangle index buffer (3 indices per triangle) */
  indices: Uint32Array;
}

export interface FaceIdentityModel {
  landmarks: readonly FaceLandmark[];
  parts: readonly FaceMeshPart[];
  metrics: {
    totalVertices: number;
    totalTriangles: number;
    interpupillaryDistance: number;
    faceWidthAtCheeks: number;
    noseTipProtrusionZ: number;
    chinY: number;
    crownY: number;
  };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function gaussian2(x: number, y: number, cx: number, cy: number, sx: number, sy: number): number {
  const dx = (x - cx) / sx;
  const dy = (y - cy) / sy;
  return Math.exp(-(dx * dx + dy * dy));
}

function distToSegment2D(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { dist: number; t: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const t = lenSq > 0 ? clamp01(((px - ax) * dx + (py - ay) * dy) / lenSq) : 0;
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return { dist: Math.hypot(px - projX, py - projY), t };
}

function distToPolyline2D(
  px: number,
  py: number,
  pts: ReadonlyArray<readonly [number, number]>,
): { dist: number; t: number } {
  let minDist = Infinity;
  let bestT = 0;
  const segCount = Math.max(1, pts.length - 1);
  for (let i = 0; i < pts.length - 1; i++) {
    const res = distToSegment2D(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    if (res.dist < minDist) {
      minDist = res.dist;
      bestT = (i + res.t) / segCount;
    }
  }
  return { dist: minDist, t: bestT };
}

/**
 * Authoritative anatomical landmarks calibrated to Sayem Quadri's reference portraits:
 * youthful early-20s rounded-oval proportions, natural medium straight-rounded nose,
 * focused dark hooded eyes, strong brows, soft cheeks/jawline, and tousled wavy bangs
 * draping down across the forehead just above the brows.
 */
export const SAYEM_FACE_LANDMARKS: readonly FaceLandmark[] = [
  { id: 'crown_top', x: 0.0, y: 0.56, z: 0.02 },
  { id: 'forehead_center', x: 0.0, y: 0.20, z: 0.244 },
  { id: 'glabella', x: 0.0, y: 0.068, z: 0.258 },
  { id: 'left_brow_inner', x: -0.052, y: 0.058, z: 0.268 },
  { id: 'left_brow_peak', x: -0.140, y: 0.072, z: 0.244 },
  { id: 'left_brow_tail', x: -0.222, y: 0.064, z: 0.178 },
  { id: 'right_brow_inner', x: 0.052, y: 0.060, z: 0.268 },
  { id: 'right_brow_peak', x: 0.144, y: 0.074, z: 0.242 },
  { id: 'right_brow_tail', x: 0.224, y: 0.066, z: 0.176 },
  { id: 'left_eye_center', x: -0.132, y: 0.020, z: 0.214 },
  { id: 'right_eye_center', x: 0.132, y: 0.022, z: 0.214 },
  { id: 'nasion', x: 0.0, y: 0.036, z: 0.236 },
  { id: 'nose_bridge_mid', x: 0.002, y: -0.024, z: 0.288 },
  { id: 'nose_tip', x: 0.002, y: -0.082, z: 0.342 },
  { id: 'subnasale', x: 0.002, y: -0.120, z: 0.274 },
  { id: 'left_alar', x: -0.064, y: -0.098, z: 0.268 },
  { id: 'right_alar', x: 0.066, y: -0.098, z: 0.268 },
  { id: 'left_cheek', x: -0.208, y: -0.088, z: 0.228 },
  { id: 'right_cheek', x: 0.208, y: -0.088, z: 0.228 },
  { id: 'upper_lip_center', x: 0.001, y: -0.176, z: 0.278 },
  { id: 'mouth_left', x: -0.098, y: -0.194, z: 0.226 },
  { id: 'mouth_right', x: 0.100, y: -0.193, z: 0.226 },
  { id: 'lower_lip_center', x: 0.001, y: -0.214, z: 0.276 },
  { id: 'chin_pad', x: 0.0, y: -0.326, z: 0.240 },
  { id: 'chin_base', x: 0.0, y: -0.405, z: 0.180 },
  { id: 'left_jaw_angle', x: -0.262, y: -0.200, z: 0.038 },
  { id: 'right_jaw_angle', x: 0.262, y: -0.200, z: 0.038 },
];

const LEFT_BROW_CURVE: ReadonlyArray<readonly [number, number]> = [
  [-0.046, 0.056],
  [-0.095, 0.064],
  [-0.145, 0.070],
  [-0.195, 0.068],
  [-0.226, 0.062],
];

const RIGHT_BROW_CURVE: ReadonlyArray<readonly [number, number]> = [
  [0.046, 0.058],
  [0.095, 0.066],
  [0.148, 0.072],
  [0.196, 0.070],
  [0.228, 0.064],
];

const LEFT_UPPER_LID: ReadonlyArray<readonly [number, number]> = [
  [-0.186, 0.017],
  [-0.158, 0.032],
  [-0.132, 0.034],
  [-0.105, 0.030],
  [-0.080, 0.016],
];

const LEFT_LOWER_LID: ReadonlyArray<readonly [number, number]> = [
  [-0.184, 0.016],
  [-0.156, 0.008],
  [-0.132, 0.006],
  [-0.106, 0.008],
  [-0.080, 0.015],
];

const RIGHT_UPPER_LID: ReadonlyArray<readonly [number, number]> = [
  [0.080, 0.018],
  [0.106, 0.032],
  [0.132, 0.035],
  [0.160, 0.033],
  [0.186, 0.019],
];

const RIGHT_LOWER_LID: ReadonlyArray<readonly [number, number]> = [
  [0.080, 0.016],
  [0.106, 0.009],
  [0.132, 0.007],
  [0.158, 0.009],
  [0.184, 0.017],
];

/**
 * Irregular wavy hairline where Sayem's tousled bangs drape down over the upper forehead
 * and temples, leaving only the lower glabella / supra-brow skin gently visible.
 */
function getBangsHairlineY(x: number): number {
  const absX = Math.abs(x);
  const centerPartLift = 0.024 * Math.exp(-(((x - 0.032) / 0.042) ** 2));
  const leftBangDip = 0.036 * Math.exp(-(((x + 0.045) / 0.048) ** 2));
  const rightBangDip = 0.028 * Math.exp(-(((x - 0.115) / 0.045) ** 2));
  const farLeftDip = 0.022 * Math.exp(-(((x + 0.165) / 0.045) ** 2));
  const wave = 0.013 * Math.sin(x * 34.0 + 0.6) + 0.008 * Math.cos(x * 58.0 - 0.4);
  const templeDrop = 0.042 * smoothstep(0.17, 0.29, absX);
  return 0.145 + centerPartLift - leftBangDip - rightBangDip - farLeftDip - templeDrop + wave;
}

/**
 * Computes normalized vertex normals for an indexed triangle mesh via area-weighted face normals.
 */
export function computeIndexedNormals(
  positions: Float32Array,
  indices: Uint32Array,
): Float32Array {
  const normals = new Float32Array(positions.length);

  for (let i = 0; i < indices.length; i += 3) {
    const ia = indices[i] * 3;
    const ib = indices[i + 1] * 3;
    const ic = indices[i + 2] * 3;

    const ax = positions[ia];
    const ay = positions[ia + 1];
    const az = positions[ia + 2];

    const abx = positions[ib] - ax;
    const aby = positions[ib + 1] - ay;
    const abz = positions[ib + 2] - az;

    const acx = positions[ic] - ax;
    const acy = positions[ic + 1] - ay;
    const acz = positions[ic + 2] - az;

    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;

    normals[ia] += nx;
    normals[ia + 1] += ny;
    normals[ia + 2] += nz;

    normals[ib] += nx;
    normals[ib + 1] += ny;
    normals[ib + 2] += nz;

    normals[ic] += nx;
    normals[ic + 1] += ny;
    normals[ic + 2] += nz;
  }

  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
    if (len > 1e-8) {
      normals[i] /= len;
      normals[i + 1] /= len;
      normals[i + 2] /= len;
    } else {
      normals[i + 2] = 1;
    }
  }

  return normals;
}

/**
 * Evaluates a point on the continuous 3D facial surface parameterized by
 * azimuth `theta` (-0.54*PI .. +0.54*PI) and normalized vertical `v` (0 = crown, 1 = neck base).
 */
export function evaluateFaceSurfacePoint(
  theta: number,
  v: number,
): {
  x: number;
  y: number;
  z: number;
  weight: number;
  albedo: number;
  accent: number;
  tag: FacialPartTag;
} {
  // Vertical coordinate: crown (+0.48) down to neck transition (-0.52)
  const y = 0.48 - v * 1.00;

  // Base horizontal radius profile: rounded cranium -> cheekbones -> soft youthful oval jaw -> neck
  let rx = 0.308;
  let rz = 0.312;

  if (y > 0.12) {
    // Cranium dome (covered by hair mass)
    const domeT = clamp01((y - 0.12) / 0.36);
    const arch = Math.sqrt(Math.max(0.04, 1 - domeT * domeT * 0.88));
    rx = 0.300 * arch;
    rz = 0.310 * arch;
  } else if (y > -0.11) {
    // Temple / zygomatic / cheek zone — youthful fullness
    const cheekWave = Math.sin(clamp01((0.12 - y) / 0.23) * Math.PI);
    rx = 0.300 + 0.012 * cheekWave;
    rz = 0.302 - 0.012 * ((0.12 - y) / 0.23);
  } else if (y > -0.395) {
    // Soft, rounded-oval early-20s jawline & chin (avoid narrow pointy V-chin)
    const jawT = clamp01((-0.11 - y) / 0.285);
    const taper = Math.pow(jawT, 1.68);
    rx = 0.304 * (1 - 0.50 * taper);
    rz = 0.292 * (1 - 0.26 * taper);
  } else {
    // Smooth transition into neck cylinder
    const neckT = clamp01((-0.395 - y) / 0.125);
    const chinPinch = Math.sin(neckT * Math.PI) * 0.012;
    rx = 0.168 + 0.014 * neckT - chinPinch;
    rz = 0.172 - 0.014 * neckT;
  }

  const frontFactor = Math.cos(theta);
  const absTheta = Math.abs(theta);
  let x = Math.sin(theta) * rx;
  let z = Math.cos(theta) * rz - 0.032;

  // Gentle chin tuck backward under the chin into the neck
  if (y < -0.388 && absTheta < 1.0) {
    const underChin = smoothstep(-0.388, -0.455, y) * Math.cos(absTheta * 1.25);
    z -= underChin * 0.095;
  }

  // Cranial crown rounding at top
  if (y > 0.40) {
    const topPinch = smoothstep(0.40, 0.48, y);
    z *= 1 - topPinch * 0.35;
  }

  const frontMask = smoothstep(-0.15, 0.35, frontFactor);
  const xSym = x - 0.002;

  // 1. Lower forehead plane
  z += 0.016 * gaussian2(xSym, y, 0.0, 0.17, 0.15, 0.08) * frontMask;

  // 2. Brow ridge & glabella
  const browRidge =
    gaussian2(xSym, y, -0.132, 0.068, 0.098, 0.025) +
    gaussian2(xSym, y, 0.134, 0.070, 0.098, 0.025) +
    0.55 * gaussian2(xSym, y, 0.0, 0.064, 0.052, 0.024);
  z += 0.026 * browRidge * frontMask;

  // 3. Recessed orbital eye sockets
  const leftSocket = gaussian2(xSym, y, -0.132, 0.020, 0.064, 0.034);
  const rightSocket = gaussian2(xSym, y, 0.132, 0.022, 0.064, 0.034);
  const socketDepth = Math.max(leftSocket, rightSocket);
  z -= 0.054 * socketDepth * frontMask;

  // Eyelid folds arching around the eye sockets
  const upperLidL = distToPolyline2D(xSym, y, LEFT_UPPER_LID);
  const lowerLidL = distToPolyline2D(xSym, y, LEFT_LOWER_LID);
  const upperLidR = distToPolyline2D(xSym, y, RIGHT_UPPER_LID);
  const lowerLidR = distToPolyline2D(xSym, y, RIGHT_LOWER_LID);

  const eyelidProtrusion =
    0.024 * Math.exp(-(upperLidL.dist * upperLidL.dist) / (0.012 * 0.012)) +
    0.015 * Math.exp(-(lowerLidL.dist * lowerLidL.dist) / (0.011 * 0.011)) +
    0.024 * Math.exp(-(upperLidR.dist * upperLidR.dist) / (0.012 * 0.012)) +
    0.015 * Math.exp(-(lowerLidR.dist * lowerLidR.dist) / (0.011 * 0.011));
  z += eyelidProtrusion * frontMask;

  // 4. Nose bridge, rounded tip, alar wings, and subtle nostril recess
  const noseBridgeMask =
    smoothstep(0.048, -0.012, y) * smoothstep(-0.118, -0.078, y);
  const bridgeWidth = 0.028 + smoothstep(0.025, -0.085, y) * 0.016;
  const bridgeProfile = Math.exp(-(((xSym - 0.002) / bridgeWidth) ** 2));
  const bridgeHeight = 0.066 * smoothstep(0.048, -0.082, y);
  z += bridgeProfile * (0.022 + bridgeHeight) * noseBridgeMask * frontMask;

  const tipGauss = gaussian2(xSym, y, 0.002, -0.082, 0.037, 0.030);
  z += 0.078 * tipGauss * frontMask;

  const leftAla = gaussian2(xSym, y, -0.052, -0.095, 0.026, 0.020);
  const rightAla = gaussian2(xSym, y, 0.055, -0.095, 0.026, 0.020);
  z += 0.034 * (leftAla + rightAla) * frontMask;

  const leftNostril = gaussian2(xSym, y, -0.027, -0.108, 0.015, 0.010);
  const rightNostril = gaussian2(xSym, y, 0.029, -0.108, 0.015, 0.010);
  z -= 0.022 * (leftNostril + rightNostril) * frontMask;

  // 5. Youthful soft rounded cheeks
  const cheekFullness =
    gaussian2(xSym, y, -0.186, -0.088, 0.094, 0.082) +
    gaussian2(xSym, y, 0.188, -0.088, 0.094, 0.082);
  z += 0.034 * cheekFullness * frontMask;

  // 6. Sculpted lips (Cupid's bow upper lip, distinct parting crease, fuller lower lip)
  const philtrumDimple = gaussian2(xSym, y, 0.001, -0.144, 0.017, 0.020);
  z -= 0.009 * philtrumDimple * frontMask;

  const lipWidthEnvelope = smoothstep(0.106, 0.026, Math.abs(xSym));
  const cupidsBowY = -0.176 + 0.0045 * Math.cos(clamp01(Math.abs(xSym) / 0.042) * Math.PI);
  const upperLip = Math.exp(-(((y - cupidsBowY) / 0.014) ** 2)) * lipWidthEnvelope;
  const lipPart = Math.exp(-(((y + 0.194) / 0.007) ** 2)) * lipWidthEnvelope;
  const lowerLip = Math.exp(-(((y + 0.214) / 0.016) ** 2)) * smoothstep(0.092, 0.018, Math.abs(xSym));

  z += (0.027 * upperLip - 0.015 * lipPart + 0.031 * lowerLip) * frontMask;

  // 7. Mentolabial crease & soft rounded chin pad
  const mentoFold = gaussian2(xSym, y, 0.0, -0.252, 0.072, 0.020);
  const chinPad = gaussian2(xSym, y, 0.0, -0.324, 0.088, 0.056);
  z += (0.032 * chinPad - 0.015 * mentoFold) * frontMask;

  // 8. Subtle ear shell relief along lateral temples
  let isEar = false;
  if (absTheta > 1.24 && absTheta < 1.62 && y > -0.13 && y < 0.045) {
    const earU = (absTheta - 1.42) / 0.16;
    const earV = (y + 0.04) / 0.09;
    const earR2 = earU * earU + earV * earV;
    if (earR2 < 1.0) {
      isEar = true;
      const helix = Math.exp(-(((Math.sqrt(earR2) - 0.78) / 0.2) ** 2));
      const sign = x >= 0 ? 1 : -1;
      x += sign * (0.020 * (1 - earR2) + 0.016 * helix);
      z -= 0.016 * (1 - earR2);
    }
  }

  // Hair occlusion: everything above the wavy bangs hairline is covered by hair mass,
  // plus a soft ambient occlusion shadow right below the bangs!
  const hairlineY = getBangsHairlineY(x);
  const skinExposure = smoothstep(hairlineY + 0.012, hairlineY - 0.018, y);
  const bangsAo = 0.58 + 0.42 * smoothstep(hairlineY, hairlineY - 0.065, y);

  const leftBrowDist = distToPolyline2D(xSym, y, LEFT_BROW_CURVE);
  const rightBrowDist = distToPolyline2D(xSym, y, RIGHT_BROW_CURVE);
  const browDist = Math.min(leftBrowDist.dist, rightBrowDist.dist);
  const eyeLidDist = Math.min(upperLidL.dist, lowerLidL.dist, upperLidR.dist, lowerLidR.dist);

  let tag: FacialPartTag = 'face';
  let weight = 0.78 * smoothstep(-0.22, 0.50, frontFactor);
  let albedo = 0.72;
  let accent = 0.0;

  if (skinExposure < 0.02) {
    // Hidden beneath the dense 3D hair crown/bangs — zero surface particles here
    tag = 'face';
    weight = 0.0;
    albedo = 0.02;
  } else if (y < -0.395) {
    // Seamless neck transition beneath chin
    tag = 'collar';
    weight = 0.52 * smoothstep(-0.54, -0.395, y) * smoothstep(-0.2, 0.65, frontFactor);
    albedo = 0.46;
  } else if (isEar) {
    tag = 'ear';
    weight = 0.38 * skinExposure;
    albedo = 0.48;
  } else if (browDist < 0.017 && frontMask > 0.45) {
    // Thick, natural dark eyebrows sitting low/focused above the eyes
    tag = 'brow';
    const core = smoothstep(0.017, 0.004, browDist);
    weight = (1.65 + core * 1.1) * Math.max(0.25, skinExposure);
    albedo = 0.24 + 0.28 * (1 - core * 0.6);
    accent = 0.14;
  } else if (eyeLidDist < 0.011 && frontMask > 0.45) {
    // Delicate upper & lower eyelid contour without creating glowing white rings
    tag = 'eyelid';
    const ridge = smoothstep(0.011, 0.003, eyeLidDist);
    weight = 0.85 + ridge * 0.55;
    albedo = 0.44 + ridge * 0.24;
    accent = 0.10;
  } else if (
    (Math.hypot((xSym + 0.132) / 0.056, (y - 0.020) / 0.018) < 0.94 ||
      Math.hypot((xSym - 0.132) / 0.056, (y - 0.022) / 0.018) < 0.94) &&
    frontMask > 0.45
  ) {
    // Recessed orbital cavity behind eyeball — stays shadowed
    tag = 'eyelid';
    weight = 0.02;
    albedo = 0.05;
  } else if (tipGauss > 0.16 || (noseBridgeMask > 0.22 && Math.abs(xSym) < 0.064)) {
    tag = 'nose';
    const nostrilShadow = Math.max(leftNostril, rightNostril);
    const alarEdge = gaussian2(Math.abs(xSym), y, 0.060, -0.097, 0.013, 0.015);
    weight = (1.10 + tipGauss * 0.65 + alarEdge * 0.85) * (1 - nostrilShadow * 0.85);
    albedo = clamp01((0.68 + tipGauss * 0.20 + alarEdge * 0.12) * (1 - nostrilShadow * 0.88));
  } else if (lipWidthEnvelope > 0.14 && y < -0.155 && y > -0.236 && frontMask > 0.45) {
    tag = 'lips';
    weight = (1.15 + upperLip * 0.95 + lowerLip * 1.1) * (1 - lipPart * 0.85);
    albedo = clamp01((0.62 + upperLip * 0.22 + lowerLip * 0.28) * (1 - lipPart * 0.88));
  } else {
    // Smooth, soft youthful skin shading (cheekbones, bridge sides, philtrum, rounded jaw/chin)
    // Avoid harsh neon rim ring around the lower jaw!
    const highlight =
      0.16 * gaussian2(xSym, y, 0.0, 0.11, 0.11, 0.06) +
      0.26 * cheekFullness +
      0.18 * chinPad;
    const jawSoftShadow = y < -0.24 ? smoothstep(-0.395, -0.24, y) * 0.35 + 0.65 : 1.0;
    const sideTaper = smoothstep(-0.08, 0.55, frontFactor);

    if (y < -0.26 && absTheta > 0.42 && absTheta < 1.12) {
      tag = 'jaw';
    }
    weight = (0.76 + highlight * 0.68) * sideTaper * skinExposure * bangsAo * jawSoftShadow;
    albedo = clamp01((0.64 + highlight * 0.30) * bangsAo * (0.85 + 0.15 * jawSoftShadow));
  }

  return { x, y, z, weight, albedo, accent, tag };
}

function buildCraniumAndFacePart(): FaceMeshPart {
  const uSegs = 96;
  const vSegs = 88;
  const cols = uSegs + 1;
  const rows = vSegs + 1;
  const vertCount = cols * rows;

  const positions = new Float32Array(vertCount * 3);
  const weights = new Float32Array(vertCount);
  const albedos = new Float32Array(vertCount);
  const accents = new Float32Array(vertCount);
  const tags: FacialPartTag[] = new Array(vertCount);

  const thetaSpan = Math.PI * 1.08;

  for (let r = 0; r < rows; r++) {
    const v = r / vSegs;
    for (let c = 0; c < cols; c++) {
      const u = c / uSegs;
      const theta = (u - 0.5) * thetaSpan;
      const idx = r * cols + c;
      const pt = evaluateFaceSurfacePoint(theta, v);

      positions[idx * 3] = pt.x;
      positions[idx * 3 + 1] = pt.y;
      positions[idx * 3 + 2] = pt.z;
      weights[idx] = pt.weight;
      albedos[idx] = pt.albedo;
      accents[idx] = pt.accent;
      tags[idx] = pt.tag;
    }
  }

  const indices = new Uint32Array(uSegs * vSegs * 6);
  let ptr = 0;
  for (let r = 0; r < vSegs; r++) {
    for (let c = 0; c < uSegs; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;

      indices[ptr++] = a;
      indices[ptr++] = d;
      indices[ptr++] = b;

      indices[ptr++] = b;
      indices[ptr++] = d;
      indices[ptr++] = e;
    }
  }

  const normals = computeIndexedNormals(positions, indices);

  return {
    name: 'craniumAndFace',
    positions,
    normals,
    weights,
    albedos,
    accents,
    tags,
    indices,
  };
}

/**
 * Builds a dedicated 3D eyeball mesh inside each orbital socket with realistic
 * natural dark iris, subtle restrained sclera, dark pupil, and pinpoint catchlight.
 */
function buildEyeballPart(side: 'left' | 'right'): FaceMeshPart {
  const cx = side === 'left' ? -0.132 : 0.132;
  const cy = side === 'left' ? 0.020 : 0.022;
  const cz = 0.214;
  const radius = 0.039;

  const lonSegs = 28;
  const latSegs = 22;
  const cols = lonSegs + 1;
  const rows = latSegs + 1;
  const vertCount = cols * rows;

  const positions = new Float32Array(vertCount * 3);
  const weights = new Float32Array(vertCount);
  const albedos = new Float32Array(vertCount);
  const accents = new Float32Array(vertCount);
  const tags: FacialPartTag[] = new Array(vertCount);

  for (let r = 0; r < rows; r++) {
    const phi = (r / latSegs - 0.5) * Math.PI * 0.62;
    for (let c = 0; c < cols; c++) {
      const theta = (c / lonSegs - 0.5) * Math.PI * 0.82;
      const idx = r * cols + c;

      const lx = Math.cos(phi) * Math.sin(theta);
      const ly = Math.sin(phi);
      const lz = Math.cos(phi) * Math.cos(theta);

      positions[idx * 3] = cx + lx * radius;
      positions[idx * 3 + 1] = cy + ly * radius;
      positions[idx * 3 + 2] = cz + lz * radius;

      // Hooded focused almond aperture — upper lid sits slightly low over top of iris
      const upperClip = smoothstep(0.24, 0.05, ly);
      const lowerClip = smoothstep(-0.30, -0.12, ly);
      const cornerClip = smoothstep(0.86, 0.62, Math.abs(lx));
      const lidVisible = upperClip * lowerClip * cornerClip;

      const gazeDist = Math.hypot(lx, ly - 0.02);
      const catchlight = Math.hypot(lx - 0.18, ly - 0.12);

      let w = 0.22 * lidVisible;
      let alb = 0.30;
      let acc = 0.08;

      if (catchlight < 0.10) {
        // Subtle crisp pinpoint eye catchlight
        w = 2.4 * lidVisible;
        alb = 0.98;
        acc = 0.35;
      } else if (gazeDist < 0.34) {
        // Deep dark pupil (negative space)
        w = 0.0;
        alb = 0.02;
      } else if (gazeDist < 0.62) {
        // Large dark natural iris with delicate outer limbus ring
        const limbus = smoothstep(0.48, 0.61, gazeDist);
        w = (0.04 + limbus * 0.68) * lidVisible;
        alb = 0.08 + limbus * 0.40;
        acc = limbus * 0.24;
      } else {
        // Restrained, shaded sclera corners — subtle contrast, never white ovals
        w = 0.24 * lidVisible;
        alb = 0.32;
      }

      weights[idx] = w;
      albedos[idx] = alb;
      accents[idx] = acc;
      tags[idx] = 'eyeball';
    }
  }

  const indices = new Uint32Array(lonSegs * latSegs * 6);
  let ptr = 0;
  for (let r = 0; r < latSegs; r++) {
    for (let c = 0; c < lonSegs; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;

      indices[ptr++] = a;
      indices[ptr++] = d;
      indices[ptr++] = b;

      indices[ptr++] = b;
      indices[ptr++] = d;
      indices[ptr++] = e;
    }
  }

  const normals = computeIndexedNormals(positions, indices);

  return {
    name: side === 'left' ? 'leftEye' : 'rightEye',
    positions,
    normals,
    weights,
    albedos,
    accents,
    tags,
    indices,
  };
}

interface HairLockSpline {
  points: ReadonlyArray<readonly [number, number, number]>;
  width: number;
  thickness: number;
  highlight: number;
}

function sampleCatmullRom3D(
  pts: ReadonlyArray<readonly [number, number, number]>,
  t: number,
): [number, number, number] {
  const n = pts.length - 1;
  const scaled = clamp01(t) * n;
  const idx = Math.min(n - 1, Math.floor(scaled));
  const f = scaled - idx;

  const p0 = pts[Math.max(0, idx - 1)];
  const p1 = pts[idx];
  const p2 = pts[Math.min(n, idx + 1)];
  const p3 = pts[Math.min(n, idx + 2)];

  const f2 = f * f;
  const f3 = f2 * f;

  const interp = (a: number, b: number, c: number, d: number) =>
    0.5 *
    (2 * b +
      (-a + c) * f +
      (2 * a - 5 * b + 4 * c - d) * f2 +
      (-a + 3 * b - 3 * c + d) * f3);

  return [
    interp(p0[0], p1[0], p2[0], p3[0]),
    interp(p0[1], p1[1], p2[1], p3[1]),
    interp(p0[2], p1[2], p2[2], p3[2]),
  ];
}

/**
 * Builds Sayem's thick, tousled wavy medium-short hairstyle:
 * 1) A continuous sculpted wavy base hair crown shell covering the skull and temples
 *    down to the irregular forehead bangs fringe (eliminating any bald/gap look), plus
 * 2) 26 overlapping 3D curly locks draping over the crown, sides, and forehead right above the brows.
 */
function buildHairLocksPart(): FaceMeshPart {
  const locks: HairLockSpline[] = [
    // Forehead tousled bangs cascading asymmetrically above the eyebrows
    {
      points: [
        [-0.02, 0.54, 0.14],
        [-0.08, 0.39, 0.27],
        [-0.06, 0.23, 0.328],
        [-0.045, 0.078, 0.304],
      ],
      width: 0.072,
      thickness: 0.030,
      highlight: 1.0,
    },
    {
      points: [
        [0.03, 0.54, 0.14],
        [0.08, 0.39, 0.275],
        [0.06, 0.23, 0.322],
        [0.035, 0.122, 0.302],
      ],
      width: 0.074,
      thickness: 0.030,
      highlight: 0.98,
    },
    {
      points: [
        [-0.06, 0.53, 0.12],
        [-0.16, 0.38, 0.255],
        [-0.17, 0.22, 0.300],
        [-0.14, 0.104, 0.288],
      ],
      width: 0.080,
      thickness: 0.028,
      highlight: 0.96,
    },
    {
      points: [
        [0.05, 0.53, 0.12],
        [0.16, 0.38, 0.255],
        [0.17, 0.22, 0.302],
        [0.115, 0.086, 0.290],
      ],
      width: 0.078,
      thickness: 0.028,
      highlight: 0.98,
    },
    {
      points: [
        [-0.12, 0.51, 0.10],
        [-0.24, 0.36, 0.225],
        [-0.25, 0.21, 0.255],
        [-0.22, 0.092, 0.238],
      ],
      width: 0.078,
      thickness: 0.026,
      highlight: 0.90,
    },
    {
      points: [
        [0.12, 0.51, 0.10],
        [0.24, 0.36, 0.225],
        [0.26, 0.21, 0.252],
        [0.23, 0.105, 0.235],
      ],
      width: 0.078,
      thickness: 0.026,
      highlight: 0.90,
    },
    // Mid-forehead overlapping messy cross-curls (gives natural tousled texture)
    {
      points: [
        [-0.11, 0.44, 0.22],
        [-0.04, 0.32, 0.305],
        [0.04, 0.21, 0.322],
        [0.07, 0.118, 0.304],
      ],
      width: 0.074,
      thickness: 0.026,
      highlight: 0.98,
    },
    {
      points: [
        [0.10, 0.44, 0.22],
        [0.02, 0.31, 0.305],
        [-0.06, 0.20, 0.320],
        [-0.08, 0.114, 0.300],
      ],
      width: 0.074,
      thickness: 0.026,
      highlight: 0.95,
    },
    // Full crown wavy top curls
    {
      points: [
        [-0.02, 0.55, 0.04],
        [-0.13, 0.61, 0.12],
        [-0.24, 0.53, 0.18],
        [-0.31, 0.38, 0.17],
      ],
      width: 0.098,
      thickness: 0.034,
      highlight: 0.94,
    },
    {
      points: [
        [0.02, 0.55, 0.04],
        [0.14, 0.62, 0.11],
        [0.25, 0.53, 0.17],
        [0.32, 0.38, 0.16],
      ],
      width: 0.098,
      thickness: 0.034,
      highlight: 0.94,
    },
    {
      points: [
        [-0.05, 0.59, -0.02],
        [-0.19, 0.60, 0.04],
        [-0.33, 0.47, 0.08],
        [-0.40, 0.29, 0.09],
      ],
      width: 0.096,
      thickness: 0.032,
      highlight: 0.90,
    },
    {
      points: [
        [0.05, 0.59, -0.02],
        [0.20, 0.60, 0.04],
        [0.34, 0.47, 0.07],
        [0.41, 0.29, 0.08],
      ],
      width: 0.096,
      thickness: 0.032,
      highlight: 0.90,
    },
    {
      points: [
        [-0.02, 0.61, -0.04],
        [-0.09, 0.63, 0.06],
        [-0.14, 0.51, 0.20],
        [-0.11, 0.36, 0.27],
      ],
      width: 0.088,
      thickness: 0.030,
      highlight: 0.95,
    },
    {
      points: [
        [0.03, 0.62, -0.04],
        [0.11, 0.63, 0.06],
        [0.16, 0.50, 0.19],
        [0.12, 0.35, 0.26],
      ],
      width: 0.088,
      thickness: 0.030,
      highlight: 0.95,
    },
    // Lateral waves framing temples & upper ears
    {
      points: [
        [-0.22, 0.47, 0.06],
        [-0.35, 0.34, 0.11],
        [-0.41, 0.19, 0.10],
        [-0.36, 0.04, 0.07],
      ],
      width: 0.090,
      thickness: 0.030,
      highlight: 0.88,
    },
    {
      points: [
        [0.22, 0.47, 0.06],
        [0.35, 0.34, 0.11],
        [0.41, 0.19, 0.10],
        [0.36, 0.04, 0.07],
      ],
      width: 0.090,
      thickness: 0.030,
      highlight: 0.88,
    },
    {
      points: [
        [-0.28, 0.34, 0.04],
        [-0.38, 0.21, 0.06],
        [-0.37, 0.08, 0.03],
        [-0.33, -0.04, 0.0],
      ],
      width: 0.078,
      thickness: 0.024,
      highlight: 0.80,
    },
    {
      points: [
        [0.28, 0.34, 0.04],
        [0.38, 0.21, 0.06],
        [0.37, 0.08, 0.03],
        [0.33, -0.04, 0.0],
      ],
      width: 0.078,
      thickness: 0.024,
      highlight: 0.80,
    },
    // Front temple sweeps tucked near brow tails
    {
      points: [
        [-0.24, 0.38, 0.15],
        [-0.31, 0.24, 0.18],
        [-0.32, 0.12, 0.16],
        [-0.28, 0.02, 0.12],
      ],
      width: 0.068,
      thickness: 0.022,
      highlight: 0.82,
    },
    {
      points: [
        [0.24, 0.38, 0.15],
        [0.31, 0.24, 0.18],
        [0.32, 0.12, 0.16],
        [0.28, 0.02, 0.12],
      ],
      width: 0.068,
      thickness: 0.022,
      highlight: 0.82,
    },
    // Sideburn curls ending cleanly above jaw angle
    {
      points: [
        [-0.29, 0.18, 0.10],
        [-0.31, 0.09, 0.08],
        [-0.30, 0.01, 0.05],
        [-0.29, -0.06, 0.02],
      ],
      width: 0.052,
      thickness: 0.018,
      highlight: 0.74,
    },
    {
      points: [
        [0.29, 0.18, 0.10],
        [0.31, 0.09, 0.08],
        [0.30, 0.01, 0.05],
        [0.29, -0.06, 0.02],
      ],
      width: 0.052,
      thickness: 0.018,
      highlight: 0.74,
    },
  ];

  // Part A: Continuous sculpted wavy base hair crown cap (eliminates bald forehead gaps)
  const capUSegs = 64;
  const capVSegs = 32;
  const capCols = capUSegs + 1;
  const capRows = capVSegs + 1;
  const capVerts = capCols * capRows;
  const capTris = capUSegs * capVSegs * 2;

  // Part B: 22 sculpted 3D hair locks layered over the crown & draping forward into bangs
  const lengthSegs = 22;
  const crossSegs = 6;
  const cols = crossSegs + 1;
  const rows = lengthSegs + 1;
  const vertsPerLock = cols * rows;
  const trisPerLock = lengthSegs * crossSegs * 2;

  const totalVerts = capVerts + locks.length * vertsPerLock;
  const totalTris = capTris + locks.length * trisPerLock;

  const positions = new Float32Array(totalVerts * 3);
  const weights = new Float32Array(totalVerts);
  const albedos = new Float32Array(totalVerts);
  const accents = new Float32Array(totalVerts);
  const tags: FacialPartTag[] = new Array(totalVerts).fill('hair');
  const indices = new Uint32Array(totalTris * 3);

  let vOffset = 0;
  let iOffset = 0;

  // Build continuous base hair crown shell covering top/sides down to wavy bangs hairline
  const capThetaSpan = Math.PI * 1.24;
  for (let r = 0; r < capRows; r++) {
    const tv = r / capVSegs; // 0 = top crown apex, 1 = irregular bangs fringe
    for (let c = 0; c < capCols; c++) {
      const u = c / capUSegs;
      const theta = (u - 0.5) * capThetaSpan;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      // Base dome height down to bangs fringe
      const approxX = sinT * 0.35;
      const bottomY = getBangsHairlineY(approxX) - 0.015;
      const y = 0.58 * (1 - tv * tv * 0.85) + bottomY * (tv * tv * 0.85);

      const arch = Math.sqrt(Math.max(0.05, 1 - Math.pow(1 - tv, 2.2) * 0.82));
      const curlWave =
        0.016 * Math.sin(theta * 9.0 + tv * 5.0) +
        0.010 * Math.cos(theta * 15.0 - tv * 8.0);

      const rx = (0.345 + curlWave) * arch;
      const rz = (0.348 + curlWave) * arch;

      const vx = sinT * rx;
      const vz = cosT * rz - 0.032;

      const idx = vOffset++;
      positions[idx * 3] = vx;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = vz;

      const waveCrest = 0.5 + 0.5 * Math.sin(theta * 9.0 + tv * 5.0);
      const frontVisibility = smoothstep(-0.35, 0.45, cosT);
      weights[idx] = (0.32 + waveCrest * 0.38) * frontVisibility;
      albedos[idx] = clamp01(0.24 + waveCrest * 0.24);
      accents[idx] = 0.10 * waveCrest;
    }
  }

  for (let r = 0; r < capVSegs; r++) {
    for (let c = 0; c < capUSegs; c++) {
      const a = r * capCols + c;
      const b = a + 1;
      const d = (r + 1) * capCols + c;
      const e = d + 1;

      indices[iOffset++] = a;
      indices[iOffset++] = d;
      indices[iOffset++] = b;

      indices[iOffset++] = b;
      indices[iOffset++] = d;
      indices[iOffset++] = e;
    }
  }

  // Build layered 3D sculpted wavy locks on top of the hair shell
  for (let l = 0; l < locks.length; l++) {
    const lock = locks[l];
    const baseVertex = vOffset;

    for (let r = 0; r < rows; r++) {
      const t = r / lengthSegs;
      const center = sampleCatmullRom3D(lock.points, t);
      const next = sampleCatmullRom3D(lock.points, Math.min(1, t + 0.03));
      const prev = sampleCatmullRom3D(lock.points, Math.max(0, t - 0.03));

      let tx = next[0] - prev[0];
      let ty = next[1] - prev[1];
      let tz = next[2] - prev[2];
      const tLen = Math.hypot(tx, ty, tz) || 1;
      tx /= tLen;
      ty /= tLen;
      tz /= tLen;

      let nx = center[0];
      let ny = center[1] - 0.24;
      let nz = center[2] + 0.04;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      nx /= nLen;
      ny /= nLen;
      nz /= nLen;

      let bx = ty * nz - tz * ny;
      let by = tz * nx - tx * nz;
      let bz = tx * ny - ty * nx;
      const bLen = Math.hypot(bx, by, bz) || 1;
      bx /= bLen;
      by /= bLen;
      bz /= bLen;

      const widthEnvelope =
        smoothstep(0.0, 0.20, t) * (1 - Math.pow(smoothstep(0.48, 1.0, t), 1.45) * 0.84);
      const halfW = lock.width * 0.5 * (0.38 + 0.62 * widthEnvelope);
      const archH = lock.thickness * (0.42 + 0.58 * widthEnvelope);

      for (let c = 0; c < cols; c++) {
        const s = (c / crossSegs) * 2 - 1;
        const arch = Math.cos(s * Math.PI * 0.5);
        const ridgeSharp = 1 - Math.abs(s);

        const vx = center[0] + bx * (s * halfW) + nx * (arch * archH);
        const vy = center[1] + by * (s * halfW) + ny * (arch * archH);
        const vz = center[2] + bz * (s * halfW) + nz * (arch * archH);

        const idx = vOffset++;
        positions[idx * 3] = vx;
        positions[idx * 3 + 1] = vy;
        positions[idx * 3 + 2] = vz;

        const tipFade = 1 - smoothstep(0.84, 1.0, t) * 0.35;
        weights[idx] = (0.42 + 1.45 * ridgeSharp) * lock.highlight * tipFade;
        albedos[idx] = clamp01((0.36 + 0.44 * ridgeSharp) * lock.highlight);
        accents[idx] = 0.16 * ridgeSharp;
      }
    }

    for (let r = 0; r < lengthSegs; r++) {
      for (let c = 0; c < crossSegs; c++) {
        const a = baseVertex + r * cols + c;
        const b = a + 1;
        const d = baseVertex + (r + 1) * cols + c;
        const e = d + 1;

        indices[iOffset++] = a;
        indices[iOffset++] = d;
        indices[iOffset++] = b;

        indices[iOffset++] = b;
        indices[iOffset++] = d;
        indices[iOffset++] = e;
      }
    }
  }

  const normals = computeIndexedNormals(positions, indices);

  return {
    name: 'hairLocks',
    positions,
    normals,
    weights,
    albedos,
    accents,
    tags,
    indices,
  };
}

/**
 * Builds the continuous 3D neck, open shirt collar, and dark jacket shoulder lapels
 * seamlessly tucked behind the chin so there is no gap beneath the jawline.
 */
function buildCollarAndShouldersPart(): FaceMeshPart {
  const uSegs = 68;
  const vSegs = 34;
  const cols = uSegs + 1;
  const rows = vSegs + 1;
  const vertCount = cols * rows;

  const positions = new Float32Array(vertCount * 3);
  const weights = new Float32Array(vertCount);
  const albedos = new Float32Array(vertCount);
  const accents = new Float32Array(vertCount);
  const tags: FacialPartTag[] = new Array(vertCount).fill('collar');

  for (let r = 0; r < rows; r++) {
    const v = r / vSegs; // 0 = tucked cleanly behind chin (-0.34), 1 = lower jacket (-0.78)
    const y = -0.34 - v * 0.44;

    for (let c = 0; c < cols; c++) {
      const u = c / uSegs;
      const s = u * 2 - 1;
      const absS = Math.abs(s);

      const shoulderExpand = smoothstep(0.12, 0.65, v);
      const halfSpan = 0.168 + shoulderExpand * 0.46;
      const x = s * halfSpan;

      const shoulderDrop = Math.pow(absS, 1.55) * shoulderExpand * 0.115;
      const finalY = y - shoulderDrop;

      const torsoCurve = Math.cos(s * Math.PI * 0.44);
      let z = 0.132 * torsoCurve - 0.048 - v * 0.02;

      const vNeckLineX = 0.125 * (1 - smoothstep(0.10, 0.78, v));
      const distFromCollar = Math.abs(Math.abs(x) - (vNeckLineX + 0.028));
      const lapelLineX = vNeckLineX + 0.075 + v * 0.088;
      const distFromLapel = Math.abs(Math.abs(x) - lapelLineX);

      const collarRidge = Math.exp(-((distFromCollar / 0.018) ** 2)) * smoothstep(0.08, 0.28, v);
      const lapelRidge = Math.exp(-((distFromLapel / 0.022) ** 2)) * smoothstep(0.18, 0.48, v);
      const shoulderSeam =
        Math.exp(-(((v - (0.38 + absS * 0.14)) / 0.03) ** 2)) * smoothstep(0.28, 0.85, absS);

      z += collarRidge * 0.022 + lapelRidge * 0.028;

      const idx = r * cols + c;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = finalY;
      positions[idx * 3 + 2] = z;

      const topBlend = smoothstep(0.0, 0.14, v);
      const edgeFade = smoothstep(1.0, 0.62, v) * smoothstep(1.02, 0.72, absS);
      const structureBoost = collarRidge * 0.95 + lapelRidge * 1.15 + shoulderSeam * 0.65;

      weights[idx] = (0.28 + structureBoost) * edgeFade * (0.45 + 0.55 * topBlend);
      albedos[idx] = clamp01(0.36 + structureBoost * 0.42);
      accents[idx] = clamp01(lapelRidge * 0.35 + collarRidge * 0.2);
    }
  }

  const indices = new Uint32Array(uSegs * vSegs * 6);
  let ptr = 0;
  for (let r = 0; r < vSegs; r++) {
    for (let c = 0; c < uSegs; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;

      indices[ptr++] = a;
      indices[ptr++] = d;
      indices[ptr++] = b;

      indices[ptr++] = b;
      indices[ptr++] = d;
      indices[ptr++] = e;
    }
  }

  const normals = computeIndexedNormals(positions, indices);

  return {
    name: 'collarAndShoulders',
    positions,
    normals,
    weights,
    albedos,
    accents,
    tags,
    indices,
  };
}

/**
 * Constructs the complete multi-part 3D facial identity model of Sayem Quadri
 * from anatomical landmarks prior to constellation surface sampling.
 */
export function buildFaceIdentityModel(): FaceIdentityModel {
  const craniumAndFace = buildCraniumAndFacePart();
  const leftEye = buildEyeballPart('left');
  const rightEye = buildEyeballPart('right');
  const hairLocks = buildHairLocksPart();
  const collarAndShoulders = buildCollarAndShouldersPart();

  const parts: FaceMeshPart[] = [
    craniumAndFace,
    leftEye,
    rightEye,
    hairLocks,
    collarAndShoulders,
  ];

  let totalVertices = 0;
  let totalTriangles = 0;
  for (const part of parts) {
    totalVertices += part.positions.length / 3;
    totalTriangles += part.indices.length / 3;
  }

  const leftEyeLm = SAYEM_FACE_LANDMARKS.find((l) => l.id === 'left_eye_center')!;
  const rightEyeLm = SAYEM_FACE_LANDMARKS.find((l) => l.id === 'right_eye_center')!;
  const leftCheekLm = SAYEM_FACE_LANDMARKS.find((l) => l.id === 'left_cheek')!;
  const rightCheekLm = SAYEM_FACE_LANDMARKS.find((l) => l.id === 'right_cheek')!;
  const noseTipLm = SAYEM_FACE_LANDMARKS.find((l) => l.id === 'nose_tip')!;
  const chinLm = SAYEM_FACE_LANDMARKS.find((l) => l.id === 'chin_base')!;
  const crownLm = SAYEM_FACE_LANDMARKS.find((l) => l.id === 'crown_top')!;

  return {
    landmarks: SAYEM_FACE_LANDMARKS,
    parts,
    metrics: {
      totalVertices,
      totalTriangles,
      interpupillaryDistance: Math.abs(rightEyeLm.x - leftEyeLm.x),
      faceWidthAtCheeks: Math.abs(rightCheekLm.x - leftCheekLm.x),
      noseTipProtrusionZ: noseTipLm.z,
      chinY: chinLm.y,
      crownY: crownLm.y,
    },
  };
}
