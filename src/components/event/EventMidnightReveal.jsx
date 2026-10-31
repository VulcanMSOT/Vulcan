import React, { useRef, useState, useEffect } from 'react';

const PPT_SLIDES = [
  {
    num: 1,
    tag: '01 Intro',
    title: 'HACK-O-LANTERN',
    subtitle: 'A Halloween Overnight Hackathon',
    type: 'cover',
  },
  {
    num: 2,
    tag: '02 Glance',
    title: 'THE NIGHT AT A GLANCE',
    subtitle: 'Twelve hours. Five cursed problems.',
    type: 'glance',
  },
  {
    num: 3,
    tag: '03 Sponsor',
    title: 'OUR SPONSOR',
    subtitle: 'Powered by Boom Pizza',
    type: 'sponsor',
  },
  {
    num: 4,
    tag: '04 Tracks',
    title: 'THE CHALLENGE, REVEALED',
    subtitle: 'Five tracks. Pick one curse',
    type: 'tracks_overview',
  },
  {
    num: 5,
    tag: '05 Pantry',
    trackNum: 'TRACK 01',
    category: 'AI + FULL STACK + WEB + ANDROID',
    title: "The Witch's Potion Pantry",
    type: 'track_detail',
    story: "Madam Hexley's potion shop runs out of bat wings and mandrake root every Halloween, and angry customers turn into frogs. Build her a smart pantry.",
    quest: [
      'Track stock: add, update and record what was sold',
      'Prophecy: predict which ingredients run out, and when',
      'Restock spell: recommend how much to reorder',
      'Strange happenings: flag unusual consumption',
      'Crystal ball: demand charts for every product',
      'Web dashboard + Android app on one shared backend',
    ],
    scoredOn: 'Forecast accuracy on hidden future sales, planted anomalies caught, a working web + Android app, and UX.',
    data: 'Retail Store Inventory & Demand Forecasting (Kaggle), re-skinned as potion ingredients. Sealed until 12:00 AM.',
    twistNotice: 'A twist to this track drops at midnight. Build to adapt.',
    accent: '#ff7a1a',
  },
  {
    num: 6,
    tag: '06 Hotline',
    trackNum: 'TRACK 02',
    category: 'AI + SYSTEMS',
    title: 'The Midnight Phantom Hotline',
    type: 'track_detail',
    story: 'Ghosts keep calling the clinic and the haunted railway station in Hinglish, with chains rattling and a signal weaker than a dying candle.',
    quest: [
      'Book doctor appointments or answer railway queries in code-mixed Hinglish',
      'Handle interruptions and background noise',
      'Survive a 3G-level connection',
      'Reply within 800 ms end to end',
    ],
    scoredOn: 'Task completion rate on hidden test calls, and latency.',
    whyHard: 'Streaming speech-to-text, turn-taking and the latency budget pull against each other.',
    twistNotice: 'A twist to this track drops at midnight. Build to adapt.',
    accent: '#ff5470',
  },
  {
    num: 7,
    tag: '07 Butler',
    trackNum: 'TRACK 03',
    category: 'AI SECURITY',
    title: 'The Possessed Butler',
    type: 'track_detail',
    story: "Count Byteula's AI butler reads letters, browses the cursed web and acts for his master. Dark spirits hide curses everywhere, waiting to possess him.",
    quest: [
      'Build an LLM agent that reads email, browses web pages and takes actions',
      'Defend it against prompt injections hidden in emails, web pages and PDFs',
      'Keep it useful: refusing everything loses points',
    ],
    scoredOn: 'Tasks completed minus successful possessions.',
    whyHard: 'There is no single known fix, so you must design an architecture, not apply a patch.',
    twistNotice: 'A twist to this track drops at midnight. Build to adapt.',
    accent: '#a58bff',
  },
  {
    num: 8,
    tag: '08 Crossroads',
    trackNum: 'TRACK 04',
    category: 'COMPUTER VISION + REINFORCEMENT LEARNING',
    title: 'The Midnight Crossroads',
    type: 'track_detail',
    story: 'Autos, bikes, buses, cattle and the odd zombie crawl through the cursed crossroads with no lane discipline. Free the souls stuck at red lights.',
    quest: [
      'The All-Seeing Eye: count queued vehicles per approach from CCTV-style video',
      'The Signal Spell: control the lights in the SUMO simulator to cut average wait time',
    ],
    scoredOn: 'Reduction in average wait time on unseen junction scenarios.',
    whyHard: 'Real-world vision feeds a control loop, and test junctions differ from training.',
    twistNotice: 'A twist to this track drops at midnight. Build to adapt.',
    accent: '#4cc9f0',
  },
  {
    num: 9,
    tag: '09 Hospitals',
    trackNum: 'TRACK 05',
    category: 'PRIVACY + MACHINE LEARNING',
    title: 'The Coven of Five Hospitals',
    type: 'track_detail',
    story: 'Five haunted hospitals must diagnose a plague together, but their oath forbids sharing records. The Soul Thief lurks, hunting whose records trained the model.',
    quest: [
      'Train across 5 hospitals with differently skewed data',
      'Federated learning: no raw data leaves a hospital',
      'Stay within a differential-privacy budget',
      'Survive membership-inference attacks',
    ],
    scoredOn: 'Model accuracy, how much the attacks reveal, and communication cost.',
    whyHard: 'Privacy noise, skewed hospitals and attack resistance all cost accuracy.',
    twistNotice: 'A twist to this track drops at midnight. Build to adapt.',
    accent: '#8be04e',
  },
  {
    num: 10,
    tag: '10 Schedule',
    title: 'SCHEDULE OF THE DAMNED',
    subtitle: 'From dusk till the Grand Séance',
    type: 'schedule',
  },
  {
    num: 11,
    tag: '11 Judgement',
    title: 'JUDGEMENT',
    subtitle: 'Three rounds, one cut, one séance',
    type: 'judgement',
  },
  {
    num: 12,
    tag: '12 R1 Checklist',
    title: 'ROUND 1 · 1:00 AM',
    subtitle: 'What the judges want to see first',
    type: 'checklist',
  },
  {
    num: 13,
    tag: '13 Laws',
    title: "THE COVEN'S LAWS",
    subtitle: 'Rules of the night',
    type: 'laws',
  },
  {
    num: 14,
    tag: '14 Awards',
    title: 'GLORY',
    subtitle: 'Awards of the night',
    type: 'awards',
  },
  {
    num: 15,
    tag: '15 Contact',
    title: 'MIRAI SCHOOL OF TECHNOLOGY',
    subtitle: 'Venue & Emergency Contacts',
    type: 'contact',
  },
  {
    num: 16,
    tag: '16 🌑 Curse',
    title: 'The Midnight Curse has fallen',
    subtitle: 'SHOW AT 12:00 AM ONLY',
    type: 'midnight_curse',
  },
];

