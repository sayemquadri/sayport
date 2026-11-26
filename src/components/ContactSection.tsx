import { useState, type FormEvent } from 'react';
import { m, type Variants } from 'motion/react';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import {
  CONTACT_CONTENT,
  SOCIAL_CHANNELS,
  type SocialChannel,
} from '../data/portfolio';
import {
  buildMailtoHref,
  getConfiguredSocialLinks,
  getEmailChannel,
} from '../utils/portfolio';

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const textItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: EASE_OUT_EXPO,
    },
  },
};

const socialIconsGroupVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const socialIconItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: EASE_OUT_EXPO,
    },
  },
};

const linksListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.18,
    },
  },
};

const linkRowVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.44,
      ease: EASE_OUT_EXPO,
    },
  },
};

function SocialChannelGlyph({
  id,
  className = 'h-[18px] w-[18px]',
}: {
  id: SocialChannel['id'];
  className?: string;
}) {
  switch (id) {
    case 'email':
      return <Mail className={className} strokeWidth={1.65} aria-hidden="true" />;
    case 'github':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
  }
}

function getChannelAriaLabel(channel: SocialChannel): string {
  if (channel.id === 'email') {
    return `Send email to ${channel.handle ?? channel.label}`;
  }
  return `Visit ${channel.label} profile${channel.handle ? ` (${channel.handle})` : ''}`;
}

