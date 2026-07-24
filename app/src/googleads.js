import { config } from './config.js';

// Google Ads API kräver OAuth: växla refresh token mot en access token.
async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    refresh_token: config.google.refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_description || json.error || 'OAuth-fel');
  return json.access_token;
}

/**
 * Hämtar Google Ads-kostnad per dag via GAQL (cost_micros; 1e6 = 1 SEK).
 * Returnerar {available, spend, daily, error?} där daily = { 'YYYY-MM-DD': spend }.
 */
export async function getGoogleAds(from, to) {
  const base = { available: false, spend: 0, daily: {} };
  if (!config.google.enabled) return { ...base, reason: 'ej kopplad' };

  try {
    const accessToken = await getAccessToken();
    const gaql = `SELECT segments.date, metrics.cost_micros FROM customer WHERE segments.date BETWEEN '${from}' AND '${to}'`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'developer-token': config.google.developerToken,
    };
    if (config.google.loginCustomerId) headers['login-customer-id'] = config.google.loginCustomerId;

    const url = `https://googleads.googleapis.com/v17/customers/${config.google.customerId}/googleAds:search`;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ query: gaql }) });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || 'Google Ads-fel');

    const daily = {};
    let spend = 0;
    for (const row of json.results || []) {
      const d = row.segments?.date;
      const s = Number(row.metrics?.costMicros || 0) / 1e6;
      if (d) daily[d] = (daily[d] || 0) + s;
      spend += s;
    }
    return { available: true, spend, daily };
  } catch (err) {
    return { ...base, error: String(err.message || err) };
  }
}
