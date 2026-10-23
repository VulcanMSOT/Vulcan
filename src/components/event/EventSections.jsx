import { useEffect, useMemo, useRef, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';

const fixedTimeline = [
  { time: '7:00 PM', title: 'Opening ceremony', detail: 'The challenge is revealed and the build begins.' },
  { time: '8:00 AM', title: 'Hackathon ends', detail: 'The overnight build window ends.' },
];

const knownFaqs = [
  ['How long is it?', '13 hours, from 7:00 PM on 30 October to 8:00 AM on 31 October.'],
  ['How big is a team?', 'Exactly 3 members.'],
  ['What does it cost?', '₹300 per team.'],
  ['How do I get in?', 'After payment is confirmed, show your ticket QR code at the entrance.'],
  ['What else do I need to know?', '[RULES]'],
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
      <Reveal className="event-section__heading"><h2 id="about-title">A night to build.</h2></Reveal>
      <Reveal className="event-about__copy">
        <p>{EVENT_CONTENT.about}</p>
        <p className="event-placeholder-copy">{EVENT_CONTENT.collegeName}</p>
      </Reveal>
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
      <Reveal className="event-section__heading"><h2 id="timeline-title">When the clock turns.</h2></Reveal>
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
    </section>
  );
}

export function EventTracks() {
  const tracks = EVENT_CONTENT.themes === '[THEMES/TRACKS]'
    ? ['[THEMES/TRACKS]', '[THEMES/TRACKS]', '[THEMES/TRACKS]']
    : EVENT_CONTENT.themes.split('|').map((track) => track.trim());

  return (
    <section className="event-section event-tracks" id="tracks" aria-labelledby="tracks-title">
      <Reveal className="event-section__heading"><h2 id="tracks-title">What will you summon?</h2><p>Choose from the confirmed themes or tracks when they are announced.</p></Reveal>
      <div className="event-track-list">
        {tracks.map((track, index) => (
          <Reveal key={`${track}-${index}`} className="event-track-wrap">
            <article className="event-track" tabIndex="0"><span>Theme {index + 1}</span><h3>{track}</h3></article>
          </Reveal>
        ))}
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
      <Reveal className="event-section__heading"><h2 id="rules-title">Before the doors open.</h2></Reveal>
      <div className="event-accordion">
        {items.map(([label, value]) => (
          <details key={label}><summary>{label}<span aria-hidden="true">+</span></summary><p>{value}</p></details>
        ))}
      </div>
    </section>
  );
}

export function EventPrizesSponsors() {
  if (isEmpty(EVENT_CONTENT.prizes) && isEmpty(EVENT_CONTENT.sponsors)) return null;
  return (
    <section className="event-section event-prizes" id="prizes" aria-labelledby="prizes-title">
      <Reveal className="event-section__heading"><h2 id="prizes-title">The things still unnamed.</h2></Reveal>
      <div className="event-prizes__grid">
        {!isEmpty(EVENT_CONTENT.prizes) && <div><h3>Prizes</h3><p>{EVENT_CONTENT.prizes}</p></div>}
        {!isEmpty(EVENT_CONTENT.sponsors) && <div><h3>Sponsors</h3><p>{EVENT_CONTENT.sponsors}</p></div>}
      </div>
    </section>
  );
}

export function EventFaq() {
  return (
    <section className="event-section event-faq" id="faq" aria-labelledby="faq-title">
      <Reveal className="event-section__heading"><h2 id="faq-title">A few clear answers.</h2></Reveal>
      <div className="event-faq__list">
        {knownFaqs.map(([question, answer]) => <p key={question}><strong>{question}</strong> {answer}</p>)}
      </div>
    </section>
  );
}

export function EventFooter() {
  return (
    <footer className="event-footer">
      <a href="/" className="event-wordmark" aria-label="Back to the Vulcan Club main site"><img src="/assets/vulcan-logo.png" alt="" /><span>vulcan club</span></a>
      <div><p>{EVENT_CONTENT.contactEmail}</p><p>{EVENT_CONTENT.contactPhone}</p></div>
      <a href="/">Back to the main Vulcan site <span aria-hidden="true">↗</span></a>
    </footer>
  );
}
