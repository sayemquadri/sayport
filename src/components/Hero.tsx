import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { HERO_CONTENT, SITE_IDENTITY, type DestinationId } from '../data/portfolio';
import { OrbitalNavigation } from './OrbitalNavigation';
import { SayLogo } from './SayLogo';

interface HeroProps {
  activeSection: string;
  onNavigateDestination: (id: DestinationId) => void;
  onMiniPortraitReady?: (dataUrl: string) => void;
}

export function Hero({
  activeSection,
  onNavigateDestination,
  onMiniPortraitReady,
}: HeroProps) {
  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between px-5 pt-10 pb-8 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16"
    >
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-3">
            <SayLogo className="h-6 w-auto" />
            <span
              aria-hidden="true"
              className="hidden text-xs text-[#919198]/60 sm:inline"
            >
              ·
            </span>
            <p className="text-[11px] font-medium tracking-[0.18em] text-[#919198]">
              {SITE_IDENTITY.positioning.toUpperCase()}
            </p>
          </div>

          <h1 className="mt-6 max-w-2xl text-[clamp(2.25rem,4.1vw,3.85rem)] leading-[1.06] tracking-[-0.025em] text-[#F0EFEC] [text-wrap:balance]">
            <span className="block font-sans font-semibold">
              {HERO_CONTENT.headlineLines[0]}
            </span>
            <span className="block font-serif italic font-normal text-[#F0EFEC]/95">
              {HERO_CONTENT.headlineLines[1]}
            </span>
          </h1>

          <p className="mt-6 max-w-[54ch] text-[15.5px] leading-[1.72] text-[#919198] sm:text-[16.5px]">
            {HERO_CONTENT.introduction}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={HERO_CONTENT.primaryCta.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigateDestination('work');
              }}
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-[#7C3AED] px-6 py-3 text-sm font-medium text-[#F0EFEC] whitespace-nowrap shrink-0 transition-colors duration-200 hover:bg-[#6D28D9]"
            >
              <span>{HERO_CONTENT.primaryCta.label}</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href={HERO_CONTENT.secondaryCta.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigateDestination('about');
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#27272C] bg-[#111114] px-6 py-3 text-sm font-medium text-[#F0EFEC] whitespace-nowrap shrink-0 transition-colors duration-200 hover:border-[#8B4DFF]/60 hover:bg-[#161322]"
            >
              <span>{HERO_CONTENT.secondaryCta.label}</span>
              <ArrowRight className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Preserved 3D celestial constellation portrait wrapped by the orbital destination system */}
        <div className="flex min-w-0 justify-center lg:col-span-6 lg:justify-end">
          <OrbitalNavigation
            activeSection={activeSection}
            onNavigate={onNavigateDestination}
            onMiniPortraitReady={onMiniPortraitReady}
          />
        </div>
      </div>

      {/* Subtle landing footer indicator */}
      <div className="mx-auto mt-10 flex w-full max-w-6xl items-center justify-between border-t border-[#27272C]/60 pt-5">
        <a
          href="#work"
          onClick={(e) => {
            e.preventDefault();
            onNavigateDestination('work');
          }}
          className="group inline-flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-[#919198] transition-colors hover:text-[#F0EFEC]"
        >
          <span className="relative h-6 w-px overflow-hidden bg-[#27272C]" aria-hidden="true">
            <span className="animate-scroll-line absolute inset-x-0 top-0 h-3 bg-[#9D6BFF]" />
          </span>
          <span>Scroll to explore</span>
        </a>
        <span className="hidden text-xs tracking-[0.16em] text-[#C4A7FF]/80 sm:inline">
          {SITE_IDENTITY.ethos}
        </span>
      </div>
    </section>
  );
}
