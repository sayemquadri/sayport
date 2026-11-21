import { ArrowUpRight } from 'lucide-react';
import { m } from 'motion/react';
import type { ProjectItem } from '../data/portfolio';
import { ProjectVisual } from './ProjectVisual';

interface ProjectCardProps {
  project: ProjectItem;
  orderIndex?: number;
  onSelect: (projectId: string) => void;
}

export function ProjectCard({
  project,
  orderIndex = 0,
  onSelect,
}: ProjectCardProps) {
  const staggerDelay = (orderIndex % 2) * 0.03;

  return (
    <m.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01, margin: '100px 0px 100px 0px' }}
      transition={{
        duration: 0.26,
        delay: staggerDelay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ willChange: 'transform, opacity' }}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#27272C] bg-[#111114] transform-gpu transition-colors duration-150 hover:border-[#3A3A43]"
    >
      <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#27272C]">
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]">
          <ProjectVisual motif={project.motif} index={project.index} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-[#919198]">
            <span>{project.category}</span>
            <span className="text-[#7EA2FF]">{project.status}</span>
          </div>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#F0EFEC] sm:text-[22px]">
            {project.title}
          </h3>

          <p className="mt-2.5 text-[15px] leading-[1.65] text-[#919198]">
            {project.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#27272C]/70 pt-4">
          <button
            type="button"
            onClick={() => onSelect(project.id)}
            aria-label={`View project: ${project.title}`}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#F0EFEC] whitespace-nowrap transition-colors duration-150 hover:text-[#4E7EFF]"
          >
            <span>View project</span>
            <ArrowUpRight
              className="h-4 w-4 text-[#919198] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#4E7EFF]"
              aria-hidden="true"
            />
          </button>

          <span className="text-xs text-[#919198]/70 tabular-nums">
            {project.index}
          </span>
        </div>
      </div>
    </m.article>
  );
}
