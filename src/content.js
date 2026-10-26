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
    flowTitle: "Translation Pipeline Flow",
    flowSteps: [
      { id: 1, title: "Editor clicks Translate", sub: "Field-level UI trigger" },
      { id: 2, title: "Drupal AI Core & provider", sub: "Dispatches to LLM / service" },
      { id: 3, title: "Diff preview appears", sub: "Side-by-side comparison" },
      { id: 4, title: "Editor applies translation", sub: "Populates field or CKEditor 5" },
    ],
    flow: [
      "Editor clicks Translate",
      "Request goes through Drupal AI Core to a provider",
      "Diff preview appears",
      "Editor applies the translation",
    ],
  },
  {
    id: "matiks",
    number: "02",
    tag: "Full-Stack & Real-Time Web",
    title: "Matiks",
    summary: "An interactive math, logic, and arcade gaming platform featuring real-time multiplayer duels, WebRTC audio/video mesh calling, Socket.IO live notifications, and daily challenge automation.",
    stack: ["Node.js", "Express 5", "MongoDB", "Socket.IO", "WebRTC"],
    status: "Live on Render · Active deployment",
    credit: "Built by Jhalak Yadav · Collab with Padmasri Chikle",
    isPlaceholder: false,
    links: [
      {
        label: "Live deployment",
        url: "https://matiks-7ptu.onrender.com/",
        primary: true,
      },
      {
        label: "GitHub repository",
        url: "https://github.com/padmasri-web/Matiks",
        primary: false,
      },
    ],
    built: [
      "Multiplayer Group Play: Real-time lobby rooms with 6-character room codes, 4-player capacity, and active game carousel.",
      "WebRTC Audio/Video Mesh: Peer-to-peer in-game video and audio calling with draggable, touch-supported modal overlays.",
      "Socket.IO Live Gateway: Real-time notifications, instant social feed broadcaster, and bidirectional friend requests.",
      "Logic & Puzzle Suite: Interactive Lights Out, Memory Match, Sudoku with time-penalized scoring, and Canvas Snake.",
      "Minimax & Rule AI: Intelligent rule-based computer bot with threat blocking, winning-move detection, and center priority.",
      "Auth & Automation: PBKDF2 salted hash encryption, session cookies, and automated midnight challenge resets via Node-Cron.",
    ],
    flowTitle: "Multiplayer Duel Pipeline Flow",
    flowSteps: [
      { id: 1, title: "Lobby Room Creation", sub: "6-character join code match" },
      { id: 2, title: "WebRTC Peer Handshake", sub: "Mesh video & audio streaming" },
      { id: 3, title: "Socket.IO Move Sync", sub: "Real-time state & timer exchange" },
      { id: 4, title: "Rating & XP Finalization", sub: "PBKDF2 profile scoring update" },
    ],
    flow: [
      "Lobby Room Creation",
      "WebRTC Peer Handshake",
      "Socket.IO Move Sync",
      "Rating & XP Finalization",
    ],
  },
  {
    id: "vision-football",
    number: "03",
    tag: "Computer Vision & Game Dev",
    title: "Vision Football",
    summary: "A Kinect-style real-time computer vision penalty shootout game using MediaPipe and OpenCV for optical motion tracking, leg-swing kick velocity detection, and dynamic goalkeeper glove physics.",
    stack: ["Python", "MediaPipe", "OpenCV", "Pygame", "JavaScript", "HTML5 Canvas"],
    status: "Open Source · Available on GitHub",
    credit: "Built by Krishna Negi",
    isPlaceholder: false,
    links: [
      {
        label: "GitHub repository",
        url: "https://github.com/WKr1shna/football1",
        primary: true,
      },
    ],
    built: [
      "Dual Gameplay Modes: Striker mode tracking leg-swing velocity & directional angle, and Goalkeeper mode with real-time wrist and glove collision detection.",
      "MediaPipe Optical Tracking: Markerless webcam body and hand tracking measuring swing speed, ankle displacement, and relative reach.",
      "3D Quadratic Physics Arc: Realistic trajectory engine calculating curve, shot height, speed falloff, and crossbar/net boundary collisions.",
      "AI Goalkeeper & Prediction: KNN-assisted trajectory predictor anticipating shot directions and difficulty-scaled AI reaction dives.",
      "Cross-Platform Architecture: Native Python/Pygame desktop application paired with an in-browser HTML5 Canvas and MediaPipe JS version.",
      "Calibration & Replay Suite: Interactive T-pose calibration routine, slow-motion neon skeletal replays, and procedural audio synthesis fallbacks.",
    ],
    flowTitle: "Vision Tracking & Shootout Pipeline Flow",
    flowSteps: [
      { id: 1, title: "T-Pose Camera Calibration", sub: "Calculates body proportions & depth" },
      { id: 2, title: "Optical Motion Detection", sub: "MediaPipe tracks leg swing & wrist reach" },
      { id: 3, title: "3D Quadratic Physics Arc", sub: "Simulates ball velocity & curve to goal" },
      { id: 4, title: "Collision & Score Evaluation", sub: "KNN prediction, saves & leaderboard log" },
    ],
    flow: [
      "T-Pose Camera Calibration",
      "Optical Motion Detection",
      "3D Quadratic Physics Arc",
      "Collision & Score Evaluation",
    ],
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
    role: "Development / GSoC'26",
    image: "/assets/team/sapnil.jpg",
    links: {
      github: "https://github.com/sapnilbiswas",
      linkedin: "https://www.linkedin.com/in/sapnil-biswas-992841403/"
    }
  },
  {
    id: "team-5",
    name: "Dhruvesh Mishra",
    role: "Development / LFX'26",
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
      codeforces: "https://codeforces.com/profile/rvkeerthi999"
    }
  }
];
