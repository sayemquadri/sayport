export type WorkCategory =
  | 'all'
  | 'Build & Design'
  | 'Research & Engineering'
  | 'Writing & Media';

export type ProjectStatusLabel =
  | 'DEPLOYED · TESTING'
  | 'COMPLETED · PRACTICE BUILD'
  | 'PROTOTYPE COMPLETED'
  | 'RESEARCH & DOCUMENTATION COMPLETE'
  | 'COMPLETED · UNPUBLISHED'
  | 'PAUSED · HISTORICAL WORK';

export type DestinationId =
  | 'work'
  | 'creative'
  | 'experiments'
  | 'about'
  | 'contact';

export interface OrbitalDestination {
  id: DestinationId;
  index: string;
  code: string;
  label: string;
  subtitle: string;
  href: `#${DestinationId}`;
  featured?: boolean;
  rxFactor: number;
  ryFactor: number;
  tiltDeg: number;
  speedRadPerSec: number;
  initialAngle: number;
}

export interface ProjectCaseStudy {
  overview: string;
  contribution: string;
  statusNote: string;
  technologies: string[];
}

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: Exclude<WorkCategory, 'all'>;
  description: string;
  highlights: string[];
  status: ProjectStatusLabel;
  caseStudy: ProjectCaseStudy;
}

export interface PresentationItem {
  id: string;
  title: string;
  slides: number;
  subject: string;
  description: string;
  role: string;
}

export interface DisciplineItem {
  id: string;
  title: string;
  summary: string;
  evidence: string;
}

export interface SocialChannel {
  id: 'email' | 'github' | 'linkedin' | 'instagram';
  label: string;
  url: string;
  handle?: string;
}

export const SITE_IDENTITY = {
  brand: 'SAY',
  owner: 'Sayem Quadri',
  positioning: 'Creator · Builder · Writer',
  title: 'SAY — Sayem Quadri',
  tagline: 'Work by Sayem Quadri',
  ethos: 'SAY · SAYEM QUADRI',
} as const;

export const ORBITAL_DESTINATIONS: OrbitalDestination[] = [
  {
    id: 'work',
    index: '01',
    code: 'WORK',
    label: 'Projects & Work',
    subtitle: 'Applications, prototypes, engineering research and writing',
    href: '#work',
    featured: true,
    rxFactor: 1.08,
    ryFactor: 0.94,
    tiltDeg: -12,
    speedRadPerSec: 0.094,
    initialAngle: -0.58,
  },
  {
    id: 'creative',
    index: '02',
    code: 'CREATIVE',
    label: 'Creative Work',
    subtitle: 'Novels, voice acting, content and presentations',
    href: '#creative',
    rxFactor: 1.15,
    ryFactor: 1.0,
    tiltDeg: 14,
    speedRadPerSec: 0.072,
    initialAngle: 0.65,
  },
  {
    id: 'experiments',
    index: '03',
    code: 'PROCESS',
    label: 'How I Work',
    subtitle: 'Research, AI-assisted production and refinement',
    href: '#experiments',
    rxFactor: 1.06,
    ryFactor: 0.99,
    tiltDeg: -18,
    speedRadPerSec: 0.108,
    initialAngle: 1.92,
  },
  {
    id: 'about',
    index: '04',
    code: 'ABOUT',
    label: 'About Sayem',
    subtitle: 'The origin of SAY and the work behind it',
    href: '#about',
    rxFactor: 1.17,
    ryFactor: 0.96,
    tiltDeg: 9,
    speedRadPerSec: 0.064,
    initialAngle: 3.22,
  },
  {
    id: 'contact',
    index: '05',
    code: 'CONTACT',
    label: 'Get in touch',
    subtitle: 'Client work, collaborations and other inquiries',
    href: '#contact',
    rxFactor: 1.11,
    ryFactor: 1.03,
    tiltDeg: 20,
    speedRadPerSec: 0.082,
    initialAngle: 4.58,
  },
];

export const HERO_CONTENT = {
  eyebrow: 'SAY · SAYEM QUADRI',
  headlineLines: ['I build web apps,', 'write stories, and present ideas.'],
  introduction:
    "I'm Sayem Quadri. My work includes digital products, interface design, engineering research, technical reports, fiction, video scripts, presentations and anime dubbing. SAY is the name I use across those different kinds of work.",
  primaryCta: {
    label: 'See my work',
    href: '#work',
  },
  secondaryCta: {
    label: 'About Sayem',
    href: '#about',
  },
} as const;

export const WORK_SECTION_CONTENT = {
  indexLabel: '01 · Work',
  heading: 'Projects and work.',
  supportingText:
    'A record of applications, prototypes, technical research and finished creative work. Each entry states what I did and what stage it has reached.',
} as const;

