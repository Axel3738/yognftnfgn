// messenger/meta.mjs — sidornas inkorgar (Messenger + Instagram) via Graph API.
//
// Vägen (Axels beställning 2026-09-28, mätt samma dag):
//   1. Sidorna: `me/accounts` med META_ACCESS_TOKEN (och META_ACCESS_TOKEN_MATSTRUMPOR
//      om den finns) → sidtoken per sida. 15 sidor mätta 2026-09-28.
//   2. Konversationerna: `/<sida>/conversations?platform=messenger|instagram`
//      med sidtoken, meddelandena inbäddade (`messages.limit(25)`).
//      ⚠️ Kräver `pages_messaging` (Instagram: `instagram_manage_messages`).
//      Mätt 2026-09-28: token:en saknar den, alla 15 sidor svarade
//      "(#200) Requires permission: pages_messaging". Klienten rapporterar det
//      per sida, aldrig som "0 meddelanden".
//   3. Svaret: POST `/<sida>/messages` med `messaging_type: RESPONSE` — bara
//      inom 24 h från kundens senaste meddelande (Metas standardfönster).

import { skapaKlient as skapaMetaKlient, V } from '../kommentarer/meta.mjs';

const GRAPH = `https://graph.facebook.com/${V}`;
const MEDDELANDEFALT = 'messages.limit(25){id,message,from,created_time,attachments.limit(3){mime_type}}';

/** Sidorna token:erna når, med sidtoken. Dubbletter bort på id. */
export async function hamtaSidor({ tokens, klient = null, logg = () => {} } = {}) {
  const sidor = new Map();
  const fel = [];
  for (const [namn, token] of Object.entries(tokens)) {
    if (!token) continue;
    const k = klient ?? skapaMetaKlient({ token, logg });
    try {
      let url = 'me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100';
      while (url) {
        const j = await k.get(url, token);
        for (const s of j.data ?? []) if (!sidor.has(s.id) && s.access_token) sidor.set(s.id, { id: s.id, namn: s.name, token: s.access_token, ig: s.instagram_business_account ?? null, kalla: namn });
        url = j.paging?.next ?? null;
      }
    } catch (e) { fel.push(`${namn}: ${e.message}`); }
  }
  return { sidor: [...sidor.values()], fel };
}

/**
 * Konversationerna på en sida som rörts efter `sedan` (Date). Returnerar
 * { konversationer, fel } — fel = Metas orsak (t.ex. saknad pages_messaging).
 */
export async function hamtaKonversationer(sida, { platform = 'messenger', sedan, klient = null, logg = () => {}, maxSidor = 10 } = {}) {
  const k = klient ?? skapaMetaKlient({ token: sida.token, logg });
  const ut = [];
  try {
    let url = `${sida.id}/conversations?platform=${platform}&fields=id,updated_time,link,participants,${MEDDELANDEFALT}&limit=50`;
    for (let n = 0; url && n < maxSidor; n++) {
      const j = await k.get(url, sida.token);
      let aldre = false;
      for (const c of j.data ?? []) {
        if (sedan && new Date(c.updated_time) < sedan) { aldre = true; continue; }
        ut.push({ ...c, platform });
      }
      url = aldre ? null : (j.paging?.next ?? null);
    }
    return { konversationer: ut, fel: null };
  } catch (e) {
    return { konversationer: ut, fel: e.message };
  }
}

/** Skickar ett svar från sidan. `mottagare` = kundens PSID/IGSID. */
export async function skickaSvar(sida, mottagare, text, { fetchFn = fetch } = {}) {
  const res = await fetchFn(`${GRAPH}/${sida.id}/messages?access_token=${encodeURIComponent(sida.token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: mottagare }, messaging_type: 'RESPONSE', message: { text } }),
    signal: AbortSignal.timeout(60_000),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) throw new Error(`Meta skicka: (${j.error?.code ?? res.status}) ${j.error?.message ?? 'okänt fel'}`);
  return j;   // { recipient_id, message_id }
}
