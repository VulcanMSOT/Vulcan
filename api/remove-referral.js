import { handleCors, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { removeReferralFromRegistration } from './_lib/referral.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['POST', 'OPTIONS'])) return;
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const body = parseBody(request);
    const result = await removeReferralFromRegistration({
      identifier: body.identifier || body.teamId || body.paymentRef,
      paymentToken: body.paymentToken,
    });

    if (result.error) {
      return json(response, 400, result);
    }

    return json(response, 200, result);
  } catch (error) {
    console.error('Remove referral error', error);
    return json(response, 500, { error: 'Could not remove referral code.' });
  }
}
