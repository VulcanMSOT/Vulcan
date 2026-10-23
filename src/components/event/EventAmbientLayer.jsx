import { useEffect, useState } from 'react';

/**
 * EventAmbientLayer
 * Full-page continuous atmosphere between sections:
 * - Rising gold/orange Vulcan pixel embers
 * - Drifting misty fog depth overlays
 * - Decorative parallax silhouettes (bats, corner cobwebs)
 * - 0 extra canvases, pure GPU-accelerated CSS transforms
 */
export default function EventAmbientLayer({ reducedMotion = false }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  // Staggered embers definition
  const embers = [
    { id: 1, left: '8%', size: 5, delay: '0s', dur: '14s', color: '#ffaa44' },
    { id: 2, left: '18%', size: 7, delay: '3.5s', dur: '17s', color: '#ff7a1a' },
    { id: 3, left: '27%', size: 4, delay: '7s', dur: '12s', color: '#ffd073' },
    { id: 4, left: '42%', size: 6, delay: '1.2s', dur: '15s', color: '#ffaa44' },
    { id: 5, left: '55%', size: 8, delay: '5s', dur: '18s', color: '#ff7a1a' },
    { id: 6, left: '68%', size: 5, delay: '2.8s', dur: '13s', color: '#ffd073' },
    { id: 7, left: '79%', size: 6, delay: '8.2s', dur: '16s', color: '#ffaa44' },
    { id: 8, left: '91%', size: 4, delay: '4.1s', dur: '14s', color: '#ff7a1a' },
    { id: 9, left: '12%', size: 6, delay: '9.5s', dur: '16s', color: '#ffaa44' },
    { id: 10, left: '35%', size: 5, delay: '6.4s', dur: '15s', color: '#ffd073' },
    { id: 11, left: '62%', size: 7, delay: '11s', dur: '19s', color: '#ff7a1a' },
    { id: 12, left: '84%', size: 5, delay: '1.8s', dur: '13s', color: '#ffaa44' },
  ];

  const cobwebOffset = scrollY * 0.08;
  const batOffset = scrollY * 0.14;

  return (
    <div className="event-ambient-layer" aria-hidden="true">
      {/* Drifting Misty Fog Depth Overlays */}
      <div className="event-ambient-fog event-ambient-fog--top" />
      <div className="event-ambient-fog event-ambient-fog--bottom" />

      {/* Parallax Corner Cobwebs */}
      <div
        className="event-ambient-web event-ambient-web--left"
        style={{ transform: `translate3d(0, ${-cobwebOffset}px, 0)` }}
      />
      <div
        className="event-ambient-web event-ambient-web--right"
        style={{ transform: `translate3d(0, ${-cobwebOffset * 0.8}px, 0)` }}
      />

      {/* Floating Silhouette Bat in midground */}
      <div
        className="event-ambient-bat event-ambient-bat--mid"
        style={{ transform: `translate3d(0, ${-batOffset}px, 0)` }}
      >
        <svg viewBox="0 0 64 32" width="38" height="19" fill="currentColor">
          <path d="M32 17c-4-7-10-9-16-9 1 3 1 6-1 9-3-3-8-4-15-3 5 4 9 9 15 11 6 1 12-1 17-5 5 4 11 6 17 5 6-2 10-7 15-11-7-1-12 0-15 3-2-3-2-6-1-9-6 0-12 2-16 9Z" />
        </svg>
      </div>

      {/* Continuous Rising Vulcan Pixel Embers */}
      <div className="event-ambient-embers">
        {embers.map((em) => (
          <span
            key={em.id}
            className="event-ambient-ember"
            style={{
              left: em.left,
              width: `${em.size}px`,
              height: `${em.size}px`,
              animationDelay: em.delay,
              animationDuration: em.dur,
              backgroundColor: em.color,
              boxShadow: `0 0 8px ${em.color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
