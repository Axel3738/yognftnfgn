// konkurrenter/adlibrary.mjs — läser en Facebook-sidas annonser ur Metas
// annonsbibliotek, HÄRIFRÅN, i Chromium (Axels order 2026-09-29: "du ska göra
// klart mina uppgifter" — han skulle annars ha läst av annonserna själv).
//
// Mätt 2026-09-29 mot sidan 1299101096626433 (ORVO, 37 annonser):
// - Webbversionen svarar 403 ("client challenge") tre–fyra gånger och sedan
//   200 — med hela första resultatsidan INBÄDDAD som JSON i HTML:en
//   (`<script type="application/json">` → … → `collated_results[].ad_archive_id`),
//   högst 30 annonser per laddning. API:t (ads_archive) kräver fortfarande en
//   verifierad persons token (2332002) — det här är webbsidan, inte API:t.
// - Skroll-pagineringen går inte i headless (30 kort efter 25 skroll), men
//   FILTREN gör det: `active_status=active` och `inactive` ger var sin
//   laddning (23 + 14 = 37), och `media_type` delar vidare om en laddning
//   slår i taket på 30.
// - Räckvidden per annons (EU-transparensens `eu_total_reach`) står inte i
//   listan. Sidan hämtar den med GraphQL-frågan AdLibraryV3AdDetailsQuery när
//   man klickar "See ad details"; den begäran fångas EN gång och spelas upp
//   per annons från sidans egen kontext (samma tokens och cookies) — 200 med
//   `eu_total_reach` för varje annons (3 364, 719, 2 569 vid mätningen).
//   Samma svar bär sidans info (namn, kategori, Instagram-konto, "om"-text).
//
// Rena funktioner för tolkningen (testade på sparad HTML); bara
// `hamtaAdLibrary` rör nätet. Läs-bart: sidan klickas, inget rapporteras här.

import { existsSync } from 'node:fs';
import { UA } from './korpus.mjs';
import { domanUr } from './sok.mjs';
import { PLAYWRIGHT, CHROME_KANDIDATER } from './bild.mjs';

export const STATUSAR = ['active', 'inactive'];
export const MEDIETYPER = ['video', 'image', 'meme', 'none'];
export const TAK_PER_LADDNING = 30;

/** Sidans id ur ett bart id eller en Ad Library-länk med view_all_page_id. null om inget. Ren. */
export function sidaIdUr(s) {
  const t = String(s ?? '').trim();
  if (/^\d{5,}$/.test(t)) return t;
  const m = t.match(/view_all_page_id=(\d{5,})/);
  return m ? m[1] : null;
}

/** Adressen till listan. Ren. */
export function listaUrl(sidaId, { land = 'SE', status = 'all', media = 'all', tom = null } = {}) {
  // tom: bara annonser med visningar t.o.m. det datumet (bibliotekets datumfilter). För AKTIVA annonser är det
  // samma sak som "startade t.o.m. datumet" — mätt 2026-09-30 på Bustatio-busto: t.o.m. 31/8 gav 22 av 58.
  // Sorteringen följer med fönstret: utan den gav samma fönster bara 43 av 58 (mätt 2026-09-30), med den 58 av 58.
  const datum = tom ? `&start_date[min]=2018-01-01&start_date[max]=${encodeURIComponent(tom)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped` : '';
  return `https://www.facebook.com/ads/library/?active_status=${encodeURIComponent(status)}&ad_type=all&country=${encodeURIComponent(land)}&media_type=${encodeURIComponent(media)}&search_type=page${datum}&view_all_page_id=${encodeURIComponent(sidaId)}`;
}

/**
 * Datumen för att täcka en AKTIV lista över taket 30: "t.o.m. D" ger alla aktiva som startat t.o.m. D,
 * så en stigande rad D läser dem i omgångar om högst 30 — äldst först. Grovt (30 dagar) ett år bakåt,
 * sedan var tredje dag de sista 60, sist i dag. Mätt 2026-09-30: 58 av 58 aktiva på 13 laddningar,
 * medan bläddringsfrågan stryptes. Ren.
 */
export function tackDatum(idag = new Date(), { grovDagar = 365, grovSteg = 30, finDagar = 60, finSteg = 3 } = {}) {
  const dag = (n) => new Date(idag.getTime() - n * 86_400_000).toISOString().slice(0, 10);
  const ut = [];
  for (let n = grovDagar; n > finDagar; n -= grovSteg) ut.push(dag(n));
  for (let n = finDagar; n > 0; n -= finSteg) ut.push(dag(n));
  ut.push(dag(0));
  return [...new Set(ut)];
}

