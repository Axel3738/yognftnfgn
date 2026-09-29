// konkurrenter/korpus.mjs — det som är VÅRT och ska bevakas: produktsidorna
// (butikens publika /products.json, ingen nyckel behövs), annonstexterna som
// visas just nu (Meta, META_ACCESS_TOKEN) och fingeravtrycken — de meningar vi
// söker på för att hitta kopior.
//
// Vilka produkter som söks per körning: de som ANNONSERAS just nu (det är dem
// konkurrenter kopierar) + `bevaka` i konfig.json, sedan resten i rotation
// (aldrig kollad först, därefter äldst kollad). Taket står i konfig.sok.
//
// Läs-bart mot Meta och Shopify. Skriver ingenting.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { skapaKlient, lankUrCreative } from '../kommentarer/meta.mjs';
import { normalisera } from './likhet.mjs';
import { MAPP } from './arenden.mjs';

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ROT = join(MAPP, '..');

/** HTML → läsbar text med radbrytningar, skiftläge kvar (för fingeravtryck och citat). Ren. */
export function textUrHtml(html) {
  return String(html ?? '')
    .replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<noscript\b[\s\S]*?<\/noscript>|<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|li|h[1-6]|div|tr|section|article|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

/** Handlen ur en produktlänk (/products/<handle>), oavsett språkprefix och frågeparametrar. Ren. */
export function handleUr(lank) {
  const m = String(lank ?? '').match(/\/products\/([^/?#]+)/);
  if (!m) return null;
  try { return decodeURIComponent(m[1]).toLowerCase(); } catch { return m[1].toLowerCase(); }
}

/**
 * Alla produkter i en butik via den publika /products.json (250 per sida).
 * @returns {Promise<Array<{butik, handle, titel, url, text, bilder, pris, jamforpris, uppdaterad}>>}
 */
export async function hamtaProdukter(butikUrl, { fetchFn = fetch, logg = () => {}, maxSidor = 8, timeout = 30000 } = {}) {
  const bas = String(butikUrl).replace(/\/+$/, '');
  const ut = [];
  for (let sida = 1; sida <= maxSidor; sida++) {
    const url = `${bas}/products.json?limit=250&page=${sida}`;
    const res = await fetchFn(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(timeout) });
    if (!res.ok) throw new Error(`${bas}/products.json svarade HTTP ${res.status} (sida ${sida}).`);
    const j = await res.json().catch(() => null);
    const produkter = j?.products;
    if (!Array.isArray(produkter)) throw new Error(`${bas}/products.json gav ingen produktlista — är det en Shopify-butik?`);
    for (const p of produkter) {
      if (!p?.handle) continue;
      const bilder = [...new Set((p.images ?? []).map((b) => b?.src).filter(Boolean))];
      ut.push({
        butik: bas,
        handle: String(p.handle).toLowerCase(),
        titel: String(p.title ?? '').trim(),
        url: `${bas}/products/${p.handle}`,
        text: textUrHtml(p.body_html),
        bilder,
        pris: p.variants?.[0]?.price ?? null,
        jamforpris: p.variants?.[0]?.compare_at_price ?? null,
        uppdaterad: p.updated_at ?? null,
      });
    }
    logg(`  ${bas}: sida ${sida} → ${produkter.length} produkter`);
    if (produkter.length < 250) break;
  }
  return ut;
}

/** Meningarna i en text (radbrytning eller . ! ? följt av blanksteg). Ren. */
export function meningar(text) {
  return String(text ?? '')
    .split(/\n+/)
    .flatMap((rad) => rad.split(/(?<=[.!?])\s+(?=[^\s])/))
    .map((m) => m.replace(/^[\s"“”«»•\-–—]+|[\s"“”«»]+$/g, '').trim())
    .filter((m) => m.length >= 12);
}

/**
 * Fingeravtrycken: de meningar vi söker på. 7–16 ord, inga siffror (priser
 * och mått skiljer sig mellan butiker), inget butiksnamn, ovanliga ord först
 * (medelordlängd), tidigt i texten före sent. Utan avslutande punkt — Bing
 * matchar en citerad fras bättre utan den.
 */
export function fingeravtryck(text, { minOrd = 7, maxOrd = 16, antal = 2, undvik = [], boilerplate = new Set() } = {}) {
  const undvikN = undvik.map((u) => normalisera(u)).filter(Boolean);
  const kand = [];
  meningar(text).forEach((m, i) => {
    const ren = m.replace(/[.!?:;]+$/, '').trim();
    const w = ren.split(/\s+/);
    if (w.length < minOrd || w.length > maxOrd) return;
    if (/\d/.test(ren)) return;
    const n = normalisera(ren);
    if (undvikN.some((u) => n.includes(u))) return;
    // Meningar som står i flera av våra egna produkter ("Smidig leverans och
    // trygg betalning med Klarna") är mall, inte fingeravtryck — mätt
    // 2026-09-27 i första körningen: samma rad valdes för två produkter.
    if (boilerplate.has(n)) return;
    const medel = w.reduce((s, x) => s + x.length, 0) / w.length;
    kand.push({ text: ren, n, poang: medel - i * 0.05 });
  });
  kand.sort((a, b) => b.poang - a.poang);
  const ut = []; const sedda = new Set();
  for (const k of kand) {
    if (sedda.has(k.n)) continue;
    sedda.add(k.n); ut.push(k.text);
    if (ut.length >= antal) break;
  }
  return ut;
}

/** Meningar (normaliserade) som står i minst `minst` av produkterna — butikens mall, aldrig ett fingeravtryck. Ren. */
export function mallmeningar(produkter, { minst = 2 } = {}) {
  const antal = new Map();
  for (const p of produkter) {
    const egna = new Set(meningar(p.text ?? '').map((m) => normalisera(m.replace(/[.!?:;]+$/, ''))).filter(Boolean));
    for (const n of egna) antal.set(n, (antal.get(n) ?? 0) + 1);
  }
  return new Set([...antal].filter(([, c]) => c >= minst).map(([n]) => n));
}

// ------------------------------------------------------------------ egna annonser (Meta)

// Smalt med flit: med asset_feed_spec{images,videos} och limit 200 svarade
// OPS-kontot "(#1) Please reduce the amount of data you're asking for"
// (mätt 2026-09-27), och kommentarernas klient räknar kod 1 som tillfälligt
// och väntar 30+60+120+240 s innan den ger upp. Här: färre fält, 50 per
// sida, och halverad sida när Meta säger att det är för mycket.
const ANNONSFALT = 'id,name,effective_status,campaign{name},creative{body,title,image_url,thumbnail_url,object_story_spec{link_data{message,name,link,picture},video_data{message,title,image_url,call_to_action{value{link}}},template_data{link}},asset_feed_spec{bodies{text},titles{text},link_urls{website_url}}}';
const AKTIVA = encodeURIComponent(JSON.stringify([{ field: 'effective_status', operator: 'IN', value: ['ACTIVE'] }]));
const RATE = new Set([4, 17, 32, 613, 80001, 80004]);
const vanta = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Alla sidor av `act/ads` för ett konto, med egen felhantering: "för mycket
 * data" ⇒ halva sidan och försök igen, kod 17 (tak) ⇒ vänta 30/60/120 s.
 * `klient.get` ska kasta direkt (backoff: []) — annars väntar den själv i minuter.
 */
export async function hamtaAnnonssidor(klient, act, { limit = 50, sov = vanta, logg = () => {} } = {}) {
  const ut = [];
  let nasta = `${act}/ads?fields=${ANNONSFALT}&filtering=${AKTIVA}&limit=${limit}`;
  let vantetider = [30_000, 60_000, 120_000];
  let natForsok = 0;
  while (nasta) {
    let j;
    try { j = await klient.get(nasta); }
    catch (e) {
      const f = e.meta ?? {};
      // Nätet, inte Meta: en timeout (90 s i meta-lib) eller ett tappat socket på EN sida ska inte tömma hela kontot —
      // ORVO-körningen 2026-09-29 tappade MagiBorstens 629 annonser på en enda timeout, och jämförelsen blev falsk.
      if (!f.code && /aborted due to timeout|TimeoutError|ECONNRESET|fetch failed|socket hang up/i.test(e.message ?? '') && natForsok < 3) {
        natForsok++;
        logg(`  ⏳ ${act}: ${e.message.split('\n')[0]} — försök ${natForsok + 1} av 4 om ${5 * natForsok} s`);
        await sov(5_000 * natForsok);
        continue;
      }
      if (/reduce the amount of data/i.test(f.message ?? '') && limit > 5) {
        limit = Math.max(5, Math.floor(limit / 2));
        nasta = nasta.replace(/([?&])limit=\d+/, `$1limit=${limit}`);
        logg(`  Meta: för mycket data — läser ${limit} annonser per sida i stället`);
        continue;
      }
      if ((RATE.has(f.code) || f.is_transient) && vantetider.length) {
        const ms = vantetider.shift();
        logg(`  ⏳ Meta ${f.code}: ${f.message} — väntar ${ms / 1000}s`);
        await sov(ms);
        continue;
      }
      throw e;
    }
    ut.push(...(j.data ?? []));
    nasta = j.paging?.next ?? null;
  }
  return ut;
}

/** Brödtexten i en creative, oavsett format. Ren. */
export function textUrAnnons(c = {}) {
  const s = c.object_story_spec ?? {};
  return String(c.body ?? s.link_data?.message ?? s.video_data?.message ?? c.asset_feed_spec?.bodies?.[0]?.text ?? '').trim();
}

/** Rubriken i en creative. Ren. */
export function rubrikUrAnnons(c = {}) {
  const s = c.object_story_spec ?? {};
  return String(c.title ?? s.link_data?.name ?? s.video_data?.title ?? c.asset_feed_spec?.titles?.[0]?.text ?? '').trim();
}

/** Bilden (eller videons stillbild) i en creative. Ren. */
export function bildUrAnnons(c = {}) {
  const s = c.object_story_spec ?? {};
  return c.image_url ?? s.link_data?.picture ?? s.video_data?.image_url ?? c.asset_feed_spec?.images?.[0]?.url ?? c.asset_feed_spec?.videos?.[0]?.thumbnail_url ?? c.thumbnail_url ?? null;
}

/**
 * Annonserna som visas just nu i våra konton: [{ id, namn, kampanj, konto, text, rubrik, bild, lank, handle }].
 * `konton` = [{ id, namn, prefix? }] — prefix = bara kampanjer vars namn börjar så (delade konton).
 */
export async function hamtaEgnaAnnonser(konton, { token = process.env.META_ACCESS_TOKEN, klient = null, logg = () => {}, sov = vanta } = {}) {
  const k = klient ?? skapaKlient({ token, logg, backoff: [] });
  const ut = []; const status = [];
  for (const konto of konton) {
    const act = `act_${String(konto.id).replace(/^act_/, '')}`;
    try {
      const rader = await hamtaAnnonssidor(k, act, { logg, sov });
      let antal = 0;
      for (const a of rader) {
        const kampanj = a.campaign?.name ?? '';
        if (konto.prefix && !kampanj.toUpperCase().startsWith(String(konto.prefix).toUpperCase())) continue;
        const c = a.creative ?? {};
        const lank = lankUrCreative(c);
        ut.push({ id: a.id, namn: a.name, kampanj, konto: konto.id, text: textUrAnnons(c), rubrik: rubrikUrAnnons(c), bild: bildUrAnnons(c), lank, handle: handleUr(lank) });
        antal++;
      }
      status.push({ id: konto.id, namn: konto.namn, annonser: antal });
      logg(`  ${konto.namn}: ${antal} aktiva annonser`);
    } catch (e) {
      status.push({ id: konto.id, namn: konto.namn, fel: e.meta?.message ?? e.message });
      logg(`  ⚠️ ${konto.namn}: ${e.message}`);
    }
  }
  return { annonser: ut, status };
}

// ------------------------------------------------------------------ urval

/**
 * Vilka produkter som söks den här körningen. Annonserade + bevakade alltid
 * först (äldst kollad först), sedan resten i rotation. Produkter kollade
 * senaste `kollaOmDagar` dygnen hoppas — om de inte annonseras.
 * @param {object} d  produkter, annonserade (Set av handle), bevaka (handle[]), lage.kollade {handle: iso}, max, kollaOmDagar, nu (ms)
 */
export function valjProdukter({ produkter, annonserade = new Set(), bevaka = [], lage = {}, max = 20, kollaOmDagar = 5, nu = Date.now() }) {
  const kollade = lage.kollade ?? {};
  const senast = (p) => (kollade[`${p.butik}|${p.handle}`] ? Date.parse(kollade[`${p.butik}|${p.handle}`]) : 0);
  const prio = new Set([...annonserade, ...bevaka.map((h) => String(h).toLowerCase())]);
  const forst = produkter.filter((p) => prio.has(p.handle)).sort((a, b) => senast(a) - senast(b));
  const gräns = nu - kollaOmDagar * 86_400_000;
  const resten = produkter.filter((p) => !prio.has(p.handle) && senast(p) < gräns).sort((a, b) => senast(a) - senast(b));
  return [...forst, ...resten].slice(0, max).map((p) => ({ ...p, prioriterad: prio.has(p.handle) }));
}

/** Alla domäner som är våra: konfig + spårningsregistret + kommentarernas domäner. */
export function egnaDomaner(konfig, { rot = ROT } = {}) {
  const ut = new Set((konfig.egna_domaner ?? []).map((d) => d.toLowerCase()));
  const doman = (u) => { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ''); } catch { return null; } };
  try {
    const reg = JSON.parse(readFileSync(join(rot, 'sparning', 'butiker.json'), 'utf8'));
    for (const v of Object.values(reg)) { const d = v && typeof v === 'object' ? doman(v.url) : null; if (d) ut.add(d); if (v?.myshopify) ut.add(String(v.myshopify).toLowerCase()); }
  } catch { /* registret är valfritt här */ }
  try {
    const kk = JSON.parse(readFileSync(join(rot, 'kommentarer', 'konfig.json'), 'utf8'));
    for (const d of Object.keys(kk.domaner ?? {})) ut.add(d.toLowerCase());
  } catch { /* valfritt */ }
  for (const v of Object.values(konfig.verksamheter ?? {})) for (const b of v.butiker ?? []) { const d = doman(b); if (d) ut.add(d); }
  const fabrik = join(rot, 'factory', 'butiker');
  if (existsSync(fabrik)) {
    for (const f of readdirSync(fabrik).filter((x) => x.endsWith('.yaml'))) {
      const txt = readFileSync(join(fabrik, f), 'utf8');
      for (const m of txt.matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) { const d = m[1].toLowerCase().replace(/^www\./, ''); if (!/shopify|notion|discord|facebook|google/.test(d)) ut.add(d); }
    }
  }
  return [...ut];
}

/** Egna sidor i Meta (för Ad Library): kommentarernas sidregister. */
export function egnaSidor({ rot = ROT } = {}) {
  try { return new Set(Object.keys(JSON.parse(readFileSync(join(rot, 'kommentarer', 'konfig.json'), 'utf8')).sidor ?? {})); } catch { return new Set(); }
}
