import { handleCors, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { lookupRegistrationStatus } from './_lib/registration.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['POST', 'OPTIONS'])) return;
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const { identifier, orderRef, email } = parseBody(request);
    const lookupKey = identifier || orderRef;
    const result = await lookupRegistrationStatus({ identifier: lookupKey, email });
    if (result.error) return json(response, 404, result);
    return json(response, 200, result);
  } catch (error) {
    console.error('Payment lookup error', error);
    return json(response, 500, { error: 'We could not check your registration status. Please try again.' });
  }
}
