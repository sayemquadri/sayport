import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS, SITE_IDENTITY } from '../data/portfolio';

interface NavbarProps {
  activeSection: string;
  onSectionSelect?: (sectionId: string) => void;
}

export function Navbar({ activeSection, onSectionSelect }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLinkClick = (sectionId?: string) => {
    if (sectionId) {
      onSectionSelect?.(sectionId);
    }
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#27272C] bg-[#0B0B0D]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-5 sm:px-8 lg:px-10">
        <a
          href="#home"
          onClick={() => handleLinkClick('home')}
          className="font-sans text-lg font-semibold tracking-tight text-[#F0EFEC] whitespace-nowrap shrink-0 transition-colors hover:text-[#4E7EFF]"
          aria-label="SQ. Sayem Quadri Home"
        >
          {SITE_IDENTITY.monogram}
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => handleLinkClick(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative inline-flex min-h-[40px] items-center py-2 text-[13.5px] font-medium tracking-wide whitespace-nowrap shrink-0 transition-colors duration-200 ${
                  isActive
                    ? 'text-[#F0EFEC]'
                    : 'text-[#919198] hover:text-[#F0EFEC]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-1 h-[1.5px] origin-left bg-[#4E7EFF] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#27272C] bg-[#111114] text-[#F0EFEC] transition-colors hover:border-[#4E7EFF]/60 md:hidden shrink-0"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          className="border-t border-[#27272C] bg-[#0B0B0D] px-5 py-4 md:hidden"
        >
          <ul className="flex flex-col divide-y divide-[#27272C]/70">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => handleLinkClick(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`flex min-h-[44px] items-center justify-between py-2.5 text-base font-medium transition-colors ${
                      isActive ? 'text-[#4E7EFF]' : 'text-[#F0EFEC]/90 hover:text-[#F0EFEC]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-[#919198] tabular-nums">
                      {item.id === 'home'
                        ? '00'
                        : item.id === 'about'
                          ? '01'
                          : item.id === 'work'
                            ? '02'
                            : item.id === 'beyond'
                              ? '03'
                              : '04'}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
