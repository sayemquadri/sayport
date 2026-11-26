import type {
  ProjectItem,
  SocialChannel,
  WorkCategory,
} from '../data/portfolio';

export function filterProjects(
  projects: readonly ProjectItem[],
  filter: WorkCategory,
): ProjectItem[] {
  if (filter === 'all') {
    return [...projects];
  }
  return projects.filter((project) => project.category === filter);
}

export function findProjectById(
  projects: readonly ProjectItem[],
  id: string | null,
): ProjectItem | null {
  if (!id) {
    return null;
  }
  return projects.find((project) => project.id === id) ?? null;
}

export function getAdjacentProjectId(
  projects: readonly ProjectItem[],
  currentId: string,
  direction: 'next' | 'prev',
): string | null {
  if (projects.length === 0) {
    return null;
  }
  const index = projects.findIndex((project) => project.id === currentId);
  if (index === -1) {
    return projects[0].id;
  }
  const offset = direction === 'next' ? 1 : -1;
  const targetIndex = (index + offset + projects.length) % projects.length;
  return projects[targetIndex].id;
}

export function isValidConfiguredUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return false;
  }
  const lower = trimmed.toLowerCase();
  if (lower === '#' || lower.includes('example.com') || lower.includes('placeholder')) {
    return false;
  }
  if (lower.startsWith('mailto:')) {
    const emailPart = trimmed.slice('mailto:'.length).trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPart);
  }
  if (trimmed.startsWith('/')) {
    return trimmed.length > 1;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getConfiguredSocialLinks(
  channels: readonly SocialChannel[],
): SocialChannel[] {
  return channels.filter((channel) => isValidConfiguredUrl(channel.url));
}

export function getEmailChannel(
  channels: readonly SocialChannel[],
): SocialChannel | null {
  const email = channels.find((c) => c.id === 'email');
  if (!email || !isValidConfiguredUrl(email.url)) {
    return null;
  }
  return email;
}

export function buildMailtoHref(
  baseMailtoUrl: string,
  subject: string,
  message: string,
): string | null {
  if (!isValidConfiguredUrl(baseMailtoUrl)) {
    return null;
  }
  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();
  if (!cleanSubject || !cleanMessage) {
    return null;
  }
  const params = new URLSearchParams({
    subject: cleanSubject,
    body: cleanMessage,
  });
  return `${baseMailtoUrl}?${params.toString().replace(/\+/g, '%20')}`;
}

export function getCopyrightYear(referenceDate: Date = new Date()): number {
  return referenceDate.getFullYear();
}

export interface SectionBounds {
  id: string;
  top: number;
  bottom: number;
}

export function resolveActiveSectionId(
  sections: readonly SectionBounds[],
  anchorY: number = 140,
  isAtBottom: boolean = false,
): string {
  if (sections.length === 0) {
    return 'home';
  }
  if (isAtBottom) {
    return sections[sections.length - 1].id;
  }

  const containing = sections.find(
    (section) => section.top <= anchorY && section.bottom > anchorY,
  );
  if (containing) {
    return containing.id;
  }

  let latestPassed = sections[0].id;
  for (const section of sections) {
    if (section.top <= anchorY) {
      latestPassed = section.id;
    }
  }
  return latestPassed;
}

export interface ThrottledHandle {
  run: () => void;
  cancel: () => void;
}

export function createThrottledCallback(
  callback: () => void,
  intervalMs: number = 100,
): ThrottledHandle {
  let lastRunTime = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;

  const invoke = () => {
    lastRunTime = Date.now();
    trailingTimer = null;
    callback();
  };

  const run = () => {
    const now = Date.now();
    const elapsed = now - lastRunTime;

    if (elapsed >= intervalMs) {
      if (trailingTimer !== null) {
        clearTimeout(trailingTimer);
        trailingTimer = null;
      }
      invoke();
    } else if (trailingTimer === null) {
      trailingTimer = setTimeout(invoke, intervalMs - elapsed);
    }
  };

  const cancel = () => {
    if (trailingTimer !== null) {
      clearTimeout(trailingTimer);
      trailingTimer = null;
    }
  };

  return { run, cancel };
}
