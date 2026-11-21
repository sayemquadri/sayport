import { ABOUT_CONTENT } from '../data/portfolio';
import { Reveal } from './Reveal';

export function About() {
  return (
    <section
      id="about"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5">
          <p className="text-xs font-medium tracking-[0.14em] text-[#919198] tabular-nums">
            01 · About
          </p>
          <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC] [text-wrap:balance]">
            A little <span className="font-serif italic font-normal">about me.</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#919198]">
            Multidisciplinary perspective rooted in mechanical curiosity, structured software thinking, and deliberate visual form.
          </p>
        </Reveal>

        <Reveal delayMs={70} className="lg:col-span-7">
          <div className="space-y-5 max-w-[62ch]">
            <p className="text-lg leading-[1.65] text-[#F0EFEC] sm:text-[19px]">
              {ABOUT_CONTENT.paragraphs[0]}
            </p>
            <p className="text-[15.5px] leading-[1.75] text-[#919198]">
              {ABOUT_CONTENT.paragraphs[1]}
            </p>
            <p className="text-[15.5px] leading-[1.75] text-[#919198]">
              {ABOUT_CONTENT.paragraphs[2]}
            </p>
          </div>

          <div className="mt-12 border-t border-[#27272C]">
            <dl className="divide-y divide-[#27272C]">
              {ABOUT_CONTENT.details.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-1 gap-1.5 py-4 sm:grid-cols-12 sm:items-baseline sm:gap-6"
                >
                  <dt className="text-xs font-medium tracking-wider text-[#919198] sm:col-span-4">
                    {item.label}
                  </dt>
                  <dd className="text-[15px] font-medium text-[#F0EFEC] tabular-nums sm:col-span-8">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
