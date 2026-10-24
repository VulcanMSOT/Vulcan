/**
 * Vulcan Club — Content Data File
 * 
 * Single source of truth for all landing page copy and structured data.
 * All unspecified details use strictly marked placeholders as instructed.
 * Real club details are preserved verbatim without embellishment.
 */

export const CLUB_INFO = {
  name: "vulcan club",
  shortName: "vulcan",
  tagline: "Forging software from first principles.",
  college: "Mirai School of Technology",
  about: {
    line1: "We build, compete and contribute.",
    line2: "Vulcan is a tech club. We run hackathons, work on open source, practise competitive programming and build projects together.",
    line3: "Our members have cracked GSoC and LFX."
  },
  contact: {
    email: "vulcan.techclub@gmail.com",
    socials: [
      { name: "X", url: "https://x.com/VulcanTechClub" },
      { name: "LinkedIn", url: "https://www.linkedin.com/in/vulcantechclub/" },
      { name: "Instagram", url: "https://www.instagram.com/vulcan_tech_club" }
    ]
  }
};

/**
 * 5 Core Activities of Vulcan Club
 */
export const WHAT_WE_DO = [
  {
    id: "hackathons",
    number: "01",
    title: "Hackathons",
    description: "Ideating, sprinting, and shipping functional prototypes under pressure across global and national tech hackathons.",
    tag: "Competitions"
  },
  {
    id: "open-source",
    number: "02",
    title: "Open Source Contributions",
    description: "Contributing real code, bug fixes, and documentation to production software and open ecosystems worldwide.",
    tag: "Ecosystem"
  },
  {
    id: "guidance",
    number: "03",
    title: "Guidance",
    description: "Senior-to-peer technical mentorship, roadmap acceleration, and selective open source fellowship preparation.",
    highlightLine: "Our members have cracked GSoC and LFX.",
    tag: "Fellowships"
  },
  {
    id: "competitive-programming",
    number: "04",
    title: "Competitive Programming",
    description: "Rigorous algorithmic problem solving, graph theory, data structures, and algorithmic contest preparation.",
    tag: "Algorithms"
  },
  {
    id: "project-building",
    number: "05",
    title: "Project Building",
    description: "Designing end-to-end architectures, distributed systems, tools, and developer utilities from first principles.",
    tag: "Engineering"
  }
];

/**
 * Events (Horizontal Scroll Section)
 */
export const EVENTS = [
  {
    id: "event-1",
    date: "[EVENT DATE]",
    title: "Hack-O-Lantern",
    description: "Internal sprint session and competitive technical challenge.",
    link: "/halloween-hack"
  },
  {
    id: "event-2",
    date: "[EVENT DATE]",
    title: "[EVENT NAME]",
    description: "Open source contribution workshop and architecture teardown.",
    link: null
  },
  {
    id: "event-3",
    date: "[EVENT DATE]",
    title: "[EVENT NAME]",
    description: "Algorithmic showdown and timed problem-solving contest.",
    link: null
  },
  {
    id: "event-4",
    date: "[EVENT DATE]",
    title: "[EVENT NAME]",
    description: "Demo day showcasing member-built tools and open projects.",
    link: null
  }
];

/**
 * Featured Projects
 */
export const PROJECTS = [
  {
    id: "auto-translation-field",
    number: "01",
    tag: "Google Summer of Code 2026",
    title: "Auto Translation Field (Drupal)",
    summary: "Provides a field-level, one-click AI translation button inside the Drupal content editing form, leveraging the Drupal AI Core ecosystem to communicate with LLMs and translation services.",
    stack: ["PHP 8.3+", "Drupal Core", "Drupal AI", "JavaScript"],
    status: "1.0.0-alpha1 released on Drupal.org",
    credit: "Built by Sapnil Biswas · Mentored by Pooja Sharma",
    isPlaceholder: false,
    links: [
      {
        label: "Drupal.org project",
        url: "https://www.drupal.org/project/auto_translation_field",
        primary: true,
      },
      {
        label: "GSoC final report",
        url: "https://github.com/sapnilbiswas/Drupal-Auto-Translation-Field-GSoC-2026",
        primary: false,
      },
    ],
    built: [
      "FieldTranslationService: Backend service integrating with Drupal AI Core for prompt building and provider dispatch.",
      "Multi-Provider Support: Integration with Chat LLMs and dedicated translate_text providers.",
      "Diff Preview Overlay: Differential visual comparison allowing editors to review changes before applying.",
      "CKEditor 5 & Paragraphs: In-place translation injection into rich text editors and complex composite fields.",
      "Secure AJAX API: CSRF-protected endpoints, rate limiting, and permission access checks.",
      "Automated Testing: Unit test suite and Functional Javascript browser testing via Drupal GitLab CI.",
    ],
    flow: [
      "Editor clicks Translate",
      "Request goes through Drupal AI Core to a provider",
      "Diff preview appears",
      "Editor applies the translation",
    ],
  },
  {
    id: "project-2",
    number: "02",
    tag: "[CATEGORY]",
    title: "[PROJECT NAME]",
    summary: "[PROJECT SUMMARY]",
    stack: ["[STACK 1]", "[STACK 2]", "[STACK 3]"],
    status: "[PROJECT STATUS]",
    credit: "[MEMBER NAME]",
    isPlaceholder: true,
    links: [],
    built: [],
  },
  {
    id: "project-3",
    number: "03",
    tag: "[CATEGORY]",
    title: "[PROJECT NAME]",
    summary: "[PROJECT SUMMARY]",
    stack: ["[STACK 1]", "[STACK 2]", "[STACK 3]"],
    status: "[PROJECT STATUS]",
    credit: "[MEMBER NAME]",
    isPlaceholder: true,
    links: [],
    built: [],
  },
];

