import { SayLogo } from './SayLogo';
import { ABOUT_CONTENT } from '../data/portfolio';
import { Reveal } from './Reveal';

export function AboutSection() {
  return (
    <section id="about" className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <Reveal className="min-w-0 lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">{ABOUT_CONTENT.indexLabel}</p>
            <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC]">{ABOUT_CONTENT.heading}</h2>
            <div className="mt-8 rounded-xl border border-[#27272C] bg-[#111114] p-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#27272C] pb-4">
                <SayLogo className="h-7 w-auto" />
                <span className="text-[10px] font-medium tracking-[0.14em] text-[#919198]">{ABOUT_CONTENT.originStory.eyebrow}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#F0EFEC]">{ABOUT_CONTENT.originStory.title}</h3>
              <div className="mt-3 space-y-3 text-sm leading-[1.75] text-[#B6B6BE]">
                {ABOUT_CONTENT.originStory.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <p className="mt-5 border-t border-[#27272C] pt-4 text-xs leading-relaxed text-[#C4A7FF]">{ABOUT_CONTENT.originStory.prefixes.join(' · ')}</p>
            </div>
          </Reveal>

          <Reveal delayMs={60} className="min-w-0 lg:col-span-7">
            <div className="space-y-5">
              {ABOUT_CONTENT.philosophyParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-[16px] leading-[1.8] text-[#D7D6D2]">{paragraph}</p>
              ))}
            </div>
            <div className="mt-10 border-t border-[#27272C] pt-7">
              <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF]">AREAS I WORK IN</p>
              <div className="mt-5 space-y-5">
                {ABOUT_CONTENT.disciplines.map((item, index) => (
                  <article key={item.id} className="grid gap-2 sm:grid-cols-12 sm:gap-5">
                    <h3 className="text-base font-semibold text-[#F0EFEC] sm:col-span-4">{item.title}</h3>
                    <div className="sm:col-span-8">
                      <p className="text-sm leading-[1.7] text-[#B6B6BE]">{item.summary}</p>
                      <p className="mt-2 text-xs leading-relaxed text-[#C4A7FF]">Work: {item.evidence}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
