import { useEffect, useState } from 'react';
import { useLenis } from '../../hooks/useLenis';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import HalloweenHero from './HalloweenHero';
import EventAmbientLayer from './EventAmbientLayer';
import RegistrationForm from './RegistrationForm';
import PaymentPending from './PaymentPending';
import TicketSuccess from './TicketSuccess';
import EventMidnightReveal from './EventMidnightReveal';
import { EventAbout, EventExperience, EventFaq, EventFooter, EventJudges, EventPrizes, EventRules, EventTimeline, EventTracks } from './EventSections';
import './halloween.css';

export default function HalloweenHackPage() {
  const reducedMotion = usePrefersReducedMotion();
  const [flow, setFlow] = useState(() => {
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      if (urlParams?.get('preview') === 'ticket') {
        return {
          type: 'ticket',
          ticket: {
            ticketId: 'VLC-HACK-7721',
            teamName: 'Phantom Three',
            members: [
              { position: 1, fullName: 'Alice' },
              { position: 2, fullName: 'Bob' },
              { position: 3, fullName: 'Charlie' }
            ]
          }
        };
      }
      if (urlParams?.get('preview') === 'payment') {
        return {
          type: 'payment',
          payment: {
            teamId: 'VHK-7777',
            paymentRef: 'PAY-7777',
            orderRef: 'VHK-7777',
            teamName: 'Team Shadow',
            amount: 300,
            listPrice: 300,
          }
        };
      }
      return JSON.parse(window.localStorage.getItem('hack-o-lantern-payment') || 'null');
    } catch { return null; }
  });
  useLenis();

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || reducedMotion) return undefined;

    const moveSpotlight = (event) => {
      document.documentElement.style.setProperty('--event-cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--event-cursor-y', `${event.clientY}px`);
    };

    // Card 3D tilt tracking (6 to 8 deg tilt + moving highlight)
    const handleCardTilt = (event) => {
      const card = event.target.closest('.event-track, .event-faq__item, .event-sealed-card--open');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const normX = (x / rect.width - 0.5) * 2;
      const normY = (y / rect.height - 0.5) * 2;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
      card.style.setProperty('--tilt-rx', `${-normY * 7}deg`);
      card.style.setProperty('--tilt-ry', `${normX * 7}deg`);
    };

    const handleCardLeave = (event) => {
      const card = event.target.closest('.event-track, .event-faq__item, .event-sealed-card--open');
      if (!card) return;
      card.style.setProperty('--tilt-rx', '0deg');
      card.style.setProperty('--tilt-ry', '0deg');
    };

    window.addEventListener('pointermove', moveSpotlight, { passive: true });
    document.addEventListener('pointermove', handleCardTilt, { passive: true });
    document.addEventListener('pointerout', handleCardLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', moveSpotlight);
      document.removeEventListener('pointermove', handleCardTilt);
      document.removeEventListener('pointerout', handleCardLeave);
    };
  }, [reducedMotion]);

  return (
    <main className="event-page">
      <EventAmbientLayer reducedMotion={reducedMotion} />
      {flow?.type === 'ticket' ? (
        <TicketSuccess
          ticket={flow.ticket}
          referralCodes={flow.referralCodes || flow.ticket?.referralCodes}
          referralRewardText={flow.referralRewardText || flow.ticket?.referralRewardText}
          onStartOver={() => {
            window.localStorage.removeItem('hack-o-lantern-payment');
            setFlow(null);
            window.location.hash = 'registration';
          }}
        />
      ) : flow?.type === 'payment' ? (
        <PaymentPending
          payment={flow.payment}
          onTicketIssued={(ticket, fullResult) => {
            window.localStorage.removeItem('hack-o-lantern-payment');
            setFlow({
              type: 'ticket',
              ticket,
              referralCodes: fullResult?.referralCodes || ticket?.referralCodes,
              referralRewardText: fullResult?.referralRewardText || ticket?.referralRewardText,
            });
          }}
          onStartOver={() => {
            window.localStorage.removeItem('hack-o-lantern-payment');
            setFlow(null);
            window.location.hash = 'registration';
          }}
        />
      ) : (
        <>
          <HalloweenHero reducedMotion={reducedMotion} />
          <EventAbout />
          <EventExperience />
          <EventTimeline />
          <EventMidnightReveal />
          <EventJudges />
          <EventTracks />
          <EventRules />
          <EventPrizes />
          <RegistrationForm onRegistered={(payment) => { window.localStorage.setItem('hack-o-lantern-payment', JSON.stringify({ type: 'payment', payment })); setFlow({ type: 'payment', payment }); }} />
          <EventFaq />
          <EventFooter />
        </>
      )}
    </main>
  );
}
