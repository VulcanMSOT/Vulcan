import { handleCors, json, methodNotAllowed } from './_lib/http.js';
import { getEventSettings } from './_lib/registration.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['GET', 'OPTIONS'])) return;
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);

  try {
    const data = await getEventSettings();
    return json(response, 200, {
      eventName: data.settings.eventName,
      eventDate: data.settings.eventDate,
      eventVenue: data.settings.eventVenue,
      registrationsOpen: data.isOpen,
      closeReason: data.closeReason,
      maxCapacity: data.settings.maxCapacity,
      spotsRemaining: data.spotsRemaining,
      ticketPrice: data.settings.ticketPrice,
      upiId: data.settings.upiId,
      opensAt: data.settings.opensAt,
      closesAt: data.settings.closesAt,
    });
  } catch (error) {
    console.error('Error in event-settings route:', error);
    return json(response, 500, { error: 'Could not load event settings.' });
  }
}
