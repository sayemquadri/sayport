import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  buildLineDotPortrait,
  projectPerspectivePoint,
  rotateEulerXYZ,
  type LineDotPortraitData,
  type PortraitImageBuffer,
} from '../utils/linePortrait';

const PORTRAIT_ASSET_PATH = '/assets/aistudio/image_507f1aba.png';
const CAMERA_Z = 3.38;
const CAMERA_FOV = 34;

const NODE_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aAlpha;
  attribute float aKind;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScaleFactor;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vAlpha;
  varying float vKind;

  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vKind = aKind;

    vec3 pos = position;

    // Distant background stars drift infinitesimally; portrait intersection nodes stay rock-steady
    if (aKind > 2.5) {
      pos.x += sin(uTime * 0.35 * aSpeed + aPhase) * 0.004;
      pos.y += cos(uTime * 0.31 * aSpeed + aPhase * 1.37) * 0.004;
    }

    float wave = 0.5 + 0.5 * sin(uTime * 1.25 * aSpeed + aPhase);
    vFlicker = aKind > 2.5
      ? mix(0.55, 1.0, wave)
      : aKind > 1.5
        ? mix(0.74, 1.0, wave)
        : mix(0.86, 1.0, wave);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = max(1.2, -mvPosition.z);
    gl_PointSize = clamp(aSize * uPixelRatio * uScaleFactor * (3.1 / dist), 1.0, 14.0);
  }
`;

const NODE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uReveal;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vAlpha;
  varying float vKind;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float alphaFactor;
    float coreMix;
    if (vKind < 1.5) {
      // Primary intersection anchor node: compact crisp circle with tiny soft edge
      float disc = smoothstep(0.45, 0.22, d);
      float halo = smoothstep(0.5, 0.28, d) * 0.24;
      alphaFactor = disc + halo;
      coreMix = disc * 0.3;
    } else if (vKind < 2.5) {
      // Contour micro-star along hair/jaw/collar: tight pinpoint starlight
      float core = smoothstep(0.4, 0.08, d);
      float glint = exp(-d * d * 18.0) * 0.45;
      alphaFactor = core * 0.85 + glint;
      coreMix = core * 0.45;
    } else {
      // Celestial background starfield: crisp astronomical star pinpoint
      float starCore = exp(-d * d * 16.0);
      alphaFactor = starCore;
      coreMix = starCore * 0.42;
    }

    float alpha = clamp(alphaFactor * vAlpha * vFlicker, 0.0, 1.0) * uReveal;
    if (alpha < 0.01) discard;

    vec3 col = mix(vColor, vec3(0.98, 0.99, 1.0), coreMix);
    gl_FragColor = vec4(col, alpha);
  }
`;

const SATELLITE_VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  uniform float uPixelRatio;
  uniform float uScaleFactor;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float dist = max(1.2, -mvPosition.z);
    gl_PointSize = clamp(aSize * uPixelRatio * uScaleFactor * (3.2 / dist), 2.8, 12.0);
  }
`;

const SATELLITE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float core = smoothstep(0.46, 0.16, d);
    float alpha = core * uOpacity;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(mix(uColor, vec3(0.98, 0.99, 1.0), core * 0.4), alpha);
  }
`;

const LINE_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute float aProgress;
  attribute float aSeed;
  attribute float aAlpha;

  varying vec3 vColor;
  varying float vProgress;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vProgress = aProgress;
    vSeed = aSeed;
    vAlpha = aAlpha;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;

  varying vec3 vColor;
  varying float vProgress;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    float alpha = vAlpha;
    vec3 col = vColor;

    // Gentle luminous pulse gliding along traced hair, jawline, and collar strokes
    float cycle = fract(uTime * 0.13 + vSeed * 17.19);
    if (cycle < 0.20) {
      float pulsePos = cycle / 0.20;
      float dist = abs(vProgress - pulsePos);
      float pulse = exp(-dist * dist * 52.0);
      float endFade = smoothstep(0.0, 0.12, pulsePos) * smoothstep(1.0, 0.88, pulsePos);
      float energy = pulse * endFade;
      col = mix(col, vec3(0.58, 0.78, 1.0), energy * 0.75);
      alpha += energy * 0.28;
    }

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.98) * uReveal);
  }
