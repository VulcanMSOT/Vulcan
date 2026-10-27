import { handleCors, json, methodNotAllowed } from './_lib/http.js';
import { getEventSettings } from './_lib/registration.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['GET', 'OPTIONS'])) return;
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);

  try {
    const data = await getEventSettings();
    const settings = data.settings;
    const now = new Date();

    const startIso = '2026-10-31T13:30:00.000Z'; // 31 Oct 2026, 7:00 PM IST
    const endIso = '2026-11-01T05:30:00.000Z';   // 1 Nov 2026, 11:00 AM IST

    let registrationState = 'open';
    if (!data.isOpen) {
      if (data.spotsRemaining <= 0) {
        registrationState = 'full';
      } else {
        registrationState = 'closed';
      }
    }

    if (now >= new Date(startIso) && now <= new Date(endIso)) {
      registrationState = 'live';
    } else if (now > new Date(endIso)) {
      registrationState = 'ended';
    }

    response.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');

    return json(response, 200, {
      eventName: settings.eventName || 'Hack-O-Lantern',
      registrationState,
      isOpen: data.isOpen,
      closeReason: data.closeReason || null,
      startIso,
      endIso,
      dateLabel: '31 October, 7:00 PM',
      durationLabel: '12 hours',
      fee: settings.ticketPrice ?? 300,
      entryLabel: `₹${settings.ticketPrice ?? 300} per team`,
      deadline: settings.closesAt || '2026-10-30T18:29:59.000Z',
      spotsRemaining: typeof data.spotsRemaining === 'number' ? data.spotsRemaining : null,
    });
  } catch (error) {
    console.error('Error in event-status route:', error);
    // Graceful fallback for visitors
    return json(response, 200, {
      eventName: 'Hack-O-Lantern',
      registrationState: 'open',
      isOpen: true,
      closeReason: null,
      startIso: '2026-10-31T13:30:00.000Z',
      endIso: '2026-11-01T01:30:00.000Z',
      dateLabel: '31 October, 7:00 PM',
      durationLabel: '12 hours',
      fee: 300,
      entryLabel: '₹300 per team',
      deadline: '2026-10-30T18:29:59.000Z',
      spotsRemaining: 25,
    });
  }
}
