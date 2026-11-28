import { ArrowUpRight } from 'lucide-react';
import { m } from 'motion/react';
import type { ProjectItem } from '../data/portfolio';

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
  return (
    <m.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: '80px 0px 80px 0px' }}
      transition={{
        duration: 0.28,
        delay: (orderIndex % 2) * 0.035,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`group flex h-full flex-col rounded-xl border border-[#27272C] bg-[#111114] p-6 transition-colors hover:border-[#8B4DFF]/55 sm:p-7 ${featured ? 'md:col-span-2 lg:p-9' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#919198]">
        <span className="text-[#C4A7FF] tabular-nums">{project.index}</span>
        <span aria-hidden="true">·</span>
        <span>{project.category}</span>
        <span aria-hidden="true">·</span>
        <span className="font-medium text-[#C4A7FF]">{project.status}</span>
      </div>

      <h3 className={`mt-4 font-semibold tracking-tight text-[#F0EFEC] ${featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
        {project.title}
      </h3>

      <p className="mt-3 max-w-[68ch] text-[15px] leading-[1.72] text-[#B6B6BE]">
        {project.description}
      </p>

      <ul className="mt-5 space-y-2 border-t border-[#27272C]/80 pt-5 text-sm leading-relaxed text-[#D7D6D2]">
        {project.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className="mt-0.5 text-[#9D6BFF]" aria-hidden="true">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t border-[#27272C]/80 pt-4 mt-7">
        <button
          type="button"
          onClick={() => onSelect(project.id)}
          aria-label={`Open project details: ${project.title}`}
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#F0EFEC] transition-colors hover:text-[#C4A7FF]"
        >
          <span>Project details</span>
          <ArrowUpRight className="h-4 w-4 text-[#919198] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C4A7FF]" aria-hidden="true" />
        </button>
        <span className="text-xs text-[#919198]/70 tabular-nums">{project.index}</span>
      </div>
    </m.article>
  );
}
