import { handleCors, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { paymentTicketStatus } from './_lib/registration.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['POST', 'OPTIONS'])) return;
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const result = await paymentTicketStatus(parseBody(request));
    if (result.error) return json(response, 404, result);
    return json(response, 200, result);
  } catch (error) {
    console.error('Payment status error', error);
    return json(response, 500, { error: 'We could not check payment status. Please try again.' });
  }
}
