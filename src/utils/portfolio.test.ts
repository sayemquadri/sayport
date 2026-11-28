import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ABOUT_CONTENT,
  CONTACT_CONTENT,
  CREATIVE_ARCHIVE,
  HERO_CONTENT,
  ORBITAL_DESTINATIONS,
  PROJECTS,
  SITE_IDENTITY,
  SOCIAL_CHANNELS,
  WORK_CATEGORIES,
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

test('private projects and unrelated personal-brand strings stay out of public portfolio data', () => {
  const serialized = JSON.stringify({
    SITE_IDENTITY,
    HERO_CONTENT,
    PROJECTS,
    CREATIVE_ARCHIVE,
    ABOUT_CONTENT,
    CONTACT_CONTENT,
  }).toLowerCase();

  for (const term of ['sanober', 'jarvis', 'saydesigns']) {
    assert.equal(serialized.includes(term), false, `Forbidden term found: ${term}`);
  }
});

test('work archive uses three broad filters and each filter maps to real entries', () => {
  const categories = WORK_CATEGORIES.filter((category) => category.id !== 'all');
  assert.equal(categories.length, 3);

  for (const category of categories) {
    assert.ok(filterProjects(PROJECTS, category.id).length > 0);
  }

  assert.equal(filterProjects(PROJECTS, 'all').length, PROJECTS.length);
});

test('project records use accurate known statuses and include contribution notes', () => {
  const expected = new Set([
    'DEPLOYED · TESTING',
    'COMPLETED · PRACTICE BUILD',
    'PROTOTYPE COMPLETED',
    'RESEARCH & DOCUMENTATION COMPLETE',
    'COMPLETED · UNPUBLISHED',
    'PAUSED · HISTORICAL WORK',
  ]);

  for (const project of PROJECTS) {
    assert.equal(expected.has(project.status), true);
    assert.ok(project.caseStudy.overview.length > 20);
    assert.ok(project.caseStudy.contribution.length > 20);
    assert.ok(project.caseStudy.statusNote.length > 20);
  }
});

test('confirmed project statuses and scope are represented accurately', () => {
  assert.equal(findProjectById(PROJECTS, 'derote')?.status, 'DEPLOYED · TESTING');
  assert.match(findProjectById(PROJECTS, 'clinic-website')!.caseStudy.statusNote, /not a paid commission/i);
  assert.match(findProjectById(PROJECTS, 'campus-connect')!.caseStudy.statusNote, /not a deployed application/i);
  assert.match(findProjectById(PROJECTS, 'solar-ev')!.caseStudy.statusNote, /assembly and testing were still pending/i);
  assert.equal(findProjectById(PROJECTS, 'green-string')?.status, 'COMPLETED · UNPUBLISHED');
});

test('presentation and voice sections do not contain fake audio takes or scripted samples', () => {
  assert.equal(CREATIVE_ARCHIVE.voiceSection.activities.length, 2);
  assert.equal(CREATIVE_ARCHIVE.presentations.items.length, 3);
  assert.ok(CREATIVE_ARCHIVE.presentations.items.every((item) => item.slides > 0));
  assert.equal(JSON.stringify(CREATIVE_ARCHIVE).includes('Studio placeholder'), false);
});

test('the orbital navigation retains the five working section destinations', () => {
  assert.deepEqual(
    ORBITAL_DESTINATIONS.map((destination) => destination.id),
    ['work', 'creative', 'experiments', 'about', 'contact'],
  );
  assert.equal(ORBITAL_DESTINATIONS[0].featured, true);
});

test('social links and mailto builder validate inputs strictly', () => {
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

  assert.equal(isValidConfiguredUrl('mailto:invalid'), false);
});

test('section scroll tracking handles the current site sections', () => {
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

test('getCopyrightYear and throttled callback work reliably', async () => {
  assert.equal(getCopyrightYear(new Date('2026-11-22T00:00:00Z')), 2026);
  let count = 0;
  const throttled = createThrottledCallback(() => { count += 1; }, 40);

  throttled.run();
  throttled.run();
  assert.equal(count, 1);

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(count, 2);
  throttled.cancel();
});
