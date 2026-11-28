import { Menu, X } from 'lucide-react';
import {
  ORBITAL_DESTINATIONS,
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

const PRIMARY_NAV_DESTINATIONS = ORBITAL_DESTINATIONS.filter((dest) => dest.id !== 'contact');

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
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            onReturnHome();
          }}
          className="group flex shrink-0 items-center rounded-md py-1"
          aria-label="SAY — Sayem Quadri home"
        >
          <SayLogo className="h-7 w-auto transition-transform duration-200 group-hover:scale-[1.03]" />
        </a>

        <nav aria-label="Primary sections" className="hidden items-center gap-1 md:flex">
          {PRIMARY_NAV_DESTINATIONS.map((dest) => {
            const isActive = activeSection === dest.id;
            return (
              <a
                key={dest.id}
                href={dest.href}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigateDestination(dest.id);
                }}
                aria-current={isActive ? 'location' : undefined}
                className={`relative rounded-lg px-3.5 py-2 text-xs font-medium tracking-[0.06em] whitespace-nowrap transition-colors ${isActive ? 'text-[#C4A7FF]' : 'text-[#919198] hover:text-[#F0EFEC]'}`}
              >
                {dest.id === 'experiments' ? 'Process' : dest.id === 'creative' ? 'Creative' : dest.label.replace('Projects & ', '')}
                {isActive && <span aria-hidden="true" className="absolute inset-x-3.5 bottom-0.5 h-[1.5px] bg-[#9D6BFF]" />}
              </a>
            );
          })}
        </nav>

        <div className="relative flex shrink-0 items-center gap-2">
          <a
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              onNavigateDestination('contact');
            }}
            aria-current={activeSection === 'contact' ? 'location' : undefined}
            className={`hidden min-h-[38px] items-center rounded-lg border px-4 py-1.5 text-xs font-medium tracking-[0.06em] whitespace-nowrap transition-colors md:inline-flex ${activeSection === 'contact' ? 'border-[#8B4DFF] bg-[#7C3AED] text-[#F0EFEC]' : 'border-[#27272C] bg-[#111114] text-[#F0EFEC] hover:border-[#8B4DFF]/70 hover:text-[#C4A7FF]'}`}
          >
            Contact
          </a>

          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-overlay"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#27272C] bg-[#111114] px-3.5 py-2 text-xs font-medium tracking-[0.08em] text-[#F0EFEC] whitespace-nowrap transition-colors hover:border-[#8B4DFF]/70 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" /> : <Menu className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />}
            <span>Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
