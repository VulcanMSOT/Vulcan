/**
 * Centralized API fetch wrapper for Vulcan with consistent base URL,
 * explicit JSON content-type guards, and clear development error reporting.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Perform an API request with guaranteed JSON parsing and descriptive errors.
 * @param {string} endpoint - API path, e.g. '/api/register' or 'api/event-settings'
 * @param {RequestInit} [options] - Standard fetch options
 * @returns {Promise<any>} Parsed JSON response body
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    const isDev = import.meta.env.DEV;
    const msg = isDev
      ? `[API Network Error] Could not connect to ${url}: ${networkError.message}. Make sure your local dev server or VITE_API_BASE_URL is reachable.`
      : 'Network connection failed. Please check your internet connection and try again.';
    const err = new Error(msg);
    err.original = networkError;
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const rawText = await response.text().catch(() => '');
    const isDev = import.meta.env.DEV;
    const snippet = rawText.slice(0, 140).replace(/\s+/g, ' ').trim();
    const devDetails = isDev
      ? ` (Status: ${response.status} ${response.statusText}, Received Content-Type: '${contentType || 'none'}', Payload snippet: "${snippet}")`
      : '';
    const err = new Error(`Server returned non-JSON response from ${cleanEndpoint}${devDetails}`);
    err.status = response.status;
    err.rawResponse = rawText;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    const err = new Error(`Malformed JSON received from ${cleanEndpoint}: ${parseError.message}`);
    err.status = response.status;
    throw err;
  }

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      data?.errors?.registration ||
      data?.message ||
      `Request to ${cleanEndpoint} failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
