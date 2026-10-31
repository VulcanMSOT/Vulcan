import React, { useRef, useState, useEffect } from 'react';

const CURSES = [
  {
    number: '01',
    name: 'Potion Pantry',
    track: 'AI + Full Stack + Inventory',
    icon: '🧪',
    curse: 'A full moon festival is announced for next week. Demand for 3 ingredients triples.',
    directive: 'Inject sudden 3x demand spikes into prediction pipelines. Adapt reorder quantities without running out of critical stock.',
    color: '#ff7a1a',
  },
  {
    number: '02',
    name: 'Phantom Hotline',
    track: 'Voice AI + Low-Latency Telephony',
    icon: '☎️',
    curse: 'The latency limit drops to 600 ms, and callers switch language mid-sentence.',
    directive: 'Streaming audio round-trip must complete strictly under 600ms while gracefully handling dynamic multilingual code-switching.',
    color: '#ff5470',
  },
  {
    number: '03',
    name: 'Possessed Butler',
    track: 'Adversarial Attack & Defense',
    icon: '🕯️',
    curse: "The Possession Round: write curses to attack other teams' butlers. Points for attack and defence.",
    directive: 'Red-team vs Blue-team live round. Craft exploits to breach other teams while hardening your own agent against prompt injection.',
    color: '#a58bff',
  },
  {
    number: '04',
    name: 'Midnight Crossroads',
    track: 'Computer Vision & Edge Systems',
    icon: '🚦',
    curse: 'A funeral procession (emergency-vehicle priority) and a fog curse on night footage.',
    directive: 'Classify traffic feeds through synthetic dense fog distortion. Automatically yield unconditional green-wave priority to emergency funeral convoys.',
    color: '#4cc9f0',
  },
  {
    number: '05',
    name: 'Coven of Hospitals',
    track: 'Distributed Systems & Anomaly Detection',
    icon: '🏥',
    curse: 'One hospital is corrupted and sends poisoned updates. Detect it and stay accurate.',
    directive: 'Byzantine fault isolation: identify the compromised node broadcasting tainted telemetry, reject corrupted weights, and preserve global patient triage accuracy.',
    color: '#8be04e',
  },
];

