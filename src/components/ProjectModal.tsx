import { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Film,
  Headphones,
  Image as ImageIcon,
  Link2,
  X,
} from 'lucide-react';
import type { ProjectItem, ProjectMediaAttachment } from '../data/portfolio';
import { isValidConfiguredUrl } from '../utils/portfolio';
import { ProjectVisual } from './ProjectVisual';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

function AttachmentIcon({ kind }: { kind: ProjectMediaAttachment['kind'] }) {
  switch (kind) {
    case 'image':
      return <ImageIcon className="h-3.5 w-3.5 text-[#C4A7FF]" aria-hidden="true" />;
    case 'video':
      return <Film className="h-3.5 w-3.5 text-[#C4A7FF]" aria-hidden="true" />;
    case 'audio':
      return <Headphones className="h-3.5 w-3.5 text-[#C4A7FF]" aria-hidden="true" />;
    case 'link':
      return <Link2 className="h-3.5 w-3.5 text-[#C4A7FF]" aria-hidden="true" />;
  }
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

  const hasLiveUrl =
    typeof project.caseStudy.liveUrl === 'string' &&
    isValidConfiguredUrl(project.caseStudy.liveUrl);
  const hasSourceUrl =
    typeof project.caseStudy.sourceUrl === 'string' &&
    isValidConfiguredUrl(project.caseStudy.sourceUrl);
  const attachments = project.caseStudy.mediaAttachments ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507]/88 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#27272C] bg-[#111114]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#27272C] bg-[#111114] px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-[#919198]">
            <span className="tabular-nums">{project.index}</span>
            <span aria-hidden="true">·</span>
            <span>{project.category}</span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272C] bg-[#0B0B0D] text-[#F0EFEC] transition-colors hover:border-[#9D6BFF]/70 hover:text-[#C4A7FF]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-[#27272C]">
          <div className="h-48 w-full sm:h-56">
            <ProjectVisual
              motif={project.motif}
              index={project.index}
              conceptualLabel={
                project.caseStudy.isConceptualMedia
                  ? 'Conceptual Placeholder — Media Slot Ready'
                  : 'Live Project Architecture'
              }
            />
          </div>
          <p className="border-t border-[#27272C] bg-[#0D0D10] px-6 py-2.5 text-xs text-[#919198]">
            {project.caseStudy.visualNote}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium tracking-[0.1em] text-[#C4A7FF]">
              STATUS · {project.status}
            </span>
            <span className="text-[#919198]">{project.category}</span>
          </div>

          <h3
            id="project-modal-title"
            className="mt-3 text-2xl font-semibold tracking-tight text-[#F0EFEC] sm:text-3xl"
          >
            {project.title}
          </h3>

          <dl className="mt-7 divide-y divide-[#27272C] border-t border-[#27272C]">
            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">
                Overview
              </dt>
              <dd className="text-[15px] leading-[1.7] text-[#F0EFEC]/90 sm:col-span-8">
                {project.caseStudy.overview}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">
                Objective
              </dt>
              <dd className="text-[15px] leading-[1.7] text-[#919198] sm:col-span-8">
                {project.caseStudy.objective}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">
                Approach
              </dt>
              <dd className="text-[15px] leading-[1.7] text-[#919198] sm:col-span-8">
                {project.caseStudy.approach}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">
                Role & Contribution
              </dt>
              <dd className="text-[15px] leading-[1.7] text-[#F0EFEC]/90 sm:col-span-8">
                {project.caseStudy.contribution}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">
                Tools & Craft
              </dt>
              <dd className="text-sm leading-relaxed text-[#F0EFEC]/90 sm:col-span-8">
                {project.caseStudy.technologies.join(' · ')}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <dt className="text-xs font-medium tracking-[0.1em] text-[#919198] sm:col-span-4">
                Media & Links
              </dt>
              <dd className="space-y-3 text-sm text-[#919198] sm:col-span-8">
                {attachments.length > 0 && (
                  <ul className="space-y-2">
                    {attachments.map((att) => (
                      <li
                        key={att.label}
                        className="flex items-start gap-2.5 rounded-lg border border-[#27272C] bg-[#0B0B0D] px-3.5 py-2.5"
                      >
                        <span className="mt-0.5 shrink-0">
                          <AttachmentIcon kind={att.kind} />
                        </span>
                        <div className="min-w-0">
                          {att.url && isValidConfiguredUrl(att.url) ? (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-[#C4A7FF] hover:underline"
                            >
                              <span>{att.label}</span>
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className="block font-medium text-[#F0EFEC]">
                              {att.label}
                            </span>
                          )}
                          <span className="mt-0.5 block text-xs text-[#919198]">
                            {att.note}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {hasLiveUrl || hasSourceUrl ? (
                  <div className="flex flex-wrap gap-4 pt-1">
                    {hasLiveUrl && (
                      <a
                        href={project.caseStudy.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[#C4A7FF] hover:underline"
                      >
                        <span>Live Demonstration</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                    {hasSourceUrl && (
                      <a
                        href={project.caseStudy.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[#F0EFEC] hover:text-[#C4A7FF]"
                      >
                        <span>Source / Documentation</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                ) : (
                  attachments.length === 0 && (
                    <span>Public repository or external media link will be attached once published.</span>
                  )
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center justify-between border-t border-[#27272C] pt-5">
            <button
              type="button"
              onClick={() => onNavigate('prev')}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#919198] transition-colors hover:text-[#F0EFEC]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous item</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('next')}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#919198] transition-colors hover:text-[#F0EFEC]"
            >
              <span>Next item</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
