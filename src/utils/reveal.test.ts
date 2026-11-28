import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_REVEAL_OPTIONS,
  isInitialBoundingRectVisible,
  shouldRevealEntry,
} from './reveal';

test('DEFAULT_REVEAL_OPTIONS uses subtle bottom inset margin and modest threshold', () => {
  assert.equal(DEFAULT_REVEAL_OPTIONS.threshold, 0.08);
  assert.equal(DEFAULT_REVEAL_OPTIONS.rootMargin, '0px 0px -48px 0px');
});

test('shouldRevealEntry triggers when intersecting or scrolled past above viewport', () => {
  assert.equal(
    shouldRevealEntry({ isIntersecting: true, boundingClientRect: { top: 400 } }),
    true,
  );
  assert.equal(
    shouldRevealEntry({ isIntersecting: false, boundingClientRect: { top: -120 } }),
    true,
  );
  assert.equal(
    shouldRevealEntry({ isIntersecting: false, boundingClientRect: { top: 960 } }),
    false,
  );
});

test('isInitialBoundingRectVisible handles above-fold, below-fold, and zero viewport', () => {
  assert.equal(
    isInitialBoundingRectVisible({ top: 100, bottom: 500 }, 900, 48),
    true,
  );
  assert.equal(
    isInitialBoundingRectVisible({ top: 880, bottom: 1100 }, 900, 48),
    false,
  );
  assert.equal(
    isInitialBoundingRectVisible({ top: -400, bottom: 120 }, 900, 48),
    true,
  );
  assert.equal(
    isInitialBoundingRectVisible({ top: 950, bottom: 1200 }, 0, 48),
    true,
  );
});
