export type WorkCategory =
  | 'all'
  | 'Design & Digital Experiences'
  | 'Development & Technology'
  | 'Research & Engineering'
  | 'Writing & Storytelling'
  | 'Voice, Dubbing & Narration'
  | 'Presentations & Communication'
  | 'Experiments & Explorations';

export type ProjectStatusLabel =
  | 'COMPLETED'
  | 'IN PROGRESS'
  | 'EXPERIMENTAL'
  | 'INDEPENDENT WORK'
  | 'CLIENT WORK';

export type ProjectVisualMotif =
  | 'derote'
  | 'say-orbit'
  | 'campus'
  | 'ev'
  | 'green-string'
  | 'voice-reel'
  | 'aq-explains'
  | 'ai-proto'
  | 'constellation';

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
  /** Normalized radius multiplier relative to portrait container radius */
  rxFactor: number;
  ryFactor: number;
  /** Ellipse tilt angle in degrees */
  tiltDeg: number;
  /** Angular speed in radians per second along the ellipse */
  speedRadPerSec: number;
  /** Initial orbital phase in radians */
  initialAngle: number;
}

export interface ProjectMediaAttachment {
  kind: 'image' | 'video' | 'audio' | 'link';
  label: string;
  url?: string;
  note: string;
}

export interface ProjectCaseStudy {
  overview: string;
  objective: string;
  approach: string;
  contribution: string;
  technologies: string[];
  visualNote: string;
  isConceptualMedia: boolean;
  mediaAttachments?: ProjectMediaAttachment[];
  liveUrl?: string;
  sourceUrl?: string;
}

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: Exclude<WorkCategory, 'all'>;
  description: string;
  highlights: string[];
  status: ProjectStatusLabel;
  motif: ProjectVisualMotif;
  caseStudy: ProjectCaseStudy;
}

export interface VoiceTrack {
  id: string;
  code: string;
  title: string;
  category: string;
  durationLabel: string;
  audioUrl?: string;
  directionNote: string;
  scriptLine: string;
  placeholderNote: string;
}

export interface StoryAnalysisItem {
  id: string;
  code: string;
  medium: string;
  title: string;
  thesis: string;
  notes: string[];
}

export interface PresentationItem {
  id: string;
  code: string;
  title: string;
  audienceContext: string;
  structureSummary: string;
  deckUrl?: string;
}

export type ExperimentStatus = 'PROTOTYPE' | 'EXPERIMENTAL' | 'PROOF OF CONCEPT';

export type ExperimentDemoKind =
  | 'celestial-portrait'
  | 'availability-pulse'
  | 'kinetic-type'
  | 'script-storyboard';

export interface ExperimentItem {
  id: string;
  index: string;
  name: string;
  explanation: string;
  technologies: string[];
  status: ExperimentStatus;
  demoKind: ExperimentDemoKind;
  note: string;
}

export interface DisciplineItem {
  id: string;
  index: string;
  title: string;
  summary: string;
  highlights: string[];
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
  positioning: 'Multidisciplinary Creator, Researcher & Builder',
  title: 'SAY — Sayem Quadri',
  tagline: 'Ideas into Creations.',
  ethos: 'IDEAS INTO CREATIONS.',
} as const;

export const ORBITAL_DESTINATIONS: OrbitalDestination[] = [
  {
    id: 'work',
    index: '01',
    code: 'WORK',
    label: 'Portfolio Archive',
    subtitle: 'Design, technology, engineering, writing & voice work',
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
    label: 'Creative Expression',
    subtitle: 'Voice dubbing, fiction, film analysis & presentations',
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
    code: 'EXPERIMENTS',
    label: 'Playground & Probes',
    subtitle: 'Informal prototypes & unfinished explorations',
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
    label: 'The Story of SAY',
    subtitle: 'Curiosity, multidisciplinary craft & origin',
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
    label: 'Collaborations & Inquiries',
    subtitle: 'Direct channels for client, creative & research work',
    href: '#contact',
    rxFactor: 1.11,
    ryFactor: 1.03,
    tiltDeg: 20,
    speedRadPerSec: 0.082,
    initialAngle: 4.58,
  },
];

export const HERO_CONTENT = {
  eyebrow: 'SAY · MULTIDISCIPLINARY CREATOR, RESEARCHER & BUILDER',
  headlineLines: ['Curiosity has no', 'single discipline.'],
  introduction:
    "I'm Sayem — a multidisciplinary creator, researcher and builder exploring the intersection of technology, design, engineering and storytelling.",
  primaryCta: {
    label: 'Explore My Work',
    href: '#work',
  },
  secondaryCta: {
    label: 'More About Me',
    href: '#about',
  },
} as const;

