import React, { useRef, useState, useEffect } from 'react';

const SLIDES = [
  {
    id: 1,
    slideNumber: '01',
    label: 'Overview',
    badge: 'Kickoff',
    title: 'Hack-O-Lantern: Halloween Night Hackathon',
    subtitle: 'Five cursed problems. One endless night. Only ten survive till dawn.',
    type: 'overview',
    content: {
      date: 'NIGHT OF 31 OCT 2026',
      doors: '8:00 PM',
      finale: '9:30 AM',
      evals: '3 rounds + final',
      tracks: [
        { num: '01', icon: '🎃', name: "The Witch's Potion Pantry", desc: 'Smart inventory & demand prediction', tag: '1st Year Only' },
        { num: '02', icon: '👻', name: 'The Midnight Phantom Hotline', desc: 'Hinglish voice agent under 800 ms', tag: 'AI + Systems' },
        { num: '03', icon: '🧛', name: 'The Possessed Butler', desc: 'Prompt-injection-proof AI agent', tag: 'AI Security' },
        { num: '04', icon: '🧟', name: 'The Midnight Crossroads', desc: 'Indian traffic signal optimizer', tag: 'CV + RL' },
        { num: '05', icon: '💀', name: 'The Coven of Five Hospitals', desc: 'Federated learning across hospitals', tag: 'Privacy + ML' },
      ],
      warning: 'Beware: at the stroke of midnight, every track will be cursed.',
    },
  },
  {
    id: 2,
    slideNumber: '02',
    label: 'Track 01',
    badge: '1st Year Only',
    title: "Track 01: The Witch's Potion Pantry",
    subtitle: 'AI + Full Stack + Web + Android',
    type: 'track',
    content: {
      story: 'Madam Hexley runs the busiest potion shop in the village. Every Halloween she runs out of bat wings, mandrake root and ghost pepper at the worst moment, and angry customers turn into frogs. Build her a smart pantry.',
      questItems: [
        'Track stock across her shelves: add, update and record what was sold.',
        'Prophecy: predict which ingredients will run out, and when.',
        'Restock spell: recommend how much of each ingredient to reorder.',
        'Strange happenings: flag unusual consumption, such as sudden spikes or missing stock.',
        'Crystal ball: charts of demand for each product over time.',
        'Build both a web dashboard and an Android app connected to the same backend.',
      ],
      scoredOn: 'Prediction accuracy on hidden future sales data, anomalies caught, working web + Android app, and user experience.',
      curse: 'A full moon festival is announced for next week, and demand for 3 ingredients will triple. Your system must handle the sudden seasonal spike.',
    },
  },
  {
    id: 3,
    slideNumber: '03',
    label: 'Track 02',
    badge: 'Voice AI',
    title: 'Track 02: The Midnight Phantom Hotline',
    subtitle: 'AI + Systems',
    type: 'track',
    content: {
      story: 'Ghosts keep calling the clinic and the haunted railway station, speaking a mix of Hindi and English, with chains rattling in the background and a signal weaker than a dying candle. Build an operator who never misses a call.',
      questItems: [
        'A voice assistant that books doctor appointments or answers railway queries in code-mixed Hinglish.',
        'Handles interruptions, background noise and a 3G-level connection.',
        'Replies within 800 ms end to end, before the candle flickers.',
      ],
      scoredOn: 'Task completion rate on hidden test calls, and latency.',
      hardWhy: "Streaming speech-to-text, turn-taking and the latency budget pull against each other.",
      curse: 'The latency limit drops to 600 ms, or callers start switching languages mid-sentence.',
    },
  },
  {
    id: 4,
    slideNumber: '04',
    label: 'Track 03',
    badge: 'AI Security',
    title: 'Track 03: The Possessed Butler',
    subtitle: 'AI Security',
    type: 'track',
    content: {
      story: "Count Byteula's mansion is run by an AI butler who reads letters, browses the cursed web and sends messages for his master. Dark spirits have hidden curses in letters, web pages and scrolls, waiting to possess him.",
      questItems: [
        'Build an LLM agent that reads emails, browses web pages and takes actions like sending mail or editing files.',
        'Protect it from possession: the organizers hide prompt injections in emails, web pages and PDFs that try to make it leak secrets or act against its master.',
      ],
      scoredOn: 'Tasks completed minus successful possessions.',
      hardWhy: "There's no single known fix, so teams must design an architecture, not apply a patch.",
      curse: "The Possession Round: teams write curses to attack each other's butlers, scoring points for both defence and attack.",
    },
  },
  {
    id: 5,
    slideNumber: '05',
    label: 'Track 04',
    badge: 'CV + RL',
    title: 'Track 04: The Midnight Crossroads',
    subtitle: 'Computer Vision + Reinforcement Learning',
    type: 'track',
    content: {
      story: 'At the cursed crossroads, autos, bikes, buses, wandering cattle and the occasional zombie crawl with no lane discipline. Every red light lasts an eternity, and souls are stuck in traffic forever. Free them.',
      questItems: [
        'The All-Seeing Eye: from CCTV-style video of mixed Indian traffic, estimate how many vehicles are queued at each approach.',
        'The Signal Spell: control the traffic lights in the SUMO simulator to cut average wait time.',
      ],
      scoredOn: 'Reduction in average wait time on unseen junction scenarios.',
      hardWhy: 'Real-world vision feeds a control loop, and test scenarios differ from training.',
      curse: 'A funeral procession (emergency-vehicle priority route) and a fog curse (low-visibility night footage) both hit the crossroads.',
    },
  },
  {
    id: 6,
    slideNumber: '06',
    label: 'Track 05',
    badge: 'Privacy + ML',
    title: 'Track 05: The Coven of Five Hospitals',
    subtitle: 'Privacy + Machine Learning',
    type: 'track',
    content: {
      story: "Five haunted hospitals each guard their patients' secrets. They must work together to diagnose a mysterious plague, but their oath forbids sharing records. Meanwhile the Soul Thief lurks, trying to discover whose records trained the model.",
      questItems: [
        'Train a diagnostic model across 5 simulated hospitals whose data is skewed differently.',
        'No raw data leaves any hospital (federated learning).',
        'Stay within a differential-privacy budget.',
        'Survive the Soul Thief’s membership-inference attacks.',
      ],
      scoredOn: 'Model accuracy, how much the attacks reveal, and communication cost.',
      curse: 'One hospital is corrupted and starts sending poisoned model updates. Detect it and stay accurate.',
    },
  },
  {
    id: 7,
    slideNumber: '07',
    label: 'Rules',
    badge: "Coven's Laws",
    title: "The Coven's Laws",
    subtitle: 'Rules of the Night',
    type: 'rules',
    content: {
      rules: [
        'All code must be written during the hackathon. Open-source libraries, pretrained models and public APIs are allowed; declare them in your README.',
        'Sample data is released at kickoff. Final scoring uses hidden test sets that no team sees in advance.',
        'The Midnight Curse is revealed at 12:00 AM and is part of Round 2 and Round 3 scoring.',
        'Teams must be present with a working build at every evaluation round. Missing a round scores zero for that round.',
        'Code freeze at 6:45 AM. Only the commit pushed before the freeze is evaluated.',
        'Attacking other teams’ systems is allowed only in the official Track 3 Possession Round.',
        'The judges’ decision is final.',
      ],
    },
  },
  {
    id: 8,
    slideNumber: '08',
    label: 'Schedule',
    badge: 'Timeline',
    title: 'The Night',
    subtitle: 'Schedule of the Damned',
    type: 'schedule',
    content: {
      milestones: [
        { time: '8:00 PM', icon: '🎃', title: 'Opening ceremony', desc: 'Track reveal, team check-in, costume parade' },
        { time: '12:00 AM', icon: '🌑', title: 'The Midnight Curse', desc: 'Each track’s twist is revealed' },
        { time: '1:00 AM', icon: '👻', title: 'Round 1 · The First Haunting', desc: 'Architecture and baseline check (No elimination)' },
        { time: '3:00 AM', icon: '🦇', title: 'Witching-hour snack drop', desc: 'Refuel. Dawn is still far away.' },
        { time: '4:00 AM', icon: '🧛', title: 'Round 2 · The Witching Hour Trial', desc: 'Public test set metrics & curse progress' },
        { time: '6:45 AM', icon: '⚰️', title: 'Code freeze', desc: 'The graves are sealed' },
        { time: '7:00 AM', icon: '💀', title: 'Round 3 · The Graveyard Cut', desc: 'Elimination · Top 10 advance to finals' },
        { time: '8:30 AM', icon: '📜', title: 'Top 10 announced', desc: 'The survivors are named' },
        { time: '9:30 AM', icon: '🔮', title: 'Final · The Grand Séance', desc: '8 min presentation + 4 min judge Q&A' },
        { time: '11:30 AM', icon: '👑', title: 'Awards ceremony', desc: 'The night ends' },
      ],
    },
  },
  {
    id: 9,
    slideNumber: '09',
    label: 'Judgement',
    badge: 'Weights',
    title: 'Judgement & Awards',
    subtitle: 'How the living are judged',
    type: 'judgement',
    content: {
      weights: [
        { round: 'Round 1 · 1:00 AM', weight: '15%', name: 'The First Haunting', focus: 'Architecture, CRUD, and basic flow working end to end.' },
        { round: 'Round 2 · 4:00 AM', weight: '25%', name: 'The Witching Hour Trial', focus: 'Public test set metrics, pipeline responsiveness, and curse progress.' },
        { round: 'Round 3 · 7:00 AM', weight: '60%', name: 'The Graveyard Cut', focus: 'Hidden test sets, live attacks (Tracks 3 & 5), and Midnight Curse mastery.' },
      ],
      awards: [
        { icon: '🧙', title: 'Grand Sorcerer', desc: 'Overall winner' },
        { icon: '🌱', title: 'Rising Witch', desc: 'Best first-year team (Track 1)' },
        { icon: '🛡️', title: 'Exorcist', desc: 'Best defence in the Possession Round' },
        { icon: '⚡', title: 'Speed Demon', desc: 'Lowest latency on the Phantom Hotline' },
        { icon: '💀', title: 'Necromancer', desc: 'Best comeback after the Midnight Curse' },
        { icon: '🎭', title: 'Best Costume', desc: 'Voted at the opening parade' },
      ],
    },
  },
  {
    id: 16,
    slideNumber: '16',
    label: 'Slide 16: Midnight Curse',
    badge: 'OFFICIAL SLIDE',
    title: 'The Midnight Curse has fallen',
    subtitle: 'SHOW AT 12:00 AM ONLY',
    type: 'midnight_curse_exact',
    content: {
      kicker: 'SHOW AT 12:00 AM ONLY',
      heading: 'The Midnight Curse has fallen',
      tracks: [
        {
          name: 'Potion Pantry',
          iconType: 'cauldron',
          curse: 'A full moon festival is announced for next week. Demand for 3 ingredients triples.',
        },
        {
          name: 'Phantom Hotline',
          iconType: 'ghost',
          curse: 'The latency limit drops to 600 ms, and callers switch language mid-sentence.',
        },
        {
          name: 'Possessed Butler',
          iconType: 'vampire',
          curse: "The Possession Round: write curses to attack other teams' butlers. Points for attack and defence.",
        },
        {
          name: 'Midnight Crossroads',
          iconType: 'crossroads',
          curse: 'A funeral procession (emergency-vehicle priority) and a fog curse on night footage.',
        },
        {
          name: 'Coven of Hospitals',
          iconType: 'skull',
          curse: 'One hospital is corrupted and sends poisoned updates. Detect it and stay accurate.',
        },
      ],
      hiddenNote: 'Keep this slide hidden until midnight.',
      footerText: '🎃 HACK-O-LANTERN · VULCAN CLUB × MIRAI SCHOOL OF TECHNOLOGY · POWERED BY BOOM PIZZA',
      pageNumber: '16',
    },
  },
];