export const WORK_CATEGORIES: {
  id: WorkCategory;
  label: string;
  shortLabel: string;
}[] = [
  { id: 'all', label: 'All work', shortLabel: 'All' },
  { id: 'Build & Design', label: 'Build & Design', shortLabel: 'Build' },
  {
    id: 'Research & Engineering',
    label: 'Research & Engineering',
    shortLabel: 'Research',
  },
  { id: 'Writing & Media', label: 'Writing & Media', shortLabel: 'Creative' },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'derote',
    index: '01',
    title: 'DeRote Student Insight System',
    category: 'Build & Design',
    description:
      'A student-profile and questionnaire application independently conceived and built for an educational setting at my HOD’s request.',
    highlights: [
      'Product concept, interface and application developed independently',
      'Firestore, authentication, hosting and custom-domain setup',
      'Deployed and currently in testing and refinement',
    ],
    status: 'DEPLOYED · TESTING',
    caseStudy: {
      overview:
        'An application for collecting student profiles and questionnaire responses and reviewing the resulting information through an administrative workflow.',
      contribution:
        'I independently conceptualized, designed and developed the application. While building it, I learned and implemented the database layer, Cloud Firestore, authentication, Firebase Hosting and custom-domain setup. I continue to refine the interface and user experience during testing.',
      statusNote:
        'The application is deployed. Testing and refinement are ongoing; it is not presented as a fully launched production platform.',
      technologies: [
        'Google AI Studio',
        'Firebase Authentication',
        'Cloud Firestore',
        'Firebase Hosting',
        'Custom domain',
      ],
    },
  },
  {
    id: 'clinic-website',
    index: '02',
    title: 'Clinic Website Prototype',
    category: 'Build & Design',
    description:
      'My first vibe-coded website: a practice prototype with responsive layouts, working navigation and interactive buttons.',
    highlights: [
      'First AI-assisted website build',
      'Responsive page layouts',
      'Working navigation and buttons',
    ],
    status: 'COMPLETED · PRACTICE BUILD',
    caseStudy: {
      overview:
        'A functional clinic website prototype I built as a practice project while learning how to create and connect website interfaces.',
      contribution:
        'I built the prototype, worked through its page structure and interaction flow, and made the layouts responsive. It was an independent learning project, not a paid commission, and I did not present it to the clinic.',
      statusNote:
        'Completed as a practice prototype. It was not commissioned, delivered to, or used by the clinic.',
      technologies: [
        'AI-assisted development',
        'Responsive layouts',
        'Navigation and interaction design',
      ],
    },
  },
  {
    id: 'campus-connect',
    index: '03',
    title: 'CampusConnect',
    category: 'Build & Design',
    description:
      'A product concept for clearer communication between students, teachers and campus administration, developed as a UI/UX design and clickable prototype.',
    highlights: [
      'Product concept and interface designed independently',
      'Student, teacher and administration flows',
      'Clickable prototype built in Google AI Studio',
    ],
    status: 'PROTOTYPE COMPLETED',
    caseStudy: {
      overview:
        'A proposed communication platform for educational institutions. The concept covers class-status updates, announcements and separate student and teacher experiences.',
      contribution:
        'I developed the product concept, designed the user experience and interface, and created the clickable prototype using Google AI Studio.',
      statusNote:
        'This is a UI/UX design and clickable prototype. It is not a deployed application; live notifications, server workflows and backend functionality are not implemented.',
      technologies: [
        'Google AI Studio',
        'Product conceptualization',
        'UI/UX design',
        'Clickable prototyping',
      ],
    },
  },
  {
    id: 'solar-ev',
    index: '04',
    title: 'Solar-Charged EV Conversion',
    category: 'Research & Engineering',
    description:
      'A batch-level engineering project for which I independently completed the technical research, calculations and documentation groundwork.',
    highlights: [
      'Research into motor, controller, battery and solar requirements',
      'Technical calculations and design justification',
      'Project proposal and detailed calculation report prepared',
    ],
    status: 'RESEARCH & DOCUMENTATION COMPLETE',
    caseStudy: {
      overview:
        'A college engineering project proposing the integration of solar charging and a battery system into an existing four-wheeler electric vehicle.',
      contribution:
        'My individual contribution was the research and development groundwork and the complete technical documentation. I researched and checked the motor, controller, battery, solar-panel and charging-system requirements, completed the calculations, and prepared the project proposal and technical calculation/design-justification report.',
      statusNote:
        'My research and documentation handoff is complete. Vehicle procurement, assembly and testing were still pending when this portfolio entry was prepared; the vehicle is not described as built or tested.',
      technologies: [
        'EV systems research',
        'Battery sizing calculations',
        'Solar PV sizing',
        'MPPT charging architecture',
        'Technical documentation',
      ],
    },
  },
  {
    id: 'green-string',
    index: '05',
    title: 'The Green String',
    category: 'Writing & Media',
    description:
      'A completed original novel manuscript by Sayem Quadri. The book has not yet been published.',
    highlights: [
      'Full manuscript completed',
      'Original long-form fiction',
      'Unpublished and available for publication',
    ],
    status: 'COMPLETED · UNPUBLISHED',
    caseStudy: {
      overview:
        'The Green String is a completed, original novel manuscript. It has not been published or released.',
      contribution:
        'Written by Sayem Quadri.',
      statusNote:
        'Manuscript complete. Unpublished. No public synopsis or reading excerpt is being displayed until the author supplies text intended for publication.',
      technologies: ['Novel writing', 'Long-form fiction'],
    },
  },
  {
    id: 'content-creation',
    index: '06',
    title: 'Short-form Content Creation',
    category: 'Writing & Media',
    description:
      'A short publishing experiment across multiple channels, combining topic research, information checking, scriptwriting and explanatory storytelling.',
    highlights: [
      'Research, information checking and scriptwriting handled by me',
      'Around two weeks of content creation',
      'Approximately 50,000 combined views and 100 subscribers reported across channels',
    ],
    status: 'PAUSED · HISTORICAL WORK',
    caseStudy: {
      overview:
        'I created content across multiple channels, including anime-related and educational material. I handled topic research, information gathering and checking, scriptwriting, story structure and the explanations presented to viewers.',
      contribution:
        'Research, scriptwriting, narrative structure and explanatory development.',
      statusNote:
        'The channels are paused. The approximately 50,000 combined views and 100 subscribers are figures I reported from the period; they are not currently linked to public analytics screenshots and should be treated as self-reported.',
      technologies: [
        'Content research',
        'Scriptwriting',
        'Story structure',
        'Science communication',
      ],
    },
  },
];

