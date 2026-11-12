/**
 * Vulcan Club Enrollment 2026 — Configuration
 * 
 * Central source of truth for routing, public visibility, copy, and form parameters.
 */

// 1. ROUTING CONFIGURATION
// The unlisted preview URL. Change here to instantly move the hidden route.
export const ENROLLMENT_ROUTE = '/enroll-2026-preview';

// The public route (used once enrollment officially opens).
export const ENROLLMENT_PUBLIC_ROUTE = '/enroll';

// Toggle to go public. When false, only ENROLLMENT_ROUTE is active.
// When true, ENROLLMENT_PUBLIC_ROUTE is also enabled and can be linked in the nav.
export const ENROLLMENT_PUBLIC = false;

/**
 * Route matching helper used by main router.
 * @param {string} pathname 
 * @returns {boolean}
 */
export function isEnrollmentRoute(pathname) {
  if (!pathname) return false;
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  
  if (clean === ENROLLMENT_ROUTE.toLowerCase()) return true;
  if (ENROLLMENT_PUBLIC && clean === ENROLLMENT_PUBLIC_ROUTE.toLowerCase()) return true;
  
  // Also accept clean variations of the preview route
  if (clean === '/enroll-2026' || clean === '/enrollment-2026-preview') return true;

  return false;
}

// 2. DOMAIN OPTIONS & DESCRIPTIONS
export const ENROLLMENT_DOMAINS = [
  {
    id: 'Web Dev',
    label: 'Web Dev',
    tagline: 'Full-Stack Systems & Architecture',
    description: 'React, Next.js, Node.js, distributed backends, performance, and UI engineering.',
    icon: 'code',
  },
  {
    id: 'DSA',
    label: 'DSA',
    tagline: 'Competitive Programming & Algorithms',
    description: 'Graph theory, dynamic programming, algorithmic contests, and speed problem solving.',
    icon: 'brain',
  },
  {
    id: 'PR',
    label: 'PR',
    tagline: 'Design, Outreach & Hackathon Operations',
    description: 'Visual identity, branding, community management, partner relations, and event direction.',
    icon: 'megaphone',
  },
];

// 3. CLASS / BATCH OPTIONS
export const ENROLLMENT_CLASSES = [
  {
    id: 'Class of 2029',
    label: 'Class of 2029',
    sublabel: '2nd Year / Sophomore Forge',
  },
  {
    id: 'Class of 2030',
    label: 'Class of 2030',
    sublabel: '1st Year / Freshmen Intake',
  },
];

// 4. COPY & BRANDING
export const ENROLLMENT_COPY = {
  badge: 'VULCAN CLUB • INTAKE 2026',
  welcomeHeadline: 'Welcome to Vulcan Club Enrollment 2026',
  welcomeNote: 'We forge software from first principles. Here, raw curiosity is tempered into production engineering, open-source contribution, and competitive mastery. Step into the heat.',
  ctaBegin: 'Begin Your Forging',
  forgingStatus: 'FORGE ACTIVE • CALIBRATING TEMPER',
  successHeadline: "YOU'RE IN THE FIRE NOW.",
  successSub: 'Your application has been struck into the Vulcan ledger. Our leads will review your answers and notify you of the technical onboarding round.',
  characterLimits: {
    whyMin: 30,
    whyMax: 500,
  }
};