`;

function detectSoftwareGl(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl =
      (probe.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (probe.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return true;
  }
}

function scheduleAnimationFrame(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
  callback: () => void,
): () => void {
  if (!isSoftwareGl) {
    const id = window.requestAnimationFrame(callback);
    return () => window.cancelAnimationFrame(id);
  }

  let cancelled = false;
  let timerId = 0;
  let rafId = 0;
  const gl = renderer.getContext();

  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    if (sync) {
      const started = performance.now();
      const poll = () => {
        if (cancelled) {
          gl.deleteSync(sync);
          return;
        }
        const status = gl.clientWaitSync(sync, 0, 0);
        if (
          status === gl.ALREADY_SIGNALED ||
          status === gl.CONDITION_SATISFIED ||
          performance.now() - started > 80
        ) {
          gl.deleteSync(sync);
          rafId = window.requestAnimationFrame(() => {
            if (!cancelled) callback();
          });
        } else {
          timerId = window.setTimeout(poll, 5);
        }
      };
      timerId = window.setTimeout(poll, 5);

      return () => {
        cancelled = true;
        window.clearTimeout(timerId);
        window.cancelAnimationFrame(rafId);
        try {
          gl.deleteSync(sync);
        } catch {
          // Ignore already-deleted sync
        }
      };
    }
  }

  rafId = window.requestAnimationFrame(callback);
  return () => {
    cancelled = true;
    window.cancelAnimationFrame(rafId);
  };
}

function sampleImageToBuffer(img: HTMLImageElement): PortraitImageBuffer {
  const targetSize = 400;
  const offscreen = document.createElement('canvas');
  offscreen.width = targetSize;
  offscreen.height = targetSize;

  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { width: 0, height: 0, data: new Uint8ClampedArray(0) };
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetSize, targetSize);
  ctx.drawImage(img, 0, 0, targetSize, targetSize);
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);

  return {
    width: targetSize,
    height: targetSize,
    data: imageData.data,
  };
}

/**
 * Rasterizes a crisp static high-DPI PNG data URL of the line-and-dot network portrait
 * for reduced-motion preferences or environments without WebGL.
 */
function renderStaticLineDotDataUrl(data: LineDotPortraitData, size = 930): string {
  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;

  const ctx = offscreen.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, size, size);
  const sizeScale = size / 465;

  // 1. Subtle elliptical orbital paths & satellite nodes
  for (const track of data.orbitalTracks) {
    ctx.strokeStyle = track.isAccent
      ? 'rgba(78, 126, 255, 0.19)'
      : 'rgba(66, 74, 94, 0.14)';
    ctx.lineWidth = Math.max(1, size * 0.0012);
    ctx.beginPath();

    const count = track.points.length / 3;
    for (let i = 0; i < count; i++) {
      const [rx, ry, rz] = rotateEulerXYZ(
        track.points[i * 3],
        track.points[i * 3 + 1],
        track.points[i * 3 + 2],
        track.tiltX,
        track.tiltY,
        track.tiltZ,
      );
      const p = projectPerspectivePoint(rx, ry, rz, CAMERA_Z, CAMERA_FOV, size);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    for (const sat of track.satellites) {
      const lx = Math.cos(sat.phase) * track.radiusX;
      const ly = Math.sin(sat.phase) * track.radiusY;
      const [rx, ry, rz] = rotateEulerXYZ(lx, ly, 0, track.tiltX, track.tiltY, track.tiltZ);
      const p = projectPerspectivePoint(rx, ry, rz, CAMERA_Z, CAMERA_FOV, size);

      ctx.fillStyle = sat.isAccent
        ? 'rgba(118, 166, 255, 0.92)'
        : 'rgba(236, 238, 246, 0.88)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, sat.size * 0.55 * sizeScale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 1b. Distant background starfield drawn behind lines and orbits (kind === 3)
  for (let i = 0; i < data.pointCount; i++) {
    if (data.pointKinds[i] < 2.5) continue;
    const p = projectPerspectivePoint(
      data.pointPositions[i * 3],
      data.pointPositions[i * 3 + 1],
      data.pointPositions[i * 3 + 2],
      CAMERA_Z,
      CAMERA_FOV,
      size,
    );

    const r = Math.round(data.pointColors[i * 3] * 255);
    const g = Math.round(data.pointColors[i * 3 + 1] * 255);
    const b = Math.round(data.pointColors[i * 3 + 2] * 255);
    const alpha = data.pointAlphas[i];
    const radius = Math.max(0.55, data.pointSizes[i] * 0.42 * sizeScale * p.scale);

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Vector-style portrait line segments
  ctx.lineWidth = Math.max(1.25, size * 0.0022);
  ctx.lineCap = 'round';
  for (let i = 0; i < data.segmentCount; i++) {
    const v = i * 6;
    const p1 = projectPerspectivePoint(
      data.linePositions[v],
      data.linePositions[v + 1],
      data.linePositions[v + 2],
      CAMERA_Z,
      CAMERA_FOV,
      size,
    );
    const p2 = projectPerspectivePoint(
      data.linePositions[v + 3],
      data.linePositions[v + 4],
      data.linePositions[v + 5],
      CAMERA_Z,
      CAMERA_FOV,
      size,
    );

    const r = Math.round(data.lineColors[v] * 255);
    const g = Math.round(data.lineColors[v + 1] * 255);
    const b = Math.round(data.lineColors[v + 2] * 255);
    const alpha = data.lineAlphas[i * 2];

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // 3. Circular intersection nodes + contour micro-stars (kind < 2.5)
  for (let i = 0; i < data.pointCount; i++) {
    if (data.pointKinds[i] >= 2.5) continue;
    const p = projectPerspectivePoint(
      data.pointPositions[i * 3],
      data.pointPositions[i * 3 + 1],
      data.pointPositions[i * 3 + 2],
      CAMERA_Z,
      CAMERA_FOV,
      size,
    );

    const r = Math.round(data.pointColors[i * 3] * 255);
    const g = Math.round(data.pointColors[i * 3 + 1] * 255);
    const b = Math.round(data.pointColors[i * 3 + 2] * 255);
    const alpha = data.pointAlphas[i];
    const radius = Math.max(0.65, data.pointSizes[i] * 0.48 * sizeScale * p.scale);

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return offscreen.toDataURL('image/png');
}

export function CelestialPortrait() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [portraitData, setPortraitData] = useState<LineDotPortraitData | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // Reactively track user reduced-motion preference
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Load and trace the line-and-dot artwork strictly in-browser
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      if (!active) return;
      const buffer = sampleImageToBuffer(img);
      if (buffer.width > 0 && buffer.height > 0) {
        const built = buildLineDotPortrait(buffer, 20261121);
        setPortraitData(built);
      }
    };

    img.src = PORTRAIT_ASSET_PATH;

    return () => {
      active = false;
    };
  }, []);

  const showStaticFallback = prefersReducedMotion || webglUnavailable;

  const staticFallbackUrl = useMemo(() => {
    if (!showStaticFallback || !portraitData) return '';
    return renderStaticLineDotDataUrl(portraitData, 930);
  }, [showStaticFallback, portraitData]);

  // Hardware-accelerated Three.js renderer with IntersectionObserver offscreen pause
  useEffect(() => {
    if (!portraitData || showStaticFallback) return;

    const containerEl = containerRef.current;
    const mountEl = mountRef.current;
    if (!containerEl || !mountEl) return;

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountEl.replaceChildren(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 20);
    camera.position.set(0, 0.0, CAMERA_Z);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const portraitGroup = new THREE.Group();
    rootGroup.add(portraitGroup);

    // 1. Traced line-art segments with travelling pulses
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(portraitData.linePositions, 3),
    );
    linesGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(portraitData.lineColors, 3),
    );
    linesGeometry.setAttribute(
      'aProgress',
      new THREE.BufferAttribute(portraitData.lineProgress, 1),
    );
    linesGeometry.setAttribute(
      'aSeed',
      new THREE.BufferAttribute(portraitData.lineSeeds, 1),
    );
    linesGeometry.setAttribute(
      'aAlpha',
      new THREE.BufferAttribute(portraitData.lineAlphas, 1),
    );

    const linesUniforms = {
      uTime: { value: 0 },
      uReveal: { value: 0.0 },
    };

    const linesMaterial = new THREE.ShaderMaterial({
      uniforms: linesUniforms,
      vertexShader: LINE_VERTEX_SHADER,
      fragmentShader: LINE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    portraitGroup.add(linesMesh);

    // 2. Extracted circular dot nodes & distant subtle stars
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(portraitData.pointPositions, 3),
    );
    pointsGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(portraitData.pointColors, 3),
    );
    pointsGeometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(portraitData.pointSizes, 1),
    );
    pointsGeometry.setAttribute(
      'aPhase',
      new THREE.BufferAttribute(portraitData.pointPhases, 1),
    );
    pointsGeometry.setAttribute(
      'aSpeed',
      new THREE.BufferAttribute(portraitData.pointSpeeds, 1),
    );
    pointsGeometry.setAttribute(
      'aAlpha',
      new THREE.BufferAttribute(portraitData.pointAlphas, 1),
    );
    pointsGeometry.setAttribute(
      'aKind',
      new THREE.BufferAttribute(portraitData.pointKinds, 1),
    );

    const pointsUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uScaleFactor: { value: 1.0 },
      uReveal: { value: 0.0 },
    };

    const pointsMaterial = new THREE.ShaderMaterial({
      uniforms: pointsUniforms,
      vertexShader: NODE_VERTEX_SHADER,
      fragmentShader: NODE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    portraitGroup.add(pointsMesh);

    // 3. Visually separated elliptical orbital trajectories + travelling satellites
    const orbitGroup = new THREE.Group();
    rootGroup.add(orbitGroup);

    const orbitalTrackState: Array<{
      geom: THREE.BufferGeometry;
      mat: THREE.LineBasicMaterial;
      baseOpacity: number;
      satellites: Array<{
        geom: THREE.BufferGeometry;
        mat: THREE.ShaderMaterial;
        mesh: THREE.Points;
        radiusX: number;
        radiusY: number;
        phase: number;
        speed: number;
        baseOpacity: number;
      }>;
    }> = [];

    for (const track of portraitData.orbitalTracks) {
      const trackGroup = new THREE.Group();
      trackGroup.rotation.set(track.tiltX, track.tiltY, track.tiltZ);
      orbitGroup.add(trackGroup);

      const trackGeom = new THREE.BufferGeometry();
      trackGeom.setAttribute('position', new THREE.BufferAttribute(track.points, 3));

      const baseOpacity = track.isAccent ? 0.19 : 0.13;
      const trackMat = new THREE.LineBasicMaterial({
        color: track.isAccent ? 0x4e7eff : 0x424a5e,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });

      const loop = new THREE.LineLoop(trackGeom, trackMat);
      trackGroup.add(loop);

      const satStates = track.satellites.map((sat) => {
        const satGeom = new THREE.BufferGeometry();
        satGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        satGeom.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([sat.size]), 1));

        const satMat = new THREE.ShaderMaterial({
          uniforms: {
            uPixelRatio: { value: pixelRatio },
            uScaleFactor: pointsUniforms.uScaleFactor,
            uColor: { value: new THREE.Color(sat.isAccent ? 0x6ea0ff : 0xe8ecf6) },
            uOpacity: { value: 0 },
          },
          vertexShader: SATELLITE_VERTEX_SHADER,
          fragmentShader: SATELLITE_FRAGMENT_SHADER,
          transparent: true,
          depthWrite: false,
        });

        const mesh = new THREE.Points(satGeom, satMat);
        mesh.position.set(
          Math.cos(sat.phase) * track.radiusX,
          Math.sin(sat.phase) * track.radiusY,
          0,
        );
        trackGroup.add(mesh);

        return {
          geom: satGeom,
          mat: satMat,
          mesh,
          radiusX: track.radiusX,
          radiusY: track.radiusY,
          phase: sat.phase,
          speed: sat.speed,
          baseOpacity: sat.isAccent ? 0.92 : 0.86,
        };
      });

      orbitalTrackState.push({
        geom: trackGeom,
        mat: trackMat,
        baseOpacity,
        satellites: satStates,
      });
    }

    let cachedDocCenterX = 0;
    let cachedDocCenterY = 0;
    let cachedWidth = 360;
    let cachedHeight = 360;

    const syncSize = () => {
      const rect = containerEl.getBoundingClientRect();
      const width = Math.max(220, Math.round(rect.width || containerEl.clientWidth));
      const height = Math.max(220, Math.round(rect.height || containerEl.clientHeight));

      cachedWidth = width;
      cachedHeight = height;
      cachedDocCenterX = rect.left + window.scrollX + width * 0.5;
      cachedDocCenterY = rect.top + window.scrollY + height * 0.5;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      pointsUniforms.uScaleFactor.value = Math.max(0.76, Math.min(1.18, height / 430));
    };

    syncSize();
    const resizeObserver = new ResizeObserver(() => {
      syncSize();
    });
    resizeObserver.observe(containerEl);

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let revealProgress = 0;
    let inViewport = true;
    let tabVisible = !document.hidden;
    let disposed = false;
    let contextLost = false;
    let cancelNextFrame: (() => void) | null = null;
    let lastNow = performance.now();
    let elapsed = 0;

    const heroSection = containerEl.closest('section') ?? containerEl;

    const handlePointerMove = (e: Event) => {
      if (!inViewport || !tabVisible) return;
      const pe = e as PointerEvent;
      if (cachedWidth <= 0 || cachedHeight <= 0) return;

      const nx = ((pe.pageX - cachedDocCenterX) / cachedWidth) * 1.4;
      const ny = ((pe.pageY - cachedDocCenterY) / cachedHeight) * 1.4;
      const clampedX = Math.max(-1, Math.min(1, nx));
      const clampedY = Math.max(-1, Math.min(1, ny));

      targetRotY = clampedX * 0.13;
      targetRotX = -clampedY * 0.08;
    };

    const handlePointerLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    heroSection.addEventListener('pointermove', handlePointerMove, { passive: true });
    heroSection.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    const renderFrame = (dt: number) => {
      elapsed += dt;
      revealProgress = Math.min(1, revealProgress + dt * 2.4);
      const easedReveal = 1 - Math.pow(1 - revealProgress, 3);

      pointsUniforms.uTime.value = elapsed;
      pointsUniforms.uReveal.value = easedReveal;
      linesUniforms.uTime.value = elapsed;
      linesUniforms.uReveal.value = easedReveal;

      const ambientYaw = Math.sin(elapsed * 0.24) * 0.04;
      const ambientPitch = Math.cos(elapsed * 0.19) * 0.018;

      currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX + ambientPitch, 4.5, dt);
      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY + ambientYaw, 4.5, dt);

      rootGroup.rotation.x = currentRotX;
      rootGroup.rotation.y = currentRotY;

      for (const track of orbitalTrackState) {
        track.mat.opacity = track.baseOpacity * easedReveal;
        for (const sat of track.satellites) {
          const angle = sat.phase + elapsed * sat.speed;
          sat.mesh.position.set(
            Math.cos(angle) * sat.radiusX,
            Math.sin(angle) * sat.radiusY,
            0,
          );
          sat.mat.uniforms.uOpacity.value = sat.baseOpacity * easedReveal;
        }
      }

      renderer.render(scene, camera);
    };

    const stopLoop = () => {
      if (cancelNextFrame) {
        cancelNextFrame();
        cancelNextFrame = null;
      }
    };

    const tick = () => {
      cancelNextFrame = null;
      if (disposed || contextLost || !inViewport || !tabVisible) return;

      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      renderFrame(dt);

      if (!disposed && !contextLost && inViewport && tabVisible) {
        cancelNextFrame = scheduleAnimationFrame(renderer, isSoftwareGl, tick);
      }
    };

    const resumeLoop = () => {
      if (disposed || contextLost || !inViewport || !tabVisible) return;
      if (cancelNextFrame) return;
      lastNow = performance.now();
      cancelNextFrame = scheduleAnimationFrame(renderer, isSoftwareGl, tick);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const visible = entry.isIntersecting;
        if (visible === inViewport) return;
        inViewport = visible;
        if (inViewport) {
          resumeLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: '120px 0px', threshold: 0.01 },
    );
    intersectionObserver.observe(containerEl);

    const handleVisibilityChange = () => {
      tabVisible = !document.hidden;
      if (tabVisible) {
        resumeLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      stopLoop();
    };

    const handleContextRestored = () => {
      contextLost = false;
      syncSize();
      renderFrame(0.016);
      resumeLoop();
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    renderFrame(0.016);
    resumeLoop();

    return () => {
      disposed = true;
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      heroSection.removeEventListener('pointermove', handlePointerMove);
      heroSection.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      pointsGeometry.dispose();
      pointsMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      for (const track of orbitalTrackState) {
        track.geom.dispose();
        track.mat.dispose();
        for (const sat of track.satellites) {
          sat.geom.dispose();
          sat.mat.dispose();
        }
      }
      renderer.dispose();
      mountEl.replaceChildren();
    };
  }, [portraitData, showStaticFallback]);

  return (
    <div
      ref={containerRef}
      data-testid="celestial-portrait"
      data-render-mode={showStaticFallback ? 'static' : 'webgl'}
      aria-hidden="true"
      className="relative h-[330px] w-[330px] max-w-full shrink-0 select-none [contain:layout_paint] [transform:translateZ(0)] sm:h-[390px] sm:w-[390px] lg:h-[465px] lg:w-[465px]"
    >
      {/* Minimalist concentric hairline framing */}
      <div className="pointer-events-none absolute inset-4 rounded-full border border-[#27272C]/45" />
      <div className="pointer-events-none absolute inset-11 rounded-full border border-[#27272C]/25" />

      {showStaticFallback ? (
        staticFallbackUrl ? (
          <img
            src={staticFallbackUrl}
            alt=""
            width={465}
            height={465}
            decoding="sync"
            data-testid="celestial-portrait-static"
            className="relative block h-full w-full select-none object-contain opacity-100 transition-opacity duration-300"
          />
        ) : null
      ) : (
        <div
          ref={mountRef}
          className="relative h-full w-full will-change-transform [transform:translateZ(0)]"
        />
      )}
    </div>
  );
}
