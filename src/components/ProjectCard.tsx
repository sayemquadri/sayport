import { ArrowUpRight } from 'lucide-react';
import { m } from 'motion/react';
import type { ProjectItem } from '../data/portfolio';
import { ProjectVisual } from './ProjectVisual';

interface ProjectCardProps {
  project: ProjectItem;
  orderIndex?: number;
  featured?: boolean;
  onSelect: (projectId: string) => void;
}

export function ProjectCard({
  project,
  orderIndex = 0,
  featured = false,
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
      className={`group overflow-hidden rounded-xl border border-[#27272C] bg-[#111114] transform-gpu transition-colors duration-150 hover:border-[#8B4DFF]/55 ${
        featured
          ? 'grid grid-cols-1 md:col-span-2 lg:grid-cols-12'
          : 'flex flex-col'
      }`}
    >
      <div
        className={`overflow-hidden border-[#27272C] ${
          featured
            ? 'aspect-[16/10] border-b lg:col-span-6 lg:aspect-auto lg:h-full lg:border-r lg:border-b-0'
            : 'aspect-[16/10] w-full border-b'
        }`}
      >
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]">
          <ProjectVisual
            motif={project.motif}
            index={project.index}
            conceptualLabel={
              project.caseStudy.isConceptualMedia ? 'Conceptual Frame' : 'Live System'
            }
          />
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col justify-between p-6 sm:p-7 ${
          featured ? 'lg:col-span-6 lg:p-9' : ''
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#919198]">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium tracking-[0.08em] text-[#C4A7FF]">
              {project.status}
            </span>
          </div>

          <h3
            className={`mt-3 font-semibold tracking-tight text-[#F0EFEC] ${
              featured ? 'text-2xl sm:text-[26px]' : 'text-xl sm:text-[22px]'
            }`}
          >
            {project.title}
          </h3>

          <p className="mt-3 text-[15px] leading-[1.68] text-[#919198]">
            {project.description}
          </p>

          <ul className="mt-5 space-y-1.5 border-t border-[#27272C]/70 pt-4 text-[13.5px] text-[#D7D6D2]">
            {project.highlights.slice(0, featured ? 4 : 3).map((item) => (
              <li key={item} className="flex items-baseline gap-2.5">
                <span className="text-[#9D6BFF]" aria-hidden="true">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#27272C]/70 pt-4">
          <button
            type="button"
            onClick={() => onSelect(project.id)}
            aria-label={`Open case study: ${project.title}`}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#F0EFEC] whitespace-nowrap transition-colors duration-150 hover:text-[#C4A7FF]"
          >
            <span>Open case study</span>
            <ArrowUpRight
              className="h-4 w-4 text-[#919198] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C4A7FF]"
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
