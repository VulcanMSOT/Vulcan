import { useEffect, useState } from 'react';
import { useLenis } from '../../hooks/useLenis';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import HalloweenHero from './HalloweenHero';
import RegistrationForm from './RegistrationForm';
import PaymentPending from './PaymentPending';
import TicketSuccess from './TicketSuccess';
import { EventAbout, EventExperience, EventFaq, EventFooter, EventPrizes, EventRules, EventTimeline, EventTracks } from './EventSections';
import './halloween.css';

export default function HalloweenHackPage() {
  const reducedMotion = usePrefersReducedMotion();
  const [flow, setFlow] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('hack-o-lantern-payment') || 'null'); } catch { return null; }
  });
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
      {flow?.type === 'ticket' ? <TicketSuccess ticket={flow.ticket} onStartOver={() => { window.localStorage.removeItem('hack-o-lantern-payment'); setFlow(null); window.location.hash = 'registration'; }} /> : flow?.type === 'payment' ? <PaymentPending payment={flow.payment} onTicketIssued={(ticket) => { window.localStorage.removeItem('hack-o-lantern-payment'); setFlow({ type: 'ticket', ticket }); }} onStartOver={() => { window.localStorage.removeItem('hack-o-lantern-payment'); setFlow(null); window.location.hash = 'registration'; }} /> : <>
        <HalloweenHero reducedMotion={reducedMotion} />
        <EventAbout />
        <EventExperience />
        <EventTimeline />
        <EventTracks />
        <EventRules />
        <EventPrizes />
        <RegistrationForm onRegistered={(payment) => { window.localStorage.setItem('hack-o-lantern-payment', JSON.stringify({ type: 'payment', payment })); setFlow({ type: 'payment', payment }); }} />
        <EventFaq />
        <EventFooter />
      </>}
    </main>
  );
}
