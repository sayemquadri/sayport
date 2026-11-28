export interface RevealObserverConfig {
  threshold: number;
  rootMargin: string;
}

export const DEFAULT_REVEAL_OPTIONS: RevealObserverConfig = {
  threshold: 0.08,
  rootMargin: '0px 0px -48px 0px',
};

export interface ObserverEntryLike {
  isIntersecting: boolean;
  boundingClientRect: {
    top: number;
  };
}

/**
 * Determines whether an observed element should transition to visible.
 * Reveals when intersecting OR when the element sits above the viewport
 * (e.g. after jumping directly down via an anchor/orbital link).
 */
export function shouldRevealEntry(entry: ObserverEntryLike): boolean {
  return entry.isIntersecting || entry.boundingClientRect.top < 0;
}

/**
 * Checks on initial mount whether an element is already within or above the
 * visible threshold so above-the-fold or pre-scrolled content renders immediately.
 */
export function isInitialBoundingRectVisible(
  rect: { top: number; bottom: number },
  viewportHeight: number,
  bottomMarginPx: number = 48,
): boolean {
  if (viewportHeight <= 0) {
    return true;
  }
  const effectiveBottom = Math.max(0, viewportHeight - bottomMarginPx);
  return rect.top <= effectiveBottom && rect.bottom >= 0;
}
