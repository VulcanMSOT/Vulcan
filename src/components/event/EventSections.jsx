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
 * REWARDS CONFIGURATION (Single First Prize Only)
 * Reads first prize directly from EVENT_CONTENT.firstPrize / EVENT_CONTENT.prizes.
 */
export const REWARDS_CONFIG = {
  eyebrow: 'Reward',
  heading: 'What is at stake.',
  hero: {
    badge: '1ST PLACE',
    label: 'FIRST PRIZE',
    amount: EVENT_CONTENT.firstPrize || EVENT_CONTENT.prizes || '[FIRST PRIZE]',
    subtext: 'for 1st place',
    description: 'The single prize awarded to the winning team of Hack-O-Lantern.',
  },
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
  return null;
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
  const { eyebrow, heading, hero } = REWARDS_CONFIG;
  return (
    <section className="event-section event-prizes" id="prizes" aria-labelledby="prizes-title">
      <div className="event-section-inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">{eyebrow}</p>
          <h2 id="prizes-title">{heading}</h2>
        </Reveal>

        <Reveal className="event-prizes__layout event-prizes__layout--single" delay={120}>
          <PrizeHero hero={hero} />
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
