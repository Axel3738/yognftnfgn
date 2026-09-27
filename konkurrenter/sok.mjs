// konkurrenter/sok.mjs — var kopiorna letas: webben via Bing (RSS-formatet,
// ingen nyckel) och Metas Ad Library-API (när token:en får).
//
// Bing: `search?q="<fras>"&format=rss` svarar med vanlig RSS (mätt
// 2026-09-27: 200, <item><title><link><description>). Finns frasen inte
// exakt fyller Bing på med lösa träffar — de sorteras bort av likhetstalen
// i nästa steg, inte här. DuckDuckGo (html + lite) gav bot-utmaning respektive
// connection reset från containern samma dag.
//
// Ad Library: `ads_archive` kräver att token:ens ägare bekräftat sin identitet
// och att appen godkänts på facebook.com/ads/library/api. Med
// META_ACCESS_TOKEN svarar det (#10) subcode 2332002 (mätt 2026-09-27). Koden
// känner igen just det felet och säger vad Axel ska klicka — och börjar läsa
// annonserna den dag svaret blir 200, utan kodändring.

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ------------------------------------------------------------------ Bing

export function bingUrl(fras, { antal = 10, sprak = 'sv', land = 'se' } = {}) {
  const q = `"${String(fras).replace(/"/g, '').trim()}"`;
  return `https://www.bing.com/search?q=${encodeURIComponent(q)}&format=rss&count=${antal}&setlang=${sprak}&cc=${land}`;
}