export const WORK_SECTION_CONTENT = {
  indexLabel: '01 · Work Archive',
  heading: 'Complete Portfolio Archive.',
  supportingText:
    'Selected projects, independent creations, technical builds, writing, voice work, and early studies organized across seven disciplines.',
} as const;

export const WORK_CATEGORIES: { id: WorkCategory; label: string; shortLabel: string }[] = [
  { id: 'all', label: 'All Work', shortLabel: 'All' },
  {
    id: 'Design & Digital Experiences',
    label: 'Design & Digital Experiences',
    shortLabel: 'Design & UX',
  },
  {
    id: 'Development & Technology',
    label: 'Development & Technology',
    shortLabel: 'Development',
  },
  {
    id: 'Research & Engineering',
    label: 'Research & Engineering',
    shortLabel: 'Engineering',
  },
  {
    id: 'Writing & Storytelling',
    label: 'Writing & Storytelling',
    shortLabel: 'Writing',
  },
  {
    id: 'Voice, Dubbing & Narration',
    label: 'Voice, Dubbing & Narration',
    shortLabel: 'Voice & Dubbing',
  },
  {
    id: 'Presentations & Communication',
    label: 'Presentations & Communication',
    shortLabel: 'Presentations',
  },
  {
    id: 'Experiments & Explorations',
    label: 'Experiments & Explorations',
    shortLabel: 'Experiments',
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'say-orbital-system',
    index: '01',
    title: 'SAY — Personal Ecosystem & Orbital Web Architecture',
    category: 'Design & Digital Experiences',
    description:
      'Designed and built the SAY personal digital identity uniting purple orbital iconography, an interactive 3D constellation portrait, and editorial archive flows.',
    highlights: [
      'Geometric SAY brand identity & purple orbital palette',
      'Live WebGL line-and-dot portrait paired with orbital navigation',
      'Editorial typography & accessible multi-discipline showcase',
    ],
    status: 'COMPLETED',
    motif: 'say-orbit',
    caseStudy: {
      overview:
        'A bespoke web environment built around the SAY personal brand, integrating custom geometric mark work, a WebGL wireframe constellation portrait, and a structured multidisciplinary portfolio.',
      objective:
        'Present technology, engineering, design, storytelling, and voice work together under one cohesive identity rather than splitting them across disconnected profiles.',
      approach:
        'Paired deep charcoal surfaces and restrained purple orbital accents with hardware-accelerated Three.js line geometry and clear semantic navigation.',
      contribution:
        'Brand direction, UI/UX layout, orbital navigation system, frontend engineering, and interactive creative showcases.',
      technologies: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS', 'Motion'],
      visualNote:
        'Live Production Experience — Interactive orbital architecture and visual language currently running on this site.',
      isConceptualMedia: false,
      mediaAttachments: [
        {
          kind: 'link',
          label: 'Interactive 3D Portrait Stage',
          note: 'Live WebGL geometry running in the Home viewport.',
        },
      ],
    },
  },
  {
    id: 'derote',
    index: '02',
    title: 'DeRote Student Insight System',
    category: 'Development & Technology',
    description:
      'A student profiling and insight assessment web application structured for clear onboarding, questionnaires, and administrative reporting.',
    highlights: [
      'Structured onboarding & student profiling flows',
      'Questionnaire-driven insight evaluation',
      'Firebase synchronization & reporting views',
    ],
    status: 'IN PROGRESS',
    motif: 'derote',
    caseStudy: {
      overview:
        'A web application designed to organize student profile intake, structured assessment questionnaires, and clear reporting inside a single coherent workspace.',
      objective:
        'Replace scattered spreadsheet and form workflows with an approachable, data-consistent assessment platform.',
      approach:
        'Built modular React views connected to Firebase data persistence so profile capture, questionnaire logic, and review dashboards stay synchronized.',
      contribution:
        'Product architecture, interface engineering, questionnaire state modeling, and database workflow setup.',
      technologies: ['React', 'TypeScript', 'Firebase', 'UI Architecture'],
      visualNote:
        'Interface Preview Placeholder — Live application screenshots and walkthrough clips can be attached here once prepared.',
      isConceptualMedia: true,
      mediaAttachments: [
        {
          kind: 'image',
          label: 'Assessment Flow Screenshots',
          note: 'Placeholder slot ready for interface captures.',
        },
        {
          kind: 'video',
          label: 'Walkthrough Screen Recording',
          note: 'Placeholder slot ready for demo video clip.',
        },
      ],
    },
  },
  {
    id: 'ev-engineering',
    index: '03',
    title: 'EV Subsystem & Mobility Architecture Study',
    category: 'Research & Engineering',
    description:
      'An independent engineering study examining electric vehicle subsystem layout, mechanical packaging, and practical mobility constraints.',
    highlights: [
      'Electric vehicle architecture investigation',
      'Mechanical & structural packaging analysis',
      'First-principles technical documentation',
    ],
    status: 'INDEPENDENT WORK',
    motif: 'ev',
    caseStudy: {
      overview:
        'Technical research and engineering exploration focused on how structural packaging, drivetrain layout, and practical mechanical constraints govern electric mobility designs.',
      objective:
        'Build grounded intuition around EV subsystem trade-offs through systematic documentation rather than surface-level specs.',
      approach:
        'Decomposed layout considerations, structural loads, and component placement into annotated engineering study notes.',
      contribution:
        'Technical research, subsystem breakdown, mechanical layout exploration, and structured documentation.',
      technologies: ['Mechanical Systems', 'EV Architecture', 'Technical Documentation'],
      visualNote:
        'Engineering Schematic Frame — Supplied CAD renders, diagrams, and technical briefs can be linked here when published.',
      isConceptualMedia: true,
      mediaAttachments: [
        {
          kind: 'image',
          label: 'Packaging Layout Schematics',
          note: 'Placeholder slot for CAD drawings and diagrams.',
        },
      ],
    },
  },
  {
    id: 'the-green-string',
    index: '04',
    title: 'The Green String',
    category: 'Writing & Storytelling',
    description:
      'A long-form literary novel and independent personal publishing project exploring continuity, memory, and human turning points.',
    highlights: [
      'Original long-form literary manuscript',
      'Character interiority & deliberate editorial pacing',
      'Independent book identity & publishing preparation',
    ],
    status: 'IN PROGRESS',
    motif: 'green-string',
    caseStudy: {
      overview:
        'An original long-form literary narrative crafted slowly around memory, perspective, and the quiet threads linking defining moments across time.',
      objective:
        'Shape a sustained piece of fiction treated with equal care in prose craft, thematic arc, and editorial presentation.',
      approach:
        'Drafting and revising iteratively with emphasis on restraint, atmospheric voice, and structural cohesion.',
      contribution:
        'Authoring, narrative architecture, manuscript editing, and visual edition concept.',
      technologies: ['Long-Form Fiction', 'Narrative Structure', 'Editorial Direction'],
      visualNote:
        'Manuscript & Cover Concept Frame — Final cover artwork and reading excerpts will populate as chapters lock.',
      isConceptualMedia: true,
      mediaAttachments: [
        {
          kind: 'image',
          label: 'Edition Cover Plate',
          note: 'Placeholder for final typography and cover design.',
        },
      ],
    },
  },
  {
    id: 'anime-dubbing-reels',
    index: '05',
    title: 'Anime Dubbing & Character Voicework',
    category: 'Voice, Dubbing & Narration',
    description:
      'Expressive vocal performances, anime scene dubs, and dramatic narration studies focusing on emotional range and lip-sync timing.',
    highlights: [
      'Character voice adaptation & dramatic range',
      'Tight dialogue timing & breathing cadence',
      'Clean spoken narration & tone modulation',
    ],
    status: 'INDEPENDENT WORK',
    motif: 'voice-reel',
    caseStudy: {
      overview:
        'A body of independent voiceover and anime dubbing practice translating dramatic pacing, emotional inflection, and vocal presence into crisp recorded performances.',
      objective:
        'Deliver natural, emotionally believable vocal reads that match scene rhythm and character psychology without overacting.',
      approach:
        'Script breakdown by emotional beat, breath timing rehearsal, and clean close-mic vocal delivery.',
      contribution:
        'Voice acting, dialogue adaptation, timing sync, and vocal recording.',
      technologies: ['Voice Acting', 'Anime Dubbing', 'Audio Pacing', 'Narration'],
      visualNote:
        'Audio Showcase Slot — Sample dubbing takes and voice reels are showcased inside Creative Expression and ready for direct audio uploads.',
      isConceptualMedia: true,
      mediaAttachments: [
        {
          kind: 'audio',
          label: 'Anime Dubbing & Narration Reel',
          note: 'Interactive audio showcase slots available in Creative Expression.',
        },
        {
          kind: 'video',
          label: 'Dubbed Scene Clips',
          note: 'Placeholder slot ready for synced scene video links.',
        },
      ],
    },
  },
  {
    id: 'aq-explains',
    index: '06',
    title: 'AQ Explains — Explanatory Decks & Stories',
    category: 'Presentations & Communication',
    description:
      'An independent science and technology storytelling initiative pairing visual presentations, scripted clarity, and realistic what-if inquiries.',
    highlights: [
      'First-principles breakdown of complex mechanisms',
      'Structured visual slide & story beat flow',
      'Audience-ready explanations without jargon overload',
    ],
    status: 'INDEPENDENT WORK',
    motif: 'aq-explains',
    caseStudy: {
      overview:
        'Explanatory storytelling and presentation work under AQ Explains, turning dense scientific and technical mechanisms into intuitive, visually grounded narratives.',
      objective:
        'Bridge deep curiosity and public clarity so non-specialists can grasp real physical constraints and technical trade-offs.',
      approach:
        'Anchor each topic on one concrete question, strip unnecessary jargon, and align spoken cadence with visual beats.',
      contribution:
        'Research, scriptwriting, presentation structuring, visual framing, and narration.',
      technologies: ['Science Communication', 'Presentation Design', 'Scriptwriting', 'Visual Storytelling'],
      visualNote:
        'Episode & Deck Frame — Visual slides, thumbnails, and video links will attach here as episodes publish.',
      isConceptualMedia: true,
      mediaAttachments: [
        {
          kind: 'video',
          label: 'Episode Reel Slot',
          note: 'Ready for published video URL or MP4 embed.',
        },
      ],
    },
  },
  {
    id: 'campus-connect',
    index: '07',
    title: 'Campus Connect',
    category: 'Design & Digital Experiences',
    description:
      'A digital experience concept streamlining institutional communication through low-noise classroom and faculty availability signals.',
    highlights: [
      'Real-time room & availability signal modeling',
      'Minimalist notification state hierarchy',
      'Friction-free student-faculty status flow',
    ],
    status: 'EXPERIMENTAL',
    motif: 'campus',
    caseStudy: {
      overview:
        'A product and interface exploration addressing everyday scheduling uncertainty inside campuses via concise availability notifications.',
      objective:
        'Replace fragmented updates with clear, glanceable status transitions that minimize notification fatigue.',
      approach:
        'Modeled compact status states (Session Open, Moved, Deferred) and designed an uncluttered interface language around them.',
      contribution:
        'UX architecture, state modeling, visual system design, and interactive prototype.',
      technologies: ['UX Systems', 'Interface Prototyping', 'State Modeling'],
      visualNote:
        'Interactive Prototype Available — Test the live notification state simulator inside the Experiments section.',
      isConceptualMedia: true,
    },
  },
  {
    id: 'vibe-coding-prototypes',
    index: '08',
    title: 'AI-Assisted Web Prototypes (Vibe Coding)',
    category: 'Development & Technology',
    description:
      'Rapid web applications and functional interface explorations built through AI-assisted workflows, prompt systems, and iterative TypeScript craft.',
    highlights: [
      'Rapid concept-to-prototype web builds',
      'AI-assisted workflow & architectural iteration',
      'Component systems focused on speed & polish',
    ],
    status: 'EXPERIMENTAL',
    motif: 'ai-proto',
    caseStudy: {
      overview:
        'An ongoing stream of rapid web experiments and digital utilities created by combining AI-assisted coding workflows with hands-on product direction and UI refinement.',
      objective:
        'Compress the distance between an abstract idea and a testable interactive build while preserving code quality and restraint.',
      approach:
        'Iterate rapidly on layout geometry, interaction flows, and clean state boundaries rather than over-engineering upfront.',
      contribution:
        'Product ideation, prompt-driven rapid prototyping, UI editing, and deployment architecture.',
      technologies: ['AI-Assisted Dev', 'Vibe Coding', 'React', 'TypeScript', 'Vite'],
      visualNote:
        'Prototype Archive — Individual micro-tools and web experiments are documented and testable in Experiments.',
      isConceptualMedia: true,
    },
  },
  {
    id: 'celestial-wireframe-study',
    index: '09',
    title: 'Celestial Wireframe Reconstruction Engine',
    category: 'Experiments & Explorations',
    description:
      'A computational geometry and shader experiment extracting ordered 3D wireframe constellations directly from hand-drawn ink artwork.',
    highlights: [
      'Chamfer distance transform & Zhang-Suen thinning',
      'Shallow 3D multi-plane depth stratification',
      'Custom GLSL star glow & hover luminescence',
    ],
    status: 'COMPLETED',
    motif: 'constellation',
    caseStudy: {
      overview:
        'Custom in-browser computer-vision and WebGL pipeline reconstructing an exact line-and-dot drawing into a floating 3D star sculpture.',
      objective:
        'Preserve 100% of the source illustration’s facial geometry and dot positions while giving it genuine spatial depth and calm astronomical motion.',
      approach:
        'Detected circular dot vertices via resolution-adaptive distance transforms prior to 1px stroke thinning and Ramer-Douglas-Peucker polyline tracing.',
      contribution:
        'Algorithm design, custom GLSL vertex/fragment shaders, reduced-motion static raster fallback, and unit tests.',
      technologies: ['Three.js', 'GLSL Shaders', 'Image Processing', 'TypeScript'],
      visualNote:
        'Live Technical Study — Actively rendering in the Home viewport with pointer parallax and hover light response.',
      isConceptualMedia: false,
    },
  },
];

