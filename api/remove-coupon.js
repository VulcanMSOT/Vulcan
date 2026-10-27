import { handleCors, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { removeCoupon } from './_lib/coupons.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['POST', 'OPTIONS'])) return;
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const body = parseBody(request);

    const result = await removeCoupon({
      identifier: body.identifier || body.teamId || body.paymentRef,
      paymentToken: body.paymentToken,
    });

    if (result.error) {
      return json(response, 400, result);
    }

    return json(response, 200, result);
  } catch (error) {
    console.error('Remove coupon error', error);
    return json(response, 500, { error: error.message || 'Could not remove coupon code.' });
  }
}