export default function EventMidnightReveal() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(9); // Default to Slide 16 (index 9)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideContainerRef = useRef(null);

  const currentSlide = SLIDES[currentSlideIndex];

  const goToPrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
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
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(134, 59, 255, 0.2), transparent 70%), linear-gradient(180deg, #07090b 0%, #0d0914 30%, #110c1c 70%, #07090b 100%)',
        borderTop: '1px solid rgba(255, 84, 112, 0.3)',
        borderBottom: '1px solid rgba(247, 244, 235, 0.1)',
        padding: 'clamp(3rem, 6vw, 5rem) 0',
        overflow: 'hidden',
      }}
    >
      <div className="event-section-inner">
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '2rem' }}>
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
              OFFICIAL PRESENTATION DECK & MIDNIGHT CURSES
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
            Hack-O-Lantern <span style={{ color: '#ff5470', textShadow: '0 0 24px rgba(255, 84, 112, 0.5)' }}>Slide Deck</span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 0.4vw + 0.95rem, 1.15rem)',
              lineHeight: 1.6,
              color: 'var(--event-muted)',
              margin: 0,
            }}
          >
            View the complete official event presentation slides below, including the full problem statements, schedule, judging rules, and the unredacted <strong>Slide 16 Midnight Curse</strong>.
          </p>
        </div>

        {/* Slide Selector Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '16px',
            scrollbarWidth: 'thin',
          }}
        >
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            const isSlide16 = slide.id === 16;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isActive
                    ? isSlide16
                      ? '1px solid #ff5470'
                      : '1px solid #ff7a1a'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive
                    ? isSlide16
                      ? 'linear-gradient(135deg, rgba(255, 84, 112, 0.25), rgba(255, 122, 26, 0.2))'
                      : 'rgba(255, 122, 26, 0.18)'
                    : 'rgba(23, 17, 34, 0.6)',
                  color: isActive ? '#ffffff' : 'rgba(247, 244, 235, 0.7)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <span>{slide.label}</span>
                {isSlide16 && (
                  <span
                    style={{
                      background: '#ff5470',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    CURSE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Presentation Slide Stage */}
        <div
          ref={slideContainerRef}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: isFullscreen ? '100vw' : '1100px',
            height: isFullscreen ? '100vh' : 'auto',
            margin: '0 auto',
            background: isFullscreen ? '#07090b' : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: isFullscreen ? '0' : '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
            border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Top Bar inside Stage */}
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
              <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#ffa95c' }}>
                SLIDE {currentSlide.slideNumber} OF 16
              </span>
              <span style={{ color: 'rgba(247, 244, 235, 0.4)' }}>|</span>
              <span style={{ color: 'rgba(247, 244, 235, 0.8)', fontWeight: 600 }}>
                {currentSlide.title}
              </span>
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
                title="Toggle Fullscreen Projector Mode"
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

          {/* Slide Frame Body (Aspect Ratio 16:9) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: isFullscreen ? 'calc(100vh - 50px)' : '580px',
              background: currentSlide.type === 'midnight_curse_exact' ? '#f4ece1' : '#140f20',
              color: currentSlide.type === 'midnight_curse_exact' ? '#1a1714' : '#f5ead6',
              padding: 'clamp(24px, 4vw, 44px)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: currentSlide.type === 'midnight_curse_exact' ? "Georgia, 'Times New Roman', serif" : 'inherit',
              transition: 'background 200ms ease',
            }}
          >
            {/* SLIDE 16: EXACT REPLICA OF THE SCREENSHOT */}
            {currentSlide.type === 'midnight_curse_exact' ? (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                        {currentSlide.content.kicker}
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
                        {currentSlide.content.heading}
                      </h1>
                    </div>

                    {/* The Midnight Curse Stamp (Rotated, distressed look) */}
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
                    {currentSlide.content.tracks.map((item) => (
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
                        {/* Rounded Orange Graphic Icon */}
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
                          {item.iconType === 'cauldron' && '⚗️'}
                          {item.iconType === 'ghost' && '👻'}
                          {item.iconType === 'vampire' && '🧛'}
                          {item.iconType === 'crossroads' && '🚦'}
                          {item.iconType === 'skull' && '☠️'}
                        </div>

                        {/* Track Name */}
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

                        {/* Single-Sentence Curse Description */}
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
                    {currentSlide.content.hiddenNote}
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
                    <span>{currentSlide.content.footerText}</span>
                    <span style={{ fontWeight: 700 }}>{currentSlide.content.pageNumber}</span>
                  </div>
                </div>
              </div>
            ) : currentSlide.type === 'overview' ? (
              /* SLIDE 1: OVERVIEW */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>
                    MIRAI SCHOOL OF TECHNOLOGY · MSOT
                  </div>
                  <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                    Halloween Night Hackathon
                  </h1>
                  <p style={{ fontSize: '1.1rem', color: '#a58bff', fontStyle: 'italic', margin: '0 0 24px 0' }}>
                    &ldquo;{currentSlide.subtitle}&rdquo;
                  </p>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(247,244,235,0.6)', display: 'block' }}>NIGHT OF</span>
                      <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>31 Oct 2026</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(247,244,235,0.6)', display: 'block' }}>DOORS OPEN</span>
                      <strong style={{ color: '#ff7a1a', fontSize: '0.95rem' }}>8:00 PM</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(247,244,235,0.6)', display: 'block' }}>GRAND FINALE</span>
                      <strong style={{ color: '#8be04e', fontSize: '0.95rem' }}>9:30 AM</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(247,244,235,0.6)', display: 'block' }}>EVALUATIONS</span>
                      <strong style={{ color: '#4cc9f0', fontSize: '0.95rem' }}>3 Rounds + Finals</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {currentSlide.content.tracks.map((t) => (
                      <div key={t.num} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{t.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'rgba(247,244,235,0.6)' }}>{t.desc}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontFamily: 'ui-monospace, monospace', color: '#ffa95c', background: 'rgba(255,122,26,0.15)', padding: '2px 6px', borderRadius: '4px' }}>{t.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#ff5470', fontFamily: 'ui-monospace, monospace' }}>
                  <span>{currentSlide.content.warning}</span>
                  <span style={{ color: 'rgba(247,244,235,0.5)' }}>PAGE 1</span>
                </div>
              </div>
            ) : currentSlide.type === 'track' ? (
              /* SLIDES 2-6: INDIVIDUAL TRACK PROBLEM STATEMENTS */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800 }}>
                      {currentSlide.subtitle}
                    </span>
                    <span style={{ padding: '3px 10px', borderRadius: '9999px', background: 'rgba(255, 122, 26, 0.2)', border: '1px solid rgba(255, 122, 26, 0.4)', color: '#ff7a1a', fontSize: '0.72rem', fontWeight: 700 }}>
                      {currentSlide.badge}
                    </span>
                  </div>

                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 12px 0' }}>
                    {currentSlide.title}
                  </h1>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderLeft: '4px solid #ff7a1a', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '18px', fontSize: '0.92rem', lineHeight: 1.5, color: '#f5ead6' }}>
                    {currentSlide.content.story}
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.76rem', fontFamily: 'ui-monospace, monospace', color: '#4cc9f0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                      YOUR QUEST:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: 'rgba(247,244,235,0.85)', lineHeight: 1.45 }}>
                      {currentSlide.content.questItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.82rem', marginBottom: '14px' }}>
                    <strong style={{ color: '#ffffff' }}>SCORED ON: </strong>
                    <span style={{ color: 'rgba(247,244,235,0.8)' }}>{currentSlide.content.scoredOn}</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 84, 112, 0.12)', border: '1px solid rgba(255, 84, 112, 0.35)', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem', color: '#ff8da1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px' }}>
                    🌑 MIDNIGHT CURSE
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#fff1f3', fontWeight: 600 }}>
                    {currentSlide.content.curse}
                  </div>
                </div>
              </div>
            ) : currentSlide.type === 'rules' ? (
              /* SLIDE 7: RULES */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, marginBottom: '6px' }}>
                    GUIDELINES OF THE COVEN
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    {currentSlide.title}
                  </h1>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentSlide.content.rules.map((rule, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontFamily: 'ui-monospace, monospace', color: '#ff7a1a', fontWeight: 800, fontSize: '0.85rem' }}>{idx + 1}.</span>
                        <span style={{ fontSize: '0.88rem', lineHeight: 1.45, color: '#f5ead6' }}>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247,244,235,0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  MSOT Halloween Night Hackathon · Page 4
                </div>
              </div>
            ) : currentSlide.type === 'schedule' ? (
              /* SLIDE 8: SCHEDULE */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, marginBottom: '6px' }}>
                    OVERNIGHT TIMELINE
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    {currentSlide.title}: {currentSlide.subtitle}
                  </h1>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {currentSlide.content.milestones.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#ff7a1a', fontSize: '0.82rem', fontFamily: 'ui-monospace, monospace' }}>{m.time}</strong>
                            <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>{m.title}</span>
                          </div>
                          <div style={{ color: 'rgba(247,244,235,0.6)', fontSize: '0.75rem' }}>{m.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247,244,235,0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  MSOT Halloween Night Hackathon · Page 5
                </div>
              </div>
            ) : (
              /* SLIDE 9: JUDGEMENT */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem', color: '#ffa95c', fontWeight: 800, marginBottom: '6px' }}>
                    SCORE WEIGHTS & AWARDS
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0' }}>
                    {currentSlide.title}
                  </h1>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {currentSlide.content.weights.map((w, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff7a1a', fontFamily: 'ui-monospace, monospace' }}>{w.weight}</div>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{w.round}</div>
                        <div style={{ color: 'rgba(247,244,235,0.6)', fontSize: '0.75rem', lineHeight: 1.4 }}>{w.focus}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {currentSlide.content.awards.map((a, idx) => (
                      <div key={idx} style={{ background: 'rgba(165, 139, 255, 0.08)', border: '1px solid rgba(165, 139, 255, 0.2)', borderRadius: '8px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                        <div>
                          <div style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 700 }}>{a.title}</div>
                          <div style={{ color: 'rgba(247,244,235,0.6)', fontSize: '0.72rem' }}>{a.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', fontSize: '0.75rem', color: 'rgba(247,244,235,0.5)', fontFamily: 'ui-monospace, monospace' }}>
                  MSOT Halloween Night Hackathon · Page 6
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Download Deck Bar with All PDFs */}
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
              Download the complete multi-page slide deck, problem statements, and midnight curses for your team:
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="/Hack-O-Lantern_Complete_Guide_And_Curse.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Hack-O-Lantern_Complete_Guide_And_Curse.pdf"
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
              <span>Download Full 7-Page Deck PDF</span>
              <span>↗</span>
            </a>

            <a
              href="/MSOT_Halloween_Night_Hackathon.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="MSOT_Halloween_Night_Hackathon.pdf"
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
              <span>Problem Statements (6 Pages)</span>
              <span>↗</span>
            </a>

            <a
              href="/Hack-O-Lantern_Midnight_Reveal.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Hack-O-Lantern_Midnight_Reveal.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 84, 112, 0.15)',
                border: '1px solid rgba(255, 84, 112, 0.35)',
                color: '#ff8da1',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
              }}
            >
              <span>Slide 16 Curse Only</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
