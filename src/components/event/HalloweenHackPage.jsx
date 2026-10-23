import { useEffect } from 'react';
import { useLenis } from '../../hooks/useLenis';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import HalloweenHero from './HalloweenHero';
import './halloween.css';

export default function HalloweenHackPage() {
  const reducedMotion = usePrefersReducedMotion();
  useLenis();

  useEffect(() => {
    const moveSpotlight = (event) => {
      document.documentElement.style.setProperty('--event-cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--event-cursor-y', `${event.clientY}px`);
    };
    if (!window.matchMedia('(pointer: fine)').matches || reducedMotion) return undefined;
    window.addEventListener('pointermove', moveSpotlight, { passive: true });
    return () => window.removeEventListener('pointermove', moveSpotlight);
  }, [reducedMotion]);

  return (
    <main className="event-page">
      <HalloweenHero reducedMotion={reducedMotion} />
      <span id="registration" className="event-registration-anchor" aria-hidden="true" />
    </main>
  );
}
