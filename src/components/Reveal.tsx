import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  DEFAULT_REVEAL_OPTIONS,
  isInitialBoundingRectVisible,
  shouldRevealEntry,
} from '../utils/reveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
}

export function Reveal({
  children,
  className = '',
  delayMs = 0,
  threshold = DEFAULT_REVEAL_OPTIONS.threshold,
  rootMargin = DEFAULT_REVEAL_OPTIONS.rootMargin,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      setVisible(true);
      return;
    }

    const initialRect = node.getBoundingClientRect();
    if (isInitialBoundingRectVisible(initialRect, window.innerHeight, 48)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => shouldRevealEntry(entry))) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      data-reveal={visible ? 'visible' : 'hidden'}
      style={delayMs > 0 && visible ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:transform-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}
