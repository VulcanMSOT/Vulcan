import { handleCors, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { submitPaymentReference } from './_lib/registration.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['POST', 'OPTIONS'])) return;
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const result = await submitPaymentReference(parseBody(request));
    if (result.error) return json(response, 422, result);
    return json(response, 200, {
      ok: true,
      teamId: result.teamId,
      paymentRef: result.paymentRef,
      message: 'Payment reference submitted for organiser review. You can check ticket status anytime using your Team ID.',
    });
  } catch (error) {
    console.error('Payment reference error', error);
    return json(response, 500, { error: 'We could not submit that payment reference. Please try again.' });
  }
}
