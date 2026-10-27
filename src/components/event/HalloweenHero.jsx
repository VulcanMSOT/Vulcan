import { useEffect, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';
import HalloweenHeroScene3D from './HalloweenHeroScene3D';

const START = new Date(EVENT_CONTENT.startIso).getTime();
const END = new Date(EVENT_CONTENT.endIso).getTime();

function getCountdown(now = Date.now()) {
  if (now >= END) return { state: 'ended', values: null };
  if (now >= START) return { state: 'live', values: null };

  const remaining = START - now;
  return {
    state: 'countdown',
    values: {
      days: Math.floor(remaining / 86_400_000),
      hours: Math.floor((remaining / 3_600_000) % 24),
      minutes: Math.floor((remaining / 60_000) % 60),
      seconds: Math.floor((remaining / 1_000) % 60),
    },
  };
}

function Countdown() {
  const [countdown, setCountdown] = useState(() => getCountdown());

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  if (countdown.state === 'live') {
    return <p className="event-status event-status--live" role="status">Live now</p>;
  }
  if (countdown.state === 'ended') {
    return <p className="event-status" role="status">Event ended</p>;
  }

  const cells = [
    ['Days', countdown.values.days],
    ['Hours', countdown.values.hours],
    ['Minutes', countdown.values.minutes],
    ['Seconds', countdown.values.seconds],
  ];

  return (
    <div className="event-countdown" aria-live="polite" aria-label="Countdown to the event start in India Standard Time">
      {cells.map(([label, value]) => (
        <div className="event-countdown__cell" key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function HalloweenHero({ reducedMotion }) {
  return (
    <section className="event-hero" id="hero" aria-labelledby="event-title">
      <HalloweenHeroScene3D reducedMotion={reducedMotion} />
      <div className="event-cobweb event-cobweb--left" aria-hidden="true" />
      <div className="event-cobweb event-cobweb--right" aria-hidden="true" />

      <div className="event-hero__inner">
        <nav className="event-nav" aria-label="Event navigation">
          <a href="/" className="event-wordmark" aria-label="Back to the Vulcan Club site">
            <img src="/assets/vulcan-logo.png" alt="" />
            <span>vulcan club</span>
          </a>
          <div className="event-nav__group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#judges" className="event-nav__link">Judges</a>
            <a href="#timeline" className="event-nav__link">Schedule</a>
            <a href="#registration" className="event-nav__link">Register</a>
          </div>
        </nav>

        <div className="event-hero__content">
          <p className="event-kicker">{EVENT_CONTENT.label}</p>
          <h1 id="event-title">
            <span>{EVENT_CONTENT.name}</span>
          </h1>
          <p className="event-hero__subtitle">{EVENT_CONTENT.heroSubtitle}</p>
          <div className="event-hero__tags" aria-label="Event highlights">
            {EVENT_CONTENT.heroTags.map((tag) => (
              <span key={tag} className="event-hero__tag">
                <span className="event-hero__tag-dot" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
          <p className="event-hero__intro">Hosted by {EVENT_CONTENT.host} with {EVENT_CONTENT.collegeName}.</p>
        </div>

        <div className="event-hero__bottom">
          <ul className="event-facts" aria-label="Event details">
            <li>{EVENT_CONTENT.dateLabel}</li>
            <li>{EVENT_CONTENT.durationLabel}</li>
            <li>{EVENT_CONTENT.teamLabel}</li>
            <li>{EVENT_CONTENT.entryLabel}</li>
          </ul>
          <div className="event-hero__action">
            <Countdown />
            <a className="event-register-button" href="#registration">Register your team <span aria-hidden="true">↘</span></a>
            <p className="event-hero__timezone">Countdown fixed to India Standard Time (Asia/Kolkata).</p>
          </div>
        </div>
      </div>
      {reducedMotion && <span className="sr-only">Decorative movement is disabled because reduced motion is enabled.</span>}
    </section>
  );
}
