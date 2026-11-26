import { ArrowUp } from 'lucide-react';
import { SITE_IDENTITY } from '../data/portfolio';
import { getCopyrightYear } from '../utils/portfolio';
import { SayLogo } from './SayLogo';

interface FooterProps {
  onReturnHome: () => void;
}

export function Footer({ onReturnHome }: FooterProps) {
  const year = getCopyrightYear();

  return (
    <footer className="border-t border-[#27272C] px-5 pt-10 pb-24 sm:px-8 md:pb-12 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <SayLogo className="h-6 w-auto shrink-0" />
          <div className="border-l border-[#27272C] pl-4">
            <p className="text-sm font-medium text-[#F0EFEC]">
              {SITE_IDENTITY.brand} — {SITE_IDENTITY.tagline}
            </p>
            <p className="mt-0.5 text-xs text-[#919198]">
              By {SITE_IDENTITY.owner} · {SITE_IDENTITY.positioning}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={onReturnHome}
            className="inline-flex min-h-[38px] items-center gap-1.5 text-xs font-medium text-[#919198] transition-colors hover:text-[#C4A7FF]"
          >
            <span>Return to orbit</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <p className="text-xs text-[#919198] tabular-nums">
            © {year} {SITE_IDENTITY.owner}
          </p>
        </div>
      </div>
    </footer>
  );
}
