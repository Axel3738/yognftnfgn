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
export function listaUrl(sidaId, { land = 'SE', status = 'all', media = 'all' } = {}) {
  return `https://www.facebook.com/ads/library/?active_status=${encodeURIComponent(status)}&ad_type=all&country=${encodeURIComponent(land)}&media_type=${encodeURIComponent(media)}&search_type=page&view_all_page_id=${encodeURIComponent(sidaId)}`;
}

/** Ad Library-länken till EN annons. Ren. */
export const annonsUrl = (id) => `https://www.facebook.com/ads/library/?id=${id}`;

const avHtml = (s) => String(s ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;|&#x27;/g, "'").replace(/&nbsp;/g, ' ').trim();

/**
 * Alla annonsobjekt (`ad_archive_id`) ur sidans inbäddade JSON, en per id.
 * Ren — tar HTML-strängen, inte sidan.
 */
export function annonserUrHtml(html) {
  const skript = [...String(html ?? '').matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const ut = new Map();
  const walk = (v) => {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (typeof v.ad_archive_id === 'string' && v.snapshot) { if (!ut.has(v.ad_archive_id)) ut.set(v.ad_archive_id, v); return; }
    for (const x of Object.values(v)) walk(x);
  };
  for (const s of skript) { try { walk(JSON.parse(s)); } catch { /* inte JSON */ } }
  return [...ut.values()];
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
    return { annonser, text, antal: antalUrText(text), statusar };
  } finally { page.off('response', lyss); }
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
  try { return rackviddUrDetalj(JSON.parse(svar.text.replace(/^for \(;;\);/, ''))); } catch (e) { return { rackvidd: null, lander: [], sidinfo: null, fel: `svaret gick inte att tolka: ${e.message.split('\n')[0]}` }; }
}

/**
 * Läser HELA sidan: alla annonser (active + inactive, media_type vid behov),
 * räckvidden per annons och sidinfon. Returnerar annonsfilen (annonsfilUr).
 * `medRackvidd: false` hoppar detaljfrågorna.
 */
export async function hamtaAdLibrary(sida, { land = 'SE', logg = () => {}, medRackvidd = true, pausMs = 350, max = 400, playwrightSokvag, kandidater } = {}) {
  const sidaId = sidaIdUr(sida);
  if (!sidaId) throw new Error(`"${sida}" är varken ett sid-id eller en Ad Library-länk med view_all_page_id.`);
  const hamtad = new Date().toISOString();
  const { browser, ctx } = await startaWebblasare({ playwrightSokvag, kandidater });
  const fel = [];
  try {
    const page = await ctx.newPage();
    const alla = new Map(); const antal = {}; let bara403 = true;
    const laggTill = (lista) => { for (const n of lista) if (!alla.has(String(n.ad_archive_id))) alla.set(String(n.ad_archive_id), n); };
    for (const status of STATUSAR) {
      const l = await lasLista(page, listaUrl(sidaId, { land, status }), { logg });
      antal[status] = l.antal ?? l.annonser.length;
      if (l.statusar.some((s) => s === 200)) bara403 = false;
      laggTill(l.annonser);
      if (l.annonser.length >= TAK_PER_LADDNING && (l.antal ?? Infinity) > l.annonser.length) {
        // Taket: dela på medietyp så att varje laddning bär färre än 30.
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
    if (medRackvidd && annonser.length) {
      const statusMedKort = STATUSAR.find((s) => annonser.some((a) => a.aktiv === (s === 'active')));
      await lasLista(page, listaUrl(sidaId, { land, status: statusMedKort ?? 'all' }), { logg: () => {} });
      const begaran = await fangaDetaljbegaran(page);
      if (!begaran) fel.push('räckvidden lästes inte: detaljbegäran (AdLibraryV3AdDetailsQuery) gick inte att fånga — annonserna går på schablon');
      else {
        let i = 0;
        for (const a of annonser) {
          const d = await hamtaDetalj(page, begaran, a.id);
          if (d.fel) fel.push(`räckvidd ${a.id}: ${d.fel}`); else rackvidd.set(a.id, { rackvidd: d.rackvidd, lander: d.lander });
          if (!sidinfo && d.sidinfo) sidinfo = d.sidinfo;
          if (++i % 10 === 0) logg(`  räckvidd: ${i}/${annonser.length}`);
          await page.waitForTimeout(pausMs);
        }
        logg(`  räckvidd läst för ${[...rackvidd.values()].filter((r) => r.rackvidd != null).length} av ${annonser.length} annonser`);
      }
    }
    return annonsfilUr({ sidaId, land, annonser, sidinfo, rackvidd, hamtad, antal, fel });
  } finally { await browser.close().catch(() => {}); }
}
