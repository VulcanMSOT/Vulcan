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
