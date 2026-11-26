import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ABOUT_CONTENT,
  CONTACT_CONTENT,
  CREATIVE_ARCHIVE,
  EXPERIMENTS,
  HERO_CONTENT,
  PROJECTS,
  SITE_IDENTITY,
  SOCIAL_CHANNELS,
  WORK_CATEGORIES,
  type SocialChannel,
} from '../data/portfolio';
import {
  buildMailtoHref,
  createThrottledCallback,
  filterProjects,
  findProjectById,
  getAdjacentProjectId,
  getConfiguredSocialLinks,
  getCopyrightYear,
  getEmailChannel,
  isValidConfiguredUrl,
  resolveActiveSectionId,
} from './portfolio';

test('strict exclusions: zero private projects, SQ. branding, location, or academic strings in portfolio data', () => {
  const serialized = JSON.stringify({
    SITE_IDENTITY,
    HERO_CONTENT,
    PROJECTS,
    CREATIVE_ARCHIVE,
    EXPERIMENTS,
    ABOUT_CONTENT,
    CONTACT_CONTENT,
  }).toLowerCase();

  const forbiddenTerms = [
    'sanober',
    'jarvis',
    'sq.',
    'saydesigns',
    'patna',
    'bihar',
    'india',
    'sbte',
    'diploma',
    'gulzarbagh',
    'polytechnic',
    '2024–2027',
    'restaurant branding',
    'coursework',
    'academic project',
    'mechanical engineering student',
  ];

  for (const term of forbiddenTerms) {
    assert.equal(serialized.includes(term), false, `Forbidden term found: ${term}`);
  }
});

test('WORK_CATEGORIES exposes All Work plus all 7 requested categories and every category has valid projects', () => {
  const categories = WORK_CATEGORIES.filter((c) => c.id !== 'all');
  assert.equal(categories.length, 7);

  for (const cat of categories) {
    const items = filterProjects(PROJECTS, cat.id);
    assert.ok(items.length >= 1, `Expected >= 1 project in category ${cat.id}`);
  }

  assert.equal(filterProjects(PROJECTS, 'all').length, PROJECTS.length);
});

test('every project uses an allowed status label and complete case study structure', () => {
  const allowedStatuses = new Set([
    'COMPLETED',
    'IN PROGRESS',
    'EXPERIMENTAL',
    'INDEPENDENT WORK',
    'CLIENT WORK',
  ]);

  for (const project of PROJECTS) {
    assert.equal(allowedStatuses.has(project.status), true, `Invalid status: ${project.status}`);
    assert.ok(project.caseStudy.overview.length > 20);
    assert.ok(project.caseStudy.objective.length > 20);
    assert.ok(project.caseStudy.approach.length > 20);
    assert.ok(project.caseStudy.contribution.length > 10);
    assert.ok(project.caseStudy.technologies.length >= 2);
    assert.ok(project.caseStudy.visualNote.length > 10);
  }
});

test('findProjectById and getAdjacentProjectId handle wrap-around and missing IDs', () => {
  assert.equal(findProjectById(PROJECTS, null), null);
  assert.equal(findProjectById(PROJECTS, 'missing'), null);
  assert.equal(findProjectById(PROJECTS, 'derote')?.title, 'DeRote Student Insight System');

  const firstId = PROJECTS[0].id;
  const lastId = PROJECTS[PROJECTS.length - 1].id;
  assert.equal(getAdjacentProjectId(PROJECTS, firstId, 'prev'), lastId);
  assert.equal(getAdjacentProjectId(PROJECTS, lastId, 'next'), firstId);
  assert.equal(getAdjacentProjectId([], 'derote', 'next'), null);
});

test('SOCIAL_CHANNELS exposes live channels and buildMailtoHref validates inputs strictly', () => {
  const configured = getConfiguredSocialLinks(SOCIAL_CHANNELS);
  assert.equal(configured.length, 4);

  const email = getEmailChannel(SOCIAL_CHANNELS);
  assert.equal(email?.url, 'mailto:sayemquadri0@gmail.com');

  assert.equal(buildMailtoHref('mailto:sayemquadri0@gmail.com', '', 'Hello'), null);
  assert.equal(buildMailtoHref('mailto:sayemquadri0@gmail.com', 'Project', '   '), null);
  assert.equal(
    buildMailtoHref('mailto:sayemquadri0@gmail.com', 'EV Collaboration', 'Let us discuss a project.'),
    'mailto:sayemquadri0@gmail.com?subject=EV%20Collaboration&body=Let%20us%20discuss%20a%20project.',
  );

  const sample: SocialChannel[] = [
    { id: 'email', label: 'Email', url: 'mailto:sayem@quadri.studio' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://example.com/fake' },
  ];
  assert.deepEqual(
    getConfiguredSocialLinks(sample).map((c) => c.id),
    ['email'],
  );
  assert.equal(isValidConfiguredUrl('mailto:invalid'), false);
});

test('resolveActiveSectionId resolves the 6 SAY sections accurately', () => {
  const bounds = [
    { id: 'home', top: -1575, bottom: -675 },
    { id: 'work', top: -675, bottom: 90 },
    { id: 'creative', top: 90, bottom: 900 },
    { id: 'experiments', top: 900, bottom: 1600 },
    { id: 'about', top: 1600, bottom: 2300 },
    { id: 'contact', top: 2300, bottom: 3000 },
  ];

  assert.equal(resolveActiveSectionId(bounds, 140, false), 'creative');
  assert.equal(resolveActiveSectionId(bounds, 140, true), 'contact');
});

test('getCopyrightYear and createThrottledCallback work reliably', async () => {
  assert.equal(getCopyrightYear(new Date('2026-11-22T00:00:00Z')), 2026);
  let count = 0;
  const throttled = createThrottledCallback(() => {
    count += 1;
  }, 40);

  throttled.run();
  throttled.run();
  assert.equal(count, 1);

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(count, 2);
  throttled.cancel();
});
