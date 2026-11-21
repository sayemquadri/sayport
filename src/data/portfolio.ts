export type DisciplineFilter = 'all' | 'technology' | 'engineering' | 'creative';

export type ProjectVisualMotif =
  | 'derote'
  | 'campus'
  | 'ev'
  | 'green-string'
  | 'aq-explains'
  | 'saydesigns';

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: string;
  discipline: Exclude<DisciplineFilter, 'all'>;
  description: string;
  extendedNotes: string[];
  focusAreas: string[];
  status: string;
  motif: ProjectVisualMotif;
}

export interface JournalEntry {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  reflection: string;
  threads: string[];
}

export interface ExplorationInterest {
  id: string;
  label: string;
  note: string;
}

export interface SocialChannel {
  id: 'email' | 'github' | 'linkedin' | 'instagram';
  label: string;
  /**
   * Leave empty until a real email (`mailto:name@domain.com`) or profile URL
   * (`https://...`) is ready to publish. Unconfigured channels are never rendered
   * as active links.
   */
  url: string;
  handle?: string;
}

export const SITE_IDENTITY = {
  monogram: 'SQ.',
  name: 'Sayem Quadri',
  title: 'SQ. — Sayem Quadri',
  tagline: 'Building things. Exploring ideas. Creating possibilities.',
  footerPhilosophy: 'Independent mind. Endless curiosity.',
} as const;

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'beyond', label: 'Beyond', href: '#beyond' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export const HERO_CONTENT = {
  eyebrow: 'INDEPENDENT THINKER / CREATOR / BUILDER',
  headlineLines: [
    'Building things.',
    'Exploring ideas.',
    'Creating possibilities.',
  ],
  introduction:
    "I'm Sayem Quadri — a mechanical engineering student and multidisciplinary creator interested in the intersection of technology, engineering and creativity.",
  primaryCta: {
    label: 'Explore my work',
    href: '#work',
  },
  secondaryCta: {
    label: 'Get in touch',
    href: '#contact',
  },
} as const;

export const ABOUT_CONTENT = {
  heading: 'A little about me.',
  paragraphs: [
    "I'm someone who enjoys exploring different fields, learning how things work, and turning ideas into tangible projects.",
    'My interests span mechanical engineering, technology, digital experiences, visual design and creative writing.',
    "I don't like restricting curiosity to a single discipline. I enjoy connecting different perspectives and experimenting with ideas.",
  ],
  details: [
    {
      label: 'Education',
      value: 'Diploma in Mechanical Engineering',
    },
    {
      label: 'Institution',
      value: 'Government Polytechnic Gulzarbagh, Patna',
    },
    {
      label: 'Board',
      value: 'SBTE Bihar',
    },
    {
      label: 'Course period',
      value: '2024–2027',
    },
    {
      label: 'Location',
      value: 'Patna, Bihar, India',
    },
  ],
} as const;

export const WORK_FILTERS: { id: DisciplineFilter; label: string }[] = [
  { id: 'all', label: 'All Work' },
  { id: 'technology', label: 'Technology' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'creative', label: 'Creative' },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'derote',
    index: '01',
    title: 'DeRote Student Insight System',
    category: 'Technology / Web Application',
    discipline: 'technology',
    description:
      'A student profiling and insight assessment platform designed for educational environments, with Firebase integration and an administration interface.',
    extendedNotes: [
      'Structured to help academic environments move beyond static record-keeping into clearer student insight and assessment workflows.',
      'Pairs a Firebase-backed data layer with a focused administration interface designed for clarity and day-to-day usability.',
    ],
    focusAreas: ['Student Profiling', 'Assessment Flow', 'Firebase Integration', 'Admin Interface'],
    status: 'In development',
    motif: 'derote',
  },
  {
    id: 'campus-connect',
    index: '02',
    title: 'Campus Connect',
    category: 'Product Concept / Technology',
    discipline: 'technology',
    description:
      'An idea for improving communication between students and educational institutions through notifications about classroom and teacher availability.',
    extendedNotes: [
      'Born from observing everyday friction in academic schedules where students lack timely visibility into room changes or faculty availability.',
      'Explores how lightweight, clear institutional notifications can reduce uncertainty across campus routines.',
    ],
    focusAreas: ['Campus Communication', 'Availability Updates', 'Notification Design', 'Product Concept'],
    status: 'Concept / Proposal',
    motif: 'campus',
  },
  {
    id: 'ev-engineering',
    index: '03',
    title: 'EV Engineering Project',
    category: 'Engineering',
    discipline: 'engineering',
    description:
      'An academic engineering project exploring electric vehicle technology.',
    extendedNotes: [
      'An academic study undertaken as part of mechanical engineering coursework to examine how electric vehicle systems come together.',
      'Focuses on foundational engineering understanding, structural layout thinking, and practical system exploration within an academic context.',
    ],
    focusAreas: ['Electric Mobility', 'Mechanical Systems', 'Academic Study'],
    status: 'Academic project',
    motif: 'ev',
  },
  {
    id: 'the-green-string',
    index: '04',
    title: 'The Green String',
    category: 'Creative Writing',
    discipline: 'creative',
    description:
      'A long-form literary writing project and personal creative endeavour.',
    extendedNotes: [
      'An ongoing long-form narrative exploring memory, perspective, and the quiet threads that connect personal turning points.',
      'Developed independently as a space for deliberate prose, pacing, and literary craft outside technical work.',
    ],
    focusAreas: ['Long-Form Fiction', 'Narrative Structure', 'Literary Prose'],
    status: 'Writing project',
    motif: 'green-string',
  },
  {
    id: 'aq-explains',
    index: '05',
    title: 'AQ Explains',
    category: 'Content Creation / Science Communication',
    discipline: 'creative',
    description:
      'An independent content brand exploring science, technology and realistic what-if scenarios.',
    extendedNotes: [
      'Translates complex scientific and technological concepts into grounded, curiosity-driven explanations.',
      'Examines realistic what-if scenarios by connecting engineering intuition with clear visual storytelling.',
    ],
    focusAreas: ['Science Communication', 'What-If Inquiry', 'Scriptwriting', 'Visual Explanation'],
    status: 'Ongoing creative venture',
    motif: 'aq-explains',
  },
  {
    id: 'saydesigns',
    index: '06',
    title: 'SAYDESIGNS',
    category: 'Visual Design / Branding',
    discipline: 'creative',
    description:
      'A creative identity for visual communication, restaurant branding and design experiments.',
    extendedNotes: [
      'A dedicated outlet for visual identity systems, hospitality and restaurant branding explorations, and typographic studies.',
      'Balances clean composition with purposeful restraint to give physical and digital concepts a cohesive visual presence.',
    ],
    focusAreas: ['Brand Identity', 'Visual Communication', 'Restaurant Branding', 'Design Experiments'],
    status: 'Creative venture',
    motif: 'saydesigns',
  },
];

