import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  buildLineDotPortrait,
  projectPerspectivePoint,
  rotateEulerXYZ,
  type LineDotPortraitData,
  type PortraitImageBuffer,
} from '../utils/linePortrait';

const PORTRAIT_ASSET_PATH = '/assets/aistudio/image_1dc1ebb0.png';
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
  uniform vec2 uHoverXY;
  uniform float uHoverActive;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vAlpha;
  varying float vKind;
  varying float vHoverGlow;

  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vKind = aKind;

    vec3 pos = position;

    // Faint background stars drift infinitesimally; portrait nodes & path particles stay anchored
    if (aKind > 2.5) {
      pos.x += sin(uTime * 0.32 * aSpeed + aPhase) * 0.005;
      pos.y += cos(uTime * 0.28 * aSpeed + aPhase * 1.37) * 0.005;
    }

    float wave = 0.5 + 0.5 * sin(uTime * 1.15 * aSpeed + aPhase);
    float micro = 0.5 + 0.5 * sin(uTime * 2.7 * aSpeed + aPhase * 1.9);
    if (aKind < 1.5) {
      vFlicker = mix(0.84, 1.0, wave * 0.7 + micro * 0.3);
    } else if (aKind < 2.5) {
      vFlicker = mix(0.55, 1.0, wave * 0.65 + micro * 0.35);
    } else {
      vFlicker = mix(0.45, 1.0, wave);
    }

    // Subtle brightness boost for stars near the hovered cursor / touch point
    float hoverDist = length(pos.xy - uHoverXY);
    vHoverGlow = exp(-hoverDist * hoverDist * 10.5) * uHoverActive * step(aKind, 2.4);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = max(1.2, -mvPosition.z);
    float sizeBoost = 1.0 + vHoverGlow * 0.24;
    gl_PointSize = clamp(aSize * sizeBoost * uPixelRatio * uScaleFactor * (3.1 / dist), 1.4, 22.0);
  }
`;

const NODE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uReveal;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vAlpha;
  varying float vKind;
  varying float vHoverGlow;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float alpha = 0.0;
    vec3 col = vColor;

    if (vKind < 1.5) {
      // Dominant original dot-stars: luminous pinpoint core, soft astronomical halo, delicate 4-point glint
      float core = exp(-d * d * 24.0);
      float halo = smoothstep(0.50, 0.14, d) * 0.32;
      float ax = exp(-abs(uv.x) * 28.0) * exp(-abs(uv.y) * 9.0);
      float ay = exp(-abs(uv.y) * 28.0) * exp(-abs(uv.x) * 9.0);
      float glint = (ax + ay) * 0.24 * smoothstep(0.5, 0.08, d);

      float lum = clamp(core * 1.15 + halo + glint, 0.0, 1.0);
      alpha = clamp(lum * (vAlpha + vHoverGlow * 0.22) * vFlicker, 0.0, 1.0) * uReveal;
      col = mix(vColor, vec3(0.98, 0.98, 1.0), core * 0.55);
      col = mix(col, vec3(0.76, 0.60, 1.0), vHoverGlow * 0.42);
    } else {
      // Secondary path micro-particles & distant faint stars
      float core = exp(-d * d * 22.0);
      float soft = smoothstep(0.48, 0.15, d) * 0.18;
      alpha = clamp((core + soft) * (vAlpha + vHoverGlow * 0.28) * vFlicker, 0.0, 1.0) * uReveal;
      col = mix(vColor, vec3(0.80, 0.65, 1.0), vHoverGlow * 0.45);
    }

    if (alpha < 0.01) discard;
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
    gl_PointSize = clamp(aSize * uPixelRatio * uScaleFactor * (3.2 / dist), 2.2, 10.0);
  }
`;

