import { json, methodNotAllowed, parseBody } from './_lib/http.js';
import { submitPaymentReference } from './_lib/registration.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  try {
    const result = await submitPaymentReference(parseBody(request));
    if (result.error) return json(response, 422, result);
    return json(response, 200, { ok: true, message: 'Payment submitted for organiser review. Your ticket will be issued after it is approved.' });
  } catch (error) {
    console.error('Payment reference error', error);
    return json(response, 500, { error: 'We could not submit that payment reference. Please try again.' });
  }
}
