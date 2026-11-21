import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECTS,
  SOCIAL_CHANNELS,
  type SocialChannel,
} from '../data/portfolio';
import {
  filterProjects,
  findProjectById,
  getAdjacentProjectId,
  getConfiguredSocialLinks,
  getCopyrightYear,
  isValidConfiguredUrl,
  resolveActiveSectionId,
  createThrottledCallback,
} from './portfolio';

test('filterProjects returns all projects when filter is all', () => {
  const result = filterProjects(PROJECTS, 'all');
  assert.equal(result.length, 6);
});

test('filterProjects filters strictly by discipline', () => {
  const tech = filterProjects(PROJECTS, 'technology');
  assert.equal(tech.length, 2);
  assert.deepEqual(
    tech.map((p) => p.id),
    ['derote', 'campus-connect'],
  );

  const engineering = filterProjects(PROJECTS, 'engineering');
  assert.equal(engineering.length, 1);
  assert.equal(engineering[0].id, 'ev-engineering');

  const creative = filterProjects(PROJECTS, 'creative');
  assert.equal(creative.length, 3);
  assert.deepEqual(
    creative.map((p) => p.id),
    ['the-green-string', 'aq-explains', 'saydesigns'],
  );
});

test('findProjectById and getAdjacentProjectId handle wrap-around and missing IDs', () => {
  assert.equal(findProjectById(PROJECTS, null), null);
  assert.equal(findProjectById(PROJECTS, 'missing'), null);
  assert.equal(findProjectById(PROJECTS, 'derote')?.title, 'DeRote Student Insight System');

  assert.equal(getAdjacentProjectId(PROJECTS, 'derote', 'prev'), 'saydesigns');
  assert.equal(getAdjacentProjectId(PROJECTS, 'saydesigns', 'next'), 'derote');
  assert.equal(getAdjacentProjectId([], 'derote', 'next'), null);
});

test('default SOCIAL_CHANNELS has no fabricated or unconfigured links exposed', () => {
  const configured = getConfiguredSocialLinks(SOCIAL_CHANNELS);
  assert.equal(configured.length, 0);
});

test('getConfiguredSocialLinks accepts valid mailto and https URLs and rejects placeholders', () => {
  const sample: SocialChannel[] = [
    { id: 'email', label: 'Email', url: 'mailto:sayem@quadri.studio' },
    { id: 'github', label: 'GitHub', url: 'https://github.com/sayemquadri' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://example.com/fake' },
    { id: 'instagram', label: 'Instagram', url: '   ' },
  ];

  const configured = getConfiguredSocialLinks(sample);
  assert.deepEqual(
    configured.map((item) => item.id),
    ['email', 'github'],
  );
  assert.equal(isValidConfiguredUrl('mailto:invalid'), false);
  assert.equal(isValidConfiguredUrl('javascript:alert(1)'), false);
});

test('getCopyrightYear returns dynamic four-digit year from provided Date', () => {
  assert.equal(getCopyrightYear(new Date('2026-11-21T00:00:00Z')), 2026);
  assert.equal(getCopyrightYear(new Date('2030-01-01T00:00:00Z')), 2030);
});

test('resolveActiveSectionId selects work when scrolled to #work top anchor', () => {
  const bounds = [
    { id: 'home', top: -1575, bottom: -675 },
    { id: 'about', top: -675, bottom: 87.7 },
    { id: 'work', top: 87.7, bottom: 1680 },
    { id: 'beyond', top: 1680, bottom: 2450 },
    { id: 'contact', top: 2450, bottom: 3000 },
  ];

  assert.equal(resolveActiveSectionId(bounds, 140, false), 'work');
  assert.equal(resolveActiveSectionId(bounds, 140, true), 'contact');
});

test('createThrottledCallback invokes leading edge immediately and throttles bursts', async () => {
  let count = 0;
  const throttled = createThrottledCallback(() => {
    count += 1;
  }, 40);

  throttled.run();
  throttled.run();
  throttled.run();
  assert.equal(count, 1);

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(count, 2);
  throttled.cancel();
});