const SATELLITE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float core = exp(-d * d * 22.0);
    float halo = smoothstep(0.48, 0.12, d) * 0.28;
    float alpha = (core + halo) * uOpacity;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(mix(uColor, vec3(0.98, 0.99, 1.0), core * 0.45), alpha);
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
  varying vec2 vLocalXY;

  void main() {
    vColor = aColor;
    vProgress = aProgress;
    vSeed = aSeed;
    vAlpha = aAlpha;
    vLocalXY = position.xy;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform vec2 uHoverXY;
  uniform float uHoverActive;

  varying vec3 vColor;
  varying float vProgress;
  varying float vSeed;
  varying float vAlpha;
  varying vec2 vLocalXY;

  void main() {
    float alpha = vAlpha;
    vec3 col = vColor;

    // Delicate travelling light pulse gliding through selected connections
    float cycle = fract(uTime * 0.12 + vSeed * 17.19);
    if (cycle < 0.22) {
      float pulsePos = cycle / 0.22;
      float dist = abs(vProgress - pulsePos);
      float pulse = exp(-dist * dist * 54.0);
      float endFade = smoothstep(0.0, 0.12, pulsePos) * smoothstep(1.0, 0.88, pulsePos);
      float energy = pulse * endFade;
      col = mix(col, vec3(0.68, 0.48, 1.0), energy * 0.80);
      alpha += energy * 0.30;
    }

    // Subtle light response across connected paths near pointer hover
    float hoverDist = length(vLocalXY - uHoverXY);
    float hoverResponse = exp(-hoverDist * hoverDist * 13.0) * uHoverActive;
    col = mix(col, vec3(0.76, 0.60, 1.0), hoverResponse * 0.68);
    alpha += hoverResponse * 0.32;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.96) * uReveal);
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
  const targetWidth = Math.max(1, img.naturalWidth || 1254);
  const targetHeight = Math.max(1, img.naturalHeight || 1254);
  const offscreen = document.createElement('canvas');
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;

  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { width: 0, height: 0, data: new Uint8ClampedArray(0) };
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

  return {
    width: targetWidth,
    height: targetHeight,
    data: imageData.data,
  };
}

