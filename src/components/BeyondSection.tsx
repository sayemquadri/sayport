import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BEYOND_JOURNAL } from '../data/portfolio';
import { Reveal } from './Reveal';

export function BeyondSection() {
  const [activeId, setActiveId] = useState<string>(BEYOND_JOURNAL[0].id);
  const activeEntry =
    BEYOND_JOURNAL.find((entry) => entry.id === activeId) ?? BEYOND_JOURNAL[0];

  return (
    <section
      id="beyond"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-[#919198] tabular-nums">
            03 · Beyond the Projects
          </p>
          <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC] [text-wrap:balance]">
            Notes from the{' '}
            <span className="font-serif italic font-normal">margins.</span>
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-[#919198]">
            An editorial notebook of disciplines, questions, and creative threads that shape how I think outside formal deliverables.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="border-t border-[#27272C] lg:col-span-6">
            <ul className="divide-y divide-[#27272C]">
              {BEYOND_JOURNAL.map((entry) => {
                const isSelected = entry.id === activeId;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(entry.id)}
                      aria-pressed={isSelected}
                      className="group flex w-full min-h-[56px] items-center justify-between gap-4 py-5 text-left transition-colors"
                    >
                      <div className="flex items-baseline gap-4">
                        <span
                          className={`text-xs font-medium tabular-nums transition-colors ${
                            isSelected ? 'text-[#4E7EFF]' : 'text-[#919198]'
                          }`}
                        >
                          {entry.index}
                        </span>
                        <div>
                          <span
                            className={`block text-lg font-medium tracking-tight transition-colors sm:text-xl ${
                              isSelected
                                ? 'text-[#F0EFEC]'
                                : 'text-[#919198] group-hover:text-[#F0EFEC]'
                            }`}
                          >
                            {entry.title}
                          </span>
                          <span className="mt-0.5 block font-serif text-base italic text-[#919198]/85">
                            {entry.subtitle}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isSelected
                            ? 'translate-x-0.5 text-[#4E7EFF]'
                            : 'text-[#919198]/60 group-hover:translate-x-0.5 group-hover:text-[#F0EFEC]'
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {isSelected && (
                      <div className="pb-6 pl-8 lg:hidden">
                        <p className="text-[15px] leading-[1.7] text-[#F0EFEC]/90">
                          {entry.reflection}
                        </p>
                        <p className="mt-3 text-xs text-[#919198]">
                          {entry.threads.join(' · ')}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hidden lg:col-span-6 lg:block">
            <div className="flex h-full flex-col justify-between rounded-xl border border-[#27272C] bg-[#111114] p-8 xl:p-10">
              <div>
                <div className="flex items-center justify-between border-b border-[#27272C] pb-4 text-xs text-[#919198]">
                  <span className="tabular-nums">Entry {activeEntry.index}</span>
                  <span>Editorial Journal</span>
                </div>

                <h3 className="mt-7 text-2xl font-semibold tracking-tight text-[#F0EFEC]">
                  {activeEntry.title}
                </h3>
                <p className="mt-1 font-serif text-xl italic text-[#919198]">
                  {activeEntry.subtitle}
                </p>

                <p className="mt-6 text-[16px] leading-[1.78] text-[#F0EFEC]/90">
                  {activeEntry.reflection}
                </p>
              </div>

              <div className="mt-10 border-t border-[#27272C] pt-5">
                <p className="text-xs font-medium tracking-wider text-[#919198]">
                  Recurring threads
                </p>
                <p className="mt-2 text-sm text-[#F0EFEC]/85">
                  {activeEntry.threads.join(' · ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