export const CREATIVE_ARCHIVE = {
  indexLabel: '02 · Creative Expression',
  heading: 'Beyond the Build.',
  supportingText:
    'A dedicated studio for voice acting, anime dubbing, long-form fiction, narrative analysis, and expressive visual communication.',
  voiceSection: {
    label: 'Voice, Dubbing & Narration',
    title: 'Vocal Performance & Timing',
    summary:
      'Exploring character psychology, dramatic cadence, and explanatory clarity through anime dubbing, voiceovers, and narrated storytelling.',
    tracks: [
      {
        id: 'anime-dub-dramatic',
        code: 'TAKE 01',
        title: 'Anime Scene Dub — Confrontation Beat',
        category: 'Anime Dubbing · Character Voice',
        durationLabel: '0:24',
        audioUrl: '',
        directionNote: 'Controlled low register shifting into sharp resolve; tight lip-flap cadence.',
        scriptLine:
          '"You still think hesitation keeps anyone safe? Look closely—the moment you stop moving, the world decides for you."',
        placeholderNote: 'Studio placeholder — attach .mp3 or .wav vocal take URL when ready.',
      },
      {
        id: 'narration-aq',
        code: 'TAKE 02',
        title: 'AQ Explains — Opening Hook Read',
        category: 'Narration · Science & What-If',
        durationLabel: '0:32',
        audioUrl: '',
        directionNote: 'Warm, curious pacing with clean pauses around physical cause-and-effect beats.',
        scriptLine:
          '"What happens when a small design rule scales by ten thousand? Most failures look sudden—but the physics warned us long before."',
        placeholderNote: 'Studio placeholder — attach narrated audio clip URL when published.',
      },
      {
        id: 'monologue-literary',
        code: 'TAKE 03',
        title: 'The Green String — Atmospheric Passage',
        category: 'Voiceover · Literary Reading',
        durationLabel: '0:28',
        audioUrl: '',
        directionNote: 'Unrushed, intimate spoken delivery letting silence carry emotional weight.',
        scriptLine:
          '"Some connections never announce themselves with noise. They simply hold quietly across years until you trace them back."',
        placeholderNote: 'Studio placeholder — ready for chapter reading audio attachment.',
      },
    ] as VoiceTrack[],
  },
  greenString: {
    label: 'Creative Writing & Novel Development',
    title: 'The Green String',
    status: 'In Progress · Personal Publishing Project',
    synopsis:
      'A long-form literary work tracing memory, perspective, and the quiet continuity connecting pivotal moments across time. Crafted through deliberate prose and editorial restraint.',
    writingNotes: [
      'Conceived as an independent novel where tone, unspoken tension, and interiority carry equal weight to plot.',
      'Approached holistically as both manuscript and editorial edition—attending closely to rhythm, chapter transitions, and visual symbolism.',
    ],
    readingSampleTitle: 'Excerpt Frame · Chapter Draft Note',
    readingSample:
      '"Memory rarely keeps things in order. It folds years next to minutes, tying two distant rooms together by nothing more than the color of light on a quiet evening."',
    publishingNote:
      'Manuscript drafting active. Final chapter excerpts and edition details will replace this preview frame when prepared.',
  },
  storyAnalysis: {
    label: 'Film & Anime Story Analysis',
    title: 'Narrative Architecture Studies',
    summary:
      'Dissecting how framing, pacing, motif callbacks, and emotional restraint make visual stories linger long after the credits.',
    studies: [
      {
        id: 'pacing-silence',
        code: 'STUDY 01',
        medium: 'Anime Direction',
        title: 'Silence as Pacing Architecture',
        thesis: 'Why holding an extra two seconds on an empty frame often carries more tension than ten lines of exposition.',
        notes: [
          'Breaks down scene transitions where ambient sound and negative space signal internal character shifts.',
          'Applies shot-rhythm awareness directly back into dubbing timing and interactive UI pacing.',
        ],
      },
      {
        id: 'motif-callbacks',
        code: 'STUDY 02',
        medium: 'Cinema & Long-Form Fiction',
        title: 'Visual Motifs & Thematic Echoes',
        thesis: 'Tracking how recurring objects or colors accumulate emotional meaning across acts without explaining themselves aloud.',
        notes: [
          'Examines subtle setup-and-payoff structures in character-driven drama and serialized anime.',
          'Feeds narrative discipline into both The Green String and visual presentation storytelling.',
        ],
      },
    ] as StoryAnalysisItem[],
  },
  presentations: {
    label: 'Presentations & Communication',
    title: 'Clarity-First Visual Decks',
    summary:
      'Translating technical concepts, product ideas, and narrative pitches into structured decks built to inform rather than overwhelm.',
    items: [
      {
        id: 'aq-deck-system',
        code: 'DECK 01',
        title: 'AQ Explains — Visual Beat & Script System',
        audienceContext: 'General & technical curious audiences',
        structureSummary:
          'Question-led narrative flow moving from intuitive observation to governing physical constraints and real-world implications.',
      },
      {
        id: 'concept-pitch-framework',
        code: 'DECK 02',
        title: 'Product & Engineering Concept Framing',
        audienceContext: 'Collaborators, reviewers & multidisciplinary teams',
        structureSummary:
          'High-contrast slide minimalism pairing one clear claim per frame with diagrams that show system trade-offs honestly.',
      },
    ] as PresentationItem[],
  },
} as const;

