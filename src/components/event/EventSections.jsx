import { useEffect, useMemo, useRef, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';

const fixedTimeline = [
  { time: '7:00 PM', title: 'Opening ceremony', detail: 'The challenge is revealed and the 12-hour build begins.', isSealed: false },
  { time: '???', title: '??? Quest', detail: 'Hidden until the build begins.', isSealed: true },
  { time: '???', title: '??? Surprise', detail: 'We are not telling you. That is the point.', isSealed: true },
  { time: '7:00 AM', title: 'Hackathon ends', detail: 'The overnight build window concludes. Demos and awards begin.', isSealed: false },
];

const knownFaqs = [
  ['What are the quests?', `Quests run during the event and are revealed then. ${EVENT_CONTENT.questRules}`],
  ['Are there surprises?', 'Yes. We are keeping them secret.'],
  ['Is it only a hackathon?', 'No. It is a Halloween experience, with quests and surprises along with the build.'],
  ['How long is it?', '12 hours, from 7:00 PM on 31 October to 7:00 AM on 1 November.'],
  ['How big is a team?', 'Teams of exactly 3 members.'],
  ['What does it cost?', '₹300 per team.'],
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
              Vulcan Club and {EVENT_CONTENT.collegeName} present {EVENT_CONTENT.name}, an overnight Halloween hackathon for teams of exactly three. {EVENT_CONTENT.tagline}
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
              description="12 hours, teams of 3, and the Halloween theme."
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
 * REWARDS CONFIGURATION (Data-Driven Source of Truth)
 * Edit this array to update prize values, titles, and descriptions.
 * Placeholders are marked with isTba: true.
 */
export const REWARDS_CONFIG = {
  eyebrow: 'Rewards',
  heading: 'What is at stake.',
  hero: {
    badge: '1ST PLACE · GRAND CHAMPION',
    label: 'PRIZE POOL',
    amount: '₹10,000',
    subtext: 'for 1st place',
    description: 'Awarded to the highest-scoring hackathon team across technical craft, challenge execution, and overnight demo polish.',
    perks: [
      '₹10,000 Cash Pool for 1st place',
      'Hack-O-Lantern Champion Trophy',
      'Official Winner Certificates & Title',
      'Featured team spotlight on Vulcan MSOT',
    ],
  },
  secondary: [
    {
      id: 'second-place',
      badge: '2ND PLACE',
      title: 'Runner Up',
      value: '₹TBA', // [PLACEHOLDER] Replace with confirmed cash/reward value
      isTba: true,
      description: 'Awarded to the first runner-up team delivering standout architecture, reliability, and code execution.',
      perk: 'Runner-up trophy + Verified certificates',
      icon: 'medal',
    },
    {
      id: 'third-place',
      badge: '3RD PLACE',
      title: 'Second Runner Up',
      value: '₹TBA', // [PLACEHOLDER] Replace with confirmed cash/reward value
      isTba: true,
      description: 'Awarded for exceptional product creativity, original design thinking, and overnight persistence.',
      perk: 'Podium certificate + Special mentions',
      icon: 'award',
    },
    {
      id: 'all-participants',
      badge: 'EVERY HACKER',
      title: 'All Participants',
      value: 'Swag & Certificates', // [PLACEHOLDER] Replace with confirmed perks
      isTba: false,
      description: 'Every team that builds through the 12 hours earns official credentials and exclusive midnight event drops.',
      perk: 'Official participation pass + Vulcan sticker pack',
      icon: 'sparkles',
    },
  ],
};

function RewardIcon({ name, className = '' }) {
  if (name === 'trophy') {
    return (
      <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <path d="m15.5 8.5-3.5 3.5-3.5-3.5" />
        <path d="M7 21h10" />
        <circle cx="12" cy="8" r="6" />
        <path d="M8.21 13.89 7 21l5-2 5 2-1.21-7.11" />
      </svg>
    );
  }
  if (name === 'award') {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      </svg>
    );
  }
  if (name === 'sparkles' || name === 'gift') {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    );
  }
  if (name === 'check') {
    return (
      <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return null;
}

export function PrizeHero({ hero }) {
  return (
    <div className="event-prizes__hero-card">
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

      {hero.perks && hero.perks.length > 0 && (
        <ul className="event-prizes__hero-perks" aria-label="Grand prize inclusions">
          {hero.perks.map((perk, i) => (
            <li key={i}>
              <span className="event-prizes__hero-perk-icon">
                <RewardIcon name="check" />
              </span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RewardCard({ item }) {
  return (
    <div className="event-prizes__secondary-card">
      <div className="event-prizes__secondary-head">
        <div className="event-prizes__secondary-icon" aria-hidden="true">
          <RewardIcon name={item.icon} />
        </div>
        <div className="event-prizes__secondary-meta">
          <span className="event-prizes__secondary-badge">{item.badge}</span>
          <h3 className="event-prizes__secondary-title">{item.title}</h3>
        </div>
        <div className="event-prizes__secondary-value-box">
          <span className={`event-prizes__secondary-value ${item.isTba ? 'is-tba' : ''}`}>
            {item.value}
          </span>
          {item.isTba && (
            <span className="event-prizes__secondary-tba-tag" aria-label="To be announced">TBA</span>
          )}
        </div>
      </div>
      <p className="event-prizes__secondary-desc">{item.description}</p>
      {item.perk && (
        <div className="event-prizes__secondary-perk">
          <span className="event-prizes__secondary-perk-bullet" aria-hidden="true">✦</span>
          <span>{item.perk}</span>
        </div>
      )}
    </div>
  );
}

export function EventPrizes() {
  const { eyebrow, heading, hero, secondary } = REWARDS_CONFIG;
  return (
    <section className="event-section event-prizes" id="prizes" aria-labelledby="prizes-title">
      <div className="event-section-inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">{eyebrow}</p>
          <h2 id="prizes-title">{heading}</h2>
        </Reveal>

        <Reveal className="event-prizes__layout" delay={120}>
          <div className="event-prizes__hero-col">
            <PrizeHero hero={hero} />
          </div>
          <div className="event-prizes__secondary-col">
            {secondary.map((item) => (
              <RewardCard key={item.id} item={item} />
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
          <p>{EVENT_CONTENT.contactEmail}</p>
          <p>{EVENT_CONTENT.contactPhone}</p>
        </div>
        <div className="event-footer__col event-footer__col--end">
          <a href="/" className="event-footer__backlink">Back to the main Vulcan site <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </footer>
  );
}