/** Ad Library-länken till EN annons. Ren. */
export const annonsUrl = (id) => `https://www.facebook.com/ads/library/?id=${id}`;

const avHtml = (s) => String(s ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;|&#x27;/g, "'").replace(/&nbsp;/g, ' ').trim();

/**
 * Alla annonsobjekt (`ad_archive_id`) ur sidans inbäddade JSON, en per id.
 * Ren — tar HTML-strängen, inte sidan.
 */
export function annonserUrHtml(html) {
  const ut = new Map();
  for (const s of inbaddadJson(html)) annonserUrJson(s, ut);
  return [...ut.values()];
}

/** De inbäddade JSON-skripten i sidans HTML, tolkade. Ren. */
function inbaddadJson(html) {
  const ut = [];
  for (const m of String(html ?? '').matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)) { try { ut.push(JSON.parse(m[1])); } catch { /* inte JSON */ } }
  return ut;
}

/** Alla annonsobjekt (`ad_archive_id` + `snapshot`) i ett tolkat JSON-värde, in i `ut` (id → objekt, första vinner). Ren. */
export function annonserUrJson(v, ut = new Map()) {
  if (!v || typeof v !== 'object') return ut;
  if (Array.isArray(v)) { for (const x of v) annonserUrJson(x, ut); return ut; }
  if (typeof v.ad_archive_id === 'string' && v.snapshot) { if (!ut.has(v.ad_archive_id)) ut.set(v.ad_archive_id, v); return ut; }
  for (const x of Object.values(v)) annonserUrJson(x, ut);
  return ut;
}

/** Listans markör, { markor, mer } ur första `page_info` (end_cursor + has_next_page) i ett JSON-värde. null om ingen. Ren. */
export function markorUrJson(v) {
  if (!v || typeof v !== 'object') return null;
  if (Array.isArray(v)) { for (const x of v) { const m = markorUrJson(x); if (m) return m; } return null; }
  if ('end_cursor' in v && 'has_next_page' in v) return { markor: v.end_cursor ?? null, mer: v.has_next_page === true };
  for (const x of Object.values(v)) { const m = markorUrJson(x); if (m) return m; }
  return null;
}

/** Listans markör ur HTML:ens inbäddade JSON (första sidan). Ren. */
export function markorUrHtml(html) {
  for (const s of inbaddadJson(html)) { const m = markorUrJson(s); if (m) return m; }
  return null;
}

/**
 * Ett GraphQL-svar som delar: `for (;;);` först ibland, och flera JSON-rader när
 * svaret strömmas. Rader som inte är JSON hoppas. Ren.
 */
export function tolkaGraphql(text) {
  const ut = [];
  for (const rad of String(text ?? '').replace(/^for \(;;\);/, '').split('\n')) { const t = rad.trim(); if (!t.startsWith('{')) continue; try { ut.push(JSON.parse(t)); } catch { /* inte JSON */ } }
  return ut;
}

/** Sant när svaret är Facebooks strypning (kod 1675004 "Rate limit exceeded"). Ren. */
export function arStrypt(delar) {
  return (delar ?? []).some((d) => (d?.errors ?? []).some((e) => Number(e?.code) === 1675004 || /rate limit/i.test(String(e?.message ?? ''))));
}

/**
 * Kroppen till nästa sida: den fångade pagineringsfrågan (AdLibrarySearchPaginationQuery)
 * med ny markör, status, medietyp och antal. Allt annat (tokens, sid-id, land) följer med. Ren.
 */
export function pagineringsKropp(post, { markor, status, media = 'all', first = 10 } = {}) {
  const p = new URLSearchParams(post);
  let v = {}; try { v = JSON.parse(p.get('variables') ?? '{}'); } catch { /* tom */ }
  v.cursor = markor; v.first = first;
  if (status) v.activeStatus = status;
  if (media) v.mediaType = media;
  p.set('variables', JSON.stringify(v));
  return p.toString();
}

/** Antalet resultat ur sidans text ("~37 results" / "37 resultat"). null om det inte står. Ren. */
export function antalUrText(text) {
  const m = String(text ?? '').match(/~?\s*(\d[\d\s.,]*)\s+(?:results?|resultat)/i);
  return m ? Number(m[1].replace(/[\s.,]/g, '')) : null;
}

