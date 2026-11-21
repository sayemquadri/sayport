import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  buildPortraitConstellation,
  projectPerspectivePoint,
  rotateEulerXYZ,
  type ConstellationData,
  type PortraitSourceBuffer,
} from '../utils/constellationPortrait';

const PORTRAIT_ASSET_PATH = '/assets/aistudio/Screenshot_2026-06-24_202016_20009026.png';
const CAMERA_Z = 3.35;
const CAMERA_FOV = 34;

const PARTICLE_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aKind;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScaleFactor;
  uniform float uMotion;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vKind;

  void main() {
    vColor = aColor;
    vKind = aKind;

    vec3 pos = position;

    if (uMotion > 0.5) {
      // Hair & outer nodes drift very subtly; core facial landmarks stay tightly anchored
      float driftAmp = aKind > 2.5 ? 0.012 : (aKind > 1.5 ? 0.008 : (aKind < 0.5 ? 0.003 : 0.0014));
      pos.x += sin(uTime * 0.45 * aSpeed + aPhase) * driftAmp;
      pos.y += cos(uTime * 0.38 * aSpeed + aPhase * 1.37) * driftAmp;
      pos.z += sin(uTime * 0.32 * aSpeed + aPhase * 0.73) * driftAmp * 0.7;

      float wave = 0.5 + 0.5 * sin(uTime * 1.35 * aSpeed + aPhase);
      float microShimmer = 0.5 + 0.5 * sin(uTime * 3.1 * aSpeed + aPhase * 2.1);
      vFlicker = mix(0.72, 1.0, wave * 0.72 + microShimmer * 0.28);
    } else {
      vFlicker = 0.94;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = max(1.2, -mvPosition.z);
    gl_PointSize = clamp(aSize * uPixelRatio * uScaleFactor * (3.05 / dist), 1.8, 22.0);
  }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uReveal;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vKind;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    // Crisp pinpoint star core with restrained halo (no cloudy glow)
    float core = exp(-d * d * 16.0);
    float softRing = smoothstep(0.48, 0.0, d) * 0.28;

    // Subtle astronomical cross gleam on landmark anchors and satellite nodes
    float flare = 0.0;
    if (vKind > 0.5 && vKind < 2.5) {
      float ax = exp(-abs(uv.x) * 26.0) * exp(-abs(uv.y) * 8.5);
      float ay = exp(-abs(uv.y) * 26.0) * exp(-abs(uv.x) * 8.5);
      flare = (ax + ay) * 0.28 * smoothstep(0.5, 0.1, d);
    }

    float intensity = clamp(core * 1.15 + softRing + flare, 0.0, 1.0) * vFlicker;
    vec3 finalColor = mix(vColor, vec3(0.97, 0.98, 1.0), core * 0.45);

    float alpha = clamp((core * 1.05 + softRing + flare * 0.72) * vFlicker, 0.0, 1.0) * uReveal;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(finalColor * (0.9 + core * 0.35), alpha * (0.82 + 0.18 * intensity));
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
  uniform float uMotion;
  uniform float uReveal;

  varying vec3 vColor;
  varying float vProgress;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    float alpha = vAlpha;
    vec3 col = vColor;

    if (uMotion > 0.5) {
      // Sparse travelling light pulse along selected constellation edges
      float cycle = fract(uTime * 0.16 + vSeed * 17.31);
      if (cycle < 0.24) {
        float pulsePos = cycle / 0.24;
        float dist = abs(vProgress - pulsePos);
        float pulse = exp(-dist * dist * 58.0);
        float endFade = smoothstep(0.0, 0.12, pulsePos) * smoothstep(1.0, 0.88, pulsePos);
        float energy = pulse * endFade;
        col = mix(col, vec3(0.56, 0.74, 1.0), energy * 0.75);
        alpha += energy * 0.46;
      }
    }

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.78) * uReveal);
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

  // On software rasterizers (e.g., SwiftShader), fence completion before queuing the next rAF
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

