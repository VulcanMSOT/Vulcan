import { clientIp, json, methodNotAllowed, parseBody } from './_lib/http.js';
import { createRegistration, enforceRateLimit, manualPaymentDetails, verifyTurnstile } from './_lib/registration.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  const body = parseBody(request);
  if (body.company) return json(response, 400, { error: 'Unable to register this team.' });
  const payment = manualPaymentDetails('registration');
  if (!payment) return json(response, 503, { error: 'Payments are not configured yet. Please try again later.' });
  const ip = clientIp(request);
  try {
    if (!(await enforceRateLimit(ip))) return json(response, 429, { error: 'Too many registration attempts. Please try again in an hour.' });
    const turnstile = await verifyTurnstile(body.turnstileToken, ip);
    if (!turnstile.ok) return json(response, 400, { error: turnstile.reason });
    const result = await createRegistration(body);
    if (result.errors) return json(response, 422, { errors: result.errors });
    const { registration, paymentToken } = result;
    const currentPayment = manualPaymentDetails(registration.id);
    return json(response, 201, {
      payment: {
        registrationId: registration.id,
        paymentToken,
        teamName: registration.teamName,
        amount: currentPayment.amount,
        vpa: currentPayment.vpa,
        upiUri: currentPayment.uri,
      },
    });
  } catch (error) {
    console.error('Registration error', error);
    return json(response, 500, { error: 'We could not register your team. Please try again.' });
  }
}
