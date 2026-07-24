import { config } from './config.js';

/**
 * Hämtar Meta-annonskostnad per dag för perioden (Marketing API insights,
 * time_increment=1). Returnerar {available, spend, impressions, clicks, daily, error?}
 * där daily = { 'YYYY-MM-DD': spend }.
 */
export async function getMeta(from, to) {
  const base = { available: false, spend: 0, impressions: 0, clicks: 0, daily: {} };
  if (!config.meta.enabled) return { ...base, reason: 'ej kopplad' };

  try {
    const acct = config.meta.account.startsWith('act_') ? config.meta.account : `act_${config.meta.account}`;
    const params = new URLSearchParams({
      access_token: config.meta.token,
      level: 'account',
      time_range: JSON.stringify({ since: from, until: to }),
      time_increment: '1',
      fields: 'spend,impressions,clicks',
      limit: '500',
    });
    let url = `https://graph.facebook.com/${config.meta.apiVersion}/${acct}/insights?${params}`;
    const daily = {};
    let spend = 0, impressions = 0, clicks = 0;

    while (url) {
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      for (const row of json.data || []) {
        const d = row.date_start;
        const s = Number(row.spend || 0);
        daily[d] = (daily[d] || 0) + s;
        spend += s;
        impressions += Number(row.impressions || 0);
        clicks += Number(row.clicks || 0);
      }
      url = json.paging?.next || null;
    }
    return { available: true, spend, impressions, clicks, daily };
  } catch (err) {
    return { ...base, error: String(err.message || err) };
  }
}
