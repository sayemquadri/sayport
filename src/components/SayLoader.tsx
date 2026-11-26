import { useEffect, useState } from 'react';
import { SayLogo } from './SayLogo';

/**
 * Brief, non-blocking, reduced-motion-safe orbital intro reveal featuring the SAY mark.
 * Automatically dismisses and unmounts cleanly so it never impedes interaction or LCP.
 */
export function SayLoader() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'done'>(() => {
    if (typeof window === 'undefined') return 'done';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduced ? 'done' : 'visible';
  });

  useEffect(() => {
    if (phase === 'done') return;

    const fadeTimer = window.setTimeout(() => {
      setPhase('fading');
    }, 420);

    const doneTimer = window.setTimeout(() => {
      setPhase('done');
    }, 740);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [phase]);

  if (phase === 'done') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      data-testid="say-loader"
      className={`pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0B0D] transition-opacity duration-300 ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-28 w-44 items-center justify-center">
          <div className="animate-say-orbit pointer-events-none absolute h-28 w-28 rounded-full border border-dashed border-[#8B4DFF]/45" />
          <SayLogo className="relative h-14 w-auto" />
        </div>
        <p className="mt-3 text-[11px] font-medium tracking-[0.22em] text-[#C4A7FF]/85">
          IDEAS INTO CREATIONS.
        </p>
      </div>
    </div>
  );
}
