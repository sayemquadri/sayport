import { useState } from 'react';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import {
  ORBITAL_DESTINATIONS,
  SITE_IDENTITY,
  type DestinationId,
} from '../data/portfolio';
import {
  computeCompactRingPoint,
  resolveActiveOrbitalDestination,
} from '../utils/orbitalNav';
import { DestinationIcon } from './DestinationIcon';

interface PersistentIdentityNavProps {
  visible: boolean;
  activeSection: string;
  miniPortraitUrl: string;
  mobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
  onReturnHome: () => void;
  onNavigateDestination: (id: DestinationId) => void;
}

export function PersistentIdentityNav({
  visible,
  activeSection,
  miniPortraitUrl,
  mobileMenuOpen,
  onOpenMobileMenu,
  onReturnHome,
  onNavigateDestination,
}: PersistentIdentityNavProps) {
  const [hoveredId, setHoveredId] = useState<DestinationId | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  if (!visible) {
    return null;
  }

  const activeDest =
    resolveActiveOrbitalDestination(ORBITAL_DESTINATIONS, activeSection, hoveredId) ??
    ORBITAL_DESTINATIONS[0];

  return (
    <>
      {/* Desktop discreet floating persistent celestial dial (bottom-right gutter) */}
      <aside
        aria-label="Persistent celestial navigation"
        data-testid="persistent-identity-desktop"
        className="fixed right-3.5 bottom-5 z-40 hidden md:flex flex-col items-end gap-2"
      >
        {collapsed ? (
          <div className="flex items-center gap-2 rounded-full border border-[#27272C] bg-[#111114] p-1.5 shadow-2xl">
            <button
              type="button"
              onClick={onReturnHome}
              aria-label="Return to SAY landing identity"
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#27272C] bg-[#0B0B0D] transition-colors hover:border-[#9D6BFF]"
            >
              {miniPortraitUrl ? (
                <img
                  src={miniPortraitUrl}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs font-semibold text-[#F0EFEC]">
                  {SITE_IDENTITY.brand}
                </span>
              )}
            </button>

            <span className="px-1.5 text-[11px] font-medium tracking-[0.12em] text-[#919198] tabular-nums">
              {activeDest.index} · {activeDest.code}
            </span>

            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand orbital navigation dial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#27272C] bg-[#0B0B0D] text-[#919198] transition-colors hover:border-[#9D6BFF]/70 hover:text-[#F0EFEC]"
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="w-[136px] rounded-2xl border border-[#27272C] bg-[#111114] p-2.5 shadow-2xl">
            <div className="mb-1.5 flex items-center justify-between gap-1.5 border-b border-[#27272C] pb-1.5">
              <div className="min-w-0">
                <span className="block truncate text-[9.5px] font-medium tracking-[0.12em] text-[#C4A7FF] tabular-nums">
                  {activeDest.index} · {activeDest.code}
                </span>
                <span className="block truncate text-[10px] text-[#919198]">
                  {activeDest.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Minimize persistent navigation dial"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#27272C] bg-[#0B0B0D] text-[#919198] transition-colors hover:text-[#F0EFEC]"
              >
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>

            {/* Condensed celestial orbit around mini portrait */}
            <div className="relative mx-auto flex h-[112px] w-[112px] items-center justify-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[10px] rounded-full border border-dashed border-[#27272C]"
              />

              <button
                type="button"
                onClick={onReturnHome}
                aria-label="Return to landing screen via SAY portrait"
                title="Return to SAY Home"
                className="group relative z-10 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#27272C] bg-[#0B0B0D] transition-colors hover:border-[#9D6BFF]"
              >
                {miniPortraitUrl ? (
                  <img
                    src={miniPortraitUrl}
                    alt=""
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-[11px] font-semibold text-[#F0EFEC]">
                    {SITE_IDENTITY.brand}
                  </span>
                )}
              </button>

              {ORBITAL_DESTINATIONS.map((dest, idx) => {
                const pt = computeCompactRingPoint(
                  idx,
                  ORBITAL_DESTINATIONS.length,
                  44,
                  -90,
                );
                const isActive = activeSection === dest.id;
                const isHighlighted = hoveredId === dest.id;

                return (
                  <button
                    key={dest.id}
                    type="button"
                    data-testid={`persistent-node-${dest.id}`}
                    onClick={() => onNavigateDestination(dest.id)}
                    onMouseEnter={() => setHoveredId(dest.id)}
                    onMouseLeave={() =>
                      setHoveredId((prev) => (prev === dest.id ? null : prev))
                    }
                    onFocus={() => setHoveredId(dest.id)}
                    onBlur={() =>
                      setHoveredId((prev) => (prev === dest.id ? null : prev))
                    }
                    aria-label={`${dest.index} ${dest.code}: ${dest.label}`}
                    aria-current={isActive ? 'location' : undefined}
                    style={{
                      transform: `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`,
                    }}
                    className={`absolute flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                      isActive
                        ? 'border-[#9D6BFF] bg-[#1F1638] text-[#F0EFEC] shadow-[0_0_12px_rgba(141,77,255,0.42)]'
                        : isHighlighted
                          ? 'border-[#9D6BFF]/75 bg-[#181326] text-[#F0EFEC]'
                          : 'border-[#27272C] bg-[#0B0B0D] text-[#919198] hover:border-[#9D6BFF]/70 hover:text-[#F0EFEC]'
                    }`}
                  >
                    <DestinationIcon id={dest.id} className="h-3 w-3" />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onReturnHome}
              className="mt-1 flex w-full items-center justify-center gap-1 rounded-md py-1 text-[9.5px] font-medium tracking-[0.12em] text-[#919198] transition-colors hover:text-[#F0EFEC]"
            >
              <span>SAY</span>
              <span aria-hidden="true">·</span>
              <span>Return top</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile compact persistent touch dock (<= 58px height, well under 15% cap) */}
      {!mobileMenuOpen && (
        <nav
          aria-label="Mobile persistent celestial navigation"
          data-testid="persistent-identity-mobile"
          className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-1 rounded-xl border border-[#27272C] bg-[#111114]/95 px-2 py-1.5 backdrop-blur-md shadow-2xl md:hidden"
        >
          <button
            type="button"
            onClick={onReturnHome}
            aria-label="Return to SAY landing identity"
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#27272C] bg-[#0B0B0D]"
          >
            {miniPortraitUrl ? (
              <img
                src={miniPortraitUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xs font-semibold text-[#F0EFEC]">
                {SITE_IDENTITY.brand}
              </span>
            )}
          </button>

          <div className="flex flex-1 items-center justify-around gap-0.5">
            {ORBITAL_DESTINATIONS.map((dest) => {
              const isActive = activeSection === dest.id;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => onNavigateDestination(dest.id)}
                  aria-label={`${dest.index} ${dest.code}: ${dest.label}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={`flex h-11 min-w-[38px] flex-1 flex-col items-center justify-center rounded-lg px-0.5 transition-colors ${
                    isActive
                      ? 'bg-[#1F1638] text-[#C4A7FF]'
                      : 'text-[#919198] hover:text-[#F0EFEC]'
                  }`}
                >
                  <DestinationIcon id={dest.id} className="h-4 w-4" />
                  <span className="mt-0.5 text-[9px] font-medium tracking-[0.06em] tabular-nums">
                    {dest.index}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-overlay"
            aria-label="Open full navigation menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#27272C] bg-[#0B0B0D] text-[#C4A7FF] transition-colors hover:border-[#8B4DFF]/70"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </>
  );
}