const datumSthlm = (sek) => (Number(sek) > 0 ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(Number(sek) * 1000)) : null);

/** Ett råobjekt → vår platta annonsrad. Ren. */
export function normaliseraAnnons(n) {
  const s = n.snapshot ?? {};
  const kort = Array.isArray(s.cards) ? s.cards : [];
  const kropp = s.body?.text ?? (s.body?.markup?.__html ? avHtml(s.body.markup.__html) : '');
  const kortText = kort.map((c) => avHtml(c.body ?? '')).filter(Boolean);
  const text = [kropp, ...kortText.filter((t) => t !== kropp)].filter(Boolean).join('\n\n').trim();
  const rubrik = [s.title, ...kort.map((c) => c.title)].filter(Boolean).find(Boolean) ?? '';
  const bilder = [...new Set([
    ...(Array.isArray(s.images) ? s.images : []).map((b) => b.original_image_url ?? b.resized_image_url),
    ...(Array.isArray(s.videos) ? s.videos : []).map((v) => v.video_preview_image_url),
    ...kort.map((c) => c.original_image_url ?? c.resized_image_url ?? c.video_preview_image_url),
  ].filter(Boolean))];
  const videor = [...(Array.isArray(s.videos) ? s.videos : []).map((v) => v.video_hd_url ?? v.video_sd_url), ...kort.map((c) => c.video_hd_url ?? c.video_sd_url)].filter(Boolean);
  const landning = s.link_url ?? kort.map((c) => c.link_url).find(Boolean) ?? null;
  return {
    id: String(n.ad_archive_id), lank: annonsUrl(n.ad_archive_id), aktiv: n.is_active === true, start: datumSthlm(n.start_date), slut: datumSthlm(n.end_date),
    text, rubrik: rubrik ?? '', landning, doman: landning ? domanUr(landning) : null, cta: s.cta_text ?? null,
    bilder, video: videor.length > 0 || s.display_format === 'VIDEO', videoUrl: videor[0] ?? null, format: s.display_format ?? null,
    plattformar: Array.isArray(n.publisher_platform) ? n.publisher_platform : [], sida: n.page_name ?? s.page_name ?? null, sidaId: String(n.page_id ?? s.page_id ?? ''),
    varianter: n.collation_count ?? null, collationId: n.collation_id ?? null,
  };
}

/** Räckvidden och sidinfon ur svaret på AdLibraryV3AdDetailsQuery. Ren. */
export function rackviddUrDetalj(json) {
  const d = json?.data?.ad_library_main?.ad_details;
  if (!d) return { rackvidd: null, lander: [], sidinfo: null, fel: 'inget ad_details i svaret' };
  const eu = d.transparency_by_location?.eu_transparency ?? null;
  const pi = d.advertiser?.ad_library_page_info?.page_info ?? null;
  const om = d.advertiser?.page?.about?.text ?? null;
  return {
    rackvidd: Number.isFinite(Number(eu?.eu_total_reach)) && eu?.eu_total_reach !== null ? Number(eu.eu_total_reach) : null,
    lander: (eu?.location_audience ?? []).filter((l) => !l.excluded).map((l) => l.name).filter(Boolean),
    riktarEu: eu?.targets_eu ?? null,
    sidinfo: pi ? { namn: pi.page_name ?? null, kategori: pi.page_category ?? null, instagram: pi.ig_username ?? null, igFoljare: pi.ig_followers ?? null, gillar: pi.likes ?? null, facebook: pi.page_profile_uri ?? null, verifierad: pi.page_verification ?? null, om } : (om ? { om } : null),
    fel: null,
  };
}

