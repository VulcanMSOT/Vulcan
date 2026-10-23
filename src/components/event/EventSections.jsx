import { useEffect, useMemo, useRef, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';

const fixedTimeline = [
  { time: '7:00 PM', title: 'Opening ceremony', detail: 'The challenge is revealed and the 12-hour build begins.' },
  { time: '12:00 AM', title: 'Midnight fuel', detail: 'Midnight check-in and mentor feedback.' },
  { time: '7:00 AM', title: 'Hackathon ends', detail: 'The overnight build window concludes. Demos and awards begin.' },
];

const knownFaqs = [
  ['How long is it?', '12 hours, from 7:00 PM on 31 October to 7:00 AM on 1 November.'],
  ['How big is a team?', 'Teams of exactly 3 members.'],
  ['What does it cost?', '₹300 per team.'],
  ['Where is it held?', 'Mirai Floor, Mirai School of Technology, Bengaluru.'],
  ['When is the challenge revealed?', 'The challenge will be revealed live at the opening ceremony.'],
  ['How do I get in?', 'Show your registration ticket QR code at the entrance.'],
];

function isEmpty(value) {
  return !value || !value.trim();
}

function Reveal({ children, className = '' }) {
  return <div className={`event-reveal ${className}`}>{children}</div>;
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

export function EventTimeline() {
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef(null);
  const scheduleItems = useMemo(() => (
    EVENT_CONTENT.schedule === '[SCHEDULE]' ? [{ time: '[SCHEDULE]', title: '[SCHEDULE]', detail: 'Additional schedule details will appear here.' }] : []
  ), []);
  const entries = [...fixedTimeline.slice(0, 1), ...scheduleItems, ...fixedTimeline.slice(1)];

  useEffect(() => {
    const updateProgress = () => {
      const element = timelineRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      setProgress(Math.min(1, Math.max(0, (viewportHeight - rect.top) / (rect.height + viewportHeight * .35))));
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => { window.removeEventListener('scroll', updateProgress); window.removeEventListener('resize', updateProgress); };
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
            {entries.map((entry) => (
              <li key={`${entry.time}-${entry.title}`}>
                <time>{entry.time}</time>
                <div><h3>{entry.title}</h3><p>{entry.detail}</p></div>
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

export function EventPrizes() {
  if (isEmpty(EVENT_CONTENT.prizes)) return null;
  return (
    <section className="event-section event-prizes" id="prizes" aria-labelledby="prizes-title">
      <div className="event-section-inner">
        <Reveal className="event-section__heading">
          <p className="event-mono-kicker">Rewards</p>
          <h2 id="prizes-title">What is at stake.</h2>
        </Reveal>
        <div className="event-prizes__grid">
          <div>
            <h3>Prize pool</h3>
            <p>{EVENT_CONTENT.prizes}</p>
          </div>
        </div>
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
