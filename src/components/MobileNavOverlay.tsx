import { useEffect, useRef } from 'react';
import { ArrowUpRight, Github, Instagram, Linkedin, Mail, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import {
  CONTACT_CONTENT,
  ORBITAL_DESTINATIONS,
  SITE_IDENTITY,
  SOCIAL_CHANNELS,
  type DestinationId,
  type SocialChannel,
} from '../data/portfolio';
import { resolveActiveOrbitalDestination } from '../utils/orbitalNav';
import { getConfiguredSocialLinks, getEmailChannel } from '../utils/portfolio';
import { DestinationIcon } from './DestinationIcon';
import { SayLogo } from './SayLogo';

interface MobileNavOverlayProps {
  open: boolean;
  activeSection: string;
  miniPortraitUrl: string;
  onClose: () => void;
  onReturnHome: () => void;
  onNavigateDestination: (id: DestinationId) => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function renderChannelIcon(id: SocialChannel['id']) {
  switch (id) {
    case 'email':
      return <Mail className="h-4 w-4" aria-hidden="true" />;
    case 'github':
      return <Github className="h-4 w-4" aria-hidden="true" />;
    case 'linkedin':
      return <Linkedin className="h-4 w-4" aria-hidden="true" />;
    case 'instagram':
      return <Instagram className="h-4 w-4" aria-hidden="true" />;
  }
}

export function MobileNavOverlay({
  open,
  activeSection,
  miniPortraitUrl,
  onClose,
  onReturnHome,
  onNavigateDestination,
}: MobileNavOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const activeDest = resolveActiveOrbitalDestination(
    ORBITAL_DESTINATIONS,
    activeSection,
  );
  const emailChannel = getEmailChannel(SOCIAL_CHANNELS);
  const socialLinks = getConfiguredSocialLinks(SOCIAL_CHANNELS).filter(
    (channel) => channel.id !== 'email',
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, onClose]);

  const handleSelectHome = () => {
    onClose();
    onReturnHome();
  };

  const handleSelectDestination = (id: DestinationId) => {
    onClose();
    onNavigateDestination(id);
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          id="mobile-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation overlay"
          data-testid="mobile-nav-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="fixed inset-0 z-50 flex flex-col bg-[#0B0B0D]/97 backdrop-blur-xl md:hidden"
        >
          {/* Subtle celestial orbital hairline backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full border border-[#8B4DFF]/15" />
            <div className="absolute -top-14 -right-14 h-52 w-52 rounded-full border border-dashed border-[#27272C]/80" />
            <div
              className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(139, 77, 255, 0.28) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Header matching Navbar height cleanly */}
          <div className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-[#27272C]/90 px-5">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleSelectHome();
              }}
              aria-label="SAY — Sayem Quadri Home"
              className="flex items-center gap-3 whitespace-nowrap rounded-md py-1"
            >
              <SayLogo className="h-7 w-auto" />
              <span
                aria-hidden="true"
                className="h-3.5 w-px bg-[#27272C]"
              />
              <span className="text-[10px] font-medium tracking-[0.16em] text-[#919198]">
                {SITE_IDENTITY.tagline}
              </span>
            </a>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#27272C] bg-[#111114] px-3.5 py-2 text-xs font-medium tracking-[0.08em] text-[#F0EFEC] transition-colors hover:border-[#8B4DFF]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9D6BFF]"
            >
              <X className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>

          {/* Scrollable navigation core utilizing PersistentIdentityNav state */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="relative z-10 flex flex-1 flex-col justify-between overflow-y-auto px-5 py-5"
          >
            <div>
              {/* Persistent celestial identity anchor */}
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectHome();
                }}
                aria-current={activeSection === 'home' ? 'location' : undefined}
                className={`flex min-h-[60px] items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                  activeSection === 'home'
                    ? 'border-[#8B4DFF]/70 bg-[#171226]'
                    : 'border-[#27272C] bg-[#111114] hover:border-[#8B4DFF]/50'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#27272C] bg-[#0B0B0D]">
                    {miniPortraitUrl ? (
                      <img
                        src={miniPortraitUrl}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[11px] font-semibold text-[#F0EFEC]">
                        {SITE_IDENTITY.brand}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
                      00 · SAY IDENTITY
                    </span>
                    <span className="block truncate text-sm font-medium text-[#F0EFEC]">
                      {activeDest
                        ? `Active: ${activeDest.index} · ${activeDest.code}`
                        : 'Home — Return to orbit'}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-[11px] font-medium text-[#919198]">
                  Top
                </span>
              </a>

              {/* Persistent orbital destination links */}
              <nav aria-label="Mobile portfolio destinations" className="mt-5">
                <p className="mb-2 px-1 text-[10px] font-medium tracking-[0.16em] text-[#919198]">
                  ORBITAL DESTINATIONS
                </p>

                <ul className="divide-y divide-[#27272C]/70 border-y border-[#27272C]/70">
                  {ORBITAL_DESTINATIONS.map((dest, idx) => {
                    const isActive = activeSection === dest.id;
                    return (
                      <m.li
                        key={dest.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.22,
                          delay: 0.03 * idx,
                          ease: EASE_OUT,
                        }}
                      >
                        <a
                          href={dest.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelectDestination(dest.id);
                          }}
                          aria-current={isActive ? 'location' : undefined}
                          className={`group flex min-h-[64px] items-center justify-between gap-3 px-1.5 py-3 transition-colors ${
                            isActive
                              ? 'text-[#F0EFEC]'
                              : 'text-[#919198] hover:text-[#F0EFEC]'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                isActive
                                  ? 'border-[#9D6BFF] bg-[#1F1638] text-[#C4A7FF]'
                                  : dest.featured
                                    ? 'border-[#27272C] bg-[#111114] text-[#9D6BFF] group-hover:border-[#8B4DFF]/60'
                                    : 'border-[#27272C] bg-[#111114] text-[#919198] group-hover:border-[#8B4DFF]/60 group-hover:text-[#F0EFEC]'
                              }`}
                            >
                              <DestinationIcon id={dest.id} className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-medium tracking-[0.14em] tabular-nums ${
                                    isActive ? 'text-[#C4A7FF]' : 'text-[#919198]'
                                  }`}
                                >
                                  {dest.index} · {dest.code}
                                </span>
                                {isActive && (
                                  <span
                                    aria-hidden="true"
                                    className="h-1.5 w-1.5 rounded-full bg-[#9D6BFF]"
                                  />
                                )}
                              </div>
                              <span className="block truncate text-[15px] font-medium text-[#F0EFEC]">
                                {dest.label}
                              </span>
                              <span className="block truncate text-xs text-[#919198]">
                                {dest.subtitle}
                              </span>
                            </div>
                          </div>

                          <ArrowUpRight
                            className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                              isActive ? 'text-[#C4A7FF]' : 'text-[#919198]/70'
                            }`}
                            aria-hidden="true"
                          />
                        </a>
                      </m.li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Minimalist direct contact & profile footer */}
            <div className="mt-6 border-t border-[#27272C] pt-4">
              <div className="flex items-center justify-between gap-3">
                {emailChannel ? (
                  <a
                    href={emailChannel.url}
                    className="min-w-0 rounded-md py-1 transition-colors hover:text-[#C4A7FF]"
                  >
                    <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] text-[#919198]">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                      />
                      <span>{CONTACT_CONTENT.availabilityStatus.toUpperCase()}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-medium text-[#F0EFEC]">
                      {emailChannel.handle}
                    </span>
                  </a>
                ) : (
                  <div />
                )}

                <div
                  aria-label="Direct social profiles"
                  className="flex shrink-0 items-center gap-1.5"
                >
                  {socialLinks.map((channel) => (
                    <a
                      key={channel.id}
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${channel.label} profile (${channel.handle ?? channel.label})`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272C] bg-[#111114] text-[#919198] transition-colors hover:border-[#8B4DFF]/70 hover:text-[#F0EFEC]"
                    >
                      {renderChannelIcon(channel.id)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