export const BEYOND_JOURNAL: JournalEntry[] = [
  {
    id: 'writing-storytelling',
    index: '01',
    title: 'Writing & storytelling',
    subtitle: 'Long-form prose and narrative craft',
    reflection:
      'Writing slows thought down until structure becomes visible. Whether working on chapters for The Green String or shaping scripts for explanations, language remains the primary tool I use to test whether an idea actually holds together.',
    threads: ['Long-form fiction', 'Character voice', 'Reflective essays'],
  },
  {
    id: 'independent-experiments',
    index: '02',
    title: 'Independent experiments',
    subtitle: 'Small prototypes and self-directed builds',
    reflection:
      'Outside formal coursework, I like building small interfaces, workflow ideas, and tools from scratch simply to see where an assumption breaks or where a simpler path emerges.',
    threads: ['Interface prototypes', 'Student utility concepts', 'Iterative sketching'],
  },
  {
    id: 'science-technology',
    index: '03',
    title: 'Science and technology',
    subtitle: 'Understanding mechanisms and realistic possibilities',
    reflection:
      'Curiosity starts with first principles—how energy moves, how software shapes daily decisions, and how realistic scientific scenarios unfold when examined patiently without sensationalism.',
    threads: ['First-principles thinking', 'Applied mechanics', 'Realistic what-if analysis'],
  },
  {
    id: 'visual-exploration',
    index: '04',
    title: 'Visual exploration',
    subtitle: 'Composition, identity, and editorial form',
    reflection:
      'Through SAYDESIGNS and personal layout studies, I explore how negative space, disciplined typography, and quiet contrast can carry meaning before a single paragraph is read.',
    threads: ['Brand systems', 'Editorial grids', 'Typography studies'],
  },
  {
    id: 'ideas-in-development',
    index: '05',
    title: 'Ideas in development',
    subtitle: 'Notes on campus tools, writing, and future systems',
    reflection:
      'Not every worthwhile idea begins as a finished product. Keeping a deliberate space for early proposals like Campus Connect allows concepts to mature through critique and observation.',
    threads: ['Early product concepts', 'Cross-disciplinary notes', 'Working notebooks'],
  },
];

export const CURRENTLY_EXPLORING: ExplorationInterest[] = [
  {
    id: 'engineering-mobility',
    label: 'Engineering and mobility',
    note: 'Studying mechanical fundamentals alongside how electric mobility systems reshape design constraints and everyday transport.',
  },
  {
    id: 'artificial-intelligence',
    label: 'Artificial intelligence',
    note: 'Observing how modern reasoning tools can augment human inquiry, structured learning, and creative workflows without replacing judgment.',
  },
  {
    id: 'web-technologies',
    label: 'Web technologies',
    note: 'Building clean, responsive interfaces on the modern web with an emphasis on clarity, speed, and thoughtful interaction design.',
  },
  {
    id: 'interactive-3d',
    label: 'Interactive 3D experiences',
    note: 'Investigating spatial interfaces on the web where geometry, motion, and engineering concepts can be explored directly.',
  },
  {
    id: 'visual-storytelling',
    label: 'Visual storytelling',
    note: 'Combining editorial pacing, diagramming, and art direction to make technical and creative narratives immediately intuitive.',
  },
];

export const CONTACT_CONTENT = {
  headingLines: [
    'Have an interesting idea?',
    "Let's make something out of it.",
  ],
  note: 'Open to thoughtful conversations across engineering, digital products, visual design, and creative collaborations.',
} as const;

/**
 * Centralized social configuration.
 * Add real URLs (e.g. `mailto:you@example.com`, `https://github.com/username`)
 * when ready; blank entries remain hidden from active links.
 */
export const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    id: 'email',
    label: 'Email',
    url: '',
  },
  {
    id: 'github',
    label: 'GitHub',
    url: '',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: '',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: '',
  },
];
