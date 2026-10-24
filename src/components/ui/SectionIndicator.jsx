import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'hack-o-lantern', label: 'Hackathon' },
  { id: 'what-we-do', label: 'Pillars' },
  { id: 'events', label: 'Events' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' },
  { id: 'closing', label: 'Connect' },
];

export default function SectionIndicator({ prefersReducedMotion, introSettled = true }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <>
      {/* Background ambient lighting transition across sections */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
          introSettled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          visibility: introSettled ? 'visible' : 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] transition-all duration-700 ${
            activeSection === 'hero'
              ? 'bg-vulcan-gold/[0.035] scale-100'
              : activeSection === 'about'
              ? 'bg-amber-500/[0.045] scale-105'
              : activeSection === 'hack-o-lantern'
              ? 'bg-orange-600/[0.09] scale-110'
              : activeSection === 'what-we-do'
              ? 'bg-vulcan-gold/[0.03] scale-95'
              : activeSection === 'events'
              ? 'bg-amber-600/[0.035] scale-100'
              : activeSection === 'projects'
              ? 'bg-vulcan-gold/[0.04] scale-105'
              : 'bg-vulcan-gold/[0.03] scale-100'
          }`}
        />
      </div>

      {/* Floating Side Section Indicator (Desktop only) */}
      <nav
        aria-label="Section navigation"
        className={`hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3.5 select-none pointer-events-auto transition-opacity duration-500 ${
          introSettled ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          visibility: introSettled ? 'visible' : 'hidden',
        }}
        inert={!introSettled ? '' : undefined}
      >
        {SECTIONS.map((section, index) => {
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className="group relative flex items-center justify-end py-1 px-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-vulcan-gold rounded"
              aria-label={`Scroll to ${section.label} section`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Tooltip Label */}
              <div
                className={`absolute right-7 font-mono text-[11px] tracking-wider uppercase transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1.5 px-2 py-0.5 rounded bg-vulcan-card/95 border border-vulcan-border/80 backdrop-blur-md shadow-lg ${
                  isHovered
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-2'
                }`}
              >
                <span className="text-vulcan-gold">0{index + 1}</span>
                <span className="text-zinc-300">{section.label}</span>
              </div>

              {/* Indicator Dot / Pill */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="active-section-glow"
                    className="absolute -inset-1 rounded-full bg-vulcan-gold/20 blur-[3px]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{
                    width: isActive ? 20 : 6,
                    height: 6,
                    backgroundColor: isActive ? '#F5A623' : '#3f3f46',
                  }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-full group-hover:bg-zinc-400 transition-colors"
                />
              </div>
            </button>
          );
        })}
      </nav>
    </>
  );
}