export default function EventMidnightReveal() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="midnight-reveal"
      className="event-section event-midnight-reveal"
      aria-labelledby="midnight-reveal-title"
      style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(134, 59, 255, 0.18), transparent 70%), linear-gradient(180deg, #07090b 0%, #0d0914 30%, #110c1c 70%, #07090b 100%)',
        borderTop: '1px solid rgba(255, 84, 112, 0.25)',
        borderBottom: '1px solid rgba(247, 244, 235, 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow accents */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(300px, 60vw, 750px)',
          height: 'clamp(300px, 40vw, 500px)',
          background: 'radial-gradient(circle, rgba(255, 84, 112, 0.12) 0%, rgba(255, 122, 26, 0.06) 40%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="event-section-inner" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div
          style={{
            maxWidth: '820px',
            marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
            transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          {/* Top Organization Kicker */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 84, 112, 0.12)',
              border: '1px solid rgba(255, 84, 112, 0.35)',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff5470',
                boxShadow: '0 0 10px #ff5470',
                animation: 'pulse 2s infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 'clamp(0.7rem, 0.2vw + 0.65rem, 0.78rem)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#ff8da1',
                textTransform: 'uppercase',
              }}
            >
              SHOW AT 12:00 AM ONLY · POWERED BY BOOM PIZZA
            </span>
          </div>

          <p
            className="event-mono-kicker"
            style={{
              color: '#ffa95c',
              fontSize: 'var(--type-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
            }}
          >
            HACK-O-LANTERN · VULCAN CLUB × MIRAI SCHOOL OF TECHNOLOGY
          </p>

          <h2
            id="midnight-reveal-title"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: '0 0 1rem 0',
            }}
          >
            The Midnight Curse <span style={{ color: '#ff5470', textShadow: '0 0 24px rgba(255, 84, 112, 0.5)' }}>has fallen.</span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 0.4vw + 0.95rem, 1.15rem)',
              lineHeight: 1.6,
              color: 'var(--event-muted)',
              margin: 0,
              maxWidth: '65ch',
            }}
          >
            The clock has struck 12:00 AM on the Mirai Floor. The builds are underway, and the organizers have unleashed the midnight constraints. Each track now carries an active curse that must be addressed during tonight’s evaluation rounds.
          </p>
        </div>

        {/* 5 Curses Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '20px',
            marginBottom: 'clamp(2.5rem, 4vw, 3.5rem)',
          }}
        >
          {CURSES.map((c, index) => (
            <article
              key={c.number}
              style={{
                position: 'relative',
                background: 'linear-gradient(145deg, rgba(23, 17, 34, 0.85) 0%, rgba(14, 11, 22, 0.92) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '16px',
                padding: 'clamp(20px, 3vw, 28px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 250ms var(--event-ease), border-color 250ms var(--event-ease), box-shadow 250ms var(--event-ease)',
                boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = c.color;
                e.currentTarget.style.boxShadow = `0 16px 36px -6px ${c.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(0, 0, 0, 0.6)';
              }}
            >
              <div>
                {/* Card Top Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: c.color,
                      letterSpacing: '0.08em',
                    }}
                  >
                    CURSE {c.number}
                  </span>
                  <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                </div>

                {/* Track Name & Category */}
                <h3
                  style={{
                    fontSize: 'clamp(1.15rem, 1.8vw, 1.4rem)',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '0 0 4px 0',
                    lineHeight: 1.2,
                  }}
                >
                  {c.name}
                </h3>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'ui-monospace, monospace',
                    color: 'rgba(247, 244, 235, 0.55)',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {c.track}
                </div>

                {/* The Exact Curse Text from Slide */}
                <div
                  style={{
                    background: 'rgba(255, 84, 112, 0.08)',
                    border: '1px solid rgba(255, 84, 112, 0.22)',
                    borderLeft: `4px solid ${c.color}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#ff8da1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '4px',
                    }}
                  >
                    Active Midnight Curse
                  </div>
                  <p
                    style={{
                      fontSize: '0.92rem',
                      lineHeight: 1.5,
                      fontWeight: 600,
                      color: '#fff1f3',
                      margin: 0,
                    }}
                  >
                    &ldquo;{c.curse}&rdquo;
                  </p>
                </div>
              </div>

              {/* Technical Directive */}
              <div
                style={{
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: 'rgba(247, 244, 235, 0.72)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '12px',
                }}
              >
                <strong style={{ color: '#ffffff', fontWeight: 700 }}>Directive: </strong>
                {c.directive}
              </div>
            </article>
          ))}
        </div>

        {/* Callout Footer & Download Official Slide */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(23, 15, 33, 0.95), rgba(36, 17, 34, 0.95))',
            border: '1px solid rgba(255, 84, 112, 0.3)',
            borderRadius: '16px',
            padding: 'clamp(20px, 3vw, 28px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#ffa95c',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <span>⚠️</span>
              <span>Slide Warning</span>
            </div>
            <p
              style={{
                fontSize: 'clamp(0.9rem, 0.3vw + 0.85rem, 1rem)',
                color: 'var(--event-ink)',
                margin: '4px 0 0 0',
                fontWeight: 500,
              }}
            >
              &ldquo;Keep this slide hidden until midnight.&rdquo; — The curses are now permanently in effect for Round 1 to 3 evaluations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="/Hack-O-Lantern_Midnight_Reveal.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Hack-O-Lantern_Midnight_Reveal.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: '#ff7a1a',
                color: '#07090b',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                boxShadow: '0 4px 18px rgba(255, 122, 26, 0.3)',
                transition: 'transform 150ms ease, background 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffa24d';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ff7a1a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Download Official Slide PDF</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
