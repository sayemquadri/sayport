import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { ProjectItem } from '../data/portfolio';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function ProjectModal({ project, onClose, onNavigate }: ProjectModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNavigate('next');
      if (event.key === 'ArrowLeft') onNavigate('prev');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onNavigate]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507]/90 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#27272C] bg-[#111114]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#27272C] bg-[#111114] px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#919198]">
            <span className="tabular-nums">{project.index}</span>
            <span aria-hidden="true">·</span>
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#C4A7FF]">{project.status}</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272C] bg-[#0B0B0D] text-[#F0EFEC] transition-colors hover:border-[#9D6BFF]/70 hover:text-[#C4A7FF]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
            PROJECT DETAILS
          </p>
          <h2 id="project-modal-title" className="mt-3 text-2xl font-semibold tracking-tight text-[#F0EFEC] sm:text-3xl">
            {project.title}
          </h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-[#D7D6D2]">
            {project.caseStudy.overview}
          </p>

          <dl className="mt-7 divide-y divide-[#27272C] border-t border-[#27272C]">
            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">MY CONTRIBUTION</dt>
              <dd className="text-[15px] leading-[1.72] text-[#F0EFEC]/90 sm:col-span-8">{project.caseStudy.contribution}</dd>
            </div>
            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">STATUS & SCOPE</dt>
              <dd className="text-[15px] leading-[1.72] text-[#B6B6BE] sm:col-span-8">{project.caseStudy.statusNote}</dd>
            </div>
            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">TOOLS & METHODS</dt>
              <dd className="text-sm leading-relaxed text-[#F0EFEC]/90 sm:col-span-8">{project.caseStudy.technologies.join(' · ')}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between border-t border-[#27272C] pt-5">
            <button type="button" onClick={() => onNavigate('prev')} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#919198] transition-colors hover:text-[#F0EFEC]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous</span>
            </button>
            <button type="button" onClick={() => onNavigate('next')} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#919198] transition-colors hover:text-[#F0EFEC]">
              <span>Next</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
