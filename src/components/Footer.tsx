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
    <footer className="border-t border-[#27272C] px-5 pt-8 pb-24 sm:px-8 md:pb-10 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <SayLogo className="h-6 w-auto shrink-0" />
          <div className="border-l border-[#27272C] pl-3">
            <p className="text-sm font-medium text-[#F0EFEC]">{SITE_IDENTITY.owner}</p>
            <p className="mt-0.5 text-xs text-[#919198]">Portfolio · Selected work and creative archive</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button type="button" onClick={onReturnHome} className="inline-flex min-h-[38px] items-center gap-1.5 text-xs font-medium text-[#919198] transition-colors hover:text-[#C4A7FF]">
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <p className="text-xs text-[#919198] tabular-nums">© {year} {SITE_IDENTITY.owner}</p>
        </div>
      </div>
    </footer>
  );
}
