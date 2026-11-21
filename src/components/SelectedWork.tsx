import { useMemo, useState } from 'react';
import {
  PROJECTS,
  WORK_FILTERS,
  type DisciplineFilter,
} from '../data/portfolio';
import {
  filterProjects,
  findProjectById,
  getAdjacentProjectId,
} from '../utils/portfolio';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';

export function SelectedWork() {
  const [activeFilter, setActiveFilter] = useState<DisciplineFilter>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const visibleProjects = useMemo(
    () => filterProjects(PROJECTS, activeFilter),
    [activeFilter],
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
      setSelectedProjectId(nextId);
    }
  };

  return (
    <section
      id="work"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#919198] tabular-nums">
              02 · Selected Work
            </p>
            <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC] [text-wrap:balance]">
              Selected projects{' '}
              <span className="font-serif italic font-normal">&amp; ventures.</span>
            </h2>
          </div>

          <div
            role="group"
            aria-label="Filter projects by discipline"
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#27272C] bg-[#111114] p-1 self-start lg:self-auto"
          >
            {WORK_FILTERS.map((filter) => {
              const isSelected = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#4E7EFF] text-[#F0EFEC]'
                      : 'text-[#919198] hover:text-[#F0EFEC]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {visibleProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              orderIndex={idx}
              onSelect={setSelectedProjectId}
            />
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProjectId(null)}
        onNavigate={handleNavigateModal}
      />
    </section>
  );
}
