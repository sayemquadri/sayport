import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ORBITAL_DESTINATIONS,
  type DestinationId,
  type OrbitalDestination,
} from '../data/portfolio';
import {
  buildOrbitalEllipsePath,
  computeOrbitalPosition,
} from '../utils/orbitalNav';
import { CelestialPortrait } from './CelestialPortrait';
import { DestinationIcon } from './DestinationIcon';

interface OrbitalNavigationProps {
  activeSection: string;
  onNavigate: (destinationId: DestinationId) => void;
  onMiniPortraitReady?: (dataUrl: string) => void;
}

export function OrbitalNavigation({
  activeSection,
  onNavigate,
  onMiniPortraitReady,
}: OrbitalNavigationProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgOrbitLayerRef = useRef<SVGSVGElement | null>(null);
  const satelliteButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [hoveredId, setHoveredId] = useState<DestinationId | null>(null);
  const [focusedId, setFocusedId] = useState<DestinationId | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  const isOrbitPausedRef = useRef(false);
  isOrbitPausedRef.current = hoveredId !== null || focusedId !== null;

  const parallaxRef = useRef({ targetX: 0, targetY: 0, curX: 0, curY: 0 });
  const stageSizeRef = useRef(480);

  const ellipsePaths = useMemo(
    () =>
      ORBITAL_DESTINATIONS.map((dest) => ({
        id: dest.id,
        featured: Boolean(dest.featured),
        d: buildOrbitalEllipsePath(dest, 500, 375, 88),
      })),
    [],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const updateSize = () => {
      const rect = stageEl.getBoundingClientRect();
      if (rect.width > 0) {
        stageSizeRef.current = rect.width;
      }
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(stageEl);

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = stageEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width * 0.5)) / (rect.width * 0.6)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height * 0.5)) / (rect.height * 0.6)));
      parallaxRef.current.targetX = nx;
      parallaxRef.current.targetY = ny;
    };

    const handlePointerLeave = () => {
      parallaxRef.current.targetX = 0;
      parallaxRef.current.targetY = 0;
    };

    const hostSection = stageEl.closest('section') ?? stageEl;
    hostSection.addEventListener('pointermove', handlePointerMove as EventListener, {
      passive: true,
    });
    hostSection.addEventListener('pointerleave', handlePointerLeave, {
      passive: true,
    });

    let elapsedOrbit = 0;
    let lastTs = performance.now();
    let lastCommitTs = 0;
    let rafId = 0;
    let inView = true;

    const applyPositions = (t: number) => {
      const radiusPx = stageSizeRef.current * 0.375;
      const { curX, curY } = parallaxRef.current;

      if (svgOrbitLayerRef.current) {
        svgOrbitLayerRef.current.style.transform = `translate3d(${(curX * 4).toFixed(1)}px, ${(curY * 4).toFixed(1)}px, 0)`;
      }

      for (const dest of ORBITAL_DESTINATIONS) {
        const btn = satelliteButtonRefs.current[dest.id];
        if (!btn) continue;
        const pos = computeOrbitalPosition(dest, t, curX, curY);
        const px = Math.round(pos.xFactor * radiusPx * 2) / 2;
        const py = Math.round(pos.yFactor * radiusPx * 2) / 2;
        const depthScale = (0.96 + (pos.depth + 1) * 0.04).toFixed(3);
        btn.style.transform = `translate3d(calc(-50% + ${px}px), calc(-50% + ${py}px), 0) scale(${depthScale})`;
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      if (!prefersReducedMotion && !isOrbitPausedRef.current) {
        elapsedOrbit += dt;
      }

      const p = parallaxRef.current;
      const alpha = 1 - Math.exp(-5.0 * dt);
      p.curX += (p.targetX - p.curX) * alpha;
      p.curY += (p.targetY - p.curY) * alpha;

      if (now - lastCommitTs >= 72) {
        lastCommitTs = now;
        applyPositions(elapsedOrbit);
      }

      if (inView && !prefersReducedMotion) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    applyPositions(0);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        inView = visible;
        if (visible && !prefersReducedMotion) {
          window.cancelAnimationFrame(rafId);
          lastTs = performance.now();
          rafId = window.requestAnimationFrame(step);
        } else {
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(stageEl);

    if (!prefersReducedMotion) {
      rafId = window.requestAnimationFrame(step);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      hostSection.removeEventListener('pointermove', handlePointerMove as EventListener);
      hostSection.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [prefersReducedMotion]);

  const highlightedDestination: OrbitalDestination | null = useMemo(() => {
    const targetId = hoveredId ?? focusedId;
    if (!targetId) return null;
    return ORBITAL_DESTINATIONS.find((d) => d.id === targetId) ?? null;
  }, [hoveredId, focusedId]);

  return (
    <div className="flex w-full flex-col items-center">
      {/* Orbital celestial stage */}
      <div
        ref={stageRef}
        data-testid="orbital-navigation-stage"
        className="relative flex aspect-square w-full max-w-[340px] items-center justify-center sm:max-w-[465px] lg:max-w-[520px]"
      >
        {/* Tilted elliptical orbital trajectories tinted with SAY purple */}
        <svg
          ref={svgOrbitLayerRef}
          viewBox="0 0 1000 1000"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full will-change-transform"
        >
          {ellipsePaths.map((orbit) => {
            const isHighlighted =
              hoveredId === orbit.id ||
              focusedId === orbit.id ||
              activeSection === orbit.id;
            return (
              <path
                key={orbit.id}
                d={orbit.d}
                fill="none"
                stroke={
                  isHighlighted
                    ? '#9D6BFF'
                    : orbit.featured
                      ? '#6D28D9'
                      : '#27272C'
                }
                strokeOpacity={
                  isHighlighted ? 0.72 : orbit.featured ? 0.58 : 0.6
                }
                strokeWidth={orbit.featured ? 1.25 : 0.85}
                strokeDasharray={orbit.featured ? undefined : '4 7'}
                className="transition-[stroke,stroke-opacity] duration-200"
              />
            );
          })}
        </svg>

        {/* Central 3D celestial wireframe portrait (preserved 1:1) */}
        <div className="relative z-10 flex items-center justify-center">
          <CelestialPortrait
            onMiniPortraitReady={onMiniPortraitReady}
            className="w-[244px] sm:w-[330px] lg:w-[366px]"
          />
        </div>

        {/* Desktop & Tablet orbiting interactive destination satellites */}
        <nav
          aria-label="Orbital section navigation"
          className="pointer-events-none absolute inset-0 z-20 hidden sm:block"
        >
          {ORBITAL_DESTINATIONS.map((dest) => {
            const isActive = activeSection === dest.id;
            const isInteracting = hoveredId === dest.id || focusedId === dest.id;
            const isProminent = Boolean(dest.featured);

            return (
              <button
                key={dest.id}
                ref={(el) => {
                  satelliteButtonRefs.current[dest.id] = el;
                }}
                type="button"
                data-testid={`orbital-satellite-${dest.id}`}
                onClick={() => onNavigate(dest.id)}
                onMouseEnter={() => setHoveredId(dest.id)}
                onMouseLeave={() =>
                  setHoveredId((prev) => (prev === dest.id ? null : prev))
                }
                onFocus={() => setFocusedId(dest.id)}
                onBlur={() =>
                  setFocusedId((prev) => (prev === dest.id ? null : prev))
                }
                aria-label={`${dest.index} ${dest.code}: ${dest.label}`}
                aria-current={isActive ? 'location' : undefined}
                className="pointer-events-auto group absolute top-1/2 left-1/2 flex h-11 w-11 items-center justify-center rounded-full focus:outline-none"
              >
                {/* Luminous celestial satellite node */}
                <span
                  className={`relative flex items-center justify-center rounded-full border transition-all duration-200 ${
                    isProminent ? 'h-8 w-8' : 'h-7 w-7'
                  } ${
                    isActive || isInteracting
                      ? 'border-[#9D6BFF] bg-[#1C1430] text-[#F0EFEC] shadow-[0_0_16px_rgba(141,77,255,0.42)]'
                      : isProminent
                        ? 'border-[#8B4DFF]/75 bg-[#161224] text-[#EDE6FF] shadow-[0_0_12px_rgba(141,77,255,0.24)]'
                        : 'border-[#32323A] bg-[#111114] text-[#B6B6BE] hover:border-[#9D6BFF]/75 hover:text-[#F0EFEC]'
                  }`}
                >
                  <DestinationIcon
                    id={dest.id}
                    className={isProminent ? 'h-3.5 w-3.5' : 'h-3 w-3'}
                  />
                </span>

                {/* Callout code always visible cleanly near satellite; full label expands on hover/focus */}
                <span
                  className={`pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap rounded border px-2 py-0.5 text-center transition-all duration-150 ${
                    isInteracting
                      ? 'z-30 border-[#9D6BFF]/65 bg-[#111114] text-[#F0EFEC] shadow-lg'
                      : isProminent
                        ? 'border-[#8B4DFF]/40 bg-[#0B0B0D]/95 text-[#E8DEFF]'
                        : 'border-[#27272C]/90 bg-[#0B0B0D]/90 text-[#919198]'
                  }`}
                >
                  <span className="block text-[10px] font-medium tracking-[0.14em] tabular-nums">
                    {dest.index} · {dest.code}
                  </span>
                  {isInteracting && (
                    <span className="mt-0.5 block text-[11px] font-normal tracking-normal text-[#919198]">
                      {dest.label}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Live desktop orbital status readout */}
      <div className="mt-5 hidden h-6 items-center justify-center sm:flex">
        <p
          aria-live="polite"
          className="text-center text-xs tracking-[0.04em] text-[#919198] transition-opacity duration-150"
        >
          {highlightedDestination ? (
            <>
              <span className="font-medium text-[#C4A7FF] tabular-nums">
                {highlightedDestination.index} · {highlightedDestination.code}
              </span>
              <span aria-hidden="true"> — </span>
              <span className="text-[#F0EFEC]">{highlightedDestination.label}</span>
            </>
          ) : (
            <span>Select an orbiting node to explore SAY.</span>
          )}
        </p>
      </div>

      {/* Compact touch-friendly orbital navigation index for narrow mobile viewports */}
      <nav
        aria-label="Mobile celestial destinations"
        className="mt-4 grid w-full max-w-[340px] grid-cols-2 gap-2 sm:hidden"
      >
        {ORBITAL_DESTINATIONS.map((dest) => {
          const isActive = activeSection === dest.id;
          const isProminent = Boolean(dest.featured);
          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => onNavigate(dest.id)}
              aria-current={isActive ? 'location' : undefined}
              className={`flex min-h-[44px] items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors ${
                isActive
                  ? 'border-[#9D6BFF] bg-[#1C1430] text-[#F0EFEC]'
                  : isProminent
                    ? 'border-[#8B4DFF]/55 bg-[#151122] text-[#F0EFEC]'
                    : 'border-[#27272C] bg-[#111114] text-[#919198] hover:border-[#3E3E48] hover:text-[#F0EFEC]'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  isProminent || isActive
                    ? 'border-[#9D6BFF]/75 text-[#C4A7FF]'
                    : 'border-[#27272C] text-[#919198]'
                }`}
              >
                <DestinationIcon id={dest.id} className="h-3 w-3" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-medium tracking-[0.12em] text-[#F0EFEC] tabular-nums">
                  {dest.index} {dest.code}
                </span>
                <span className="block truncate text-[11px] text-[#919198]">
                  {dest.label}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
