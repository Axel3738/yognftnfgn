import { config } from './config.js';

/**
 * Hämtar Meta-annonskostnad (spend) för perioden via Marketing API insights.
 * Returnerar {available, spend, impressions, clicks, error?}.
 */
export async function getMeta(from, to) {
  const base = { available: false, spend: 0, impressions: 0, clicks: 0 };
  if (!config.meta.enabled) return { ...base, reason: 'ej kopplad' };

  try {
    const acct = config.meta.account.startsWith('act_') ? config.meta.account : `act_${config.meta.account}`;
    const params = new URLSearchParams({
      access_token: config.meta.token,
      level: 'account',
      time_range: JSON.stringify({ since: from, until: to }),
      fields: 'spend,impressions,clicks',
    });
    const url = `https://graph.facebook.com/${config.meta.apiVersion}/${acct}/insights?${params}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    const row = (json.data && json.data[0]) || {};
    return {
      available: true,
      spend: Number(row.spend || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
    };
  } catch (err) {
    return { ...base, error: String(err.message || err) };
  }
}
