import { useEffect, useState } from 'react';
import { EVENT_CONTENT } from '../../eventContent';

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

function Bats() {
  return (
    <div className="event-bats" aria-hidden="true">
      <svg className="event-bat event-bat--one" viewBox="0 0 72 30"><path d="M1 14c10-9 18-7 26 2 2-9 7-14 9-14s7 5 9 14c8-9 16-11 26-2-9 1-14 5-18 13-3-6-8-8-17-8s-14 2-17 8C15 19 10 15 1 14Z" /></svg>
      <svg className="event-bat event-bat--two" viewBox="0 0 72 30"><path d="M1 14c10-9 18-7 26 2 2-9 7-14 9-14s7 5 9 14c8-9 16-11 26-2-9 1-14 5-18 13-3-6-8-8-17-8s-14 2-17 8C15 19 10 15 1 14Z" /></svg>
      <svg className="event-bat event-bat--three" viewBox="0 0 72 30"><path d="M1 14c10-9 18-7 26 2 2-9 7-14 9-14s7 5 9 14c8-9 16-11 26-2-9 1-14 5-18 13-3-6-8-8-17-8s-14 2-17 8C15 19 10 15 1 14Z" /></svg>
    </div>
  );
}

const embers = Array.from({ length: 18 }, (_, index) => index);

export default function HalloweenHero({ reducedMotion }) {
  return (
    <section className="event-hero" aria-labelledby="event-title">
      <div className="event-hero__spotlight" aria-hidden="true" />
      <div className="event-hero__fog event-hero__fog--far" aria-hidden="true" />
      <div className="event-hero__fog event-hero__fog--near" aria-hidden="true" />
      <div className="event-hero__moon" aria-hidden="true"><span /></div>
      <Bats />
      <div className="event-embers" aria-hidden="true">
        {embers.map((ember) => <i key={ember} style={{ '--ember': ember }} />)}
      </div>
      <div className="event-cobweb event-cobweb--left" aria-hidden="true" />
      <div className="event-cobweb event-cobweb--right" aria-hidden="true" />

      <nav className="event-nav" aria-label="Event navigation">
        <a href="/" className="event-wordmark" aria-label="Back to the Vulcan Club site">
          <img src="/assets/vulcan-logo.png" alt="" />
          <span>vulcan club</span>
        </a>
        <a href="#registration" className="event-nav__link">Register</a>
      </nav>

      <div className="event-hero__content">
        <p className="event-kicker">{EVENT_CONTENT.label}</p>
        <h1 id="event-title">
          <span>{EVENT_CONTENT.name}</span>
        </h1>
        <p className="event-hero__intro">Hosted by {EVENT_CONTENT.host} with {EVENT_CONTENT.collegeName}. An overnight hackathon for teams of exactly three.</p>
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
        </div>
      </div>
      <p className="event-hero__timezone">Countdown fixed to India Standard Time (Asia/Kolkata).</p>
      {reducedMotion && <span className="sr-only">Decorative movement is disabled because reduced motion is enabled.</span>}
    </section>
  );
}
