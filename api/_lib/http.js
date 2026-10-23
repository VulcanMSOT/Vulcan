export function getAllowedOrigins() {
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://vulcan-club.vercel.app',
    'https://admin-haloween.vercel.app',
  ];

  return Array.from(new Set([...defaults, ...envOrigins]));
}

export function handleCors(request, response, allowedMethods = ['GET', 'POST', 'OPTIONS']) {
  const origin = request.headers.origin;
  const allowed = getAllowedOrigins();

  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (origin && allowed.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
    response.setHeader('Access-Control-Allow-Headers', 'authorization, apikey, content-type');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return true;
  }

  return false;
}

export function json(response, status, body, extraHeaders = {}) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  Object.entries(extraHeaders).forEach(([key, value]) => response.setHeader(key, value));
  response.end(JSON.stringify(body));
}

export function methodNotAllowed(response, methods) {
  return json(response, 405, { error: 'Method not allowed.' }, { Allow: methods.join(', ') });
}

export function parseBody(request) {
  if (typeof request.body === 'object' && request.body !== null) return request.body;
  if (typeof request.body !== 'string') return {};
  try { return JSON.parse(request.body); } catch { return {}; }
}

export function clientIp(request) {
  return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket?.remoteAddress || 'unknown';
}
