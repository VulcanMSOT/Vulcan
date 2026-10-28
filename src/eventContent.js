/**
 * Hack-O-Lantern — event copy source of truth.
 * Verified and confirmed from official Hack-O-Lantern poster and user specifications.
 */
export const EVENT_CONTENT = {
  route: '/halloween-hack',
  host: 'Vulcan Club',
  name: 'Hack-O-Lantern',
  label: 'A Halloween overnight hackathon',
  heroSubtitle: 'A Halloween hackathon with quests and surprises during the build.',
  heroTags: ['16 hours', 'Quests', 'Surprises'],

  // Confirmed: 31 October 2026, 7:00 PM Asia/Kolkata (13:30 UTC) to 1 November 2026, 11:00 AM Asia/Kolkata (05:30 UTC)
  startIso: '2026-10-31T13:30:00.000Z',
  endIso: '2026-11-01T05:30:00.000Z',
  registrationDeadlineIso: '2026-10-30T18:29:59.000Z',
  dateLabel: '31 October, 7:00 PM',
  durationLabel: '16 hours',
  teamLabel: 'Teams of 3',
  entryLabel: `₹${typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_EVENT_AMOUNT ? process.env.NEXT_PUBLIC_EVENT_AMOUNT : (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_EVENT_AMOUNT || import.meta.env?.NEXT_PUBLIC_EVENT_AMOUNT)) || 300} per team`,
  registrationFee: Number((typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_EVENT_AMOUNT) || (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_EVENT_AMOUNT || import.meta.env?.NEXT_PUBLIC_EVENT_AMOUNT)) || 300),
  venue: 'Mirai Floor, Mirai School of Technology, Bengaluru',
  venueAddress: 'Bengaluru, Karnataka',
  collegeName: 'Mirai School of Technology',
  coPresenter: 'Mirai School of Technology',
  firstPrize: '₹4,000',
  secondPrize: '₹3,000',
  thirdPrize: '₹2,000',
  prizePool: '₹9,000',
  prizes: '₹9,000 prize pool (1st: ₹4,000 · 2nd: ₹3,000 · 3rd: ₹2,000)',
  tagline: 'Build through the night. Ship before sunrise.',
  subtagline: 'Code / Create / Celebrate',
  eligibility: 'Teams of exactly 3 members.',
  themes: '',
  themesReveal: 'The themes will be revealed at the start of the event.',
  rules: 'Bring your laptop, charger, student ID, and your sharpest ideas. Teams must consist of exactly 3 members. All code must be written during the build window.',
  schedule: '[SCHEDULE]',

  // Experience & Quests Content (sealed details)
  experienceHeading: 'A Halloween hackathon.',
  experienceLead: 'Teams of 3. Quests and surprises along the way.',
  questRules: '[QUEST RULES]',
  howQuestsWork: '[HOW QUESTS WORK]',
  questRewards: '[QUEST REWARDS]',
  surpriseHint1: '[SURPRISE HINT 1]',
  surpriseHint2: '[SURPRISE HINT 2]',

  contactEmail: 'vulcan.techclub@gmail.com',
  contactPhone: '+91 79935 21335',
  registrationDeadline: '30 October 2026, 11:59 PM IST',
  privacyNote: 'Vulcan Club and Mirai School of Technology respect your privacy. Team details are used exclusively for hackathon credentials, ticketing, and event communications.',
  aboutLead: 'Vulcan Club and Mirai School of Technology present Hack-O-Lantern, an overnight Halloween hackathon.',
  about:
    `Teams of exactly 3 will build overnight from 7:00 PM on 31 October to 11:00 AM on 1 November. Quests and surprises along the way. Themes will be revealed at the start. Registration is ₹${(typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_EVENT_AMOUNT) || (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_EVENT_AMOUNT || import.meta.env?.NEXT_PUBLIC_EVENT_AMOUNT)) || 300} per team.`,
};
