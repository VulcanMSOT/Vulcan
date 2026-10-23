import { clientIp, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { createRegistration, enforceRateLimit, verifyTurnstile } from './_lib/registration.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  const body = parseBody(request);
  if (body.company) return json(response, 400, { error: 'Unable to register this team.' });
  const ip = clientIp(request);
  try {
    if (!(await enforceRateLimit(ip))) return json(response, 429, { error: 'Too many registration attempts. Please try again in an hour.' });
    const turnstile = await verifyTurnstile(body.turnstileToken, ip);
    if (!turnstile.ok) return json(response, 400, { error: turnstile.reason });
    const result = await createRegistration(body);
    if (result.errors) return json(response, 422, { errors: result.errors });
    const { registration } = result;
    return json(response, 201, {
      ticket: {
        ticketId: registration.ticketId,
        teamName: registration.teamName,
        members: registration.members.map(({ position, fullName }) => ({ position, fullName })),
        verifyUrl: `${process.env.APP_URL || ''}/verify/${registration.ticketId}`,
      },
    });
  } catch (error) {
    console.error('Registration error', error);
    return json(response, 500, { error: 'We could not register your team. Please try again.' });
  }
}