export const EXPERIMENTS_CONTENT = {
  indexLabel: '03 · Experiments & Playground',
  heading: 'Experiments.',
  supportingText:
    'An informal playground distinct from finished builds—clearly separating functional prototypes from early proof-of-concepts and creative probes.',
} as const;

export const EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'celestial-wireframe',
    index: '01',
    name: 'Celestial Wireframe Portrait & Orbit',
    explanation:
      'Interactive 3D line-and-dot sculpture traced directly from a custom blueprint via Chamfer distance transform and GLSL shaders, paired with tilted orbital navigation.',
    technologies: ['Three.js', 'WebGL / GLSL', 'React', 'TypeScript'],
    status: 'PROTOTYPE',
    demoKind: 'celestial-portrait',
    note: 'Functional prototype running live on Home — responds to pointer tilt, touch drag, hover luminescence, and orbital waypoints.',
  },
  {
    id: 'availability-pulse',
    index: '02',
    name: 'Campus Availability Signal Model',
    explanation:
      'An interface sandbox testing how classroom occupancy and faculty availability transitions can communicate clearly without notification clutter.',
    technologies: ['React State Modeling', 'Interface Prototyping', 'Accessibility'],
    status: 'PROTOTYPE',
    demoKind: 'availability-pulse',
    note: 'Functional UI state prototype modeling low-noise transitions for Campus Connect.',
  },
  {
    id: 'kinetic-type-study',
    index: '03',
    name: 'Editorial Motion & Typography Probe',
    explanation:
      'Testing compositor-only transform/opacity curves paired with high-contrast serif-sans pairings and instant reduced-motion fallbacks.',
    technologies: ['CSS Compositor Motion', 'Typography Systems', 'Reduced Motion'],
    status: 'EXPERIMENTAL',
    demoKind: 'kinetic-type',
    note: 'Exploratory study calibrating calm motion cadence so typography leads without distraction.',
  },
  {
    id: 'science-storyboard-grid',
    index: '04',
    name: 'What-If Script Beat Architecture',
    explanation:
      'A visual storyboard tool structuring scientific questions, governing constraints, and visual turning points before script recording.',
    technologies: ['Narrative Grid', 'Script Formatting', 'Communication Flow'],
    status: 'PROOF OF CONCEPT',
    demoKind: 'script-storyboard',
    note: 'Unfinished proof-of-concept exploring reusable episode beat cards for AQ Explains.',
  },
];

