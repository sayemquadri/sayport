import { Layers3, Search, Workflow, WandSparkles } from 'lucide-react';
import { PROCESS_CONTENT } from '../data/portfolio';
import { Reveal } from './Reveal';

interface ExperimentsSectionProps {
  miniPortraitUrl: string;
  onFocusCelestialPortrait: () => void;
}

const STEP_ICONS = [Search, Layers3, Workflow, WandSparkles];

export function ExperimentsSection(_props: ExperimentsSectionProps) {
  return (
    <section id="experiments" className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">{PROCESS_CONTENT.indexLabel}</p>
          <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC]">{PROCESS_CONTENT.heading}</h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-[#919198]">{PROCESS_CONTENT.supportingText}</p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_CONTENT.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <Reveal key={step.number} delayMs={index * 35} className="rounded-xl border border-[#27272C] bg-[#111114] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#C4A7FF] tabular-nums">{step.number}</span>
                  <Icon className="h-4 w-4 text-[#919198]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#F0EFEC]">{step.title}</h3>
                <p className="mt-2 text-sm leading-[1.7] text-[#919198]">{step.description}</p>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-5 rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#8B4DFF]/40 bg-[#191329]">
              <WandSparkles className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#F0EFEC]">How I use AI tools</h3>
              <p className="mt-2 max-w-4xl text-sm leading-[1.75] text-[#B6B6BE]">{PROCESS_CONTENT.aiNote}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