export default function EventMidnightReveal() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // Slide 1
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideContainerRef = useRef(null);

  const currentSlide = PPT_SLIDES[currentSlideIndex];

  const goToPrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : PPT_SLIDES.length - 1));
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => (prev < PPT_SLIDES.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      slideContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <section
      id="midnight-reveal"
      className="event-section event-midnight-reveal"
      aria-labelledby="midnight-reveal-title"
      style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(134, 59, 255, 0.22), transparent 70%), linear-gradient(180deg, #07090b 0%, #0d0914 30%, #110c1c 70%, #07090b 100%)',
        borderTop: '1px solid rgba(255, 84, 112, 0.35)',
        borderBottom: '1px solid rgba(247, 244, 235, 0.1)',
        padding: 'clamp(3rem, 6vw, 5rem) 0',
        overflow: 'hidden',
      }}
    >
      <div className="event-section-inner">
        {/* Section Header */}
        <div style={{ maxWidth: '850px', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 84, 112, 0.15)',
              border: '1px solid rgba(255, 84, 112, 0.4)',
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
              }}
            />
            <span
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#ff8da1',
                textTransform: 'uppercase',
              }}
            >
              OFFICIAL HACK-O-LANTERN PRESENTATION (16 SLIDES)
            </span>
          </div>

          <h2
            id="midnight-reveal-title"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: '0 0 1rem 0',
            }}
          >
            Hack-O-Lantern <span style={{ color: '#ff7a1a' }}>Presentation Deck</span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 0.4vw + 0.95rem, 1.15rem)',
              lineHeight: 1.6,
              color: 'var(--event-muted)',
              margin: '0 0 1.5rem 0',
            }}
          >
            The official 16-slide pitch deck for the Hack-O-Lantern Overnight Hackathon at Mirai School of Technology. Use the controls or arrow keys to flip through slides, or project in full-screen.
          </p>

          {/* Top Quick Download Links */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="/Hack-O-Lantern_Halloween_Hackathon.pptx"
              download="Hack-O-Lantern_Halloween_Hackathon.pptx"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                background: '#ff7a1a',
                color: '#0c0912',
                fontWeight: 800,
                fontSize: '0.82rem',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(255, 122, 26, 0.3)',
              }}
            >
              <span>📊 Download Official PPTX</span>
              <span>↗</span>
            </a>
            <a
              href="/Hack-O-Lantern_Halloween_Hackathon.pdf"
              download="Hack-O-Lantern_Halloween_Hackathon.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
              }}
            >
              <span>📄 Download Official PDF</span>
              <span>↗</span>
            </a>
            <button
              onClick={() => setCurrentSlideIndex(15)} // Slide 16
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'rgba(255, 84, 112, 0.15)',
                border: '1px solid rgba(255, 84, 112, 0.4)',
                color: '#ff8da1',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <span>🌑 Jump to Slide 16 (Midnight Curse)</span>
            </button>
          </div>
        </div>

        {/* Slide Carousel Tabs (All 16 Slides) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '16px',
            scrollbarWidth: 'thin',
          }}
        >
          {PPT_SLIDES.map((s, idx) => {
            const isActive = idx === currentSlideIndex;
            const isSlide16 = s.num === 16;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentSlideIndex(idx)}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: isActive
                    ? isSlide16
                      ? '1px solid #ff5470'
                      : '1px solid #ff7a1a'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive
                    ? isSlide16
                      ? 'linear-gradient(135deg, rgba(255, 84, 112, 0.25), rgba(255, 122, 26, 0.2))'
                      : 'rgba(255, 122, 26, 0.2)'
                    : 'rgba(23, 17, 34, 0.65)',
                  color: isActive ? '#ffffff' : 'rgba(247, 244, 235, 0.65)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <span>{s.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Stage Container */}
        <div
          ref={slideContainerRef}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: isFullscreen ? '100vw' : '1080px',
            height: isFullscreen ? '100vh' : 'auto',
            margin: '0 auto',
            background: isFullscreen ? '#07090b' : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: isFullscreen ? '0' : '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
            border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Header Bar inside Stage */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 18px',
              background: '#120d1d',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f5ead6',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 800, color: '#ffa95c' }}>
                SLIDE {String(currentSlide.num).padStart(2, '0')} / 16
              </span>
              <span style={{ color: 'rgba(247, 244, 235, 0.3)' }}>|</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{currentSlide.title}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={goToPrev}
                title="Previous Slide (Left Arrow)"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                ◀ Prev
              </button>
              <button
                onClick={goToNext}
                title="Next Slide (Right Arrow)"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                Next ▶
              </button>
              <button
                onClick={toggleFullscreen}
                title="Toggle Fullscreen Projector"
                style={{
                  background: 'rgba(255, 122, 26, 0.2)',
                  border: '1px solid rgba(255, 122, 26, 0.4)',
                  color: '#ffa95c',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
              </button>
            </div>
          </div>

          {/* Slide Body Canvas (Aspect Ratio 16:9) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: isFullscreen ? 'calc(100vh - 50px)' : '580px',
              background: currentSlide.num === 16 ? '#f4ece1' : currentSlide.num === 3 ? '#161022' : '#0e0b17',
              color: currentSlide.num === 16 ? '#1a1714' : '#f5ead6',
              padding: 'clamp(24px, 4vw, 44px)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'background 200ms ease',
            }}
          >
            {/* SLIDE 1: COVER */}
            {currentSlide.type === 'cover' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', color: '#ff7a1a', fontWeight: 800, letterSpacing: '0.12em', marginBottom: '8px' }}>
                    VULCAN CLUB × MIRAI SCHOOL OF TECHNOLOGY
                  </div>
                  <h1 style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#ffffff', margin: '0 0 10px 0' }}>
                    HACK-O-LANTERN
                  </h1>
                  <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#ff8da1', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    A HALLOWEEN OVERNIGHT HACKATHON
                  </div>
                  <div style={{ display: 'inline-flex', gap: '12px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'ui-monospace, monospace', fontSize: '0.9rem', color: '#ffa95c', fontWeight: 700 }}>
                    <span>CODE</span>
                    <span>/</span>
                    <span>CREATE</span>
                    <span>/</span>
                    <span>CELEBRATE</span>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(90deg, rgba(255, 122, 26, 0.15), rgba(165, 139, 255, 0.15))', border: '1px solid rgba(255, 122, 26, 0.3)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', color: '#ffa95c', fontWeight: 800, textTransform: 'uppercase' }}>
                      OPENING CEREMONY
                    </div>
                    <div style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700 }}>
                      31 October 2026 · 7:00 PM · Mirai Floor, Mirai School of Technology
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem' }}>🎃</div>
                </div>
              </div>
            )}

            {/* SLIDE 2: NIGHT AT A GLANCE */}
            {currentSlide.type === 'glance' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    THE NIGHT AT A GLANCE
                  </div>
                  <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 24px 0' }}>
                    Twelve hours. Five cursed problems.
                  </h1>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'rgba(247, 244, 235, 0.6)', marginBottom: '4px' }}>DATE & TIME</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ff7a1a', marginBottom: '4px' }}>31 OCT & 1 NOV</div>
                      <div style={{ fontSize: '0.88rem', color: 'rgba(247, 244, 235, 0.8)' }}>7:00 PM – 7:00 AM</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'rgba(247, 244, 235, 0.6)', marginBottom: '4px' }}>VENUE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#8be04e', marginBottom: '4px' }}>MIRAI FLOOR</div>
                      <div style={{ fontSize: '0.88rem', color: 'rgba(247, 244, 235, 0.8)' }}>Mirai School of Technology</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'rgba(247, 244, 235, 0.6)', marginBottom: '4px' }}>TEAM RULES</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#a58bff', marginBottom: '4px' }}>TEAM OF 3</div>
                      <div style={{ fontSize: '0.88rem', color: 'rgba(247, 244, 235, 0.8)' }}>Present at each evaluation</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'rgba(247, 244, 235, 0.6)', marginBottom: '4px' }}>CODE FREEZE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ff5470', marginBottom: '4px' }}>HACKING ENDS</div>
                      <div style={{ fontSize: '0.88rem', color: 'rgba(247, 244, 235, 0.8)' }}>Code freeze at 6:45 AM</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 122, 26, 0.12)', border: '1px solid rgba(255, 122, 26, 0.35)', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', color: '#ffa95c', fontWeight: 800 }}>PRIZE POOL</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>₹9,000</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(247, 244, 235, 0.7)' }}>
                    ₹300 per team entry · awards decided by the judges
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: OUR SPONSOR (BOOM PIZZA) */}
            {currentSlide.type === 'sponsor' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', color: '#ff7a1a', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '6px' }}>
                    OUR SPONSOR
                  </div>
                  <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 10px 0' }}>
                    Powered by Boom Pizza 🍕
                  </h1>
                  <div style={{ fontSize: '1.2rem', color: '#ffa95c', fontWeight: 700, marginBottom: '24px' }}>
                    The fuel for tonight's hackers
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 122, 26, 0.3)', borderRadius: '16px', padding: '24px', maxWidth: '780px', fontSize: '1.05rem', lineHeight: 1.6, color: '#f5ead6' }}>
                    &ldquo;Boom Pizza is sponsoring the pizzas for Hack-O-Lantern, so every team can build through the night on a full stomach. A huge thank you to the Boom Pizza team for backing student builders at Mirai School of Technology.&rdquo;
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(247, 244, 235, 0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  <span>HACK-O-LANTERN · VULCAN CLUB × MIRAI SCHOOL OF TECHNOLOGY</span>
                  <span>SLIDE 3</span>
                </div>
              </div>
            )}

            {/* SLIDE 4: THE CHALLENGE, REVEALED */}
            {currentSlide.type === 'tracks_overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    THE CHALLENGE, REVEALED
                  </div>
                  <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 20px 0' }}>
                    Five tracks. Pick one curse.
                  </h1>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { num: 'TRACK 01', name: "The Witch's Potion Pantry", desc: 'Smart inventory & demand prediction', tag: '1st years only', color: '#ff7a1a' },
                      { num: 'TRACK 02', name: 'The Midnight Phantom Hotline', desc: 'Hinglish voice agent under 800 ms', tag: 'AI + Systems', color: '#ff5470' },
                      { num: 'TRACK 03', name: 'The Possessed Butler', desc: 'Prompt-injection-proof AI agent', tag: 'AI Security', color: '#a58bff' },
                      { num: 'TRACK 04', name: 'The Midnight Crossroads', desc: 'Indian traffic signal optimizer', tag: 'CV + RL', color: '#4cc9f0' },
                      { num: 'TRACK 05', name: 'The Coven of Five Hospitals', desc: 'Federated learning with privacy', tag: 'Privacy + ML', color: '#8be04e' },
                    ].map((t) => (
                      <div key={t.num} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderLeft: `4px solid ${t.color}`, borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', fontWeight: 800, color: t.color, marginRight: '12px' }}>{t.num}</span>
                          <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{t.name}</strong>
                          <span style={{ fontSize: '0.82rem', color: 'rgba(247, 244, 235, 0.6)', marginLeft: '12px' }}>{t.desc}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'ui-monospace, monospace', color: t.color, background: `${t.color}20`, padding: '3px 8px', borderRadius: '4px' }}>{t.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247, 244, 235, 0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  SLIDE 4
                </div>
              </div>
            )}

            {/* SLIDES 5-9: INDIVIDUAL TRACK PROBLEM STATEMENTS */}
            {currentSlide.type === 'track_detail' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: currentSlide.accent, fontWeight: 800 }}>
                      {currentSlide.trackNum} · {currentSlide.category}
                    </span>
                    <span style={{ padding: '3px 10px', borderRadius: '9999px', background: `${currentSlide.accent}22`, border: `1px solid ${currentSlide.accent}55`, color: currentSlide.accent, fontSize: '0.72rem', fontWeight: 700 }}>
                      OFFICIAL PROBLEM STATEMENT
                    </span>
                  </div>

                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 12px 0' }}>
                    {currentSlide.title}
                  </h1>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderLeft: `4px solid ${currentSlide.accent}`, padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '16px', fontSize: '0.92rem', lineHeight: 1.5, color: '#f5ead6' }}>
                    {currentSlide.story}
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.76rem', fontFamily: 'ui-monospace, monospace', color: '#4cc9f0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                      YOUR QUEST:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', color: 'rgba(247, 244, 235, 0.85)', lineHeight: 1.4 }}>
                      {currentSlide.quest.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.82rem', marginBottom: '10px' }}>
                    <strong style={{ color: '#ffffff' }}>SCORED ON: </strong>
                    <span style={{ color: 'rgba(247, 244, 235, 0.8)' }}>{currentSlide.scoredOn}</span>
                  </div>

                  {currentSlide.whyHard && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(247, 244, 235, 0.65)', fontStyle: 'italic' }}>
                      <strong>Why It's Hard: </strong>{currentSlide.whyHard}
                    </div>
                  )}
                </div>

                <div style={{ background: 'rgba(255, 84, 112, 0.12)', border: '1px solid rgba(255, 84, 112, 0.35)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#fff1f3', fontWeight: 600 }}>
                    {currentSlide.twistNotice}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'ui-monospace, monospace', color: '#ff8da1', fontWeight: 800 }}>
                    SEALED UNTIL 12:00 AM
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 10: SCHEDULE OF THE DAMNED */}
            {currentSlide.type === 'schedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    SCHEDULE OF THE DAMNED
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    From dusk till the Grand Séance
                  </h1>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {[
                      { time: '7:00 PM', title: 'Opening ceremony', desc: 'Challenge reveal, check-in, costumes' },
                      { time: '12:00 AM', title: 'The Midnight Curse', desc: 'Every track gets its twist' },
                      { time: '1:00 AM', title: 'Round 1 · The First Haunting', desc: 'Baseline check (No elimination)' },
                      { time: '3:00 AM', title: 'Witching-hour break', desc: 'Pizza courtesy of Boom Pizza 🍕' },
                      { time: '4:00 AM', title: 'Round 2 · The Witching Hour Trial', desc: 'Public test set metrics & curse progress' },
                      { time: '6:45 AM', title: 'Code freeze', desc: 'The graves are sealed' },
                      { time: '7:00 AM', title: 'Round 3 · The Graveyard Cut', desc: 'Top 10 chosen' },
                      { time: '~8:30 AM', title: 'Top 10 announced', desc: 'The survivors are named' },
                      { time: '9:30 AM', title: 'Final · The Grand Séance', desc: 'Top 10 present: 8m demo + 4m Q&A' },
                      { time: '~11:30 AM', title: 'Awards ceremony', desc: 'The night ends' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', fontWeight: 800, color: '#ff7a1a' }}>{item.time}</span>
                          <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{item.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'rgba(247, 244, 235, 0.6)', marginTop: '2px' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247, 244, 235, 0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  SLIDE 10
                </div>
              </div>
            )}

            {/* SLIDE 11: JUDGEMENT */}
            {currentSlide.type === 'judgement' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    JUDGEMENT
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    Three rounds, one cut, one séance
                  </h1>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#ff7a1a', fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>1:00 AM · NO ELIMINATION</span>
                      <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '4px 0 6px 0' }}>The First Haunting</h3>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(247, 244, 235, 0.7)', margin: 0 }}>Architecture and basic flow working end to end.</p>
                      <div style={{ marginTop: '10px', fontSize: '1.4rem', fontWeight: 900, color: '#ffa95c', fontFamily: 'ui-monospace, monospace' }}>15%</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#ff5470', fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>4:00 AM · NO ELIMINATION</span>
                      <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '4px 0 6px 0' }}>The Witching Hour Trial</h3>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(247, 244, 235, 0.7)', margin: 0 }}>Public test data metrics and curse progress. Live leaderboard.</p>
                      <div style={{ marginTop: '10px', fontSize: '1.4rem', fontWeight: 900, color: '#ff5470', fontFamily: 'ui-monospace, monospace' }}>25%</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#a58bff', fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>7:00 AM · ELIMINATION</span>
                      <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '4px 0 6px 0' }}>The Graveyard Cut</h3>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(247, 244, 235, 0.7)', margin: 0 }}>Hidden test sets, live attacks and curse handling. Top 10 advance.</p>
                      <div style={{ marginTop: '10px', fontSize: '1.4rem', fontWeight: 900, color: '#a58bff', fontFamily: 'ui-monospace, monospace' }}>60%</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#8be04e', fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>9:30 AM · TOP 10 ONLY</span>
                      <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '4px 0 6px 0' }}>The Grand Séance</h3>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(247, 244, 235, 0.7)', margin: 0 }}>8 min presentation and live demo, then 4 min judge Q&A.</p>
                      <div style={{ marginTop: '10px', fontSize: '1.4rem', fontWeight: 900, color: '#8be04e', fontFamily: 'ui-monospace, monospace' }}>FINALS</div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247, 244, 235, 0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  SLIDE 11
                </div>
              </div>
            )}

            {/* SLIDE 12: ROUND 1 CHECKLIST */}
            {currentSlide.type === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    ROUND 1 · 1:00 AM
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    What the judges want to see first
                  </h1>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { track: 'Potion Pantry', req: 'Database and CRUD working; web and Android app connected to the backend' },
                      { track: 'Phantom Hotline', req: 'End-to-end voice pipeline answers at least one query' },
                      { track: 'Possessed Butler', req: 'Agent completes basic email, browsing and file tasks' },
                      { track: 'Midnight Crossroads', req: 'Vehicle detection running on the sample video' },
                      { track: 'Coven of Hospitals', req: 'Federated training loop running across all 5 hospitals' },
                    ].map((row, idx) => (
                      <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px 16px', display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', gap: '16px', alignItems: 'center' }}>
                        <strong style={{ color: '#ff7a1a', fontSize: '0.9rem' }}>{row.track}</strong>
                        <span style={{ color: '#f5ead6', fontSize: '0.85rem' }}>{row.req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(165, 139, 255, 0.12)', border: '1px solid rgba(165, 139, 255, 0.3)', borderRadius: '8px', padding: '10px 16px', fontSize: '0.85rem', color: '#d4c5ff' }}>
                  💡 Round 1 has no elimination. It is your chance to get early feedback.
                </div>
              </div>
            )}

            {/* SLIDE 13: THE COVEN'S LAWS */}
            {currentSlide.type === 'laws' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    THE COVEN'S LAWS
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    Rules of the night
                  </h1>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {[
                      { num: '01', title: 'Teams of 3', desc: 'All code is written tonight. Open-source libraries, pretrained models and public APIs are allowed; list them in your README.' },
                      { num: '02', title: 'Hidden tests', desc: 'You get sample data now. Final scores use hidden test sets no team sees in advance.' },
                      { num: '03', title: 'The curse counts', desc: 'The Midnight Curse drops at 12:00 AM and is scored in Rounds 2 and 3.' },
                      { num: '04', title: 'Show up', desc: 'Be at your table with a working build for every round. A missed round scores zero.' },
                      { num: '05', title: 'Code freeze 6:45 AM', desc: 'Only your last commit before the freeze is judged.' },
                      { num: '06', title: 'Fair play', desc: 'Attacking other teams is allowed only in the official Track 3 Possession Round. The judges’ decision is final.' },
                    ].map((law) => (
                      <div key={law.num} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'ui-monospace, monospace', color: '#ff7a1a', fontWeight: 800, fontSize: '0.85rem' }}>{law.num}</span>
                          <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{law.title}</strong>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(247, 244, 235, 0.75)', margin: 0, lineHeight: 1.45 }}>{law.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247, 244, 235, 0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  SLIDE 13
                </div>
              </div>
            )}

            {/* SLIDE 14: GLORY (AWARDS) */}
            {currentSlide.type === 'awards' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    GLORY
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    Awards of the night
                  </h1>

                  <div style={{ background: 'rgba(255, 122, 26, 0.12)', border: '1px solid rgba(255, 122, 26, 0.35)', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: '#ffa95c', fontWeight: 800 }}>PRIZE POOL</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>₹9,000</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(247, 244, 235, 0.7)' }}>Split across the awards, announced at the ceremony.</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {[
                      { icon: '🧙', title: 'Grand Sorcerer', desc: 'Overall winner' },
                      { icon: '🌱', title: 'Rising Witch', desc: 'Best first-year team' },
                      { icon: '🛡️', title: 'Exorcist', desc: 'Best defence in the Possession Round' },
                      { icon: '⚡', title: 'Speed Demon', desc: 'Lowest latency on the Phantom Hotline' },
                      { icon: '💀', title: 'Necromancer', desc: 'Best comeback after the Midnight Curse' },
                      { icon: '🎭', title: 'Best Costume', desc: 'Voted at the opening ceremony' },
                    ].map((award, i) => (
                      <div key={i} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{award.icon}</span>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>{award.title}</div>
                          <div style={{ color: 'rgba(247, 244, 235, 0.6)', fontSize: '0.72rem' }}>{award.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247, 244, 235, 0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  SLIDE 14
                </div>
              </div>
            )}

            {/* SLIDE 15: CONTACT & VENUE */}
            {currentSlide.type === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    MIRAI SCHOOL OF TECHNOLOGY
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 20px 0' }}>
                    Venue & Organizers
                  </h1>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '1.4rem' }}>📞</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'rgba(247, 244, 235, 0.6)' }}>HELPLINE</div>
                        <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>7993521335</strong>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '1.4rem' }}>✉️</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'rgba(247, 244, 235, 0.6)' }}>EMAIL</div>
                        <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>vulcan.techclub@gmail.com</strong>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '1.4rem' }}>📍</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', color: 'rgba(247, 244, 235, 0.6)' }}>ADDRESS</div>
                        <p style={{ fontSize: '0.85rem', color: '#f5ead6', margin: 0, lineHeight: 1.4 }}>
                          Survey No. 137, South, Doddakammanahalli, Phase 2, Begur Hobli, Bengaluru, Karnataka 560083
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247, 244, 235, 0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  SLIDE 15
                </div>
              </div>
            )}

            {/* SLIDE 16: EXACT REPLICA OF THE SCREENSHOT */}
            {currentSlide.type === 'midnight_curse' && (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {/* Vertical Japanese Watermark on Right Edge */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '-10px',
                    writingMode: 'vertical-rl',
                    fontFamily: "'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif",
                    fontSize: '0.85rem',
                    letterSpacing: '0.28em',
                    color: '#d69784',
                    opacity: 0.85,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  ハッカーのランタン
                </div>

                {/* Top Section with Kicker and Distressed Stamp */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: 'clamp(0.72rem, 0.2vw + 0.68rem, 0.84rem)',
                          fontWeight: 800,
                          letterSpacing: '0.14em',
                          color: '#d44a2b',
                          textTransform: 'uppercase',
                          marginBottom: '6px',
                        }}
                      >
                        SHOW AT 12:00 AM ONLY
                      </div>
                      <h1
                        style={{
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          fontSize: 'clamp(1.8rem, 3.8vw, 3rem)',
                          fontWeight: 900,
                          color: '#1a1714',
                          margin: 0,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.1,
                        }}
                      >
                        The Midnight Curse has fallen
                      </h1>
                    </div>

                    {/* The Midnight Curse Stamp */}
                    <div
                      style={{
                        transform: 'rotate(-2.5deg)',
                        background: '#d64423',
                        color: '#ffffff',
                        padding: '6px 16px',
                        borderRadius: '3px',
                        boxShadow: '0 3px 10px rgba(214, 68, 35, 0.35)',
                        border: '2px dashed rgba(255, 255, 255, 0.4)',
                        marginRight: '25px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: 'clamp(0.75rem, 0.3vw + 0.7rem, 0.95rem)',
                          fontWeight: 900,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          display: 'inline-block',
                        }}
                      >
                        THE MIDNIGHT CURSE
                      </span>
                    </div>
                  </div>

                  {/* 5 Rows Matching the Exact Screenshot Layout */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', marginRight: '32px' }}>
                    {[
                      { name: 'Potion Pantry', icon: '⚗️', curse: 'A full moon festival is announced for next week. Demand for 3 ingredients triples.' },
                      { name: 'Phantom Hotline', icon: '👻', curse: 'The latency limit drops to 600 ms, and callers switch language mid-sentence.' },
                      { name: 'Possessed Butler', icon: '🧛', curse: "The Possession Round: write curses to attack other teams' butlers. Points for attack and defence." },
                      { name: 'Midnight Crossroads', icon: '🚦', curse: 'A funeral procession (emergency-vehicle priority) and a fog curse on night footage.' },
                      { name: 'Coven of Hospitals', icon: '☠️', curse: 'One hospital is corrupted and sends poisoned updates. Detect it and stay accurate.' },
                    ].map((item) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto minmax(130px, 170px) 1fr',
                          alignItems: 'center',
                          gap: '16px',
                          background: '#ffffff',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: '#e86127',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '1.25rem',
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </div>

                        <div
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            fontWeight: 800,
                            fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)',
                            color: '#1a1714',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {item.name}
                        </div>

                        <div
                          style={{
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                            fontSize: 'clamp(0.85rem, 0.9vw, 0.98rem)',
                            lineHeight: 1.45,
                            color: '#342e28',
                          }}
                        >
                          {item.curse}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer on Slide 16 */}
                <div style={{ marginTop: '20px' }}>
                  <div
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontStyle: 'italic',
                      fontSize: '0.85rem',
                      color: '#6e6255',
                      marginBottom: '10px',
                    }}
                  >
                    Keep this slide hidden until midnight.
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                      paddingTop: '8px',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '0.72rem',
                      color: '#7b6f63',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <span>🎃 HACK-O-LANTERN · VULCAN CLUB × MIRAI SCHOOL OF TECHNOLOGY · POWERED BY BOOM PIZZA</span>
                    <span style={{ fontWeight: 700 }}>16</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Download Deck Bar */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(23, 15, 33, 0.95), rgba(36, 17, 34, 0.95))',
            border: '1px solid rgba(255, 84, 112, 0.35)',
            borderRadius: '16px',
            padding: 'clamp(20px, 3vw, 26px)',
            marginTop: '2rem',
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
              <span>📥 Official Downloads</span>
            </div>
            <p
              style={{
                fontSize: 'clamp(0.9rem, 0.3vw + 0.85rem, 1rem)',
                color: 'var(--event-ink)',
                margin: '4px 0 0 0',
                fontWeight: 500,
              }}
            >
              Download the official <strong>Hack-O-Lantern_Halloween_Hackathon</strong> presentation (.pptx & .pdf):
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="/Hack-O-Lantern_Halloween_Hackathon.pptx"
              download="Hack-O-Lantern_Halloween_Hackathon.pptx"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                background: '#ff7a1a',
                color: '#07090b',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                boxShadow: '0 4px 18px rgba(255, 122, 26, 0.3)',
              }}
            >
              <span>Download PPTX (Official Deck)</span>
              <span>↗</span>
            </a>

            <a
              href="/Hack-O-Lantern_Halloween_Hackathon.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Hack-O-Lantern_Halloween_Hackathon.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                background: 'rgba(165, 139, 255, 0.15)',
                border: '1px solid rgba(165, 139, 255, 0.4)',
                color: '#d4c5ff',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
              }}
            >
              <span>Download PDF (Official Deck)</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
