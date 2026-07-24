import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Snapshot med riktig spend hämtad via Claude-sessionen (Meta MCP) –
// används som källa tills ett eget API-token läggs i .env.
const ACTUALS_PATH = join(__dirname, '..', 'data', 'meta-actuals.json');

async function readActuals() {
  try {
    return JSON.parse(await readFile(ACTUALS_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

/** true om en sparad Meta-snapshot finns (styr demo-läget i servern). */
export async function metaHasActuals() {
  return (await readActuals()) != null;
}

/**
 * Hämtar Meta-annonskostnad per dag för perioden (Marketing API insights,
 * time_increment=1). Utan API-token används den sparade snapshoten i stället
 * (flaggad `snapshot:true`, med roasDaily för intäktsestimat).
 * Returnerar {available, spend, impressions, clicks, daily, roasDaily?, error?}.
 */
export async function getMeta(from, to) {
  const base = { available: false, spend: 0, impressions: 0, clicks: 0, daily: {} };
  if (!config.meta.enabled) {
    const act = await readActuals();
    if (!act) return { ...base, reason: 'ej kopplad' };
    const daily = {}, roasDaily = {};
    let spend = 0;
    for (const [d, v] of Object.entries(act.daily || {})) {
      if (d < from || d > to) continue;
      daily[d] = v.spend;
      roasDaily[d] = v.roas;
      spend += v.spend;
    }
    return { ...base, available: true, snapshot: true, fetchedAt: act.fetchedAt, spend, daily, roasDaily, reason: `snapshot ${act.fetchedAt}` };
  }

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
