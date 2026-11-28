import { ArrowUpRight, Mail } from 'lucide-react';
import { CONTACT_CONTENT, SOCIAL_CHANNELS } from '../data/portfolio';
import { getConfiguredSocialLinks, getEmailChannel } from '../utils/portfolio';
import { Reveal } from './Reveal';

export function ContactSection() {
  const email = getEmailChannel(SOCIAL_CHANNELS);
  const links = getConfiguredSocialLinks(SOCIAL_CHANNELS).filter((channel) => channel.id !== 'email');

  return (
    <section id="contact" className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="min-w-0 lg:col-span-7">
          <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">{CONTACT_CONTENT.indexLabel}</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.35rem)] leading-[1.1] tracking-[-0.025em] text-[#F0EFEC]">
            <span className="block font-semibold">{CONTACT_CONTENT.headingLines[0]}</span>
            <span className="mt-1 block font-serif italic font-normal text-[#F0EFEC]/90">{CONTACT_CONTENT.headingLines[1]}</span>
          </h2>
          <p className="mt-5 max-w-[58ch] text-[15.5px] leading-[1.75] text-[#B6B6BE]">{CONTACT_CONTENT.note}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {email && (
              <a href={email.url} className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-3 text-sm font-medium text-[#F0EFEC] transition-colors hover:bg-[#6D28D9]">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Email Sayem</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            <span className="text-xs text-[#919198]">{CONTACT_CONTENT.availabilityStatus}</span>
          </div>
        </Reveal>

        <Reveal delayMs={65} className="min-w-0 lg:col-span-5">
          <div className="rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-7">
            <p className="text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">WORK I CONSIDER</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#D7D6D2]">
              {CONTACT_CONTENT.inquiryPresets.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-[#9D6BFF]" aria-hidden="true">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-[#27272C] pt-4 text-xs leading-relaxed text-[#919198]">
              I’ll confirm the scope and fit before taking on a project. I don’t promise services I cannot deliver.
            </p>
          </div>
          <nav aria-label="Social profiles" className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            {links.map((channel) => (
              <a key={channel.id} href={channel.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#919198] transition-colors hover:text-[#C4A7FF]">
                {channel.label}
              </a>
            ))}
          </nav>
        </Reveal>
      </div>
    </section>
  );
}
