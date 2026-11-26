import { Menu, X } from 'lucide-react';
import {
  ORBITAL_DESTINATIONS,
  SITE_IDENTITY,
  type DestinationId,
} from '../data/portfolio';
import { SayLogo } from './SayLogo';

interface NavbarProps {
  activeSection: string;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onReturnHome: () => void;
  onNavigateDestination: (id: DestinationId) => void;
}

const PRIMARY_NAV_DESTINATIONS = ORBITAL_DESTINATIONS.filter(
  (dest) => dest.id !== 'contact',
);

export function Navbar({
  activeSection,
  mobileMenuOpen,
  onToggleMobileMenu,
  onReturnHome,
  onNavigateDestination,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#27272C] bg-[#0B0B0D]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        {/* Zone 1: Authentic SAY vector brand anchor + subtle tagline */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onReturnHome();
          }}
          className="group flex items-center gap-3 whitespace-nowrap shrink-0 rounded-md py-1"
          aria-label="SAY — Sayem Quadri Home"
        >
          <SayLogo className="h-7 w-auto transition-transform duration-200 group-hover:scale-[1.03]" />
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-[#27272C] lg:inline-block"
          />
          <span className="hidden text-[11px] font-medium tracking-[0.14em] text-[#919198] lg:inline">
            {SITE_IDENTITY.tagline}
          </span>
        </a>

        {/* Zone 2: Clean desktop navigation links */}
        <nav
          aria-label="Primary sections"
          className="hidden items-center gap-1 md:flex"
        >
          {PRIMARY_NAV_DESTINATIONS.map((dest) => {
            const isActive = activeSection === dest.id;
            const navLabel =
              dest.id === 'work'
                ? 'Work'
                : dest.id === 'creative'
                  ? 'Creative'
                  : dest.id === 'experiments'
                    ? 'Experiments'
                    : 'About';

            return (
              <a
                key={dest.id}
                href={dest.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateDestination(dest.id);
                }}
                aria-current={isActive ? 'location' : undefined}
                className={`relative rounded-lg px-3.5 py-2 text-xs font-medium tracking-[0.06em] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#C4A7FF]'
                    : 'text-[#919198] hover:text-[#F0EFEC]'
                }`}
              >
                {navLabel}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3.5 bottom-0.5 h-[1.5px] bg-[#9D6BFF]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Contact action on desktop + minimalist hamburger overlay trigger on mobile */}
        <div className="relative flex items-center gap-2 shrink-0">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigateDestination('contact');
            }}
            aria-current={activeSection === 'contact' ? 'location' : undefined}
            className={`hidden min-h-[38px] items-center rounded-lg border px-4 py-1.5 text-xs font-medium tracking-[0.06em] whitespace-nowrap transition-colors md:inline-flex ${
              activeSection === 'contact'
                ? 'border-[#8B4DFF] bg-[#7C3AED] text-[#F0EFEC]'
                : 'border-[#27272C] bg-[#111114] text-[#F0EFEC] hover:border-[#8B4DFF]/70 hover:text-[#C4A7FF]'
            }`}
          >
            Contact
          </a>

          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-overlay"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#27272C] bg-[#111114] px-3.5 py-2 text-xs font-medium tracking-[0.08em] text-[#F0EFEC] whitespace-nowrap shrink-0 transition-colors hover:border-[#8B4DFF]/70 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
            )}
            <span>Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
