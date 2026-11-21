import { ArrowUpRight } from 'lucide-react';
import { CONTACT_CONTENT, SOCIAL_CHANNELS } from '../data/portfolio';
import { getConfiguredSocialLinks } from '../utils/portfolio';
import { Reveal } from './Reveal';

export function ContactSection() {
  const configuredLinks = getConfiguredSocialLinks(SOCIAL_CHANNELS);

  return (
    <section
      id="contact"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <Reveal className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="text-xs font-medium tracking-[0.14em] text-[#919198] tabular-nums">
            05 · Contact
          </p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.35rem)] leading-[1.1] tracking-[-0.025em] text-[#F0EFEC] [text-wrap:balance]">
            <span className="block font-sans font-semibold">
              {CONTACT_CONTENT.headingLines[0]}
            </span>
            <span className="mt-1 block font-serif italic font-normal text-[#F0EFEC]/95">
              {CONTACT_CONTENT.headingLines[1]}
            </span>
          </h2>
          <p className="mt-5 max-w-[50ch] text-[15.5px] leading-[1.7] text-[#919198]">
            {CONTACT_CONTENT.note}
          </p>
        </div>

        <div className="lg:col-span-5 lg:pt-8">
          <div className="border-t border-[#27272C]">
            {configuredLinks.length > 0 ? (
              <ul className="divide-y divide-[#27272C]">
                {configuredLinks.map((channel) => (
                  <li key={channel.id}>
                    <a
                      href={channel.url}
                      target={channel.id === 'email' ? undefined : '_blank'}
                      rel={channel.id === 'email' ? undefined : 'noopener noreferrer'}
                      className="group flex min-h-[56px] items-center justify-between py-4 text-[#F0EFEC] transition-colors hover:text-[#4E7EFF]"
                    >
                      <div>
                        <span className="block text-base font-medium">
                          {channel.label}
                        </span>
                        {channel.handle && (
                          <span className="mt-0.5 block text-xs text-[#919198]">
                            {channel.handle}
                          </span>
                        )}
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 text-[#919198] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#4E7EFF]"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <ul className="divide-y divide-[#27272C]">
                  {SOCIAL_CHANNELS.map((channel) => (
                    <li
                      key={channel.id}
                      className="flex min-h-[52px] items-center justify-between py-3.5"
                    >
                      <span className="text-base font-medium text-[#F0EFEC]/80">
                        {channel.label}
                      </span>
                      <span className="text-xs text-[#919198]">
                        Unconfigured
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-[#919198]">
                  Direct links for Email, GitHub, LinkedIn, and Instagram will appear here once real URLs are added to the centralized portfolio configuration.
                </p>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