export const CREATIVE_ARCHIVE = {
  indexLabel: '02 · Creative work',
  heading: 'Work beyond the screen.',
  supportingText:
    'Writing, voice performance, content and presentations are part of my work too. This section records the formats I have worked in without inventing samples that are not ready to share.',
  voiceSection: {
    label: 'Anime dubbing & voice acting',
    title: 'Character dialogue and voice performance',
    summary:
      'I have dubbed existing anime clips using my own voice and performed character dialogues. This is independent creative practice, not a claim of professional voice-acting credits.',
    activities: [
      'Dubbing existing anime clips with my own voice',
      'Performing character dialogues and voice acting',
    ],
    sampleNote:
      'I do not currently have a public audio sample attached to this portfolio.',
  },
  greenString: {
    label: 'Novel writing',
    title: 'The Green String',
    status: 'Completed · Unpublished',
    description:
      'The complete manuscript is finished. It has not yet been published.',
  },
  writing: {
    label: 'Writing formats',
    title: 'Writing across different formats',
    items: [
      'Long-form fiction and novels',
      'Scripts for videos',
      'Technical and research reports',
      'Speeches and event scripts',
    ],
  },
  contentCreation: {
    label: 'Content creation',
    title: 'Research-led video content',
    description:
      'For my channels, I handled the process from choosing and researching a topic to checking information, writing the script and shaping the explanation and story.',
    metrics: [
      { value: '≈50K', label: 'combined views reported across channels' },
      { value: '≈100', label: 'subscribers reported across channels' },
      { value: '≈2 weeks', label: 'period of content creation' },
    ],
    note:
      'Figures are self-reported and combined across channels; analytics screenshots are not currently attached.',
  },
  presentations: {
    label: 'Presentations & communication',
    title: 'Presentation decks I created',
    summary:
      'I created these decks using multiple AI models and learned how PowerPoint files are structured so I could direct the tools, inspect the output and refine the presentations.',
    items: [
      {
        id: 'planet',
        title: 'Our Planet Is Dying',
        slides: 20,
        subject: 'Environment & climate',
        description:
          'A documentary-style briefing on human pressure on Earth systems, climate, oceans, biodiversity, pollution and possible responses.',
        role:
          'Deck created by me. The presentation includes speaker notes, data references and a chapter-by-chapter narrative. Facts and time-sensitive figures should be checked before public release.',
      },
      {
        id: 'paytm',
        title: 'Vijay Shekhar Sharma — Paytm Case Study',
        slides: 14,
        subject: 'Entrepreneurship',
        description:
          'A case study following the development of One97 and Paytm, its business expansion, IPO and later challenges.',
        role:
          'Deck created by me. The 2026 regulatory and company-status details need an accuracy review before public release.',
      },
      {
        id: 'bev',
        title: 'Battery Electric Vehicle (BEV)',
        slides: 10,
        subject: 'Engineering & technology',
        description:
          'An introductory technical presentation on BEV components, working principles, advantages, limitations and future developments.',
        role:
          'Deck created by me and presented with a co-presenter.',
      },
    ] as PresentationItem[],
  },
  publicSpeaking: {
    label: 'Public speaking',
    title: 'College Freshers’ Party',
    role: 'Co-host and anchor',
    description:
      'Represented the Mechanical Engineering Department as a co-host. My part covered welcoming and addressing college officials and hosting the programme segments conducted in their presence.',
  },
} as const;

