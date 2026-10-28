import { handleCors, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { checkReferralRateLimit, recordFailedReferralAttempt, validateReferralCode } from './_lib/referral.js';

export default async function handler(request, response) {
  if (handleCors(request, response, ['POST', 'OPTIONS'])) return;
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);

  try {
    const forwarded = request.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (request.socket?.remoteAddress || '127.0.0.1');

    const rateLimit = await checkReferralRateLimit(ip);
    if (!rateLimit.ok) {
      return json(response, 429, { error: rateLimit.error });
    }

    const body = parseBody(request);
    const code = body.code;
    const teamMembers = Array.isArray(body.teamMembers) ? body.teamMembers : [];

    const validation = await validateReferralCode(code, { teamMembers });
    if (!validation.valid) {
      await recordFailedReferralAttempt(ip);
      return json(response, 400, { error: validation.error });
    }

    return json(response, 200, {
      ok: true,
      code: validation.code,
      message: 'Referral code applied',
    });
  } catch (error) {
    console.error('Referral check error', error);
    return json(response, 500, { error: "That referral code isn't valid." });
  }
}
