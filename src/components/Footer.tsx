import { SITE_IDENTITY } from '../data/portfolio';
import { getCopyrightYear } from '../utils/portfolio';

export function Footer() {
  const year = getCopyrightYear();

  return (
    <footer className="border-t border-[#27272C] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#F0EFEC]">
            {SITE_IDENTITY.title}.
          </p>
          <p className="mt-1 font-serif text-base italic text-[#919198]">
            {SITE_IDENTITY.footerPhilosophy}
          </p>
        </div>

        <p className="text-xs text-[#919198] tabular-nums">
          © {year} {SITE_IDENTITY.name}
        </p>
      </div>
    </footer>
  );
}