function sampleImageToBuffer(img: HTMLImageElement): PortraitSourceBuffer {
  const aspect = img.naturalWidth > 0 && img.naturalHeight > 0
    ? img.naturalWidth / img.naturalHeight
    : 0.78;
  const targetWidth = 172;
  const targetHeight = Math.max(96, Math.round(targetWidth / aspect));

  const offscreen = document.createElement('canvas');
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;

  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { width: 0, height: 0, data: new Uint8ClampedArray(0) };
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

  return {
    width: targetWidth,
    height: targetHeight,
    data: imageData.data,
  };
}

/**
 * Rasterizes a crisp static PNG data URL of the celestial constellation portrait
 * for reduced-motion preferences or environments without WebGL.
 */
function renderStaticConstellationDataUrl(data: ConstellationData, size = 930): string {
  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;

  const ctx = offscreen.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, size, size);

  // 1. Perspective-projected tilted orbital rings
  for (const ring of data.orbitalRings) {
    ctx.strokeStyle = ring.isAccent
      ? 'rgba(78, 126, 255, 0.24)'
      : 'rgba(59, 64, 80, 0.16)';
    ctx.lineWidth = Math.max(1, size * 0.0014);
    ctx.beginPath();

    const count = ring.points.length / 3;
    for (let i = 0; i < count; i++) {
      const [rx, ry, rz] = rotateEulerXYZ(
        ring.points[i * 3],
        ring.points[i * 3 + 1],
        ring.points[i * 3 + 2],
        ring.tiltX,
        ring.tiltY,
        ring.tiltZ,
      );
      const p = projectPerspectivePoint(rx, ry, rz, CAMERA_Z, CAMERA_FOV, size);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // 2. Constellation connecting segments
  ctx.lineWidth = Math.max(0.85, size * 0.0012);
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

  // 3. Pinpoint stars & facial relief points
  const sizeScale = size / 465;
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
    const radius = Math.max(0.75, data.pointSizes[i] * 0.42 * sizeScale * (p.scale / 1.0));

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.88)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return offscreen.toDataURL('image/png');
}

