import { useEffect, useState } from 'react';
import { useLenis } from '../../hooks/useLenis';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import HalloweenHero from './HalloweenHero';
import RegistrationForm from './RegistrationForm';
import TicketSuccess from './TicketSuccess';
import { EventAbout, EventFaq, EventFooter, EventPrizesSponsors, EventRules, EventTimeline, EventTracks } from './EventSections';
import './halloween.css';

export default function HalloweenHackPage() {
  const reducedMotion = usePrefersReducedMotion();
  const [ticket, setTicket] = useState(null);
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
      {ticket ? <TicketSuccess ticket={ticket} onStartOver={() => { setTicket(null); window.location.hash = 'registration'; }} /> : <>
        <HalloweenHero reducedMotion={reducedMotion} />
        <EventAbout />
        <EventTimeline />
        <EventTracks />
        <EventRules />
        <EventPrizesSponsors />
        <RegistrationForm onRegistered={setTicket} />
        <EventFaq />
        <EventFooter />
      </>}
    </main>
  );
}
