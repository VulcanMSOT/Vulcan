import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EVENT_CONTENT } from '../../eventContent';
import './HackOLanternTeaser.css';

gsap.registerPlugin(ScrollTrigger);

// Target registration deadline: 30 October 2026, 11:59:59 PM IST (18:29:59 UTC)
const REGISTRATION_DEADLINE_MS = new Date(EVENT_CONTENT.registrationDeadlineIso || '2026-10-30T18:29:59.000Z').getTime();

export default function HackOLanternTeaser({ prefersReducedMotion }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const pumpkinRef = useRef(null);
  const auraRef = useRef(null);

  // Live event status state
  const [eventData, setEventData] = useState({
    registrationState: 'open',
    spotsRemaining: 25,
    fee: EVENT_CONTENT.registrationFee || 300,
    entryLabel: EVENT_CONTENT.entryLabel || '₹300 per team',
    dateLabel: EVENT_CONTENT.dateLabel || '31 October, 7:00 PM',
    durationLabel: EVENT_CONTENT.durationLabel || '12 hours',
  });

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    status: 'upcoming', // 'upcoming' | 'live' | 'ended'
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 1. Fetch live status gracefully
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchStatus() {
      try {
        const res = await fetch('/api/event-status', { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setEventData((prev) => ({
              ...prev,
              registrationState: data.registrationState || prev.registrationState,
              spotsRemaining: typeof data.spotsRemaining === 'number' ? data.spotsRemaining : prev.spotsRemaining,
              fee: data.fee || prev.fee,
              entryLabel: data.entryLabel || prev.entryLabel,
              dateLabel: data.dateLabel || prev.dateLabel,
              durationLabel: data.durationLabel || prev.durationLabel,
            }));
          }
        }
      } catch {
        // Silently use defaults - never surface network errors to visitors
      }
    }

    fetchStatus();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // 2. Countdown clock
  useEffect(() => {
    function calculateCountdown() {
      const now = Date.now();
      if (now >= REGISTRATION_DEADLINE_MS) {
        setTimeLeft({ status: 'ended', days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = Math.max(0, REGISTRATION_DEADLINE_MS - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ status: 'upcoming', days, hours, minutes, seconds });
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Pixel Ember Particle Canvas (Vulcan Pixel Motif)
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = false;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particle pool
    const particleCount = 28;
    const colors = ['#ff7a1a', '#ff9e3b', '#f5a623', '#e05500'];
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      size: Math.floor(Math.random() * 3) + 3, // 3px to 5px square pixels
      speedY: Math.random() * 0.7 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.7 + 0.2,
      fadeSpeed: Math.random() * 0.006 + 0.003,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    function render() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity -= p.fadeSpeed;

        if (p.y < 0 || p.opacity <= 0) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
          p.opacity = Math.random() * 0.7 + 0.2;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        // Draw square pixel
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    }

    // Observer to pause canvas when offscreen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    });

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  // 4. Subtle mouse-lean for pumpkin glow
  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !sectionRef.current || window.innerWidth < 1024) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    if (auraRef.current) {
      auraRef.current.style.transform = `translate(${x * 18}px, ${y * 14}px)`;
    }
    if (pumpkinRef.current) {
      pumpkinRef.current.style.transform = `translate(${x * 6}px, ${y * 4}px)`;
    }
  };

  const handlePointerLeave = () => {
    if (auraRef.current) auraRef.current.style.transform = 'translate(0, 0)';
    if (pumpkinRef.current) pumpkinRef.current.style.transform = 'translate(0, 0)';
  };

  // 5. Refresh GSAP ScrollTrigger after mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Prize chip display rule: only if confirmed and not placeholder
  const isPrizeConfirmed =
    EVENT_CONTENT.firstPrize &&
    !EVENT_CONTENT.firstPrize.includes('[FIRST PRIZE]') &&
    EVENT_CONTENT.firstPrize.trim().length > 0;

  // Registration state helper
  const isRegistrationClosed =
    eventData.registrationState === 'closed' ||
    eventData.registrationState === 'full' ||
    timeLeft.status === 'ended';

  return (
    <section
      id="hack-o-lantern"
      ref={sectionRef}
      className="hol-teaser"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Hack-O-Lantern Hackathon Teaser"
    >
      {/* 2D Canvas for rising pixel embers */}
      <canvas ref={canvasRef} className="hol-teaser__canvas" aria-hidden="true" />

      <div className="hol-teaser__container">
        {/* LEFT COLUMN: TEXT CONTENT */}
        <div className="hol-teaser__content">
          {/* Eyebrow & Live Registration Badge */}
          <div className="hol-teaser__eyebrow-row">
            <span className="hol-teaser__mono-kicker">Next Event</span>

            {eventData.registrationState === 'open' && (
              <span className="hol-teaser__status-badge is-open" aria-label="Registration open">
                <span className="hol-teaser__status-dot" aria-hidden="true" />
                <span>
                  Registration open
                  {typeof eventData.spotsRemaining === 'number' && eventData.spotsRemaining > 0
                    ? ` · ${eventData.spotsRemaining} spots left`
                    : ''}
                </span>
              </span>
            )}

            {eventData.registrationState === 'live' && (
              <span className="hol-teaser__status-badge is-live" aria-label="Event is live now">
                <span className="hol-teaser__status-dot" aria-hidden="true" />
                <span>Live now</span>
              </span>
            )}

            {eventData.registrationState === 'full' && (
              <span className="hol-teaser__status-badge is-closed" aria-label="Registration is full">
                <span className="hol-teaser__status-dot" aria-hidden="true" />
                <span>Event full</span>
              </span>
            )}

            {eventData.registrationState === 'closed' && (
              <span className="hol-teaser__status-badge is-closed" aria-label="Registration is closed">
                <span className="hol-teaser__status-dot" aria-hidden="true" />
                <span>Registration closed</span>
              </span>
            )}
          </div>

          {/* Heading */}
          <h2 className="hol-teaser__heading">Hack-O-Lantern</h2>

          {/* Lead & Subline */}
          <p className="hol-teaser__lead">A Halloween hackathon by Vulcan Club.</p>
          <p className="hol-teaser__subline">Teams of 3. Quests and surprises along the way.</p>

          {/* Facts Row */}
          <div className="hol-teaser__facts">
            <div className="hol-teaser__fact-item">
              <span className="hol-teaser__fact-label">Date</span>
              <span className="hol-teaser__fact-value">{eventData.dateLabel}</span>
            </div>

            <div className="hol-teaser__fact-item">
              <span className="hol-teaser__fact-label">Duration</span>
              <span className="hol-teaser__fact-value">{eventData.durationLabel}</span>
            </div>

            <div className="hol-teaser__fact-item">
              <span className="hol-teaser__fact-label">Entry</span>
              <span className="hol-teaser__fact-value">{eventData.entryLabel}</span>
            </div>

            {isPrizeConfirmed && (
              <div className="hol-teaser__fact-chip" aria-label={`Prize pool ${EVENT_CONTENT.prizePool || EVENT_CONTENT.firstPrize}`}>
                Prize pool: {EVENT_CONTENT.prizePool || EVENT_CONTENT.firstPrize}
              </div>
            )}
          </div>

          {/* Chips */}
          <div className="hol-teaser__chips" role="list" aria-label="Event attributes">
            <div className="hol-teaser__chip" role="listitem">
              <span>Teams of 3</span>
            </div>

            <div
              className="hol-teaser__chip hol-teaser__chip--sealed"
              role="listitem"
              tabIndex={0}
              aria-label="Sealed: revealed during the event"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Quests</span>
              <span className="hol-teaser__chip-tooltip" role="tooltip">Not yet.</span>
            </div>

            <div
              className="hol-teaser__chip hol-teaser__chip--sealed"
              role="listitem"
              tabIndex={0}
              aria-label="Sealed: revealed during the event"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Surprises</span>
              <span className="hol-teaser__chip-tooltip" role="tooltip">Not yet.</span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="hol-teaser__countdown" aria-label="Event countdown">
            <span className="hol-teaser__countdown-label">
              {timeLeft.status === 'upcoming' ? 'Registration closes in' : 'Registration status'}
            </span>

            {timeLeft.status === 'upcoming' && (
              <div className="hol-teaser__countdown-grid" aria-live="polite">
                <div className="hol-teaser__countdown-unit">
                  <span className="hol-teaser__countdown-val">{timeLeft.days}</span>
                  <span className="hol-teaser__countdown-sub">d</span>
                </div>
                <span className="hol-teaser__countdown-sep">:</span>
                <div className="hol-teaser__countdown-unit">
                  <span className="hol-teaser__countdown-val">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="hol-teaser__countdown-sub">h</span>
                </div>
                <span className="hol-teaser__countdown-sep">:</span>
                <div className="hol-teaser__countdown-unit">
                  <span className="hol-teaser__countdown-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="hol-teaser__countdown-sub">m</span>
                </div>
                <span className="hol-teaser__countdown-sep">:</span>
                <div className="hol-teaser__countdown-unit">
                  <span className="hol-teaser__countdown-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="hol-teaser__countdown-sub">s</span>
                </div>
              </div>
            )}

            {timeLeft.status === 'ended' && (
              <div className="hol-teaser__countdown-live" style={{ color: '#71717a' }}>Registrations closed</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="hol-teaser__actions">
            <div className="hol-teaser__button-group">
              {isRegistrationClosed ? (
                <span className="hol-teaser__btn-primary is-disabled">
                  Registration closed
                </span>
              ) : (
                <a
                  href="/halloween-hack#registration"
                  className="hol-teaser__btn-primary"
                  aria-label="Register your team for Hack-O-Lantern"
                >
                  <span>Register your team</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              )}

              <a href="/halloween-hack" className="hol-teaser__btn-secondary">
                See event details
              </a>
            </div>

            <a href="/halloween-hack#payment-lookup" className="hol-teaser__status-link">
              Already registered? Check status →
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: CENTREPIECE ART */}
        <div className="hol-teaser__art-stage" aria-hidden="true">
          {/* Pale Moon with soft glow */}
          <div className="hol-teaser__moon" />

          {/* Drifting Fog Layers */}
          <div className="hol-teaser__fog">
            <div className="hol-teaser__fog-layer-1" />
            <div className="hol-teaser__fog-layer-2" />
          </div>

          {/* Rare Crossing Bats */}
          <svg className="hol-teaser__bat hol-teaser__bat-1" viewBox="0 0 32 16">
            <path d="M16 10 C13 4 8 2 0 5 C5 12 12 12 16 10 C20 12 27 12 32 5 C24 2 19 4 16 10 Z" />
          </svg>
          <svg className="hol-teaser__bat hol-teaser__bat-2" viewBox="0 0 32 16">
            <path d="M16 10 C13 4 8 2 0 5 C5 12 12 12 16 10 C20 12 27 12 32 5 C24 2 19 4 16 10 Z" />
          </svg>

          {/* Pumpkin Centrepiece with Vulcan {V} Carved Face */}
          <div ref={pumpkinRef} className="hol-teaser__pumpkin-box">
            {/* Ambient Aura */}
            <div ref={auraRef} className="hol-teaser__pumpkin-aura" />

            <svg
              className="hol-teaser__pumpkin-svg"
              viewBox="0 0 200 190"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Fire Glow Inside Carving */}
                <radialGradient id="carvedFire" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff8e7" />
                  <stop offset="35%" stopColor="#ffb03a" />
                  <stop offset="70%" stopColor="#ff6a00" />
                  <stop offset="100%" stopColor="#cc3700" />
                </radialGradient>

                {/* Dark Ribbed Pumpkin Shading */}
                <radialGradient id="pumpkinShade" cx="45%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#2b1a16" />
                  <stop offset="50%" stopColor="#1a0f0d" />
                  <stop offset="85%" stopColor="#120908" />
                  <stop offset="100%" stopColor="#080403" />
                </radialGradient>

                <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3d3020" />
                  <stop offset="50%" stopColor="#291e13" />
                  <stop offset="100%" stopColor="#17100a" />
                </linearGradient>
              </defs>

              {/* Curved Stem at Top */}
              <path
                d="M 98 42 C 95 24 104 10 122 5 C 124 7 120 16 108 22 C 103 26 105 34 104 42 Z"
                fill="url(#stemGrad)"
                stroke="#17100a"
                strokeWidth="1.5"
              />

              {/* Pumpkin Body (Ribbed Organic Lobes) */}
              <g stroke="rgba(255, 122, 26, 0.22)" strokeWidth="1.5">
                {/* Far side lobes */}
                <ellipse cx="48" cy="115" rx="38" ry="54" fill="url(#pumpkinShade)" />
                <ellipse cx="152" cy="115" rx="38" ry="54" fill="url(#pumpkinShade)" />

                {/* Inner side lobes */}
                <ellipse cx="72" cy="118" rx="42" ry="58" fill="url(#pumpkinShade)" />
                <ellipse cx="128" cy="118" rx="42" ry="58" fill="url(#pumpkinShade)" />

                {/* Center front lobe */}
                <ellipse cx="100" cy="120" rx="46" ry="60" fill="url(#pumpkinShade)" />
              </g>

              {/* Carved Face: The Vulcan {V} Mark with Inner Fire Glow */}
              <g className="hol-teaser__carved-glow" fill="url(#carvedFire)">
                {/* Left Curly Brace '{' as Left Eye / Cheek */}
                <path d="M 62 82 L 54 82 L 54 94 L 48 99 L 54 104 L 54 116 L 62 116 L 62 111 L 58 111 L 58 102 L 52 99 L 58 96 L 58 87 L 62 87 Z" />

                {/* Right Curly Brace '}' as Right Eye / Cheek */}
                <path d="M 138 82 L 146 82 L 146 94 L 152 99 L 146 104 L 146 116 L 138 116 L 138 111 L 142 111 L 142 102 L 148 99 L 142 96 L 142 87 L 138 87 Z" />

                {/* Carved Vulcan V Mouth */}
                <path d="M 84 122 L 100 148 L 116 122 L 108 122 L 100 136 L 92 122 Z" />

                {/* Subtle Nose Accent */}
                <polygon points="100,102 95,112 105,112" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
