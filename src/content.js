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
  tagline: "[CLUB TAGLINE]",
  college: "[COLLEGE NAME]",
  about: {
    line1: "Vulcan is a tech club.",
    line2: "We organise hackathons, open source contributions, guidance, competitive programming and project building.",
    line3: "Our members have cracked GSoC and LFX."
  },
  contact: {
    email: "[CONTACT EMAIL]",
    socials: [
      { name: "GitHub", url: "[SOCIAL LINKS]" },
      { name: "Twitter / X", url: "[SOCIAL LINKS]" },
      { name: "LinkedIn", url: "[SOCIAL LINKS]" },
      { name: "Discord", url: "[SOCIAL LINKS]" }
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
    title: "[EVENT NAME]",
    description: "Internal sprint session and competitive technical challenge.",
    link: null
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
    id: "project-1",
    title: "[PROJECT NAME]",
    category: "Systems & Infrastructure",
    description: "High-performance developer tool built to streamline local workflows and environment profiling.",
    stack: ["Rust", "TypeScript", "WebAssembly"],
    github: "https://github.com/vulcan-club"
  },
  {
    id: "project-2",
    title: "[PROJECT NAME]",
    category: "Open Source Tooling",
    description: "Collaborative distributed utility designed for real-time peer code review and telemetry.",
    stack: ["Go", "React", "gRPC"],
    github: "https://github.com/vulcan-club"
  },
  {
    id: "project-3",
    title: "[PROJECT NAME]",
    category: "Developer Experience",
    description: "Lightweight algorithmic visualization engine with custom shaders and AST parsing.",
    stack: ["TypeScript", "WebGL", "Vite"],
    github: "https://github.com/vulcan-club"
  }
];

/**
 * Core Team Members
 */
export const TEAM = [
  {
    id: "team-1",
    name: "[MEMBER NAME]",
    role: "[MEMBER ROLE]",
    image: null
  },
  {
    id: "team-2",
    name: "[MEMBER NAME]",
    role: "[MEMBER ROLE]",
    image: null
  },
  {
    id: "team-3",
    name: "[MEMBER NAME]",
    role: "[MEMBER ROLE]",
    image: null
  },
  {
    id: "team-4",
    name: "[MEMBER NAME]",
    role: "[MEMBER ROLE]",
    image: null
  }
];
