import { handleCors, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { applyCoupon } from './_lib/coupons.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['POST', 'OPTIONS'])) return;
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const body = parseBody(request);
    const forwarded = request.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (request.socket?.remoteAddress || '127.0.0.1');

    const result = await applyCoupon({
      identifier: body.identifier || body.teamId || body.paymentRef,
      paymentToken: body.paymentToken,
      code: body.code,
      ip,
    });

    if (result.error) {
      return json(response, 400, result);
    }

    return json(response, 200, result);
  } catch (error) {
    console.error('Apply coupon error', error);
    return json(response, 500, { error: error.message || 'Could not apply coupon code.' });
  }
}
