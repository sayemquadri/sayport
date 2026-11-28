import { BookOpen, Clapperboard, Headphones, Mic2, Presentation, Radio } from 'lucide-react';
import { CREATIVE_ARCHIVE } from '../data/portfolio';
import { Reveal } from './Reveal';

export function CreativeSection() {
  const {
    voiceSection,
    greenString,
    writing,
    contentCreation,
    presentations,
    publicSpeaking,
  } = CREATIVE_ARCHIVE;

  return (
    <section id="creative" className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">{CREATIVE_ARCHIVE.indexLabel}</p>
          <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC]">{CREATIVE_ARCHIVE.heading}</h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-[#919198]">{CREATIVE_ARCHIVE.supportingText}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal className="rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>{greenString.label}</span>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[#F0EFEC]">{greenString.title}</h3>
            <p className="mt-2 text-xs font-medium tracking-[0.08em] text-[#C4A7FF]">{greenString.status}</p>
            <p className="mt-4 text-[15px] leading-[1.72] text-[#B6B6BE]">{greenString.description}</p>
          </Reveal>

          <Reveal delayMs={50} className="rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
              <Headphones className="h-4 w-4" aria-hidden="true" />
              <span>{voiceSection.label}</span>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[#F0EFEC]">{voiceSection.title}</h3>
            <p className="mt-3 text-[15px] leading-[1.72] text-[#B6B6BE]">{voiceSection.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#D7D6D2]">
              {voiceSection.activities.map((activity) => (
                <li key={activity} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[#9D6BFF]" aria-hidden="true">—</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-[#27272C] pt-4 text-xs leading-relaxed text-[#919198]">{voiceSection.sampleNote}</p>
          </Reveal>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Reveal className="rounded-xl border border-[#27272C] bg-[#111114] p-6">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
              <Clapperboard className="h-4 w-4" aria-hidden="true" />
              <span>{contentCreation.label}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-[#F0EFEC]">{contentCreation.title}</h3>
            <p className="mt-3 text-sm leading-[1.7] text-[#B6B6BE]">{contentCreation.description}</p>
            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#27272C] pt-4">
              {contentCreation.metrics.map((metric) => (
                <div key={metric.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold text-[#F0EFEC] tabular-nums">{metric.value}</span>
                  <span className="max-w-[17ch] text-right text-[11px] leading-relaxed text-[#919198]">{metric.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[#919198]">{contentCreation.note}</p>
          </Reveal>

          <Reveal delayMs={45} className="rounded-xl border border-[#27272C] bg-[#111114] p-6">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
              <Radio className="h-4 w-4" aria-hidden="true" />
              <span>{writing.label}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-[#F0EFEC]">{writing.title}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#B6B6BE]">
              {writing.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[#9D6BFF]" aria-hidden="true">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delayMs={90} className="rounded-xl border border-[#27272C] bg-[#111114] p-6">
            <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
              <Mic2 className="h-4 w-4" aria-hidden="true" />
              <span>{publicSpeaking.label}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-[#F0EFEC]">{publicSpeaking.title}</h3>
            <p className="mt-2 text-xs font-medium text-[#C4A7FF]">{publicSpeaking.role}</p>
            <p className="mt-3 text-sm leading-[1.7] text-[#B6B6BE]">{publicSpeaking.description}</p>
          </Reveal>
        </div>

        <Reveal className="mt-12 border-t border-[#27272C] pt-10">
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
            <Presentation className="h-4 w-4" aria-hidden="true" />
            <span>{presentations.label}</span>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-2xl font-semibold text-[#F0EFEC]">{presentations.title}</h3>
            <p className="max-w-2xl text-sm leading-[1.65] text-[#919198]">{presentations.summary}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {presentations.items.map((item, index) => (
              <article key={item.id} className="rounded-xl border border-[#27272C] bg-[#111114] p-5">
                <div className="flex items-center justify-between text-[11px] text-[#919198]">
                  <span className="text-[#C4A7FF] tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.slides} slides</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold leading-snug text-[#F0EFEC]">{item.title}</h4>
                <p className="mt-1 text-xs font-medium text-[#C4A7FF]">{item.subject}</p>
                <p className="mt-3 text-sm leading-[1.65] text-[#B6B6BE]">{item.description}</p>
                <p className="mt-4 border-t border-[#27272C] pt-3 text-xs leading-relaxed text-[#919198]">{item.role}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
