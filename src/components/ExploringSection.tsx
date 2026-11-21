import { useState } from 'react';
import { CURRENTLY_EXPLORING } from '../data/portfolio';
import { Reveal } from './Reveal';

export function ExploringSection() {
  const [selectedId, setSelectedId] = useState<string>(
    CURRENTLY_EXPLORING[0].id,
  );

  const selectedInterest =
    CURRENTLY_EXPLORING.find((item) => item.id === selectedId) ??
    CURRENTLY_EXPLORING[0];

  return (
    <section
      id="exploring"
      className="border-t border-[#27272C] px-5 py-16 sm:px-8 sm:py-20 lg:px-10"
    >
      <Reveal className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="lg:col-span-4">
          <p className="text-xs font-medium tracking-[0.14em] text-[#919198] tabular-nums">
            04 · Currently Exploring
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#F0EFEC]">
            Active curiosities.
          </h2>
        </div>

        <div className="lg:col-span-8">
          <div
            role="group"
            aria-label="Current areas of exploration"
            className="flex flex-wrap gap-2.5"
          >
            {CURRENTLY_EXPLORING.map((interest) => {
              const isSelected = interest.id === selectedId;
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => setSelectedId(interest.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[42px] rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    isSelected
                      ? 'border-[#4E7EFF] bg-[#4E7EFF]/12 text-[#F0EFEC]'
                      : 'border-[#27272C] bg-[#111114] text-[#919198] hover:border-[#3E3E47] hover:text-[#F0EFEC]'
                  }`}
                >
                  {interest.label}
                </button>
              );
            })}
          </div>

          <div
            aria-live="polite"
            className="mt-6 border-t border-[#27272C] pt-5"
          >
            <p className="text-xs font-medium text-[#7EA2FF]">
              {selectedInterest.label}
            </p>
            <p className="mt-2 max-w-[64ch] text-[15.5px] leading-[1.7] text-[#919198]">
              {selectedInterest.note}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
