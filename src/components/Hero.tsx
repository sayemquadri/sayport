import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { HERO_CONTENT } from '../data/portfolio';
import { CelestialPortrait } from './CelestialPortrait';

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between px-5 pt-14 pb-10 sm:px-8 sm:pt-20 lg:px-10 lg:pt-24"
    >
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="text-[11px] font-medium tracking-[0.22em] text-[#919198]">
            {HERO_CONTENT.eyebrow}
          </p>

          <h1 className="mt-6 max-w-3xl text-[clamp(2.2rem,4.35vw,3.95rem)] leading-[1.08] tracking-[-0.025em] text-[#F0EFEC] [text-wrap:balance]">
            <span className="block font-sans font-semibold sm:whitespace-nowrap">
              {HERO_CONTENT.headlineLines[0]}
            </span>
            <span className="block font-serif italic font-normal text-[#F0EFEC]/95 sm:whitespace-nowrap">
              {HERO_CONTENT.headlineLines[1]}
            </span>
            <span className="block font-sans font-semibold sm:whitespace-nowrap">
              {HERO_CONTENT.headlineLines[2]}
            </span>
          </h1>

          <p className="mt-7 max-w-[54ch] text-[15.5px] leading-[1.7] text-[#919198] sm:text-[17px]">
            {HERO_CONTENT.introduction}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={HERO_CONTENT.primaryCta.href}
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-[#4E7EFF] px-6 py-3 text-sm font-medium text-[#F0EFEC] whitespace-nowrap shrink-0 transition-colors duration-200 hover:bg-[#3F6DF0]"
            >
              <span>{HERO_CONTENT.primaryCta.label}</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href={HERO_CONTENT.secondaryCta.href}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#27272C] bg-[#111114] px-6 py-3 text-sm font-medium text-[#F0EFEC] whitespace-nowrap shrink-0 transition-colors duration-200 hover:border-[#919198]/60 hover:bg-[#16161B]"
            >
              <span>{HERO_CONTENT.secondaryCta.label}</span>
              <ArrowRight className="h-4 w-4 text-[#919198]" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Interactive 3D celestial constellation portrait */}
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <CelestialPortrait />
        </div>
      </div>

      {/* Subtle scroll indicator */}
      <div className="mx-auto mt-12 flex w-full max-w-6xl items-center justify-between border-t border-[#27272C]/60 pt-5">
        <a
          href="#about"
          className="group inline-flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-[#919198] transition-colors hover:text-[#F0EFEC]"
        >
          <span className="relative h-6 w-px overflow-hidden bg-[#27272C]" aria-hidden="true">
            <span className="animate-scroll-line absolute inset-x-0 top-0 h-3 bg-[#4E7EFF]" />
          </span>
          <span>Scroll to explore</span>
        </a>
        <span className="hidden text-xs text-[#919198]/80 sm:inline">
          Engineering · Technology · Design · Writing
        </span>
      </div>
    </section>
  );
}