export function CelestialPortrait() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [constellation, setConstellation] = useState<ConstellationData | null>(null);
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

  // Load and sample the local reference photograph purely on the client
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      if (!active) return;
      const buffer = sampleImageToBuffer(img);
      if (buffer.width > 0 && buffer.height > 0) {
        const built = buildPortraitConstellation(buffer, {
          seed: 20260624,
          maxPortraitPoints: 4400,
          maxAnchorNodes: 320,
          distantStarCount: 130,
          satelliteCount: 14,
        });
        setConstellation(built);
      }
    };

    img.src = PORTRAIT_ASSET_PATH;

    return () => {
      active = false;
    };
  }, []);

  const showStaticFallback = prefersReducedMotion || webglUnavailable;

  // Build static fallback PNG strictly when needed (reduced motion or WebGL unavailable)
  const staticFallbackUrl = useMemo(() => {
    if (!showStaticFallback || !constellation) return '';
    return renderStaticConstellationDataUrl(constellation, 930);
  }, [showStaticFallback, constellation]);

  // Hardware-accelerated Three.js renderer with IntersectionObserver viewport gating
  useEffect(() => {
    if (!constellation || showStaticFallback) return;

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
    camera.position.set(0, 0.02, CAMERA_Z);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const portraitGroup = new THREE.Group();
    rootGroup.add(portraitGroup);

    // Points geometry + custom shader
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(constellation.pointPositions, 3),
    );
    pointsGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(constellation.pointColors, 3),
    );
    pointsGeometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(constellation.pointSizes, 1),
    );
    pointsGeometry.setAttribute(
      'aPhase',
      new THREE.BufferAttribute(constellation.pointPhases, 1),
    );
    pointsGeometry.setAttribute(
      'aSpeed',
      new THREE.BufferAttribute(constellation.pointSpeeds, 1),
    );
    pointsGeometry.setAttribute(
      'aKind',
      new THREE.BufferAttribute(constellation.pointKinds, 1),
    );

    const pointsUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uScaleFactor: { value: 1.0 },
      uMotion: { value: 1.0 },
      uReveal: { value: 0.0 },
    };

    const pointsMaterial = new THREE.ShaderMaterial({
      uniforms: pointsUniforms,
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    portraitGroup.add(pointsMesh);

    // Constellation lines geometry + custom pulse shader
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(constellation.linePositions, 3),
    );
    linesGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(constellation.lineColors, 3),
    );
    linesGeometry.setAttribute(
      'aProgress',
      new THREE.BufferAttribute(constellation.lineProgress, 1),
    );
    linesGeometry.setAttribute(
      'aSeed',
      new THREE.BufferAttribute(constellation.lineSeeds, 1),
    );
    linesGeometry.setAttribute(
      'aAlpha',
      new THREE.BufferAttribute(constellation.lineAlphas, 1),
    );

    const linesUniforms = {
      uTime: { value: 0 },
      uMotion: { value: 1.0 },
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

    // Minimalist elliptical orbital rings around the portrait
    const orbitGroup = new THREE.Group();
    rootGroup.add(orbitGroup);

    const ringDisposables: Array<{
      geom: THREE.BufferGeometry;
      mat: THREE.LineBasicMaterial;
      loop: THREE.LineLoop;
      speed: number;
      baseOpacity: number;
    }> = [];

    for (const ring of constellation.orbitalRings) {
      const ringGeom = new THREE.BufferGeometry();
      ringGeom.setAttribute('position', new THREE.BufferAttribute(ring.points, 3));

      const baseOpacity = ring.isAccent ? 0.24 : 0.16;
      const ringMat = new THREE.LineBasicMaterial({
        color: ring.isAccent ? 0x4e7eff : 0x3b4050,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });

      const loop = new THREE.LineLoop(ringGeom, ringMat);
      loop.rotation.set(ring.tiltX, ring.tiltY, ring.tiltZ);
      orbitGroup.add(loop);

      ringDisposables.push({
        geom: ringGeom,
        mat: ringMat,
        loop,
        speed: ring.speed,
        baseOpacity,
      });
    }

    // Cache document-space center & bounds during resize so pointermove never forces layout reflow
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

      targetRotY = clampedX * 0.14;
      targetRotX = -clampedY * 0.085;
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

      const ambientYaw = Math.sin(elapsed * 0.24) * 0.045;
      const ambientPitch = Math.cos(elapsed * 0.19) * 0.02;

      currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX + ambientPitch, 4.5, dt);
      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY + ambientYaw, 4.5, dt);

      rootGroup.rotation.x = currentRotX;
      rootGroup.rotation.y = currentRotY;

      for (const ring of ringDisposables) {
        ring.loop.rotation.z += ring.speed * dt;
        ring.mat.opacity = ring.baseOpacity * easedReveal;
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

    // Pause WebGL loop automatically whenever Hero scrolls out of view so scroll stays effortless
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

    // Draw initial frame synchronously, then advance smoothly via requestAnimationFrame
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
      for (const ring of ringDisposables) {
        ring.geom.dispose();
        ring.mat.dispose();
      }
      renderer.dispose();
      mountEl.replaceChildren();
    };
  }, [constellation, showStaticFallback]);

  return (
    <div
      ref={containerRef}
      data-testid="celestial-portrait"
      data-render-mode={showStaticFallback ? 'static' : 'webgl'}
      aria-hidden="true"
      className="relative h-[330px] w-[330px] max-w-full shrink-0 select-none [contain:layout_paint] [transform:translateZ(0)] sm:h-[390px] sm:w-[390px] lg:h-[465px] lg:w-[465px]"
    >
      {/* Fixed concentric architectural rings prevent visual shift while portrait loads */}
      <div className="pointer-events-none absolute inset-4 rounded-full border border-[#27272C]/55" />
      <div className="pointer-events-none absolute inset-10 rounded-full border border-[#27272C]/30" />

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
