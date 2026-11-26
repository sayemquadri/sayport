import { useState } from 'react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import {
  EXPERIMENTS,
  EXPERIMENTS_CONTENT,
  type ExperimentItem,
} from '../data/portfolio';
import { Reveal } from './Reveal';

interface ExperimentsSectionProps {
  miniPortraitUrl: string;
  onFocusCelestialPortrait: () => void;
}

const PULSE_STATES = [
  { id: 'open', label: 'Session Open', detail: 'Room ready · Scheduled slot active' },
  { id: 'shifted', label: 'Moved to B-04', detail: 'Location updated · Notice dispatched' },
  { id: 'away', label: 'Faculty Away', detail: 'Availability window deferred' },
] as const;

const STORY_BEATS = [
  { step: '01', title: 'Initial Question', body: 'Start with a concrete physical or technical observation rather than abstract trivia.' },
  { step: '02', title: 'Governing Constraint', body: 'Isolate the energy, material, or logic limit that decides what is actually possible.' },
  { step: '03', title: 'What-If Outcome', body: 'Trace the downstream consequence visually so complex trade-offs read clearly.' },
] as const;

export function ExperimentsSection({
  miniPortraitUrl,
  onFocusCelestialPortrait,
}: ExperimentsSectionProps) {
  const [selectedId, setSelectedId] = useState<string>(EXPERIMENTS[0].id);
  const [pulseIndex, setPulseIndex] = useState(0);
  const [kineticMode, setKineticMode] = useState<'settled' | 'editorial'>('settled');
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);

  const activeExperiment: ExperimentItem =
    EXPERIMENTS.find((item) => item.id === selectedId) ?? EXPERIMENTS[0];

  return (
    <section
      id="experiments"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
            {EXPERIMENTS_CONTENT.indexLabel}
          </p>
          <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC] [text-wrap:balance]">
            Playful{' '}
            <span className="font-serif italic font-normal">Experiments.</span>
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-[#919198]">
            {EXPERIMENTS_CONTENT.supportingText}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-10">
          {/* Experiment selector list */}
          <div className="min-w-0 border-t border-[#27272C] lg:col-span-6">
            <ul className="divide-y divide-[#27272C]">
              {EXPERIMENTS.map((experiment) => {
                const isSelected = experiment.id === activeExperiment.id;
                return (
                  <li key={experiment.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(experiment.id)}
                      aria-pressed={isSelected}
                      className="group flex w-full min-h-[64px] items-start justify-between gap-4 py-5 text-left transition-colors"
                    >
                      <div className="flex items-baseline gap-4">
                        <span
                          className={`text-xs font-medium tabular-nums transition-colors ${
                            isSelected ? 'text-[#9D6BFF]' : 'text-[#919198]'
                          }`}
                        >
                          {experiment.index}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                            <span
                              className={`text-lg font-medium tracking-tight transition-colors ${
                                isSelected
                                  ? 'text-[#F0EFEC]'
                                  : 'text-[#919198] group-hover:text-[#F0EFEC]'
                              }`}
                            >
                              {experiment.name}
                            </span>
                            <span className="text-[10px] font-medium tracking-[0.14em] text-[#C4A7FF]">
                              {experiment.status}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#919198]">
                            {experiment.technologies.join(' · ')}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`mt-1 h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isSelected
                            ? 'translate-x-0.5 text-[#9D6BFF]'
                            : 'text-[#919198]/60 group-hover:translate-x-0.5 group-hover:text-[#F0EFEC]'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Experimental visual demonstration stage */}
          <div className="min-w-0 lg:col-span-6">
            <div
              data-testid="experiments-stage"
              className="flex h-full flex-col justify-between rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-8"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272C] pb-4 text-xs">
                  <span className="font-medium tracking-[0.12em] text-[#C4A7FF] tabular-nums">
                    SANDBOX {activeExperiment.index} · {activeExperiment.status}
                  </span>
                  <span className="text-[#919198]">
                    {activeExperiment.status === 'PROTOTYPE'
                      ? 'Functional Prototype'
                      : 'Early Exploration'}
                  </span>
                </div>

                {/* Live visual demonstration frame */}
                <div className="mt-6 overflow-hidden rounded-lg border border-[#27272C] bg-[#0B0B0D] p-5">
                  {activeExperiment.demoKind === 'celestial-portrait' && (
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-[#27272C] bg-[#0B0B0D]">
                        <div className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-[#8B4DFF]/40" />
                        {miniPortraitUrl ? (
                          <img
                            src={miniPortraitUrl}
                            alt="Traced celestial wireframe portrait study"
                            className="h-32 w-32 object-contain"
                          />
                        ) : (
                          <span className="text-xs tracking-[0.16em] text-[#919198]">
                            SAY ORBIT
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 text-center sm:text-left">
                        <p className="text-xs tracking-[0.12em] text-[#919198]">
                          LIVE INSTANCE IN HOME STAGE
                        </p>
                        <p className="text-sm leading-relaxed text-[#F0EFEC]/90">
                          Dot-star vertices, shallow Z-layered lines, cursor hover glow, and tilted orbital waypoints orbiting SAY.
                        </p>
                        <button
                          type="button"
                          onClick={onFocusCelestialPortrait}
                          className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-medium text-[#C4A7FF] transition-colors hover:text-[#F0EFEC]"
                        >
                          <span>Inspect live sculpture at top</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeExperiment.demoKind === 'availability-pulse' && (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] tracking-[0.12em] text-[#919198]">
                          AVAILABILITY SIGNAL PROTOTYPE
                        </span>
                        <span className="text-xs font-medium text-[#C4A7FF]">
                          {PULSE_STATES[pulseIndex].label}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#27272C] bg-[#111114] p-4">
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${
                            pulseIndex === 0
                              ? 'bg-[#9D6BFF]'
                              : pulseIndex === 1
                                ? 'bg-[#F0EFEC]'
                                : 'bg-[#919198]/50'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-[#F0EFEC]">
                            {PULSE_STATES[pulseIndex].label}
                          </p>
                          <p className="mt-0.5 text-xs text-[#919198]">
                            {PULSE_STATES[pulseIndex].detail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {PULSE_STATES.map((state, idx) => (
                          <button
                            key={state.id}
                            type="button"
                            onClick={() => setPulseIndex(idx)}
                            aria-pressed={pulseIndex === idx}
                            className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                              pulseIndex === idx
                                ? 'border-[#8B4DFF] bg-[#7C3AED]/20 text-[#F0EFEC]'
                                : 'border-[#27272C] bg-[#111114] text-[#919198] hover:text-[#F0EFEC]'
                            }`}
                          >
                            {state.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeExperiment.demoKind === 'kinetic-type' && (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] tracking-[0.12em] text-[#919198]">
                          SERIF / SANS PAIRING STUDY
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setKineticMode('settled')}
                            aria-pressed={kineticMode === 'settled'}
                            className={`min-h-[32px] rounded px-2.5 text-xs font-medium transition-colors ${
                              kineticMode === 'settled'
                                ? 'bg-[#7C3AED] text-[#F0EFEC]'
                                : 'bg-[#111114] text-[#919198] hover:text-[#F0EFEC]'
                            }`}
                          >
                            Tight Sans
                          </button>
                          <button
                            type="button"
                            onClick={() => setKineticMode('editorial')}
                            aria-pressed={kineticMode === 'editorial'}
                            className={`min-h-[32px] rounded px-2.5 text-xs font-medium transition-colors ${
                              kineticMode === 'editorial'
                                ? 'bg-[#7C3AED] text-[#F0EFEC]'
                                : 'bg-[#111114] text-[#919198] hover:text-[#F0EFEC]'
                            }`}
                          >
                            Editorial Serif
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-[#27272C] pt-4">
                        <p
                          className={`transition-all duration-200 ${
                            kineticMode === 'editorial'
                              ? 'font-serif text-2xl italic tracking-normal text-[#F0EFEC]'
                              : 'font-sans text-xl font-semibold tracking-[-0.02em] text-[#F0EFEC]'
                          }`}
                        >
                          Curiosity turns disparate sparks into coherent form.
                        </p>
                        <p className="mt-2 text-xs text-[#919198]">
                          Compositor-only opacity and transform transitions tuned to stay calm under reduced-motion preferences.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeExperiment.demoKind === 'script-storyboard' && (
                    <div>
                      <p className="text-[11px] tracking-[0.12em] text-[#919198]">
                        EPISODE SCRIPT BEAT GRID (PROOF OF CONCEPT)
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {STORY_BEATS.map((beat, idx) => (
                          <button
                            key={beat.step}
                            type="button"
                            onClick={() => setActiveBeatIndex(idx)}
                            aria-pressed={activeBeatIndex === idx}
                            className={`rounded-lg border p-3 text-left transition-colors ${
                              activeBeatIndex === idx
                                ? 'border-[#8B4DFF] bg-[#191329]'
                                : 'border-[#27272C] bg-[#111114] hover:border-[#3E3E47]'
                            }`}
                          >
                            <span className="block text-[10px] font-medium text-[#C4A7FF] tabular-nums">
                              BEAT {beat.step}
                            </span>
                            <span className="mt-1 block text-xs font-medium text-[#F0EFEC]">
                              {beat.title}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-[#919198]">
                        {STORY_BEATS[activeBeatIndex].body}
                      </p>
                    </div>
                  )}
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#F0EFEC]">
                  {activeExperiment.name}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.7] text-[#F0EFEC]/90">
                  {activeExperiment.explanation}
                </p>
              </div>

              <div className="mt-7 border-t border-[#27272C] pt-4">
                <p className="text-xs text-[#919198]">
                  {activeExperiment.technologies.join(' · ')}
                </p>
                <p className="mt-1.5 text-xs text-[#919198]/85">
                  {activeExperiment.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