export const ABOUT_CONTENT = {
  indexLabel: '04 · About SAY',
  heading: 'The Story Behind SAY.',
  lead: 'I am curious about how things work, how ideas connect, and how to turn those ideas into something tangible.',
  originStory: {
    eyebrow: 'ORIGIN · AGE 12–13 TO PRESENT',
    title: 'Why SAY?',
    paragraphs: [
      'SAY began with the first three letters of my name, Sayem. Around 12–13 years old, I started attaching it as a personal prefix to every world I wanted to explore—SAY Gaming, SAY Design, SAY Anime, SAY Developer, SAY Animate.',
      'Over time, it stopped being just a naming habit and became an overarching personal identity: a creative ecosystem built on curiosity and the freedom to cross boundaries without asking permission from a single job title.',
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
    'Rather than separating technical engineering from visual design, storytelling, or vocal performance, I treat each discipline as a different way of thinking through ideas and making them real.',
    'One afternoon might mean debugging a React interface or researching electric vehicle packaging; the next might mean drafting a chapter of fiction, breaking down an anime scene, or stepping up to a microphone to bring dialogue to life.',
  ],
  disciplines: [
    {
      id: 'tech-dev',
      index: '01',
      title: 'Technology & Development',
      summary:
        'Vibe coding, web applications, AI-assisted development, and rapid prototypes exploring emerging digital tools.',
      highlights: [
        'Web app architecture & interactive frontends',
        'AI-assisted rapid prototyping & product iteration',
        'Exploring emerging software & web graphics workflows',
      ],
    },
    {
      id: 'design-visual',
      index: '02',
      title: 'Design & Visual Creativity',
      summary:
        'Graphic identity, interface systems, editorial layouts, and atmospheric digital experiences shaped with restraint.',
      highlights: [
        'Website, UI & interactive spatial navigation',
        'Identity marks, typography & visual branding',
        'Creative visual presentations & layout composition',
      ],
    },
    {
      id: 'writing-story',
      index: '03',
      title: 'Writing & Storytelling',
      summary:
        'Long-form fiction, narrative architecture, scriptwriting, and structural story analysis across film and anime.',
      highlights: [
        'Novel writing & editorial pacing (The Green String)',
        'Science & explanatory scriptwriting (AQ Explains)',
        'Film & anime narrative deconstruction',
      ],
    },
    {
      id: 'voice-perf',
      index: '04',
      title: 'Voice & Performance',
      summary:
        'Anime dubbing, character voice adaptation, expressive narration, and timing-driven spoken delivery.',
      highlights: [
        'Character voice acting & anime dubbing sync',
        'Explanatory & literary voiceover narration',
        'Cadence, breath control & emotional range',
      ],
    },
    {
      id: 'research-eng',
      index: '05',
      title: 'Research & Engineering',
      summary:
        'First-principles thinking applied to mechanical systems, technical problem-solving, and structured documentation.',
      highlights: [
        'EV subsystem & physical packaging exploration',
        'Systems decomposition & constraint analysis',
        'Clear, verifiable technical writing',
      ],
    },
    {
      id: 'present-comm',
      index: '06',
      title: 'Presentations & Communication',
      summary:
        'Turning complex technical or abstract themes into clear visual narratives and confident spoken communication.',
      highlights: [
        'Narrative slide architecture & concept framing',
        'Distilling dense research for broad audiences',
        'Visual-verbal alignment in storytelling',
      ],
    },
  ] as DisciplineItem[],
} as const;

export const CONTACT_CONTENT = {
  indexLabel: '05 · Contact',
  headingLines: [
    'Have an interesting idea?',
    "Let's turn it into a creation.",
  ],
  note: 'Open to client engagements, freelance work, creative collaborations, voice/writing projects, and research partnerships.',
  availabilityStatus: 'Available for new projects',
  inquiryPresets: [
    'Client / Freelance Project',
    'Creative Collaboration',
    'Research / Engineering',
    'Voice / Writing Inquiry',
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