/** XML-text → vanlig text: CDATA bort, entiteter avkodade, taggar bort. Ren. */
export function avkodaXml(s) {
  return String(s ?? '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const falt = (block, namn) => { const m = block.match(new RegExp(`<${namn}[^>]*>([\\s\\S]*?)<\\/${namn}>`, 'i')); return m ? avkodaXml(m[1]) : ''; };

/** Bings RSS → [{ titel, url, beskrivning }]. Ren. */
export function tolkaRss(xml) {
  const items = [...String(xml ?? '').matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  return items
    .map((it) => ({ titel: falt(it, 'title'), url: falt(it, 'link'), beskrivning: falt(it, 'description') }))
    .filter((x) => /^https?:\/\//i.test(x.url));
}

/** Domänen i en länk utan www. null om länken inte går att läsa. Ren. */
export function domanUr(url) {
  try { return new URL(String(url)).hostname.toLowerCase().replace(/^www\./, ''); } catch { return null; }
}

/** En Bing-sökning på en exakt fras. Fel returneras, kastas aldrig — en fras som inte gick att söka är en rad i rapporten. */
export async function sokBing(fras, { fetchFn = fetch, antal = 10, sprak = 'sv', land = 'se', timeout = 20000 } = {}) {
  const url = bingUrl(fras, { antal, sprak, land });
  let res;
  try {
    res = await fetchFn(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': `${sprak}-${land.toUpperCase()},${sprak};q=0.9,en;q=0.5`, Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.5' },
      signal: AbortSignal.timeout(timeout),
    });
  } catch (e) {
    return { fras, url, traffar: [], fel: `Bing svarade inte: ${e.message}` };
  }
  const text = await res.text().catch(() => '');
  if (!res.ok) return { fras, url, traffar: [], fel: `Bing HTTP ${res.status}` };
  if (!/<rss[\s>]/i.test(text)) return { fras, url, traffar: [], fel: 'Bing gav ingen RSS — spärr eller captcha' };
  return { fras, url, traffar: tolkaRss(text).map((t) => ({ ...t, doman: domanUr(t.url) })), fel: null };
}

/** Är domänen vår (eller en underdomän till en av våra)? Ren. */
export function arEgen(doman, egna = []) {
  const d = String(doman ?? '').toLowerCase().replace(/^www\./, '');
  return egna.some((e) => { const x = String(e).toLowerCase().replace(/^www\./, ''); return d === x || d.endsWith(`.${x}`); });
}

/** Är domänen en marknadsplats eller ett socialt nätverk vi aldrig letar i? Mönster som slutar på punkt matchar varje toppdomän ("amazon."). Ren. */
export function arIgnorerad(doman, ignorera = []) {
  const d = String(doman ?? '').toLowerCase().replace(/^www\./, '');
  return ignorera.some((i) => {
    const x = String(i).toLowerCase();
    if (x.endsWith('.')) return d.startsWith(x) || d.includes(`.${x}`);
    return d === x || d.endsWith(`.${x}`);
  });
}

/** Träffarna som är värda att hämta: inte våra, inte ignorerade, en per adress. Ren. */
export function filtreraTraffar(traffar, { egna = [], ignorera = [] } = {}) {
  const kvar = []; const sedda = new Set();
  let egnaN = 0; let ignorerade = 0;
  for (const t of traffar) {
    if (!t.doman) continue;
    if (arEgen(t.doman, egna)) { egnaN++; continue; }
    if (arIgnorerad(t.doman, ignorera)) { ignorerade++; continue; }
    // Samma sida med och utan www, med och utan frågeparametrar, är EN kandidat.
    let nyckel;
    try { const u = new URL(t.url); nyckel = `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase(); } catch { nyckel = t.url.toLowerCase(); }
    if (sedda.has(nyckel)) continue;
    sedda.add(nyckel); kvar.push(t);
  }
  return { kvar, egna: egnaN, ignorerade };
}

// ------------------------------------------------------------------ Meta Ad Library

export const AD_LIBRARY_FALT = ['id', 'page_id', 'page_name', 'ad_creative_bodies', 'ad_creative_link_titles', 'ad_creative_link_captions', 'ad_creative_link_descriptions', 'ad_delivery_start_time', 'ad_snapshot_url', 'publisher_platforms'];

export const AD_LIBRARY_HJALP = [
  'Meta släpper in i Ad Library-API:t först när den person som äger token:en har bekräftat sin identitet och appen godkänts:',
  '1. Öppna https://www.facebook.com/ID och gör identitetsbekräftelsen (legitimation, tar 1–2 dagar).',
  '2. Öppna https://www.facebook.com/ads/library/api och klicka "Get started" / "Kom igång" — följ stegen till slutet.',
  '3. Klart. Rutinen provar API:t varje körning och börjar läsa konkurrenternas annonser den dag svaret blir 200.',
].join('\n');

export function adLibraryUrl(term, { lander = ['SE'], limit = 50, version = process.env.META_API_VERSION || 'v23.0', falt = AD_LIBRARY_FALT } = {}) {
  const p = new URLSearchParams({
    search_terms: String(term),
    ad_reached_countries: JSON.stringify(lander),
    ad_type: 'ALL',
    ad_active_status: 'ALL',
    search_type: 'KEYWORD_UNORDERED',
    fields: falt.join(','),
    limit: String(limit),
  });
  return `https://graph.facebook.com/${version}/ads_archive?${p}`;
}

/** Länken Axel kan öppna själv i webbläsaren — samma sökning i Ad Library-webben. Ren. */
export function adLibraryLank(term, land = 'SE') {
  return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${encodeURIComponent(land)}&q=${encodeURIComponent(String(term))}&search_type=keyword_unordered&media_type=all`;
}

/**
 * Söker i Ad Library. Returnerar alltid ett objekt, kastar aldrig:
 * { status: 'ok' | 'saknar_behorighet' | 'fel' | 'saknar_token', annonser, fel, hjalp }
 * Egna sidor (page_id) sorteras bort.
 */
export async function sokAdLibrary(term, { token = process.env.META_ACCESS_TOKEN, lander = ['SE'], fetchFn = fetch, egnaSidor = new Set(), timeout = 30000, limit = 50 } = {}) {
  if (!token) return { term, status: 'saknar_token', annonser: [], fel: 'META_ACCESS_TOKEN saknas i miljön', hjalp: null };
  const url = `${adLibraryUrl(term, { lander, limit })}&access_token=${encodeURIComponent(token)}`;
  let j;
  try {
    const res = await fetchFn(url, { signal: AbortSignal.timeout(timeout) });
    j = await res.json().catch(() => ({}));
  } catch (e) {
    return { term, status: 'fel', annonser: [], fel: `Ad Library svarade inte: ${e.message}`, hjalp: null };
  }
  if (j?.error) {
    const f = j.error;
    if (f.code === 10 || f.error_subcode === 2332002 || /ads\/library\/api/i.test(f.error_user_msg ?? '')) {
      return { term, status: 'saknar_behorighet', annonser: [], fel: `(#${f.code}) ${f.message}`, hjalp: AD_LIBRARY_HJALP };
    }
    return { term, status: 'fel', annonser: [], fel: `(#${f.code}) ${f.message}`, hjalp: null };
  }
  const annonser = (j?.data ?? [])
    .filter((a) => !egnaSidor.has(String(a.page_id)))
    .map((a) => ({
      id: a.id, sidaId: String(a.page_id ?? ''), sidnamn: a.page_name ?? '',
      texter: a.ad_creative_bodies ?? [], rubriker: a.ad_creative_link_titles ?? [],
      domaner: [...new Set((a.ad_creative_link_captions ?? []).map((c) => domanUr(/^https?:/i.test(c) ? c : `https://${c}`)).filter(Boolean))],
      start: a.ad_delivery_start_time ?? null, snapshot: a.ad_snapshot_url ?? null, plattformar: a.publisher_platforms ?? [],
    }));
  return { term, status: 'ok', annonser, fel: null, hjalp: null };
}
