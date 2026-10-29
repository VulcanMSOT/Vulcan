import { useEffect, useMemo, useRef, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';

const fixedTimeline = [
  { time: '7:00 PM', title: 'Doors open & entry', detail: 'Check-in, ticket verification, and team workspace setup.', isSealed: false },
  { time: '8:00 PM', title: 'Hackathon starts & Quests revealed', detail: 'Opening ceremony, problem statements revealed, and quest board unlocked.', isSealed: false },
  { time: '11:00 PM', title: '??? Surprise', detail: 'We are not telling you just yet. That is the point.', isSealed: true },
  { time: '9:00 AM', title: 'Judging starts', detail: 'Code freeze, project evaluations, demos, and presentations begin.', isSealed: false },
  { time: '11:00 AM', title: 'Hackathon ends', detail: 'Final showcases, closing ceremony, and winners announced.', isSealed: false },
];

const knownFaqs = [
  ['What are the quests?', `Quests run during the event and are revealed then. ${EVENT_CONTENT.questRules}`],
  ['Are there surprises?', 'Yes. We are keeping them secret.'],
  ['Is it only a hackathon?', 'No. It is a Halloween experience, with quests and surprises along with the build.'],
  ['How long is it?', '16 hours, from 7:00 PM on 31 October to 11:00 AM on 1 November.'],
  ['How big is a team?', 'Teams of 2 to 3 members.'],
  ['What does it cost?', `${EVENT_CONTENT.entryLabel}.`],
  ['Where is it held?', 'Mirai Floor, Mirai School of Technology, Bengaluru.'],
  ['How do I get in?', 'Show your registration ticket QR code at the entrance.'],
];

function isEmpty(value) {
  return !value || !value.trim();
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`event-reveal ${isRevealed ? 'is-revealed' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function EventAbout() {
  return (
    <section className="event-section event-about" id="about" aria-labelledby="about-title">
      <div className="event-section-inner event-about__inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">About the hackathon</p>
          <h2 id="about-title">A night to build.</h2>
        </Reveal>
        <div className="event-about__body">
          <Reveal>
            <p className="event-about__lead">
              Vulcan Club and {EVENT_CONTENT.collegeName} present {EVENT_CONTENT.name}, an overnight Halloween hackathon for teams of 2 to 3. {EVENT_CONTENT.tagline}
            </p>
          </Reveal>
          <Reveal>
            <ul className="event-about__facts" aria-label="Key event facts">
              <li>
                <span className="event-about__fact-label">Date</span>
                <strong className="event-about__fact-value">{EVENT_CONTENT.dateLabel}</strong>
              </li>
              <li>
                <span className="event-about__fact-label">Duration</span>
                <strong className="event-about__fact-value">{EVENT_CONTENT.durationLabel}</strong>
              </li>
              <li>
                <span className="event-about__fact-label">Team Size</span>
                <strong className="event-about__fact-value">{EVENT_CONTENT.teamLabel}</strong>
              </li>
              <li>
                <span className="event-about__fact-label">Entry</span>
                <strong className="event-about__fact-value">{EVENT_CONTENT.entryLabel}</strong>
              </li>
            </ul>
          </Reveal>
          <Reveal>
            <p className="event-about__subtext">{EVENT_CONTENT.themesReveal} Venue: {EVENT_CONTENT.venue}.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SealedCard({ title, description, placeholder, isOpen = false }) {
  const [shaking, setShaking] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const cardRef = useRef(null);

  const triggerLocked = () => {
    if (isOpen) return;
    setShaking(true);
    setShowTooltip(true);
    setTimeout(() => setShaking(false), 350);
    setTimeout(() => setShowTooltip(false), 1800);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / (rect.height / 2)) * 6,
      ry: (x / (rect.width / 2)) * 6,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <article
      ref={cardRef}
      className={`event-sealed-card ${isOpen ? 'event-sealed-card--open' : 'event-sealed-card--locked'} ${shaking ? 'is-locked-shake' : ''}`}
      onClick={triggerLocked}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerLocked();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      tabIndex={isOpen ? -1 : 0}
      role={isOpen ? 'article' : 'button'}
      aria-label={isOpen ? title : `Sealed: ${title}. Revealed during the event.`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      <div className="event-sealed-card__badge" aria-hidden="true">
        {isOpen ? (
          <span className="event-badge-open">✦ Open</span>
        ) : (
          <span className="event-badge-sealed">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm3 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
            </svg>
            Sealed
          </span>
        )}
      </div>

      <div className="event-sealed-card__seal-glow" aria-hidden="true" />

      <h3>{title}</h3>
      <p>{description}</p>
      {placeholder && <p className="event-placeholder-copy">{placeholder}</p>}

      {showTooltip && (
        <div className="event-locked-tooltip" role="tooltip">
          <span>Not yet.</span>
        </div>
      )}
    </article>
  );
}

function QuestBoardTeaser() {
  const [lockedIdx, setLockedIdx] = useState(null);

  const quests = [
    { id: '01', label: 'Quest 01' },
    { id: '02', label: 'Quest 02' },
    { id: '03', label: 'Quest 03' },
    { id: '04', label: 'Quest 04' },
    { id: '05', label: 'Quest 05' },
    { id: '06', label: 'Quest 06' },
  ];

  const handleLocked = (idx) => {
    setLockedIdx(idx);
    setTimeout(() => setLockedIdx(null), 1600);
  };

  return (
    <div className="event-quest-board">
      <div className="event-quest-scrolls" role="list" aria-label="Quest board preview">
        {quests.map((q, idx) => (
          <div
            key={q.id}
            className={`event-quest-scroll ${lockedIdx === idx ? 'is-locked-shake' : ''}`}
            role="listitem"
            tabIndex={0}
            onClick={() => handleLocked(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLocked(idx);
              }
            }}
            aria-label={`${q.label}: sealed until event`}
          >
            <div className="event-quest-scroll__header">
              <span className="event-quest-scroll__id">{q.label}</span>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm3 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
              </svg>
            </div>
            <div className="event-quest-redacted" aria-hidden="true">
              <span style={{ width: '82%' }} />
              <span style={{ width: '64%' }} />
              <span style={{ width: '48%' }} />
            </div>
            {lockedIdx === idx && (
              <span className="event-quest-scroll__tooltip" role="status">Not yet.</span>
            )}
          </div>
        ))}
      </div>
      <p className="event-quest-note">Quests are revealed during the event.</p>
    </div>
  );
}

export function EventExperience() {
  const hasRealHints = EVENT_CONTENT.surpriseHint1 && !EVENT_CONTENT.surpriseHint1.startsWith('[');

  return (
    <section className="event-section event-experience" id="experience" aria-labelledby="experience-title">
      <div className="event-section-inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">The Experience</p>
          <h2 id="experience-title">{EVENT_CONTENT.experienceHeading}</h2>
          <p>{EVENT_CONTENT.experienceLead}</p>
        </Reveal>

        <Reveal>
          <div className="event-experience-cards">
            <SealedCard
              title="Quests"
              description="Lots of them. Details are revealed during the event."
              placeholder={EVENT_CONTENT.howQuestsWork}
              isOpen={false}
            />
            <SealedCard
              title="Surprises"
              description="We are not telling you. That is the point."
              isOpen={false}
            />
            <SealedCard
              title="The build"
              description="16 hours, teams of 3, and the Halloween theme."
              isOpen={true}
            />
          </div>
        </Reveal>

        <Reveal>
          <QuestBoardTeaser />
        </Reveal>

        {hasRealHints && (
          <div className="event-whisper-strip" aria-live="polite">
            <span className="event-whisper-label">Whisper</span>
            <span className="event-whisper-text">{EVENT_CONTENT.surpriseHint1}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export function EventTimeline() {
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef(null);

  useEffect(() => {
    const updateProgress = () => {
      const element = timelineRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      setProgress(Math.min(1, Math.max(0, (viewportHeight - rect.top) / (rect.height + viewportHeight * 0.35))));
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <section className="event-section event-timeline" id="timeline" aria-labelledby="timeline-title">
      <div className="event-section-inner event-timeline__inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">Schedule & milestones</p>
          <h2 id="timeline-title">When the clock turns.</h2>
        </Reveal>
        <div className="event-timeline__track" ref={timelineRef}>
          <div className="event-timeline__line" style={{ transform: `scaleY(${progress})` }} aria-hidden="true" />
          <ol>
            {fixedTimeline.map((entry) => (
              <li
                key={`${entry.time}-${entry.title}`}
                className={entry.isSealed ? 'event-timeline__item--sealed' : ''}
              >
                <time className={entry.isSealed ? 'event-timeline__time--sealed' : ''}>
                  {entry.isSealed && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true" style={{ marginRight: 6 }}>
                      <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm3 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                    </svg>
                  )}
                  {entry.time}
                </time>
                <div>
                  <h3>{entry.title}</h3>
                  <p>{entry.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export const JUDGES_DATA = [
  {
    name: 'Naman Batra',
    role: 'Product Manager',
    company: 'Dell EMC',
    companyBadge: 'Dell Technologies',
    photo: '/assets/judges/naman-batra.jpg',
    linkedin: 'https://www.linkedin.com/in/naman-batra-493116123/',
    headline: 'Driving Product Operations Efficiency',
    bio: 'Product leader at Dell EMC leading product operations, cross-functional engineering delivery, and agile product strategy for enterprise systems.',
    skills: ['Product Operations', 'Agile Delivery', 'Enterprise Scale', 'Cross-Functional Strategy'],
  },
  {
    name: 'Satyam Kumar',
    role: 'Senior Software Engineer',
    company: 'AMD · Ex-Samsung',
    companyBadge: 'AMD / Ex-Samsung',
    photo: '/assets/judges/satyam-kumar.jpg',
    linkedin: 'https://www.linkedin.com/in/satyam-kumar-cpp/',
    headline: 'C++ · Distributed Systems · Low Latency',
    bio: 'High-performance systems engineer with proven industry track record at AMD and Samsung. Expert in distributed computing, low-latency C++, multithreading, and backend systems.',
    skills: ['Distributed Systems', 'Low Latency', 'C++ / STL', 'Multithreading', 'Backend Architecture'],
  },
  {
    name: 'Pratyanch Gor',
    role: '0 to 1 Product Leader',
    company: 'Product Leadership',
    companyBadge: 'Product Strategy',
    photo: '/assets/judges/pratyanch-gor.jpg',
    linkedin: 'https://www.linkedin.com/in/pratyanch-gor/',
    headline: 'Scaling 10x Growth & Launching Market-Leading Products',
    bio: 'Strategic product builder focused on taking ideas from 0 to 1, accelerating 10x scale through agile frameworks, customer satisfaction, and launching market-defining platforms.',
    skills: ['0-to-1 Products', '10x Growth Scaling', 'Agile Frameworks', 'Market Launch', 'User Experience'],
  },
];

export function EventJudges() {
  return (
    <section className="event-section event-judges" id="judges" aria-labelledby="judges-title">
      <div className="event-section-inner">
        <Reveal className="event-section__heading event-judges__heading">
          <div className="event-judges__kicker-row">
            <p className="event-mono-kicker">Industry Mentors & Judges</p>
            <span className="event-judges__kicker-pill">Meet · Learn · Get Inspired</span>
          </div>
          <h2 id="judges-title">Judged by industry veterans.</h2>
          <p className="event-judges__lead">
            Pitch your ideas, demo live code, and receive direct evaluation from engineering and product specialists across <strong>Dell</strong>, <strong>AMD</strong>, <strong>Samsung</strong>, and top-tier product leadership.
          </p>
        </Reveal>

        <div className="event-judges__grid">
          {JUDGES_DATA.map((judge) => (
            <Reveal key={judge.name} className="event-judges__col">
              <article className="event-judges__card">
                <div className="event-judges__card-ambient" aria-hidden="true" />
                
                <div className="event-judges__card-header">
                  <span className="event-judges__badge">
                    {judge.companyBadge}
                  </span>
                  <a
                    href={judge.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-judges__linkedin-btn"
                    title={`View ${judge.name}'s LinkedIn Profile`}
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    <span>LinkedIn ↗</span>
                  </a>
                </div>

                <div className="event-judges__profile">
                  <div className="event-judges__avatar-frame">
                    <img
                      src={judge.photo}
                      alt={judge.name}
                      width="96"
                      height="96"
                      className="event-judges__avatar-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="event-judges__meta">
                    <h3 className="event-judges__name">{judge.name}</h3>
                    <p className="event-judges__role">{judge.role}</p>
                    <p className="event-judges__company">{judge.company}</p>
                  </div>
                </div>

                <div className="event-judges__headline-quote">
                  <p>"{judge.headline}"</p>
                </div>

                <p className="event-judges__bio">{judge.bio}</p>

                <div className="event-judges__tags">
                  {judge.skills.map((skill) => (
                    <span key={skill} className="event-judges__tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="event-judges__strip">
          <div className="event-judges__strip-inner">
            <span className="event-judges__strip-star">★</span>
            <p className="event-judges__strip-text">
              <strong>Great Minds. Real Impact.</strong> Mentors will guide team architectures during the overnight build and lead final scoring during the 9:00 AM demo showcase.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function EventTracks() {
  const tracks = EVENT_CONTENT.themes ? EVENT_CONTENT.themes.split('|').map((track) => track.trim()).filter(Boolean) : [];

  return (
    <section className="event-section event-tracks" id="tracks" aria-labelledby="tracks-title">
      <div className="event-section-inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">Tracks & categories</p>
          <h2 id="tracks-title">What will you build?</h2>
          <p>{EVENT_CONTENT.themesReveal}</p>
        </Reveal>
        {tracks.length > 0 ? (
          <div className="event-track-list">
            {tracks.map((track) => (
              <Reveal key={track} className="event-track-wrap">
                <article className="event-track"><h3>{track}</h3></article>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="event-tracks__reveal">
            <p>The brief arrives with the opening. Bring your sharpest ideas.</p>
            <span aria-hidden="true">?</span>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function EventRules() {
  const items = [
    ['Rules', EVENT_CONTENT.rules],
    ['Eligibility', EVENT_CONTENT.eligibility],
  ];
  return (
    <section className="event-section event-rules" id="rules" aria-labelledby="rules-title">
      <div className="event-section-inner event-rules__inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">Guidelines</p>
          <h2 id="rules-title">Before the doors open.</h2>
        </Reveal>
        <div className="event-accordion">
          {items.map(([label, value]) => (
            <details key={label}>
              <summary>
                <span>{label}</span>
                <span className="event-accordion__icon" aria-hidden="true">+</span>
              </summary>
              <p>{value}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * REWARDS CONFIGURATION (1st, 2nd, 3rd Places)
 * 1st: ₹4,000 | 2nd: ₹3,000 | 3rd: ₹2,000 | Total Pool: ₹9,000
 */
export const REWARDS_CONFIG = {
  eyebrow: 'Prize Pool',
  heading: '₹9,000 at stake.',
  summary: 'Compete across 16 hours of overnight hacking to claim your podium spot.',
  tiers: [
    {
      id: 'first',
      place: '1st',
      rank: '1ST PLACE',
      badge: 'CHAMPIONS',
      icon: 'trophy',
      amount: EVENT_CONTENT.firstPrize || '₹4,000',
      label: 'Winner',
      subtext: 'Cash prize',
      description: 'Awarded to the overall winning team of Hack-O-Lantern with the highest combined judge evaluation.',
      variant: 'gold',
      perks: [
        '₹4,000 Cash Prize',
        'Winner Certificate of Excellence',
        'Exclusive Vulcan Trophy & Swag',
        'Direct Industry Mentor Connect',
      ],
    },
    {
      id: 'second',
      place: '2nd',
      rank: '2ND PLACE',
      badge: 'RUNNER UP',
      icon: 'medal',
      amount: EVENT_CONTENT.secondPrize || '₹3,000',
      label: '1st Runner Up',
      subtext: 'Cash prize',
      description: 'Awarded to the second-place team demonstrating outstanding technical craft and execution.',
      variant: 'silver',
      perks: [
        '₹3,000 Cash Prize',
        'Runner Up Certificate',
        'Vulcan Swag Pack',
        'Spotlight on Vulcan Channels',
      ],
    },
    {
      id: 'third',
      place: '3rd',
      rank: '3RD PLACE',
      badge: '2ND RUNNER UP',
      icon: 'award',
      amount: EVENT_CONTENT.thirdPrize || '₹2,000',
      label: '2nd Runner Up',
      subtext: 'Cash prize',
      description: 'Awarded to the third-place team showing creative ingenuity and impactful product design.',
      variant: 'bronze',
      perks: [
        '₹2,000 Cash Prize',
        'Podium Certificate',
        'Vulcan Swag Pack',
        'Project Showcase',
      ],
    },
  ],
  // Backwards compatibility
  hero: {
    badge: '1ST PLACE',
    label: 'FIRST PRIZE',
    amount: EVENT_CONTENT.firstPrize || '₹4,000',
    subtext: 'for 1st place',
    description: 'The premier prize awarded to the winning team of Hack-O-Lantern.',
  },
};

function RewardIcon({ name, className = '' }) {
  if (name === 'trophy') {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    );
  }
  if (name === 'medal') {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
        <path d="M11 12 5.12 2.2" />
        <path d="m13 12 5.88-9.8" />
        <circle cx="12" cy="17" r="5" />
      </svg>
    );
  }
  if (name === 'award') {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    );
  }
  return null;
}

export function PrizeCard({ tier, isPrimary = false }) {
  return (
    <div className={`event-prizes__card event-prizes__card--${tier.variant} ${isPrimary ? 'event-prizes__card--featured' : ''}`}>
      <div className={`event-prizes__card-ambient event-prizes__card-ambient--${tier.variant}`} aria-hidden="true" />
      {isPrimary && <div className="event-prizes__hero-glow" aria-hidden="true" />}

      <div className="event-prizes__card-main">
        <div className="event-prizes__card-top">
          <div className={`event-prizes__card-badge event-prizes__card-badge--${tier.variant}`}>
            <RewardIcon name={tier.icon} />
            <span>{tier.rank}</span>
          </div>
          <span className={`event-prizes__card-tag event-prizes__card-tag--${tier.variant}`}>{tier.badge}</span>
        </div>

        <div className="event-prizes__card-header">
          <span className={`event-prizes__card-label event-prizes__card-label--${tier.variant}`}>{tier.label}</span>
          <div className="event-prizes__card-figure">
            <span className={`event-prizes__card-amount event-prizes__card-amount--${tier.variant}`}>
              {tier.amount}
            </span>
            <span className="event-prizes__card-subtext">{tier.subtext}</span>
          </div>
        </div>

        <p className="event-prizes__card-desc">{tier.description}</p>
      </div>

      <ul className="event-prizes__card-perks" aria-label={`Perks for ${tier.rank}`}>
        {tier.perks.map((perk) => (
          <li key={perk}>
            <span className={`event-prizes__perk-check event-prizes__perk-check--${tier.variant}`} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PrizeHero({ hero }) {
  return (
    <div className="event-prizes__hero-card event-prizes__hero-card--single">
      <div className="event-prizes__hero-ambient" aria-hidden="true" />
      <div className="event-prizes__hero-glow" aria-hidden="true" />

      <div>
        <div className="event-prizes__hero-badge">
          <RewardIcon name="trophy" />
          <span>{hero.badge}</span>
        </div>

        <div className="event-prizes__hero-header">
          <span className="event-prizes__hero-label">{hero.label}</span>
          <div className="event-prizes__hero-figure">
            <span className="event-prizes__hero-amount">{hero.amount}</span>
            <span className="event-prizes__hero-subtext">{hero.subtext}</span>
          </div>
        </div>

        <p className="event-prizes__hero-desc">{hero.description}</p>
      </div>
    </div>
  );
}

export function EventPrizes() {
  const { eyebrow, heading, summary, tiers } = REWARDS_CONFIG;
  return (
    <section className="event-section event-prizes" id="prizes" aria-labelledby="prizes-title">
      <div className="event-section-inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">{eyebrow}</p>
          <h2 id="prizes-title">{heading}</h2>
          {summary && <p className="event-lead" style={{ marginTop: '10px' }}>{summary}</p>}
        </Reveal>

        <Reveal className="event-prizes__grid-wrapper" delay={120}>
          <div className="event-prizes__grid">
            {tiers.map((tier, idx) => (
              <PrizeCard key={tier.id} tier={tier} isPrimary={idx === 0} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function EventFaq() {
  return (
    <section className="event-section event-faq" id="faq" aria-labelledby="faq-title">
      <div className="event-section-inner event-faq__inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">FAQ</p>
          <h2 id="faq-title">A few clear answers.</h2>
        </Reveal>
        <div className="event-faq__list">
          {knownFaqs.map(([question, answer]) => (
            <div key={question} className="event-faq__item">
              <strong>{question}</strong>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EventFooter() {
  return (
    <footer className="event-footer">
      <div className="event-section-inner event-footer__inner">
        <div className="event-footer__col">
          <a href="/" className="event-wordmark" aria-label="Back to the Vulcan Club main site">
            <img src="/assets/vulcan-logo.png" alt="" />
            <span>vulcan club</span>
          </a>
          <p className="event-footer__tagline">Engineering craft · Autonomous systems · Creative computing</p>
        </div>
        <div className="event-footer__col">
          <span className="event-mono-kicker">Contact</span>
          <p>
            <a href={`mailto:${EVENT_CONTENT.contactEmail}`} className="event-footer__contact-link">
              {EVENT_CONTENT.contactEmail}
            </a>
          </p>
          <p>
            <a href={`tel:${EVENT_CONTENT.contactPhone.replace(/\s+/g, '')}`} className="event-footer__contact-link">
              {EVENT_CONTENT.contactPhone}
            </a>
          </p>
        </div>
        <div className="event-footer__col event-footer__col--end">
          <a href="/" className="event-footer__backlink">Back to the main Vulcan site <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </footer>
  );
}