/**
 * Rasterizes a crisp static high-DPI PNG data URL of the celestial line-and-dot sculpture
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

  // 1. Subtle orbiting satellite particles around the sculpture
  for (const track of data.orbitalTracks) {
    for (const sat of track.satellites) {
      const lx = Math.cos(sat.phase) * track.radiusX;
      const ly = Math.sin(sat.phase) * track.radiusY;
      const [rx, ry, rz] = rotateEulerXYZ(lx, ly, 0, track.tiltX, track.tiltY, track.tiltZ);
      const p = projectPerspectivePoint(rx, ry, rz, CAMERA_Z, CAMERA_FOV, size);

      ctx.fillStyle = sat.isAccent
        ? 'rgba(164, 114, 255, 0.88)'
        : 'rgba(228, 228, 240, 0.78)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, sat.size * 0.48 * sizeScale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Fine celestial connecting lines
  ctx.lineWidth = Math.max(1.05, size * 0.00175);
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

  // 3. Dominant original dot-stars, secondary path micro-particles, and faint background stars
  for (let i = 0; i < data.pointCount; i++) {
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
    const kind = data.pointKinds[i];
    const radius = Math.max(0.7, data.pointSizes[i] * 0.52 * sizeScale * p.scale);

    if (kind < 1.5) {
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(alpha * 0.22).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 1.9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return offscreen.toDataURL('image/png');
}

interface CelestialPortraitProps {
  className?: string;
  onMiniPortraitReady?: (dataUrl: string) => void;
}

export function CelestialPortrait({
  className = '',
  onMiniPortraitReady,
}: CelestialPortraitProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const miniCallbackRef = useRef(onMiniPortraitReady);
  miniCallbackRef.current = onMiniPortraitReady;

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

  // Load and trace the attached line-and-dot artwork strictly in-browser
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
        if (miniCallbackRef.current) {
          miniCallbackRef.current(renderStaticLineDotDataUrl(built, 240));
        }
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

    const hoverXYUniform = new THREE.Vector2(0, 0);

    // 1. Fine celestial connecting lines with travelling pulses & hover light response
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
      uHoverXY: { value: hoverXYUniform },
      uHoverActive: { value: 0.0 },
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

    // 2. Dominant original dot stars, secondary path particles, and faint background stars
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
      uHoverXY: { value: hoverXYUniform },
      uHoverActive: { value: 0.0 },
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

    // 3. Small satellite particles orbiting quietly around the sculpture
    const orbitGroup = new THREE.Group();
    rootGroup.add(orbitGroup);

    const orbitalTrackState: Array<{
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

      const satStates = track.satellites.map((sat) => {
        const satGeom = new THREE.BufferGeometry();
        satGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        satGeom.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([sat.size]), 1));

        const satMat = new THREE.ShaderMaterial({
          uniforms: {
            uPixelRatio: { value: pixelRatio },
            uScaleFactor: pointsUniforms.uScaleFactor,
            uColor: { value: new THREE.Color(sat.isAccent ? 0xa06bff : 0xe6e4f2) },
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
          baseOpacity: sat.isAccent ? 0.85 : 0.72,
        };
      });

      orbitalTrackState.push({
        satellites: satStates,
      });
    }

    let cachedDocCenterX = 0;
    let cachedDocCenterY = 0;
    let cachedWidth = 360;
    let cachedHeight = 360;
    const halfViewHeight = Math.tan(((CAMERA_FOV * Math.PI) / 180) * 0.5) * CAMERA_Z;

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

      pointsUniforms.uScaleFactor.value = Math.max(0.78, Math.min(1.18, height / 430));
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
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;
    let targetHoverX = 0;
    let targetHoverY = 0;
    let targetHoverActive = 0;
    let currentHoverActive = 0;

    let activeTouchId: number | null = null;
    let touchStartX = 0;
    let touchStartY = 0;

    let revealProgress = 0;
    let inViewport = true;
    let tabVisible = !document.hidden;
    let disposed = false;
    let contextLost = false;
    let cancelNextFrame: (() => void) | null = null;
    let lastNow = performance.now();
    let elapsed = 0;

    const heroSection = containerEl.closest('section') ?? containerEl;

    const updateHoverCoordsFromPage = (pageX: number, pageY: number) => {
      if (cachedWidth <= 0 || cachedHeight <= 0) return;
      const relX = (pageX - cachedDocCenterX) / (cachedWidth * 0.5);
      const relY = -((pageY - cachedDocCenterY) / (cachedHeight * 0.5));
      const aspect = cachedWidth / cachedHeight;
      targetHoverX = relX * halfViewHeight * aspect;
      targetHoverY = relY * halfViewHeight;
      targetHoverActive = Math.hypot(relX, relY) <= 1.25 ? 1.0 : 0.0;
    };

    const handleHeroPointerMove = (e: Event) => {
      if (!inViewport || !tabVisible) return;
      const pe = e as PointerEvent;
      if (pe.pointerType === 'touch') return;
      if (cachedWidth <= 0 || cachedHeight <= 0) return;

      const nx = ((pe.pageX - cachedDocCenterX) / cachedWidth) * 1.4;
      const ny = ((pe.pageY - cachedDocCenterY) / cachedHeight) * 1.4;
      const clampedX = Math.max(-1, Math.min(1, nx));
      const clampedY = Math.max(-1, Math.min(1, ny));

      targetRotY = clampedX * 0.14;
      targetRotX = -clampedY * 0.085;
      targetParallaxX = clampedX * 0.025;
      targetParallaxY = -clampedY * 0.018;

      updateHoverCoordsFromPage(pe.pageX, pe.pageY);
    };

    const handleHeroPointerLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      targetParallaxX = 0;
      targetParallaxY = 0;
      targetHoverActive = 0;
    };

    const handleContainerPointerDown = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.pointerType !== 'touch') return;
      activeTouchId = pe.pointerId;
      touchStartX = pe.clientX;
      touchStartY = pe.clientY;
      updateHoverCoordsFromPage(pe.pageX, pe.pageY);
    };

    const handleContainerPointerMove = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.pointerType !== 'touch' || activeTouchId !== pe.pointerId) return;
      const dx = pe.clientX - touchStartX;
      const dy = pe.clientY - touchStartY;

      const nx = Math.max(-1, Math.min(1, dx / Math.max(80, cachedWidth * 0.42)));
      const ny = Math.max(-1, Math.min(1, dy / Math.max(80, cachedHeight * 0.42)));

      targetRotY = nx * 0.20;
      targetRotX = -ny * 0.09;
      targetParallaxX = nx * 0.028;
      updateHoverCoordsFromPage(pe.pageX, pe.pageY);
    };

    const handleContainerPointerEnd = (e: Event) => {
      const pe = e as PointerEvent;
      if (pe.pointerType !== 'touch') return;
      if (activeTouchId === pe.pointerId) {
        activeTouchId = null;
        targetRotX = 0;
        targetRotY = 0;
        targetParallaxX = 0;
        targetParallaxY = 0;
        targetHoverActive = 0;
      }
    };

    heroSection.addEventListener('pointermove', handleHeroPointerMove, { passive: true });
    heroSection.addEventListener('pointerleave', handleHeroPointerLeave, { passive: true });
    containerEl.addEventListener('pointerdown', handleContainerPointerDown, { passive: true });
    containerEl.addEventListener('pointermove', handleContainerPointerMove, { passive: true });
    containerEl.addEventListener('pointerup', handleContainerPointerEnd, { passive: true });
    containerEl.addEventListener('pointercancel', handleContainerPointerEnd, { passive: true });

    const renderFrame = (dt: number) => {
      elapsed += dt;
      revealProgress = Math.min(1, revealProgress + dt * 2.4);
      const easedReveal = 1 - Math.pow(1 - revealProgress, 3);

      currentHoverActive = THREE.MathUtils.damp(currentHoverActive, targetHoverActive, 6.0, dt);
      hoverXYUniform.x = THREE.MathUtils.damp(hoverXYUniform.x, targetHoverX, 8.0, dt);
      hoverXYUniform.y = THREE.MathUtils.damp(hoverXYUniform.y, targetHoverY, 8.0, dt);

      pointsUniforms.uTime.value = elapsed;
      pointsUniforms.uReveal.value = easedReveal;
      pointsUniforms.uHoverActive.value = currentHoverActive;

      linesUniforms.uTime.value = elapsed;
      linesUniforms.uReveal.value = easedReveal;
      linesUniforms.uHoverActive.value = currentHoverActive;

      const ambientYaw = Math.sin(elapsed * 0.22) * 0.042;
      const ambientPitch = Math.cos(elapsed * 0.17) * 0.018;
      const ambientFloatY = Math.sin(elapsed * 0.55) * 0.013;

      currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX + ambientPitch, 4.5, dt);
      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY + ambientYaw, 4.5, dt);
      currentParallaxX = THREE.MathUtils.damp(currentParallaxX, targetParallaxX, 4.5, dt);
      currentParallaxY = THREE.MathUtils.damp(currentParallaxY, targetParallaxY, 4.5, dt);

      rootGroup.rotation.x = currentRotX;
      rootGroup.rotation.y = currentRotY;
      portraitGroup.position.x = currentParallaxX;
      portraitGroup.position.y = currentParallaxY + ambientFloatY;

      for (const track of orbitalTrackState) {
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
      heroSection.removeEventListener('pointermove', handleHeroPointerMove);
      heroSection.removeEventListener('pointerleave', handleHeroPointerLeave);
      containerEl.removeEventListener('pointerdown', handleContainerPointerDown);
      containerEl.removeEventListener('pointermove', handleContainerPointerMove);
      containerEl.removeEventListener('pointerup', handleContainerPointerEnd);
      containerEl.removeEventListener('pointercancel', handleContainerPointerEnd);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      pointsGeometry.dispose();
      pointsMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      for (const track of orbitalTrackState) {
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
      style={{ touchAction: 'pan-y' }}
      className={`relative aspect-square w-full shrink-0 select-none [contain:layout_paint] [transform:translateZ(0)] ${
        className || 'max-w-[330px] sm:max-w-[390px] lg:max-w-[465px]'
      }`}
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