export function ContactSection() {
  const configuredLinks = getConfiguredSocialLinks(SOCIAL_CHANNELS);
  const emailChannel = getEmailChannel(SOCIAL_CHANNELS);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCopyEmail = async () => {
    if (!emailChannel?.handle) return;
    try {
      await navigator.clipboard.writeText(emailChannel.handle);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const handleSendInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailChannel) return;

    const href = buildMailtoHref(emailChannel.url, subject, message);
    if (!href) {
      setValidationError('Please enter both a subject and a brief message before opening your email client.');
      return;
    }

    setValidationError('');
    window.location.href = href;
  };

  return (
    <section
      id="contact"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <m.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-12"
      >
        <div className="min-w-0 lg:col-span-6">
          <m.p
            variants={textItemVariants}
            className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums"
          >
            {CONTACT_CONTENT.indexLabel}
          </m.p>

          <h2 className="mt-4 text-[clamp(2rem,4vw,3.35rem)] leading-[1.1] tracking-[-0.025em] text-[#F0EFEC] [text-wrap:balance]">
            <m.span
              variants={textItemVariants}
              className="block font-sans font-semibold"
            >
              {CONTACT_CONTENT.headingLines[0]}
            </m.span>
            <m.span
              variants={textItemVariants}
              className="mt-1 block font-serif italic font-normal text-[#F0EFEC]/95"
            >
              {CONTACT_CONTENT.headingLines[1]}
            </m.span>
          </h2>

          <m.p
            variants={textItemVariants}
            className="mt-5 max-w-[48ch] text-[15.5px] leading-[1.7] text-[#919198]"
          >
            {CONTACT_CONTENT.note}
          </m.p>

          {emailChannel && (
            <m.div
              variants={textItemVariants}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href={emailChannel.url}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-[#F0EFEC] transition-colors hover:bg-[#6D28D9]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Direct Email</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#27272C] bg-[#111114] px-4 py-2.5 text-sm font-medium text-[#F0EFEC] transition-colors hover:border-[#8B4DFF]/60"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#919198]" aria-hidden="true" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setComposerOpen((prev) => !prev);
                  setValidationError('');
                }}
                aria-expanded={composerOpen}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#27272C] bg-transparent px-4 py-2.5 text-sm font-medium text-[#919198] transition-colors hover:border-[#8B4DFF]/50 hover:text-[#F0EFEC]"
              >
                <span>{composerOpen ? 'Hide Inquiry Draft' : 'Compose Inquiry'}</span>
              </button>
            </m.div>
          )}

          {configuredLinks.length > 0 && (
            <m.div
              variants={textItemVariants}
              className="mt-8 border-t border-[#27272C]/80 pt-6"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#919198]">
                Direct Channels
              </p>
              <m.nav
                aria-label="Social media links"
                variants={socialIconsGroupVariants}
                className="mt-3 flex flex-wrap items-center gap-3"
              >
                {configuredLinks.map((channel) => (
                  <m.a
                    key={channel.id}
                    variants={socialIconItemVariants}
                    whileHover={{ scale: 1.08, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                    href={channel.url}
                    target={channel.id === 'email' ? undefined : '_blank'}
                    rel={channel.id === 'email' ? undefined : 'noopener noreferrer'}
                    aria-label={getChannelAriaLabel(channel)}
                    title={channel.label}
                    data-testid={`contact-social-icon-${channel.id}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#27272C] bg-[#111114] text-[#919198] transition-colors hover:border-[#8B4DFF]/65 hover:bg-[#191329] hover:text-[#F0EFEC]"
                  >
                    <SocialChannelGlyph id={channel.id} />
                  </m.a>
                ))}
              </m.nav>
            </m.div>
          )}

          {emailChannel && composerOpen && (
            <m.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
              onSubmit={handleSendInquiry}
              noValidate
              className="mt-6 max-w-lg space-y-4 rounded-xl border border-[#27272C] bg-[#111114] p-5"
            >
              <div>
                <p className="text-xs font-medium tracking-wide text-[#919198]">
                  Inquiry Focus (optional preset)
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CONTACT_CONTENT.inquiryPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSubject(preset);
                        setValidationError('');
                      }}
                      className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        subject === preset
                          ? 'border-[#8B4DFF] bg-[#7C3AED]/20 text-[#F0EFEC]'
                          : 'border-[#27272C] bg-[#0B0B0D] text-[#919198] hover:text-[#F0EFEC]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium tracking-wide text-[#919198]"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Client project, creative work, or research collaboration"
                  className="mt-1.5 w-full rounded-lg border border-[#27272C] bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F0EFEC] placeholder:text-[#919198]/50 focus:border-[#9D6BFF] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium tracking-wide text-[#919198]"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share context, timeline, or how you'd like to collaborate."
                  className="mt-1.5 w-full rounded-lg border border-[#27272C] bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F0EFEC] placeholder:text-[#919198]/50 focus:border-[#9D6BFF] focus:outline-none"
                />
              </div>

              {validationError && (
                <p role="alert" className="text-xs text-[#FF8A8A]">
                  {validationError}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2 text-xs font-medium tracking-wide text-[#F0EFEC] transition-colors hover:bg-[#6D28D9]"
              >
                <span>Open in Email Client</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </m.form>
          )}
        </div>

        <div className="min-w-0 lg:col-span-6 lg:pt-8">
          {configuredLinks.length > 0 && (
            <m.ul
              variants={linksListVariants}
              className="divide-y divide-[#27272C] border-t border-[#27272C]"
            >
              {configuredLinks.map((channel) => (
                <m.li key={channel.id} variants={linkRowVariants}>
                  <a
                    href={channel.url}
                    target={channel.id === 'email' ? undefined : '_blank'}
                    rel={channel.id === 'email' ? undefined : 'noopener noreferrer'}
                    className="group flex min-h-[58px] items-center justify-between py-4 text-[#F0EFEC] transition-colors hover:text-[#C4A7FF]"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#27272C] bg-[#111114] text-[#919198] transition-all duration-200 group-hover:scale-105 group-hover:border-[#8B4DFF]/60 group-hover:text-[#C4A7FF]">
                        <SocialChannelGlyph id={channel.id} className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="block text-base font-medium">
                          {channel.label}
                        </span>
                        {channel.handle && (
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#919198]">
                            <span>{channel.handle}</span>
                            {channel.id === 'email' && (
                              <span
                                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400/90"
                                data-testid="contact-availability-status"
                              >
                                <span
                                  className="relative flex h-1.5 w-1.5"
                                  aria-hidden="true"
                                >
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                </span>
                                <span>{CONTACT_CONTENT.availabilityStatus}</span>
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 text-[#919198] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C4A7FF]"
                      aria-hidden="true"
                    />
                  </a>
                </m.li>
              ))}
            </m.ul>
          )}
        </div>
      </m.div>
    </section>
  );
}
