import { ABOUT_CONTENT } from '../data/portfolio';
import { Reveal } from './Reveal';
import { SayLogo } from './SayLogo';

export function AboutSection() {
  const { originStory, philosophyParagraphs, disciplines } = ABOUT_CONTENT;

  return (
    <section
      id="about"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        {/* Top Narrative: The SAY Origin & Curiosity Philosophy */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <Reveal className="min-w-0 lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
              {ABOUT_CONTENT.indexLabel}
            </p>
            <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC] [text-wrap:balance]">
              The Story{' '}
              <span className="font-serif italic font-normal">Behind SAY.</span>
            </h2>
            <p className="mt-5 max-w-[44ch] font-serif text-xl italic leading-[1.6] text-[#F0EFEC]/95">
              “{ABOUT_CONTENT.lead}”
            </p>

            {/* Authentic Origin Artifact Card */}
            <div className="mt-8 rounded-xl border border-[#27272C] bg-[#111114] p-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#27272C] pb-4">
                <SayLogo className="h-7 w-auto" />
                <span className="text-[10px] font-medium tracking-[0.14em] text-[#919198]">
                  {originStory.eyebrow}
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#F0EFEC]">
                {originStory.title}
              </h3>

              <div className="mt-2.5 space-y-3 text-sm leading-[1.7] text-[#919198]">
                {originStory.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>

              <p className="mt-5 border-t border-[#27272C] pt-3.5 text-xs tracking-[0.06em] text-[#C4A7FF]">
                {originStory.prefixes.join(' · ')}
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={70} className="min-w-0 lg:col-span-7">
            <div className="max-w-[62ch] space-y-5">
              {philosophyParagraphs.map((para) => (
                <p
                  key={para}
                  className="text-[16px] leading-[1.75] text-[#F0EFEC]/90"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* 6-Discipline Multidisciplinary Ecosystem Grid */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {disciplines.map((disc) => (
                <article
                  key={disc.id}
                  className="rounded-xl border border-[#27272C] bg-[#111114] p-5 transition-colors hover:border-[#8B4DFF]/45"
                >
                  <span className="text-[10px] font-medium tracking-[0.16em] text-[#C4A7FF] tabular-nums">
                    {disc.index}
                  </span>
                  <h3 className="mt-2 text-base font-semibold tracking-tight text-[#F0EFEC]">
                    {disc.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#919198]">
                    {disc.summary}
                  </p>
                  <ul className="mt-4 space-y-1.5 border-t border-[#27272C]/70 pt-3 text-xs text-[#D7D6D2]">
                    {disc.highlights.map((item) => (
                      <li key={item} className="flex items-baseline gap-2">
                        <span className="text-[#9D6BFF]" aria-hidden="true">
                          —
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
