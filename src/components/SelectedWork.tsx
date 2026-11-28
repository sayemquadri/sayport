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

export function SelectedWork({ selectedProjectId, onSelectProjectId }: SelectedWorkProps) {
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
    if (!selectedProjectId) return;
    const pool = visibleProjects.length > 0 ? visibleProjects : PROJECTS;
    const nextId = getAdjacentProjectId(pool, selectedProjectId, direction);
    if (nextId) onSelectProjectId(nextId);
  };

  return (
    <section id="work" className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">{WORK_SECTION_CONTENT.indexLabel}</p>
          <h2 className="mt-4 text-[clamp(2rem,3.8vw,3.2rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-[#F0EFEC] [text-wrap:balance]">
            {WORK_SECTION_CONTENT.heading}
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-[#919198]">{WORK_SECTION_CONTENT.supportingText}</p>
        </div>

        <div role="group" aria-label="Filter work by category" className="mt-9 flex flex-wrap gap-2 border-y border-[#27272C] py-3.5">
          {WORK_CATEGORIES.map((category) => {
            const selected = activeCategory === category.id;
            const count = category.id === 'all'
              ? PROJECTS.length
              : PROJECTS.filter((project) => project.category === category.id).length;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={selected}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${selected ? 'border-[#8B4DFF] bg-[#7C3AED] text-[#F0EFEC]' : 'border-[#27272C] bg-[#111114] text-[#919198] hover:border-[#8B4DFF]/50 hover:text-[#F0EFEC]'}`}
              >
                <span className="sm:hidden">{category.shortLabel}</span>
                <span className="hidden sm:inline">{category.label}</span>
                <span className="text-[10px] tabular-nums opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              orderIndex={index}
              featured={activeCategory === 'all' && index === 0}
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