/** Deras domän = den vanligaste landningsdomänen (aldrig facebook/instagram). Ren. */
export function derasDoman(annonser) {
  const r = new Map();
  for (const a of annonser) { const d = a.doman; if (!d || /(^|\.)(facebook|instagram|fb|meta)\.com$/.test(d)) continue; r.set(d, (r.get(d) ?? 0) + 1); }
  return [...r.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;
}

/**
 * Annonsfilen i annonsfall.mjs-formatet, med räckvidden som `exponeringar`
 * (källa `eu_total_reach`) och `aktiv` per annons. Ren.
 */
export function annonsfilUr({ sidaId, land = 'SE', annonser, sidinfo = null, rackvidd = new Map(), hamtad = new Date().toISOString(), antal = {}, fel = [] }) {
  const doman = derasDoman(annonser);
  const sidnamn = sidinfo?.namn ?? annonser.find((a) => a.sida)?.sida ?? null;
  const rader = annonser.map((a) => {
    const r = rackvidd instanceof Map ? rackvidd.get(a.id) : rackvidd?.[a.id];
    return {
      id: a.id, lank: a.lank, aktiv: a.aktiv, start: a.start, slut: a.slut, text: a.text, rubrik: a.rubrik, landning: a.landning,
      bilder: a.bilder, video: a.video, videoUrl: a.videoUrl, format: a.format, plattformar: a.plattformar, varianter: a.varianter,
      exponeringar: r?.rackvidd ?? null, exponeringar_kalla: r?.rackvidd != null ? 'eu_total_reach' : null, lander: r?.lander ?? [],
    };
  });
  const lasta = rader.filter((a) => a.exponeringar != null).length;
  return {
    deras: { sidnamn, sida_id: String(sidaId), doman, url: doman ? `https://${doman}` : null, kategori: sidinfo?.kategori ?? null, instagram: sidinfo?.instagram ?? null, facebook: sidinfo?.facebook ?? null, om: sidinfo?.om ?? null, ad_library: listaUrl(sidaId, { land }) },
    annonser: rader,
    kalla: 'adlibrary', hamtad, land, antal: { ...antal, lasta: rader.length, aktiva: rader.filter((a) => a.aktiv).length, inaktiva: rader.filter((a) => !a.aktiv).length, rackvidd_last: lasta, rackvidd_saknas: rader.length - lasta }, fel,
  };
}

/** Chromium med proxyn — samma kandidater som bildhashningen. Delas med formulärinskickaren (anmal-skicka.mjs). */
export async function startaWebblasare({ playwrightSokvag = PLAYWRIGHT, kandidater = CHROME_KANDIDATER, locale = 'en-GB' } = {}) {
  let pw;
  try { pw = await import(playwrightSokvag); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]}) — annonsbiblioteket läses inte`); }
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const args = ['--no-sandbox', '--ignore-certificate-errors', '--disable-gpu', '--disable-blink-features=AutomationControlled'];
  let browser = null; const fel = [];
  for (const exe of [null, ...kandidater]) {
    if (exe && !existsSync(exe)) continue;
    try { browser = await pw.chromium.launch({ headless: true, args, proxy, ...(exe ? { executablePath: exe } : {}) }); break; } catch (e) { fel.push(e.message.split('\n')[0]); }
  }
  if (!browser) throw new Error(`Chromium startade inte: ${fel.join(' | ')}`);
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1366, height: 1000 }, userAgent: UA, locale });
  return { browser, ctx };
}

/** Sidans text när den finns — 403-varven ger tom/ingen body en stund. */
async function sidtext(page) { try { return await page.evaluate(() => document.body?.innerText ?? ''); } catch { return ''; } }

/** Laddar en lista och väntar in resultaten (eller "inga annonser"). */
async function lasLista(page, url, { logg = () => {}, maxVantaMs = 75_000 } = {}) {
  const t0 = Date.now();
  let statusar = [];
  const lyss = (r) => { if (r.url().startsWith('https://www.facebook.com/ads/library')) statusar.push(r.status()); };
  page.on('response', lyss);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 90_000 }).catch(() => {});
    let text = '';
    while (Date.now() - t0 < maxVantaMs) {
      await page.waitForTimeout(2000);
      text = await sidtext(page);
      if (/Library ID|Biblioteks-id|No ads match|Inga annonser|\d+\s+(results?|resultat)/i.test(text)) break;
    }
    const html = await page.content();
    const annonser = annonserUrHtml(html);
    logg(`  ${url.match(/active_status=(\w+)/)?.[1] ?? 'all'}${url.includes('media_type=all') ? '' : `/${url.match(/media_type=(\w+)/)?.[1]}`}: ${annonser.length} annonser i HTML:en, "${antalUrText(text) ?? '?'}" resultat enligt sidan, ${Math.round((Date.now() - t0) / 1000)} s, HTTP ${[...new Set(statusar)].join('/') || '?'}`);
    return { annonser, text, antal: antalUrText(text), statusar, markor: markorUrHtml(html) };
  } finally { page.off('response', lyss); }
}

/**
 * Fångar sidans egen pagineringsfråga (AdLibrarySearchPaginationQuery) genom att skrolla
 * med mushjulet. Mätt 2026-09-30 på Bustatio-busto (58 aktiva): frågan kom efter ~9 s;
 * listan stannar annars vid 30 kort.
 */
async function fangaPagineringsbegaran(page, { maxSkroll = 40 } = {}) {
  let fangad = null;
  const lyss = (r) => { if (!fangad && /\/api\/graphql/.test(r.url()) && /AdLibrarySearchPaginationQuery/.test(r.postData() ?? '')) fangad = { url: r.url(), post: r.postData() }; };
  page.on('request', lyss);
  try {
    await page.mouse.move(683, 500).catch(() => {});
    for (let i = 0; i < maxSkroll && !fangad; i++) {
      await page.mouse.wheel(0, 2500).catch(() => {});
      await page.waitForTimeout(900);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
      await page.waitForTimeout(600);
    }
    return fangad;
  } finally { page.off('request', lyss); }
}

/**
 * Bläddrar en lista förbi taket med den fångade frågan, markör för markör, från sidans
 * kontext (samma tokens och cookies). Strypningen (1675004) väntas ut EN gång (60 s), sedan
 * stopp med orsaken i `fel` — mätt 2026-09-30: den satt kvar i över en halvtimme. Returnerar råobjekten.
 */
async function bladdra(page, begaran, { markor, status, media = 'all', first = 10, max = 400, har = 0, pausMs = 1500, logg = () => {}, fel = [] } = {}) {
  const ut = new Map(); let mer = Boolean(markor); let sidor = 0; let forsok = 0;
  while (mer && markor && har + ut.size < max) {
    const kropp = pagineringsKropp(begaran.post, { markor, status, media, first });
    const svar = await page.evaluate(async ({ url, kropp: k }) => {
      const r = await fetch(url, { method: 'POST', body: k, headers: { 'content-type': 'application/x-www-form-urlencoded' }, credentials: 'include' });
      return { status: r.status, text: await r.text() };
    }, { url: begaran.url, kropp }).catch((e) => ({ status: 0, text: String(e?.message ?? e) }));
    const delar = tolkaGraphql(svar.text);
    const strypt = arStrypt(delar);
    if (svar.status !== 200 || strypt) {
      if (++forsok > 1) { fel.push(`${status}: bläddringen stoppade (${strypt ? 'Rate limit exceeded' : `HTTP ${svar.status}`}) efter ${sidor} sidor — resten av listan lästes inte`); break; }
      logg(`  ${status}: ${strypt ? 'strypt (Rate limit exceeded)' : `HTTP ${svar.status}`}, väntar ${60 * forsok} s`);
      await page.waitForTimeout(60_000 * forsok);
      continue;
    }
    forsok = 0;
    const fore = ut.size;
    for (const d of delar) annonserUrJson(d, ut);
    const info = delar.map(markorUrJson).find(Boolean);
    sidor++;
    if (sidor % 5 === 0 || !info?.mer) logg(`  ${status}: bläddrat ${sidor} sidor, ${har + ut.size} annonser (+${ut.size - fore} senast)`);
    if (!info) { fel.push(`${status}: svaret saknade page_info efter ${sidor} sidor — resten lästes inte`); break; }
    markor = info.markor; mer = info.mer;
    await page.waitForTimeout(pausMs);
  }
  if (mer && har + ut.size >= max) fel.push(`${status}: taket ${max} annonser nått under bläddringen — resten lästes inte`);
  return { annonser: [...ut.values()], sidor, klar: !mer };
}

/** Fångar detaljbegäran (AdLibraryV3AdDetailsQuery) genom att klicka på första "See ad details". */
async function fangaDetaljbegaran(page) {
  let fangad = null;
  const lyss = (r) => { if (/\/api\/graphql/.test(r.url()) && /AdLibraryV3AdDetailsQuery/.test(r.postData() ?? '')) fangad = { url: r.url(), post: r.postData() }; };
  page.on('request', lyss);
  try {
    const knapp = page.getByRole('button', { name: /See ad details|Se annonsinformation|annonsdetaljer/i }).first();
    if (!(await knapp.count())) return null;
    await knapp.click({ timeout: 8000 }).catch(() => {});
    for (let i = 0; i < 20 && !fangad; i++) await page.waitForTimeout(500);
    await page.keyboard.press('Escape').catch(() => {});
    return fangad;
  } finally { page.off('request', lyss); }
}

/** Spelar upp detaljbegäran för ett annat annons-id från sidans kontext. */
async function hamtaDetalj(page, begaran, id) {
  const params = new URLSearchParams(begaran.post);
  let v = {}; try { v = JSON.parse(params.get('variables') ?? '{}'); } catch { /* tom */ }
  v.adArchiveID = String(id);
  params.set('variables', JSON.stringify(v));
  const svar = await page.evaluate(async ({ url, kropp }) => {
    const r = await fetch(url, { method: 'POST', body: kropp, headers: { 'content-type': 'application/x-www-form-urlencoded' }, credentials: 'include' });
    return { status: r.status, text: await r.text() };
  }, { url: begaran.url, kropp: params.toString() });
  if (svar.status !== 200) return { rackvidd: null, lander: [], sidinfo: null, fel: `HTTP ${svar.status}` };
  const delar = tolkaGraphql(svar.text);
  if (arStrypt(delar)) return { rackvidd: null, lander: [], sidinfo: null, fel: 'strypt', strypt: true };
  if (!delar.length) return { rackvidd: null, lander: [], sidinfo: null, fel: 'svaret gick inte att tolka' };
  return rackviddUrDetalj(delar.find((d) => d?.data?.ad_library_main) ?? delar[0]);
}

/**
 * Läser HELA sidan: alla annonser (active + inactive; över taket 30 bläddras
 * listan med sidans egen pagineringsfråga, media_type är reserven), räckvidden
 * per annons och sidinfon. Returnerar annonsfilen (annonsfilUr).
 * `medRackvidd: false` hoppar detaljfrågorna, `'aktiva'` läser dem bara för de
 * aktiva. `max` (standard 400) är taket för en general store — de aktiva läses först.
 */
export async function hamtaAdLibrary(sida, { land = 'SE', logg = () => {}, medRackvidd = true, pausMs = 350, max = 400, playwrightSokvag, kandidater } = {}) {
  const sidaId = sidaIdUr(sida);
  if (!sidaId) throw new Error(`"${sida}" är varken ett sid-id eller en Ad Library-länk med view_all_page_id.`);
  const hamtad = new Date().toISOString();
  const { browser, ctx } = await startaWebblasare({ playwrightSokvag, kandidater });
  const fel = [];
  try {
    const page = await ctx.newPage();
    const alla = new Map(); const antal = {}; let bara403 = true; let pagFraga = null; let fangstProvad = false;
    const laggTill = (lista) => { for (const n of lista) if (!alla.has(String(n.ad_archive_id))) alla.set(String(n.ad_archive_id), n); };
    for (const status of STATUSAR) {
      const l = await lasLista(page, listaUrl(sidaId, { land, status }), { logg });
      antal[status] = l.antal ?? l.annonser.length;
      if (l.statusar.some((s) => s === 200)) bara403 = false;
      laggTill(l.annonser);
      if (l.annonser.length >= TAK_PER_LADDNING && (l.antal ?? Infinity) > l.annonser.length && alla.size < max) {
        // Taket. Aktiva: datumfönster först — vanliga laddningar, som inte stryps (mätt 2026-09-30: 58 av 58).
        if (status === 'active' && l.antal) {
          const fore = alla.size;
          for (const tom of tackDatum()) {
            if (alla.size >= max) break;
            const d = await lasLista(page, listaUrl(sidaId, { land, status, tom }), { logg: () => {} });
            const fore1 = alla.size; laggTill(d.annonser);
            const nu = [...alla.values()].filter((n) => n.is_active === true).length;
            if (alla.size > fore1 || d.annonser.length >= TAK_PER_LADDNING) logg(`    t.o.m. ${tom}: ${d.annonser.length} av "${d.antal ?? '?'}", +${alla.size - fore1}, ${nu} av ${l.antal}`);
            if (nu >= l.antal) break;
          }
          const aktiva = [...alla.values()].filter((n) => n.is_active === true).length;
          logg(`  active: datumfönster gav +${alla.size - fore}, ${aktiva} av ${l.antal} aktiva`);
          if (aktiva >= l.antal) continue;
        }
        // Sedan sidans egen pagineringsfråga (Bustatio-busto: ~4 700 inaktiva).
        if (!pagFraga && !fangstProvad) { fangstProvad = true; pagFraga = await fangaPagineringsbegaran(page); logg(pagFraga ? '  pagineringsfrågan fångad — bläddrar' : '  pagineringsfrågan kom inte — delar på medietyp i stället'); }
        if (pagFraga && l.markor?.mer) {
          const b = await bladdra(page, pagFraga, { markor: l.markor.markor, status, max, har: alla.size, logg, fel });
          laggTill(b.annonser);
          if (b.klar) continue;
        }
        // Reserven: dela på medietyp så att varje laddning bär färre än 30.
        for (const media of MEDIETYPER) {
          if (alla.size >= max) break;
          const d = await lasLista(page, listaUrl(sidaId, { land, status, media }), { logg });
          laggTill(d.annonser);
          if (d.annonser.length >= TAK_PER_LADDNING) fel.push(`${status}/${media}: ${d.annonser.length} annonser i en laddning — taket nått, sidan kan ha fler som inte lästes`);
        }
      }
      if (alla.size >= max) { fel.push(`taket ${max} annonser nått — resten lästes inte`); break; }
    }
    const annonser = [...alla.values()].map(normaliseraAnnons);
    // Facebook kan stänga ute containern helt (403 hela vägen): då är "0 annonser" inte ett svar utan ett stopp — reserven är Axel/Cowork.
    if (!annonser.length && bara403) fel.push('annonsbiblioteket svarade bara 403 — Facebook stängde ute containern; reserven: Axel klistrar in annonserna eller kör konkurrenter/cowork/1-annonser.txt, sedan --hamta --annonser <fil>');
    logg(`  ${annonser.length} annonser lästa (${annonser.filter((a) => a.aktiv).length} aktiva, ${annonser.filter((a) => !a.aktiv).length} inaktiva)`);
    // Räckvidden: fånga detaljbegäran på en sida med kort, spela upp per annons.
    const rackvidd = new Map(); let sidinfo = null;
    // medRackvidd 'aktiva': bara de aktiva (en general store har hundratals inaktiva, och detaljfrågan stryps).
    const forRackvidd = medRackvidd === 'aktiva' ? annonser.filter((a) => a.aktiv) : annonser;
    if (medRackvidd && forRackvidd.length) {
      const statusMedKort = STATUSAR.find((s) => forRackvidd.some((a) => a.aktiv === (s === 'active')));
      await lasLista(page, listaUrl(sidaId, { land, status: statusMedKort ?? 'all' }), { logg: () => {} });
      const begaran = await fangaDetaljbegaran(page);
      if (!begaran) fel.push('räckvidden lästes inte: detaljbegäran (AdLibraryV3AdDetailsQuery) gick inte att fånga — annonserna går på schablon');
      else {
        let i = 0;
        for (const a of forRackvidd) {
          let d = await hamtaDetalj(page, begaran, a.id);
          // Strypningen väntas ut EN gång (60 s). Står den kvar stoppar räckvidden för resten i stället för
          // att vänta per annons (mätt 2026-09-30: strypningen satt kvar i över en halvtimme).
          for (let f = 1; d.strypt && f <= 1; f++) { logg(`  räckvidd: strypt (Rate limit exceeded), väntar ${60 * f} s`); await page.waitForTimeout(60_000 * f); d = await hamtaDetalj(page, begaran, a.id); }
          if (d.strypt) { fel.push(`räckvidden stoppade efter ${i} av ${forRackvidd.length} annonser: annonsbiblioteket stryper (Rate limit exceeded) — kör om senare`); break; }
          if (d.fel) fel.push(`räckvidd ${a.id}: ${d.fel}`); else rackvidd.set(a.id, { rackvidd: d.rackvidd, lander: d.lander });
          if (!sidinfo && d.sidinfo) sidinfo = d.sidinfo;
          if (++i % 10 === 0) logg(`  räckvidd: ${i}/${forRackvidd.length}`);
          await page.waitForTimeout(pausMs);
        }
        logg(`  räckvidd läst för ${[...rackvidd.values()].filter((r) => r.rackvidd != null).length} av ${forRackvidd.length} annonser${forRackvidd.length < annonser.length ? ` (bara de aktiva; ${annonser.length - forRackvidd.length} inaktiva utan räckvidd)` : ''}`);
      }
    }
    return annonsfilUr({ sidaId, land, annonser, sidinfo, rackvidd, hamtad, antal, fel });
  } finally { await browser.close().catch(() => {}); }
}
