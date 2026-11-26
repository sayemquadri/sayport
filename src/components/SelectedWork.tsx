import { useMemo, useState } from 'react';
import {
  PROJECTS,
  WORK_CATEGORIES,
  WORK_SECTION_CONTENT,
  type WorkCategory,
} from '../data/portfolio';
import {
  filterProjects,
  findProjectById,
  getAdjacentProjectId,
} from '../utils/portfolio';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';

interface SelectedWorkProps {
  selectedProjectId: string | null;
  onSelectProjectId: (projectId: string | null) => void;
}

export function SelectedWork({
  selectedProjectId,
  onSelectProjectId,
}: SelectedWorkProps) {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('all');

  const visibleProjects = useMemo(
    () => filterProjects(PROJECTS, activeCategory),
    [activeCategory],
  );

  const selectedProject = useMemo(
    () => findProjectById(PROJECTS, selectedProjectId),
    [selectedProjectId],
  );

  const handleNavigateModal = (direction: 'prev' | 'next') => {
    if (!selectedProjectId) {
      return;
    }
    const pool = visibleProjects.length > 0 ? visibleProjects : PROJECTS;
    const nextId = getAdjacentProjectId(pool, selectedProjectId, direction);
    if (nextId) {
      onSelectProjectId(nextId);
    }
  };

  return (
    <section
      id="work"
      className="border-t border-[#27272C] px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
            {WORK_SECTION_CONTENT.indexLabel}
          </p>
          <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.35rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-[#F0EFEC] [text-wrap:balance]">
            Complete Portfolio{' '}
            <span className="font-serif italic font-normal">Archive.</span>
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-[#919198]">
            {WORK_SECTION_CONTENT.supportingText}
          </p>
        </div>

        {/* 7-Discipline + All Work Category Filter Strip */}
        <div
          role="group"
          aria-label="Filter portfolio archive by discipline"
          className="mt-10 flex flex-wrap items-center gap-2 border-y border-[#27272C] py-3.5"
        >
          {WORK_CATEGORIES.map((category) => {
            const isSelected = activeCategory === category.id;
            const count =
              category.id === 'all'
                ? PROJECTS.length
                : PROJECTS.filter((p) => p.category === category.id).length;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={isSelected}
                data-testid={`work-filter-${category.id === 'all' ? 'all' : category.shortLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                  isSelected
                    ? 'border-[#8B4DFF] bg-[#7C3AED] text-[#F0EFEC]'
                    : 'border-[#27272C] bg-[#111114] text-[#919198] hover:border-[#8B4DFF]/50 hover:text-[#F0EFEC]'
                }`}
              >
                <span className="sm:hidden">{category.shortLabel}</span>
                <span className="hidden sm:inline">{category.label}</span>
                <span
                  className={`text-[10px] tabular-nums ${
                    isSelected ? 'text-[#EDE6FF]' : 'text-[#919198]/70'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {visibleProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              orderIndex={idx}
              featured={activeCategory === 'all' && idx === 0}
              onSelect={onSelectProjectId}
            />
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => onSelectProjectId(null)}
        onNavigate={handleNavigateModal}
      />
    </section>
  );
}
