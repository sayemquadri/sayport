import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { ProjectItem } from '../data/portfolio';
import { ProjectVisual } from './ProjectVisual';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function ProjectModal({ project, onClose, onNavigate }: ProjectModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) {
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        onNavigate('next');
      } else if (event.key === 'ArrowLeft') {
        onNavigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onNavigate]);

  if (!project) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507]/85 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#27272C] bg-[#111114] transition-opacity duration-200"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#27272C] bg-[#111114]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-[#919198]">
            <span className="tabular-nums">{project.index}</span>
            <span aria-hidden="true">/</span>
            <span>{project.category}</span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272C] bg-[#0B0B0D] text-[#F0EFEC] transition-colors hover:border-[#4E7EFF]/60 hover:text-[#4E7EFF]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="h-48 w-full border-b border-[#27272C] sm:h-56">
          <ProjectVisual motif={project.motif} index={project.index} />
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-xs font-medium tracking-wide text-[#7EA2FF]">
            {project.status}
          </p>

          <h3
            id="project-modal-title"
            className="mt-2.5 text-2xl font-semibold tracking-tight text-[#F0EFEC] sm:text-3xl"
          >
            {project.title}
          </h3>

          <p className="mt-4 text-base leading-[1.7] text-[#F0EFEC]/90">
            {project.description}
          </p>

          <div className="mt-6 space-y-4 border-t border-[#27272C] pt-6">
            {project.extendedNotes.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-[15px] leading-[1.7] text-[#919198]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-7 border-t border-[#27272C] pt-5">
            <p className="text-xs font-medium tracking-wider text-[#919198]">
              Scope & Focus
            </p>
            <p className="mt-2 text-sm text-[#F0EFEC]/90">
              {project.focusAreas.join(' · ')}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-[#27272C] pt-5">
            <button
              type="button"
              onClick={() => onNavigate('prev')}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#919198] transition-colors hover:text-[#F0EFEC]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous project</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('next')}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#919198] transition-colors hover:text-[#F0EFEC]"
            >
              <span>Next project</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