export const projects = PROJECTS;

/**
 * Core Team Members
 */
export const TEAM = [
  {
    id: "team-1",
    name: "Saicharan Draksharapu",
    role: "President",
    image: "/assets/team/saicharan.jpg",
    links: {
      github: "https://github.com/dsaicharan072-cmyk",
      linkedin: "https://www.linkedin.com/in/saicharan-draksharapu-050065380/",
      codeforces: "https://codeforces.com/profile/saicharan072"
    }
  },
  {
    id: "team-2",
    name: "Himangshu Yadav",
    role: "Treasurer",
    image: "/assets/team/himangshu.jpg",
    links: {
      github: "https://github.com/HimangshuYadav",
      linkedin: "https://www.linkedin.com/in/himangshuyadav"
    }
  },
  {
    id: "team-3",
    name: "Akshara P",
    role: "Vice-President",
    image: "/assets/team/akshara.jpg",
    links: {
      github: "https://github.com/vasakb",
      linkedin: "https://www.linkedin.com/in/akshara-p-441674381/"
    }
  },
  {
    id: "team-4",
    name: "Sapnil Biswas",
    role: "Development",
    image: "/assets/team/sapnil.jpg",
    links: {
      github: "https://github.com/sapnilbiswas",
      linkedin: "https://www.linkedin.com/in/sapnil-biswas-992841403/"
    }
  },
  {
    id: "team-5",
    name: "Dhruvesh Mishra",
    role: "Development",
    image: "/assets/team/dhruvesh.jpg",
    links: {
      github: "https://github.com/dhruveshmishra",
      linkedin: "https://www.linkedin.com/in/dhruvesh-mishra-291845376/"
    }
  },
  {
    id: "team-6",
    name: "Pawan Tiwari",
    role: "Competitive Programming",
    image: "/assets/team/pawan.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/pawan-kumar-tiwari-/",
      codeforces: "https://codeforces.com/profile/tiwaripawankumar217"
    }
  },
  {
    id: "team-7",
    name: "Anushka Dewangan",
    role: "Competitive Programming / PR",
    image: "/assets/team/anushka.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/anushka-dewangan/",
      codeforces: "https://codeforces.com/profile/anushkadewangan08102006"
    }
  },
  {
    id: "team-8",
    name: "Padmasri Chikle",
    role: "Competitive Programming / WebDev / PR",
    image: "/assets/team/padmasri.jpg",
    links: {
      github: "https://github.com/padmasri-web",
      linkedin: "https://www.linkedin.com/in/padmasri-chikle/",
      codeforces: "https://codeforces.com/profile/padmasri2310"
    }
  },
  {
    id: "team-9",
    name: "Jhalak Yadav",
    role: "Development",
    image: "/assets/team/jhalak.jpg",
    links: {
      github: "https://github.com/jhalak101205-cpu",
      linkedin: "https://www.linkedin.com/in/jhalak-yadav-0b17b32b5/"
    }
  },
  {
    id: "team-10",
    name: "Harsh Koli",
    role: "Development",
    image: "/assets/team/harsh.jpg",
    links: {
      github: "https://github.com/harshkoli1255",
      linkedin: "https://www.linkedin.com/in/koliharsh/"
    }
  },
  {
    id: "team-11",
    name: "Krishna Negi",
    role: "WebDevelopment / Management",
    image: "/assets/team/krishna.jpg",
    links: {
      github: "https://github.com/WKr1shna",
      linkedin: "https://www.linkedin.com/in/krishnanegi7/"
    }
  },
  {
    id: "team-12",
    name: "Keerthi Kumar",
    role: "Development",
    image: "/assets/team/keerthi.jpg",
    links: {
      github: "https://github.com/KeerthiKumarR",
      linkedin: "https://www.linkedin.com/in/keerthi-kumar-r/",
      codeforces: "https://codeforces.com/profile/Kr1shna._."
    }
  }
];