export const PROCESS_CONTENT = {
  indexLabel: '03 · How I work',
  heading: 'How I approach a project.',
  supportingText:
    'The sequence changes by project, but much of my work follows the same pattern: understand the subject, organize the information, make something testable, then review and explain it.',
  steps: [
    {
      number: '01',
      title: 'Research the subject',
      description:
        'Gather the information, constraints and requirements before settling on a direction.',
    },
    {
      number: '02',
      title: 'Structure the work',
      description:
        'Turn the brief or research into a clear product flow, report, script or presentation.',
    },
    {
      number: '03',
      title: 'Build a first version',
      description:
        'Create the application, prototype, document or deck that makes the idea concrete.',
    },
    {
      number: '04',
      title: 'Review and refine',
      description:
        'Check the result, improve the details and make the finished work understandable to someone else.',
    },
  ],
  aiNote:
    'I use AI models as tools in parts of my workflow. For presentation work, I learned how PowerPoint files are structured so I could direct the models more precisely, inspect what they produced and refine the result. I aim to describe my own contribution clearly rather than claim every generated implementation detail as work I wrote by hand.',
} as const;

export const ABOUT_CONTENT = {
  indexLabel: '04 · About Sayem',
  heading: 'Why I use the name SAY.',
  lead:
    'SAY began with the first three letters of my name, Sayem. Around 12–13 years old, I started using it as a prefix for the interests I was exploring: SAY Gaming, SAY Design, SAY Anime, SAY Developer and SAY Animate.',
  originStory: {
    eyebrow: 'ORIGIN · AGE 12–13 TO PRESENT',
    title: 'The name came before the portfolio.',
    paragraphs: [
      'SAY began with the first three letters of my name, Sayem. Around 12–13 years old, I started attaching it to whatever I was interested in at the time: SAY Gaming, SAY Design, SAY Anime, SAY Developer and SAY Animate.',
      'I still use it. Now it is the name I put across the projects, writing and creative work I make.',
    ],
    prefixes: [
      'SAY Gaming',
      'SAY Design',
      'SAY Anime',
      'SAY Developer',
      'SAY Animate',
    ],
  },
  philosophyParagraphs: [
    'My work has included building a student insight application, designing clickable prototypes, researching an EV conversion, writing a complete novel, creating video scripts and performing anime dialogue.',
    'Some of these are finished projects; some are prototypes; some are creative experience without a public sample attached yet. I label them by their actual status and contribution.',
  ],
  disciplines: [
    {
      id: 'build',
      title: 'Build & design',
      summary:
        'I conceptualize, design and develop digital applications, websites and interface prototypes.',
      evidence: 'DeRote · Clinic Website Prototype · CampusConnect',
    },
    {
      id: 'research',
      title: 'Research & engineering',
      summary:
        'I work through technical requirements, calculations and documentation, including the research stage of an engineering project.',
      evidence: 'Solar-Charged EV Conversion',
    },
    {
      id: 'creative',
      title: 'Writing, voice & communication',
      summary:
        'I write fiction, scripts, reports and event speeches, create presentations, dub anime clips and host live events.',
      evidence:
        'The Green String · Presentation decks · Anime dubbing · Event co-hosting',
    },
  ] as DisciplineItem[],
} as const;

export const CONTACT_CONTENT = {
  indexLabel: '05 · Contact',
  headingLines: ['Have a project in mind?', 'Tell me what you need.'],
  note:
    'My work spans websites and web apps, interface design, presentations, research and documentation, writing and content. Send me the brief and I will tell you clearly whether the scope is a good fit.',
  availabilityStatus: 'Open to selected projects and collaborations',
  inquiryPresets: [
    'Website / Web application',
    'Design / UI/UX',
    'Presentation / Pitch deck',
    'Research / Technical documentation',
    'Writing / Content',
    'Other collaboration',
  ],
} as const;

export const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    id: 'email',
    label: 'Email',
    url: 'mailto:sayemquadri0@gmail.com',
    handle: 'sayemquadri0@gmail.com',
  },
  {
    id: 'github',
    label: 'GitHub',
    url: 'https://github.com/sayemquadri',
    handle: '@sayemquadri',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/sayemquadri',
    handle: 'in/sayemquadri',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/ldksayem',
    handle: '@ldksayem',
  },
];
